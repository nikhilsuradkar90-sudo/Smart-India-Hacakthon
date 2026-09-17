import os
import glob
import re

def remove_demo_stuff(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove DemoBadge import
    content = re.sub(r'import\s+\{([^}]*?)DemoBadge([^}]*?)\}\s+from\s+[\'"]@/components/shared/trust-badges[\'"];?', 
                     lambda m: f"import {{{m.group(1)}{m.group(2).lstrip(', ')}}} from '@/components/shared/trust-badges';" if m.group(1).strip() or m.group(2).strip() else "", 
                     content)
    
    # Fix empty imports if any were created
    content = re.sub(r'import\s*\{\s*,\s*\}\s*from\s*[\'"]@/components/shared/trust-badges[\'"];?', '', content)
    content = re.sub(r'import\s*\{\s*\}\s*from\s*[\'"]@/components/shared/trust-badges[\'"];?', '', content)
    
    # Remove <DemoBadge /> component calls
    content = re.sub(r'<\s*DemoBadge\s*/?>', '', content)
    content = re.sub(r'\{.*isDemo\s*\?\s*<\s*DemoBadge\s*/?>\s*:\s*null\}', '', content)

    # Remove "Demo responses for UI demonstration. AI service will be connected in Phase 2."
    content = content.replace('Demo responses for UI demonstration. AI service will be connected in Phase 2.', '')
    
    # Remove "AI service not connected yet. Try one of the prompts below to see how the interface works."
    content = content.replace('AI service not connected yet. Try one of the prompts below to see how the interface works.', 'Select a prompt below to get started.')
    
    # Remove "Demo Mode" from AI Assistant
    content = content.replace('<Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">\n              <Beaker className="h-3 w-3 mr-1" />\n              Demo Mode\n            </Badge>', '')
    content = content.replace('<Badge variant="outline" className="text-warning border-warning/30 bg-warning/10"><Beaker className="h-3 w-3 mr-1" />Demo Mode</Badge>', '')
    
    # Let's just use regex for Demo Mode badge in AssistantPage.tsx
    content = re.sub(r'<Badge[^>]*>\s*<Beaker[^>]*/>\s*Demo Mode\s*</Badge>', '', content)
    content = re.sub(r'<Badge[^>]*>\s*<FlaskConical[^>]*/>\s*Demo Mode\s*</Badge>', '', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

pages = glob.glob('src/pages/**/*.tsx', recursive=True)
components = glob.glob('src/components/**/*.tsx', recursive=True)

for file in pages + components:
    remove_demo_stuff(file)

print("Demo removal complete")
