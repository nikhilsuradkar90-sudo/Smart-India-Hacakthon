const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

const oldFunc = /export async function generateRagAnswer[\s\S]*?return await aiService\.generateChat\(messages, systemPrompt\);\n}/;

const newFunc = `export async function generateRagAnswer(query: string, chunks: any[], language: string = 'en', history: any[] = []) {
  let additionalContext = '';
  
  try {
    const contextQuery = history.length > 0 ? (history[history.length - 2]?.content || '') + ' ' + query : query;
    const queryLower = contextQuery.toLowerCase();
    
    const products = await prisma.product.findMany({
      include: {
        scheme: { include: { requirements: true } },
        standard: true
      },
      take: 10 // Reduced
    });

    const queryWords = queryLower.split(' ').filter(w => w.length > 3);
    const relevantProducts = products.filter(p => 
      queryWords.some(w => p.name.toLowerCase().includes(w)) || 
      p.name.toLowerCase().includes(queryLower) || queryLower.includes(p.name.toLowerCase()) || 
      (p.standard && (p.standard.isNumber.toLowerCase().includes(queryLower) || queryLower.includes(p.standard.isNumber.toLowerCase())))
    ).slice(0, 2);

    if (relevantProducts.length > 0) {
      additionalContext = "\\n\\n[OFFICIAL CERTIFICATION DATABASE]\\n";
      relevantProducts.forEach(p => {
        additionalContext += \`Product: \${p.name}\\nApplicable Standard: \${p.standard?.isNumber || 'Unknown'}\\nCertification Scheme: \${p.scheme?.name || 'N/A'}\\nRequirements:\\n\`;
        p.scheme?.requirements?.slice(0,2).forEach(r => {
          additionalContext += \`- \${r.title}\\n\`;
        });
      });
    }
  } catch (dbErr) {
    console.error("Product retrieval failed:", dbErr);
  }

  const hasContext = chunks.length > 0 || additionalContext;

  const contextStr = additionalContext + '\\n\\n' + chunks.map((c, i) => {
    return \`[Citation \${i + 1}] Source: \${c.document?.title || 'Unknown'}, Standard: \${c.standardNumber || 'N/A'}, Page: \${c.page?.pageNumber || 'N/A'}\\nText: \${c.text.substring(0, 400)}\`;
  }).join('\\n\\n');

  let systemPrompt = \`You are the BIS AI Assistant. Answer based STRICTLY on the retrieved context. Do not invent standards. Respond in language: "\${language}". Cite sources as [Citation N].\`;

  if (hasContext) {
    systemPrompt += \`\\n\\nRETRIEVED CONTEXT:\\n\${contextStr}\`;
  } else {
    systemPrompt += \`\\n\\n[CRITICAL INSTRUCTION] The verified source system is currently unavailable. Clearly state: "I couldn't find sufficient information in the BIS knowledge base to answer this reliably."\`;
  }

  const messages: ChatMessage[] = [];
  
  if (history && Array.isArray(history)) {
    history.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content.substring(0, 200) });
      }
    });
  }
  
  messages.push({ role: 'user', content: query.substring(0, 200) });

  const result = await aiService.generateChat(messages, systemPrompt);
  return result;
}`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('server/rag.ts', code);
