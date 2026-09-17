import re

with open('server/rag.ts', 'r') as f:
    content = f.read()

content = re.sub(r'const ignoreFilter = false\(p =>[\s\S]*?\);\n', '', content)

with open('server/rag.ts', 'w') as f:
    f.write(content)
