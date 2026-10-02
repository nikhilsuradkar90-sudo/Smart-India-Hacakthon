const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'gemini-voice.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
    "const { message, history } = req.body;",
    "const { message, history, language } = req.body;"
);

const newSystemInstruction = `        const langCode = language || 'en';
        const SYSTEM_INSTRUCTION = \`You are a helpful, extremely concise, and conversational AI assistant for Indian MSME (Micro, Small and Medium Enterprises) manufacturers.
Your goal is to answer questions about BIS (Bureau of Indian Standards), certifications, lab testing, and manufacturing.
CRITICAL RULES FOR VOICE MODE:
1. NEVER use markdown formatting (no asterisks, no hashes, no bullet points).
2. Keep your answers extremely short and conversational (1-3 sentences maximum).
3. Speak like a helpful human assistant.
4. IMPORTANT: You MUST reply in the language matching the code: '\${langCode}'. If the user speaks in Hindi, reply in Hindi. If Marathi, reply in Marathi.\`;

        formattedHistory.unshift({ role: 'system', content: SYSTEM_INSTRUCTION });`;

c = c.replace(
    "formattedHistory.unshift({ role: 'system', content: SYSTEM_INSTRUCTION });",
    newSystemInstruction
);

fs.writeFileSync(p, c);
console.log("SUCCESSFULLY UPDATED BACKEND FOR MULTILINGUAL");
