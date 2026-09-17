const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(
  "Respond in the language requested (default English).",
  "Respond in the language requested by the user: \\"${language}\\". Ensure the entire response is translated fluidly into this language."
);

fs.writeFileSync('server/rag.ts', code);
