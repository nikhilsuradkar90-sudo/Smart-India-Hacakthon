with open('src/pages/AssistantPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Bot, User,", "import { Bot, User, X,")

with open('src/pages/AssistantPage.tsx', 'w') as f:
    f.write(content)
