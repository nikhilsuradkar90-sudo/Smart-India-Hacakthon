import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, CircleHelp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Sidebar } from '@/components/layout/Sidebar';
import { BrandMark } from '@/components/layout/Sidebar';
import { NAV_ITEMS, APP_NAME } from '@/data/constants';
import { useLanguage } from '@/hooks/use-language';
import { useNotifications } from '@/contexts/NotificationContext';
import { getIcon } from '@/lib/icons';

// ============================================================
// Top navigation bar
// ============================================================

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, languages } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, clearAll } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/95 backdrop-blur px-4 lg:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0" aria-label="Navigation menu">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile brand */}
      <div className="lg:hidden">
        <BrandMark collapsed />
      </div>

      {/* Desktop page title */}
      <div className="hidden lg:flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          {currentNav?.label || APP_NAME}
        </span>
        {currentNav?.description && (
          <span className="text-xs text-muted-foreground">{currentNav.description}</span>
        )}
      </div>

      {/* Global search */}
      <form onSubmit={handleSearch} className="ml-auto hidden md:flex items-center max-w-xs flex-1 mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IS number, product, lab..."
            className="pl-9 h-9"
            aria-label="Search standards"
          />
        </div>
      </form>

      {/* Language selector (top bar) */}
      <div className="ml-auto md:ml-0 flex items-center gap-1">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="h-9 w-[110px] text-xs hidden sm:flex" aria-label="Select language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.nativeLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Help icon */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Help" onClick={() => navigate('/about')}>
          <CircleHelp className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative hidden sm:flex" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 border-b last:border-0 ${notif.read ? 'opacity-60' : 'bg-primary/5'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{notif.title}</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-50 hover:opacity-100" onClick={() => dismissNotification(notif.id)}>
                        &times;
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{notif.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                      {!notif.read && (
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-[10px] text-primary" onClick={() => markAsRead(notif.id)}>
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={clearAll}>
                  Clear all
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile / settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-1.5 px-2" aria-label="Account menu">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                BIS
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Guest User
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/about')}>
              Help &amp; About
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-muted-foreground">
              Live Mode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { getIcon };
export function MobileNavCard({ item }: { item: typeof NAV_ITEMS[number] }) {
  const Icon = getIcon(item.icon);
  return (
    <Link to={item.path} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted transition-colors">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-sm font-medium">{item.label}</p>
        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
      </div>
    </Link>
  );
}
