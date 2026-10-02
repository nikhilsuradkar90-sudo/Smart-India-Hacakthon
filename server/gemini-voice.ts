import { Groq } from 'groq-sdk';
import 'dotenv/config';

// We fallback to Groq if Gemini key fails or is invalid
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

const SYSTEM_INSTRUCTION = `You are a helpful, extremely concise, and conversational AI assistant for Indian MSME (Micro, Small and Medium Enterprises) manufacturers.
Your goal is to answer questions about BIS (Bureau of Indian Standards), certifications, lab testing, and manufacturing.
CRITICAL RULES FOR VOICE MODE:
1. NEVER use markdown formatting (no asterisks, no hashes, no bullet points).
2. Keep your answers extremely short and conversational (1-3 sentences maximum).
3. Speak like a helpful human assistant.
4. Reply in the same language the user speaks (e.g., if they ask in Hindi/Hinglish, reply in Hindi/Hinglish).`;

export const handleGeminiVoiceChat = async (req: any, res: any) => {
    try {
        const { message, history, language } = req.body;
        
        // Format history for Groq
        const formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

                        const SYSTEM_INSTRUCTION = `You are an ultra-fast, conversational Voice Assistant for Indian MSME (Micro, Small and Medium Enterprises) manufacturers.
Your goal is to answer questions about BIS (Bureau of Indian Standards), certifications, lab testing, and manufacturing.
CRITICAL RULES FOR VOICE MODE:
1. AUTO-DETECT LANGUAGE: You must analyze the user's input and reply in the EXACT SAME LANGUAGE and SCRIPT. 
   - If they speak Hindi, reply in proper Hindi (Devanagari script).
   - If they speak Marathi, reply in Marathi.
   - If they speak English, reply in English.
   - If they mix English and Hindi (Hinglish), reply in Hinglish.
2. NO MARKDOWN: NEVER use markdown formatting (no asterisks, no hashes, no bold).
3. BE CONCISE: Keep your answers extremely short and conversational (1-3 sentences maximum).
4. Act like a natural human voice assistant (like Google Assistant or Gemini Live).`;

        formattedHistory.unshift({ role: 'system', content: SYSTEM_INSTRUCTION });
        formattedHistory.push({ role: 'user', content: message });

        let responseText = "";
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: formattedHistory,
                model: groqModel,
                temperature: 0.7,
                max_tokens: 1500,
            });
            responseText = chatCompletion.choices[0]?.message?.content || "";
        } catch (apiError: any) {
            console.warn("Primary voice model failed, using Qwen fallback...", apiError.message);
            const fallbackCompletion = await groq.chat.completions.create({
                messages: formattedHistory,
                model: 'qwen/qwen3.8-27b',
                temperature: 0.7,
                max_tokens: 1500,
            });
            responseText = fallbackCompletion.choices[0]?.message?.content || "";
        }
        
        if (!responseText) responseText = "I am sorry, I could not process that.";

        // Clean any accidental markdown just in case
        const cleanText = responseText.replace(/[*#_]/g, '');

        res.json({ text: cleanText });

    } catch (error: any) {
        console.error("Voice API Error:", error);
        res.status(500).json({ error: "Failed to fetch response." });
    }
};
