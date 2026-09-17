const fs = require('fs');

for (const file of ['server/rag.ts', 'server/recommendation.ts']) {
  let code = fs.readFileSync(file, 'utf8');
  // Add back Groq
  code = code.replace(
    /if \(process\.env\.OPENAI_API_KEY\) \{/,
    `if (process.env.GROQ_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
  activeModel = 'openai/gpt-oss-20b';
} else if (process.env.OPENAI_API_KEY) {`
  );
  fs.writeFileSync(file, code);
}
