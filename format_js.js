const fs = require('fs');
const js = fs.readFileSync('main.js', 'utf-8');
const lines = js.split(';').map(s => s.trim()).filter(s => s.length > 0);
fs.writeFileSync('main_formatted.js', lines.join(';\n'));
