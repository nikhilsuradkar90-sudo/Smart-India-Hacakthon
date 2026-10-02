const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const startIndex = c.indexOf("const speakResponse = (text: string) => {");
const endIndex = c.indexOf("return (", startIndex);

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
    
    const langMap: Record<string, string> = {
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN'
    };
    const targetLang = langMap[language] || 'en-IN';
    
    const voices = window.speechSynthesis.getVoices();
    
    // Use user-selected voice, or fallback to auto
    let bestVoice = voices.find(v => v.voiceURI === selectedVoiceURI) || 
                    voices.find(v => v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('Google'))) ||
                    voices.find(v => v.lang === targetLang) ||
                    voices[0];

    // Completely strip out markdown, asterisks, brackets, and extra spaces
    let cleanText = text.replace(/[*#_\\[\\]()]/g, ' ').replace(/\\s+/g, ' ').trim();
    
    if (!cleanText) {
        setVoiceState('listening');
        recognitionRef.current?.start();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 0.95; 
    utterance.pitch = 1.0;
    utterance.volume = 1.0; 
    
    utterance.onend = () => {
      setTimeout(() => {
          setVoiceState('listening');
          setTranscript('');
          try {
              recognitionRef.current?.start();
          } catch(e) {}
      }, 500);
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Error", e);
      // Even on error, fallback to listening so it doesn't get permanently stuck
      setVoiceState('listening');
      try {
          recognitionRef.current?.start();
      } catch(err) {}
    };
    
    // Wrap speak in setTimeout to bypass some browser sync-execution blocks
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 50);
  };

  `;
    c = c.substring(0, startIndex) + newSpeakResponse + c.substring(endIndex);
    fs.writeFileSync(p, c);
    console.log("SUCCESSFULLY ADDED TTS UNSTICK MECHANISM");
}
