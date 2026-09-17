import sys

with open('src/services/index.ts', 'r') as f:
    content = f.read()

new_class = """class RealAssistantService implements AssistantService {
  async sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>> {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language: context?.language || 'en' })
      });
      
      if (!response.ok) throw new Error('Failed to chat');
      const data = await response.json();
      
      const sources = data.citations.map((c: any) => ({
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
          content: data.answer, 
          timestamp: new Date().toISOString(), 
          status: 'complete',
          sources: sources
        },
        error: null,
        isDemo: false
      };
    } catch (e: any) {
      return { error: 'Failed to communicate with AI Assistant. Please check backend connection.', isDemo: false };
    }
  }

  async regenerateResponse(messageId: string, language?: string): Promise<ServiceResult<AssistantMessage>> {
    return this.sendMessage('Please regenerate the response', { language });
  }
}"""

# Replace the existing RealAssistantService
import re
content = re.sub(r'class RealAssistantService implements AssistantService \{.*?\n\}', new_class, content, flags=re.DOTALL)

with open('src/services/index.ts', 'w') as f:
    f.write(content)
