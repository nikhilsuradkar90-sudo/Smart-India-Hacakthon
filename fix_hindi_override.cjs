const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldLogic = `    let bestVoice;
    if (isDevanagari) {
        bestVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('hi'));
    } else {
        bestVoice = voices.find(v => v.voiceURI === currVoiceURI) || 
                    voices.find(v => v.lang === 'en-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === 'en-IN');
    }`;

const newLogic = `    // ALWAYS respect user's choice first!
    let bestVoice = voices.find(v => v.voiceURI === currVoiceURI);
    
    // Only if they didn't select anything, or if it's a critical mismatch, we auto-select
    if (!bestVoice) {
        if (isDevanagari) {
            bestVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                        voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
                        voices.find(v => v.lang.startsWith('hi'));
        } else {
            bestVoice = voices.find(v => v.lang === 'en-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                        voices.find(v => v.lang === 'en-IN');
        }
    }`;

c = c.replace(oldLogic, newLogic);
fs.writeFileSync(p, c);
console.log("FIXED VOICE OVERRIDE LOGIC");
