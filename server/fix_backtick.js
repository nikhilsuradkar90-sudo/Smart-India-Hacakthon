const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'rag.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(/or backticks \(`\)/g, "or backticks");

fs.writeFileSync(p, c);
console.log("Fixed the backtick syntax error!");
