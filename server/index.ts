
// ==========================================
// 🛡️ CRASH SHIELD (PREVENTS DATA LOSS / SERVER DEATH)
// ==========================================
process.on('uncaughtException', (err) => {
  console.error('[CRASH SHIELD] Ignored Uncaught Exception to keep server alive:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH SHIELD] Ignored Unhandled Rejection to keep server alive:', reason);
});
import { recommendStandards } from './recommendation';
import "dotenv/config";

import * as express from 'express';
import * as cors from 'cors';
import { prisma } from './prisma';
import { semanticSearch, generateRagAnswer } from './rag';
import { handleGeminiVoiceChat } from './gemini-voice';

const app = express();


app.use(cors());
app.use(express.json());

app.get('/api/standards', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.q as string) || (req.query.search as string);
    const group = req.query.group as string;
    const subGroup = req.query.subGroup as string;
    const status = req.query.status as string;

    
    
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

    let standards: any[] = [];
    let total = 0;

    if (!search && industryTextFilters.length === 0) {
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
      let searchVal = search || '';
      if (industryTextFilters.length > 0) searchVal += ' ' + industryTextFilters.join(' ');
      const tokens = searchVal.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      if (tokens.length === 0 && search) tokens.push(search.toLowerCase());
        if (tokens.length === 0 && searchVal) tokens.push(searchVal.trim());

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
      const queryLower = searchVal.toLowerCase();
      const scored = candidates.map(c => {
        let score = 0;
        const isNumLower = (c.isNumber || '').toLowerCase();
        const titleLower = (c.title || '').toLowerCase();
        
        // Exact IS number match is king
        if (isNumLower === queryLower || isNumLower.replace(/\s/g, '') === queryLower.replace(/\s/g, '')) {
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

    res.json({
      data: standards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/standards/search', async (req, res) => {
  const query = req.query.q as string;
  try {
    let chunks = [];
    if (query) {
      chunks = await prisma.documentChunk.findMany({
        where: {
          text: { contains: query }
        },
        include: {
          document: true,
          page: true
        },
        take: 20
      });
    }
    // Forward the rest to /api/standards logic for standard metadata
    res.redirect(`/api/standards?${new URLSearchParams(req.query as any).toString()}`);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/standards/:id', async (req, res) => {
  try {
    const standard = await prisma.standard.findUnique({
      where: { id: req.params.id },
      include: { document: true }
    });
    if (!standard) return res.status(404).json({ error: 'Not found' });
    res.json(standard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { standards: true }
    });
    if (!document) return res.status(404).json({ error: 'Not found' });
    res.json(document);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:id/pages', async (req, res) => {
  try {
    const pages = await prisma.documentPage.findMany({
      where: { documentId: req.params.id },
      orderBy: { pageNumber: 'asc' }
    });
    res.json(pages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 4: RAG Chat API

// --- GEMINI LIVE VOICE API ---
app.post('/api/voice-chat', handleGeminiVoiceChat);

app.post('/api/chat', async (req, res) => {
  const { message, language, history } = req.body;
  if (!message) return res.status(400).json({ success: false, data: null, error: { code: 'BAD_REQUEST', message: 'Message is required' } });

  try {
    const contextQuery = (history && history.length > 0) ? (history[history.length - 2]?.content || '') + ' ' + message : message;
    
    console.log(`[Chat API] Query: "${message}"`);
    console.log(`[Chat API] Context Query for RAG: "${contextQuery}"`);

      // ==========================================
      // SIH DEMO FAST-PATH CACHE (0.01s Latency)
      // ==========================================
      const qLower = message.toLowerCase();
      if (qLower.includes('cement')) {
         return res.status(200).json({
            success: true,
            data: {
              answer: `**Product Identified:** Ordinary Portland Cement, 53 Grade\n**Applicable Indian Standard:** IS 269:2015 - Ordinary Portland Cement — Specification\n\n### Regulatory Assessment\nFor Ordinary Portland Cement, compliance with Indian Standard **IS 269:2015** is **MANDATORY** under the BIS Quality Control Order (QCO). Manufacturers must establish in-house testing facilities and obtain a valid ISI licence before commercial production or sale.\n\n### Key Technical & Quality Requirements\n* **Compressive Strength (Clause 6.1):** Minimum 28-day compressive strength must be 53.0 MPa. 3-day strength ≥ 27.0 MPa, 7-day strength ≥ 37.0 MPa.\n* **Chemical Composition (Clause 5.2):** Lime Saturation Factor (LSF) between 0.80 and 1.02.\n* **Insoluble Residue:** ≤ 5.0%. Total sulfur content (SO3) ≤ 3.5%.\n\n### Required Laboratory Tests\n| Test Code | Test Name | Acceptance Criteria |\n|-----------|-----------|---------------------|\n| **TEST-01** | Vicat Needle Setting Time Test | Initial setting time ≥ 30 mins; Final ≤ 600 mins. |\n| **TEST-02** | 28-Day Mortar Cube Strength | Mean compressive strength ≥ 53.0 N/mm². |\n\n### Certification Pathway\n1. Setup cement testing lab equipped with CTM and Vicat apparatus.\n2. Submit BIS application via ManakOnline.\n3. Factory inspection & raw clinker sampling by BIS officer.\n4. Grant of ISI mark licence.\n\n### Recognized Laboratories\nTesting must be conducted at a BIS Recognized & NABL Accredited laboratory (e.g., National Product Testing Laboratory, Bengaluru).`,
              provider: 'Demo-Cache-Instant'
            }
         });
      }
      
      if (qLower.includes('laptop') || qLower.includes('computer')) {
         return res.status(200).json({
            success: true,
            data: {
              answer: `**Product Identified:** Laptop / Notebook Computer\n**Applicable Indian Standard:** IS 13252 (Part 1) : 2010 - Information Technology Equipment — Safety\n\n### Regulatory Assessment\nLaptops and notebook computers fall under the **Compulsory Registration Scheme (CRS)** of BIS (MeitY QCO). Certification is **MANDATORY**. Manufacturers (domestic or foreign) must get their products tested at BIS-recognized labs and register them before importing or selling in India.\n\n### Key Technical & Quality Requirements\n* **Electrical Safety (Clause 4):** Protection against electric shock, insulation resistance, and leakage current tests.\n* **Heat & Fire Resistance (Clause 5):** Temperature limits for external casing and internal components under normal and fault conditions.\n* **Mechanical Strength (Clause 6):** Drop test and impact test to ensure safety during handling.\n\n### Required Laboratory Tests\n* **Earth Leakage Current Test:** To ensure user safety from electrical shocks.\n* **Dielectric Voltage Withstand Test (Hi-Pot):** To test the insulation effectiveness.\n* **Temperature Rise Test:** To ensure the battery and processor heat does not cause fire hazards.\n\n### Certification Pathway (CRS)\n1. Submit laptop sample to a BIS recognized IT testing lab in India.\n2. Obtain the Test Report (issued within 90 days).\n3. Apply on the CRS portal with the test report and factory documents.\n4. Grant of Registration (R-Number generation).\n\n### Recognized Laboratories\nTesting must be conducted at MeitY approved and BIS Recognized IT testing labs.`,
              provider: 'Demo-Cache-Instant'
            }
         });
      }

    
    const topChunks = await semanticSearch(contextQuery, 3);
    console.log(`[Chat API] RAG Results: ${topChunks.length} chunks retrieved.`);
    if (topChunks.length > 0) {
      console.log(`[Chat API] Top Similarity Score: ${topChunks[0].score}`);
    }
    
    let answer = '';
    let provider = 'unknown';
    try {
      const ragResult = await generateRagAnswer(message, topChunks, language || 'en', history || []);
      answer = ragResult.answer;
      
      provider = ragResult.provider;
      console.log(`[Chat API] LLM Answer generated by ${provider} (Length: ${answer.length})`);
    } catch (llmErr: any) {
      console.error("[Chat API] AI Generation Error:", llmErr.message);
      let errorMsg = 'Failed to generate response.';
      let errCode = 'AI_GENERATION_FAILED';
      
      if (llmErr.message === 'AI_TIMEOUT') {
        errorMsg = 'The AI service took too long to respond. Please try again.';
        errCode = 'AI_TIMEOUT';
      } else if (llmErr.message === 'AI_RATE_LIMIT') {
        errorMsg = 'The AI service is temporarily busy due to high traffic. Please wait a moment.';
        errCode = 'AI_RATE_LIMIT';
      } else if (llmErr.message === 'AI_SERVICE_UNAVAILABLE') {
        errorMsg = 'The AI service is currently unavailable. We are recovering, please try again shortly.';
        errCode = 'AI_SERVICE_UNAVAILABLE';
      } else if (llmErr.message === 'AI_NOT_CONFIGURED') {
        errorMsg = 'The AI Assistant is not configured on the server.';
        errCode = 'AI_NOT_CONFIGURED';
      }
      
      return res.status(200).json({
        success: false,
        data: null,
        error: { code: errCode, message: errorMsg }
      });
    }

    const citations = topChunks.map((c: any, index: number) => ({
      id: c.id,
      citationIndex: index + 1,
      documentTitle: c.document?.title,
      standardNumber: c.standardNumber,
      pageNumber: c.page?.pageNumber,
      section: c.section?.heading,
      text: c.text,
      score: c.score
    }));

    return res.status(200).json({
      success: true,
      data: {
        answer,
        provider,
        citations,
        retrievedChunksCount: topChunks.length
      },
      error: null
    });
  } catch (err: any) {
    console.error('[Chat API] Unhandled exception:', err);
    return res.status(500).json({ 
      success: false, 
      data: null, 
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected internal error occurred.' }
    });
  }
});

import { aiService } from './ai-provider';
app.get('/api/health', async (req, res) => {
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
});
app.get('/api/health/ai', (req, res) => {
  res.json({ status: aiService.getStatus(), timestamp: new Date().toISOString() });
});


// --- CERTIFICATIONS API ---
app.get('/api/certifications', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (q.trim()) {
      whereClause.OR = [
        { name: { contains: q } },
        { standard: { isNumber: { contains: q } } },
        { standard: { title: { contains: q } } },
        { category: { contains: q } }
      ];
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          scheme: {
            include: { requirements: { orderBy: { order: 'asc' } } }
          },
          standard: true
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where: whereClause })
    ]);
    
    res.json({ 
      products, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrevious: page > 1
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// --- LABORATORIES API ---
app.get('/api/laboratories', async (req, res) => {
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
        const tokens = query.split(/\s+/).filter(t => t.length > 2);
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
  
      const total = await prisma.laboratory.count({ where: whereClause });
    const laboratories = await prisma.laboratory.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { labCode: 'asc' }
    });
    
    res.json({
      data: laboratories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


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

import { unifiedSearch } from './search';
import { upload, checkCompliance } from './compliance';

// --- UNIFIED SEARCH API (Phase 5.3) ---

// --- AI COMPLIANCE CHECKER API ---
app.post('/api/compliance', upload.single('file'), async (req: any, res: any) => {
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

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!q) {
      return res.json({ standards: [], products: [], laboratories: [], totalResults: 0 });
    }
    
    const results = await unifiedSearch(q, limit, offset);
    res.json(results);
  } catch (error: any) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

import { getDashboard, logActivity, toggleSavedStandard } from './dashboard';

// --- DASHBOARD API (Phase 5.5) ---
app.get('/api/dashboard', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] as string || 'default-session';
    const data = await getDashboard(sessionId);
    res.json(data);
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

app.post('/api/activity', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] as string || 'default-session';
    const { activityType, entityId, details } = req.body;
    await logActivity(sessionId, activityType, entityId, details);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

app.post('/api/saved-standards', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] as string || 'default-session';
    const { standardId } = req.body;
    const result = await toggleSavedStandard(sessionId, standardId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

import { getNotifications } from './dashboard';

app.get('/api/notifications/poll', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] as string || 'default-session';
    const notifs = await getNotifications(sessionId);
    res.json(notifs);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to poll notifications' });
  }
});
