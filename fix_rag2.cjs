const fs = require('fs');
let code = fs.readFileSync('server/rag.ts', 'utf8');

// Remove the global additions
const startIdx = code.indexOf('// --- Phase 5.2: Certification Intelligence ---');
const endIdx = code.indexOf('export async function generateRagAnswer');
if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + code.substring(endIdx);
}

// Ensure function signature is back to normal
code = code.replace(
    "export async function generateRagAnswer(query: string, chunks: any[], language: string = 'en', additionalContext: string = certContext) {",
    "export async function generateRagAnswer(query: string, chunks: any[], language: string = 'en') {"
);

const newLogicInsideFunction = `
  // --- Phase 5.2: Certification Intelligence ---
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

  let additionalContext = '';
  if (relevantProducts.length > 0) {
    additionalContext = "\\n\\n[OFFICIAL CERTIFICATION DATABASE]\\n";
    relevantProducts.forEach(p => {
      additionalContext += \`Product: \${p.name}\\nApplicable Standard: \${p.standard?.isNumber || 'Unknown'}\\nCertification Scheme: \${p.scheme.name}\\nScheme Details: \${p.scheme.description}\\nRequirements:\\n\`;
      p.scheme.requirements.forEach(r => {
        additionalContext += \`- \${r.title}: \${r.description}\\n\`;
      });
    });
  }

  if (chunks.length === 0 && !additionalContext) {
`;

code = code.replace(
    "if (chunks.length === 0 && !additionalContext) {",
    newLogicInsideFunction
);

code = code.replace(
    "const contextStr = additionalContext + '\\n\\n' + chunks.map((c, i) => {",
    "const contextStr = additionalContext + '\\n\\n' + chunks.map((c, i) => {"
);

fs.writeFileSync('server/rag.ts', code);
