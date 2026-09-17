const fs = require('fs');

// 1. Modify src/services/index.ts
let services = fs.readFileSync('src/services/index.ts', 'utf8');
services = services.replace(
  "async sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>> {",
  "async sendMessage(message: string, context?: any, history?: any[]): Promise<ServiceResult<AssistantMessage>> {"
);
services = services.replace(
  "body: JSON.stringify({ message, language: context?.language || 'en' })",
  "body: JSON.stringify({ message, language: context?.language || 'en', history: history || [] })"
);
fs.writeFileSync('src/services/index.ts', services);

// 2. Modify src/pages/AssistantPage.tsx
let page = fs.readFileSync('src/pages/AssistantPage.tsx', 'utf8');

// Need to pass the existing session messages to handleSend
page = page.replace(
  "const result = await assistantService.sendMessage(queryText, language);",
  "// Extract relevant fields for history\n    const history = prevSession.messages.map(m => ({ role: m.role, content: m.content }));\n    const result = await assistantService.sendMessage(queryText, language, history);"
);

// We need to capture prevSession.
// In the current handleSend, we do:
// setSession((prev) => ({ ...prev, messages: [...prev.messages, userMessage, loadingMessage] }));
// We can capture prev state before that, but React state inside useCallback might not be latest unless we use a ref or dependency.
// `session` is in the dependency array! So we can just use `session.messages`!
page = page.replace(
  "// Extract relevant fields for history\n    const history = prevSession.messages.map(m => ({ role: m.role, content: m.content }));\n    const result = await assistantService.sendMessage(queryText, language, history);",
  "const history = session.messages.filter(m => m.status === 'complete').map(m => ({ role: m.role, content: m.content }));\n    const result = await assistantService.sendMessage(queryText, language, history);"
);

page = page.replace(
  "}, [input, isSending, language, updateMessage]);",
  "}, [input, isSending, language, session.messages, updateMessage]);"
);

fs.writeFileSync('src/pages/AssistantPage.tsx', page);
