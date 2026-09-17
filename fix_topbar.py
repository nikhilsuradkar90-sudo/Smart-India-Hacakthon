with open('src/components/layout/TopBar.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "className={`p-4 border-b last:border-0 ${notif.read" in line:
        lines[i] = "                  <div key={notif.id} className={`p-4 border-b last:border-0 ${notif.read ? 'opacity-60' : 'bg-primary/5'}`}>\n"

with open('src/components/layout/TopBar.tsx', 'w') as f:
    f.writelines(lines)
