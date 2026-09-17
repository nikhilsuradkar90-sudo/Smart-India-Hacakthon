require('dotenv').config();

async function testGroqChat() {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{role: 'user', content: 'test'}]
      })
    });
    console.log(`GROQ Chat Access: ${res.status}`);
  } catch (e) {
    console.log("GROQ Chat Access: FAILED");
  }
}

async function testOpenAIChat() {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) return;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: 'test'}]
      })
    });
    console.log(`OPENAI Chat Access: ${res.status}`);
  } catch (e) {
    console.log("OPENAI Chat Access: FAILED");
  }
}

async function run() {
  await testGroqChat();
  await testOpenAIChat();
}

run();
