import sys

with open('src/services/index.ts', 'r') as f:
    content = f.read()

new_class = """
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
      
      return {
        data: {
          items,
          total: items.length,
          page: 1,
          pageSize: 20,
          totalPages: 1
        },
        error: null,
        isDemo: false
      };
    } catch (e) {
      console.warn("Real API failed, falling back to Mock", e);
      return new MockStandardsService().search(filters);
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
      return new MockStandardsService().getById(id);
    }
  }

  async getRelated(id: string): Promise<ServiceResult<Standard[]>> {
    return new MockStandardsService().getRelated(id);
  }

  getCategories(): string[] { return ['General']; }
  getIndustries(): string[] { return ['General']; }
}
"""

content = content.replace(
    'export const standardsService: StandardsService = new MockStandardsService();',
    new_class + '\nexport const standardsService: StandardsService = new RealStandardsService();'
)

with open('src/services/index.ts', 'w') as f:
    f.write(content)
