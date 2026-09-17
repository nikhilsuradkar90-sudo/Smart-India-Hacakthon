const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

code = code.replace(
  "const topChunks = await semanticSearch(message, 3);",
  "const contextQuery = (history && history.length > 0) ? (history[history.length - 2]?.content || '') + ' ' + message : message;\n    const topChunks = await semanticSearch(contextQuery, 3);"
);

fs.writeFileSync('server/index.ts', code);
