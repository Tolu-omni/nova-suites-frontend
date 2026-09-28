import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { hotelImages } from './homeImages';

export default function DiningSection() {
  return (
    <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.8fr_1.5fr_0.5fr]">
        <div className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--nova-gold)]">Dining at Nova</p>
          <h2 className="font-serif text-4xl leading-[1.02] sm:text-5xl">A Taste of Extraordinary</h2>
          <p className="mt-6 text-sm leading-7 text-[var(--nova-sand)]">
            Savor a curated menu of local and international dishes prepared by world-class chefs in an elegant setting.
          </p>
          <Link href="/dining" className="mt-8 inline-flex min-h-11 items-center gap-2 bg-[var(--nova-gold)] px-6 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[#e3c15a]">
            Explore Dining <ArrowRight size={14} />
          </Link>
        </div>
        <div className="relative min-h-[340px] lg:min-h-[470px]">
          <Image src={hotelImages.dining} alt="Fine dining at Nova Suites" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--nova-espresso)] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[var(--nova-espresso)] to-transparent" />
        </div>
        <div className="flex items-center px-4 py-12 sm:px-6 lg:px-8">
          <blockquote className="border-b border-[var(--nova-gold)]/40 pb-8 font-serif text-xl leading-snug text-[var(--nova-text-light)]">
            Great food brings people together.
          </blockquote>
        </div>
      </div>
    </section>
  );
}
