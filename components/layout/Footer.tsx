'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Phone } from 'lucide-react';
import NovaLogo from '@/components/brand/NovaLogo';
import { emailHref, hotelContact, phoneHref } from '@/lib/site';

const exploreLinks = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Amenities', href: '/amenities' },
  { label: 'Dining', href: '/dining' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const helpfulLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
];

const authOnlyPaths = ['/auth/login', '/auth/register', '/sign-in', '/create-account'];
const shelllessPrefixes = ['/admin', '/staff'];

export default function Footer() {
  const pathname = usePathname();
  if (
    authOnlyPaths.some(path => pathname === path) ||
    shelllessPrefixes.some(prefix => pathname.startsWith(prefix))
  ) {
    return null;
  }

  return (
    <footer className="w-full bg-[var(--nova-espresso)] px-5 py-14 text-[var(--nova-text-light)] md:px-8 lg:px-16 2xl:px-20">
      <div className="w-full">
        <div className="grid gap-12 border-b border-[var(--nova-border-dark)] pb-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.9fr_1.25fr]">
          <div>
            <Link href="/" aria-label="Nova Suites home">
              <NovaLogo variant="light" size="lg" showLocation />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-[var(--nova-sand)]">Beautiful places. A kinder tomorrow.</p>
          </div>

          <FooterList title="Explore" links={exploreLinks.slice(0, 5)} />
          <FooterList title="Helpful Links" links={[...exploreLinks.slice(5), ...helpfulLinks]} />

          <div>
            <h3 className="mb-5 nova-eyebrow text-[var(--nova-sand)]">Contact</h3>
            <ul className="space-y-3 text-sm text-[var(--nova-sand)]">
              {hotelContact.address && <li className="flex gap-3"><MapPin size={15} className="mt-0.5 text-[var(--nova-gold-light)]" aria-hidden="true" /> {hotelContact.address}</li>}
              {hotelContact.phone && <li><a href={phoneHref(hotelContact.phone)} className="flex gap-3 hover:text-[var(--nova-gold-light)]"><Phone size={15} className="text-[var(--nova-gold-light)]" aria-hidden="true" /> {hotelContact.phone}</a></li>}
              {hotelContact.email && <li><a href={emailHref(hotelContact.email)} className="flex gap-3 hover:text-[var(--nova-gold-light)]"><Mail size={15} className="text-[var(--nova-gold-light)]" aria-hidden="true" /> {hotelContact.email}</a></li>}
              {!hotelContact.address && !hotelContact.phone && !hotelContact.email && <li><Link href="/contact" className="hover:text-[var(--nova-gold-light)]">Send us a message</Link></li>}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 pt-7 text-xs text-[var(--nova-sand)] sm:flex-row">
          <p>© {new Date().getFullYear()} Nova Suites. All rights reserved.</p>
          <div className="flex gap-5">
            {helpfulLinks.map(link => <Link key={link.href} href={link.href} className="hover:text-[var(--nova-gold-light)]">{link.label}</Link>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-5 nova-eyebrow text-[var(--nova-sand)]">{title}</h3>
      <ul className="space-y-2.5">
        {links.map(link => <li key={link.href}><Link href={link.href} className="text-sm text-[var(--nova-sand)] hover:text-[var(--nova-gold-light)]">{link.label}</Link></li>)}
      </ul>
    </div>
  );
}
