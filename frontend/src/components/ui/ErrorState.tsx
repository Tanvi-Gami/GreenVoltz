import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={['flex flex-col items-center justify-center gap-4 py-20 text-center', className].join(' ')}>
      <div className="p-4 rounded-full bg-danger-red/10 text-danger-red">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {message && <p className="text-xs text-text-secondary max-w-xs">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
