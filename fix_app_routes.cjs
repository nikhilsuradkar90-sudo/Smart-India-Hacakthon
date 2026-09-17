const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('SearchResultsPage')) {
  code = code.replace(
    "import { RecommendationPage } from '@/pages/RecommendationPage';",
    "import { RecommendationPage } from '@/pages/RecommendationPage';\nimport { SearchResultsPage } from '@/pages/SearchResultsPage';"
  );
  
  code = code.replace(
    "<Route path=\"/recommend\" element={<RecommendationPage />} />",
    "<Route path=\"/recommend\" element={<RecommendationPage />} />\n              <Route path=\"/search\" element={<SearchResultsPage />} />"
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
