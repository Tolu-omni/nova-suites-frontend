import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { emailHref, hotelContact } from '@/lib/site';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[var(--nova-ivory)] pt-28 text-[var(--nova-text-dark)] sm:pt-32">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--nova-brown-muted)] transition hover:text-[var(--nova-gold)]">
          <ArrowLeft size={14} /> Back Home
        </Link>

        <header className="mt-6 border-b border-[var(--nova-border-light)] pb-8">
          <p className="nova-eyebrow mb-3">Legal</p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-[var(--nova-text-muted)]">Last updated: {updated}</p>
          <p className="mt-6 max-w-3xl text-sm leading-8 text-[var(--nova-text-muted)] sm:text-base">{intro}</p>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-32">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">On this page</p>
              <ul className="space-y-2 text-sm">
                {sections.map(section => (
                  <li key={section.heading}>
                    <a href={`#${slugify(section.heading)}`} className="text-[var(--nova-text-muted)] transition hover:text-[var(--nova-gold)]">
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="space-y-10">
            {sections.map(section => (
              <section key={section.heading} id={slugify(section.heading)} className="scroll-mt-32">
                <h2 className="font-serif text-2xl">{section.heading}</h2>
                {section.paragraphs?.map(paragraph => (
                  <p key={paragraph} className="mt-4 text-sm leading-8 text-[var(--nova-text-muted)]">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map(bullet => (
                      <li key={bullet} className="flex gap-3 text-sm leading-7 text-[var(--nova-text-muted)]">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--nova-gold)]" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section className="nova-card p-6">
              <h2 className="font-serif text-2xl">Questions?</h2>
              <p className="mt-3 text-sm leading-8 text-[var(--nova-text-muted)]">
                If anything here is unclear, our team is happy to help.{' '}
                {(hotelContact.legalEmail || hotelContact.email) && (
                  <>Email <a href={emailHref(hotelContact.legalEmail || hotelContact.email!)} className="font-semibold text-[var(--nova-espresso)] underline underline-offset-4">
                    {hotelContact.legalEmail || hotelContact.email}
                  </a>{' '}or visit our{' '}</>
                )}
                <Link href="/contact" className="font-semibold text-[var(--nova-espresso)] underline underline-offset-4">
                  contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
