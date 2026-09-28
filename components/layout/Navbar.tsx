'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, ChevronDown, User, LogOut, LayoutDashboard,
  CalendarCheck, Users, MapPin, Search, Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NovaLogo from '@/components/brand/NovaLogo';
import { hotelContact, phoneHref } from '@/lib/site';

const authOnlyPaths = ['/auth/login', '/auth/register', '/sign-in', '/create-account'];
const shelllessPrefixes = ['/admin', '/staff'];

const publicLinks = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Amenities', href: '/amenities' },
  { label: 'Dining', href: '/dining' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hideShell =
    authOnlyPaths.some(path => pathname === path) ||
    shelllessPrefixes.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  if (hideShell) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 text-[var(--nova-text-light)] transition-all duration-300 ${scrolled ? 'bg-[rgba(38,24,15,0.97)] shadow-lg shadow-[rgba(38,24,15,0.22)]' : 'bg-[rgba(38,24,15,0.9)]'}`}>
      <div className="hidden border-b border-[var(--nova-border-dark)] px-5 py-2 text-[11px] text-[var(--nova-sand)] sm:block md:px-8 lg:px-16 2xl:px-20">
        <div className="flex w-full items-center justify-between gap-5">
          <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-[var(--nova-gold-light)]" aria-hidden="true" /> Lagos, Nigeria</span>
          <span className="hidden md:inline">Thoughtful hospitality. Exceptional stays.</span>
          {hotelContact.phone ? (
            <a href={phoneHref(hotelContact.phone)} className="inline-flex items-center gap-1.5 hover:text-[var(--nova-gold-light)]">
              <Phone size={12} aria-hidden="true" /> {hotelContact.phone}
            </a>
          ) : (
            <Link href="/contact" className="hover:text-[var(--nova-gold-light)]">Contact reception</Link>
          )}
        </div>
      </div>

      <nav className="w-full px-5 md:px-8 lg:px-16 2xl:px-20">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" aria-label="Nova Suites home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nova-gold)]">
            <NovaLogo variant="light" size="md" />
          </Link>

          <ul className="hidden items-center gap-7 xl:flex">
            {publicLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={`border-b py-2 text-xs font-semibold transition ${isActive(link.href) ? 'border-[var(--nova-gold)] text-[var(--nova-gold-light)]' : 'border-transparent text-[var(--nova-text-light)]/85 hover:text-[var(--nova-gold-light)]'}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-5 xl:flex">
            <Link href="/rooms" aria-label="Search rooms"><Search size={17} className="text-[var(--nova-text-light)]/75 hover:text-[var(--nova-gold-light)]" /></Link>
            {isAuthenticated ? (
              <>
                {!isAdmin && !isStaff && <Link href="/my-bookings" className="text-xs font-semibold text-[var(--nova-text-light)]/85 hover:text-[var(--nova-gold-light)]">My Bookings</Link>}
                {(isAdmin || isStaff) && <Link href={isAdmin ? '/admin' : '/staff'} className="text-xs font-semibold text-[var(--nova-text-light)]/85 hover:text-[var(--nova-gold-light)]">{isAdmin ? 'Admin Dashboard' : 'Staff Panel'}</Link>}
                <Link href="/rooms" className="rounded-md border border-[var(--nova-gold)] bg-[var(--nova-gold)] px-5 py-3 text-xs font-bold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]">Book Now</Link>
                <div className="relative">
                  <button onBlur={event => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setAccountOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') setAccountOpen(false); }} onClick={() => setAccountOpen(o => !o)} className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs font-semibold text-[var(--nova-gold-light)] hover:bg-white/5" aria-expanded={accountOpen}>
                    <User size={15} aria-hidden="true" /> {user?.firstName} <ChevronDown size={13} aria-hidden="true" />
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 mt-4 w-60 rounded-md border border-[var(--nova-border-dark)] bg-[var(--nova-espresso-soft)] py-2 shadow-2xl">
                      <div className="border-b border-[var(--nova-border-dark)] px-4 py-3">
                        <p className="text-xs text-[var(--nova-sand)]">Signed in as</p>
                        <p className="truncate text-sm text-[var(--nova-text-light)]">{user?.email}</p>
                      </div>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[var(--nova-text-light)]/80 hover:text-red-300">
                        <LogOut size={14} aria-hidden="true" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-xs font-semibold text-[var(--nova-text-light)]/85 hover:text-[var(--nova-gold-light)]">Login</Link>
                <Link href="/rooms" className="rounded-md border border-[var(--nova-text-light)]/45 px-5 py-3 text-xs font-bold text-[var(--nova-text-light)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold-light)]">Book Now</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-11 min-w-11 items-center justify-center rounded-md xl:hidden" aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-[var(--nova-border-dark)] bg-[var(--nova-espresso)] px-4 py-5 shadow-2xl xl:hidden">
          <div className="space-y-1">
            {publicLinks.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`block rounded-md px-3 py-3 text-sm ${isActive(link.href) ? 'bg-white/5 text-[var(--nova-gold-light)]' : 'text-[var(--nova-text-light)]/85'}`}>{link.label}</Link>)}
            <div className="border-t border-[var(--nova-border-dark)] pt-3">
              {isAuthenticated ? (
                <>
                  {!isAdmin && !isStaff && <Link href="/my-bookings" className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-[var(--nova-text-light)]/85"><CalendarCheck size={15} /> My Bookings</Link>}
                  {isAdmin && <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-[var(--nova-text-light)]/85"><LayoutDashboard size={15} /> Admin Dashboard</Link>}
                  {isStaff && <Link href="/staff" className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-[var(--nova-text-light)]/85"><Users size={15} /> Staff Panel</Link>}
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm text-red-300"><LogOut size={15} /> Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block rounded-md px-3 py-3 text-sm text-[var(--nova-text-light)]/85">Login</Link>
                  <Link href="/rooms" className="mt-2 block rounded-md border border-[var(--nova-gold)] px-3 py-3 text-center text-sm font-bold text-[var(--nova-gold-light)]">Book Now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
