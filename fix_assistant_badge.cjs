const fs = require('fs');
let code = fs.readFileSync('src/pages/AssistantPage.tsx', 'utf8');

if (!code.includes('TrustBadge')) {
  code = code.replace(
    "import { Send, Bot, User, HelpCircle, FileText, Upload, Mic, FileDigit } from 'lucide-react';",
    "import { Send, Bot, User, HelpCircle, FileText, Upload, Mic, FileDigit } from 'lucide-react';\nimport { TrustBadge } from '@/components/shared/TrustBadge';"
  );
  
  code = code.replace(
    "{citation.documentTitle} (Page {citation.pageNumber})",
    "{citation.documentTitle} <TrustBadge documentTitle={citation.documentTitle} pageNumber={citation.pageNumber} />"
  );
  
  fs.writeFileSync('src/pages/AssistantPage.tsx', code);
}
