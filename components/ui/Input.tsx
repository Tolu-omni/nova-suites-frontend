import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="nova-form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nova-taupe)]">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            'w-full rounded-md border bg-[var(--nova-ivory-soft)] py-3 text-sm text-[var(--nova-text-dark)] placeholder:text-[var(--nova-taupe)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
            leftIcon ? 'pl-10 pr-4' : 'px-4',
            error
              ? 'border-red-500 focus:border-red-600'
              : 'border-[var(--nova-border-light)] focus:border-[var(--nova-gold)]',
            className
          )}
          {...props}
        />
      </div>
      {error && <p id={`${id}-error`} className="text-xs font-medium text-red-700" role="alert">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-[var(--nova-text-muted)]">{hint}</p>}
    </div>
  );
}
