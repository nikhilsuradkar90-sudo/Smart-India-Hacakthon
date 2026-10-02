const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'services', 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(/location: lab\.state \|\| lab\.city \|\| lab\.address/g, "location: lab.address || lab.state");

if (!c.includes("params.append('testType'")) {
    c = c.replace(/filters\.productCategory\);\r?\n/g, "filters.productCategory);\n      if (filters.testType && filters.testType !== 'All Test Types') params.append('testType', filters.testType);\n");
}

fs.writeFileSync(p, c);
console.log('patched');
