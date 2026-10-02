const fs = require('fs');
const path = require('path');

// Patch App.tsx
const pApp = path.join(__dirname, '..', 'src', 'App.tsx');
let cApp = fs.readFileSync(pApp, 'utf-8');

const alertsImport = "import { ProactiveAlertsPage } from '@/pages/ProactiveAlertsPage';";
const alertsRoute = '<Route path="/alerts" element={<ProactiveAlertsPage />} />';

if (!cApp.includes("ProactiveAlertsPage")) {
    cApp = cApp.replace("import { TrackerDashboardPage } from '@/pages/TrackerDashboardPage';", "import { TrackerDashboardPage } from '@/pages/TrackerDashboardPage';\n" + alertsImport);
    cApp = cApp.replace('<Route path="/tracker" element={<TrackerDashboardPage />} />', '<Route path="/tracker" element={<TrackerDashboardPage />} />\n          ' + alertsRoute);
    fs.writeFileSync(pApp, cApp);
    console.log("App.tsx patched for Proactive Alerts");
}

// Patch constants.ts
const pConst = path.join(__dirname, '..', 'src', 'data', 'constants.ts');
let cConst = fs.readFileSync(pConst, 'utf-8');

const alertsNavItem = `  {
    id: 'alerts',
    label: 'Proactive Alerts',
    path: '/alerts',
    icon: 'Bell',
    description: 'Subscribe to standards and get amendment alerts',
    color: 'bg-orange-500/10 text-orange-600',
  },`;

if (!cConst.includes("Proactive Alerts")) {
    cConst = cConst.replace(/icon: 'ListTodo',\n\s*description:[^\n]+,\n\s*color:[^\n]+,\n\s*\},/, "$&\n" + alertsNavItem);
    fs.writeFileSync(pConst, cConst);
    console.log("constants.ts patched for Proactive Alerts");
}
