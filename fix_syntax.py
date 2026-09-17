with open('src/pages/AssistantPage.tsx', 'r') as f:
    lines = f.read()

lines = lines.replace('{message.isDemo && (\n              \n            )}', '')

with open('src/pages/AssistantPage.tsx', 'w') as f:
    f.write(lines)
