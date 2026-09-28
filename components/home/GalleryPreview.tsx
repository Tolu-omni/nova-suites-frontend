import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { hotelImages } from './homeImages';

const images = [
  { src: hotelImages.pool, alt: 'Nova Suites pool' },
  { src: hotelImages.galleryLounge, alt: 'Nova Suites lounge' },
  { src: hotelImages.galleryRoom, alt: 'Nova Suites room' },
  { src: hotelImages.gallerySuite, alt: 'Nova Suites suite' },
  { src: hotelImages.dining, alt: 'Nova Suites restaurant' },
  { src: hotelImages.galleryCity, alt: 'Lagos city view suite' },
];

export default function GalleryPreview() {
  return (
    <section className="bg-[var(--nova-text-light)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--nova-gold)]">Gallery</p>
            <h2 className="font-serif text-4xl leading-none text-[var(--nova-text-dark)] sm:text-5xl">Moments at Nova</h2>
          </div>
          <div className="flex items-center gap-8">
            <p className="hidden text-xs text-[var(--nova-text-muted)] md:block">A glimpse into the Nova experience.</p>
            <Link href="/gallery" className="inline-flex min-h-11 items-center gap-2 border border-[var(--nova-sand)] px-6 text-sm font-semibold text-[var(--nova-text-dark)] transition hover:bg-white">
              View Gallery <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {images.map(img => (
            <div key={img.alt} className="relative aspect-[1.35] overflow-hidden bg-[var(--nova-sand)]">
              <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 16vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
