'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BadgeCheck, ExternalLink, Globe, KeyRound, LogOut, Server, ShieldCheck,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/admin/PageHeader';

export default function AdminAccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`;

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <div>
      <PageHeader
        title="Account"
        actions={
          <Button variant="danger" onClick={handleSignOut}>
            <LogOut size={16} /> Sign out
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="admin-card p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[rgba(184,135,58,0.16)] font-serif text-xl font-bold text-[var(--nova-text-dark)]">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-serif text-2xl leading-tight text-[var(--nova-text-dark)]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-sm text-[var(--nova-text-muted)]">{user?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--nova-gold)] bg-[rgba(184,135,58,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--nova-text-dark)]">
                <BadgeCheck size={13} aria-hidden="true" />
                {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Unknown'}
              </span>
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-[var(--nova-border-light)] pt-5 text-sm">
            {[
              { label: 'Account ID', value: user?.id ? `#${user.id}` : '—' },
              { label: 'Role', value: user?.role ?? '—' },
            ].map(item => (
              <div key={item.label} className="flex justify-between gap-4">
                <dt className="text-[var(--nova-text-muted)]">{item.label}</dt>
                <dd className="font-medium text-[var(--nova-text-dark)]">{item.value}</dd>
              </div>
            ))}
          </dl>

        </section>

        <div className="space-y-6">
          <section className="admin-card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-[var(--nova-text-dark)]">
              <ShieldCheck size={18} className="text-[var(--nova-gold)]" aria-hidden="true" /> Access
            </h2>
            <ul className="space-y-2.5 text-sm text-[var(--nova-text-muted)]">
              {[
                'Manage rooms, rates, and availability',
                'Create, update, and delete bookings',
                'Manage customer accounts and roles',
                'Review payments and mark them as paid',
                'View reports and export data',
              ].map(permission => (
                <li key={permission} className="flex gap-2.5">
                  <BadgeCheck size={15} className="mt-0.5 shrink-0 text-green-700" aria-hidden="true" />
                  {permission}
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-[var(--nova-text-dark)]">
              <Server size={18} className="text-[var(--nova-gold)]" aria-hidden="true" /> System
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-[var(--nova-text-muted)]">
                  <Globe size={14} aria-hidden="true" /> API base URL
                </dt>
                <dd className="truncate font-mono text-xs text-[var(--nova-text-dark)]">{getApiBaseUrl()}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-[var(--nova-text-muted)]">
                  <KeyRound size={14} aria-hidden="true" /> Session
                </dt>
                <dd className="font-medium text-[var(--nova-text-dark)]">Signed in</dd>
              </div>
            </dl>

            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--nova-gold)] hover:underline"
            >
              Open the public site <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
