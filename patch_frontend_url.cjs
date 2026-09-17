const fs = require('fs');
let code = fs.readFileSync('src/services/index.ts', 'utf8');
code = code.replace(/http:\/\/localhost:3001\/api/g, '${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api');
// The template literal syntax requires backticks. Since most fetch calls are already using template strings with backticks:
// e.g. \`http://localhost:3001/api/standards?\${params.toString()}\`
// If we replace http://localhost:3001 with \${API_URL}, it becomes \`\${API_URL}/api/standards...\`
fs.writeFileSync('src/services/index.ts', code);
