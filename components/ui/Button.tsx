import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nova-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nova-ivory)]';

  const variants = {
    primary:
      'border border-[var(--nova-gold)] bg-[var(--nova-gold)] text-[var(--nova-espresso)] hover:bg-[var(--nova-gold-light)] hover:border-[var(--nova-gold-light)] shadow-sm shadow-[rgba(38,24,15,0.08)]',
    secondary:
      'border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] text-[var(--nova-text-dark)] hover:border-[var(--nova-gold)] hover:bg-[var(--nova-ivory)]',
    dark:
      'border border-[var(--nova-espresso)] bg-[var(--nova-espresso)] text-[var(--nova-text-light)] hover:bg-[var(--nova-espresso-soft)]',
    outline:
      'border border-[var(--nova-gold)] bg-transparent text-[var(--nova-text-dark)] hover:bg-[rgba(184,135,58,0.1)]',
    ghost:
      'border border-transparent bg-transparent text-[var(--nova-brown-muted)] hover:bg-[var(--nova-ivory)] hover:text-[var(--nova-text-dark)]',
    danger:
      'border border-red-700 bg-red-700 text-white hover:bg-red-800',
  };

  const sizes = {
    sm: 'min-h-9 px-3.5 text-sm',
    md: 'min-h-11 px-5 text-sm',
    lg: 'min-h-13 px-7 text-base',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Loading...
        </>
      ) : children}
    </button>
  );
}
