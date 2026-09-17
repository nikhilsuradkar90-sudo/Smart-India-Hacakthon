import re

with open('src/services/index.ts', 'r') as f:
    content = f.read()

new_lab = """class RealLaboratoryService implements LaboratoryService {
  async search(filters: LaboratorySearchFilters): Promise<ServiceResult<LaboratorySearchResult>> {
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.state && filters.state !== 'All States') params.append('state', filters.state);
      if (filters.productCategory && filters.productCategory !== 'All Categories') params.append('category', filters.productCategory);
      
      const response = await fetch(`http://localhost:3001/api/laboratories?${params.toString()}`);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      
      const items = data.laboratories.map((lab: any) => ({
        id: lab.id,
        name: lab.name,
        location: lab.state || lab.city || lab.address,
        capabilities: lab.testingScope ? lab.testingScope.split(',') : ['General Testing'],
        productCategories: [lab.category || 'BIS Recognized Labs'],
        contact: lab.email || lab.phone || lab.contactPerson,
        isDemo: false
      }));
      
      return { data: { items, total: items.length, page: 1, pageSize: 20 }, error: null, isDemo: false };
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
          capabilities: lab.testingScope ? lab.testingScope.split(',') : ['General Testing'],
          productCategories: [lab.category || 'BIS Recognized Labs'],
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

content = re.sub(r'class RealLaboratoryService implements LaboratoryService \{.*?\n\}', new_lab, content, flags=re.DOTALL)

with open('src/services/index.ts', 'w') as f:
    f.write(content)
