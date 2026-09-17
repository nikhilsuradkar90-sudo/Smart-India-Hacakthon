const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

const importStatement = `import { recommendStandards } from './recommendation';\n`;
if (!code.includes('recommendStandards')) {
    code = importStatement + code;
}

const apiEndpoint = `
// --- RECOMMENDATIONS API (Phase 5.1) ---
app.post('/api/recommendations', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const result = await recommendStandards(query);
    res.json(result);
  } catch (error: any) {
    console.error('Recommendation API error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});
`;

if (!code.includes('/api/recommendations')) {
    code = code.replace('// --- STANDARDS API ---', apiEndpoint + '\n// --- STANDARDS API ---');
    fs.writeFileSync('server/index.ts', code);
    console.log('Added /api/recommendations to server/index.ts');
}
