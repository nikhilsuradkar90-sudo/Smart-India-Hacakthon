const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

const oldSemanticSearch = /export async function semanticSearch\([\s\S]*?\}\s*\} catch \(err\) \{/;

const newSemanticSearch = `let cachedChunks: any[] | null = null;
export async function semanticSearch(query: string, topK: number = 3) {
  try {
    const extractor = await getExtractor();
    const output = await extractor(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data) as number[];

    if (!cachedChunks) {
      cachedChunks = await prisma.documentChunk.findMany({
        where: { embedding: { not: null } },
        include: { document: true, page: true, section: true },
        take: 2000
      });
      // Pre-parse vectors to save CPU on every search
      cachedChunks = cachedChunks.map(c => ({
        ...c,
        parsedVector: JSON.parse(c.embedding!)
      }));
    }

    const scoredChunks = cachedChunks.map(chunk => {
      const score = cosineSimilarity(queryVector, chunk.parsedVector);
      return { ...chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    
    const threshold = 0.05; 
    return scoredChunks.filter(c => c.score >= threshold).slice(0, topK);
  } catch (err) {`;

code = code.replace(oldSemanticSearch, newSemanticSearch);

const oldProductsQuery = /const products = await prisma\.product\.findMany\(\{[\s\S]*?take: 100 \/\/ Prevent memory overload\n    \}\);/;

const newProductsQuery = `const products = await prisma.product.findMany({
      include: {
        scheme: { include: { requirements: true } },
        standard: true
      },
      take: 20 // Reduced from 100 to save memory
    });`;

code = code.replace(oldProductsQuery, newProductsQuery);

fs.writeFileSync('server/rag.ts', code);
