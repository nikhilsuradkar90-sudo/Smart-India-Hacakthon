const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

const oldApi = `app.get('/api/certifications', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    
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
});`;

const newApi = `app.get('/api/certifications', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (q.trim()) {
      whereClause.OR = [
        { name: { contains: q } },
        { standard: { isNumber: { contains: q } } },
        { standard: { title: { contains: q } } },
        { category: { contains: q } }
      ];
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          scheme: {
            include: { requirements: { orderBy: { order: 'asc' } } }
          },
          standard: true
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where: whereClause })
    ]);
    
    res.json({ 
      products, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrevious: page > 1
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});`;

code = code.replace(oldApi, newApi);
fs.writeFileSync('server/index.ts', code);
