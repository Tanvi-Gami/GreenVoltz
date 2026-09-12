import {
  Activity,
  BatteryCharging,
  CalendarClock,
  Gauge,
  LayoutDashboard,
  MapPin,
  Network,
  Settings2,
  Zap,
} from 'lucide-react';
import { useApp } from '@/app/AppContext';
import Divider from '@/components/ui/Divider';
import NavigationItem from '@/components/navigation/NavigationItem';
import NetworkStatus from '@/components/navigation/NetworkStatus';
import UserMenu from '@/components/navigation/UserMenu';

const primaryItems = [
  { to: '/driver', label: 'Find Charger', icon: MapPin },
  { to: '/operator', label: 'Charging', icon: BatteryCharging },
  { to: '/reservations', label: 'Reservations', icon: CalendarClock },
  { to: '/energy', label: 'Energy Insights', icon: Activity },
];

const optimizationItems = [
  { to: '/optimization', label: 'Optimization', icon: Gauge },
  { to: '/disruptions', label: 'Disruptions', icon: Network },
];

export default function Sidebar() {
  const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useApp();
  const closeOnMobile = () => closeMobileMenu();

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-subtle bg-sidebar',
        'transition-transform duration-200 lg:relative lg:translate-x-0',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      ].join(' ')}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-subtle px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent">
          <Zap className="h-4 w-4" />
        </span>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold tracking-wide text-primary">
            Green<span className="text-accent">Voltz</span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {!sidebarCollapsed && <p className="type-technical mb-2 px-3">Overview</p>}
        <NavigationItem to="/" label="Overview" icon={LayoutDashboard} end collapsed={sidebarCollapsed} onNavigate={closeOnMobile} />
        {primaryItems.map(item => (
          <NavigationItem key={item.to} {...item} collapsed={sidebarCollapsed} onNavigate={closeOnMobile} />
        ))}

        <Divider className="my-5" />
        {!sidebarCollapsed && <p className="type-technical mb-2 px-3">Optimization</p>}
        {optimizationItems.map(item => (
          <NavigationItem key={item.to} {...item} collapsed={sidebarCollapsed} onNavigate={closeOnMobile} />
        ))}
      </nav>

      <div className="shrink-0 space-y-4 border-t border-subtle px-4 py-4">
        {!sidebarCollapsed && <NetworkStatus />}
        <div className={sidebarCollapsed ? 'flex justify-center' : ''}>
          <UserMenu />
        </div>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <Settings2 className="h-3.5 w-3.5" />
            <span>GreenVoltz control plane</span>
          </div>
        )}
      </div>
    </aside>
  );
}
