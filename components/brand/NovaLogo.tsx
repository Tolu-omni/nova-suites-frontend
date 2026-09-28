'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

type NovaLogoVariant = 'dark' | 'light';
type NovaLogoSize = 'sm' | 'md' | 'lg';

interface NovaLogoProps {
  variant?: NovaLogoVariant;
  size?: NovaLogoSize;
  showLocation?: boolean;
  className?: string;
}

const sizes: Record<NovaLogoSize, { mark: number; title: string; location: string; gap: string }> = {
  sm: { mark: 34, title: 'text-base', location: 'text-[8px]', gap: 'gap-2.5' },
  md: { mark: 44, title: 'text-xl', location: 'text-[9px]', gap: 'gap-3' },
  lg: { mark: 62, title: 'text-3xl', location: 'text-[10px]', gap: 'gap-4' },
};

export default function NovaLogo({
  variant = 'light',
  size = 'md',
  showLocation = false,
  className,
}: NovaLogoProps) {
  const palette = variant === 'dark'
    ? { text: 'text-[var(--nova-espresso)]', sub: 'text-[var(--nova-brown-muted)]' }
    : { text: 'text-[var(--nova-text-light)]', sub: 'text-[var(--nova-sand)]' };
  const scale = sizes[size];

  return (
    <span className={cn('inline-flex items-center', scale.gap, className)}>
      <Image
        src="/brand/nova-suite-logo-mark.svg"
        alt="Nova Suite logo mark"
        width={scale.mark}
        height={scale.mark}
        priority={size === 'lg'}
        className="shrink-0 object-contain"
      />
      <span className="flex flex-col leading-none">
        <span className={cn('font-serif tracking-[0.18em]', scale.title, palette.text)}>NOVA SUITE</span>
        {showLocation && (
          <span className={cn('mt-1 uppercase tracking-[0.42em]', scale.location, palette.sub)}>Lagos</span>
        )}
      </span>
    </span>
  );
}
