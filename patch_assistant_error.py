import re

with open('src/services/index.ts', 'r') as f:
    content = f.read()

content = content.replace("status: 'complete',", "status: data.isError ? 'error' : 'complete',")
content = content.replace("sources: sources", "sources: data.isError ? [] : sources")

with open('src/services/index.ts', 'w') as f:
    f.write(content)
