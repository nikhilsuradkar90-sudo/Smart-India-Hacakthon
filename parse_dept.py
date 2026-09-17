from bs4 import BeautifulSoup

with open('bis_dept_dom.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("--- Links containing 'dept' or 'department' ---")
for a in soup.find_all('a'):
    href = a.get('href')
    if href and ('dept' in href.lower() or 'department' in href.lower() or 'committee' in href.lower() or 'published-standard' in href.lower()):
        print(f"Text: {a.text.strip()} | Href: {href}")

print("\n--- Any list items or divs that might be categories ---")
for div in soup.find_all('div', class_=lambda c: c and 'card' in c.lower()):
    print(div.text.strip()[:100])
