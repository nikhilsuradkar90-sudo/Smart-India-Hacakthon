import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const oldSearchBlock = `
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { isNumber: { contains: search } },
        { title: { contains: search } },
        { technicalDepartment: { contains: search } },
        { sectionalCommittee: { contains: search } }
      ];
    }
    
    if (status && status !== 'all' && status !== 'All') {
      whereClause.status = { contains: status };
    }
    
    if (group) {
      whereClause.groups = {
        some: {
          group: { name: group }
        }
      };
    }
    
    if (subGroup) {
      whereClause.subGroups = {
        some: {
          subGroup: { name: subGroup }
        }
      };
    }
    
    const [standards, total] = await Promise.all([
      prisma.standard.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { isNumber: 'asc' },
        include: { groups: { include: { group: true } }, subGroups: { include: { subGroup: true } } }
      }),
      prisma.standard.count({ where: whereClause })
    ]);
`;

const newSearchBlock = `
    const skip = (page - 1) * limit;
    
    const baseWhereClause: any = {};
    
    if (status && status !== 'all' && status !== 'All') {
      baseWhereClause.status = { contains: status };
    }
    if (group) {
      baseWhereClause.groups = {
        some: { group: { name: group } }
      };
    }
    if (subGroup) {
      baseWhereClause.subGroups = {
        some: { subGroup: { name: subGroup } }
      };
    }

    let standards: any[] = [];
    let total = 0;

    if (!search) {
      // Normal DB pagination when there is NO text search
      [standards, total] = await Promise.all([
        prisma.standard.findMany({
          where: baseWhereClause,
          skip,
          take: limit,
          orderBy: { isNumber: 'asc' },
          include: { groups: { include: { group: true } }, subGroups: { include: { subGroup: true } } }
        }),
        prisma.standard.count({ where: baseWhereClause })
      ]);
    } else {
      // Relevance-Based Search Logic
      const tokens = search.toLowerCase().split(/\\s+/).filter(t => t.length > 2);
      if (tokens.length === 0) tokens.push(search.toLowerCase());

      const searchWhereClause = {
        ...baseWhereClause,
        OR: tokens.flatMap(token => [
          { isNumber: { contains: token } },
          { title: { contains: token } },
          { technicalDepartment: { contains: token } },
          { sectionalCommittee: { contains: token } }
        ])
      };

      // 1. Fetch Candidates (fast)
      const candidates = await prisma.standard.findMany({
        where: searchWhereClause,
        select: { id: true, isNumber: true, title: true, technicalDepartment: true, sectionalCommittee: true }
      });

      // 2. Score & Rank (in-memory)
      const queryLower = search.toLowerCase();
      const scored = candidates.map(c => {
        let score = 0;
        const isNumLower = (c.isNumber || '').toLowerCase();
        const titleLower = (c.title || '').toLowerCase();
        
        // Exact IS number match is king
        if (isNumLower === queryLower || isNumLower.replace(/\\s/g, '') === queryLower.replace(/\\s/g, '')) {
          score += 1000;
        }
        if (isNumLower.includes(queryLower)) score += 500;
        
        // Exact title match is great
        if (titleLower === queryLower) score += 300;
        if (titleLower.includes(queryLower)) score += 150;
        
        // Token matches
        tokens.forEach(token => {
          if (isNumLower.includes(token)) score += 50;
          if (titleLower.includes(token)) score += 30;
          if ((c.technicalDepartment || '').toLowerCase().includes(token)) score += 10;
          if ((c.sectionalCommittee || '').toLowerCase().includes(token)) score += 10;
        });
        
        return { id: c.id, score };
      });

      // Filter out low scores if we want, or just sort
      scored.sort((a, b) => b.score - a.score);
      total = scored.length;

      // 3. Paginate
      const pagedIds = scored.slice(skip, skip + limit).map(s => s.id);

      // 4. Fetch full records for the paginated slice
      const rawStandards = await prisma.standard.findMany({
        where: { id: { in: pagedIds } },
        include: { groups: { include: { group: true } }, subGroups: { include: { subGroup: true } } }
      });

      // 5. Restore sorted order
      standards = pagedIds.map(id => rawStandards.find(s => s.id === id)).filter(Boolean);
    }
`;

if (content.includes("whereClause.OR = [")) {
    // Basic formatting replacement
    // To be safe against indentation issues, we will just use regex to replace everything between 'const skip =' and 'res.json({'
    const startIndex = content.indexOf("const skip = (page - 1) * limit;");
    const endIndex = content.indexOf("res.json({", startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const pre = content.substring(0, startIndex);
        const post = content.substring(endIndex);
        content = pre + newSearchBlock + "\n    " + post;
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log("Patch applied successfully by regex slicing!");
    } else {
        console.log("Regex slicing failed to find anchors");
    }
} else {
    console.log("Could not find the target block to patch!");
}
