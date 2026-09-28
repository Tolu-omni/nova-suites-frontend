import Image from 'next/image';
import Link from 'next/link';
import { hotelImages } from './homeImages';

const amenities = [
  { title: 'Swimming Pool', text: 'Relax and unwind', image: hotelImages.pool },
  { title: 'Fitness Center', text: 'Stay active', image: hotelImages.gym },
  { title: 'Spa & Wellness', text: 'Rejuvenate your mind', image: hotelImages.spa },
  { title: 'Fine Dining', text: 'A culinary experience', image: hotelImages.dining },
  { title: 'Room Service', text: 'At your convenience', image: hotelImages.roomService },
  { title: 'Business Facilities', text: 'Work without limits', image: hotelImages.business },
];

export default function AmenitiesSection() {
  return (
    <section className="bg-[var(--nova-text-light)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--nova-gold)]">World-Class Amenities</p>
            <h2 className="max-w-xl font-serif text-4xl leading-none text-[var(--nova-text-dark)] sm:text-5xl">Everything You Need, All in One Place</h2>
          </div>
          <Link href="/amenities" className="inline-flex min-h-11 items-center gap-2 border border-[var(--nova-sand)] px-6 text-sm font-semibold text-[var(--nova-text-dark)] transition hover:bg-white">View All Amenities -&gt;</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {amenities.map(item => (
            <div key={item.title}>
              <div className="relative aspect-[1.32] overflow-hidden bg-[var(--nova-sand)]">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 16vw" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--nova-text-dark)]">{item.title}</h3>
              <p className="mt-1 text-xs text-[var(--nova-text-muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
