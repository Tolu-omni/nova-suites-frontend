import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--nova-text-dark)]',
        className
      )}
    >
      {children}
    </span>
  );
}
