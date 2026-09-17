const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('DashboardPage')) {
  code = code.replace(
    "import { SearchResultsPage } from '@/pages/SearchResultsPage';",
    "import { SearchResultsPage } from '@/pages/SearchResultsPage';\nimport { DashboardPage } from '@/pages/DashboardPage';"
  );
  code = code.replace(
    "<Route path=\"/search\" element={<SearchResultsPage />} />",
    "<Route path=\"/search\" element={<SearchResultsPage />} />\n              <Route path=\"/dashboard\" element={<DashboardPage />} />"
  );
  fs.writeFileSync('src/App.tsx', code);
}

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
if (!sidebar.includes('/dashboard')) {
  sidebar = sidebar.replace(
    "import { \n  Home,\n  Sparkles,",
    "import { \n  Home,\n  Sparkles,\n  LayoutDashboard,"
  );
  sidebar = sidebar.replace(
    "path: '/',",
    "path: '/dashboard',\n      icon: LayoutDashboard,\n      label: 'Dashboard',\n      description: 'Personalized hub'\n    },\n    {\n      path: '/',"
  );
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);
}
