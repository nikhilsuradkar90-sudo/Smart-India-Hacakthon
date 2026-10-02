const fs = require('fs');
const p = 'src/components/layout/TopBar.tsx';
let c = fs.readFileSync(p, 'utf-8');

const newLogos = `<div className="hidden sm:flex items-center gap-3 md:gap-4 mr-2 ml-auto md:ml-4">
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
            <div className="flex flex-col items-center justify-center bg-white p-1 rounded-sm drop-shadow-sm">
              <span className="text-[10px] font-bold text-orange-600 tracking-tighter leading-none">Digital</span>
              <span className="text-[10px] font-bold text-gray-800 tracking-tighter leading-none">India</span>
            </div>
          </div>`;

const startIdx = c.indexOf('{/* Official Logos */}');
if (startIdx !== -1) {
    const endIdx = c.indexOf('</div>', c.indexOf('</div>', c.indexOf('</div>', startIdx) + 1) + 1) + 6;
    const toReplace = c.substring(startIdx, endIdx);
    c = c.replace(toReplace, '{/* Official Logos */}\n          ' + newLogos);
    fs.writeFileSync(p, c);
    console.log("SUCCESS: Added Digital India mock logo");
} else {
    console.log("FAILED to find Official Logos comment");
}
