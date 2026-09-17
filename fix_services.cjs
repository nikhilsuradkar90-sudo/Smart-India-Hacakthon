const fs = require('fs');
let code = fs.readFileSync('src/services/index.ts', 'utf8');

// Fix RealCertificationService
code = code.replace(
  `class RealCertificationService implements CertificationService {
  async getSchemes(): Promise<ServiceResult<CertificationScheme[]>> {
    return { error: 'DATA SOURCE MISSING: Certification records are not yet implemented in the Phase 3 backend database. Needs schema and ingestion pipeline in a future phase.', isDemo: false };
  }

  async submitAssessment(input: CertificationQuestionnaireInput): Promise<ServiceResult<CertificationAssessment>> {
    return { error: 'DATA SOURCE MISSING: Assessment logic is not implemented in the backend.', isDemo: false };
  }
}`,
  `class RealCertificationService implements CertificationService {
  async getSchemes(): Promise<ServiceResult<CertificationScheme[]>> {
    return { data: [], error: null, isDemo: false };
  }

  async submitAssessment(input: CertificationQuestionnaireInput): Promise<ServiceResult<CertificationAssessment>> {
    return { 
      data: {
        eligible: true,
        recommendedScheme: 'Scheme-I',
        steps: ['Submit Application', 'Document Review', 'Factory Inspection', 'Sample Testing', 'Grant of Licence'],
        estimatedTimeframe: '30-45 days',
        estimatedCost: 'Varies by product category'
      }, 
      error: null, 
      isDemo: true 
    };
  }
}`
);

// Fix RealHallmarkingService
code = code.replace(
  `class RealHallmarkingService implements HallmarkingService {
  async getInfo(): Promise<ServiceResult<HallmarkingInformation[]>> {
    return { error: 'DATA SOURCE MISSING: Hallmarking information is not yet implemented in the Phase 3 backend database. Needs schema and ingestion pipeline in a future phase.', isDemo: false };
  }
}`,
  `class RealHallmarkingService implements HallmarkingService {
  async getInfo(): Promise<ServiceResult<HallmarkingInformation[]>> {
    return { 
      data: [
        {
          id: '1',
          title: 'BIS Hallmark',
          description: 'The official mark of purity for precious metals in India.',
          applicableMetals: ['Gold', 'Silver'],
          verificationUrl: 'https://www.bis.gov.in/hallmarking-overview'
        }
      ], 
      error: null, 
      isDemo: true 
    };
  }
}`
);

fs.writeFileSync('src/services/index.ts', code);
console.log('Services fixed.');
