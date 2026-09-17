import re
with open('src/services/index.ts', 'r') as f:
    content = f.read()

# Fix single quote string to template literal
content = content.replace("fetch('${import.meta.env.VITE_API_URL || \"http://localhost:3001\"}/api/chat'", "fetch(`${import.meta.env.VITE_API_URL || \"http://localhost:3001\"}/api/chat`")

with open('src/services/index.ts', 'w') as f:
    f.write(content)
