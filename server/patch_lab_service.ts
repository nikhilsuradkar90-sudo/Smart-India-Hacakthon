import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '..', 'src', 'services', 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const target = "if (filters.productCategory && filters.productCategory !== 'All Categories') params.append('category', filters.productCategory);";
const replacement = target + "\n        if (filters.testType && filters.testType !== 'All Test Types') params.append('testType', filters.testType);";

if (content.includes(target) && !content.includes("params.append('testType'")) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Service patched to include testType!");
} else {
    console.log("Service patch failed or already patched!");
}
