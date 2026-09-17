const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

const additionalSearchLogic = `
  // --- Phase 5.2: Certification Intelligence ---
  // Also search for products in the database that might match this query
  const queryLower = query.toLowerCase();
  const products = await prisma.product.findMany({
    include: {
      scheme: { include: { requirements: true } },
      standard: true
    }
  });

  const relevantProducts = products.filter(p => 
    queryLower.includes(p.name.toLowerCase()) || 
    (p.standard && queryLower.includes(p.standard.isNumber.toLowerCase()))
  );

  let certContext = '';
  if (relevantProducts.length > 0) {
    certContext = "\\n\\n[OFFICIAL CERTIFICATION DATABASE]\\n";
    relevantProducts.forEach(p => {
      certContext += \`Product: \${p.name}\\nApplicable Standard: \${p.standard?.isNumber || 'Unknown'}\\nCertification Scheme: \${p.scheme.name}\\nScheme Details: \${p.scheme.description}\\nRequirements:\\n\`;
      p.scheme.requirements.forEach(r => {
        certContext += \`- \${r.title}: \${r.description}\\n\`;
      });
    });
  }
`;

code = code.replace(
  "export async function generateRagAnswer(query: string, chunks: any[], language: string = 'en') {",
  additionalSearchLogic + "\nexport async function generateRagAnswer(query: string, chunks: any[], language: string = 'en', additionalContext: string = certContext) {"
);

code = code.replace(
  "const contextStr = chunks.map((c, i) => {",
  "const contextStr = additionalContext + '\\n\\n' + chunks.map((c, i) => {"
);

code = code.replace(
  "if (chunks.length === 0) {",
  "if (chunks.length === 0 && !additionalContext) {"
);

fs.writeFileSync('server/rag.ts', code);
