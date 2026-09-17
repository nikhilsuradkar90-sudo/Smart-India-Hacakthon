import { prisma } from './prisma';
import { pipeline } from '@xenova/transformers';
import { aiService, ChatMessage } from './ai-provider';
import 'dotenv/config';

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
  }
  return extractor;
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

export async function recommendStandards(query: string) {
  // 1. Get embedding for the query
  const ext = await getExtractor();
  const output = await ext(query, { pooling: 'mean', normalize: true });
  const queryEmbedding = Array.from(output.data) as number[];

  // 2. Fetch all standards with embeddings
  const allStandards = await prisma.standard.findMany({
    include: {
      products: true,
      groups: { include: { group: true } }
    }
  });

  const scoredStandards: any[] = [];
  const queryLower = query.toLowerCase();

  for (const std of allStandards) {
    let score = 0;
    
    if (queryLower.includes(std.title.toLowerCase()) || std.title.toLowerCase().includes(queryLower)) score += 0.4;
    if (std.isNumber.toLowerCase().includes(queryLower)) score += 0.5;
    
    for (const prod of std.products) {
      if (queryLower.includes(prod.name.toLowerCase()) || prod.name.toLowerCase().includes(queryLower)) score += 0.5;
    }

    if (std.embedding) {
      try {
        const stdEmb = JSON.parse(std.embedding);
        const sim = cosineSimilarity(queryEmbedding, stdEmb);
        if (sim > 0.3) {
          score += sim; 
        }
      } catch (e) {}
    }

    if (score > 0) {
      scoredStandards.push({ standard: std, score });
    }
  }

  const allChunks = await prisma.documentChunk.findMany({
    where: { embedding: { not: null } }
  });

  for (const chunk of allChunks) {
    try {
      const chunkEmb = JSON.parse(chunk.embedding!);
      const sim = cosineSimilarity(queryEmbedding, chunkEmb);
      
      if (sim > 0.4) {
        const existing = scoredStandards.find(s => s.standard.isNumber === chunk.standardNumber);
        if (existing) {
          existing.score += (sim * 0.5); 
        } else {
          const std = allStandards.find(s => s.isNumber === chunk.standardNumber);
          if (std) {
            scoredStandards.push({ standard: std, score: sim * 0.8 });
          }
        }
      }
    } catch (e) {}
  }

  scoredStandards.sort((a, b) => b.score - a.score);
  const topResults = scoredStandards.slice(0, 5); 

  if (topResults.length === 0) {
    return {
      success: false,
      message: "Insufficient verified BIS information to confidently recommend a standard.",
      recommendations: []
    };
  }

  let finalRecommendations = topResults;

  try {
    const promptContext = topResults.map(r => 
      `Standard: ${r.standard.isNumber} - ${r.standard.title}\nProducts: ${r.standard.products.map(p => p.name).join(', ')}`
    ).join('\n\n');

    const systemPrompt = `You are an intelligent BIS Standard Recommendation Engine. The user is looking for a standard related to: "${query}".
I have found the following verified standards in our database:
${promptContext}

For each standard, write a brief, 1-sentence explanation of WHY it is relevant to the user's query based strictly on its title and linked products. Do not invent information.
Return the result EXACTLY as a raw JSON object mapping the IS Number to the explanation string. Like: {"IS 9873-1": "This standard is relevant because..."}
Do not use markdown blocks like \`\`\`json. Return strictly the JSON.`;

    const result = await aiService.generateChat([], systemPrompt);
    const chatCompletionText = result.answer;

    // Clean markdown block if the AI ignored instructions
    const cleanJsonText = chatCompletionText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const explanations = JSON.parse(cleanJsonText || '{}');
    
    finalRecommendations = topResults.map(r => ({
      ...r,
      explanation: explanations[r.standard.isNumber] || 'Relevant based on semantic keyword match in the BIS catalogue.'
    }));

  } catch (e: any) {
    console.error("Recommendation LLM error: " + (e.message || e));
    finalRecommendations = topResults.map(r => ({
      ...r,
      explanation: 'Relevant based on semantic keyword match in the BIS catalogue.'
    }));
  }

  return {
    success: true,
    message: "Found verified standards matching your query.",
    recommendations: finalRecommendations.map(r => ({
      id: r.standard.id,
      isNumber: r.standard.isNumber,
      title: r.standard.title,
      score: r.score,
      explanation: r.explanation,
      products: r.standard.products
    }))
  };
}
