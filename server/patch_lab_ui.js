const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'LaboratoryFinderPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const targetGrid = '<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">';
const replaceGrid = '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">';

if (c.includes(targetGrid)) {
    c = c.replace(targetGrid, replaceGrid);
}

const targetState = `            <Select value={state} onValueChange={setState}>
              <SelectTrigger aria-label="State"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LABORATORY_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>`;
            
const cityInput = `            <Input 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="City (e.g. Jaipur)" 
              aria-label="City" 
            />`;

if (c.includes(targetState) && !c.includes('value={city}')) {
    c = c.replace(targetState, targetState + "\n\n" + cityInput);
    fs.writeFileSync(p, c);
    console.log("City input added to UI!");
} else {
    console.log("City input failed.");
}
