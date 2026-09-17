const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(/console\.log\('CONTEXT:\\n', contextStr\);[\s\S]*?const systemPrompt =/, "const systemPrompt =");
code = code.replace("const systemPrompt =", "console.log('CONTEXT:', contextStr);\n  const systemPrompt =");

fs.writeFileSync('server/rag.ts', code);
