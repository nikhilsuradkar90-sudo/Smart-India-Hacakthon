const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldLangMap = `const langMap: Record<string, string> = { 'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'mr': 'mr-IN' };`;

const newLangMap = `const langMap: Record<string, string> = { 
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN', 
      'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN', 
      'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN' 
    };`;

c = c.replace(/const langMap: Record<string, string> = \{[^\}]+\};/g, newLangMap);

fs.writeFileSync(p, c);
console.log("Updated langMap in AssistantPage.tsx for all 22 languages!");
