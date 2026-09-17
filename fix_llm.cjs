const fs = require('fs');

for (const file of ['server/rag.ts', 'server/recommendation.ts']) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /if \(process\.env\.GROQ_API_KEY\) \{[\s\S]*?\} else if \(process\.env\.OPENAI_API_KEY\) \{/,
    'if (process.env.OPENAI_API_KEY) {'
  );
  if (file === 'server/recommendation.ts') {
    code = code.replace("activeModel = 'llama-3.1-70b-versatile';", "");
  }
  fs.writeFileSync(file, code);
}
