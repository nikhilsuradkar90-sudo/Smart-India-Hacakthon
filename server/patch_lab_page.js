const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'pages', 'LaboratoryFinderPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

// 1. Add city state
const stateDec = "const [state, setState] = useState('All States');";
if (c.includes(stateDec) && !c.includes("const [city, setCity]")) {
    c = c.replace(stateDec, stateDec + "\n  const [city, setCity] = useState('');");
}

// 2. Add city to filters
const filtersObj = "query: query.trim() || undefined,";
if (c.includes(filtersObj) && !c.includes("city: city.trim()")) {
    c = c.replace(filtersObj, filtersObj + "\n      city: city.trim() !== '' ? city.trim() : undefined,");
}

// 3. Add city dependency to useCallback
const doSearchDeps = "}, [query, state, productCategory, testType]);";
if (c.includes(doSearchDeps) && !c.includes("city")) {
    c = c.replace(doSearchDeps, "}, [query, state, city, productCategory, testType]);");
}

// 4. Update Smart Empty State message
const oldEmpty = '<NoResultsState message="No laboratories found." suggestion="Try different search terms or filters." />';
const newEmpty = '<NoResultsState message="No laboratories match your current filters." suggestion="Try removing a capability filter, broadening your search, or changing the state/city." />';
if (c.includes(oldEmpty)) {
    c = c.replace(oldEmpty, newEmpty);
}

fs.writeFileSync(p, c);
console.log("Lab Finder Page patched with City and Empty State!");
