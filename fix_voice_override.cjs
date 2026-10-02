const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
    "utterance.lang = targetLang;\n    if (bestVoice) utterance.voice = bestVoice;",
    "if (bestVoice) {\n        utterance.voice = bestVoice;\n        utterance.lang = bestVoice.lang;\n    } else {\n        utterance.lang = targetLang;\n    }"
);

fs.writeFileSync(p, c);
console.log("FIXED VOICE OVERRIDE BUG");
