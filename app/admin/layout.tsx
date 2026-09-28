'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, CalendarCheck, ChevronRight, CreditCard, ExternalLink, LayoutDashboard,
  LogOut, Menu, ShieldCheck, Users, UserCog, X, BedDouble,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import NovaLogo from '@/components/brand/NovaLogo';
import { ToastProvider } from '@/components/admin/ToastProvider';
import ThemeToggle from '@/components/theme/ThemeToggle';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Rooms', href: '/admin/rooms', icon: BedDouble },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Guest inquiries', href: '/admin/inquiries', icon: Users },
  { label: 'Reception', href: '/staff', icon: CalendarCheck },
  { label: 'Staff permissions', href: '/admin/staff-permissions', icon: ShieldCheck },
  { label: 'Account', href: '/admin/account', icon: UserCog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace('/auth/login?redirect=/admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) return <PageLoader />;
  if (!isAdmin) return <PageLoader />;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="admin-shell min-h-screen bg-[var(--nova-dashboard-bg)] lg:flex lg:h-screen lg:min-h-0 lg:overflow-hidden">
      {navOpen && (
        <button
          type="button"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar — pinned in place; only the content column scrolls. */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col overflow-y-auto bg-[var(--nova-espresso)] transition-transform duration-300 lg:static lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" aria-label="Nova Suites admin home">
            <NovaLogo variant="light" size="md" />
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="text-[var(--nova-sand)] transition hover:text-[var(--nova-text-light)] lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--nova-sand)]">
          Admin Panel
        </p>

        <nav className="flex-1 space-y-1 px-3">
          {adminNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-[var(--nova-gold)] text-[var(--nova-espresso)] shadow-sm'
                    : 'text-[var(--nova-sand)] hover:bg-white/5 hover:text-[var(--nova-gold-light)]'
                }`}
              >
                <item.icon size={17} aria-hidden="true" />
                {item.label}
                {active && <ChevronRight size={15} className="ml-auto" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-white/10 p-3">
          <div className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(184,135,58,0.22)] text-xs font-bold text-[var(--nova-gold-light)]">
              {`${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--nova-text-light)]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-[var(--nova-sand)]">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[var(--nova-sand)] transition hover:text-[var(--nova-gold-light)]"
          >
            <ExternalLink size={16} aria-hidden="true" /> View site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[var(--nova-sand)] transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={16} aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      {/* Content column — owns its own scroll on desktop. */}
      <div className="flex min-w-0 flex-1 flex-col lg:h-full lg:min-h-0">
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-4 border-b border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)]/95 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--nova-border-light)] text-[var(--nova-text-dark)] lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden items-center gap-2 text-sm font-semibold text-[var(--nova-brown-muted)] transition hover:text-[var(--nova-gold)] sm:inline-flex"
            >
              View site <ExternalLink size={14} aria-hidden="true" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:min-h-0 lg:overflow-y-auto lg:px-8 lg:py-7">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
