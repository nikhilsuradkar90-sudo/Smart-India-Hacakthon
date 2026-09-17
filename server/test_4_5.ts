import { semanticSearch } from './rag';
async function main() {
  const chunks = await semanticSearch("What are the safety requirements for toys?", 1);
  if(chunks.length > 0) {
    const c = chunks[0];
    console.log("CITATION TEST:");
    console.log(`Document Title: ${c.document.title}`);
    console.log(`Standard: ${c.standardNumber}`);
    console.log(`Page Number: ${c.page?.pageNumber}`);
    console.log(`Snippet: ${c.text.substring(0,50)}...`);
  }
}
main();
