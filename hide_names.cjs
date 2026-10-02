const fs = require('fs');
const p = 'src/pages/LiveVoicePage.tsx';
let c = fs.readFileSync(p, 'utf-8');

// 1. Remove "Gemini Live Mode"
const oldBadgeText = 'Gemini Live Mode';
const newBadgeText = 'Live Voice Mode';
if (c.includes(oldBadgeText)) {
    c = c.replace(oldBadgeText, newBadgeText);
    console.log("Replaced Gemini Live Mode text.");
} else {
    console.log("Could not find Gemini Live Mode text.");
}

// 2. Hide "Microsoft" from voice names
const oldOptionText = '{v.name} ({v.lang})';
const newOptionText = '{v.name.replace(/microsoft\\s*/i, \'\').trim()} ({v.lang})';

if (c.includes(oldOptionText)) {
    c = c.replace(oldOptionText, newOptionText);
    console.log("Replaced Microsoft from voice names.");
} else {
    console.log("Could not find option text.");
}

fs.writeFileSync(p, c);
