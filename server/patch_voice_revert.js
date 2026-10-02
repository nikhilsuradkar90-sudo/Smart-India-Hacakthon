const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldSpeakTextRegex = /const speakText = async \(text: string, lang: string\) => \{[\s\S]*?\}\s*playNext\(\);\n\};/;

const newSpeakText = `const speakText = (text: string, lang: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert("Voice output is not supported in this browser.");
    return;
  }
  
  // Immediately cancel any ongoing speech synchronously
  window.speechSynthesis.cancel();
  
  if (!text) return;
  
  // Map languages
  const langMap: Record<string, string> = {
    'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
    'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
    'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN',
    'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN',
    'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN'
  };
  const targetLang = langMap[lang] || 'hi-IN';
  
  const voices = window.speechSynthesis.getVoices();
  let bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google'));
  if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Online') || v.name.includes('Natural')));
  if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang);
  if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith((lang || 'hi').substring(0,2)));

  // Clean and split text
  const cleanText = text.replace(/[*#_]/g, '');
  const chunks = cleanText.match(/[^.!?\\n]+[.!?\\n]+/g) || [cleanText];

  let i = 0;
  
  // Crucial: The first utterance must be spoken synchronously within the click handler stack
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
};`;

c = c.replace(oldSpeakTextRegex, newSpeakText);
fs.writeFileSync(p, c);
console.log("Applied ultra-robust Native Browser TTS!");
