const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfDir = '/Users/gauravkumar/.gemini/antigravity/brain/529c779e-925c-4134-a493-9fe3b6b567e6/.user_uploaded/';
const file = 'media_1789230620867.pdf';

async function extract() {
  let dataBuffer = fs.readFileSync(path.join(pdfDir, file));
  const data = await pdf(dataBuffer);
  const text = data.text;
  
  const regex = /.{0,50}laborator.{0,50}/gi;
  const matches = text.match(regex);
  if (matches) {
    matches.forEach(m => console.log('---', m.replace(/\n/g, ' ')));
  }
}
extract();
