import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import MobileMenuButton from '@/components/navigation/MobileMenuButton';
import NetworkStatus from '@/components/navigation/NetworkStatus';
import UserMenu from '@/components/navigation/UserMenu';
import IconButton from '@/components/ui/IconButton';

const contexts: Record<string, string> = {
  '/': 'Account Login & Setup',
  '/login': 'Account Login & Setup',
  '/overview': 'Overview',
  '/driver': 'Find Charger',
  '/operator': 'Station Operator Console',
  '/reservations': 'Reservations',
  '/energy': 'Energy Insights',
  '/optimization': 'Optimization',
  '/disruptions': 'Disruptions',
  '/disruption': 'Disruptions',
  '/analytics': 'Energy Insights',
};

export default function Header({ hideMobileMenu }: { hideMobileMenu?: boolean }) {
  const { networkStatus } = useApp();
  const location = useLocation();
  const context = contexts[location.pathname] ?? 'GreenVoltz';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-subtle bg-surface px-3 sm:h-16 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {!hideMobileMenu && (
          <div className="lg:hidden">
            <MobileMenuButton />
          </div>
        )}
        <div className="min-w-0">
          <p className="type-technical truncate">GreenVoltz / {networkStatus}</p>
          <h1 className="truncate text-sm font-semibold text-primary sm:text-base">{context}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:block"><NetworkStatus /></div>
        <IconButton label="Notifications" size="sm">
          <Bell className="h-4 w-4" />
          <span className="absolute" />
        </IconButton>
        <UserMenu />
      </div>
    </header>
  );
}
