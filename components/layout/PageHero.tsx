import Image from 'next/image';
import Link from 'next/link';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  imageUrl: string;
  breadcrumb?: string;
}

export default function PageHero({
  eyebrow,
  title,
  description,
  imageUrl,
  breadcrumb,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--nova-espresso)]">
      <div className="absolute inset-0">
        <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[rgba(38,24,15,0.6)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(38,24,15,0.88)] via-[rgba(38,24,15,0.5)] to-transparent" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-40 text-[var(--nova-text-light)] sm:px-6 lg:px-8 lg:pb-20 lg:pt-44">
        <nav className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--nova-text-light)]/70" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-[var(--nova-gold-light)]">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--nova-gold-light)]">{breadcrumb ?? title}</span>
        </nav>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.42em] text-[var(--nova-gold-light)]">{eyebrow}</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--nova-text-light)]/85 sm:text-lg">{description}</p>
        )}
      </div>
    </section>
  );
}
