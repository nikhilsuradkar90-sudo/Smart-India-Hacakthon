const fs = require('fs');
const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

// Replace bolt.new images with a generic placeholder or remove them entirely.
// Let's replace it with a generic path like "/og-image.png"
content = content.replace(/https:\/\/bolt\.new\/static\/og_default\.png/g, '/og-image.png');

fs.writeFileSync(path, content);
console.log("Successfully removed bolt.new traces from index.html");
