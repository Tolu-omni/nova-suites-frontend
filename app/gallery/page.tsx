import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { hotelImages } from '@/components/home/homeImages';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'A visual tour of Nova Suites — our rooms and suites, dining spaces, wellness facilities, and Lagos views.',
};

export default function GalleryPage() {
  return (
    <main className="bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      <PageHero
        eyebrow="Moments at Nova"
        title="Gallery"
        breadcrumb="Gallery"
        description="A visual glimpse of our rooms, dining spaces, wellness facilities, and the Lagos skyline."
        imageUrl={hotelImages.galleryCity}
      />

      <section className="bg-[var(--nova-ivory-soft)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="nova-eyebrow mb-4">Explore</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">A Closer Look</h2>
            <p className="mt-5 text-sm leading-7 text-[var(--nova-text-muted)] sm:text-base">
              Filter by space and select any image to view it full screen.
            </p>
          </div>
          <GalleryGrid />
        </div>
      </section>

      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-20">
          <div>
            <p className="nova-eyebrow mb-4">See It for Yourself</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Your Stay Awaits</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--nova-sand)] sm:text-base">
              Pictures only go so far. Book your room and experience Nova Suites in person.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/rooms" className="inline-flex min-h-12 items-center gap-2 bg-[var(--nova-gold)] px-7 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]">
              Book a Room <ArrowRight size={15} />
            </Link>
            <Link href="/contact" className="inline-flex min-h-12 items-center border border-[var(--nova-text-light)]/40 px-7 text-sm font-semibold text-[var(--nova-text-light)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold-light)]">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
