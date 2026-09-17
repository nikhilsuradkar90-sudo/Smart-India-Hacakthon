from bs4 import BeautifulSoup

with open('lims_labs.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

table = soup.find('table', id='dataTable')
tbody = table.find('tbody')
rows = tbody.find_all('tr')

for row in rows[:5]:
    cols = row.find_all('td')
    if len(cols) > 0:
        lab_code = cols[1].text.strip()
        name = cols[2].text.strip()
        address = cols[3].text.strip()
        print(f"Code: {lab_code}")
        print(f"Name: {name}")
        print(f"Address: {address}")
        print("-" * 20)

print(f"Total rows: {len(rows)}")
