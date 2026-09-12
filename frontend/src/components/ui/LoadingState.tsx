import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ message = 'Loading…', className = '' }: LoadingStateProps) {
  return (
    <div className={['flex flex-col items-center justify-center gap-3 py-16 text-text-secondary', className].join(' ')}>
      <Loader2 className="h-8 w-8 animate-spin text-accent-green" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
