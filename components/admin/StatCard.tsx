import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  hint?: string;
}

export default function StatCard({ label, value, icon: Icon, href, hint }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(184,135,58,0.14)] text-[var(--nova-gold)]">
          <Icon size={22} aria-hidden="true" />
        </span>
        {href && (
          <ArrowRight
            size={16}
            className="text-[var(--nova-taupe)] transition group-hover:translate-x-0.5 group-hover:text-[var(--nova-gold)] motion-reduce:transition-none"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-5 font-serif text-3xl font-bold tabular-nums text-[var(--nova-text-dark)]">{value}</p>
      <p className="mt-1 text-sm font-medium text-[var(--nova-text-muted)]">{label}</p>
      {hint && <p className="mt-2 text-xs text-[var(--nova-brown-muted)]">{hint}</p>}
    </>
  );

  const className = `admin-card group block p-6 transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0${
    href ? '' : ' cursor-default'
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
