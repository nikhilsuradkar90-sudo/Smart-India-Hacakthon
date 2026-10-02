const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// The issue is that the file was written with literal backslashes before backticks and dollar signs.
// Example: className={\\\`relative z-10 ... \\\${
c = c.replace(/\\\\`/g, '`');
c = c.replace(/\\\\\\$/g, '$');
c = c.replace(/\\\`/g, '`');
c = c.replace(/\\\$/g, '$');

fs.writeFileSync(p, c);
console.log("Fixed literal escapes in LiveVoicePage.tsx");
