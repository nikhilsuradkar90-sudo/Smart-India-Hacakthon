const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('standardsadmin') || url.includes('standardsmodule')) {
      console.log('API call:', url);
    }
  });

  await page.goto('https://standards.bis.gov.in/website/published-standards/published-standard-deptwise', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to click the first department card. 
  // It probably has an 'a' or 'button' tag inside or just the card itself.
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.card, a');
    for (let c of cards) {
      if (c.textContent.includes('AYUSH DEPARTMENT') || c.textContent.includes('DEPARTMENT')) {
        c.click();
        break;
      }
    }
  });
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
