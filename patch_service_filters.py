import re

with open('src/services/index.ts', 'r') as f:
    content = f.read()

# Replace the RealStandardsService search method
old_search = """  async search(filters: StandardSearchFilters): Promise<ServiceResult<StandardSearchResult>> {
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
  }"""

new_search = """  async search(filters: StandardSearchFilters): Promise<ServiceResult<StandardSearchResult>> {
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      
      const response = await fetch(`http://localhost:3001/api/standards/search?${params.toString()}`);
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
        status: (s.status || 'active').toLowerCase(),
        publishedYear: s.year || 2024,
        lastUpdated: new Date(s.updatedAt).toLocaleDateString(),
        certificationRelevant: true,
        testingRelevant: false,
        isDemo: false
      }));
      
      return { data: { items, total: items.length, page: 1, pageSize: 20 }, error: null, isDemo: false };
    } catch (e) {
      return { error: 'Unable to load BIS data. Please try again.', isDemo: false };
    }
  }"""

content = content.replace(old_search, new_search)

with open('src/services/index.ts', 'w') as f:
    f.write(content)
