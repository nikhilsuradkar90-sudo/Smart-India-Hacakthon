const fs = require('fs');

// 1. Add to App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('RecommendationPage')) {
  appCode = appCode.replace(
    "import { CertificationPage } from '@/pages/CertificationPage';",
    "import { CertificationPage } from '@/pages/CertificationPage';\nimport { RecommendationPage } from '@/pages/RecommendationPage';"
  );
  appCode = appCode.replace(
    "<Route path=\"/standards-explorer\" element={<StandardsExplorerPage />} />",
    "<Route path=\"/standards-explorer\" element={<StandardsExplorerPage />} />\n              <Route path=\"/recommend\" element={<RecommendationPage />} />"
  );
  fs.writeFileSync('src/App.tsx', appCode);
}

// 2. Add to Sidebar.tsx
let sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
if (!sidebarCode.includes('/recommend')) {
  sidebarCode = sidebarCode.replace(
    "import { \n  Home,",
    "import { \n  Home,\n  Sparkles,"
  );
  sidebarCode = sidebarCode.replace(
    "path: '/assistant',",
    "path: '/recommend',\n      icon: Sparkles,\n      label: 'Smart Recommend',\n      description: 'Find applicable standards'\n    },\n    {\n      path: '/assistant',"
  );
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarCode);
}

console.log('Routes and Sidebar updated');
