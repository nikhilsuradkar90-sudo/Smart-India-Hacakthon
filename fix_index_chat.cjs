const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

code = code.replace(
  "const { message, language } = req.body;",
  "const { message, language, history } = req.body;"
);

code = code.replace(
  "answer = await generateRagAnswer(message, topChunks, language);",
  "answer = await generateRagAnswer(message, topChunks, language, history);"
);

fs.writeFileSync('server/index.ts', code);
