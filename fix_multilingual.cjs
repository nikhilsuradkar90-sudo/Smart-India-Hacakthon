const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// Update backend call to include language
c = c.replace(
    "body: JSON.stringify({ message: text, history: history.slice(-5) })",
    "body: JSON.stringify({ message: text, history: history.slice(-5), language })"
);

// Update speakResponse
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
    
    const langMap: Record<string, string> = {
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
      'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN'
    };
    const targetLang = langMap[language] || 'en-IN';
    
    const voices = window.speechSynthesis.getVoices();
    
    // Find voice matching the user's selected UI language
    let bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === targetLang && v.name.includes('Google')) ||
                    voices.find(v => v.lang === targetLang) ||
                    voices.find(v => v.lang.startsWith(targetLang.substring(0,2))) ||
                    voices[0];

    // Completely strip out markdown, asterisks, brackets, and extra spaces
    let cleanText = text.replace(/[*#_\\[\\]()]/g, ' ').replace(/\\s+/g, ' ').trim();
    
    // Create a single utterance for consistent volume and natural flow
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 0.95; // Natural conversational speed
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Force maximum volume
    
    utterance.onend = () => {
      // Automatically start listening again after speaking!
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
      setVoiceState('idle');
    };
    
    window.speechSynthesis.speak(utterance);
  };

  `;
    c = c.substring(0, startIndex) + newSpeakResponse + c.substring(endIndex);
    fs.writeFileSync(p, c);
    console.log("SUCCESSFULLY UPDATED LIVE VOICE FOR MULTILINGUAL");
}
