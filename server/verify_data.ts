import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const standardsCount = await prisma.standard.count();
    const productsCount = await prisma.product.count();
    const certificationsCount = await prisma.certificationScheme.count();
    const labsCount = await prisma.laboratory.count();
    const chunksCount = await prisma.documentChunk.count();

    console.log("==========================================");
    console.log("DATA SNAPSHOT");
    console.log("Date:", new Date().toISOString());
    console.log("Database: Connected via", process.env.DATABASE_URL);
    console.log("Standards:", standardsCount);
    console.log("Products (Certification records):", productsCount);
    console.log("Laboratories:", labsCount);
    console.log("Chunks (Embeddings):", chunksCount);
    console.log("==========================================");

    if (standardsCount === 0 || productsCount === 0) {
      console.warn("WARNING: DATABASE RECORD COUNT IS ZERO OR DECREASED DETECTED");
    }
  } catch (err: any) {
    console.error("Database Connection Failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
