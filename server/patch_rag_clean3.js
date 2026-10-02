const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'rag.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(/1\. FORMATTING \(CRITICAL\): You MUST format your response clearly using Markdown\.[^\n]+/, "1. FORMATTING (CRITICAL): DO NOT use any Markdown formatting. DO NOT use asterisks (**), hashes (#), dashes (-), or backticks (`). Your output must be plain text. Use double line breaks (\\n\\n) to separate paragraphs or list items, and use simple numbers (1., 2.) for lists. Make it easy to read without markdown rendering.");

fs.writeFileSync(p, c);
console.log("Patched!");
