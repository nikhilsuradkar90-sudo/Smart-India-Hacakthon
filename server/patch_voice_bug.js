const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldSpeakTextRegex = /const speakText = \(text: string, lang: string\) => \{[\s\S]*?\}\s*else\s*\{\s*alert\("Voice output is not supported in this browser\."\);\s*\}\s*\};/;

const newSpeakText = `const speakText = (text: string, lang: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Clear any stuck state
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
      // Clean text: remove markdown symbols
      const cleanText = text.replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const langMap: Record<string, string> = { 
        'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 
        'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 
        'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN', 
        'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN', 
        'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN' 
      };
      
      const targetLang = langMap[lang] || 'en-IN';
      utterance.lang = targetLang;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google'));
        if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Online') || v.name.includes('Natural')));
        if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang);
        if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(lang));
        if (bestVoice) utterance.voice = bestVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }, 50); // Small delay to prevent Chrome cancel-drop bug
  } else {
    alert("Voice output is not supported in this browser.");
  }
};`;

c = c.replace(oldSpeakTextRegex, newSpeakText);
fs.writeFileSync(p, c);
console.log("Fixed TTS Chrome cancel bug!");
