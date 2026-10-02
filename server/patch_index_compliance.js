const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

const importStatement = "import { upload, checkCompliance } from './compliance';";
if (!c.includes("checkCompliance")) {
    c = c.replace("import { unifiedSearch } from './search';", "import { unifiedSearch } from './search';\n" + importStatement);
}

const apiRoute = `
// --- AI COMPLIANCE CHECKER API ---
app.post('/api/compliance', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const standard = req.body.standard || 'General BIS Requirements';
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    const result = await checkCompliance(file.buffer, file.mimetype, standard);
    res.json(result);
  } catch (err: any) {
    console.error('Compliance API Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process document.' });
  }
});
`;

if (!c.includes("/api/compliance")) {
    c = c.replace("app.get('/api/search', async (req, res) => {", apiRoute + "\napp.get('/api/search', async (req, res) => {");
    fs.writeFileSync(p, c);
    console.log("Compliance API route added!");
} else {
    console.log("API route already exists or failed to patch.");
}
