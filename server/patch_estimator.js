const fs = require('fs');
const path = require('path');

// Patch App.tsx
const pApp = path.join(__dirname, '..', 'src', 'App.tsx');
let cApp = fs.readFileSync(pApp, 'utf-8');

const costImport = "import { CostEstimatorPage } from '@/pages/CostEstimatorPage';";
const costRoute = '<Route path="/estimator" element={<CostEstimatorPage />} />';

if (!cApp.includes("CostEstimatorPage")) {
    cApp = cApp.replace("import { ComplianceCheckerPage } from '@/pages/ComplianceCheckerPage';", "import { ComplianceCheckerPage } from '@/pages/ComplianceCheckerPage';\n" + costImport);
    cApp = cApp.replace('<Route path="/compliance" element={<ComplianceCheckerPage />} />', '<Route path="/compliance" element={<ComplianceCheckerPage />} />\n          ' + costRoute);
    fs.writeFileSync(pApp, cApp);
    console.log("App.tsx patched for Cost Estimator");
}

// Patch constants.ts
const pConst = path.join(__dirname, '..', 'src', 'data', 'constants.ts');
let cConst = fs.readFileSync(pConst, 'utf-8');

const costNavItem = `  {
    id: 'estimator',
    label: 'Cost Estimator',
    path: '/estimator',
    icon: 'Calculator',
    description: 'Calculate BIS fees and timelines instantly',
    color: 'bg-blue-500/10 text-blue-600',
  },`;

if (!cConst.includes("Cost Estimator")) {
    cConst = cConst.replace(/icon: 'CheckCircle',\n\s*description:[^\n]+,\n\s*color:[^\n]+,\n\s*\},/, "$&\n" + costNavItem);
    fs.writeFileSync(pConst, cConst);
    console.log("constants.ts patched for Cost Estimator");
}
