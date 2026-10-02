import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export function LiveVoicePage() {
  const { language } = useLanguage();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [history, setHistory] = useState<{role: string, content: string}[]>([]);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);
  const selectedVoiceURIRef = useRef(selectedVoiceURI);
  const historyRef = useRef(history);
  const isSpeakingRef = useRef(false);

  // Sync refs to fix stale closures
  useEffect(() => { selectedVoiceURIRef.current = selectedVoiceURI; }, [selectedVoiceURI]);
  useEffect(() => { historyRef.current = history; }, [history]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        if (voices.length > 0 && !selectedVoiceURIRef.current) {
            const premium = voices.find(v => v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google'));
            const uri = premium ? premium.voiceURI : voices[0].voiceURI;
            setSelectedVoiceURI(uri);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const initSpeechRecognition = () => {
      if (typeof window === 'undefined') return null;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return null;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      const langMap: Record<string, string> = {
        'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
        'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
        'or': 'or-IN', 'pa': 'pa-IN', 'as': 'as-IN'
      };
      recognition.lang = langMap[language] || 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        finalTranscript = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        if (finalTranscript.trim() && !isSpeakingRef.current) {
            processVoiceInput(finalTranscript.trim());
        } else {
            setVoiceState('idle');
        }
        finalTranscript = '';
      };

      recognition.onerror = (event: any) => {
        console.error("STT Error:", event.error);
        if (event.error !== 'no-speech') {
            setVoiceState('error');
            setTimeout(() => setVoiceState('idle'), 2000);
        }
      };

      return recognition;
  };

  useEffect(() => {
    recognitionRef.current = initSpeechRecognition();
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [language]);

  const toggleListening = () => {
    if (voiceState === 'idle' || voiceState === 'error') {
      setTranscript('');
      setAssistantReply('');
      setVoiceState('listening');
      isSpeakingRef.current = false;
      window.speechSynthesis.cancel();
      try {
          recognitionRef.current?.start();
      } catch(e) {}
    } else {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
      setVoiceState('idle');
      isSpeakingRef.current = false;
    }
  };

  const processVoiceInput = async (text: string) => {
    setVoiceState('thinking');
    
    const currentHistory = historyRef.current;
    const updatedHistory = [...currentHistory, { role: 'user', content: text }];
    setHistory(updatedHistory);

    try {
      const res = await fetch('http://localhost:3001/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: currentHistory.slice(-5), language })
      });

      const data = await res.json();
      
      if (data.error) {
         setAssistantReply("Error: " + data.error);
         setVoiceState('error');
         setTimeout(() => setVoiceState('idle'), 3000);
         return;
      }

      setAssistantReply(data.text);
      setHistory([...updatedHistory, { role: 'assistant', content: data.text }]);
      
      speakResponse(data.text);

    } catch (e) {
      console.error(e);
      setVoiceState('error');
      setTimeout(() => setVoiceState('idle'), 2000);
    }
  };

  const speakResponse = (text: string) => {
    isSpeakingRef.current = true;
    setVoiceState('speaking');

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
       setVoiceState('idle');
       isSpeakingRef.current = false;
       return;
    }
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    
    let cleanText = text.replace(/[*#_\\[\\]()]/g, ' ').replace(/\\s+/g, ' ').trim();
    if (!cleanText) {
        setVoiceState('listening');
        isSpeakingRef.current = false;
        try { recognitionRef.current?.start(); } catch(e) {}
        return;
    }

    const voices = window.speechSynthesis.getVoices();
    const isDevanagari = /[\\u0900-\\u097F]/.test(cleanText);
    const currVoiceURI = selectedVoiceURIRef.current;
    
    // ALWAYS respect user's choice first!
    let bestVoice = voices.find(v => v.voiceURI === currVoiceURI);
    
    // Only if they didn't select anything, or if it's a critical mismatch, we auto-select
    if (!bestVoice) {
        if (isDevanagari) {
            bestVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                        voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
                        voices.find(v => v.lang.startsWith('hi'));
        } else {
            bestVoice = voices.find(v => v.lang === 'en-IN' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                        voices.find(v => v.lang === 'en-IN');
        }
    }
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
    } else {
        utterance.lang = isDevanagari ? 'hi-IN' : 'en-US';
    }
    
    // Smooth volume and rate
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Stop any ongoing speech completely before starting new one
    window.speechSynthesis.cancel();
    
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setTimeout(() => {
          setVoiceState('listening');
          setTranscript('');
          try {
              recognitionRef.current?.start();
          } catch(e) {}
      }, 1500);
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Error", e);
      isSpeakingRef.current = false;
      setVoiceState('listening');
      try { recognitionRef.current?.start(); } catch(err) {}
    };
    
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 50);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-12 animate-fade-in min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 mb-4 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
          Live Voice Mode
        </Badge>
        <h1 className="text-4xl font-bold text-foreground mb-4">Hands-Free Voice Assistant</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Have a continuous, natural conversation with AI. Speak your query, and it will reply and instantly listen for your next response.
        </p>
      </div>

      <div className="w-full max-w-2xl relative">
        <Card className="p-8 md:p-12 border-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden text-center flex flex-col items-center justify-center min-h-[350px]">
          
          <div className="relative flex items-center justify-center mb-6 mt-4">
             {voiceState === 'listening' && (
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150"></div>
             )}
             {voiceState === 'thinking' && (
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-pulse scale-125"></div>
             )}
             {voiceState === 'speaking' && (
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse scale-150"></div>
             )}
             
             <button 
                onClick={toggleListening}
                className={`relative z-10 h-24 w-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                  voiceState === 'idle' ? 'bg-primary hover:bg-primary/90 hover:scale-105' :
                  voiceState === 'listening' ? 'bg-blue-500 scale-110 shadow-blue-500/50' :
                  voiceState === 'thinking' ? 'bg-purple-500 animate-pulse' :
                  voiceState === 'speaking' ? 'bg-green-500 shadow-green-500/50' :
                  'bg-red-500'
                }`}
             >
                {voiceState === 'idle' && <Mic className="h-10 w-10" />}
                {voiceState === 'listening' && <Mic className="h-10 w-10 animate-pulse" />}
                {voiceState === 'thinking' && <Loader2 className="h-10 w-10 animate-spin" />}
                {voiceState === 'speaking' && <Volume2 className="h-10 w-10 animate-pulse" />}
                {voiceState === 'error' && <Square className="h-8 w-8" />}
             </button>
          </div>

          <div className="mt-4 mb-8 w-full max-w-xs mx-auto">
             <label className="block text-sm font-medium text-muted-foreground mb-2">Select Premium Voice:</label>
             <select 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
             >
                {availableVoices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name.replace(/microsoft\s*/i, '').trim()} ({v.lang})
                    </option>
                ))}
             </select>
          </div>

          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="min-h-[3rem] text-lg font-medium text-muted-foreground italic">
              {voiceState === 'listening' && !transcript && "Listening..."}
              {transcript && <span className="text-foreground notranslate">"{transcript}"</span>}
            </div>

            <div className="min-h-[5rem] text-sm md:text-base text-foreground font-semibold text-blue-600 dark:text-blue-400 notranslate leading-relaxed">
              {voiceState === 'thinking' && <span className="text-muted-foreground font-normal flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Generating response...</span>}
              {assistantReply && voiceState !== 'thinking' && assistantReply}
            </div>
          </div>
          
        </Card>

        <div className="mt-8 flex justify-center gap-4">
           <Button variant="outline" onClick={toggleListening} className="rounded-full px-6">
              {voiceState === 'idle' ? 'Start Conversation' : 'Stop Conversation'}
           </Button>
        </div>
      </div>
    </div>
  );
}
