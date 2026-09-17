import re

with open('src/services/index.ts', 'r') as f:
    content = f.read()

cert_service = """class RealCertificationService implements CertificationService {
  async getSchemes(): Promise<ServiceResult<CertificationScheme[]>> {
    return { error: 'DATA SOURCE MISSING: Certification records are not yet implemented in the Phase 3 backend database. Needs schema and ingestion pipeline in a future phase.', isDemo: false };
  }

  async submitAssessment(input: CertificationQuestionnaireInput): Promise<ServiceResult<CertificationAssessment>> {
    return { error: 'DATA SOURCE MISSING: Assessment logic is not implemented in the backend.', isDemo: false };
  }
}"""
content = re.sub(r'class RealCertificationService implements CertificationService \{.*?\n\}', cert_service, content, flags=re.DOTALL)

lab_service = """class RealLaboratoryService implements LaboratoryService {
  async search(filters: LaboratorySearchFilters): Promise<ServiceResult<LaboratorySearchResult>> {
    return { error: 'DATA SOURCE MISSING: Laboratory records are not yet implemented in the Phase 3 backend database. Needs schema and ingestion pipeline in a future phase.', isDemo: false };
  }

  async getById(id: string): Promise<ServiceResult<Laboratory | null>> {
    return { error: 'DATA SOURCE MISSING: Laboratory records are not yet implemented.', isDemo: false };
  }

  getStates(): string[] { return []; }
  getTestTypes(): string[] { return []; }
}"""
content = re.sub(r'class RealLaboratoryService implements LaboratoryService \{.*?\n\}', lab_service, content, flags=re.DOTALL)

hallmark_service = """class RealHallmarkingService implements HallmarkingService {
  async getInfo(): Promise<ServiceResult<HallmarkingInformation[]>> {
    return { error: 'DATA SOURCE MISSING: Hallmarking information is not yet implemented in the Phase 3 backend database. Needs schema and ingestion pipeline in a future phase.', isDemo: false };
  }
}"""
content = re.sub(r'class RealHallmarkingService implements HallmarkingService \{.*?\n\}', hallmark_service, content, flags=re.DOTALL)

with open('src/services/index.ts', 'w') as f:
    f.write(content)
