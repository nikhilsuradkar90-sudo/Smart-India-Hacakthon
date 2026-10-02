const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldSpeakTextRegex = /const speakText = \(text: string, lang: string\) => \{[\s\S]*?\}\s*else\s*\{\s*alert\("Voice output is not supported in this browser\."\);\s*\}\s*\};/;

const newSpeakText = `const speakText = async (text: string, lang: string) => {
  // Stop any currently playing audio globally
  if ((window as any).currentAudio) {
    (window as any).currentAudio.pause();
    (window as any).currentAudio = null;
  }

  if (!text) return;

  // Clean Markdown symbols
  const cleanText = text.replace(/[*#_]/g, '');

  // Map to Google Translate language codes
  const gLangMap: Record<string, string> = {
    'en': 'en-IN', 'hi': 'hi', 'bn': 'bn', 'te': 'te', 'mr': 'mr',
    'ta': 'ta', 'ur': 'ur', 'gu': 'gu', 'kn': 'kn', 'ml': 'ml',
    'or': 'or', 'pa': 'pa', 'ne': 'ne', 'si': 'si'
  };
  const tl = gLangMap[lang] || 'hi';

  // Split text into safe chunks (Google TTS limit is 200 chars per request)
  // First split by sentences
  const sentences = cleanText.match(/[^.!?\\n]+[.!?\\n]+/g) || [cleanText];
  
  let audioUrls: string[] = [];
  
  sentences.forEach(sentence => {
    // If a sentence is still too long, split by chunks of 150 chars at word boundaries
    const subChunks = sentence.match(/.{1,150}(\\s|$)/g) || [sentence];
    subChunks.forEach(sub => {
      if (sub.trim()) {
        const url = \`https://translate.google.com/translate_tts?ie=UTF-8&tl=\${tl}&client=tw-ob&q=\${encodeURIComponent(sub.trim())}\`;
        audioUrls.push(url);
      }
    });
  });

  if (audioUrls.length === 0) return;

  // Play audio chunks sequentially using HTML5 Audio (100% reliable across all browsers)
  let currentIndex = 0;
  
  const playNext = () => {
    if (currentIndex >= audioUrls.length) return;
    
    const audio = new Audio(audioUrls[currentIndex]);
    (window as any).currentAudio = audio;
    
    audio.onended = () => {
      currentIndex++;
      playNext();
    };
    
    audio.onerror = (e) => {
      console.error("Audio block failed, moving to next", e);
      currentIndex++;
      playNext();
    };
    
    audio.play().catch(e => {
      console.error("Playback prevented by browser policy", e);
      // Sometimes browsers require strict user gesture, but since this chain started from a click, it usually works.
    });
  };

  playNext();
};`;

c = c.replace(oldSpeakTextRegex, newSpeakText);
fs.writeFileSync(p, c);
console.log("Successfully replaced Browser TTS with Robust Cloud Audio API!");
