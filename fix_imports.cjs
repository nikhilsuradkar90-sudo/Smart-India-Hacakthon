const fs = require('fs');
const p = 'src/pages/AssistantPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

if (!c.includes('import ReactMarkdown')) {
    c = "import ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';\n" + c;
    fs.writeFileSync(p, c);
    console.log('Imports added successfully at the very top');
} else {
    console.log('Imports already present');
}
