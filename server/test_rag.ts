import { semanticSearch, generateRagAnswer } from './rag';

(async () => {
  try {
    const chunks = await semanticSearch("What are the safety requirements for toys?", 3);
    console.log("Chunks retrieved:", chunks.length);
    for (const c of chunks) {
      console.log(`- ${c.document?.title || 'Unknown'} (Score: ${c.score.toFixed(3)})`);
    }
    const answer = await generateRagAnswer("What are the safety requirements for toys?", chunks);
    console.log("\nAnswer:", answer);
  } catch(e) {
    console.error(e);
  }
})();
