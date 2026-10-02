const fs = require('fs');
const p = 'src/components/layout/TopBar.tsx';
let c = fs.readFileSync(p, 'utf-8');

const regex = /\{\/\* Sarkari Badges \*\/\}\s*<div className="hidden xl:flex items-center gap-3 mr-2 ml-4">[\s\S]*?<\/div>\s*<\/div>/;

const newBadgesBlock = `{/* Official Logos */}
        <div className="hidden sm:flex items-center gap-3 md:gap-4 mr-2 ml-auto md:ml-4">
          <img 
            src="/emblem.svg" 
            alt="Government of India" 
            className="h-8 md:h-10 w-auto object-contain drop-shadow-sm bg-white p-0.5 rounded-sm"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="h-6 md:h-8 w-px bg-border/50"></div>
          <img 
            src="/bis.png" 
            alt="Bureau of Indian Standards" 
            className="h-8 md:h-10 w-auto object-contain drop-shadow-sm bg-white p-0.5 rounded-sm"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="h-6 md:h-8 w-px bg-border/50"></div>
          <div className="flex flex-col items-center justify-center bg-white px-1.5 py-0.5 rounded-sm drop-shadow-sm border border-gray-100">
            <span className="text-[11px] font-bold text-red-600 tracking-tighter leading-none">Digital</span>
            <span className="text-[11px] font-bold text-gray-800 tracking-tighter leading-none mt-0.5">India</span>
          </div>
        </div>`;

if (regex.test(c)) {
    c = c.replace(regex, newBadgesBlock);
    fs.writeFileSync(p, c);
    console.log("SUCCESS: Replaced Badges safely.");
} else {
    console.log("FAILED to match regex!");
}
