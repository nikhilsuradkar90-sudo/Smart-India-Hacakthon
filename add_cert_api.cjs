const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

const certApi = `
// --- CERTIFICATIONS API ---
app.get('/api/certifications', async (req, res) => {
  try {
    const q = req.query.q || '';
    
    // Search products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { standard: { isNumber: { contains: q } } }
        ]
      },
      include: {
        scheme: {
          include: { requirements: { orderBy: { order: 'asc' } } }
        },
        standard: true
      },
      take: 20
    });
    
    // Search schemes if q matches scheme name
    const schemes = await prisma.certificationScheme.findMany({
      where: { name: { contains: q } },
      include: { requirements: { orderBy: { order: 'asc' } } },
      take: 5
    });
    
    res.json({ products, schemes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});
`;

code = code.replace(
  '// --- LABORATORIES API ---',
  certApi + '\n// --- LABORATORIES API ---'
);

fs.writeFileSync('server/index.ts', code);
console.log('Added /api/certifications');
