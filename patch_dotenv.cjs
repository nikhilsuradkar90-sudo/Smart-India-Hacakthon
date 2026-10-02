const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'gemini-voice.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace("import dotenv from 'dotenv';\ndotenv.config();", "import 'dotenv/config';");

fs.writeFileSync(p, c);
console.log("Fixed dotenv import!");
