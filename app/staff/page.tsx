'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingsApi, roomsApi } from '@/lib/api';
import { today, addDays, formatCurrency, getErrorMessage } from '@/lib/utils';
import type { Booking, Room } from '@/types';
import NovaLogo from '@/components/brand/NovaLogo';
import Button from '@/components/ui/Button';
import Modal from '@/components/admin/Modal';
import StaffCalls from '@/components/staff/StaffCalls';

type Tab = 'reception' | 'calls';
type ActionKind = 'checkIn' | 'checkOut' | 'cancel';

export default function StaffPage() {
  const auth = useAuth();
  const router = useRouter();
  const canAccess = auth.isAdmin || auth.isStaff;
  const [tab, setTab] = useState<Tab>('reception');

  const [now, setNow] = useState(() => Date.now());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'arrivals' | 'departures' | 'inhouse'>('all');
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<{ id: number; kind: ActionKind } | null>(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    setNow(Date.now());
    try {
      const [b, r] = await Promise.all([bookingsApi.getAll(), roomsApi.getAll()]);
      setBookings(b);
      setRooms(r);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated || !canAccess) {
      router.replace('/auth/login?redirect=/staff');
      return;
    }
    void Promise.resolve().then(load);
    const timer = setInterval(() => void load(), 60000);
    return () => clearInterval(timer);
  }, [auth.isLoading, auth.isAuthenticated, canAccess, router, load]);

  if (auth.isLoading || !auth.isAuthenticated || !canAccess) {
    return <p className="p-10">Checking access…</p>;
  }

  const date = today();
  const days = Array.from({ length: 7 }, (_, i) => addDays(date, i));

  const active = (b: Booking) =>
    ['CONFIRMED', 'CHECKED_IN'].includes(b.status) ||
    (b.status === 'PENDING' && (!b.holdExpiresAt || new Date(b.holdExpiresAt + '+01:00').getTime() > now));

  const filtered = bookings.filter(b => {
    const haystack = `${b.id} ${b.customer?.firstName} ${b.customer?.lastName} ${b.room?.roomNumber}`.toLowerCase();
    if (!haystack.includes(query.toLowerCase())) return false;
    if (filter === 'arrivals') return b.checkInDate === date && b.status === 'CONFIRMED';
    if (filter === 'departures') return b.checkOutDate === date && b.status === 'CHECKED_IN';
    if (filter === 'inhouse') return b.status === 'CHECKED_IN';
    return true;
  });

  const perform = async () => {
    if (!action) return;
    setBusy(true);
    setError('');
    try {
      await bookingsApi[action.kind](action.id);
      setAction(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--nova-dashboard-bg)]">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-[var(--nova-espresso)] px-6 py-5 text-white">
        <NovaLogo />
        <div className="flex items-center gap-5 text-sm">
          {auth.isAdmin && <Link href="/admin">Admin dashboard</Link>}
          <Link href="/">Hotel website</Link>
          <button onClick={() => { auth.logout(); router.push('/'); }}>Sign out</button>
        </div>
      </header>

      <div className="flex items-center gap-2 border-b border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] px-6 py-3">
        <button
          onClick={() => setTab('reception')}
          aria-pressed={tab === 'reception'}
          className={`inline-flex min-h-10 items-center gap-2 rounded px-4 text-sm font-semibold ${tab === 'reception' ? 'bg-[var(--nova-espresso)] text-white' : 'text-[var(--nova-text-muted)] hover:text-[var(--nova-text-dark)]'}`}
        >
          <CalendarDays size={16} aria-hidden="true" /> Reception
        </button>
        <button
          onClick={() => setTab('calls')}
          aria-pressed={tab === 'calls'}
          className={`inline-flex min-h-10 items-center gap-2 rounded px-4 text-sm font-semibold ${tab === 'calls' ? 'bg-[var(--nova-espresso)] text-white' : 'text-[var(--nova-text-muted)] hover:text-[var(--nova-text-dark)]'}`}
        >
          <Phone size={16} aria-hidden="true" /> Calls
        </button>
      </div>

      {tab === 'calls' ? (
        <div className="px-5 py-8 lg:px-10">
          <StaffCalls />
        </div>
      ) : (
        <div className="px-5 py-8 lg:px-10">
          <div className="flex justify-between gap-4">
            <div>
              <p className="nova-eyebrow">RECEPTION · {date}</p>
              <h1 className="mt-3 font-serif text-4xl">Today&apos;s stays</h1>
            </div>
            <button
              onClick={load}
              className="inline-flex h-8 items-center justify-center rounded-md bg-[var(--nova-gold)] px-4 text-xs font-semibold text-[var(--nova-espresso)] transition hover:bg-[var(--nova-gold-light)]"
            >
              Refresh
            </button>
          </div>

          {error && <p role="alert" className="my-5 rounded border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}

          <div className="my-6 flex flex-wrap gap-3">
            {(['all', 'arrivals', 'departures', 'inhouse'] as const).map(key => (
              <button
                key={key}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`min-h-11 rounded border px-5 capitalize ${filter === key ? 'bg-[var(--nova-espresso)] text-white' : 'bg-white'}`}
              >
                {key === 'inhouse' ? 'In-house' : key}
              </button>
            ))}
            <input
              aria-label="Search reservations"
              className="admin-input max-w-md"
              placeholder="Guest, room or booking number"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </div>

          {loading ? (
            <p role="status">Refreshing reception…</p>
          ) : (
            <div className="admin-card overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking / guest</th>
                    <th>Room</th>
                    <th>Stay</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td>#{b.id} · {b.customer?.firstName} {b.customer?.lastName}</td>
                      <td>{b.room?.roomNumber}</td>
                      <td>{b.checkInDate} → {b.checkOutDate}</td>
                      <td>{formatCurrency(b.totalAmount)}</td>
                      <td>{b.status === 'PENDING' && !active(b) ? 'HOLD EXPIRED' : b.status.replaceAll('_', ' ')}</td>
                      <td>
                        <div className="flex gap-2">
                          {b.status === 'CONFIRMED' && <Button size="sm" onClick={() => setAction({ id: b.id, kind: 'checkIn' })}>Check in</Button>}
                          {b.status === 'CHECKED_IN' && <Button size="sm" onClick={() => setAction({ id: b.id, kind: 'checkOut' })}>Check out</Button>}
                          {b.status === 'PENDING' && <Button size="sm" variant="secondary" onClick={() => setAction({ id: b.id, kind: 'cancel' })}>Cancel hold</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && <p className="p-8 text-center">No stays match this view.</p>}
            </div>
          )}

          <section className="admin-card mt-8 overflow-x-auto p-5">
            <h2 className="font-serif text-2xl">Room calendar</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Room / now</th>
                  {days.map(d => <th key={d}>{d.slice(5)}</th>)}
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td>{r.roomNumber}<br /><small>{r.status}</small></td>
                    {days.map(d => {
                      const b = bookings.find(booking => booking.room?.id === r.id && active(booking) && booking.checkInDate <= d && booking.checkOutDate > d);
                      const status = r.status === 'MAINTENANCE' ? 'Maintenance' : b ? (b.status === 'CHECKED_IN' && d === date ? 'Occupied' : 'Reserved') : 'Available';
                      return (
                        <td key={d}>
                          <span className={`inline-block rounded px-2 py-1 text-xs ${status === 'Available' ? 'bg-green-50 text-green-800' : status === 'Occupied' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900'}`}>
                            {status}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {action && (
        <Modal
          title={`Confirm ${action.kind === 'checkIn' ? 'check-in' : action.kind === 'checkOut' ? 'check-out' : 'cancellation'} · #${action.id}`}
          onClose={() => { if (!busy) setAction(null); }}
          footer={<Button isLoading={busy} onClick={perform}>Confirm action</Button>}
        >
          {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        </Modal>
      )}
    </main>
  );
}
