const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace("fetch('/api/voice-chat'", "fetch('http://localhost:3001/api/voice-chat'");

fs.writeFileSync(p, c);
console.log("Fixed fetch URL!");
