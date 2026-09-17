import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
urllib.request.install_opener(opener)

res = urllib.request.urlopen("https://standards.bis.gov.in/main.1425e25aecf1cea2.js")
text = res.read().decode('utf-8')
idx = text.find("projectServiceurl:")
if idx != -1:
    print(text[idx-50:idx+200])
else:
    print("Not found")
