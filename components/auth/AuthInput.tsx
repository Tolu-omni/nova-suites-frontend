import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function AuthInput({ label, error, id, className, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-[#1C1713]">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'h-12 w-full rounded-md border bg-white/80 px-4 text-[15px] text-[#1C1713] shadow-sm transition-all duration-200 placeholder:text-[#8E8173] focus:border-[#B89255] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B89255]/35 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : 'border-[#DDD1C1]',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
