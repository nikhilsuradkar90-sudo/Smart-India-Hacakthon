import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log("Standards:", await prisma.standard.count());
  console.log("Documents:", await prisma.document.count());
}
main();
