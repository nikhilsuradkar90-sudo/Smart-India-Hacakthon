const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'ComplianceCheckerPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace("import { useToast } from '@/components/ui/use-toast';", "import { useToast } from '@/hooks/use-toast';");

fs.writeFileSync(p, c);
console.log("Fixed use-toast import!");
