import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, Dumbbell, Flower2, Utensils, Waves, Wifi } from 'lucide-react';
import { hotelImages } from './homeImages';

const strip = [
  { icon: BedDouble, title: 'Luxury Rooms', text: 'Designed for comfort' },
  { icon: Utensils, title: 'Fine Dining', text: 'A culinary experience' },
  { icon: Waves, title: 'Swimming Pool', text: 'Relax and unwind' },
  { icon: Dumbbell, title: 'Fitness Center', text: 'Stay active' },
  { icon: Flower2, title: 'Spa & Wellness', text: 'Rejuvenate your mind' },
  { icon: Wifi, title: 'High-Speed WiFi', text: 'Stay connected' },
];

export default function AboutSection() {
  return (
    <>
      <section className="bg-[var(--nova-text-light)] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 border-y border-[var(--nova-sand)]/40 py-8 sm:grid-cols-3 lg:grid-cols-6">
          {strip.map(item => (
            <div key={item.title} className="text-center">
              <item.icon className="mx-auto mb-3 text-[var(--nova-gold)]" size={30} strokeWidth={1.5} />
              <p className="text-sm font-semibold text-[var(--nova-text-dark)]">{item.title}</p>
              <p className="mt-1 text-xs text-[var(--nova-text-muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.9fr_1.35fr_0.38fr]">
          <div className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--nova-gold)]">The Nova Experience</p>
            <h2 className="font-serif text-4xl leading-[1.02] sm:text-5xl">Designed for a Better You</h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[var(--nova-sand)]">
              At Nova Suites, modern luxury meets warm hospitality to create an unforgettable experience. Whether you are here for business, leisure, or a special occasion, every detail is crafted with you in mind.
            </p>
            <Link href="/about" className="mt-8 inline-flex min-h-11 items-center bg-[var(--nova-gold)] px-6 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]">Our Story</Link>
          </div>
          <div className="relative min-h-[320px] lg:min-h-[470px]">
            <Image src={hotelImages.lobby} alt="Nova Suites Lagos lobby" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
          </div>
          <div className="grid grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:block lg:space-y-9 lg:px-8 lg:py-20">
            {[
              ['100+', 'Luxury Rooms'],
              ['24/7', 'Guest Support'],
              ['5+', 'Guest Rating'],
              ['100%', 'Satisfaction'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-serif text-3xl text-[var(--nova-gold)]">{value}</p>
                <p className="mt-1 text-xs text-[var(--nova-sand)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
