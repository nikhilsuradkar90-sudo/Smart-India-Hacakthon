const fs = require('fs');
let code = fs.readFileSync('server/index.ts', 'utf8');

// Replace the chat API to format standard output and handle errors correctly
const oldChatApi = /app\.post\('\/api\/chat', async \(req, res\) => \{[\s\S]*?\}\);/;

const newChatApi = `app.post('/api/chat', async (req, res) => {
  const { message, language, history } = req.body;
  if (!message) return res.status(400).json({ success: false, data: null, error: { code: 'BAD_REQUEST', message: 'Message is required' } });

  try {
    const contextQuery = (history && history.length > 0) ? (history[history.length - 2]?.content || '') + ' ' + message : message;
    
    // Semantic search is guaranteed not to throw due to catch block in rag.ts
    const topChunks = await semanticSearch(contextQuery, 3);
    
    let answer = '';
    try {
      answer = await generateRagAnswer(message, topChunks, language || 'en', history || []);
    } catch (llmErr: any) {
      console.error("[Chat API] AI Generation Error:", llmErr.message);
      let errorMsg = 'Failed to generate response.';
      let errCode = 'AI_GENERATION_FAILED';
      
      if (llmErr.message === 'AI_TIMEOUT') {
        errorMsg = 'The AI service took too long to respond. Please try again.';
        errCode = 'AI_TIMEOUT';
      } else if (llmErr.message === 'AI_RATE_LIMIT') {
        errorMsg = 'The AI service is temporarily busy due to high traffic. Please wait a moment.';
        errCode = 'AI_RATE_LIMIT';
      } else if (llmErr.message === 'AI_SERVICE_UNAVAILABLE') {
        errorMsg = 'The AI service is currently unavailable. We are recovering, please try again shortly.';
        errCode = 'AI_SERVICE_UNAVAILABLE';
      } else if (llmErr.message === 'AI_NOT_CONFIGURED') {
        errorMsg = 'The AI Assistant is not configured on the server.';
        errCode = 'AI_NOT_CONFIGURED';
      }
      
      return res.status(200).json({
        success: false,
        data: null,
        error: { code: errCode, message: errorMsg }
      });
    }

    const citations = topChunks.map((c: any, index: number) => ({
      id: c.id,
      citationIndex: index + 1,
      documentTitle: c.document?.title,
      standardNumber: c.standardNumber,
      pageNumber: c.page?.pageNumber,
      section: c.section?.heading,
      text: c.text,
      score: c.score
    }));

    return res.status(200).json({
      success: true,
      data: {
        answer,
        citations,
        retrievedChunksCount: topChunks.length
      },
      error: null
    });
  } catch (err: any) {
    console.error('[Chat API] Unhandled exception:', err);
    return res.status(500).json({ 
      success: false, 
      data: null, 
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected internal error occurred.' }
    });
  }
});

import { aiService } from './ai-provider';
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health/ai', (req, res) => {
  res.json({ status: aiService.getStatus(), timestamp: new Date().toISOString() });
});
`;

code = code.replace(oldChatApi, newChatApi);
fs.writeFileSync('server/index.ts', code);
