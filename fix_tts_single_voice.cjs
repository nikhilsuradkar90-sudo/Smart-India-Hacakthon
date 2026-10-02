const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldSpeakResponseRegex = /const isHindiText.*?;[\s\S]*?(?=let cleanText)/;

const newSpeakResponse = `    // Always use a single, consistent Indian voice for the entire conversation
    const targetLang = langMap[language] || 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    
    // Look for a consistent Indian voice (en-IN or hi-IN) that handles Hinglish and English beautifully.
    // Microsoft's Online/Natural voices or Google's voices are best.
    let bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === 'en-IN' && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google'))) ||
                    voices.find(v => v.lang === targetLang) ||
                    voices.find(v => v.lang === 'en-IN') ||
                    voices[0];

`;

c = c.replace(oldSpeakResponseRegex, newSpeakResponse);
fs.writeFileSync(p, c);
console.log("Fixed TTS voice consistency!");
