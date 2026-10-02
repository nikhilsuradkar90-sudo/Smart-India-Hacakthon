const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'gemini-voice.ts');
let c = fs.readFileSync(p, 'utf-8');

const oldVoice = `        const chatCompletion = await groq.chat.completions.create({
            messages: formattedHistory,
            model: groqModel,
            temperature: 0.7,
            max_tokens: 1500,
        });

        let responseText = chatCompletion.choices[0]?.message?.content || "";`;

const newVoice = `        let responseText = "";
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: formattedHistory,
                model: groqModel,
                temperature: 0.7,
                max_tokens: 1500,
            });
            responseText = chatCompletion.choices[0]?.message?.content || "";
        } catch (apiError: any) {
            console.warn("Primary voice model rate-limited, falling back to Qwen...", apiError.message);
            const fallbackCompletion = await groq.chat.completions.create({
                messages: formattedHistory,
                model: 'qwen/qwen3.8-27b',
                temperature: 0.7,
                max_tokens: 1500,
            });
            responseText = fallbackCompletion.choices[0]?.message?.content || "";
        }`;

c = c.replace(oldVoice, newVoice);
fs.writeFileSync(p, c);
console.log("ADDED FALLBACK TO VOICE AI");
