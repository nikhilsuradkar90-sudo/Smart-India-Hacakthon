const axios = require('axios');
const qs = require('qs');

async function test() {
  const url = 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Indian_standards/searchIS?seachby=&txt_search=';
  const data = {
    draw: '1',
    start: '0',
    length: '10',
    'search[value]': '',
    'search[regex]': 'false',
    'columns[0][data]': 'id',
    'columns[0][name]': '',
    'columns[0][searchable]': 'true',
    'columns[0][orderable]': 'true',
    'columns[0][search][value]': '',
    'columns[0][search][regex]': 'false'
  };

  try {
    const res = await axios.post(url, qs.stringify(data), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log('Status Code:', res.status);
    console.log('Response format:', typeof res.data);
    console.log('Response text:', JSON.stringify(res.data).substring(0, 500));
  } catch (error) {
    console.error(error.message);
  }
}
test();
