import { Bell, ChevronDown, Menu, User } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { StatusIndicator } from '@/components/ui/Badge';
import type { NetworkStatus } from '@/types';

const statusToIndicator: Record<NetworkStatus, 'online' | 'degraded' | 'offline'> = {
  online:   'online',
  degraded: 'degraded',
  offline:  'offline',
};

export default function Header() {
  const { networkStatus, toggleSidebar } = useApp();

  return (
    <header className="flex h-14 items-center justify-between border-b border-bg-border bg-bg-surface px-4 shrink-0 gap-4">
      {/* Left: mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-raised transition-colors xl:hidden focus-ring"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page context breadcrumb placeholder */}
        <div className="h-4 w-px bg-bg-border hidden xl:block" />
      </div>

      {/* Right: network status + notifications + user */}
      <div className="flex items-center gap-3">
        {/* Network status */}
        <StatusIndicator status={statusToIndicator[networkStatus]} />

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-raised transition-colors focus-ring"
        >
          <Bell className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-green" />
        </button>

        {/* User menu placeholder */}
        <button
          aria-label="User menu"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-bg-raised transition-colors focus-ring"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green/20 text-accent-green">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:block text-sm text-text-secondary">Account</span>
          <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-text-muted" />
        </button>
      </div>
    </header>
  );
}
