import re

with open('server/index.ts', 'r') as f:
    content = f.read()

# Replace the laboratories GET endpoint
old_api_regex = r"app\.get\('/api/laboratories', async \(req, res\) => \{.*?\n    res\.json\(\{ laboratories \}\);\n  \} catch \(err: any\) \{\n    res\.status\(500\)\.json\(\{ error: err\.message \}\);\n  \}\n\}\);"

new_api = """app.get('/api/laboratories', async (req, res) => {
  const query = req.query.q as string;
  const state = req.query.state as string;
  const category = req.query.category as string;
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  try {
    const whereClause: any = {};
    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { labCode: { contains: query } },
        { address: { contains: query } }
      ];
    }
    if (state && state !== 'All States') {
      whereClause.state = { contains: state };
    }
    if (category && category !== 'All Categories') {
      whereClause.category = { equals: category };
    }

    const total = await prisma.laboratory.count({ where: whereClause });
    const laboratories = await prisma.laboratory.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { labCode: 'asc' }
    });
    
    res.json({
      data: laboratories,
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
});"""

content = re.sub(old_api_regex, new_api, content, flags=re.DOTALL)

with open('server/index.ts', 'w') as f:
    f.write(content)
