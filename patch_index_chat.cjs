const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

code = code.replace(
  "let answer = '';",
  "let answer = '';\n    let provider = 'unknown';"
);

code = code.replace(
  "answer = await generateRagAnswer(message, topChunks, language || 'en', history || []);",
  "const ragResult = await generateRagAnswer(message, topChunks, language || 'en', history || []);\n      answer = ragResult.answer;\n      provider = ragResult.provider;"
);

code = code.replace(
  "answer,",
  "answer,\n        provider,"
);

fs.writeFileSync('server/index.ts', code);
