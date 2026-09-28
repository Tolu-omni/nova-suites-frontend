'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { hotelImages } from '@/components/home/homeImages';

const CATEGORIES = ['All', 'Rooms', 'Dining', 'Wellness', 'The Hotel'] as const;
type Category = (typeof CATEGORIES)[number];

interface GalleryItem {
  src: string;
  alt: string;
  category: Exclude<Category, 'All'>;
}

const ITEMS: GalleryItem[] = [
  { src: '/images/rooms/suite-room.png', alt: 'The signature suite', category: 'Rooms' },
  { src: hotelImages.galleryRoom, alt: 'Deluxe room with city views', category: 'Rooms' },
  { src: '/images/rooms/double-room.png', alt: 'Executive double room', category: 'Rooms' },
  { src: hotelImages.gallerySuite, alt: 'Grand suite living area', category: 'Rooms' },
  { src: '/images/rooms/single-room.png', alt: 'Classic single room', category: 'Rooms' },
  { src: hotelImages.dining, alt: 'Nova Restaurant', category: 'Dining' },
  { src: hotelImages.galleryLounge, alt: 'The Gold Lounge', category: 'Dining' },
  { src: hotelImages.roomService, alt: 'In-room dining', category: 'Dining' },
  { src: hotelImages.pool, alt: 'The swimming pool', category: 'Wellness' },
  { src: hotelImages.spa, alt: 'Spa treatment room', category: 'Wellness' },
  { src: hotelImages.gym, alt: 'Fitness centre', category: 'Wellness' },
  { src: hotelImages.exterior, alt: 'Nova Suites exterior', category: 'The Hotel' },
  { src: hotelImages.lobby, alt: 'The hotel lobby', category: 'The Hotel' },
  { src: hotelImages.business, alt: 'Business facilities', category: 'The Hotel' },
  { src: hotelImages.galleryCity, alt: 'Views over Lagos', category: 'The Hotel' },
];

export default function GalleryGrid() {
  const [category, setCategory] = useState<Category>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visible = category === 'All' ? ITEMS : ITEMS.filter(item => item.category === category);
  const active = activeIndex === null ? null : visible[activeIndex] ?? null;

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') setActiveIndex(i => (i === null ? i : (i + 1) % visible.length));
      if (event.key === 'ArrowLeft') setActiveIndex(i => (i === null ? i : (i - 1 + visible.length) % visible.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, visible.length]);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {CATEGORIES.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => { setCategory(item); setActiveIndex(null); }}
            className={`min-h-11 border px-5 text-sm font-semibold transition ${
              category === item
                ? 'border-[var(--nova-gold)] bg-[var(--nova-gold)] text-[var(--nova-espresso)]'
                : 'border-[var(--nova-border-light)] bg-white text-[var(--nova-brown-muted)] hover:border-[var(--nova-gold)] hover:text-[var(--nova-espresso)]'
            }`}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, index) => (
          <button
            key={item.src + item.alt}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden bg-[var(--nova-sand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nova-gold)] focus-visible:ring-offset-2"
            aria-label={`View larger: ${item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-[rgba(38,24,15,0.82)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-text-light)] transition-transform duration-300 group-hover:translate-y-0 motion-reduce:transition-none">
              {item.alt}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <button
            type="button"
            onClick={event => { event.stopPropagation(); setActiveIndex(i => (i === null ? i : (i - 1 + visible.length) % visible.length)); }}
            className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
          <figure className="max-h-[85vh] w-full max-w-4xl" onClick={event => event.stopPropagation()}>
            <div className="relative aspect-[4/3] w-full">
              <Image src={active.src} alt={active.alt} fill sizes="90vw" className="object-contain" />
            </div>
            <figcaption className="mt-4 text-center text-sm text-white/80">{active.alt}</figcaption>
          </figure>
          <button
            type="button"
            onClick={event => { event.stopPropagation(); setActiveIndex(i => (i === null ? i : (i + 1) % visible.length)); }}
            className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </>
  );
}
