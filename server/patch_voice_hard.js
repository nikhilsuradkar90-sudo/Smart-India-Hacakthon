const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const startIdx = c.indexOf('const speakText =');
const endIdx = c.indexOf('export function AssistantPage() {');

if (startIdx !== -1 && endIdx !== -1) {
    const newSpeakText = `const speakText = (text: string, lang: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert("Voice output is not supported in this browser.");
    return;
  }
  
  window.speechSynthesis.cancel();
  if (!text) return;
  
  const langMap: Record<string, string> = {
    'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
    'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
    'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN',
    'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN',
    'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN'
  };
  const targetLang = langMap[lang] || 'hi-IN';
  
  const voices = window.speechSynthesis.getVoices();
  let bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google')) ||
                  voices.find(v => v.lang === targetLang && (v.name.includes('Online') || v.name.includes('Natural'))) ||
                  voices.find(v => v.lang === targetLang) ||
                  voices.find(v => v.lang.startsWith((lang || 'hi').substring(0,2)));

  const cleanText = text.replace(/[*#_]/g, '');
  const chunks = cleanText.match(/[^.!?\\n]+[.!?\\n]+/g) || [cleanText];

  let i = 0;
  
  const speakNext = () => {
    if (i >= chunks.length) return;
    const chunkText = chunks[i].trim();
    if (!chunkText) {
      i++;
      speakNext();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = targetLang;
    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      i++;
      speakNext();
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      i++;
      speakNext();
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  speakNext();
};
`;
    c = c.substring(0, startIdx) + newSpeakText + '\\n' + c.substring(endIdx);
    fs.writeFileSync(p, c);
    console.log("Hard patched speakText!");
} else {
    console.log("Could not find boundaries.");
}
