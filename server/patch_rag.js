const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'rag.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(/1\. FORMATTING \(CRITICAL\): You MUST format your response clearly using Markdown.*?\\n\)\\./s, "1. FORMATTING (CRITICAL): DO NOT use any Markdown formatting. DO NOT use asterisks (**), hashes (#), dashes (-), or backticks (\`). Your output must be plain text. Use double line breaks (\\n\\n) to separate paragraphs or list items, and use simple numbers (1., 2.) for lists. Make it easy to read without markdown rendering.");

// If the regex above fails because of string literals, I'll just replace based on a smaller substring
const startTarget = "1. FORMATTING (CRITICAL): You MUST format your response clearly using Markdown.";
if (c.includes(startTarget)) {
    const endTarget = "(\\n\\n). ";
    const startIndex = c.indexOf(startTarget);
    const endIndex = c.indexOf(endTarget, startIndex) + endTarget.length;
    
    const r = "1. FORMATTING (CRITICAL): DO NOT use any Markdown formatting. DO NOT use asterisks (**), hashes (#), dashes (-), or backticks (`). Your output must be plain text. Use double line breaks (\\n\\n) to separate paragraphs or list items, and use simple numbers (1., 2.) for lists. Make it easy to read without markdown rendering.\n";
    
    c = c.substring(0, startIndex) + r + c.substring(endIndex);
    fs.writeFileSync(p, c);
    console.log("RAG prompt updated to remove markdown via substring!");
} else {
    console.log("Could not find start target");
}
