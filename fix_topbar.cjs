const fs = require('fs');
let code = fs.readFileSync('src/components/layout/TopBar.tsx', 'utf8');

code = code.replace(
  "navigate(\`/standards-finder?query=\${encodeURIComponent(searchQuery.trim())}\`);",
  "navigate(\`/search?q=\${encodeURIComponent(searchQuery.trim())}\`);"
);

code = code.replace(
  'placeholder="Search standards..."',
  'placeholder="Search IS number, product, lab..."'
);

fs.writeFileSync('src/components/layout/TopBar.tsx', code);
