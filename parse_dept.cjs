const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('bis_dept_dom.html', 'utf-8');
const $ = cheerio.load(html);

console.log($('body').text().replace(/\s+/g, ' ').substring(0, 1000));
