import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all standards
  const standards = await prisma.standard.findMany();
  
  // Get all labs
  const labs = await prisma.laboratory.findMany();
  
  let count = 0;
  
  // Connect random labs to standards just based on string matching
  for (const lab of labs) {
    if (!lab.testingScope) continue;
    
    const scopeLower = lab.testingScope.toLowerCase();
    
    // Check which standard is in the scope
    for (const std of standards) {
      if (scopeLower.includes(std.isNumber.toLowerCase()) || 
          (std.title && scopeLower.includes(std.title.toLowerCase().split(' ')[0]))) {
          
          try {
            await prisma.laboratoryStandardRelation.create({
              data: {
                laboratoryId: lab.id,
                standardId: std.id
              }
            });
            count++;
          } catch (e) {
            // ignore unique constraint errors
          }
      }
    }
  }
  
  console.log(`Created ${count} Lab-Standard relations`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
