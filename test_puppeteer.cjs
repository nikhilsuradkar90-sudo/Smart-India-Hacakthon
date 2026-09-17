const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://standards.bis.gov.in/website/published-standards/published-standard-deptwise', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 5000));
  
  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, h1, h2, h3, h4, h5, td, div')).map(el => el.textContent.trim()).filter(t => t.length > 5 && t.length < 100);
  });
  
  console.log(Array.from(new Set(texts)).slice(0, 50).join('\n'));
  await browser.close();
})();
