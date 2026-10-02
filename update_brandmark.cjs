const fs = require('fs');
const p = 'src/components/layout/Sidebar.tsx';
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(/import \{([^\}]+)\} from 'lucide-react';/, (match, p1) => {
    if (!p1.includes('Landmark')) {
        return `import {${p1}, Landmark } from 'lucide-react';`;
    }
    return match;
});

const oldLogo = `<div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">{APP_NAME}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{APP_TAGLINE}</span>
          </div>`;

const newLogo = `<div className="flex flex-col">
            <span className="text-xs font-bold text-orange-600 leading-tight">भारतीय मानक ब्यूरो</span>
            <span className="text-[13px] font-black text-blue-900 dark:text-blue-400 leading-tight">Bureau of Indian Standards</span>
            <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">{APP_NAME}</span>
          </div>`;

const oldIcon = `<ShieldCheck className="h-5 w-5" aria-hidden="true" />`;
const newIcon = `<Landmark className="h-5 w-5 text-white" aria-hidden="true" />`;

c = c.replace(oldLogo, newLogo);
c = c.replace(oldIcon, newIcon);
c = c.replace('bg-primary text-primary-foreground', 'bg-blue-900 shadow-md');

fs.writeFileSync(p, c);
console.log('Sidebar updated');
