const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'services', 'index.ts');
let c = fs.readFileSync(p, 'utf-8');

// 1. Restore Standards filters
const t1 = "if (filters.status && filters.status !== 'all') params.append('status', filters.status);";
const r1 = "if (filters.status && filters.status !== 'all') params.append('status', filters.status);\n        if (filters.category && filters.category !== 'All Categories') params.append('group', filters.category);\n        if (filters.industry && filters.industry !== 'All Industries') params.append('subGroup', filters.industry);";
c = c.replace(t1, r1);

// 2. Restore Lab filters (testType & city)
const t2 = "if (filters.productCategory && filters.productCategory !== 'All Categories') params.append('category', filters.productCategory);";
const r2 = "if (filters.productCategory && filters.productCategory !== 'All Categories') params.append('category', filters.productCategory);\n      if (filters.testType && filters.testType !== 'All Test Types') params.append('testType', filters.testType);\n      if (filters.city && filters.city.trim() !== '') params.append('city', filters.city.trim());";
c = c.replace(t2, r2);

// 3. Lab location mapping fix
const t3 = "location: lab.state || lab.city || lab.address,";
const r3 = "location: lab.address || lab.state,";
c = c.split(t3).join(r3); // global string replace

// 4. Lab new field mappings
const t4 = "contact: lab.email || lab.phone || lab.contactPerson,";
const r4 = "contact: lab.email || lab.phone || lab.contactPerson,\n        phone: lab.phone,\n        email: lab.email,\n        validityDate: lab.validityDate,\n        labCode: lab.labCode,\n        status: lab.status,";
c = c.split(t4).join(r4); // global string replace

fs.writeFileSync(p, c);
console.log("Service restored and patched completely!");
