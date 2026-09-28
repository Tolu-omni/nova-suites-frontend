import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ConciergeBell, Heart, Leaf, Sparkles } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { hotelImages } from '@/components/home/homeImages';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Nova Suites blends modern luxury with warm Lagos hospitality for business, leisure, and memorable stays.',
};

const stats = [
  { value: '100+', label: 'Rooms & Suites' },
  { value: '24/7', label: 'Guest Support' },
  { value: '4.9', label: 'Average Rating' },
  { value: '12', label: 'Years of Hospitality' },
];

const values = [
  {
    icon: Heart,
    title: 'Warm Hospitality',
    text: 'Every guest is welcomed like family. Our team is on hand around the clock to make your stay effortless.',
  },
  {
    icon: Sparkles,
    title: 'Thoughtful Design',
    text: 'From the lighting to the linens, each space is crafted to feel calm, considered, and unmistakably Nova.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Luxury',
    text: 'We reduce waste, source locally, and run energy-efficient operations without compromising comfort.',
  },
  {
    icon: ConciergeBell,
    title: 'Attentive Service',
    text: 'Airport transfers, private dining, event planning — tell us what you need and consider it arranged.',
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      <PageHero
        eyebrow="Our Story"
        title="About Nova Suites"
        breadcrumb="About"
        description="A modern Lagos landmark where contemporary design meets the warmth of Nigerian hospitality."
        imageUrl={hotelImages.lobby}
      />

      {/* Stats */}
      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map(item => (
            <div key={item.label} className="text-center">
              <p className="font-serif text-4xl text-[var(--nova-gold)] lg:text-5xl">{item.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[var(--nova-sand)]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-[var(--nova-ivory-soft)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={hotelImages.exterior}
              alt="Nova Suites exterior in Lagos"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="nova-eyebrow mb-4">Since 2013</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Designed for a Better You</h2>
            <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--nova-text-muted)] sm:text-base">
              <p>
                Nova Suites was born from a simple idea: that a hotel should feel like a home you look
                forward to returning to. We set out to build a place where business travellers, families,
                and couples could all find their own version of comfort in the heart of Lagos.
              </p>
              <p>
                Today, our rooms and suites pair modern architecture with textures, scents, and flavours
                drawn from across West Africa. Our kitchen celebrates local produce, our spa draws on
                time-honoured rituals, and our team is proud to make every stay feel personal.
              </p>
              <p>
                Whether you are here for one night or one month, we are devoted to the details that turn a
                stay into a story worth telling.
              </p>
            </div>
            <Link
              href="/rooms"
              className="mt-8 inline-flex min-h-11 items-center gap-2 bg-[var(--nova-gold)] px-6 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]"
            >
              Explore Our Rooms <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[var(--nova-ivory)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="nova-eyebrow mb-4">What Guides Us</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Our Values</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(value => (
              <div key={value.title} className="nova-card p-7">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(184,135,58,0.14)]">
                  <value.icon size={22} className="text-[var(--nova-gold)]" aria-hidden="true" />
                </span>
                <h3 className="nova-card-heading mb-3">{value.title}</h3>
                <p className="text-sm leading-6 text-[var(--nova-text-muted)]">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-20">
          <div>
            <p className="nova-eyebrow mb-4">Ready When You Are</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Come Experience Nova</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--nova-sand)] sm:text-base">
              Reserve a room, plan an event, or simply ask us a question. Our team would love to hear from you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/rooms"
              className="inline-flex min-h-12 items-center gap-2 bg-[var(--nova-gold)] px-7 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]"
            >
              Book a Room <ArrowRight size={15} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center border border-[var(--nova-text-light)]/40 px-7 text-sm font-semibold text-[var(--nova-text-light)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold-light)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
