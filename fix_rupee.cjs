const fs = require('fs');
const p = 'src/pages/CostEstimatorPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

// Replace everything that looks like the corrupted rupee symbol with proper ₹
c = c.replace(/,1/g, '₹');
c = c.replace(/,1/g, '₹');

// Let's also look for that big total: <h2 className="text-4xl font-bold mb-4">,1{result.total.toLocaleString()}*</h2>
c = c.replace(/<h2 className="text-4xl font-bold mb-4">.*?\{result\.total\.toLocaleString\(\)\}\*<\/h2>/, '<h2 className="text-4xl font-bold mb-4">₹{result.total.toLocaleString()}*</h2>');

// Also manually replace the 3 smaller ones just in case
c = c.replace(/<p className="text-xl font-bold text-foreground">.*?\{result\.applicationFee\}<\/p>/g, '<p className="text-xl font-bold text-foreground">₹{result.applicationFee}</p>');
c = c.replace(/<p className="text-xl font-bold text-foreground">.*?\{result\.inspectionFee\.toLocaleString\(\)\}<\/p>/g, '<p className="text-xl font-bold text-foreground">₹{result.inspectionFee.toLocaleString()}</p>');
c = c.replace(/<p className="text-xl font-bold text-foreground">.*?\{result\.markingFee\.toLocaleString\(\)\}<\/p>/g, '<p className="text-xl font-bold text-foreground">₹{result.markingFee.toLocaleString()}</p>');

fs.writeFileSync(p, c);
console.log("SUCCESS: Fixed rupee symbol!");
