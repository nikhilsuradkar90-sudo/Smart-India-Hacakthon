import re

with open('src/services/index.ts', 'r') as f:
    content = f.read()

content = content.replace("productCategories: [lab.category || 'BIS Recognized Labs'],", "productCategories: [lab.category || 'BIS Recognized Labs'],\n        state: lab.state || 'Unknown',\n        recognition: 'bis-recognized',\n        recognitionLabel: 'BIS Recognized',")

with open('src/services/index.ts', 'w') as f:
    f.write(content)
