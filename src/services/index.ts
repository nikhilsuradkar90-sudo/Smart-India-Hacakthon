import {
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
  sendMessage(message: string, context?: any, history?: any[]): Promise<ServiceResult<AssistantMessage>>;
  regenerateResponse(messageId: string, language?: string): Promise<ServiceResult<AssistantMessage>>;
}

class RealAssistantService implements AssistantService {
  async sendMessage(message: string, context?: any, history?: any[]): Promise<ServiceResult<AssistantMessage>> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language: context?.language || 'en', history: history || [] })
      });
      
      if (!response.ok) {
        throw new Error('Network error or server unavailable');
      }
      
      const payload = await response.json();
      
      if (!payload.success) {
        return { 
          data: {
            id: Date.now().toString(),
            role: 'assistant',
            content: payload.error?.message || 'The AI service is temporarily unavailable.',
            timestamp: new Date().toISOString(),
            status: 'error'
          },
          error: payload.error?.message || 'Unknown Error',
          isDemo: false
        };
      }
      
      const sources = (payload.data.citations || []).map((c: any) => ({
        id: c.id,
        title: c.documentTitle,
        type: 'standard',
        reference: c.standardNumber,
        url: '#',
        relevanceScore: c.score,
        snippet: c.text
      }));

      return {
        data: { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: payload.data.answer, 
          timestamp: new Date().toISOString(), 
          status: 'complete',
          sources: sources
        },
        error: null,
        isDemo: false
      };
    } catch (e: any) {
      console.error("Frontend Assistant Error:", e);
      return { 
        data: {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'The AI service is temporarily unavailable due to a network or server issue. Please try again.',
          timestamp: new Date().toISOString(),
          status: 'error'
        },
        error: 'Network or Server Error',
        isDemo: false 
      };
    }
  }

  async regenerateResponse(messageId: string, language?: string): Promise<ServiceResult<AssistantMessage>> {
    return this.sendMessage('Please regenerate the response', { language });
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
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.category && filters.category !== 'All Categories') params.append('group', filters.category);
        if (filters.industry && filters.industry !== 'All Industries') params.append('subGroup', filters.industry);
      const page = filters.page || 1;
      const limit = filters.pageSize || 20;
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/standards?${params.toString()}`);
      if (!response.ok) throw new Error('API error');
      const responseData = await response.json();
      
      const items = responseData.data.map((s: any) => ({
        id: s.id,
        identifier: s.isNumber || s.standardNumber,
        title: s.title,
        description: s.amendmentInformation || s.technicalDepartment || 'No description available',
        category: s.technicalDepartment || 'General',
        industry: s.sectionalCommittee || 'General',
        type: 'product',
        status: (s.status || 'active').toLowerCase(),
        publishedYear: s.publicationYear || s.year || 2024,
        lastUpdated: new Date(s.updatedAt || new Date()).toLocaleDateString(),
        certificationRelevant: true,
        testingRelevant: false,
        isDemo: false
      }));
      
      return { 
        data: { 
          items, 
          total: responseData.pagination.total, 
          page: responseData.pagination.page, 
          pageSize: responseData.pagination.limit 
        }, 
        error: null, 
        isDemo: false 
      };
    } catch (e) {
      return { error: 'Unable to load BIS data. Please try again.', isDemo: false };
    }
  }

  async getById(id: string): Promise<ServiceResult<Standard | null>> {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/standards/${id}`);
        if (!response.ok) throw new Error('API error');
        const s = await response.json();
        
        const titleLower = (s.title || '').toLowerCase();
        const isElectrical = titleLower.includes('electric') || titleLower.includes('cable');
        const isCivil = titleLower.includes('cement') || titleLower.includes('concrete') || titleLower.includes('steel');
        
        let mockDescription = s.scope;
        if (!mockDescription || mockDescription === 'No description available') {
          mockDescription = `This Indian Standard (${s.isNumber || s.standardNumber || 'IS'}) specifies the requirements, sampling, and methods of test for ${s.title || 'the product'}. It ensures safety, reliability, and regulatory compliance.`;
        }
        
        const mockRequirements = isElectrical ? [
          "Insulation Resistance Test", "High Voltage Test", "Conductor Resistance"
        ] : isCivil ? [
          "Compressive Strength at 3, 7, and 28 days", "Initial and Final Setting Time", "Soundness Test"
        ] : [
          "Dimensional verification", "Chemical composition", "Performance testing"
        ];
        
        const mockReferences = [
          { id: "ref-1", type: "standard", title: "IS 4905 : 2015 - Random Sampling Procedures" },
          { id: "ref-2", type: "document", title: "BIS Scheme of Testing and Inspection (STI)" },
          { id: "ref-3", type: "regulation", title: "Quality Control Order (QCO) Notification" }
        ];
      return {
          data: {
            id: s.id,
            identifier: s.isNumber || s.standardNumber,
            title: s.title,
            description: mockDescription,
            scope: s.scope || `This standard covers the requirements for ${s.title}.`,
            category: s.technicalDepartment || 'General',
            industry: s.sectionalCommittee || 'Manufacturing',
            type: 'product',
            status: 'active',
            publishedYear: s.year || s.publicationYear || 2024,
            lastUpdated: s.updatedAt,
            certificationRelevant: true,
            testingRelevant: true,
            keyRequirements: mockRequirements,
            references: mockReferences as any,
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
    return { 
      data: {
        id: '1',
        input,
        status: 'demo',
        summary: 'Demo Assessment',
        suggestedSteps: ['Submit Application', 'Document Review', 'Factory Inspection'],
        isDemo: true,
        createdAt: new Date().toISOString()
      }, 
      error: null, 
      isDemo: true 
    };
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
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.state && filters.state !== 'All States') params.append('state', filters.state);
      if (filters.productCategory && filters.productCategory !== 'All Categories') params.append('category', filters.productCategory);
      if (filters.testType && filters.testType !== 'All Test Types') params.append('testType', filters.testType);
      if (filters.city && filters.city.trim() !== '') params.append('city', filters.city.trim());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('limit', filters.pageSize.toString());
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/laboratories?${params.toString()}`);
      if (!response.ok) throw new Error('API error');
      const json = await response.json();
      
      const items = json.data.map((lab: any) => ({
        id: lab.id,
        name: lab.name,
        location: lab.address || lab.state,
        state: lab.state || 'Unknown',
        capabilities: lab.testingScope ? lab.testingScope.split(',') : ['General Testing'],
        productCategories: [lab.category || 'BIS Recognized Labs'],
        recognition: 'bis-recognized',
        recognitionLabel: 'BIS Recognized',
        contact: lab.email || lab.phone || lab.contactPerson,
        phone: lab.phone,
        email: lab.email,
        validityDate: lab.validityDate,
        labCode: lab.labCode,
        status: lab.status,
        isDemo: false
      }));
      
      return { 
        data: { 
          items, 
          total: json.pagination.total, 
          page: json.pagination.page, 
          pageSize: json.pagination.limit 
        }, 
        error: null, 
        isDemo: false 
      };
    } catch (e) {
      return { error: 'Unable to load laboratory data. Please try again.', isDemo: false };
    }
  }

  async getById(id: string): Promise<ServiceResult<Laboratory | null>> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/laboratories/${id}`);
      if (!response.ok) throw new Error('API error');
      const lab = await response.json();
      
      return {
        data: {
          id: lab.id,
          name: lab.name,
          location: lab.address || lab.state,
          state: lab.state || 'Unknown',
          capabilities: lab.testingScope ? lab.testingScope.split(',') : ['General Testing'],
          productCategories: [lab.category || 'BIS Recognized Labs'],
          recognition: 'bis-recognized',
          recognitionLabel: 'BIS Recognized',
          contact: lab.email || lab.phone || lab.contactPerson,
        phone: lab.phone,
        email: lab.email,
        validityDate: lab.validityDate,
        labCode: lab.labCode,
        status: lab.status,
          isDemo: false
        },
        error: null,
        isDemo: false
      };
    } catch (e) {
      return { error: 'Unable to load laboratory data.', isDemo: false };
    }
  }

  getStates(): string[] { return []; }
  getTestTypes(): string[] { return []; }
}

export interface HallmarkingService {
  getInfo(): Promise<ServiceResult<HallmarkingInformation[]>>;
}

class RealHallmarkingService implements HallmarkingService {
  async getInfo(): Promise<ServiceResult<HallmarkingInformation[]>> {
    return { 
      data: [
        {
          id: '1',
          title: 'BIS Hallmark',
          description: 'The official mark of purity for precious metals in India.',
          category: 'Precious Metals',
          isDemo: true
        }
      ], 
      error: null, 
      isDemo: true 
    };
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
