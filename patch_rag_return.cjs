const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(
  "return await aiService.generateChat(messages, systemPrompt);",
  "const result = await aiService.generateChat(messages, systemPrompt);\n  return result;"
);

fs.writeFileSync('server/rag.ts', code);
