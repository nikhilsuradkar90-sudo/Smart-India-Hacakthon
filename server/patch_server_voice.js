const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

// 1. Add import
if (!c.includes('handleGeminiVoiceChat')) {
    c = c.replace("import { performOcr, processPdf, analyzeCompliance } from './compliance';", "import { performOcr, processPdf, analyzeCompliance } from './compliance';\nimport { handleGeminiVoiceChat } from './gemini-voice';");
}

// 2. Add route
const voiceRoute = `
// --- GEMINI LIVE VOICE API ---
app.post('/api/voice-chat', handleGeminiVoiceChat);
`;

if (!c.includes('/api/voice-chat')) {
    c = c.replace("app.post('/api/chat'", voiceRoute + "\napp.post('/api/chat'");
}

fs.writeFileSync(p, c);
console.log("Patched server/index.ts with Gemini Voice route!");
