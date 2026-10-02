import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const newSearchBlock = `
    const skip = (page - 1) * limit;
    
    const baseWhereClause: any = {};
    
    if (status && status !== 'all' && status !== 'All') {
      if (status.toLowerCase() === 'active') {
        baseWhereClause.status = { in: ['Active', 'active', 'Published', 'published'] };
      } else {
        baseWhereClause.status = { contains: status };
      }
    }

    // MAP FAKE FRONTEND CATEGORIES TO REAL DATABASE DEPARTMENTS
    if (group && group !== 'All Categories') {
      const g = group.toLowerCase();
      let deptMatch = group;
      if (g.includes('electrical') || g.includes('electronic')) deptMatch = 'ELECTRONICS';
      if (g.includes('food') || g.includes('agriculture')) deptMatch = 'FOOD AND AGRICULTURE';
      if (g.includes('chemical') || g.includes('plastic')) deptMatch = 'CHEMICAL';
      if (g.includes('building') || g.includes('construction') || g.includes('civil')) deptMatch = 'CIVIL ENGINEERING';
      if (g.includes('textile')) deptMatch = 'TEXTILE';
      if (g.includes('automotive')) deptMatch = 'TRANSPORT';
      if (g.includes('mechanical')) deptMatch = 'MECHANICAL';
      if (g.includes('consumer')) deptMatch = 'PRODUCTION';
      if (g.includes('metal')) deptMatch = 'METALLURGICAL';
      
      baseWhereClause.technicalDepartment = { contains: deptMatch };
    }

    // HANDLE FAKE FRONTEND INDUSTRIES BY MAPPING TO SEARCH TEXT OR DEPARTMENTS
    let industryTextFilters: string[] = [];
    if (subGroup && subGroup !== 'All Industries') {
      const ind = subGroup.toLowerCase();
      if (ind === 'msme' || ind === 'startups' || ind === 'importers' || ind === 'exporters') {
        industryTextFilters.push(subGroup);
      } else {
        let deptMatch = null;
        if (ind.includes('manufacturing')) deptMatch = 'PRODUCTION';
        if (ind.includes('construction')) deptMatch = 'CIVIL ENGINEERING';
        if (ind.includes('food')) deptMatch = 'FOOD AND AGRICULTURE';
        if (ind.includes('textile')) deptMatch = 'TEXTILE';
        if (ind.includes('electronic')) deptMatch = 'ELECTRONICS';
        
        if (deptMatch) {
          if (baseWhereClause.technicalDepartment) {
            baseWhereClause.AND = [
              { technicalDepartment: baseWhereClause.technicalDepartment },
              { technicalDepartment: { contains: deptMatch } }
            ];
            delete baseWhereClause.technicalDepartment;
          } else {
            baseWhereClause.technicalDepartment = { contains: deptMatch };
          }
        }
      }
    }
`;

const startIndex = content.indexOf("const skip = (page - 1) * limit;");
const endIndex = content.indexOf("let standards: any[] = [];", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const pre = content.substring(0, startIndex);
    const post = content.substring(endIndex);
    content = pre + newSearchBlock + "\n    " + post;
    
    // Patch text search logic to include industry text for fake tags
    const tokenLogicTarget = "const tokens = search.toLowerCase().split(/\\s+/).filter(t => t.length > 2);";
    const tokenLogicReplacement = `let searchVal = search || '';
      if (industryTextFilters.length > 0) searchVal += ' ' + industryTextFilters.join(' ');
      const tokens = searchVal.toLowerCase().split(/\\s+/).filter(t => t.length > 2);`;
    
    const noSearchTarget = "if (!search) {";
    const noSearchReplacement = "if (!search && industryTextFilters.length === 0) {";
    
    // Also we need to make sure the scoring algorithm replaces `search.toLowerCase()` with `searchVal.toLowerCase()`
    const scoringTarget = "const queryLower = search.toLowerCase();";
    const scoringReplacement = "const queryLower = searchVal.toLowerCase();";

    content = content.replace(tokenLogicTarget, tokenLogicReplacement);
    content = content.replace(noSearchTarget, noSearchReplacement);
    content = content.replace(scoringTarget, scoringReplacement);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Filters patched successfully!");
} else {
    console.log("Could not find the target block to patch!");
}
