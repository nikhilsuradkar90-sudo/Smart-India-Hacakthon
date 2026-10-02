const fs = require('fs');
const path = require('path');

// Patch App.tsx
const pApp = path.join(__dirname, '..', 'src', 'App.tsx');
let cApp = fs.readFileSync(pApp, 'utf-8');

const liveVoiceImport = "import { LiveVoicePage } from '@/pages/LiveVoicePage';";
const liveVoiceRoute = '<Route path="/voice-mode" element={<LiveVoicePage />} />';

if (!cApp.includes("LiveVoicePage")) {
    cApp = cApp.replace("import { AssistantPage } from '@/pages/AssistantPage';", "import { AssistantPage } from '@/pages/AssistantPage';\n" + liveVoiceImport);
    cApp = cApp.replace('<Route path="/assistant" element={<AssistantPage />} />', '<Route path="/assistant" element={<AssistantPage />} />\n          ' + liveVoiceRoute);
    fs.writeFileSync(pApp, cApp);
    console.log("App.tsx patched for Live Voice Mode");
}

// Patch constants.ts
const pConst = path.join(__dirname, '..', 'src', 'data', 'constants.ts');
let cConst = fs.readFileSync(pConst, 'utf-8');

const liveVoiceNavItem = `  {
    id: 'voice-mode',
    label: 'Live Voice Mode',
    path: '/voice-mode',
    icon: 'Mic',
    description: 'Continuous hands-free AI voice assistant',
    color: 'bg-blue-500/10 text-blue-600',
  },`;

if (!cConst.includes("Live Voice Mode")) {
    cConst = cConst.replace(/icon: 'MessageSquare',\n\s*description:[^\n]+,\n\s*color:[^\n]+,\n\s*\},/, "$&\n" + liveVoiceNavItem);
    fs.writeFileSync(pConst, cConst);
    console.log("constants.ts patched for Live Voice Mode");
}
