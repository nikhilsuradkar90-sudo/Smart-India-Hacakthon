const fs = require('fs');
let code = fs.readFileSync('src/pages/CertificationPage.tsx', 'utf8');

// Replace the fragment opening
code = code.replace(
  "      {!selectedProduct ? (\n        <div className=\"animate-fade-in\">",
  "      {!selectedProduct ? (\n        <div className=\"animate-fade-in\">\n        <>"
);

// Replace the fragment closing before the colon
code = code.replace(
  "          )}\n\n      ) : (",
  "          )}\n        </>\n        </div>\n      ) : ("
);

fs.writeFileSync('src/pages/CertificationPage.tsx', code);
