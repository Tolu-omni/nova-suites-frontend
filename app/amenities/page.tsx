import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BriefcaseBusiness, Car, ConciergeBell, Dumbbell, Flower2,
  Shirt, Utensils, Waves, Wifi,
} from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { hotelImages } from '@/components/home/homeImages';

export const metadata: Metadata = {
  title: 'Amenities',
  description:
    'Pool, spa, fitness centre, fine dining, room service, and business facilities — everything you need at Nova Suites.',
};

const featured = [
  { title: 'Swimming Pool', text: 'A temperature-controlled pool with loungers and poolside service.', image: hotelImages.pool },
  { title: 'Fitness Centre', text: 'Modern cardio and strength equipment, open early to late.', image: hotelImages.gym },
  { title: 'Spa & Wellness', text: 'Massage, facials, and holistic rituals in a serene setting.', image: hotelImages.spa },
  { title: 'Fine Dining', text: 'Local and international cuisine prepared by our head chef.', image: hotelImages.dining },
  { title: 'Room Service', text: 'In-room dining around the clock, from breakfast to midnight bites.', image: hotelImages.roomService },
  { title: 'Business Facilities', text: 'Meeting rooms, workstations, and reliable high-speed internet.', image: hotelImages.business },
];

const details = [
  { icon: Wifi, title: 'High-Speed Wi-Fi', text: 'Complimentary fibre internet throughout the property.' },
  { icon: Waves, title: 'Outdoor Pool', text: 'Open daily from 6:00 AM to 10:00 PM.' },
  { icon: Dumbbell, title: '24-Hour Gym', text: 'Access with your room key, any time of day.' },
  { icon: Flower2, title: 'Spa & Sauna', text: 'Treatments by appointment, 9:00 AM to 9:00 PM.' },
  { icon: Utensils, title: 'Two Restaurants', text: 'All-day dining plus a rooftop lounge and bar.' },
  { icon: ConciergeBell, title: 'Concierge', text: 'Tours, transfers, and reservations arranged for you.' },
  { icon: Car, title: 'Secure Parking', text: 'On-site valet and self-parking for guests.' },
  { icon: BriefcaseBusiness, title: 'Meeting Rooms', text: 'Flexible spaces for up to 120 delegates.' },
  { icon: Shirt, title: 'Laundry & Pressing', text: 'Same-day service, collected from your room.' },
];

export default function AmenitiesPage() {
  return (
    <main className="bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      <PageHero
        eyebrow="World-Class Amenities"
        title="Everything You Need, All in One Place"
        breadcrumb="Amenities"
        description="Thoughtfully curated comforts and facilities designed to make every moment of your stay effortless."
        imageUrl={hotelImages.pool}
      />

      {/* Featured amenities */}
      <section className="bg-[var(--nova-ivory-soft)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="nova-eyebrow mb-4">Signature Spaces</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Where You Will Spend Your Time</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map(item => (
              <article key={item.title} className="group overflow-hidden border border-[var(--nova-border-light)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0">
                <div className="relative aspect-[1.6] overflow-hidden bg-[var(--nova-sand)]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 30vw"
                    className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="p-6">
                  <h3 className="nova-card-heading mb-2">{item.title}</h3>
                  <p className="text-sm leading-6 text-[var(--nova-text-muted)]">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Detail grid */}
      <section className="bg-[var(--nova-ivory)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="nova-eyebrow mb-4">At Your Service</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Included With Every Stay</h2>
          </div>
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {details.map(item => (
              <div key={item.title} className="flex gap-4 border-t border-[var(--nova-border-light)] pt-6">
                <item.icon size={22} className="mt-0.5 shrink-0 text-[var(--nova-gold)]" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--nova-text-dark)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--nova-text-muted)]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-20">
          <div>
            <p className="nova-eyebrow mb-4">Your Turn to Unwind</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Relax. We Have It Covered</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--nova-sand)] sm:text-base">
              Book your stay and enjoy full access to the pool, gym, spa, and everything else Nova has to offer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/rooms" className="inline-flex min-h-12 items-center gap-2 bg-[var(--nova-gold)] px-7 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]">
              Book a Room <ArrowRight size={15} />
            </Link>
            <Link href="/dining" className="inline-flex min-h-12 items-center border border-[var(--nova-text-light)]/40 px-7 text-sm font-semibold text-[var(--nova-text-light)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold-light)]">
              See Dining
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
