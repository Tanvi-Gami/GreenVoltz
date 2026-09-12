import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-accent-green text-bg-base font-semibold hover:bg-accent-green-light active:bg-accent-green-dark shadow-glow-green hover:shadow-none',
  secondary: 'bg-bg-raised text-text-primary border border-bg-border hover:border-accent-green hover:text-accent-green',
  ghost:     'text-text-secondary hover:text-text-primary hover:bg-bg-raised',
  danger:    'bg-danger-red/10 text-danger-red border border-danger-red/40 hover:bg-danger-red/20',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7  px-3 text-xs gap-1.5 rounded',
  md: 'h-9  px-4 text-sm gap-2   rounded-md',
  lg: 'h-11 px-6 text-base gap-2 rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center transition-all duration-150',
        'focus-ring',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
