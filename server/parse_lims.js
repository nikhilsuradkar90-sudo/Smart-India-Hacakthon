const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('lims_labs.html', 'utf-8');
const $ = cheerio.load(html);

const rows = $('#dataTable tbody tr');

rows.each((i, row) => {
    const cols = $(row).find('td');
    if (cols.length > 0) {
        const sno = $(cols[0]).text().trim();
        const code = $(cols[1]).text().trim();
        const name = $(cols[2]).text().trim();
        const address = $(cols[3]).text().trim().replace(/\s+/g, ' ');
        const contactPerson = $(cols[4]).text().trim().replace(/\s+/g, ' ');
        const mobile = $(cols[5]).text().trim();
        const validTill = $(cols[6]).text().trim();
        
        if (i < 5) {
            console.log(`Code: ${code}`);
            console.log(`Name: ${name}`);
            console.log(`Address: ${address}`);
            console.log(`Contact Person: ${contactPerson}`);
            console.log(`Mobile: ${mobile}`);
            console.log(`Valid Till: ${validTill}`);
            console.log('---');
        }
    }
});

console.log(`Total rows: ${rows.length}`);
