import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function unifiedSearch(query: string, limit = 20, offset = 0) {
  const queryLower = query.toLowerCase();

  // Search Standards
  const standards = await prisma.standard.findMany({
    where: {
      OR: [
        { isNumber: { contains: query } },
        { title: { contains: query } }
      ]
    },
    include: { groups: { include: { group: true } }, products: true },
    take: limit,
    skip: offset,
  });

  // Search Products (Certification)
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { category: { contains: query } }
      ]
    },
    include: { scheme: true, standard: true },
    take: limit,
    skip: offset,
  });

  // Search Laboratories
  const labs = await prisma.laboratory.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { testingScope: { contains: query } }
      ]
    },
    take: limit,
    skip: offset,
  });

  return {
    standards,
    products,
    laboratories: labs,
    totalResults: standards.length + products.length + labs.length
  };
}
