
type BadgeVariant = 'green' | 'cyan' | 'amber' | 'red' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green:   'bg-accent-green/15 text-accent-green border-accent-green/30',
  cyan:    'bg-accent-cyan/15  text-accent-cyan  border-accent-cyan/30',
  amber:   'bg-warn-amber/15   text-warn-amber   border-warn-amber/30',
  red:     'bg-danger-red/15   text-danger-red   border-danger-red/30',
  neutral: 'bg-bg-raised       text-text-secondary border-bg-border',
};

const dotColors: Record<BadgeVariant, string> = {
  green:   'bg-accent-green',
  cyan:    'bg-accent-cyan',
  amber:   'bg-warn-amber',
  red:     'bg-danger-red',
  neutral: 'bg-text-muted',
};

export function Badge({ children, variant = 'neutral', dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-slow ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

type StatusIndicatorProps = {
  status: 'online' | 'degraded' | 'offline' | 'available' | 'occupied' | 'faulted';
  label?: string;
};

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const config = {
    online:    { variant: 'green'   as BadgeVariant, text: 'Online' },
    degraded:  { variant: 'amber'   as BadgeVariant, text: 'Degraded' },
    offline:   { variant: 'red'     as BadgeVariant, text: 'Offline' },
    available: { variant: 'green'   as BadgeVariant, text: 'Available' },
    occupied:  { variant: 'cyan'    as BadgeVariant, text: 'Occupied' },
    faulted:   { variant: 'red'     as BadgeVariant, text: 'Faulted' },
  }[status];

  return (
    <Badge variant={config.variant} dot>
      {label ?? config.text}
    </Badge>
  );
}
