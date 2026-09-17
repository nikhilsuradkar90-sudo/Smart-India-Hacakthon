const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(/console\.log\('CONTEXT:[\s\S]*?const systemPrompt = `/, 'const systemPrompt = `');

fs.writeFileSync('server/rag.ts', code);
