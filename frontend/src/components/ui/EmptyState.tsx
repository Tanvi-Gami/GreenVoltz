import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={['flex flex-col items-center justify-center gap-3 py-20 text-center', className].join(' ')}>
      <div className="p-4 rounded-full bg-bg-raised text-text-muted">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && <p className="text-xs text-text-secondary max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}
