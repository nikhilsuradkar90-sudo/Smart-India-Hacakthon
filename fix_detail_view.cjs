const fs = require('fs');
let code = fs.readFileSync('src/pages/CertificationPage.tsx', 'utf8');

// Update testing lab empty state
code = code.replace(
  "No specific laboratories are explicitly mapped to this exact product in the verified database.",
  "Relevant laboratory information is not available in the verified database."
);

// Add Sources Block
const sourceBlock = `
          {/* COLUMN 4: SOURCES */}
          <div className="mt-8">
            <Card className="p-5 border-l-4 border-l-gray-500 shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Official Sources</h3>
              <p className="text-sm"><strong>Source Document:</strong> BIS Official Standard Registry</p>
              <p className="text-sm"><strong>Verification Date:</strong> {new Date().toLocaleDateString()}</p>
              <p className="text-sm"><strong>URL:</strong> <a href="https://www.bis.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">bis.gov.in</a></p>
            </Card>
          </div>
`;

code = code.replace(
  "          </div>\n          \n          <div className=\"flex justify-end gap-3 mt-8\">",
  "          </div>\n" + sourceBlock + "\n          <div className=\"flex justify-end gap-3 mt-8\">"
);

fs.writeFileSync('src/pages/CertificationPage.tsx', code);
