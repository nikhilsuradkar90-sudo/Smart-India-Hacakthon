const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'services', 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

const target = "if (filters.status && filters.status !== 'all') params.append('status', filters.status);";
const replacement = "if (filters.status && filters.status !== 'all') params.append('status', filters.status);\n        if (filters.category && filters.category !== 'All Categories') params.append('group', filters.category);\n        if (filters.industry && filters.industry !== 'All Industries') params.append('subGroup', filters.industry);";

if (c.includes(target) && !c.includes("params.append('group', filters.category)")) {
    c = c.replace(target, replacement);
    fs.writeFileSync(p, c);
    console.log('Standards filters restored in frontend!');
} else {
    console.log('Already present or failed.');
}
