const fs = require('fs');
const p = 'src/components/layout/TopBar.tsx';
let c = fs.readFileSync(p, 'utf-8');

const oldBadgesBlock = `        {/* Sarkari Badges */}
        <div className="hidden xl:flex items-center gap-3 mr-2 ml-4">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-orange-600 tracking-tighter leading-none">G2</span>
            <span className="text-[10px] font-bold text-green-700 tracking-tighter leading-none"> - _    2026</span>
          </div>
          <div className="h-6 w-px bg-border mx-1"></div>
          <div className="flex flex-col items-center justify-center text-[9px] font-bold text-gray-600 leading-tight">
            <span> ,?  s? ></span>
            <span> - _   </span>
          </div>
        </div>`;

// Regex matching the block
const regex = /\{\/\* Sarkari Badges \*\/\}\s*<div className="hidden xl:flex items-center gap-3 mr-2 ml-4">[\s\S]*?<\/div>\s*<\/div>/;

const newBadgesBlock = `        {/* Official Logos */}
        <div className="hidden lg:flex items-center gap-6 mr-2 ml-6">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="Government of India" 
            className="h-10 w-auto object-contain drop-shadow-sm"
          />
          <div className="h-8 w-px bg-border/50"></div>
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/2/29/Bureau_of_Indian_Standards_Logo.svg" 
            alt="Bureau of Indian Standards" 
            className="h-10 w-auto object-contain drop-shadow-sm"
          />
          <div className="h-8 w-px bg-border/50"></div>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Digital_India_logo.svg" 
            alt="Digital India" 
            className="h-8 w-auto object-contain drop-shadow-sm"
          />
        </div>`;

if (regex.test(c)) {
    c = c.replace(regex, newBadgesBlock);
    fs.writeFileSync(p, c);
    console.log("SUCCESS: Logos replaced in TopBar!");
} else {
    console.log("FAILED to find Sarkari Badges block using regex");
    // Fallback: replace manually
    const fallbackRegex = /\{\/\* Sarkari Badges \*\/\}(.|\n)*?\{\/\* Language selector \(top bar\) \*\/\}/g;
    if (fallbackRegex.test(c)) {
        c = c.replace(fallbackRegex, newBadgesBlock + '\n\n        {/* Language selector (top bar) */}');
        fs.writeFileSync(p, c);
        console.log("SUCCESS using fallback regex!");
    } else {
        console.log("Fallback failed too.");
    }
}
