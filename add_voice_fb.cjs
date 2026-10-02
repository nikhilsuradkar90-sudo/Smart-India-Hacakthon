const fs = require('fs');
const p = 'server/gemini-voice.ts';
let c = fs.readFileSync(p, 'utf-8');

const target = `        const chatCompletion = await groq.chat.completions.create({
            messages: formattedHistory,
            model: groqModel,
            temperature: 0.7,
            max_tokens: 1500,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "I am sorry, I could not process that.";`;

const replacement = `        let responseText = "";
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: formattedHistory,
                model: groqModel,
                temperature: 0.7,
                max_tokens: 1500,
            });
            responseText = chatCompletion.choices[0]?.message?.content || "";
        } catch (apiError: any) {
            console.warn("Primary voice model failed, using Qwen fallback...", apiError.message);
            const fallbackCompletion = await groq.chat.completions.create({
                messages: formattedHistory,
                model: 'qwen/qwen3.8-27b',
                temperature: 0.7,
                max_tokens: 1500,
            });
            responseText = fallbackCompletion.choices[0]?.message?.content || "";
        }
        
        if (!responseText) responseText = "I am sorry, I could not process that.";`;

if (c.includes(target)) {
    c = c.replace(target, replacement);
    fs.writeFileSync(p, c);
    console.log("Voice fallback added!");
} else {
    console.log("Target not found!");
}
