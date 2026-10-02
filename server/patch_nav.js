const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'data', 'constants.ts');
let c = fs.readFileSync(p, 'utf-8');

const complianceNavItem = `  {
    id: 'compliance',
    label: 'AI Compliance Checker',
    path: '/compliance',
    icon: 'CheckCircle',
    description: 'Verify product specs against BIS standards using AI',
    color: 'bg-green-500/10 text-green-600',
  },`;

if (!c.includes("AI Compliance Checker")) {
    // Add right after assistant
    c = c.replace(/icon: 'Bot',\n\s*description:[^\n]+,\n\s*color:[^\n]+,\n\s*\},/, "$&\n" + complianceNavItem);
    fs.writeFileSync(p, c);
    console.log("NAV_ITEMS patched!");
} else {
    console.log("Already patched.");
}
