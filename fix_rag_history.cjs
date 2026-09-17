const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(
  "const queryLower = query.toLowerCase();",
  "const contextQuery = history.length > 0 ? (history[history.length - 2]?.content || '') + ' ' + query : query;\n  const queryLower = contextQuery.toLowerCase();"
);

fs.writeFileSync('server/rag.ts', code);
