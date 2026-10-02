import * as http from 'http';

http.get('http://localhost:3001/api/standards?group=Electrical%20%26%20Electronics', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log("Pagination:", parsed.pagination);
  });
});
