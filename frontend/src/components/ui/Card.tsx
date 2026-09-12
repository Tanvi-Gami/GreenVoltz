
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: 'green' | 'cyan' | 'none';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const glowClasses = {
  none:  '',
  green: 'shadow-glow-green',
  cyan:  'shadow-glow-cyan',
};

export function Card({ children, className = '', padding = 'md', glow = 'none' }: CardProps) {
  return (
    <div
      className={[
        'rounded-xl bg-bg-surface border border-bg-border',
        'transition-all duration-200',
        paddingClasses[padding],
        glowClasses[glow],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, unit, delta, deltaPositive, icon, className = '' }: MetricCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-secondary truncate">{label}</p>
          <p className="mt-1 text-metric text-text-primary tabular-nums">
            {value}
            {unit && <span className="ml-1 text-lg font-normal text-text-secondary">{unit}</span>}
          </p>
          {delta && (
            <p className={`mt-1 text-xs font-medium ${deltaPositive ? 'text-success-green' : 'text-danger-red'}`}>
              {delta}
            </p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 p-2 rounded-lg bg-bg-raised text-accent-green">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
