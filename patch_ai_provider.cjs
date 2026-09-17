const fs = require('fs');
let code = fs.readFileSync('server/ai-provider.ts', 'utf8');

code = code.replace(
  "async generateChat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {",
  "async generateChat(messages: ChatMessage[], systemPrompt?: string): Promise<{answer: string, provider: string}> {"
);

code = code.replace(
  "return await this.executeWithProvider(this.primaryProvider, this.primaryState, messages, systemPrompt);",
  "return { answer: await this.executeWithProvider(this.primaryProvider, this.primaryState, messages, systemPrompt), provider: this.primaryProvider.name };"
);

code = code.replace(
  "return await this.executeWithProvider(this.fallbackProvider, this.fallbackState, messages, systemPrompt);",
  "return { answer: await this.executeWithProvider(this.fallbackProvider, this.fallbackState, messages, systemPrompt), provider: this.fallbackProvider.name };"
);

fs.writeFileSync('server/ai-provider.ts', code);
