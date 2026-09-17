import os
import glob
import re

def remove_demo_stuff(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove any `<DemoBadge ... />`
    content = re.sub(r'<\s*DemoBadge[^>]*\s*/>', '', content)
    
    # Remove Phase 1 - Demo Mode text
    content = content.replace('Phase 1 — Demo Mode', 'Live Mode')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

pages = glob.glob('src/pages/**/*.tsx', recursive=True)
components = glob.glob('src/components/**/*.tsx', recursive=True)

for file in pages + components:
    remove_demo_stuff(file)

print("Demo removal 2 complete")
