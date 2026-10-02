import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testSearch(queryStr: string) {
  const tokens = queryStr.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (tokens.length === 0) tokens.push(queryStr.toLowerCase());

  const candidates = await prisma.standard.findMany({
    where: {
      OR: tokens.flatMap(token => [
        { isNumber: { contains: token } },
        { title: { contains: token } },
        { technicalDepartment: { contains: token } },
        { sectionalCommittee: { contains: token } }
      ])
    },
    select: { id: true, isNumber: true, title: true, technicalDepartment: true, sectionalCommittee: true }
  });

  const scored = candidates.map(c => {
    let score = 0;
    const isNumLower = (c.isNumber || '').toLowerCase();
    const titleLower = (c.title || '').toLowerCase();
    const queryLower = queryStr.toLowerCase();

    if (isNumLower === queryLower || isNumLower.replace(/\s/g, '') === queryLower.replace(/\s/g, '')) {
      score += 1000;
    }
    if (isNumLower.includes(queryLower)) score += 500;
    
    if (titleLower === queryLower) score += 300;
    if (titleLower.includes(queryLower)) score += 150;

    tokens.forEach(token => {
      if (isNumLower.includes(token)) score += 50;
      if (titleLower.includes(token)) score += 30;
      if (c.technicalDepartment?.toLowerCase().includes(token)) score += 10;
      if (c.sectionalCommittee?.toLowerCase().includes(token)) score += 10;
    });

    return { id: c.id, score, isNumber: c.isNumber, title: c.title };
  });

  scored.sort((a, b) => b.score - a.score);
  
  console.log(`\n===========================================`);
  console.log(`SEARCH RESULTS FOR: "${queryStr}"`);
  console.log(`===========================================`);
  console.log(`Total Matches: ${scored.length}`);
  console.log(`Top 5 Results:`);
  scored.slice(0, 5).forEach((s, idx) => {
    console.log(`  ${idx + 1}. [Score: ${s.score}] ${s.isNumber} - ${s.title}`);
  });
}

async function run() {
  await testSearch('manufacturing');
  await testSearch('cement');
  await testSearch('water');
  await testSearch('electrical');
  await testSearch('IS 14543');
}

run();
