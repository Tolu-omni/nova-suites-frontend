'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { hotelImages } from './homeImages';

export default function HeroSection() {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[var(--nova-espresso)] pt-[104px] text-[var(--nova-text-light)] lg:min-h-[610px] lg:pt-[112px]">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${hotelImages.hero}')` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--nova-espresso)]/90 via-[var(--nova-espresso)]/42 to-[var(--nova-espresso)]/18" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--nova-espresso)]/40 via-transparent to-[var(--nova-espresso)]/35" />

      <div className="relative z-10 mx-auto flex min-h-[410px] max-w-7xl items-center px-4 sm:px-6 lg:min-h-[498px] lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.48em] text-[var(--nova-sand)]">Luxury - Comfort - Lagos</p>
          <h1 className="max-w-[760px] font-serif text-5xl leading-[0.93] text-white sm:text-6xl lg:text-7xl xl:text-[86px]">
            A Higher Standard of Stay
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[var(--nova-text-light)] sm:text-base">
            Experience refined comfort, exceptional service and unforgettable moments at Nova Suites.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link href="/rooms" className="inline-flex min-h-11 items-center gap-2 bg-[var(--nova-gold)] px-7 text-sm font-bold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]">
              Explore Our Suites <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <Link href="/about" className="absolute right-6 top-[48%] hidden items-center gap-3 text-sm font-semibold text-white transition hover:text-[var(--nova-gold)] lg:flex">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/75 bg-white/10">
            <ArrowRight size={18} />
          </span>
          <span className="leading-tight">Discover<br />Our Story</span>
        </Link>

        <div className="absolute bottom-8 right-8 hidden items-center gap-4 text-xs font-semibold text-white lg:flex">
          <span>LAGOS, NIGERIA</span>
        </div>
      </div>
    </section>
  );
}
