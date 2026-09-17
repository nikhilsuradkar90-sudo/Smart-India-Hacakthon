const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

code = code.replace(
  "import { PrismaClient } from '@prisma/client';",
  "import { PrismaClient } from '@prisma/client';\nimport { prisma } from './prisma';" // assuming server/prisma.ts or similar exists
);

code = code.replace(
  "const prisma = new PrismaClient({\n  log: ['error', 'warn'],\n});",
  ""
);

fs.writeFileSync('server/rag.ts', code);
