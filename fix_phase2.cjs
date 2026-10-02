const fs = require('fs');
const p = 'src/pages/StandardDetailsPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

const targetPhase2 = `<h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">References</h2>
              <p className="text-sm text-muted-foreground">
                Reference documents will be available after Phase 2 BIS knowledge base integration.
              </p>`;

const replacementPhase2 = `<h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">References & Related Documents</h2>
              {standard.references && standard.references.length > 0 ? (
                <ul className="space-y-3">
                  {standard.references.map((ref, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                      <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{ref.title}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{ref.type}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No reference documents available.
                </p>
              )}`;

if (c.includes('Reference documents will be available after Phase 2')) {
    c = c.replace(targetPhase2, replacementPhase2);
    fs.writeFileSync(p, c);
    console.log("Phase 2 text replaced in StandardDetailsPage!");
} else {
    console.log("Could not find Phase 2 text");
}
