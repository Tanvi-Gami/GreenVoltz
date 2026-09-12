
interface ProgressBarProps {
  value: number;   // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'green' | 'cyan' | 'amber' | 'red';
  className?: string;
}

const colorClasses = {
  green: 'bg-accent-green',
  cyan:  'bg-accent-cyan',
  amber: 'bg-warn-amber',
  red:   'bg-danger-red',
};

export default function ProgressBar({ value, max = 100, label, showValue = false, color = 'green', className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={['space-y-1', className].join(' ')}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-text-secondary">{label}</span>}
          {showValue && <span className="text-text-primary font-medium tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-bg-raised overflow-hidden">
        <div
          className={['h-full rounded-full transition-all duration-500', colorClasses[color]].join(' ')}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
