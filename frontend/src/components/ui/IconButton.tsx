import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

export default function IconButton({ label, children, size = 'md', className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded-md text-secondary transition-colors',
        'hover:bg-elevated hover:text-primary focus-ring',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
