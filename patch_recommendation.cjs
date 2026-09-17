const fs = require('fs');
let code = fs.readFileSync('server/recommendation.ts', 'utf8');

code = code.replace(
  "const chatCompletionText = await aiService.generateChat([], systemPrompt);",
  "const result = await aiService.generateChat([], systemPrompt);\n    const chatCompletionText = result.answer;"
);

fs.writeFileSync('server/recommendation.ts', code);
