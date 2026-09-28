import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, UtensilsCrossed } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { hotelImages } from '@/components/home/homeImages';
import { formatCurrency } from '@/lib/utils';
import { hotelContact, phoneHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Dining',
  description:
    'Refined local and international cuisine at Nova Suites — all-day dining, a rooftop lounge, and private dining.',
};

const venues = [
  {
    name: 'Nova Restaurant',
    tagline: 'All-day dining',
    text: 'Our signature restaurant serves a generous breakfast, a relaxed lunch, and an elegant à la carte dinner with a menu that celebrates West African produce.',
    hours: '6:30 AM – 11:00 PM',
    image: hotelImages.dining,
  },
  {
    name: 'The Gold Lounge',
    tagline: 'Rooftop bar & small plates',
    text: 'Sip signature cocktails and take in sweeping views of the Lagos skyline. Live music on Friday and Saturday evenings.',
    hours: '5:00 PM – 1:00 AM',
    image: hotelImages.galleryLounge,
  },
  {
    name: 'Sunrise Café',
    tagline: 'Coffee, pastries & light bites',
    text: 'Freshly roasted coffee, house-made pastries, and a quiet corner to work or catch up, open from the early hours.',
    hours: '6:00 AM – 6:00 PM',
    image: hotelImages.roomService,
  },
];

const menu = [
  { name: 'Suya-Spiced Beef Skewers', note: 'Grilled peppers, red onion', price: 9500 },
  { name: 'Nova Jollof & Grilled Chicken', note: 'Smoky jollof, plantain', price: 12500 },
  { name: 'Egusi with Pounded Yam', note: 'Slow-cooked, assorted meat', price: 11000 },
  { name: 'Seared Sea Bass', note: 'Coconut rice, greens', price: 18000 },
  { name: 'Nova Signature Burger', note: 'Aged beef, smoked cheese', price: 10500 },
  { name: 'Coconut Panna Cotta', note: 'Mango, toasted coconut', price: 6500 },
];

export default function DiningPage() {
  return (
    <main className="bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      <PageHero
        eyebrow="A Taste of Extraordinary"
        title="Dining at Nova"
        breadcrumb="Dining"
        description="From sunlit breakfasts to late-night cocktails, our kitchens bring together local flavour and global technique."
        imageUrl={hotelImages.dining}
      />

      {/* Venues */}
      <section className="bg-[var(--nova-ivory-soft)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="nova-eyebrow mb-4">Three Ways to Dine</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Our Restaurants & Bars</h2>
          </div>
          <div className="space-y-12">
            {venues.map((venue, index) => (
              <article key={venue.name} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                <figure className={`relative aspect-[4/3] overflow-hidden ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                  <Image
                    src={venue.image}
                    alt={venue.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </figure>
                <div>
                  <p className="nova-eyebrow mb-3">{venue.tagline}</p>
                  <h3 className="font-serif text-3xl leading-tight sm:text-4xl">{venue.name}</h3>
                  <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--nova-text-muted)] sm:text-base">{venue.text}</p>
                  <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--nova-espresso)]">
                    <Clock size={15} className="text-[var(--nova-gold)]" aria-hidden="true" /> {venue.hours}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Menu highlights */}
      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="nova-eyebrow mb-4">From the Kitchen</p>
              <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Menu Highlights</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[var(--nova-sand)]">
              A taste of what awaits. Our full menu changes with the seasons and the market.
            </p>
          </div>
          <ul className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {menu.map(dish => (
              <li key={dish.name} className="flex items-baseline justify-between gap-4 border-b border-[var(--nova-border-dark)] pb-4">
                <div>
                  <p className="font-serif text-lg text-[var(--nova-text-light)]">{dish.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--nova-sand)]">{dish.note}</p>
                </div>
                <span className="shrink-0 font-semibold text-[var(--nova-gold-light)]">{formatCurrency(dish.price)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 inline-flex items-center gap-2 text-sm text-[var(--nova-sand)]">
            <UtensilsCrossed size={15} className="text-[var(--nova-gold)]" aria-hidden="true" />
            Vegetarian, vegan, and allergy-friendly options are always available — just ask your server.
          </p>
        </div>
      </section>

      {/* Location / hours */}
      <section className="bg-[var(--nova-ivory)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="nova-card p-8">
            <MapPin size={22} className="text-[var(--nova-gold)]" aria-hidden="true" />
            <h3 className="nova-card-heading mt-4 mb-3">Find Us</h3>
            <p className="text-sm leading-7 text-[var(--nova-text-muted)]">
              {hotelContact.address ?? 'Contact reception for directions and arrival details.'}
            </p>
          </div>
          <div className="nova-card p-8">
            <Clock size={22} className="text-[var(--nova-gold)]" aria-hidden="true" />
            <h3 className="nova-card-heading mt-4 mb-3">Reservations</h3>
            <p className="text-sm leading-7 text-[var(--nova-text-muted)]">
              Tables are recommended for dinner and weekend brunch.{' '}
              {hotelContact.phone ? (
                <>Call <a href={phoneHref(hotelContact.phone)} className="font-semibold text-[var(--nova-espresso)] underline underline-offset-4">{hotelContact.phone}</a> or ask the concierge to reserve for you.</>
              ) : (
                <Link href="/contact" className="font-semibold text-[var(--nova-espresso)] underline underline-offset-4">Contact reception to reserve.</Link>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-20">
          <div>
            <p className="nova-eyebrow mb-4">Dine With Us</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Reserve Your Table</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--nova-sand)] sm:text-base">
              Staying with us? Charge dining directly to your room. Visiting for the evening? We would be delighted to host you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/contact" className="inline-flex min-h-12 items-center gap-2 bg-[var(--nova-gold)] px-7 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]">
              Contact Us <ArrowRight size={15} />
            </Link>
            <Link href="/rooms" className="inline-flex min-h-12 items-center border border-[var(--nova-text-light)]/40 px-7 text-sm font-semibold text-[var(--nova-text-light)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold-light)]">
              Book a Room
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
