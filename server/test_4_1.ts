import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.documentChunk.count();
  const embedded = await prisma.documentChunk.count({ where: { embedding: { not: null } } });
  console.log(`Total Chunks: ${total}`);
  console.log(`Embedded Chunks: ${embedded}`);
}
main();
