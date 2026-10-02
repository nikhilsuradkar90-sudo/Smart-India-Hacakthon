import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const target = "{ address: { contains: text } },\n            { category: { contains: text } }";
const replacement = "{ address: { contains: text } },\n            { category: { contains: text } },\n            { testingScope: { contains: text } }";

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Laboratory API patched to include testingScope!");
} else {
    console.log("Could not find target in index.ts for testingScope patch");
}
