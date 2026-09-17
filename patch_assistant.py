import sys

with open('src/services/index.ts', 'r') as f:
    content = f.read()

content = content.replace('sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>>;', 
"""sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>>;
  regenerateResponse(messageId: string): Promise<ServiceResult<AssistantMessage>>;""")

content = content.replace("""  async sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>> {
    return { data: { id: Date.now().toString(), role: 'assistant', content: 'AI knowledge base is being prepared.' }, error: null, isDemo: false };
  }""", 
"""  async sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>> {
    return { data: { id: Date.now().toString(), role: 'assistant', content: 'AI knowledge base is being prepared.', timestamp: new Date().toISOString(), status: 'sent' }, error: null, isDemo: false };
  }
  async regenerateResponse(messageId: string): Promise<ServiceResult<AssistantMessage>> {
    return { data: { id: Date.now().toString(), role: 'assistant', content: 'AI knowledge base is being prepared.', timestamp: new Date().toISOString(), status: 'sent' }, error: null, isDemo: false };
  }""")

with open('src/services/index.ts', 'w') as f:
    f.write(content)
