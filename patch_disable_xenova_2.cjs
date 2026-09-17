const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

const oldSemanticSearch = /export async function semanticSearch\([\s\S]*?\} catch \(err\) \{/;

const newSemanticSearch = `let cachedChunks: any[] | null = null;
export async function semanticSearch(query: string, topK: number = 3) {
  try {
    throw new Error('Bypassing Xenova to prevent native crash');
  } catch (err) {`;

code = code.replace(oldSemanticSearch, newSemanticSearch);
fs.writeFileSync('server/rag.ts', code);
