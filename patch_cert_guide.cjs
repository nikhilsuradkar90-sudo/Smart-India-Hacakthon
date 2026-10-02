const fs = require('fs');
const p = 'src/pages/CertificationPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

// The original JSX for selected product rendering starts with: <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
const oldGrid = `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;

const newStepsBlock = `
<div className="space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{selectedProduct.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">{selectedProduct.category || 'General'}</span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">{selectedProduct.scheme?.name || 'Standard Mark Scheme'}</span>
                  </p>
                </div>
                <Button onClick={() => navigate('/assistant', { state: { initialPrompt: \`How do I apply for BIS certification for \${selectedProduct.name} under \${selectedProduct.standard?.isNumber}?\` } })}>
                  Ask AI About Process
                </Button>
              </div>

              <h3 className="text-lg font-bold text-foreground border-b pb-2">6-Step Certification Guide</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Step 1 */}
                <Card className="p-5 border-t-4 border-t-blue-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Identify Standard</h3>
                  <p className="text-sm text-muted-foreground mb-4">Ensure your product correctly maps to the Indian Standard.</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs font-semibold text-blue-600 mb-1">Applicable IS Number:</p>
                    <p className="text-sm font-bold cursor-pointer hover:underline" onClick={() => navigate(\`/standards/\${selectedProduct.standard?.id}\`)}>{selectedProduct.standard?.isNumber || 'Unverified'}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedProduct.standard?.title || 'No title available'}</p>
                  </div>
                </Card>

                {/* Step 2 */}
                <Card className="p-5 border-t-4 border-t-indigo-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">2</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Check Lab Equipment</h3>
                  <p className="text-sm text-muted-foreground mb-4">Procure or verify required testing equipment for your in-house lab.</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">According to the Scheme of Testing & Inspection (STI) for <span className="font-semibold text-foreground">{selectedProduct.standard?.isNumber}</span>, essential testing equipment must be calibrated.</p>
                  </div>
                </Card>

                {/* Step 3 */}
                <Card className="p-5 border-t-4 border-t-purple-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">3</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Prepare Factory Docs</h3>
                  <p className="text-sm text-muted-foreground mb-4">Draft layout, manufacturing process flow, and quality control manual.</p>
                  {selectedProduct.scheme?.requirements?.length > 0 ? (
                    <ul className="space-y-2 mt-2">
                      {selectedProduct.scheme.requirements.slice(0, 2).map((req: any, i: number) => (
                        <li key={req.id} className="text-xs flex gap-2 items-start text-muted-foreground">
                          <span className="text-purple-500 mt-0.5">•</span>
                          <span>{req.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">Gather incorporation certificates, MOA, and trademark registration.</p>
                  )}
                </Card>

                {/* Step 4 */}
                <Card className="p-5 border-t-4 border-t-pink-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">4</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Apply on ManakOnline</h3>
                  <p className="text-sm text-muted-foreground mb-4">Submit form, upload documents, and pay the requisite fee.</p>
                  <div className="bg-pink-500/10 p-3 rounded-md border border-pink-500/20">
                    <p className="text-xs font-semibold text-pink-700">Scheme Applied:</p>
                    <p className="text-sm font-bold text-pink-900 dark:text-pink-300">{selectedProduct.scheme?.name || 'Standard Mark Scheme'}</p>
                    <p className="text-xs mt-1 text-pink-800/80">Application Fee: ₹1,000</p>
                  </div>
                </Card>

                {/* Step 5 */}
                <Card className="p-5 border-t-4 border-t-orange-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">5</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Lab Testing & Inspection</h3>
                  <p className="text-sm text-muted-foreground mb-4">Send product sample to BIS recognized lab or await factory inspection.</p>
                  <Button variant="outline" size="sm" className="w-full text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-800" onClick={() => navigate('/laboratories')}>
                    Search BIS Recognized Labs
                  </Button>
                </Card>

                {/* Step 6 */}
                <Card className="p-5 border-t-4 border-t-green-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">6</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Grant of License</h3>
                  <p className="text-sm text-muted-foreground mb-4">Receive your BIS License and start marking your product with the ISI/Registration mark.</p>
                  <div className="flex justify-center items-center h-12 bg-green-500/10 rounded-md border border-green-500/20">
                    <ShieldCheck className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-sm font-bold text-green-700">BIS Certified</span>
                  </div>
                </Card>

              </div>
            </div>`;

// We need to replace the huge 3 column grid with our new space-y-6 6-step layout.
// So we find `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">` 
// up to `</div>` just before `<div className="mt-8">` (Official Sources section)

const startIdx = c.indexOf('<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">');
const officialSourcesIdx = c.indexOf('<div className="mt-8">', startIdx);
if(startIdx !== -1 && officialSourcesIdx !== -1) {
    const originalBlock = c.substring(startIdx, officialSourcesIdx);
    c = c.replace(originalBlock, newStepsBlock + '\n\n            ');
    fs.writeFileSync(p, c);
    console.log("SUCCESS: Certification Guide replaced with 6 steps!");
} else {
    console.log("FAILED to find bounds");
}
