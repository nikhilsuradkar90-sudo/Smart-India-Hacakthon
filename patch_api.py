with open('server/index.ts', 'r') as f:
    content = f.read()

lab_api = """// --- LABORATORIES API ---
app.get('/api/laboratories', async (req, res) => {
  const query = req.query.q as string;
  const state = req.query.state as string;
  const category = req.query.category as string;
  
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

    const laboratories = await prisma.laboratory.findMany({
      where: whereClause
    });
    
    res.json({ laboratories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/laboratories/:id', async (req, res) => {
  try {
    const lab = await prisma.laboratory.findUnique({
      where: { id: req.params.id }
    });
    if (!lab) return res.status(404).json({ error: 'Laboratory not found' });
    res.json(lab);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

"""

content = content.replace("const PORT = 3001;", lab_api + "const PORT = 3001;")

with open('server/index.ts', 'w') as f:
    f.write(content)
