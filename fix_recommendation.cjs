const fs = require('fs');
let code = fs.readFileSync('server/recommendation.ts', 'utf8');

code = code.replace(
  "import { Groq } from 'groq-sdk';\nimport dotenv from 'dotenv';\n\ndotenv.config();\n\nconst prisma = new PrismaClient();\nconst groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;",
  `import 'dotenv/config';\nimport OpenAI from 'openai';\n\nconst prisma = new PrismaClient();\n\nlet openai: OpenAI | null = null;\nlet activeModel = 'gpt-3.5-turbo';\n\nif (process.env.GROQ_API_KEY) {\n  openai = new OpenAI({ \n    apiKey: process.env.GROQ_API_KEY,\n    baseURL: 'https://api.groq.com/openai/v1'\n  });\n  activeModel = 'mixtral-8x7b-32768';\n} else if (process.env.OPENAI_API_KEY) {\n  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });\n}`
);

code = code.replace(/if \(groq\) {/g, 'if (openai) {');
code = code.replace(/const chatCompletion = await groq\.chat\.completions\.create/g, 'const chatCompletion = await openai.chat.completions.create');
code = code.replace(/model: 'mixtral-8x7b-32768'/g, 'model: activeModel');

fs.writeFileSync('server/recommendation.ts', code);
