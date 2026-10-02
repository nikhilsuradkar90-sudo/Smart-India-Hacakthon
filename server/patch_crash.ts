import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const target = "if (tokens.length === 0) tokens.push(search.toLowerCase());";
const replacement = "if (tokens.length === 0 && search) tokens.push(search.toLowerCase());\n        if (tokens.length === 0 && searchVal) tokens.push(searchVal.trim());";

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Fixed standard search crash!");
} else {
    console.log("Could not find the target string!");
}
