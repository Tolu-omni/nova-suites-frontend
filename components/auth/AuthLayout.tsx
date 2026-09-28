'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  imageUrl: string;
  eyebrow: string;
  title: string;
  footer: string;
  reverse?: boolean;
}

export default function AuthLayout({
  children,
  imageUrl,
  eyebrow,
  title,
  footer,
  reverse = false,
}: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      <section className="mx-auto flex min-h-dvh w-full max-w-[1720px] flex-col p-3 sm:p-6 lg:p-10">
        <div className="overflow-hidden rounded-[10px] border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] shadow-2xl shadow-[rgba(38,24,15,0.18)] animate-fade-in">
          <div className={cn('grid min-h-[calc(100dvh-5rem)] lg:grid-cols-[1.08fr_1fr]', reverse && 'lg:grid-cols-[1fr_1.08fr]')}>
            <ImagePanel imageUrl={imageUrl} eyebrow={eyebrow} title={title} footer={footer} reverse={reverse} />
            <div className={cn('flex items-center justify-center px-5 py-9 sm:px-10 lg:px-16', reverse && 'lg:order-first')}>
              <div className="w-full max-w-[420px] animate-fade-in-up">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ImagePanel({
  imageUrl,
  eyebrow,
  title,
  footer,
  reverse,
}: Omit<AuthLayoutProps, 'children'>) {
  return (
    <aside className={cn('group relative min-h-[260px] overflow-hidden lg:min-h-full', reverse && 'lg:order-last')} aria-label="Nova Suites atmosphere">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
      <div className="absolute inset-0 bg-[var(--nova-espresso)]/38" />
      <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[var(--nova-espresso)]/72 to-transparent" />
      <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-between p-8 text-[var(--nova-text-light)] sm:p-12 lg:min-h-full">
        <div className="mt-10 max-w-sm lg:mt-20">
          <h1 className="font-serif text-4xl leading-[0.96] sm:text-5xl lg:text-6xl">{title}</h1>
          <div className="my-7 h-px w-12 bg-[var(--nova-gold)]" />
          <p className="max-w-[230px] text-xs font-semibold uppercase tracking-[0.5em] text-[var(--nova-text-light)]/85">{eyebrow}</p>
        </div>
        <p className="max-w-[260px] text-xs font-semibold uppercase tracking-[0.4em] text-[var(--nova-text-light)]/85">{footer}</p>
      </div>
    </aside>
  );
}
