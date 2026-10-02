const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'gemini-voice.ts');
let c = fs.readFileSync(p, 'utf-8');

// Replace groqModel from env with a hardcoded fast model
c = c.replace(
    "const groqModel = process.env.GROQ_MODEL || 'llama3-70b-8192';",
    "const groqModel = 'llama3-70b-8192'; // Force fast non-reasoning model for Voice!"
);

// Remove max_tokens limit which was causing it to cut off
c = c.replace(
    "max_tokens: 150,",
    "max_tokens: 800,"
);

fs.writeFileSync(p, c);
console.log("FIXED MAX TOKENS AND MODEL SELECTION");
