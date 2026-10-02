const fs = require('fs');
const p = 'src/pages/CostEstimatorPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

// Replace mangled rupee symbols
c = c.replace(/,1/g, '₹');
c = c.replace(/,/g, '₹');

// Let's rewrite the logic inside handleCalculate to be more realistic and Sarkari
const oldLogic = `      let appFee = 1000;
      let inspFee = 7000; // per man day
      let licFee = 1000;
      let subsidyText = "Eligible for up to 80% testing fee subsidy.";
      let days = "30-45";
      
      if (scale === 'small') {
        subsidyText = "Eligible for 50% testing fee subsidy.";
      } else if (scale === 'medium' || scale === 'large') {
        inspFee = 14000; // 2 man days
      }`;

const newLogic = `      let appFee = 1000;
      let inspFee = 7000; // Rs 7000 per man day for inspection
      let licFee = 1000; // Annual License Fee
      let markingFee = 2000; // Minimum Marking Fee (Mock)
      
      let subsidyText = "Eligible for 80% concession on Minimum Marking Fee.";
      let days = "30-45";
      
      if (scale === 'micro') {
         subsidyText = "Eligible for 80% concession on Minimum Marking Fee as per BIS MSME rules.";
      } else if (scale === 'small') {
         subsidyText = "Eligible for 80% concession (Startup/Women) or standard MSME benefits.";
      } else if (scale === 'medium') {
         inspFee = 14000;
         markingFee = 5000;
         subsidyText = "Standard Marking Fees apply. Ensure prompt lab testing to avoid delays.";
         days = "45-60";
      } else {
         inspFee = 21000;
         markingFee = 10000;
         subsidyText = "No MSME concession. Corporate guidelines apply.";
         days = "60-90";
      }`;

if (c.includes('let appFee = 1000;')) {
    c = c.replace(oldLogic, newLogic);
}

// Modify the EstimateResult interface to include marking fee
c = c.replace(
    '  licenseFee: number;',
    '  licenseFee: number;\n  markingFee: number;'
);

// Update setResult inside handleCalculate
const oldSetResult = `      setResult({
        applicationFee: appFee,
        inspectionFee: inspFee,
        licenseFee: licFee,
        timelineDays: days,
        total: appFee + inspFee + licFee,
        subsidy: subsidyText,
        aiAdvice: \`For \${product} manufacturing at \${scale} scale, ensure all internal lab equipments are calibrated. The major variable cost will be external lab testing which is not included here. Preparing your Quality Control personnel in advance will help meet the \${days} days timeline.\`
      });`;

const newSetResult = `      setResult({
        applicationFee: appFee,
        inspectionFee: inspFee,
        licenseFee: licFee,
        markingFee: markingFee,
        timelineDays: days,
        total: appFee + inspFee + licFee + markingFee,
        subsidy: subsidyText,
        aiAdvice: \`For \${product} manufacturing at \${scale} scale, please note that Lab Testing Fees (paid directly to the BIS Recognized Lab) are excluded from this estimate. Ensure all your internal manufacturing and QC equipment is calibrated. To meet the \${days} days timeline, submit all factory layout and machinery documents in one go.\`
      });`;

c = c.replace(oldSetResult, newSetResult);

// Add Marking Fee to the UI grid (replace Annual License with Marking Fee since License is fixed 1000)
const oldCard = `<Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Annual License</p>
                  <p className="text-xl font-bold text-foreground">₹{result.licenseFee.toLocaleString()}</p>
                </Card>`;

const newCard = `<Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Minimum Marking Fee</p>
                  <p className="text-xl font-bold text-foreground">₹{result.markingFee.toLocaleString()}</p>
                </Card>`;

c = c.replace(oldCard, newCard);

fs.writeFileSync(p, c);
console.log("Cost estimator patched!");
