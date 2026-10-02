const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'services', 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

const tSearch = "if (filters.state && filters.state !== 'All States') params.append('state', filters.state);";
const rSearch = "if (filters.state && filters.state !== 'All States') params.append('state', filters.state);\n      if (filters.city && filters.city.trim() !== '') params.append('city', filters.city.trim());";
if (c.includes(tSearch) && !c.includes("params.append('city'")) {
    c = c.replace(tSearch, rSearch);
}

// Map the new fields in both search and getById
const tMap = "contact: lab.email || lab.phone || lab.contactPerson,";
const rMap = "contact: lab.email || lab.phone || lab.contactPerson,\n        phone: lab.phone,\n        email: lab.email,\n        validityDate: lab.validityDate,\n        labCode: lab.labCode,\n        status: lab.status,";

// Do global replace safely since it appears twice
if (c.includes(tMap) && !c.includes("validityDate: lab.validityDate")) {
    c = c.replace(new RegExp(tMap, 'g'), rMap);
    fs.writeFileSync(p, c);
    console.log("Services patched for new fields and city search!");
} else {
    console.log("Services patch failed or already done.");
}
