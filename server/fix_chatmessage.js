const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'AssistantPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// Update ChatMessage props interface
c = c.replace(/message: AssistantMessage;\n\s+showSources: boolean;/, "message: AssistantMessage;\n    language: string;\n    showSources: boolean;");

// Update ChatMessage destructuring
c = c.replace(/function ChatMessage\(\{\n\s+message,\n\s+showSources,/, "function ChatMessage({\n    message,\n    language,\n    showSources,");

// Also, the previous patch might not have added language to ChatMessage rendering properly, let's fix that.
// The previous regex was: c = c.replace(/<MessageBubble\s+key=\{message\.id\}\s+message=\{message\}/g, ... 
// But it was ChatMessage, not MessageBubble!
c = c.replace(/<ChatMessage\n\s+key=\{message\.id\}\n\s+message=\{message\}/g, "<ChatMessage\n                key={message.id}\n                language={language}\n                message={message}");

fs.writeFileSync(p, c);
console.log("ChatMessage language props fixed!");
