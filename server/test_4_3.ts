import { semanticSearch } from './rag';
async function main() {
  console.log("--- TEST 1: RELEVANT QUERY ---");
  const chunks = await semanticSearch("What are the safety requirements for toys?", 3);
  console.log(`Found chunks: ${chunks.length}`);
  if (chunks.length > 0) {
    console.log(`Top Score: ${chunks[0].score}`);
    console.log(`Doc: ${chunks[0].document.title}, IS: ${chunks[0].standardNumber}, Page: ${chunks[0].page?.pageNumber}`);
  }

  console.log("--- TEST 2: UNRELATED QUERY ---");
  const chunks2 = await semanticSearch("How to bake a chocolate cake in an oven?", 3);
  console.log(`Found chunks (threshold 0.05): ${chunks2.length}`);
  if (chunks2.length > 0) {
     console.log(`Top Score: ${chunks2[0].score}`);
  }
}
main();
