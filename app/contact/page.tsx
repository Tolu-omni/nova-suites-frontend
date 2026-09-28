import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import ContactForm from '@/components/contact/ContactForm';
import { hotelImages } from '@/components/home/homeImages';
import { emailHref, hotelContact, phoneHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach Nova Suites for bookings, directions, guest support, and special requests. Victoria Island, Lagos.',
};

const details = [
  ...(hotelContact.address ? [{ icon: MapPin, label: 'Visit', value: hotelContact.address }] : []),
  ...(hotelContact.phone ? [{ icon: Phone, label: 'Call', value: hotelContact.phone, href: phoneHref(hotelContact.phone) }] : []),
  ...(hotelContact.email ? [{ icon: Mail, label: 'Email', value: hotelContact.email, href: emailHref(hotelContact.email) }] : []),
  { icon: Clock, label: 'Reception', value: 'Open 24 hours, every day' },
];

export default function ContactPage() {
  return (
    <main className="bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      <PageHero
        eyebrow="Lagos, Nigeria"
        title="Contact Us"
        breadcrumb="Contact"
        description="Questions about a stay, an event, or a table? Our team is here around the clock."
        imageUrl={hotelImages.exterior}
      />

      {/* Contact details */}
      <section className="bg-[var(--nova-ivory-soft)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 lg:py-20">
          {details.map(item => (
            <div key={item.label} className="nova-card p-6">
              <item.icon size={22} className="text-[var(--nova-gold)]" aria-hidden="true" />
              <h2 className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">{item.label}</h2>
              {item.href ? (
                <a href={item.href} className="mt-2 block text-sm leading-6 text-[var(--nova-text-dark)] underline-offset-4 hover:text-[var(--nova-gold)] hover:underline">
                  {item.value}
                </a>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[var(--nova-text-dark)]">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form + map */}
      <section className="bg-[var(--nova-ivory)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <ContactForm />

          <div className="space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden border border-[var(--nova-border-light)]">
              <Link
                href={hotelContact.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelContact.address)}` : '/contact'}
                target={hotelContact.address ? '_blank' : undefined}
                rel={hotelContact.address ? 'noreferrer' : undefined}
                className="group block h-full w-full"
              >
                <Image
                  src={hotelImages.galleryCity}
                  alt="Central Lagos, near Nova Suites"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
                <span className="absolute inset-0 bg-[rgba(38,24,15,0.35)] transition group-hover:bg-[rgba(38,24,15,0.2)]" />
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 bg-[var(--nova-gold)] px-5 py-3 text-sm font-semibold text-[var(--nova-espresso)]">
                  {hotelContact.address ? 'Get Directions' : 'Contact Reception'} <ArrowRight size={15} />
                </span>
              </Link>
            </div>

            <div className="nova-card p-7">
              <h2 className="nova-card-heading mb-4">Plan Your Visit</h2>
              <p className="text-sm leading-7 text-[var(--nova-text-muted)]">
                Planning something special? Our events team can arrange private dining, meetings,
                and celebrations for up to 120 guests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--nova-espresso)] text-[var(--nova-text-light)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-20">
          <div>
            <p className="nova-eyebrow mb-4">Ready to Book?</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Reserve Your Stay</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--nova-sand)] sm:text-base">
              Browse our rooms and suites, choose your dates, and we will take care of the rest.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/rooms" className="inline-flex min-h-12 items-center gap-2 bg-[var(--nova-gold)] px-7 text-sm font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]">
              View Rooms <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
