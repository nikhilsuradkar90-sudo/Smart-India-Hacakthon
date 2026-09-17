require('dotenv').config();

console.log("Checking Environment Variables...");

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log("DATABASE_URL: Configured");
} else {
  console.log("DATABASE_URL: MISSING");
}

const openAiKey = process.env.OPENAI_API_KEY;
if (openAiKey) {
  console.log("OPENAI_API_KEY: Configured");
} else {
  console.log("OPENAI_API_KEY: MISSING");
}

const groqKey = process.env.GROQ_API_KEY;
if (groqKey) {
  console.log("GROQ_API_KEY: Configured");
} else {
  console.log("GROQ_API_KEY: MISSING");
}

async function testGroq() {
  if (!groqKey) return;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${groqKey}` }
    });
    if (res.ok) {
      console.log("GROQ API Access: SUCCESS");
    } else {
      console.log(`GROQ API Access: FAILED (${res.status})`);
    }
  } catch (e) {
    console.log("GROQ API Access: FAILED");
  }
}

async function testOpenAI() {
  if (!openAiKey) return;
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${openAiKey}` }
    });
    if (res.ok) {
      console.log("OPENAI API Access: SUCCESS");
    } else {
      console.log(`OPENAI API Access: FAILED (${res.status} - usually means 429 quota exceeded or 401 invalid)`);
    }
  } catch (e) {
    console.log("OPENAI API Access: FAILED");
  }
}

async function run() {
  await testGroq();
  await testOpenAI();
}

run();
