import sys

with open('src/services/index.ts', 'r') as f:
    content = f.read()

content = content.replace("status: 'sent'", "status: 'complete'")
content = content.replace("regenerateResponse(messageId: string)", "regenerateResponse(messageId: string, language?: string)")

with open('src/services/index.ts', 'w') as f:
    f.write(content)
