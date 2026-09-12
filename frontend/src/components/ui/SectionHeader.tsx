
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4', className].join(' ')}>
      <div>
        <h2 className="text-lg font-semibold text-text-primary leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <hr className={['border-bg-border', className].join(' ')} />;
}
