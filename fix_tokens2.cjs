const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'gemini-voice.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
    "const groqModel = 'llama3-70b-8192'; // Force fast non-reasoning model for Voice!",
    "const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';"
);

c = c.replace(
    "max_tokens: 800,",
    "max_tokens: 1500,"
);

fs.writeFileSync(p, c);
console.log("FIXED MAX TOKENS AND MODEL SELECTION");
