import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// We need to find the block handling fake frontend industries and replace it.
const targetStart = "// HANDLE FAKE FRONTEND INDUSTRIES BY MAPPING TO SEARCH TEXT OR DEPARTMENTS";
const targetEnd = "let standards: any[] = [];";
const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const newIndustryLogic = `// HANDLE FAKE FRONTEND INDUSTRIES BY MAPPING TO SEARCH TEXT OR DEPARTMENTS
    let industryTextFilters: string[] = [];
    if (subGroup && subGroup !== 'All Industries') {
      const ind = subGroup.toLowerCase();
      
      // Map industry dropdowns to relevant keywords for text search
      if (ind.includes('manufacturing')) industryTextFilters.push('manufactur');
      else if (ind.includes('startup')) industryTextFilters.push('startup');
      else if (ind.includes('import')) industryTextFilters.push('import');
      else if (ind.includes('export')) industryTextFilters.push('export');
      else if (ind.includes('construction')) industryTextFilters.push('construction');
      else if (ind.includes('food')) industryTextFilters.push('food');
      else if (ind.includes('textile')) industryTextFilters.push('textile');
      else if (ind.includes('electronic')) industryTextFilters.push('electronic');
      else industryTextFilters.push(subGroup); // MSME etc
    }

    `;
    
    content = content.substring(0, startIndex) + newIndustryLogic + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Industry logic patched successfully!");
} else {
    console.log("Could not find the target block to patch!");
}
