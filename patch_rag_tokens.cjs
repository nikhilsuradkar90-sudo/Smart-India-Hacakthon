const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');
code = code.replace(
  "const topChunks = await semanticSearch(contextQuery, 3);",
  "const topChunks = await semanticSearch(contextQuery, 1);" // Reduce to 1 chunk
);
fs.writeFileSync('server/index.ts', code);

code = fs.readFileSync('server/rag.ts', 'utf8');
code = code.replace(
  "const relevantProducts = products.filter",
  "const relevantProducts = products.filter(p => \n      queryWords.some(w => p.name.toLowerCase().includes(w)) || \n      p.name.toLowerCase().includes(queryLower) || queryLower.includes(p.name.toLowerCase()) || \n      (p.standard && (p.standard.isNumber.toLowerCase().includes(queryLower) || queryLower.includes(p.standard.isNumber.toLowerCase())))\n    ).slice(0, 2); // Limit to 2 products to avoid Groq 6000 TPM limit\n    const ignoreFilter = false" // dummy replacement to match original logic safely
);
fs.writeFileSync('server/rag.ts', code);
