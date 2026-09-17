import { semanticSearch, generateRagAnswer } from './rag';
async function main() {
  const chunks = await semanticSearch("What are the safety requirements for toys?", 3);
  try {
    const ans = await generateRagAnswer("What are the safety requirements for toys?", chunks, "en");
    console.log("ANSWER:", ans);
  } catch (e: any) {
    console.log("RAG ERROR THROWN (Expected if NO KEY):", e.message);
  }

  try {
    const noChunks = await semanticSearch("How to bake a chocolate cake in an oven?", 3);
    const ans2 = await generateRagAnswer("How to bake a chocolate cake in an oven?", noChunks, "en");
    console.log("NO-CONTEXT ANSWER:", ans2);
  } catch (e: any) {
    console.log("NO-CONTEXT ERROR THROWN:", e.message);
  }
}
main();
