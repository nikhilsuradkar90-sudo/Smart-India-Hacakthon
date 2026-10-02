const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// 1. Add state for voices
const stateInsertion = `  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [history, setHistory] = useState<{role: string, content: string}[]>([]);
  
  // Voice selection states
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
`;

c = c.replace(/const \[voiceState.*?\]\(\[\]\);/s, stateInsertion);

// 2. Add useEffect for loading voices
const useEffectInsertion = `  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Auto-select a premium natural voice if not already selected
        if (voices.length > 0 && !selectedVoiceURI) {
            const premium = voices.find(v => v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google'));
            setSelectedVoiceURI(premium ? premium.voiceURI : voices[0].voiceURI);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
`;
c = c.replace("  useEffect(() => {\n    // Setup Speech Recognition", useEffectInsertion + "    // Setup Speech Recognition");

// 3. Update speakResponse to use selectedVoiceURI
const speakUpdateStr = `const targetLang = langMap[language] || 'en-IN';
    
    const voices = window.speechSynthesis.getVoices();
    
    // Find voice matching the user's selected UI language
    let bestVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    voices.find(v => v.lang === targetLang && v.name.includes('Google')) ||
                    voices.find(v => v.lang === targetLang) ||
                    voices.find(v => v.lang.startsWith(targetLang.substring(0,2))) ||
                    voices[0];`;

const newSpeakUpdateStr = `const targetLang = langMap[language] || 'en-IN';
    
    const voices = window.speechSynthesis.getVoices();
    
    // Use user-selected voice, or fallback to auto
    let bestVoice = voices.find(v => v.voiceURI === selectedVoiceURI) || 
                    voices.find(v => v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('Google'))) ||
                    voices[0];`;

c = c.replace(speakUpdateStr, newSpeakUpdateStr);

// 4. Add UI dropdown just below the main visual indicator
const uiInsertion = `          {/* Voice Selector Dropdown */}
          <div className="mt-8 w-full max-w-xs mx-auto">
             <label className="block text-sm font-medium text-muted-foreground mb-2">Select Premium Voice:</label>
             <select 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
             >
                {availableVoices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                    </option>
                ))}
             </select>
          </div>

          {/* Transcript Display */}`;

c = c.replace("{/* Transcript Display */}", uiInsertion);

fs.writeFileSync(p, c);
console.log("SUCCESSFULLY ADDED VOICE SELECTOR");
