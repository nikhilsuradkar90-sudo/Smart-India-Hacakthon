const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldSpeakTextRegex = /const speakText = \(text: string, lang: string\) => \{[\s\S]*?\}\s*else\s*\{\s*alert\("Voice output is not supported in this browser\."\);\s*\}\s*\};/;

const newSpeakText = `const speakText = (text: string, lang: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    console.log("Speaking text for language:", lang);
    window.speechSynthesis.cancel();
    
    // Fallback if text is somehow empty
    if (!text) return;
    
    const cleanText = text.replace(/[*#_]/g, '');
    
    // Instead of complex regex chunking that might fail, let's just use a simple approach
    // Browsers block TTS if it's inside a setTimeout, so we must call speak() synchronously!
    
    const langMap: Record<string, string> = { 
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN', 'mai': 'hi-IN', 'sat': 'hi-IN', 
      'ks': 'ks-IN', 'ne': 'ne-NP', 'gom': 'kok-IN', 'sd': 'sd-IN', 'doi': 'hi-IN', 
      'mni': 'mni-IN', 'brx': 'hi-IN', 'sa': 'sa-IN' 
    };
    const targetLang = (lang && langMap[lang]) ? langMap[lang] : 'hi-IN'; // Default to hi-IN if undefined
    
    let bestVoice: SpeechSynthesisVoice | undefined;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google'));
      if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Online') || v.name.includes('Natural')));
      if (!bestVoice) bestVoice = voices.find(v => v.lang === targetLang);
      if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith((lang || 'hi').substring(0,2)));
    }

    // Split text manually by newlines or large chunks to be safe, but keep it synchronous
    const chunks = cleanText.split('\\n').filter(c => c.trim().length > 0);
    
    if (chunks.length === 0) {
        chunks.push(cleanText);
    }

    chunks.forEach(chunk => {
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      utterance.lang = targetLang;
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onerror = (e) => console.error("TTS Error:", e);
      
      window.speechSynthesis.speak(utterance);
    });
    
  } else {
    alert("Voice output is not supported in this browser.");
  }
};`;

c = c.replace(oldSpeakTextRegex, newSpeakText);
fs.writeFileSync(p, c);
console.log("Applied synchronous TTS fix!");
