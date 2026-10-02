const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
    "const [history, setHistory] = useState<{role: string, content: string}[]>([]);",
    "const [history, setHistory] = useState<{role: string, content: string}[]>([]);\n  const [availableVoices, setAvailableVoices] = useState<any[]>([]);\n  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');"
);

fs.writeFileSync(p, c);
console.log("FIXED MISSING STATES");
