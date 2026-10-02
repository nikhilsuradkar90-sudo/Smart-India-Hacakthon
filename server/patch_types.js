const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'types', 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

const t = "contact?: string;\n  isDemo: boolean;";
const r = "contact?: string;\n  phone?: string;\n  email?: string;\n  validityDate?: string;\n  labCode?: string;\n  status?: string;\n  isDemo: boolean;";

if (c.includes(t)) {
  c = c.replace(t, r);
  
  // Also add city to filters
  const fT = "state?: string;\n  productCategory?: string;";
  const fR = "state?: string;\n  city?: string;\n  productCategory?: string;";
  c = c.replace(fT, fR);
  
  fs.writeFileSync(p, c);
  console.log("Types patched!");
} else {
  console.log("Types patch failed.");
}
