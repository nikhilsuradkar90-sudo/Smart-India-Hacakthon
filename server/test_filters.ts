import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTest() {
    const group = "Electrical & Electronics";
    const subGroup = "Startups";
    const status = "Active";
    const search = "";
    
    const limit = 20;
    const skip = 0;
    
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

    let standards: any[] = [];
    let total = 0;

    let searchVal = search || '';
    if (industryTextFilters.length > 0) searchVal += ' ' + industryTextFilters.join(' ');
    
    if (!search && industryTextFilters.length === 0) {
      console.log("USING NORMAL PRISMA QUERY");
      console.log(JSON.stringify(baseWhereClause, null, 2));
      const res = await prisma.standard.findMany({ where: baseWhereClause, take: 5 });
      const c = await prisma.standard.count({ where: baseWhereClause });
      console.log("Count:", c);
    } else {
      console.log("USING RELEVANCE QUERY");
      
      const tokens = searchVal.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      if (tokens.length === 0) tokens.push(searchVal.toLowerCase());
      
      const searchWhereClause = {
        ...baseWhereClause,
        OR: tokens.flatMap(token => [
          { isNumber: { contains: token } },
          { title: { contains: token } },
          { technicalDepartment: { contains: token } },
          { sectionalCommittee: { contains: token } }
        ])
      };
      
      console.log(JSON.stringify(searchWhereClause, null, 2));

      const candidates = await prisma.standard.findMany({
        where: searchWhereClause,
        select: { id: true }
      });
      console.log("Count:", candidates.length);
    }
}
runTest();
