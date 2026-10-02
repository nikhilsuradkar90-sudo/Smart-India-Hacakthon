import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '..', 'src', 'services', 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const target = "if (filters.status && filters.status !== 'all') params.append('status', filters.status);";
const replacement = target + "\n        if (filters.category && filters.category !== 'All Categories') params.append('group', filters.category);\n        if (filters.industry && filters.industry !== 'All Industries') params.append('subGroup', filters.industry);";

if (content.includes(target) && !content.includes("params.append('group'")) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Service patched successfully!");
} else {
    console.log("Service patch failed or already patched!");
}
