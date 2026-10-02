const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace("import { semanticSearch, generateRagAnswer } from './rag';", "import { semanticSearch, generateRagAnswer } from './rag';\nimport { handleGeminiVoiceChat } from './gemini-voice';");

// Also there was another error: index.ts(539,22): error TS2339: Property 'file' does not exist on type 'Request<{}, any, any, ParsedQs, Record<string, any>>'.
// Let's fix that by typing req as any for that route if it exists.
c = c.replace("app.post('/api/compliance', upload.single('file'), async (req, res) => {", "app.post('/api/compliance', upload.single('file'), async (req: any, res: any) => {");

fs.writeFileSync(p, c);
console.log("Fixed index.ts imports and types!");
