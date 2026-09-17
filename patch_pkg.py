import json

with open('package.json', 'r') as f:
    data = json.load(f)

data['scripts']['dev'] = 'concurrently "npm run start:backend" "npm run start:frontend"'
data['scripts']['start:frontend'] = 'vite'
data['scripts']['start:backend'] = 'cd server && npx ts-node index.ts'
data['scripts']['backup:data'] = "cp /Users/gauravkumar/.bis_data/production.db /Users/gauravkumar/.bis_data/production-backup-$(date +%Y-%m-%d-%H-%M).db && echo 'Backup successful'"
data['scripts']['verify:data'] = "cd server && npx ts-node verify_data.ts"

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
