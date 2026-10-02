const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// We will find the start of speakResponse and the start of return (
const startIndex = c.indexOf("const speakResponse = (text: string) => {");
const endIndex = c.indexOf("return (", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const newSpeakResponse = `const speakResponse = (text: string) => {
    setVoiceState('speaking');

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
       setVoiceState('idle');
       return;
    }
    
    window.speechSynthesis.cancel();
    
    const voices = window.speechSynthesis.getVoices();
    
    // ONE CONSISTENT VOICE: Indian English (en-IN) handles BOTH English and Hinglish flawlessly!
    // It avoids switching accents mid-conversation.
    let bestVoice = voices.find(v => v.lang === 'en-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
                    voices.find(v => v.lang === 'en-IN') ||
                    voices.find(v => v.lang.includes('en')) ||
                    voices[0];

    // Completely strip out markdown, asterisks, brackets, and extra spaces
    let cleanText = text.replace(/[*#_\\[\\]()]/g, ' ').replace(/\\s+/g, ' ').trim();
    
    // FIX: Split safely by punctuation, preserving ALL text!
    const chunks = cleanText.split(/(?<=[.!?|\\n])\\s+/).filter(Boolean);
    
    let i = 0;
    
    const speakNext = () => {
      if (i >= chunks.length) {
        // Automatically start listening again after speaking!
        setTimeout(() => {
            setVoiceState('listening');
            setTranscript('');
            try {
                recognitionRef.current?.start();
            } catch(e) {}
        }, 500);
        return;
      }
      
      const chunkText = chunks[i].trim();
      if (!chunkText) {
        i++;
        speakNext();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = 'en-IN';
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.92; // Slightly slower for very clear pronunciation
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        i++;
        speakNext();
      };
      
      utterance.onerror = (e) => {
        console.error("TTS Error", e);
        i++;
        speakNext();
      };
      
      // Delay slightly for natural flow between sentences
      if (i > 0) {
          setTimeout(() => window.speechSynthesis.speak(utterance), 150);
      } else {
          window.speechSynthesis.speak(utterance);
      }
    };
    
    speakNext();
  };

  `;
    c = c.substring(0, startIndex) + newSpeakResponse + c.substring(endIndex);
    fs.writeFileSync(p, c);
    console.log("SUCCESSFULLY OVERWROTE SPEAK RESPONSE");
} else {
    console.log("COULD NOT FIND START OR END");
}
