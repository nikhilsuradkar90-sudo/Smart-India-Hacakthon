import urllib.request
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
urllib.request.install_opener(opener)

main_url = "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/"
req = urllib.request.Request(main_url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
cookie = '; '.join([v.split(';')[0] for k, v in res.getheaders() if k.lower() == 'set-cookie'])

url = "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Elasticsearch/gettitlesearchAjax"
data = urllib.parse.urlencode({
    'search': 'a',
    'type': '1',
    'wh': ''
}).encode('utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': main_url,
    'Cookie': cookie
}

req = urllib.request.Request(url, data=data, headers=headers)
try:
    res = urllib.request.urlopen(req)
    text = res.read().decode('utf-8')
    print("Length:", len(text))
    import json
    data = json.loads(text)
    print("Num results:", len(data))
    print(text[:500])
except Exception as e:
    print(e)
