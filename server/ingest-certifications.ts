import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Starting BIS Certification Data Ingestion...');

  let scheme1 = await prisma.certificationScheme.findFirst({ where: { name: { contains: 'Scheme-I' } } });
  let scheme2 = await prisma.certificationScheme.findFirst({ where: { name: { contains: 'Scheme-II' } } });

  console.log('Fetching all standards from database...');
  const standards = await prisma.standard.findMany();
  const existingProducts = await prisma.product.findMany({ select: { name: true, standardId: true } });
  const existingProductsMap = new Map(existingProducts.map(p => [p.name + p.standardId, true]));
  console.log(`Found ${standards.length} standards. Mapping to products...`);

    console.log('Cleared old product records.');

  let inserted = 0;
  // Doing it sequentially with a transaction
  const ops = [];
  for (const std of standards) {
    const title = std.title.toLowerCase();
    
    let assignedSchemeId = scheme1!.id;
    let isCompulsory = false;

    if (
      title.includes('information technology') ||
      title.includes('audio, video') ||
      title.includes('battery') ||
      title.includes('secondary cells') ||
      title.includes('photovoltaic') ||
      title.includes('led luminaires') ||
      title.includes('smart meter')
    ) {
      assignedSchemeId = scheme2!.id;
      isCompulsory = true; 
    } else if (
      title.includes('cement') ||
      title.includes('steel') ||
      title.includes('toys') ||
      title.includes('drinking water') ||
      title.includes('pressure cooker') ||
      title.includes('helmet')
    ) {
      assignedSchemeId = scheme1!.id;
      isCompulsory = true; 
    }

    ops.push(
      prisma.product.create({
        data: {
          name: std.title,
          category: isCompulsory ? 'Compulsory' : 'Voluntary',
          schemeId: assignedSchemeId,
          standardId: std.id
        }
      })
    );
  }

  console.log('Executing bulk insert via Promise.all (chunked)...');
  const chunkSize = 500;
  for (let i = 0; i < ops.length; i += chunkSize) {
    await Promise.all(ops.slice(i, i + chunkSize));
    if ((i + chunkSize) % 5000 === 0) console.log(`Processed ${i + chunkSize}`);
  }

  console.log('BIS Certification Data Ingestion Complete!');
  const total = await prisma.product.count();
  console.log(`Total Products in DB: ${total}`);
}

run()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
