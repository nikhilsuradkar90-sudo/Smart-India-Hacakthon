const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(
  "const extractor = await getExtractor();",
  "// const extractor = await getExtractor();\n    throw new Error('Xenova native crash bypass');"
);

fs.writeFileSync('server/rag.ts', code);
