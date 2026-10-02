import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '..', 'src', 'services', 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace location mapping for list
const target1 = "location: lab.state || lab.city || lab.address,";
const replacement1 = "location: lab.address || lab.state,";

// Replace it globally in the file (there are two occurrences)
if (content.includes(target1)) {
    content = content.replace(new RegExp(target1.replace(/[.*+?^$|{}()[\\]\\\\]/g, '\\\\$&'), 'g'), replacement1);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Service patched to show full address!");
} else {
    console.log("Service patch failed or already patched!");
}
