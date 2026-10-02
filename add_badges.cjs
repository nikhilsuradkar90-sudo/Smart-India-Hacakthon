const fs = require('fs');
const p = 'src/components/layout/TopBar.tsx';
let c = fs.readFileSync(p, 'utf-8');

const badges = `
        {/* Sarkari Badges */}
        <div className="hidden xl:flex items-center gap-3 mr-2 ml-4">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-orange-600 tracking-tighter leading-none">G2</span>
            <span className="text-[10px] font-bold text-green-700 tracking-tighter leading-none">भारत 2026</span>
          </div>
          <div className="h-6 w-px bg-border mx-1"></div>
          <div className="flex flex-col items-center justify-center text-[9px] font-bold text-gray-600 leading-tight">
            <span>स्वच्छ</span>
            <span>भारत</span>
          </div>
        </div>
`;

if (!c.includes('Sarkari Badges')) {
    c = c.replace('{/* Language selector (top bar) */}', badges + '\n        {/* Language selector (top bar) */}');
    fs.writeFileSync(p, c);
    console.log("Badges added!");
} else {
    console.log("Badges already present.");
}
