import re

with open('src/services/index.ts', 'r') as f:
    content = f.read()

old_service_regex = r"class RealLaboratoryService implements LaboratoryService \{.*?\n\}"

new_service = """class RealLaboratoryService implements LaboratoryService {
  async search(filters: LaboratorySearchFilters): Promise<ServiceResult<LaboratorySearchResult>> {
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.state && filters.state !== 'All States') params.append('state', filters.state);
      if (filters.productCategory && filters.productCategory !== 'All Categories') params.append('category', filters.productCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('limit', filters.pageSize.toString());
      
      const response = await fetch(`http://localhost:3001/api/laboratories?${params.toString()}`);
      if (!response.ok) throw new Error('API error');
      const json = await response.json();
      
      const items = json.data.map((lab: any) => ({
        id: lab.id,
        name: lab.name,
        location: lab.state || lab.city || lab.address,
        state: lab.state || 'Unknown',
        capabilities: lab.testingScope ? lab.testingScope.split(',') : ['General Testing'],
        productCategories: [lab.category || 'BIS Recognized Labs'],
        recognition: 'bis-recognized',
        recognitionLabel: 'BIS Recognized',
        contact: lab.email || lab.phone || lab.contactPerson,
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
      const response = await fetch(`http://localhost:3001/api/laboratories/${id}`);
      if (!response.ok) throw new Error('API error');
      const lab = await response.json();
      
      return {
        data: {
          id: lab.id,
          name: lab.name,
          location: lab.state || lab.city || lab.address,
          state: lab.state || 'Unknown',
          capabilities: lab.testingScope ? lab.testingScope.split(',') : ['General Testing'],
          productCategories: [lab.category || 'BIS Recognized Labs'],
          recognition: 'bis-recognized',
          recognitionLabel: 'BIS Recognized',
          contact: lab.email || lab.phone || lab.contactPerson,
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
}"""

content = re.sub(old_service_regex, new_service, content, flags=re.DOTALL)

with open('src/services/index.ts', 'w') as f:
    f.write(content)
