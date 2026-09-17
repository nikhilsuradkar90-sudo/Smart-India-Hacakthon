const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

const oldHealth = /app\.get\('\/api\/health', \(req, res\) => \{\n  res\.json\(\{ status: 'ok', timestamp: new Date\(\)\.toISOString\(\) \}\);\n\}\);/;

const newHealth = `app.get('/api/health', async (req, res) => {
  try {
    const standards = await prisma.standard.count();
    const certifications = await prisma.product.count();
    const laboratories = await prisma.laboratory.count();
    res.json({
      database: 'connected',
      standards,
      certifications,
      laboratories,
      timestamp: new Date().toISOString()
    });
  } catch(e) {
    res.status(500).json({ database: 'disconnected', error: 'Database unavailable' });
  }
});`;

code = code.replace(oldHealth, newHealth);
fs.writeFileSync('server/index.ts', code);
