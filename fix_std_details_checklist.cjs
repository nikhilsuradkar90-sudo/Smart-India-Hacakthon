const fs = require('fs');
let code = fs.readFileSync('src/pages/StandardDetailsPage.tsx', 'utf8');

if (!code.includes('ComplianceChecklist')) {
  code = code.replace(
    "import { Scale } from 'lucide-react';",
    "import { Scale } from 'lucide-react';\nimport { ComplianceChecklist } from '@/components/compliance/ComplianceChecklist';"
  );
  
  code = code.replace(
    "{/* DOCUMENTS */}",
    "<div className=\"mb-8\">\n          <ComplianceChecklist standard={standard} product={standard.products?.[0]} />\n        </div>\n\n        {/* DOCUMENTS */}"
  );
  
  fs.writeFileSync('src/pages/StandardDetailsPage.tsx', code);
}
