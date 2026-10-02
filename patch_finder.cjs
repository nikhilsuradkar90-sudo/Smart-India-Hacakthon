const fs = require('fs');
const p = 'src/pages/StandardsFinderPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
    /onAskAssistant=\{\(\) => navigate\('\/assistant'\)\}/g,
    "onAskAssistant={() => navigate('/assistant', { state: { initialPrompt: `Tell me about standard ${standard.identifier} - ${standard.title}` } })}"
);

fs.writeFileSync(p, c);
console.log("Updated StandardsFinderPage");
