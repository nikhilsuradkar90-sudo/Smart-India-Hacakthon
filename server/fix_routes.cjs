const fs = require('fs');

let content = fs.readFileSync('index.ts', 'utf-8');

// Find the start of /api/standards
const startIdx = content.indexOf("app.get('/api/standards',");
// Find the end of /api/standards/search route
const endSearchIdx = content.indexOf("app.get('/api/standards/:id',");

if (startIdx !== -1 && endSearchIdx !== -1) {
  const replacement = `app.get('/api/standards', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.q as string) || (req.query.search as string);
    const group = req.query.group as string;
    const subGroup = req.query.subGroup as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { isNumber: { contains: search } },
        { title: { contains: search } },
        { technicalDepartment: { contains: search } },
        { sectionalCommittee: { contains: search } }
      ];
    }
    
    if (status && status !== 'all' && status !== 'All') {
      whereClause.status = { contains: status };
    }
    
    if (group) {
      whereClause.groups = {
        some: {
          group: { name: group }
        }
      };
    }
    
    if (subGroup) {
      whereClause.subGroups = {
        some: {
          subGroup: { name: subGroup }
        }
      };
    }
    
    const [standards, total] = await Promise.all([
      prisma.standard.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { isNumber: 'asc' },
        include: { groups: { include: { group: true } }, subGroups: { include: { subGroup: true } } }
      }),
      prisma.standard.count({ where: whereClause })
    ]);
    
    res.json({
      data: standards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/standards/search', async (req, res) => {
  const query = req.query.q as string;
  try {
    let chunks = [];
    if (query) {
      chunks = await prisma.documentChunk.findMany({
        where: {
          text: { contains: query }
        },
        include: {
          document: true,
          page: true
        },
        take: 20
      });
    }
    // Forward the rest to /api/standards logic for standard metadata
    res.redirect(\`/api/standards?\${new URLSearchParams(req.query as any).toString()}\`);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

`;
  
  content = content.substring(0, startIdx) + replacement + content.substring(endSearchIdx);
  fs.writeFileSync('index.ts', content);
  console.log("Fixed successfully.");
} else {
  console.log("Could not find boundaries.");
}
