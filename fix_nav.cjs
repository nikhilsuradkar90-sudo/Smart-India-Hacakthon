const fs = require('fs');
const path = require('path');
const pConst = path.join(__dirname, 'src', 'data', 'constants.ts');
let cConst = fs.readFileSync(pConst, 'utf-8');

const liveVoiceNavItem = `  {
    id: 'voice-mode',
    label: 'Live Voice Mode',
    path: '/voice-mode',
    icon: 'Mic',
    description: 'Continuous hands-free AI voice assistant',
  },`;

if (!cConst.includes("Live Voice Mode")) {
    cConst = cConst.replace(
      "export const NAV_ITEMS: NavItem[] = [", 
      "export const NAV_ITEMS: NavItem[] = [\n" + liveVoiceNavItem
    );
    fs.writeFileSync(pConst, cConst);
    console.log("constants.ts fixed!");
}
