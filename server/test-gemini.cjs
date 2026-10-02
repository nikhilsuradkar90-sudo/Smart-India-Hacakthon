const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'server/.env' });

async function test() {
    const apiKey = process.env.GEMINI_VOICE_API_KEY || '';
    console.log("Using API Key:", apiKey ? "FOUND" : "NOT FOUND", apiKey.substring(0, 10) + '...');
    
    if (!apiKey) {
        console.error("No API key");
        return;
    }
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        console.log("Sending message...");
        const result = await model.generateContent("Hello test");
        console.log("Success! Response:", result.response.text());
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e.message || e);
    }
}

test();
