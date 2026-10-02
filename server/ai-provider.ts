import "dotenv/config";
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  name: string;
  generateChat(messages: ChatMessage[], systemPrompt?: string): Promise<string>;
}

const TIMEOUT_MS = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '30000', 10);
const MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || '2', 10);
const RETRY_BASE_DELAY_MS = parseInt(process.env.AI_RETRY_BASE_DELAY_MS || '1000', 10);

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('AI_TIMEOUT')), timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => clearTimeout(timeoutHandle));
}

class GeminiProvider implements AIProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateChat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    const generativeModel = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt ? { role: 'system', parts: [{ text: systemPrompt }] } : undefined,
    });

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const latestMessage = messages.length > 0 ? messages[messages.length - 1].content : '';
    
    if (history.length > 0) {
       const chat = generativeModel.startChat({ history, generationConfig: { temperature: 0.2 } });
       const result = await chat.sendMessage(latestMessage);
       return result.response.text() || '';
    } else {
       const result = await generativeModel.generateContent({
         contents: [{ role: 'user', parts: [{ text: latestMessage }] }],
         generationConfig: { temperature: 0.2 }
       });
       return result.response.text() || '';
    }
  }
}

class GroqAIProvider implements AIProvider {
  name = 'groq';
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string = 'llama-3.1-8b-instant') {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async generateChat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    const apiMessages: any[] = systemPrompt ? [{ role: 'system', content: systemPrompt }] : [];
    apiMessages.push(...messages);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: apiMessages,
        temperature: 0.2
      });
      return response.choices[0]?.message?.content || '';
    } catch (e: any) {
      console.warn("[Groq] Primary model failed, trying fallback model...", e.message);
      // Automatically fallback to an alternate free model on the proxy if the primary one is rate-limited!
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'qwen/qwen3.8-27b',
        messages: apiMessages,
        temperature: 0.2
      });
      return fallbackResponse.choices[0]?.message?.content || '';
    }
  }
}

interface ProviderState {
  failures: number;
  isTripped: boolean;
  nextRetry: number;
  status: 'available' | 'temporarily_unavailable' | 'rate_limited' | 'configured' | 'timeout' | 'authentication_failure';
}

class AIService {
  private primaryProvider: AIProvider | null = null;
  private fallbackProvider: AIProvider | null = null;
  
  private primaryState: ProviderState = { failures: 0, isTripped: false, nextRetry: 0, status: 'configured' };
  private fallbackState: ProviderState = { failures: 0, isTripped: false, nextRetry: 0, status: 'configured' };

  constructor() {
    this.init();
  }

  private init() {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const primaryName = process.env.AI_PRIMARY_PROVIDER || 'groq';

    let groqProv = groqKey ? new GroqAIProvider(groqKey, process.env.GROQ_MODEL) : null;
    let geminiProv = geminiKey ? new GeminiProvider(geminiKey, process.env.GEMINI_MODEL) : null;

    if (primaryName === 'groq') {
      this.primaryProvider = groqProv;
      this.fallbackProvider = geminiProv;
    } else {
      this.primaryProvider = geminiProv;
      this.fallbackProvider = groqProv;
    }
    
    if (this.primaryProvider) this.primaryState.status = 'available';
    if (this.fallbackProvider) this.fallbackState.status = 'available';
  }

  private async executeWithProvider(
    provider: AIProvider, 
    state: ProviderState, 
    messages: ChatMessage[], 
    systemPrompt?: string
  ): Promise<string> {
    if (state.isTripped && Date.now() < state.nextRetry) {
      throw new Error(`PROVIDER_UNAVAILABLE`);
    } else if (state.isTripped) {
      state.isTripped = false;
    }

    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
      attempt++;
      try {
        const response = await withTimeout(
          provider.generateChat(messages, systemPrompt),
          TIMEOUT_MS
        );
        state.failures = 0;
        state.status = 'available';
        state.isTripped = false;
        return response;
      } catch (err: any) {
        console.error(`[AI] ${provider.name} error on attempt ${attempt}:`, err.message);
        const errMsg = err.message || '';
        
        const isAuthError = errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('key');
        const isRateLimit = errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('rate');
        const isTimeout = errMsg === 'AI_TIMEOUT';
        
        if (isAuthError) {
          state.status = 'authentication_failure';
          state.isTripped = true;
          state.nextRetry = Date.now() + 300000;
          throw new Error('PROVIDER_AUTH_FAILED');
        }
        
        if (isRateLimit) state.status = 'rate_limited';
        else if (isTimeout) state.status = 'timeout';
        else state.status = 'temporarily_unavailable';

        const isTransient = isRateLimit || isTimeout || errMsg.includes('500') || errMsg.includes('503');
        if (!isTransient || attempt > MAX_RETRIES) {
           state.failures++;
           // During SIH Hackathon, we want immediate recovery, so no long lockouts.
           if (state.failures >= 3) {
             state.isTripped = true;
             state.nextRetry = Date.now() + 2000; // 2 seconds penalty instead of 60 seconds
           }
           throw new Error('PROVIDER_FAILED');
        }

        const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await delay(delayMs);
      }
    }
    throw new Error('PROVIDER_FAILED');
  }

  async generateChat(messages: ChatMessage[], systemPrompt?: string): Promise<{answer: string, provider: string}> {
    if (!this.primaryProvider && !this.fallbackProvider) {
      throw new Error('AI_NOT_CONFIGURED');
    }

    if (this.primaryProvider) {
      try {
        const answer = await this.executeWithProvider(this.primaryProvider, this.primaryState, messages, systemPrompt);
        return { answer, provider: this.primaryProvider.name };
      } catch (err: any) {
        console.warn(`[AI] Primary provider (${this.primaryProvider.name}) failed. Attempting fallback...`);
      }
    }

    if (this.fallbackProvider) {
      try {
        const answer = await this.executeWithProvider(this.fallbackProvider, this.fallbackState, messages, systemPrompt);
        return { answer, provider: this.fallbackProvider.name };
      } catch (err: any) {
        console.error(`[AI] Fallback provider (${this.fallbackProvider.name}) also failed.`);
      }
    }

    if (this.primaryState.status === 'rate_limited' || (this.fallbackProvider && this.fallbackState.status === 'rate_limited')) {
       throw new Error('AI_RATE_LIMIT');
    }
    
    throw new Error('AI_SERVICE_UNAVAILABLE');
  }

  getStatus() {
    return {
      primary: {
        name: this.primaryProvider?.name || 'none',
        status: this.primaryProvider ? this.primaryState.status : 'misconfigured'
      },
      fallback: {
        name: this.fallbackProvider?.name || 'none',
        status: this.fallbackProvider ? this.fallbackState.status : 'misconfigured'
      }
    };
  }
}

export const aiService = new AIService();
