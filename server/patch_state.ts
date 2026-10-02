import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const target = "if (state && state !== 'All States') {\n        whereClause.AND.push({ state: { contains: state } });\n      }";
const replacement = `if (state && state !== 'All States') {
        const searchState = state === 'Delhi NCR' ? 'Delhi' : state;
        whereClause.AND.push({ state: { contains: searchState } });
      }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("State logic patched successfully!");
} else {
    console.log("Could not find the target block to patch!");
}
