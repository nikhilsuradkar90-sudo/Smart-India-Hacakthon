const fs = require('fs');
const p = 'server/index.ts';
let c = fs.readFileSync(p, 'utf-8');

if (!c.includes('uncaughtException')) {
  const protection = `
// ==========================================
// 🛡️ CRASH SHIELD (PREVENTS DATA LOSS / SERVER DEATH)
// ==========================================
process.on('uncaughtException', (err) => {
  console.error('[CRASH SHIELD] Ignored Uncaught Exception to keep server alive:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH SHIELD] Ignored Unhandled Rejection to keep server alive:', reason);
});
`;
  c = protection + c;
  fs.writeFileSync(p, c);
  console.log('Crash protection added!');
}
