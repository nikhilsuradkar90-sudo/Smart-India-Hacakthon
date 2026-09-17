import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { pipeline, env } from '@xenova/transformers';
import { aiService, ChatMessage } from './ai-provider';

// Prevent Prisma connection dropping/hanging completely


env.allowLocalModels = false;
env.useBrowserCache = false;

let extractorPromise: any = null;
function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPromise;
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

let cachedChunks: any[] | null = null;
export async function semanticSearch(query: string, topK: number = 3) {
  try {
    const extractor = await getExtractor();
    const output = await extractor(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data) as number[];

    if (!cachedChunks) {
      cachedChunks = await prisma.documentChunk.findMany({
        where: { embedding: { not: null } },
        include: { document: true, page: true }
      });
    }

    const scoredChunks = cachedChunks.map((chunk: any) => {
      try {
        const chunkEmbedding = JSON.parse(chunk.embedding);
        const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
        return { ...chunk, score };
      } catch (e) {
        return { ...chunk, score: 0 };
      }
    });

    scoredChunks.sort((a: any, b: any) => b.score - a.score);
    return scoredChunks.slice(0, topK);
  } catch (err) {
    console.error("Semantic search failed (DB or Embedding issue):", err);
    return [];
  }
}

export async function generateRagAnswer(query: string, chunks: any[], language: string = 'en', history: any[] = []) {
  let structuredContext = '';
  
  try {
    const contextQuery = history.length > 0 ? (history[history.length - 2]?.content || '') + ' ' + query : query;
    const queryLower = contextQuery.toLowerCase();
    
    // 1. Exact IS Number Search
    const isNumberMatch = queryLower.match(/(?:is|iec)\s*-?\s*(\d+)/i);
    let matchedStandard = null;
    if (isNumberMatch) {
      const num = isNumberMatch[1];
      matchedStandard = await prisma.standard.findFirst({
        where: {
          isNumber: { contains: num }
        }
      });
      if (matchedStandard) {
        structuredContext += `\n[STRUCTURED DB: STANDARD]\nNumber: ${matchedStandard.isNumber}\nTitle: ${matchedStandard.title}\nStatus: ${matchedStandard.status}\nYear: ${matchedStandard.year}\n`;
      }
    }

    // 2. Exact Lab Search
    if (queryLower.includes('lab') || queryLower.includes('testing')) {
      const labs = await prisma.laboratory.findMany({
        take: 3
      });
      if (labs.length > 0) {
        structuredContext += `\n[STRUCTURED DB: LABORATORIES (Sample)]\n`;
        labs.forEach(lab => {
          structuredContext += `Lab: ${lab.name} (${lab.labCode}), City: ${lab.city}, Scope: ${lab.testingScope}\n`;
        });
      }
    }
    
    // 3. Product Search
    const products = await prisma.product.findMany({
      where: {
        name: { contains: queryLower.length > 4 ? queryLower.substring(0, 10) : queryLower }
      },
      include: {
        scheme: { include: { requirements: true } },
        standard: true
      },
      take: 2 
    });

    if (products.length > 0) {
      structuredContext += "\n[STRUCTURED DB: PRODUCTS & CERTIFICATION]\n";
      products.forEach(p => {
        structuredContext += `Product: ${p.name}\nStandard: ${p.standard?.isNumber || 'Unknown'}\nScheme: ${p.scheme?.name || 'N/A'}\nDetails: ${p.scheme?.description || 'N/A'}\n`;
      });
    }
  } catch (dbErr) {
    console.error("Structured DB retrieval failed:", dbErr);
  }

  const contextStr = structuredContext + '\n\n' + chunks.map((c, i) => {
    return `[Citation ${i + 1}] Source: ${c.document?.title || 'Unknown'}, Standard: ${c.standardNumber || 'N/A'}, Page: ${c.page?.pageNumber || 'N/A'}
Text: ${c.text}`;
  }).join('\n\n');

let systemPrompt = `You are the BIS (Bureau of Indian Standards) AI Assistant, an expert, multilingual, and helpful assistant.

INSTRUCTIONS:
1. FORMATTING (CRITICAL): You MUST format your response clearly using Markdown. DO NOT write long unbroken paragraphs. Use bullet points for lists. You MUST separate different points or paragraphs using double line breaks (\\n\\n). 
2. INTENT: Determine if the user is asking a general conversation question, a general BIS concept question, a translation/summary request, or a highly specific BIS technical question (like details of a specific IS number).
3. GENERAL & CONCEPTUAL QUESTIONS: For general questions about BIS (e.g., "What is BIS?", "What is the certification price/fees?", "How does hallmarking work?"), respond naturally and helpfully using your general knowledge. Give them a helpful overview or estimate of how it works. If using general knowledge instead of retrieved documents, you may mention that exact details depend on the specific product.
4. SPECIFIC TECHNICAL QUESTIONS: For questions about specific standard numbers (e.g., IS 13252) or specific rules for a product, rely STRICTLY on the [RETRIEVED CONTEXT] below. Do not invent standard clauses.
5. SOURCE GROUNDING: If you use the retrieved context, cite your sources using [Citation N] or by mentioning the standard/lab name from the DB records.
6. MISSING INFO: If the user asks about a SPECIFIC standard, product, or laboratory, and it cannot be answered using the context, state: "I could not verify this specific BIS detail from the available official sources." Do NOT use this fallback for general conceptual questions or general fee questions. Give them a helpful overview instead!
7. MULTILINGUAL: Automatically detect the language of the user's query and respond in that same language (Hindi, Marathi, Tamil, etc.). If they ask in English, use English. Do NOT translate technical identifiers (like IS 13252, BIS, CRS).
8. CONTEXT MEMORY: Use the conversation history to understand pronouns (e.g., "its scope").

[RETRIEVED CONTEXT]
${contextStr ? contextStr : "No specific official BIS context found. Provide a helpful, formatted general answer using your knowledge."}`;

  const messages: ChatMessage[] = [];
  
  if (history && Array.isArray(history)) {
    history.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
  }
  
  messages.push({ role: 'user', content: query });

  const result = await aiService.generateChat(messages, systemPrompt);
  return result;
}
