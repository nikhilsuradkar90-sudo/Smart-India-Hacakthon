const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldSpeakResponse = `  const speakResponse = (text: string) => {
    setVoiceState('speaking');

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
       setVoiceState('idle');
       return;
    }
    
    window.speechSynthesis.cancel();
    
    const langMap: Record<string, string> = {
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN'
    };
    const targetLang = langMap[language] || 'hi-IN';
    
    const voices = window.speechSynthesis.getVoices();
    let bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google')) ||
                    voices.find(v => v.lang === targetLang && (v.name.includes('Online') || v.name.includes('Natural'))) ||
                    voices.find(v => v.lang === targetLang) ||
                    voices.find(v => v.lang.startsWith((language || 'hi').substring(0,2)));

    const cleanText = text.replace(/[*#_]/g, '');
    const chunks = cleanText.match(/[^.!?\\n]+[.!?\\n]+/g) || [cleanText];
    let i = 0;
    
    const speakNext = () => {
      if (i >= chunks.length) {
        // Automatically start listening again after speaking! (Gemini Live Mode)
        setVoiceState('listening');
        setTranscript('');
        recognitionRef.current?.start();
        return;
      }
      
      const chunkText = chunks[i].trim();
      if (!chunkText) {
        i++;
        speakNext();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = targetLang;
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        i++;
        speakNext();
      };
      utterance.onerror = () => {
        i++;
        speakNext();
      };
      
      window.speechSynthesis.speak(utterance);
    };
    
    speakNext();
  };`;

const newSpeakResponse = `  const speakResponse = (text: string) => {
    setVoiceState('speaking');

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
       setVoiceState('idle');
       return;
    }
    
    window.speechSynthesis.cancel();
    
    const langMap: Record<string, string> = {
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN'
    };
    
    // Automatically detect if AI replied in English or Hindi based on character ranges
    const isHindiText = /[\\u0900-\\u097F]/.test(text);
    const targetLang = isHindiText ? 'hi-IN' : (langMap[language] || 'en-IN');
    
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural browser voices (Microsoft Edge Natural voices are excellent)
    let bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google'))) ||
                    voices.find(v => v.lang === targetLang) ||
                    voices.find(v => v.lang.startsWith(targetLang.substring(0,2)));

    // Completely strip out markdown, asterisks, brackets, and extra spaces
    let cleanText = text.replace(/[*#_\\[\\]()]/g, ' ').replace(/\\s+/g, ' ').trim();
    
    // Split safely by punctuation, preserving all text!
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
        }, 500); // give a tiny pause before listening again
        return;
      }
      
      const chunkText = chunks[i].trim();
      if (!chunkText) {
        i++;
        speakNext();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = targetLang;
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.9; // Slightly slower for better clarity
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
          setTimeout(() => window.speechSynthesis.speak(utterance), 100);
      } else {
          window.speechSynthesis.speak(utterance);
      }
    };
    
    speakNext();
  };`;

// Replace the string
c = c.replace(oldSpeakResponse, newSpeakResponse);
fs.writeFileSync(p, c);
console.log("Fixed TTS clarity in LiveVoicePage.tsx!");
