const fs = require('fs');
let code = fs.readFileSync('tsconfig.app.json', 'utf8');
code = code.replace(/"ignoreDeprecations": "5.0",?/g, "");
fs.writeFileSync('tsconfig.app.json', code);
