import { PrismaClient } from '@prisma/client';
import { pipeline, env } from '@xenova/transformers';

const prisma = new PrismaClient();
// Optional: disable downloading if you already have the model, but let's allow it first time
env.allowLocalModels = false;
env.useBrowserCache = false;

async function run() {
  console.log('[EMBED] Starting BIS embedding process...');
  
  const chunks = await prisma.documentChunk.findMany({
    where: { embedding: null }
  });

  if (chunks.length === 0) {
    console.log('[EMBED] No unembedded chunks found.');
    return;
  }

  console.log(`[EMBED] Found ${chunks.length} chunks to embed.`);
  
  // Load model
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const output = await extractor(chunk.text, { pooling: 'mean', normalize: true });
      const vector = Array.from(output.data);
      
      await prisma.documentChunk.update({
        where: { id: chunk.id },
        data: { embedding: JSON.stringify(vector) }
      });
      
      console.log(`[EMBED] Embedded chunk ${i + 1}/${chunks.length} (ID: ${chunk.id})`);
    } catch (err) {
      console.error(`[EMBED] Failed to embed chunk ${chunk.id}:`, err);
    }
  }

  console.log('[EMBED] COMPLETED');
}

run().catch(console.error).finally(() => prisma.$disconnect());
