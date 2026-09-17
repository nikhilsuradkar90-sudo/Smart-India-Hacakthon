const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(
  "queryLower.includes(p.name.toLowerCase()) ||",
  "p.name.toLowerCase().includes(queryLower) || queryLower.includes(p.name.toLowerCase()) ||"
);

code = code.replace(
  "(p.standard && queryLower.includes(p.standard.isNumber.toLowerCase()))",
  "(p.standard && (p.standard.isNumber.toLowerCase().includes(queryLower) || queryLower.includes(p.standard.isNumber.toLowerCase())))"
);

// We should also remove very short query words from matching everything (e.g. "what", "is", "the")
code = code.replace(
  "const relevantProducts = products.filter(p =>",
  `const queryWords = queryLower.split(' ').filter(w => w.length > 3);
  const relevantProducts = products.filter(p => 
    queryWords.some(w => p.name.toLowerCase().includes(w)) ||`
);

fs.writeFileSync('server/rag.ts', code);
