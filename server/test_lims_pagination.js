const axios = require('axios');
const cheerio = require('cheerio');

async function testPagination() {
  try {
    for (let p = 21; p <= 24; p++) {
      const res = await axios.get(`https://lims.bis.gov.in/home/labs/?page=${p}`);
      const $ = cheerio.load(res.data);
      const rows = $('#dataTable tbody tr');
      if (rows.length > 0) {
        const firstLab = $(rows[0]).find('td').eq(1).text().trim();
        console.log(`Page ${p} rows: ${rows.length}, first lab: ${firstLab}`);
      } else {
        console.log(`Page ${p} rows: 0`);
      }
      
      const activePage = $('.pagination .active span').text().trim();
      console.log(`Active pagination text: ${activePage}`);
    }
  } catch (err) {
    console.error(err.message);
  }
}
testPagination();
