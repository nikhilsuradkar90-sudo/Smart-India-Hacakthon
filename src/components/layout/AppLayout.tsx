import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLanguage } from '@/hooks/use-language';
import { LanguageProvider } from '@/hooks/use-language';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';

// ============================================================
// App layout shell — sidebar + top bar + main content
// ============================================================

export function AppLayout() {
  const location = useLocation();
  const { settings, updateSettings } = useSettings();

  return (
    <LanguageProvider language={settings.language} setLanguage={(lang) => updateSettings({ language: lang })}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex w-64 shrink-0 border-r border-border"
          aria-label="Sidebar navigation"
        >
          <Sidebar />
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
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
    </LanguageProvider>
  );
}

export { useLanguage };
