const fs = require('fs');
let code = fs.readFileSync('src/services/index.ts', 'utf8');

code = code.replace(
  `data: {
        eligible: true,
        recommendedScheme: 'Scheme-I',
        steps: ['Submit Application', 'Document Review', 'Factory Inspection', 'Sample Testing', 'Grant of Licence'],
        estimatedTimeframe: '30-45 days',
        estimatedCost: 'Varies by product category'
      }`,
  `data: {
        id: '1',
        input,
        status: 'demo',
        summary: 'Demo Assessment',
        suggestedSteps: ['Submit Application', 'Document Review', 'Factory Inspection'],
        isDemo: true,
        createdAt: new Date().toISOString()
      }`
);

code = code.replace(
  `data: [
        {
          id: '1',
          title: 'BIS Hallmark',
          description: 'The official mark of purity for precious metals in India.',
          applicableMetals: ['Gold', 'Silver'],
          verificationUrl: 'https://www.bis.gov.in/hallmarking-overview'
        }
      ]`,
  `data: [
        {
          id: '1',
          title: 'BIS Hallmark',
          description: 'The official mark of purity for precious metals in India.',
          category: 'Precious Metals',
          isDemo: true
        }
      ]`
);

fs.writeFileSync('src/services/index.ts', code);
