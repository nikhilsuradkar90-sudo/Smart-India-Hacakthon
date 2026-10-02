const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// The bug is that the file contains the literal characters backslash + 'n'
// before the word export. We need to replace it with a real newline.
c = c.replace(/\\nexport/g, '\nexport');

fs.writeFileSync(p, c);
console.log("Fixed literal newline bug!");
