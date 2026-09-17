const fs = require('fs');
let code = fs.readFileSync('src/pages/AssistantPage.tsx', 'utf8');

const oldBlock = `    if (result.error || !result.data) {
      updateMessage(loadingMessage.id, {
        content: 'Sorry, there was an error processing your request.',
        status: 'error',
      });
    } else {
      updateMessage(loadingMessage.id, result.data);
    }`;

const newBlock = `    try {
      if (!result.data) {
        updateMessage(loadingMessage.id, {
          content: 'Sorry, there was an error processing your request.',
          status: 'error',
        });
      } else {
        updateMessage(loadingMessage.id, result.data);
      }
    } finally {
      setIsSending(false);
    }`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/AssistantPage.tsx', code);
