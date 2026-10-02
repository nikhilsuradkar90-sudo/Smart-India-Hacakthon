const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

const oldStripBlock = `        // Clean up markdown since LLMs often ignore formatting instructions
        if (answer) {
          answer = answer.replace(/\\*\\*/g, ''); // Remove bold stars
          answer = answer.replace(/^\\s*\\*\\s/gm, '? '); // Replace bullet stars with clean bullet point
          answer = answer.replace(/^\\s*-\\s/gm, '? '); // Replace bullet dashes with clean bullet point
          answer = answer.replace(/\`/g, ''); // Remove backticks
        }`;

c = c.replace(oldStripBlock, `        // Markdown is now ALLOWED and ENCOURAGED for rich text reports!`);
fs.writeFileSync(p, c);
console.log("REMOVED MARKDOWN STRIPPING");
