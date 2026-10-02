const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'CostEstimatorPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// Replace literal backslash-backtick with just backtick
c = c.replace(/\\\`/g, '\`');
// Replace literal backslash-dollar with just dollar
c = c.replace(/\\\$/g, '$');

fs.writeFileSync(p, c);
console.log("Syntax errors fixed in CostEstimatorPage.tsx!");
