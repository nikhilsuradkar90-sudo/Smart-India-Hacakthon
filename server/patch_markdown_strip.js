const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

const target = "answer = ragResult.answer;\n      provider = ragResult.provider;";
const replacement = `answer = ragResult.answer;
      
      // Clean up markdown since LLMs often ignore formatting instructions
      if (answer) {
        answer = answer.replace(/\\*\\*/g, ''); // Remove bold stars
        answer = answer.replace(/__/g, ''); // Remove bold underscores
        answer = answer.replace(/###/g, ''); // Remove H3
        answer = answer.replace(/##/g, ''); // Remove H2
        answer = answer.replace(/#/g, ''); // Remove H1
        answer = answer.replace(/---/g, ''); // Remove dividers
        answer = answer.replace(/^\\s*\\*\\s/gm, '• '); // Replace bullet stars with clean bullet point
        answer = answer.replace(/^\\s*-\\s/gm, '• '); // Replace bullet dashes with clean bullet point
        answer = answer.replace(/\`/g, ''); // Remove backticks
      }

      provider = ragResult.provider;`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync(p, c);
  console.log("Markdown stripping logic safely added!");
} else {
  console.log("Could not find target in index.ts");
}
