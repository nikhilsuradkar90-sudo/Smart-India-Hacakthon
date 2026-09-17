const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('CompareStandardsPage')) {
  code = code.replace(
    "import { DashboardPage } from '@/pages/DashboardPage';",
    "import { DashboardPage } from '@/pages/DashboardPage';\nimport { CompareStandardsPage } from '@/pages/CompareStandardsPage';"
  );
  code = code.replace(
    "<Route path=\"/dashboard\" element={<DashboardPage />} />",
    "<Route path=\"/dashboard\" element={<DashboardPage />} />\n              <Route path=\"/compare\" element={<CompareStandardsPage />} />"
  );
  fs.writeFileSync('src/App.tsx', code);
}
