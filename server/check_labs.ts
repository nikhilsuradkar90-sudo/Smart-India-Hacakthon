import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const chunks = await prisma.documentChunk.findMany({
    where: {
      text: {
        contains: 'laborator'
      }
    }
  });
  console.log(`Found ${chunks.length} chunks containing 'laborator'`);
  if (chunks.length > 0) {
    console.log(chunks[0].text);
  }
}
main();
