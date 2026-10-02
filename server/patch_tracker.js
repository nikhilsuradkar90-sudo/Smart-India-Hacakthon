const fs = require('fs');
const path = require('path');

// Patch App.tsx
const pApp = path.join(__dirname, '..', 'src', 'App.tsx');
let cApp = fs.readFileSync(pApp, 'utf-8');

const trackerImport = "import { TrackerDashboardPage } from '@/pages/TrackerDashboardPage';";
const trackerRoute = '<Route path="/tracker" element={<TrackerDashboardPage />} />';

if (!cApp.includes("TrackerDashboardPage")) {
    cApp = cApp.replace("import { CostEstimatorPage } from '@/pages/CostEstimatorPage';", "import { CostEstimatorPage } from '@/pages/CostEstimatorPage';\n" + trackerImport);
    cApp = cApp.replace('<Route path="/estimator" element={<CostEstimatorPage />} />', '<Route path="/estimator" element={<CostEstimatorPage />} />\n          ' + trackerRoute);
    fs.writeFileSync(pApp, cApp);
    console.log("App.tsx patched for Certification Tracker");
}

// Patch constants.ts
const pConst = path.join(__dirname, '..', 'src', 'data', 'constants.ts');
let cConst = fs.readFileSync(pConst, 'utf-8');

const trackerNavItem = `  {
    id: 'tracker',
    label: 'Certification Tracker',
    path: '/tracker',
    icon: 'ListTodo',
    description: 'Track your BIS application progress step-by-step',
    color: 'bg-purple-500/10 text-purple-600',
  },`;

if (!cConst.includes("Certification Tracker")) {
    cConst = cConst.replace(/icon: 'Calculator',\n\s*description:[^\n]+,\n\s*color:[^\n]+,\n\s*\},/, "$&\n" + trackerNavItem);
    fs.writeFileSync(pConst, cConst);
    console.log("constants.ts patched for Certification Tracker");
}
