const fs = require('fs');
const p = 'src/components/layout/TopBar.tsx';
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(/className="h-10 w-auto object-contain drop-shadow-sm"/g, 'className="h-10 w-auto object-contain drop-shadow-sm bg-white/80 p-0.5 rounded-sm dark:bg-white"');
c = c.replace(/className="h-8 w-auto object-contain drop-shadow-sm"/g, 'className="h-8 w-auto object-contain drop-shadow-sm bg-white/80 p-0.5 rounded-sm dark:bg-white"');

fs.writeFileSync(p, c);
console.log("SUCCESS: Made logos dark-mode friendly");
