const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldSpeakTextRegex = /const speakText = \(text: string, lang: string\) => \{[\s\S]*?\}\s*else\s*\{\s*alert\("Voice output is not supported in this browser\."\);\s*\}\s*\};/;

const newSpeakText = `const speakText = (text: string, lang: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text: remove markdown symbols so it doesn't read "asterisk asterisk"
    const cleanText = text.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Map our language codes to speech recognition locales
    const langMap: Record<string, string> = { 
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN', 
      'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN', 
      'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN' 
    };
    
    const targetLang = langMap[lang] || 'en-IN';
    utterance.lang = targetLang;
    
    // Voice Enhancement Logic
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // 1. Prioritize Google voices (Best clarity on Chrome)
      let bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google'));
      
      // 2. Fallback to Microsoft Online/Natural voices (Best on Edge/Windows)
      if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Online') || v.name.includes('Natural')));
      
      // 3. Fallback to any exact locale match
      if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang);
      
      // 4. Fallback to base language match
      if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(lang));
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }
    
    // Tuning rate and pitch for maximum clarity
    utterance.rate = 0.9; // Slightly slower makes Indian languages much clearer
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Voice output is not supported in this browser.");
  }
};`;

c = c.replace(oldSpeakTextRegex, newSpeakText);

fs.writeFileSync(p, c);
console.log("Voice Enhancement Patch Applied!");
