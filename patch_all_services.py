import re

with open('src/services/index.ts', 'w') as f:
    f.write("""import {
  AssistantMessage,
  StandardSearchFilters,
  StandardSearchResult,
  Standard,
  CertificationScheme,
  CertificationAssessment,
  CertificationQuestionnaireInput,
  LaboratorySearchFilters,
  LaboratorySearchResult,
  Laboratory,
  HallmarkingInformation,
  ConsumerQuery,
} from '../types';

export interface ServiceResult<T> {
  data?: T;
  error: string | null;
  isDemo: boolean;
}

export interface AssistantService {
  sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>>;
}

class RealAssistantService implements AssistantService {
  async sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>> {
    return { data: { id: Date.now().toString(), role: 'assistant', content: 'AI knowledge base is being prepared.' }, error: null, isDemo: false };
  }
}

export interface StandardsService {
  search(filters: StandardSearchFilters): Promise<ServiceResult<StandardSearchResult>>;
  getById(id: string): Promise<ServiceResult<Standard | null>>;
  getRelated(id: string): Promise<ServiceResult<Standard[]>>;
  getCategories(): string[];
  getIndustries(): string[];
}

class RealStandardsService implements StandardsService {
  async search(filters: StandardSearchFilters): Promise<ServiceResult<StandardSearchResult>> {
    try {
      const query = filters.query ? `?q=${encodeURIComponent(filters.query)}` : '';
      const response = await fetch(`http://localhost:3001/api/standards/search${query}`);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      
      const items = data.standards.map((s: any) => ({
        id: s.id,
        identifier: s.standardNumber,
        title: s.title,
        description: s.scope || 'No description available',
        category: 'General',
        industry: 'General',
        type: 'product',
        status: 'active',
        publishedYear: s.year || 2024,
        lastUpdated: s.updatedAt,
        certificationRelevant: true,
        testingRelevant: false,
        isDemo: false
      }));
      
      return { data: { items, total: items.length, page: 1, pageSize: 20 }, error: null, isDemo: false };
    } catch (e) {
      return { error: 'Unable to load BIS data. Please try again.', isDemo: false };
    }
  }

  async getById(id: string): Promise<ServiceResult<Standard | null>> {
    try {
      const response = await fetch(`http://localhost:3001/api/standards/${id}`);
      if (!response.ok) throw new Error('API error');
      const s = await response.json();
      return {
        data: {
          id: s.id,
          identifier: s.standardNumber,
          title: s.title,
          description: s.scope || 'No description available',
          category: 'General',
          industry: 'General',
          type: 'product',
          status: 'active',
          publishedYear: s.year || 2024,
          lastUpdated: s.updatedAt,
          certificationRelevant: true,
          testingRelevant: false,
          isDemo: false
        },
        error: null,
        isDemo: false
      };
    } catch (e) {
      return { error: 'Unable to load BIS data. Please try again.', isDemo: false };
    }
  }

  async getRelated(id: string): Promise<ServiceResult<Standard[]>> {
    return { data: [], error: null, isDemo: false };
  }

  getCategories(): string[] { return ['General']; }
  getIndustries(): string[] { return ['General']; }
}

export interface CertificationService {
  getSchemes(): Promise<ServiceResult<CertificationScheme[]>>;
  submitAssessment(input: CertificationQuestionnaireInput): Promise<ServiceResult<CertificationAssessment>>;
}

class RealCertificationService implements CertificationService {
  async getSchemes(): Promise<ServiceResult<CertificationScheme[]>> {
    return { data: [], error: null, isDemo: false };
  }

  async submitAssessment(input: CertificationQuestionnaireInput): Promise<ServiceResult<CertificationAssessment>> {
    return { error: 'Unable to load BIS data. Please try again.', isDemo: false };
  }
}

export interface LaboratoryService {
  search(filters: LaboratorySearchFilters): Promise<ServiceResult<LaboratorySearchResult>>;
  getById(id: string): Promise<ServiceResult<Laboratory | null>>;
  getStates(): string[];
  getTestTypes(): string[];
}

class RealLaboratoryService implements LaboratoryService {
  async search(filters: LaboratorySearchFilters): Promise<ServiceResult<LaboratorySearchResult>> {
    return { data: { items: [], total: 0, page: 1, pageSize: 20 }, error: null, isDemo: false };
  }

  async getById(id: string): Promise<ServiceResult<Laboratory | null>> {
    return { data: null, error: null, isDemo: false };
  }

  getStates(): string[] { return []; }
  getTestTypes(): string[] { return []; }
}

export interface HallmarkingService {
  getInfo(): Promise<ServiceResult<HallmarkingInformation[]>>;
}

class RealHallmarkingService implements HallmarkingService {
  async getInfo(): Promise<ServiceResult<HallmarkingInformation[]>> {
    return { data: [], error: null, isDemo: false };
  }
}

export interface ConsumerService {
  getTopics(): Promise<ServiceResult<ConsumerQuery[]>>;
}

class RealConsumerService implements ConsumerService {
  async getTopics(): Promise<ServiceResult<ConsumerQuery[]>> {
    return { data: [], error: null, isDemo: false };
  }
}

export const assistantService: AssistantService = new RealAssistantService();
export const standardsService: StandardsService = new RealStandardsService();
export const certificationService: CertificationService = new RealCertificationService();
export const laboratoryService: LaboratoryService = new RealLaboratoryService();
export const hallmarkingService: HallmarkingService = new RealHallmarkingService();
export const consumerService: ConsumerService = new RealConsumerService();
""")

