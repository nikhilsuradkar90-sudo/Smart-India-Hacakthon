const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

code = code.replace(
  "import { PrismaClient } from '@prisma/client';",
  "import { prisma } from './prisma';"
);
code = code.replace(
  "const prisma = new PrismaClient();",
  ""
);

fs.writeFileSync('server/index.ts', code);
