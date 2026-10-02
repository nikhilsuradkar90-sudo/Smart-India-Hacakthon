const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'App.tsx');
let c = fs.readFileSync(p, 'utf-8');

const importStatement = "import { ComplianceCheckerPage } from './pages/ComplianceCheckerPage';";
if (!c.includes("ComplianceCheckerPage")) {
    c = c.replace("import { AssistantPage } from './pages/AssistantPage';", "import { AssistantPage } from './pages/AssistantPage';\n" + importStatement);
}

const routeStatement = '<Route path="/compliance" element={<ComplianceCheckerPage />} />';
if (!c.includes("/compliance")) {
    c = c.replace('<Route path="/assistant" element={<AssistantPage />} />', '<Route path="/assistant" element={<AssistantPage />} />\n              ' + routeStatement);
    fs.writeFileSync(p, c);
    console.log("App.tsx patched!");
} else {
    console.log("App.tsx already patched or target not found.");
}
