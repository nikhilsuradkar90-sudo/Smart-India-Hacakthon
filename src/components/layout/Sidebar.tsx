import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Globe, Settings, CircleHelp, X } from 'lucide-react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS, APP_NAME, APP_TAGLINE } from '@/data/constants';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// ============================================================
// Brand mark / logo treatment for "BIS AI Assistant"
// ============================================================

export function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-tight">{APP_NAME}</span>
          <span className="text-[10px] text-muted-foreground leading-tight">{APP_TAGLINE}</span>
        </div>
      )}
    </Link>
  );
}

// ============================================================
// Sidebar
// ============================================================

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center px-4 border-b border-border">
        <BrandMark />
        {onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={onNavigate}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4" aria-label="Main navigation">
        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Services
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4" />

        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          System
        </p>
        <ul className="space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-3 py-3">
        <SidebarLanguageSelector />
      </div>
    </div>
  );
}

// ============================================================
// Language selector for sidebar bottom
// ============================================================

function SidebarLanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="h-8 text-xs" aria-label="Select language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeLabel} ({lang.label})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
