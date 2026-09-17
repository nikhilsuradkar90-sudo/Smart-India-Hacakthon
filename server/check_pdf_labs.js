const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfDir = '/Users/gauravkumar/.gemini/antigravity/brain/529c779e-925c-4134-a493-9fe3b6b567e6/.user_uploaded/';
const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

async function checkPDFs() {
  for (const file of files) {
    let dataBuffer = fs.readFileSync(path.join(pdfDir, file));
    try {
      const data = await pdf(dataBuffer, { max: 10 });
      const text = data.text.toLowerCase();
      const labCount = (text.match(/laborator/g) || []).length;
      console.log(`${file}: found 'laborator' ${labCount} times in first 10 pages.`);
    } catch(e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  }
}
checkPDFs();
