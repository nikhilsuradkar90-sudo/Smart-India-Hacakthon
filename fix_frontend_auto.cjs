const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const startIndex = c.indexOf("const speakResponse = (text: string) => {");
const endIndex = c.indexOf("utterance.rate = 0.95;", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const newSpeakResponse = `const speakResponse = (text: string) => {
    setVoiceState('speaking');

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
       setVoiceState('idle');
       return;
    }
    
    // BULLETPROOF: Clear any stuck TTS queue and forcefully resume
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    
    // Completely strip out markdown, asterisks, brackets, and extra spaces
    let cleanText = text.replace(/[*#_\\[\\]()]/g, ' ').replace(/\\s+/g, ' ').trim();
    
    if (!cleanText) {
        setVoiceState('listening');
        recognitionRef.current?.start();
        return;
    }

    const voices = window.speechSynthesis.getVoices();
    
    // AUTO-DETECT SCRIPT: If the text contains Hindi/Marathi characters, we MUST use a Hindi voice
    // otherwise the English voice will be completely silent!
    const isDevanagari = /[\\u0900-\\u097F]/.test(cleanText);
    
    let bestVoice;
    
    if (isDevanagari) {
        // Force a Premium Hindi Voice
        bestVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('hi'));
    } else {
        // Use the user-selected voice for English/Hinglish
        bestVoice = voices.find(v => v.voiceURI === selectedVoiceURI) || 
                    voices.find(v => v.lang === 'en-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === 'en-IN');
    }
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
    } else {
        utterance.lang = isDevanagari ? 'hi-IN' : 'en-IN';
    }
    `;
    c = c.substring(0, startIndex) + newSpeakResponse + c.substring(endIndex);
    fs.writeFileSync(p, c);
    console.log("SUCCESSFULLY ADDED AUTO TTS LANGUAGE DETECT");
}
