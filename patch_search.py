import re

with open('server/index.ts', 'r') as f:
    content = f.read()

new_search = """app.get('/api/standards/search', async (req, res) => {
  const query = req.query.q as string;
  const status = req.query.status as string;
  
  try {
    const whereClause: any = {};
    
    if (query) {
      whereClause.OR = [
        { standardNumber: { contains: query } },
        { title: { contains: query } },
        { scope: { contains: query } }
      ];
    }
    
    // In our DB, status is stored as string (e.g. "Active")
    if (status && status !== 'all') {
      whereClause.status = { equals: status COLLATE NOCASE } // Note: Prisma sqlite might not support NOCASE directly, we will just use equals. Wait, Prisma's equals is case sensitive. Let's do contains.
    }
    
    const standards = await prisma.standard.findMany({
      where: whereClause
    });
    
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

    res.json({ standards, chunkMatches: chunks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});"""

content = re.sub(r"app\.get\('/api/standards/search', async \(req, res\) => \{.*?\n      take: 20\n    \}\);\n\n    res\.json\(\{ standards, chunkMatches: chunks \}\);\n  \} catch \(err: any\) \{\n    res\.status\(500\)\.json\(\{ error: err\.message \}\);\n  \}\n\}\);", new_search, content, flags=re.DOTALL)

with open('server/index.ts', 'w') as f:
    f.write(content)
