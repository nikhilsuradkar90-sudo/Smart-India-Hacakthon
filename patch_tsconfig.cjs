const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'tsconfig.json');
let c = fs.readFileSync(p, 'utf-8');

if (!c.includes('"esModuleInterop": true')) {
    c = c.replace('"compilerOptions": {', '"compilerOptions": {\n    "esModuleInterop": true,\n    "allowSyntheticDefaultImports": true,');
    fs.writeFileSync(p, c);
    console.log("Fixed tsconfig!");
}
