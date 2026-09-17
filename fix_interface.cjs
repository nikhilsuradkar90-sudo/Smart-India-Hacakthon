const fs = require('fs');
let code = fs.readFileSync('src/services/index.ts', 'utf8');
code = code.replace(
  "sendMessage(message: string, context?: any): Promise<ServiceResult<AssistantMessage>>;",
  "sendMessage(message: string, context?: any, history?: any[]): Promise<ServiceResult<AssistantMessage>>;"
);
fs.writeFileSync('src/services/index.ts', code);
