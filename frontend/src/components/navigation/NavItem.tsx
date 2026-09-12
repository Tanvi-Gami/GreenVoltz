import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed?: boolean;
  badge?: string | number;
  end?: boolean;
}

export default function NavItem({ to, icon: Icon, label, collapsed, badge, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }: { isActive: boolean }) =>
        [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5',
          'transition-all duration-150 focus-ring text-sm font-medium',
          isActive
            ? 'bg-accent-green/15 text-accent-green'
            : 'text-text-secondary hover:bg-bg-raised hover:text-text-primary',
        ].join(' ')
      }
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-green rounded-r" />
          )}
          <Icon className={['h-5 w-5 shrink-0', isActive ? 'text-accent-green' : ''].join(' ')} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{label}</span>
              {badge !== undefined && (
                <span className="ml-auto shrink-0 rounded-full bg-accent-green/20 px-1.5 py-0.5 text-xs font-semibold text-accent-green">
                  {badge}
                </span>
              )}
            </>
          )}
          {/* Tooltip when collapsed */}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-bg-raised border border-bg-border px-2 py-1 text-xs text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
