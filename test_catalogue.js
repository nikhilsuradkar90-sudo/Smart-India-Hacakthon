const axios = require('axios');
const urls = [
  'https://standards.bis.gov.in/website/api/standards',
  'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/public/api/standards',
  'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/public/api/get_standards'
];

async function test() {
  for (const url of urls) {
    try {
      console.log(`Testing ${url}`);
      const res = await axios.get(url, { timeout: 3000 });
      console.log(`Status: ${res.status}`);
    } catch(e) {
      console.log(`Error: ${e.message}`);
    }
  }
}
test();
