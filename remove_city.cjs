const fs = require('fs');
const p = 'src/pages/LaboratoryFinderPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

// 1. Remove state
c = c.replace(/const \[city, setCity\] = useState\(''\);\s*/, '');

// 2. Remove filter property
c = c.replace(/city: city\.trim\(\) !== '' \? city\.trim\(\) : undefined,\s*/, '');

// 3. Remove JSX Input
const inputJsx = /<Input\s*value=\{city\}\s*onChange=\{\(e\) => setCity\(e\.target\.value\)\}\s*placeholder="City \(e\.g\. Jaipur\)"\s*aria-label="City"\s*\/>/;
c = c.replace(inputJsx, '');

// 4. Update the no results string
c = c.replace('or changing the state/city', 'or changing the state');

fs.writeFileSync(p, c);
console.log("Successfully removed city option from LaboratoryFinderPage");
