import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Paperclip, Mic, Trash2, Copy, ThumbsUp, ThumbsDown, RotateCw, MoreHorizontal, Sparkles, FileText, ShieldCheck, Volume2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AssistantMessage, ChatSession } from '@/types';
import { assistantService } from '@/services';
import { QUICK_PROMPTS, AI_NOT_CONNECTED, CHAT_STORAGE_KEY } from '@/data/constants';
import { useLanguage } from '@/hooks/use-language';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { LoadingState } from '@/components/shared/state-components';
import { DisclaimerBanner } from '@/components/shared/trust-badges';
import { CitationPanel } from '@/components/shared/source-citation';
import { toast } from '@/hooks/use-toast';

// ============================================================
// AI Assistant — chat interface
// ============================================================

const SESSION_ID = 'default-session';

function createSession(language: string): ChatSession {
  return {
    id: SESSION_ID,
    title: 'BIS AI Assistant Conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language,
  };
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}



const speakText = (text: string, lang: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert("Voice output is not supported in this browser.");
    return;
  }
  
  window.speechSynthesis.cancel();
  if (!text) return;
  
  const langMap: Record<string, string> = {
    'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
    'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
    'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN',
    'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN',
    'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN'
  };
  const targetLang = langMap[lang] || 'hi-IN';
  
  const voices = window.speechSynthesis.getVoices();
  let bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google')) ||
                  voices.find(v => v.lang === targetLang && (v.name.includes('Online') || v.name.includes('Natural'))) ||
                  voices.find(v => v.lang === targetLang) ||
                  voices.find(v => v.lang.startsWith((lang || 'hi').substring(0,2)));

  const cleanText = text.replace(/[*#_]/g, '');
  const chunks = cleanText.match(/[^.!?\n]+[.!?\n]+/g) || [cleanText];

  let i = 0;
  
  const speakNext = () => {
    if (i >= chunks.length) return;
    const chunkText = chunks[i].trim();
    if (!chunkText) {
      i++;
      speakNext();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = targetLang;
    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      i++;
      speakNext();
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      i++;
      speakNext();
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  speakNext();
};

export function AssistantPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { settings } = useSettings();
  
  const [session, setSession] = useState<ChatSession>(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ChatSession;
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return createSession(language);
  });

  useEffect(() => {
    try {
      let dataToSave = session;
      // Auto-truncate to last 20 messages to prevent QuotaExceededError
      if (session.messages.length > 20) {
        dataToSave = { ...session, messages: session.messages.slice(-20) };
      }
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e: any) {
      console.error('Failed to save chat history:', e);
      // If still hitting limit (e.g. huge chunks), drastically reduce
      if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ ...session, messages: session.messages.slice(-5) }));
        } catch(e2) {
          console.error('Completely failed to save chat.', e2);
        }
      }
    }
  }, [session]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Microphone State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        const langMap: Record<string, string> = { 
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN', 
      'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN', 
      'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN' 
    };
        recognitionRef.current.lang = langMap[language] || 'en-US';


        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          alert('Microphone permission was denied. Please allow microphone access in your browser settings to use voice input.');
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Microphone/Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        
          const langMap: Record<string, string> = { 
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN', 
      'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN', 
      'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN' 
    };
          recognitionRef.current.lang = langMap[language] || 'en-US';
          recognitionRef.current.start();

        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const updateMessage = useCallback((id: string, updates: Partial<AssistantMessage>) => {
    setSession((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  }, []);

  


  const handleSend = useCallback(async (text?: string) => {
    let queryText = (text || input).trim();
    
    // Safely incorporate file if present to prevent getting stuck
    if (selectedFile) {
      queryText = queryText ? `${queryText} [Attached File: ${selectedFile.name}]` : `[Attached File: ${selectedFile.name}]`;
    }
    
    if (!queryText || isSending) return;
    
    // Clear file selection after sending
    setSelectedFile(null);

    const userMessage: AssistantMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
      status: 'complete',
    };

    const loadingMessage: AssistantMessage = {
      id: `msg-${Date.now()}-loading`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'loading',
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, loadingMessage],
      updatedAt: new Date().toISOString(),
    }));
    setInput('');
    setIsSending(true);

    const history = session.messages.filter(m => m.status === 'complete').map(m => ({ role: m.role, content: m.content }));
    const result = await assistantService.sendMessage(queryText, language, history);

    try {
      if (!result.data) {
        updateMessage(loadingMessage.id, {
          content: 'Sorry, there was an error processing your request.',
          status: 'error',
        });
      } else {
        updateMessage(loadingMessage.id, result.data);
      }
    } finally {
      setIsSending(false);
    }
    setIsSending(false);
  }, [input, isSending, language, session.messages, updateMessage]);

  const handleRegenerate = useCallback(async (messageId: string) => {
    setIsSending(true);
    const result = await assistantService.regenerateResponse(messageId, language);
    if (result.data) {
      updateMessage(messageId, result.data);
    }
    setIsSending(false);
  }, [language, updateMessage]);

  // Auto-send if initialPrompt was passed via navigation state
  useEffect(() => {
    if (location.state?.initialPrompt) {
      const prompt = location.state.initialPrompt;
      // Clear the state so it doesn't re-trigger on reload
      navigate(location.pathname, { replace: true, state: {} });
      // Short delay to ensure state is ready before triggering handleSend
      setTimeout(() => {
        handleSend(prompt);
      }, 100);
    }
  }, [location.state, navigate, handleSend]);

  const handleClear = useCallback(() => {
    setSession(createSession(language));
    setInput('');
    toast({ title: 'Conversation cleared' });
  }, [language]);

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  }, []);

  const handleFeedback = useCallback((id: string, helpful: boolean) => {
    updateMessage(id, { helpful });
    toast({ title: helpful ? 'Marked as helpful' : 'Marked as not helpful' });
  }, [updateMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (settings.enterToSend && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const hasMessages = session.messages.length > 0;
  const showSources = settings.showSources;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">BIS AI Assistant</h1>
              
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ask questions about Indian Standards and BIS services.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!hasMessages || isSending}
            className="shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Sparkles className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ask the BIS Assistant
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                {AI_NOT_CONNECTED}. Try one of the prompts below to see how the interface works.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleSend(prompt.text)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {session.messages.map((message) => (
            <ChatMessage
                key={message.id}
                language={language}
                message={message}
              showSources={showSources}
              onCopy={() => handleCopy(message.content)}
              onRegenerate={() => handleRegenerate(message.id)}
              onFeedback={(helpful) => handleFeedback(message.id, helpful)}
              compact={settings.compactChat}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat composer */}
      <div className="border-t border-border bg-card px-4 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Quick prompts row */}
          {hasMessages && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => setInput(prompt.text)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          {/* Selected File UI */}
          {selectedFile && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-md border border-border text-sm w-fit">
              <Paperclip className="h-4 w-4 text-primary" />
              <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedFile(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 shrink-0 hover:text-primary hover:bg-primary/10" 
              aria-label="Attach file" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a product, standard, certification, testing or BIS service…"
              className="min-h-[40px] max-h-32 resize-none border-0 focus-visible:ring-0 text-sm notranslate"
              rows={1}
              aria-label="Chat input"
            />
            <Button 
              variant={isRecording ? "destructive" : "ghost"} 
              size="icon" 
              className={isRecording ? "h-9 w-9 shrink-0 animate-pulse" : "h-9 w-9 shrink-0 hover:text-primary hover:bg-primary/10"} 
              aria-label="Voice input" 
              onClick={handleMicClick}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedFile) || isSending}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Individual chat message
// ============================================================

function ChatMessage({
    message,
    language,
    showSources,
  onCopy,
  onRegenerate,
  onFeedback,
  compact,
}: {
  message: AssistantMessage;
    language: string;
    showSources: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onFeedback: (helpful: boolean) => void;
  compact: boolean;
}) {
  const isUser = message.role === 'user';
  const isLoading = message.status === 'loading';

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[80%]">
          <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap notranslate">
            {message.content}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{formatTimestamp(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 animate-slide-up', compact ? 'py-2' : 'py-1')}>
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
      </div>

      {/* Message body */}
      <div className="flex-1 min-w-0 space-y-3">
        {isLoading ? (
          <LoadingState message="Searching BIS knowledge base..." className="py-6" />
        ) : (
          <>
            {/* Demo badge */}
            

            {/* Answer text */}
            <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 text-sm leading-relaxed notranslate markdown-body">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="w-full text-left border-collapse" {...props} /></div>,
                  th: ({node, ...props}) => <th className="border-b border-border bg-muted/50 p-2 font-medium" {...props} />,
                  td: ({node, ...props}) => <td className="border-b border-border p-2" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-3 italic text-muted-foreground my-2" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Structured sections */}
            {message.sections && message.sections.length > 0 && (
              <div className="space-y-2.5">
                {message.sections.map((section) => (
                  <div key={section.id} className="rounded-lg border border-border bg-card px-4 py-3">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                      {section.label}
                    </p>
                    <ul className="space-y-1.5">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {section.type === 'standard' && section.items.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {/* Navigate to standard details in Phase 2 */}}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        View Standard Details
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sources / Citations */}
            {showSources && message.sources && message.sources.length > 0 && (
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  <FileText className="h-3.5 w-3.5" />
                  Sources used ({message.sources.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <CitationPanel sources={message.sources} />
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* No source available notice */}
            {showSources && (!message.sources || message.sources.length === 0) && message.status === 'demo' && (
              <div className="rounded-lg border border-dashed px-4 py-2.5 text-center">
                <p className="text-xs text-muted-foreground">No verified source is available for this response.</p>
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-muted-foreground mr-2">{formatTimestamp(message.timestamp)}</span>
              <ActionButton onClick={onCopy} label="Copy" icon={Copy} />
              <ActionButton onClick={() => speakText(message.content, language)} label="Read Aloud" icon={Volume2} />
              <ActionButton
                onClick={() => onFeedback(true)}
                label="Helpful"
                icon={ThumbsUp}
                active={message.helpful === true}
              />
              <ActionButton
                onClick={() => onFeedback(false)}
                label="Not helpful"
                icon={ThumbsDown}
                active={message.helpful === false}
              />
              <ActionButton onClick={onRegenerate} label="Regenerate" icon={RotateCw} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" aria-label="More actions">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={onCopy}>Copy text</DropdownMenuItem>
                  <DropdownMenuItem onClick={onRegenerate}>Regenerate response</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ActionButton({ onClick, label, icon: Icon, active }: { onClick: () => void; label: string; icon: typeof Copy; active?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-7 px-2 text-xs text-muted-foreground hover:text-foreground',
        active && 'text-success',
      )}
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}
