with open("server/index.ts", "r") as f:
    lines = f.readlines()

# The bad lines start after line 219 (the end of the ai health check) 
# and end at line 258 `});`
new_lines = lines[:219] + lines[258:]

with open("server/index.ts", "w") as f:
    f.writelines(new_lines)
