const fs = require('fs');
const path = require('path');

// Fix App.tsx
const pApp = path.join(__dirname, '..', 'src', 'App.tsx');
let cApp = fs.readFileSync(pApp, 'utf-8');
const importStatement = "import { ComplianceCheckerPage } from '@/pages/ComplianceCheckerPage';";
if (!cApp.includes("import { ComplianceCheckerPage }")) {
    cApp = cApp.replace("import { AssistantPage } from '@/pages/AssistantPage';", "import { AssistantPage } from '@/pages/AssistantPage';\n" + importStatement);
    fs.writeFileSync(pApp, cApp);
    console.log("App.tsx fixed!");
}

// Fix constants.ts
const pConst = path.join(__dirname, '..', 'src', 'data', 'constants.ts');
let cConst = fs.readFileSync(pConst, 'utf-8');
const complianceNavItem = `  {
    id: 'compliance',
    label: 'AI Compliance Checker',
    path: '/compliance',
    icon: 'CheckCircle',
    description: 'Verify product specs against BIS standards using AI',
    color: 'bg-green-500/10 text-green-600',
  },`;

if (!cConst.includes("AI Compliance Checker")) {
    cConst = cConst.replace(/icon: 'MessageSquareText',\n\s*description:[^\n]+,\n\s*\},/, "$&\n" + complianceNavItem);
    fs.writeFileSync(pConst, cConst);
    console.log("constants.ts fixed!");
}
