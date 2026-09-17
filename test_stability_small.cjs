const http = require('http');
async function ask(query, id) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ message: query, language: 'en', history: [] });
    const req = http.request('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.success) {
            console.log(`[${id}] Success! Answer length: ${json.data.answer.length}`);
          } else {
            console.log(`[${id}] Error Response:`, json.error.message);
          }
        } catch (e) {
          console.log(`[${id}] Failed to parse JSON`, res.statusCode);
        }
        resolve();
      });
    });
    req.on('error', (e) => {
      console.error(`[${id}] Request Error:`, e.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}
async function run() {
  for (let i = 1; i <= 5; i++) {
    await ask(`What is the standard for item ${i}?`, i);
    await new Promise(r => setTimeout(r, 500));
  }
}
run();
