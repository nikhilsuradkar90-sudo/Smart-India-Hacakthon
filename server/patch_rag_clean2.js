const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'rag.ts');
let c = fs.readFileSync(p, 'utf-8');

const t = "1. FORMATTING (CRITICAL): You MUST format your response clearly using Markdown. DO NOT write long unbroken paragraphs. Use bullet points for lists. You MUST separate different points or paragraphs using double line breaks (\\n\\n). ";
const r = "1. FORMATTING (CRITICAL): DO NOT use any Markdown formatting. DO NOT use asterisks (**), hashes (#), dashes (-), or backticks (`). Your output must be plain text. Use double line breaks (\\n\\n) to separate paragraphs or list items, and use simple numbers (1., 2.) for lists. Make it easy to read without markdown rendering. ";

if (c.includes(t)) {
  c = c.replace(t, r);
  fs.writeFileSync(p, c);
  console.log("RAG cleanly patched!");
} else {
  console.log("Target string not found.");
}
