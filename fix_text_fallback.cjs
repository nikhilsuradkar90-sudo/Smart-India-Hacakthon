const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'ai-provider.ts');
let c = fs.readFileSync(p, 'utf-8');

const oldGroq = `    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: apiMessages,
      temperature: 0.2
    });
    return response.choices[0]?.message?.content || '';`;

const newGroq = `    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: apiMessages,
        temperature: 0.2
      });
      return response.choices[0]?.message?.content || '';
    } catch (e: any) {
      console.warn("[Groq] Primary model failed, trying fallback model...", e.message);
      // Automatically fallback to an alternate free model on the proxy if the primary one is rate-limited!
      const fallbackResponse = await this.client.chat.completions.create({
        model: 'qwen/qwen3.8-27b',
        messages: apiMessages,
        temperature: 0.2
      });
      return fallbackResponse.choices[0]?.message?.content || '';
    }`;

c = c.replace(oldGroq, newGroq);
fs.writeFileSync(p, c);
console.log("ADDED FALLBACK TO TEXT AI");
