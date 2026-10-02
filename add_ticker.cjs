const fs = require('fs');
const p = 'src/components/layout/AppLayout.tsx';
let c = fs.readFileSync(p, 'utf-8');

const tickerBlock = `
// ============================================================
// Govt Ticker - Official Scrolling Updates
// ============================================================
const SarkariTicker = () => (
  <div className="bg-[#fefce8] border-b border-[#fde047] text-[#9a3412] text-[13px] font-medium py-1 px-4 lg:px-6 flex items-center overflow-hidden shrink-0 z-40 relative shadow-sm">
    <span className="shrink-0 bg-[#ea580c] text-white px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider mr-3 font-bold animate-pulse shadow-sm">
      Latest Updates
    </span>
    {/* Using standard HTML marquee for that authentic Government website feel */}
    <marquee className="flex-1 tracking-wide" scrollamount="5" onMouseOver={(e: any) => e.target.stop()} onMouseOut={(e: any) => e.target.start()}>
      <span className="mx-4">🔴 Mandatory Hallmarking of Gold Jewellery now applicable in 341 districts.</span>
      <span className="mx-4 text-blue-800">★ Draft standard for IS 17855:2022 (Electric Vehicles) open for public comments till 30th Sep.</span>
      <span className="mx-4">🔴 Avail 80% concession on BIS certification fees for MSMEs and Women Entrepreneurs!</span>
      <span className="mx-4 text-green-700">★ New Quality Control Orders (QCO) issued for Footwear and Leather Products.</span>
    </marquee>
  </div>
);
`;

if (!c.includes('SarkariTicker')) {
    c = c.replace('// App layout shell', tickerBlock + '\n// App layout shell');
    
    // Inject the component below TopBar
    c = c.replace('<TopBar />', '<TopBar />\n            <SarkariTicker />');
    
    fs.writeFileSync(p, c);
    console.log("Sarkari Ticker added successfully!");
} else {
    console.log("Ticker already exists!");
}
