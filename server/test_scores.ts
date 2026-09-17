import { semanticSearch } from './rag';
async function run() {
  const chunks = await semanticSearch("What is the scope of IS 9873?", 5);
  console.log("Found:", chunks.length);
  for (const c of chunks) console.log(c.score);
}
run();
