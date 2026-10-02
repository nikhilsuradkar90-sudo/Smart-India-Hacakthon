const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
    "utterance.rate = 0.95;",
    "utterance.rate = 1.0;"
);

c = c.replace(
    "utterance.volume = 1.0;",
    "utterance.volume = 1.0;\n    \n    // Stop any ongoing speech completely before starting new one\n    window.speechSynthesis.cancel();"
);

fs.writeFileSync(p, c);
console.log("FIXED TTS RATE TO 1.0");
