const fs = require('fs');
const p = 'src/pages/AssistantPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

const oldUseEffect = `  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }, [session]);`;

const newUseEffect = `  useEffect(() => {
    try {
      let dataToSave = session;
      // Auto-truncate to last 20 messages to prevent QuotaExceededError
      if (session.messages.length > 20) {
        dataToSave = { ...session, messages: session.messages.slice(-20) };
      }
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e: any) {
      console.error('Failed to save chat history:', e);
      // If still hitting limit (e.g. huge chunks), drastically reduce
      if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ ...session, messages: session.messages.slice(-5) }));
        } catch(e2) {
          console.error('Completely failed to save chat.', e2);
        }
      }
    }
  }, [session]);`;

if (c.includes(oldUseEffect)) {
    c = c.replace(oldUseEffect, newUseEffect);
    fs.writeFileSync(p, c);
    console.log("Successfully replaced useEffect");
} else {
    console.log("Target useEffect not found");
}
