const fs = require('fs');
let code = fs.readFileSync('server/ingest.ts', 'utf8');

code = code.replace(
  'const { isNumber: standardNumber, title, edition, year } = extractMetadata(cleanedText, fileName);',
  'const { standardNumber, title, edition, year } = extractMetadata(cleanedText, fileName);'
);

code = code.replace(
  `let standard = await prisma.standard.findUnique({ where: { isNumber: standardNumber } });
    if (!standard) {
      standard = await prisma.standard.create({
        data: {
          isNumber: standardNumber,
          title,
          edition,
          year,
          status: 'Active'
        }
      });
    }`,
  `let standard = await prisma.standard.findUnique({ where: { isNumber: standardNumber } });
    if (!standard) {
      standard = await prisma.standard.create({
        data: {
          isNumber: standardNumber,
          title,
          edition,
          year,
          status: 'Active'
        }
      });
    }`
);

code = code.replace(
  `const dbDocument = await prisma.document.create({
      data: {
        title: title || 'Unknown Document',
        originalFileName: fileName,
        isNumber: standardNumber,
        pageCount: pages.length,
        contentHash: contentHash,
        extractionMethod: 'pdf-parse',
        extractionStatus: 'success',
      }
    });`,
  `const dbDocument = await prisma.document.create({
      data: {
        title: title || 'Unknown Document',
        originalFileName: fileName,
        standardNumber,
        pageCount: pages.length,
        contentHash: contentHash,
        extractionMethod: 'pdf-parse',
        extractionStatus: 'success',
      }
    });`
);

code = code.replace(
  `isNumber: standardNumber,
                    chunkIndex,`,
  `standardNumber,
                    chunkIndex,`
);

fs.writeFileSync('server/ingest.ts', code);
