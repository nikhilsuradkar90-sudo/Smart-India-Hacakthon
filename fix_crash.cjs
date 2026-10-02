const fs = require('fs');
const p = 'src/pages/CostEstimatorPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

const regexHandle = /const handleCalculate = \(\) => \{\s*if \(\!product\) return;\s*setLoading\(true\);\s*\/\/ Simulate AI calculation delay\s*setTimeout\(\(\) => \{\s*\/\/ Mock logic for BIS fees based on MSME scale[\s\S]*?\}\s*if \(product\.toLowerCase\(\)[\s\S]*?\}\s*setResult\(\{[\s\S]*?\}\);\s*setLoading\(false\);\s*\}, 1500\);\s*\};/;

const newHandle = `const handleCalculate = () => {
    if (!product) return;
    setLoading(true);
    
    setTimeout(() => {
      let appFee = 1000;
      let inspFee = 7000; // Rs 7000 per man day for inspection
      let licFee = 1000; // Annual License Fee
      let markingFee = 2000; // Minimum Marking Fee
      
      let subsidyText = "Eligible for 80% concession on Minimum Marking Fee.";
      let days = "30-45";
      
      if (scale === 'micro') {
         subsidyText = "Eligible for 80% concession on Marking Fee as per BIS MSME rules.";
      } else if (scale === 'small') {
         subsidyText = "Eligible for 80% concession (Startup/Women) or standard MSME benefits.";
      } else if (scale === 'medium') {
         inspFee = 14000;
         markingFee = 5000;
         subsidyText = "Standard Marking Fees apply. Lab delays possible.";
         days = "45-60";
      } else {
         inspFee = 21000;
         markingFee = 10000;
         subsidyText = "No MSME concession. Corporate guidelines apply.";
         days = "60-90";
      }

      if (product.toLowerCase().includes('electronic') || product.toLowerCase().includes('toy')) {
        days = "60-90";
      }

      setResult({
        applicationFee: appFee,
        inspectionFee: inspFee,
        licenseFee: licFee,
        markingFee: markingFee,
        timelineDays: days,
        total: appFee + inspFee + licFee + markingFee,
        subsidy: subsidyText,
        aiAdvice: \`For \${product} manufacturing at \${scale} scale, note that Lab Testing Fees (paid directly to the lab) are excluded. Ensure all internal manufacturing and QC equipment is calibrated to meet the \${days} days timeline.\`
      });
      setLoading(false);
    }, 1500);
  };`;

if (regexHandle.test(c)) {
    c = c.replace(regexHandle, newHandle);
    fs.writeFileSync(p, c);
    console.log("SUCCESS: Replaced handleCalculate logic");
} else {
    console.log("FAILED to find handleCalculate regex");
}
