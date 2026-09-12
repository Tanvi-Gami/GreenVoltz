import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';

interface NavigationItemProps {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function NavigationItem({ to, label, icon: Icon, end, collapsed, onNavigate }: NavigationItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) => [
        'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
        'focus-ring',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'bg-accent/12 text-accent'
          : 'text-secondary hover:bg-elevated hover:text-primary',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-accent" />}
          <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-accent' : ''}`} />
          {!collapsed && <span className="truncate">{label}</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded border border-subtle bg-elevated px-2 py-1 text-xs text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
