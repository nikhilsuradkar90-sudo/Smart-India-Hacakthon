const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('standards')) {
      console.log('API call:', url);
    }
  });

  await page.goto('https://standards.bis.gov.in/website/published-standards/published-standard-deptwise', { waitUntil: 'networkidle0', timeout: 30000 });
  
  await browser.close();
})();
