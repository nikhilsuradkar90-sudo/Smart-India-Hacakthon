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
    const category = req.query.category as string;
    const testType = req.query.testType as string;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    try {
      const whereClause: any = { AND: [] };
      
      if (state && state !== 'All States') {
        whereClause.AND.push({ state: { contains: state } });
      }
      
      // We will build a text search array to ensure we match all requested keywords across name/address
      let textFilters: string[] = [];
      
      if (query) {
        textFilters.push(query);
      }
      
      // Map fake UI category to text search
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
      
      // Map fake UI testType to text search
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

      // Add text filters as AND conditions so all chosen filters must be matched
      textFilters.forEach(text => {
        whereClause.AND.push({
          OR: [
            { name: { contains: text } },
            { address: { contains: text } },
            { category: { contains: text } }
          ]
        });
      });

      // If nothing was added to AND, delete it to avoid Prisma error
      if (whereClause.AND.length === 0) {
        delete whereClause.AND;
      }
  
      `;
      
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Laboratory API patched successfully!");
} else {
    console.log("Could not find the target block to patch!");
}
