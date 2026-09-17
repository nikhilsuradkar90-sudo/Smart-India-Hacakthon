const fs = require('fs');
let code = fs.readFileSync('server/recommendation.ts', 'utf8');

code = code.replace(
  'if (std.title.toLowerCase().includes(queryLower)) score += 0.3;',
  'if (queryLower.includes(std.title.toLowerCase()) || std.title.toLowerCase().includes(queryLower)) score += 0.4;'
);

code = code.replace(
  'if (prod.name.toLowerCase().includes(queryLower)) score += 0.4;',
  'if (queryLower.includes(prod.name.toLowerCase()) || prod.name.toLowerCase().includes(queryLower)) score += 0.5;'
);

fs.writeFileSync('server/recommendation.ts', code);
