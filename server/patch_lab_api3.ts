import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const targetStart = "app.get('/api/laboratories', async (req, res) => {";
const targetEnd = "const total = await prisma.laboratory.count({ where: whereClause });";

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `app.get('/api/laboratories', async (req, res) => {
    const query = req.query.q as string;
    const state = req.query.state as string;
    const city = req.query.city as string;
    const category = req.query.category as string;
    const testType = req.query.testType as string;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    try {
      const whereClause: any = { AND: [] };
      
      if (state && state !== 'All States') {
        const searchState = state === 'Delhi NCR' ? 'Delhi' : state;
        whereClause.AND.push({ state: { contains: searchState } });
      }
      
      if (city) {
        whereClause.AND.push({ address: { contains: city } });
      }
      
      let textFilters: string[] = [];
      
      if (query) {
        // Simple tokenization for query to allow searching "IS 14543 water"
        const tokens = query.split(/\\s+/).filter(t => t.length > 2);
        if (tokens.length > 0) {
          textFilters.push(...tokens);
        } else {
          textFilters.push(query);
        }
      }
      
      if (category && category !== 'All Categories') {
        const c = category.toLowerCase();
        if (c.includes('electrical') || c.includes('electronic')) textFilters.push('electric');
        else if (c.includes('food') || c.includes('agriculture')) textFilters.push('food');
        else if (c.includes('chemical') || c.includes('plastic')) textFilters.push('chemical');
        else if (c.includes('building') || c.includes('civil') || c.includes('construction')) textFilters.push('civil');
        else if (c.includes('textile')) textFilters.push('textile');
        else if (c.includes('automotive')) textFilters.push('auto');
        else if (c.includes('mechanical')) textFilters.push('mechanic');
        else if (c.includes('consumer')) textFilters.push('consumer');
        else if (c.includes('metal')) textFilters.push('metal');
        else textFilters.push(category);
      }
      
      if (testType && testType !== 'All Test Types') {
        const t = testType.toLowerCase();
        if (t.includes('chemical')) textFilters.push('chemical');
        else if (t.includes('electrical')) textFilters.push('electric');
        else if (t.includes('mechanical')) textFilters.push('mechanic');
        else if (t.includes('microbiological')) textFilters.push('microbio');
        else if (t.includes('biological')) textFilters.push('bio');
        else if (t.includes('physical')) textFilters.push('physic');
        else textFilters.push(testType);
      }

      textFilters.forEach(text => {
        whereClause.AND.push({
          OR: [
            { name: { contains: text } },
            { address: { contains: text } },
            { category: { contains: text } },
            { testingScope: { contains: text } }
          ]
        });
      });

      if (whereClause.AND.length === 0) {
        delete whereClause.AND;
      }
  
      `;
      
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Laboratory API patched successfully for City and Standard search!");
} else {
    console.log("Could not find the target block to patch!");
}
