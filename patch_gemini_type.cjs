const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'gemini-voice.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace("let genAI: GoogleGenerativeAI | null = null;", "let genAI: any = null;");

fs.writeFileSync(p, c);
console.log("Fixed type error!");
