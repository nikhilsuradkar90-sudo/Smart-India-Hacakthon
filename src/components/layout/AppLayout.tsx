import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLanguage } from '@/hooks/use-language';
import { LanguageProvider } from '@/hooks/use-language';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';

// ============================================================
// Govt Strip - Official SIH / Govt of India Header
// ============================================================
const GovtStrip = () => (
  <div className="bg-[#1e3a8a] text-white text-[11.5px] font-medium py-1.5 px-4 lg:px-6 flex justify-between items-center border-b-[3px] border-[#ea580c] z-50 relative w-full tracking-wide">
    <div className="flex gap-4 lg:gap-6">
      <span className="flex items-center gap-2 text-orange-100">🇮🇳 <span className="opacity-95 hover:opacity-100 cursor-default">भारत सरकार | GOVERNMENT OF INDIA</span></span>
      <span className="hidden md:inline opacity-90 hover:opacity-100 cursor-default">उपभोक्ता मामले मंत्रालय | MINISTRY OF CONSUMER AFFAIRS</span>
    </div>
    <div className="hidden md:flex gap-4 items-center">
      <span className="hover:underline cursor-pointer opacity-90">Skip to main content</span>
      <div className="flex gap-1 items-center border-x border-white/20 px-3">
        <span className="hover:underline cursor-pointer px-1.5 opacity-90" title="Decrease Font">A-</span>
        <span className="hover:underline cursor-pointer px-1.5 opacity-90" title="Normal Font">A</span>
        <span className="hover:underline cursor-pointer px-1.5 opacity-90" title="Increase Font">A+</span>
      </div>
      <span className="hover:underline cursor-pointer opacity-90 text-yellow-300 font-semibold">Screen Reader Access</span>
    </div>
  </div>
);

// ============================================================

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

// App layout shell - sidebar + top bar + main content
// ============================================================

export function AppLayout() {
  const location = useLocation();
  const { settings, updateSettings } = useSettings();

  return (
    <LanguageProvider language={settings.language} setLanguage={(lang) => updateSettings({ language: lang })}>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <GovtStrip />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <aside
            className="hidden lg:flex w-64 shrink-0 border-r border-border bg-card"
            aria-label="Sidebar navigation"
          >
            <Sidebar />
          </aside>

          {/* Main area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <SarkariTicker />
            
            <main
              className={cn(
                'flex-1 overflow-y-auto scrollbar-thin',
                settings.reduceMotion ? '' : 'animate-fade-in',
              )}
              key={location.pathname}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}

export { useLanguage };
