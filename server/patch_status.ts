import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const target = "if (status && status !== 'all' && status !== 'All') {\n      baseWhereClause.status = { contains: status };\n    }";
const replacement = `if (status && status !== 'all' && status !== 'All') {
      if (status.toLowerCase() === 'active') {
        baseWhereClause.status = { in: ['Active', 'active', 'Published', 'published'] };
      } else {
        baseWhereClause.status = { contains: status };
      }
    }`;

if (content.includes("baseWhereClause.status = { contains: status };")) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Backend status bug patched successfully!");
} else {
    console.log("Backend patch failed or already patched!");
}
