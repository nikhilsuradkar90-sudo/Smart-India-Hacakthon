import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.documentChunk.count({ where: { embedding: { not: null } } });
  console.log("Chunks with embedding:", count);
}
main();
