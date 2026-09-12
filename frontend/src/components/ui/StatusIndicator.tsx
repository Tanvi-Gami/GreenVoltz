import { Circle } from 'lucide-react';

interface StatusIndicatorProps {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
}

const tones = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

export default function StatusIndicator({ label, tone = 'success' }: StatusIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-secondary">
      <Circle className={`h-2 w-2 fill-current ${tones[tone]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
