const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'LaboratoryFinderPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const t = `{lab.contact && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" /> {lab.contact}
          </p>
        )}`;

const r = `
        <div className="flex flex-col gap-1.5 mt-2 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs font-semibold text-foreground border-b pb-1 mb-1">Laboratory Details</p>
          {lab.labCode && <p className="text-xs text-muted-foreground"><strong>Lab Code:</strong> {lab.labCode}</p>}
          {lab.status && <p className="text-xs text-muted-foreground"><strong>Status:</strong> <span className="text-green-600">{lab.status}</span></p>}
          {lab.validityDate && <p className="text-xs text-muted-foreground"><strong>Valid Till:</strong> {lab.validityDate}</p>}
          {lab.phone && <p className="text-xs text-muted-foreground"><strong>Phone:</strong> {lab.phone}</p>}
          {lab.email && <p className="text-xs text-muted-foreground"><strong>Email:</strong> {lab.email}</p>}
          {!lab.phone && !lab.email && lab.contact && <p className="text-xs text-muted-foreground"><strong>Contact:</strong> {lab.contact}</p>}
        </div>
`;

if (c.includes(t)) {
  c = c.replace(t, r);
  fs.writeFileSync(p, c);
  console.log("Card patched");
} else {
  console.log("Card patch failed");
}
