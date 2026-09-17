const fs = require('fs');
let code = fs.readFileSync('src/pages/AssistantPage.tsx', 'utf8');

const oldHandleSend = `  const handleSend = useCallback(async (text?: string) => {
    const queryText = (text || input).trim();
    if (!queryText || isSending) return;`;

const newHandleSend = `  const handleSend = useCallback(async (text?: string) => {
    let queryText = (text || input).trim();
    
    // Safely incorporate file if present to prevent getting stuck
    if (selectedFile) {
      queryText = queryText ? \`\${queryText} [Attached File: \${selectedFile.name}]\` : \`[Attached File: \${selectedFile.name}]\`;
    }
    
    if (!queryText || isSending) return;
    
    // Clear file selection after sending
    setSelectedFile(null);`;

code = code.replace(oldHandleSend, newHandleSend);
fs.writeFileSync('src/pages/AssistantPage.tsx', code);
