const fs = require('fs');
const p = 'src/components/layout/TopBar.tsx';
let c = fs.readFileSync(p, 'utf-8');

const oldLogos = `<div className="hidden lg:flex items-center gap-6 mr-2 ml-6">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="Government of India" 
              className="h-10 w-auto object-contain drop-shadow-sm bg-white/80 p-0.5 rounded-sm dark:bg-white"
            />
            <div className="h-8 w-px bg-border/50"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/2/29/Bureau_of_Indian_Standards_Logo.svg" 
              alt="Bureau of Indian Standards" 
              className="h-10 w-auto object-contain drop-shadow-sm bg-white/80 p-0.5 rounded-sm dark:bg-white"
            />
            <div className="h-8 w-px bg-border/50"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Digital_India_logo.svg" 
              alt="Digital India" 
              className="h-8 w-auto object-contain drop-shadow-sm bg-white/80 p-0.5 rounded-sm dark:bg-white"
            />
          </div>`;

const newLogos = `<div className="hidden sm:flex items-center gap-3 md:gap-4 mr-2 ml-auto md:ml-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png" 
              alt="Government of India" 
              className="h-8 md:h-10 w-auto object-contain drop-shadow-sm bg-white p-0.5 rounded-sm"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="h-6 md:h-8 w-px bg-border/50"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Bureau_of_Indian_Standards_Logo.svg/200px-Bureau_of_Indian_Standards_Logo.svg.png" 
              alt="Bureau of Indian Standards" 
              className="h-8 md:h-10 w-auto object-contain drop-shadow-sm bg-white p-0.5 rounded-sm"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="h-6 md:h-8 w-px bg-border/50"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Digital_India_logo.svg/200px-Digital_India_logo.svg.png" 
              alt="Digital India" 
              className="h-6 md:h-8 w-auto object-contain drop-shadow-sm bg-white p-0.5 rounded-sm"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>`;

// Safely replace it by looking for the Official Logos comment
const startIdx = c.indexOf('{/* Official Logos */}');
if (startIdx !== -1) {
    const endIdx = c.indexOf('</div>', c.indexOf('</div>', c.indexOf('</div>', startIdx) + 1) + 1) + 6;
    const toReplace = c.substring(startIdx, endIdx);
    c = c.replace(toReplace, '{/* Official Logos */}\n          ' + newLogos);
    fs.writeFileSync(p, c);
    console.log("SUCCESS: Patched Logos");
} else {
    console.log("FAILED to find Official Logos comment");
}
