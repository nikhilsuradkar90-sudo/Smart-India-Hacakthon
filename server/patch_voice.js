const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// 1. Add Volume2 to lucide-react imports
c = c.replace("import { Send, X, Paperclip, Mic, Trash2, Copy, ThumbsUp, ThumbsDown, RotateCw, MoreHorizontal, Sparkles, FileText, \nShieldCheck } from 'lucide-react';", 
              "import { Send, X, Paperclip, Mic, Trash2, Copy, ThumbsUp, ThumbsDown, RotateCw, MoreHorizontal, Sparkles, FileText, \nShieldCheck, Volume2 } from 'lucide-react';");

c = c.replace(/import \{ Send[^\}]+\} from 'lucide-react';/, "import { Send, X, Paperclip, Mic, Trash2, Copy, ThumbsUp, ThumbsDown, RotateCw, MoreHorizontal, Sparkles, FileText, ShieldCheck, Volume2 } from 'lucide-react';")

// 2. Add TTS function at the top of the file (outside components)
const ttsFunc = `
const speakText = (text: string, lang: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map our language codes to speech recognition locales
    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN'
    };
    
    utterance.lang = langMap[lang] || 'en-US';
    utterance.rate = 0.95; // slightly slower for better clarity
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Voice output is not supported in this browser.");
  }
};
`;

if (!c.includes("speakText")) {
    c = c.replace("export function AssistantPage() {", ttsFunc + "\nexport function AssistantPage() {");
}

// 3. Fix the recognitionRef language hardcoding
c = c.replace("recognitionRef.current.lang = 'en-US';", `
        const langMap: Record<string, string> = { 'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'mr': 'mr-IN' };
        recognitionRef.current.lang = langMap[language] || 'en-US';
`);
// But wait, \`language\` might not be in scope of useEffect if it's not in the dependency array!
// Let's modify the useEffect to include language in dependency array, or just update it on handleMicClick.
// It's safer to just set the lang right before starting!
c = c.replace(/recognitionRef\.current\.start\(\);/g, `
          const langMap: Record<string, string> = { 'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'mr': 'mr-IN' };
          recognitionRef.current.lang = langMap[language] || 'en-US';
          recognitionRef.current.start();
`);

// 4. Update MessageBubble props and JSX
c = c.replace("function MessageBubble({", "function MessageBubble({ language,");
// Pass language to MessageBubble instances
c = c.replace(/<MessageBubble\s+key=\{message\.id\}\s+message=\{message\}/g, "<MessageBubble\n                key={message.id}\n                language={language}\n                message={message}");

// 5. Add Volume2 Read Aloud button to Action Bar
const readAloudBtn = `              <ActionButton onClick={() => speakText(message.content, language)} label="Read Aloud" icon={Volume2} />`;
if (!c.includes("Read Aloud")) {
    c = c.replace("<ActionButton onClick={onCopy} label=\"Copy\" icon={Copy} />", "<ActionButton onClick={onCopy} label=\"Copy\" icon={Copy} />\n" + readAloudBtn);
}

fs.writeFileSync(p, c);
console.log("AssistantPage patched with Multilingual Voice Input and Output!");
