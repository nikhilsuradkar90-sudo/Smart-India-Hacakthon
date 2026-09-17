const fs = require('fs');
let code = fs.readFileSync('src/services/index.ts', 'utf8');

const oldMethod = /async sendMessage\([\s\S]*?\}\s*\}\s*async regenerateResponse/;

const newMethod = `async sendMessage(message: string, context?: any, history?: any[]): Promise<ServiceResult<AssistantMessage>> {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
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

  async regenerateResponse`;

code = code.replace(oldMethod, newMethod);
fs.writeFileSync('src/services/index.ts', code);
