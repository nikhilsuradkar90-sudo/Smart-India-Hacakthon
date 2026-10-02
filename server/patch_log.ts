import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

if (!content.includes("console.log('baseWhereClause:', JSON.stringify(baseWhereClause, null, 2));")) {
    const target = "let standards: any[] = [];";
    const replacement = "console.log('baseWhereClause:', JSON.stringify(baseWhereClause, null, 2));\n    let standards: any[] = [];";
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
}
