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
    
    window.speechSynthesis.cancel();
    
    const voices = window.speechSynthesis.getVoices();
    
    // ONE CONSISTENT VOICE: Indian English (en-IN)
    let bestVoice = voices.find(v => v.lang === 'en-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
                    voices.find(v => v.lang === 'en-IN') ||
                    voices.find(v => v.lang.includes('en')) ||
                    voices[0];

    // Completely strip out markdown, asterisks, brackets, and extra spaces
    let cleanText = text.replace(/[*#_\\[\\]()]/g, ' ').replace(/\\s+/g, ' ').trim();
    
    // Create a single utterance for consistent volume and natural flow
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 0.95; // Natural conversational speed
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Force maximum volume to prevent fluctuations!
    
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
    
    // Speak the entire response at once
    window.speechSynthesis.speak(utterance);
  };

  `;
    c = c.substring(0, startIndex) + newSpeakResponse + c.substring(endIndex);
    fs.writeFileSync(p, c);
    console.log("SUCCESSFULLY REMOVED CHUNKING");
}
