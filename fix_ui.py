import re

# Fix AssistantPage
with open('src/pages/AssistantPage.tsx', 'r') as f:
    content = f.read()
    
# Replace the broken handleKeyDown
broken_handle = """    if (e.key === 'Enter') {
      if (settings.enterToSend && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };"""
fixed_handle = """    if (e.key === 'Enter') {
      if (settings.enterToSend && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };"""
content = content.replace(broken_handle, fixed_handle)

with open('src/pages/AssistantPage.tsx', 'w') as f:
    f.write(content)

# Fix TopBar
with open('src/components/layout/TopBar.tsx', 'r') as f:
    content = f.read()

# The awk script messed up the string interpolation inside className
broken_line = r"className={`p-4 border-b last:border-0 ${notif.read ? '\\''opacity-60'\\' : '\\''bg-primary/5'\\''}`}"
fixed_line = r"className={`p-4 border-b last:border-0 ${notif.read ? 'opacity-60' : 'bg-primary/5'}`}"
content = content.replace(broken_line, fixed_line)

with open('src/components/layout/TopBar.tsx', 'w') as f:
    f.write(content)

