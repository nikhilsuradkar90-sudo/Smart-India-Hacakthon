import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function enrichLabs() {
  const labs = await prisma.laboratory.findMany();
  let updated = 0;
  
  for (const lab of labs) {
    const nameStr = lab.name.toLowerCase() + " " + (lab.address || "").toLowerCase();
    
    let scopes: string[] = [];
    if (nameStr.includes('food') || nameStr.includes('agro') || nameStr.includes('agri')) scopes.push('Food & Agriculture', 'Biological', 'Chemical');
    if (nameStr.includes('electric') || nameStr.includes('cable') || nameStr.includes('power') || nameStr.includes('electro')) scopes.push('Electrical & Electronics', 'Electrical');
    if (nameStr.includes('metal') || nameStr.includes('steel') || nameStr.includes('alloy')) scopes.push('Precious Metals', 'Mechanical', 'Physical');
    if (nameStr.includes('chemic') || nameStr.includes('pharm') || nameStr.includes('polymer') || nameStr.includes('plastic')) scopes.push('Chemicals & Plastics', 'Chemical');
    if (nameStr.includes('civil') || nameStr.includes('construct') || nameStr.includes('cement')) scopes.push('Building & Construction', 'Mechanical');
    if (nameStr.includes('textile') || nameStr.includes('yarn') || nameStr.includes('fabric')) scopes.push('Textiles', 'Physical');
    if (nameStr.includes('auto') || nameStr.includes('vehicle')) scopes.push('Automotive', 'Mechanical');
    if (nameStr.includes('environment') || nameStr.includes('water')) scopes.push('Biological', 'Chemical');
    if (nameStr.includes('microbio')) scopes.push('Microbiological');

    let uniqueScopes: string[] = [];
    for (const s of scopes) {
      if (!uniqueScopes.includes(s)) uniqueScopes.push(s);
    }

    if (uniqueScopes.length > 0) {
      await prisma.laboratory.update({
        where: { id: lab.id },
        data: {
          testingScope: uniqueScopes.join(', ')
        }
      });
      updated++;
    } else {
      await prisma.laboratory.update({
        where: { id: lab.id },
        data: {
          testingScope: 'Physical, Chemical, Mechanical'
        }
      });
      updated++;
    }
  }
  
  console.log(`Enriched ${updated} labs with realistic testing scopes based on names/addresses.`);
}

enrichLabs().catch(console.error);
