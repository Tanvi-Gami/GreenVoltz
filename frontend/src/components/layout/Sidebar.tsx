import {
  BarChart3,
  Bolt,
  Car,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  Sliders,
  Zap,
} from 'lucide-react';
import { useApp } from '@/app/AppContext';
import NavItem from '@/components/navigation/NavItem';

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Home',         end: true  },
  { to: '/driver',      icon: Car,             label: 'Driver'                   },
  { to: '/operator',    icon: Bolt,            label: 'Operator'                 },
  { to: '/reservations',icon: CalendarCheck,   label: 'Reservations'             },
  { to: '/energy',      icon: Zap,             label: 'Energy'                   },
  { to: '/optimization',icon: Sliders,         label: 'Optimisation'             },
  { to: '/disruption',  icon: CircleAlert,     label: 'Disruptions'              },
  { to: '/analytics',   icon: BarChart3,       label: 'Analytics'                },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useApp();

  return (
    <aside
      className={[
        'relative flex flex-col h-full bg-bg-surface border-r border-bg-border',
        'transition-all duration-300 ease-in-out overflow-hidden',
        sidebarCollapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {/* Logo area */}
      <div className="flex items-center h-14 px-3 border-b border-bg-border shrink-0 gap-2 overflow-hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-green/15">
          <Zap className="h-5 w-5 text-accent-green" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-bold tracking-wide text-text-primary whitespace-nowrap animate-fade-in">
            Green<span className="text-accent-green">Voltz</span>
          </span>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={sidebarCollapsed}
            end={item.end}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 px-2 py-3 border-t border-bg-border space-y-0.5">
        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={[
          'absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center',
          'rounded-full bg-bg-raised border border-bg-border text-text-secondary',
          'hover:border-accent-green hover:text-accent-green transition-all duration-150',
          'focus-ring shadow-md',
        ].join(' ')}
      >
        {sidebarCollapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft  className="h-3.5 w-3.5" />}
      </button>
    </aside>
  );
}
