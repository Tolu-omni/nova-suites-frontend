'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Banknote, BedDouble, CalendarCheck, CreditCard, ExternalLink,
  LogIn, LogOut, Plus, TrendingUp, Users,
} from 'lucide-react';
import { bookingsApi, paymentsApi, customersApi } from '@/lib/api';
import { addDays, formatCurrency, formatDate, getErrorMessage, today } from '@/lib/utils';
import { getRoomName } from '@/lib/roomDisplay';
import type { Booking, BookingStatus, Customer, Payment } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { DonutChart, LineChart } from '@/components/admin/charts';
import KpiCard from '@/components/admin/panel/KpiCard';
import SegmentedTabs from '@/components/admin/panel/SegmentedTabs';

type Metric = 'bookings' | 'revenue';
type Range = 'week' | 'month';

const STATUS_BADGE: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  CHECKED_IN: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  CHECKED_OUT: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  CANCELLED: 'Cancelled',
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('bookings');
  const [range, setRange] = useState<Range>('week');

  useEffect(() => {
    Promise.allSettled([bookingsApi.getAll(), customersApi.getAll(), paymentsApi.getAll()])
      .then(([bookingsRes, customersRes, paymentsRes]) => {
        const failed = [bookingsRes, customersRes, paymentsRes].find(r => r.status === 'rejected');
        if (failed && failed.status === 'rejected') setError(getErrorMessage(failed.reason));
        if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value);
        if (customersRes.status === 'fulfilled') setCustomers(customersRes.value);
        if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const dateToday = today();
  const successfulPayments = useMemo(() => payments.filter(p => p.status === 'SUCCESSFUL'), [payments]);
  const pendingPayments = payments.filter(p => p.status === 'PENDING');
  const revenue = successfulPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const pendingValue = pendingPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const arrivalsToday = bookings.filter(b => b.checkInDate === dateToday && b.status !== 'CANCELLED');
  const departuresToday = bookings.filter(b => b.checkOutDate === dateToday && b.status !== 'CANCELLED');
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  const donutSegments = [
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'CONFIRMED').length, color: '#3B82F6' },
    { label: 'Checked In', value: bookings.filter(b => b.status === 'CHECKED_IN').length, color: '#16A34A' },
    { label: 'Checked Out', value: bookings.filter(b => b.status === 'CHECKED_OUT').length, color: '#A1A1AA' },
  ];

  const { series, currentTotal, deltaPct } = useMemo(() => {
    const n = range === 'week' ? 7 : 30;
    const days = Array.from({ length: n }, (_, i) => addDays(dateToday, i - (n - 1)));
    const prevDays = Array.from({ length: n }, (_, i) => addDays(dateToday, i - (2 * n - 1)));

    const bookingByDay = new Map<string, number>();
    bookings.forEach(b => {
      const key = (b.createdAt ?? '').slice(0, 10) || b.checkInDate;
      bookingByDay.set(key, (bookingByDay.get(key) ?? 0) + 1);
    });
    const revenueByDay = new Map<string, number>();
    successfulPayments.forEach(p => {
      const key = (p.paidAt ?? p.createdAt ?? '').slice(0, 10);
      if (key) revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(p.amount ?? 0));
    });

    const read = (day: string) => (metric === 'bookings' ? bookingByDay.get(day) ?? 0 : revenueByDay.get(day) ?? 0);
    const labelFor = (key: string) =>
      range === 'week'
        ? new Date(`${key}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
        : key.slice(8, 10).replace(/^0/, '');

    const built = days.map(day => ({ label: labelFor(day), value: read(day) }));
    const current = built.reduce((sum, point) => sum + point.value, 0);
    const previous = prevDays.reduce((sum, day) => sum + read(day), 0);
    const delta = previous ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

    return { series: built, currentTotal: current, deltaPct: delta };
  }, [bookings, successfulPayments, metric, range, dateToday]);

  const recentBookings = [...bookings].sort((a, b) => b.id - a.id).slice(0, 6);

  return (
    <div className="-mx-4 -my-5 min-h-full bg-[var(--ui-bg)] px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-my-7 lg:px-8 lg:py-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight panel-heading">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/reports"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 text-sm font-semibold panel-heading transition hover:bg-[var(--ui-surface-2)]"
          >
            <TrendingUp size={16} aria-hidden="true" /> Reports
          </Link>
          <Link
            href="/admin/rooms"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--ui-accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={16} aria-hidden="true" /> Add New
          </Link>
        </div>
      </header>

      {error && <ErrorMessage message={error} className="mt-6" />}

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : (
        <>
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Today's check-in" value={arrivalsToday.length} icon={LogIn} />
            <KpiCard label="Today check-out" value={departuresToday.length} icon={LogOut} />
            <KpiCard label="Total guests" value={customers.length} icon={Users} />
            <KpiCard label="Total amount" value={formatCurrency(revenue)} icon={Banknote} />
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
            <section className="panel-card p-6">
              <h2 className="text-base font-semibold panel-heading">Reservations</h2>
              <div className="mt-5">
                <DonutChart segments={donutSegments} centerLabel="bookings" caption="Bookings by status" />
              </div>
              <div className="mt-6 border-t border-[var(--ui-border)] pt-5">
                <p className="text-2xl font-semibold tracking-tight tabular-nums panel-heading">{formatCurrency(revenue)}</p>
                <p className="mt-1 text-xs panel-muted">Total sales</p>
              </div>
            </section>

            <section className="panel-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold panel-heading">Bookings &amp; Revenue</h2>
                <SegmentedTabs
                  ariaLabel="Chart metric"
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { value: 'bookings', label: 'Booked' },
                    { value: 'revenue', label: 'Revenue' },
                  ]}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums panel-heading">
                    {metric === 'revenue' ? formatCurrency(currentTotal) : currentTotal}
                  </p>
                  <p className="mt-1 text-xs panel-muted">{metric === 'revenue' ? 'Revenue' : 'Bookings'} this {range}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    deltaPct >= 0
                      ? 'bg-[var(--ui-accent-soft)] text-[var(--ui-accent-text)]'
                      : 'bg-[var(--ui-danger-soft)] text-[var(--ui-danger)]'
                  }`}
                >
                  {deltaPct >= 0 ? '+' : ''}{deltaPct}% vs last {range}
                </span>
              </div>

              <div className="mt-6">
                <LineChart
                  data={series}
                  caption={`${metric === 'revenue' ? 'Revenue' : 'Bookings'} over the last ${range}`}
                  color="var(--ui-accent)"
                  formatValue={metric === 'revenue' ? formatCurrency : value => String(value)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <select
                  value={range}
                  onChange={event => setRange(event.target.value as Range)}
                  aria-label="Chart range"
                  className="panel-input w-auto"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className="panel-card overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <h2 className="text-base font-semibold panel-heading">Recent Bookings</h2>
                <Link href="/admin/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ui-accent)] hover:underline">
                  View all <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className="px-6 pb-10 text-center text-sm panel-muted">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="panel-table">
                    <thead>
                      <tr>
                        <th>Ref</th>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Stay</th>
                        <th className="text-right">Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map(booking => (
                        <tr key={booking.id}>
                          <td className="font-mono text-xs panel-muted">#{booking.id}</td>
                          <td>{booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : '—'}</td>
                          <td className="panel-muted">{getRoomName(booking.room)}</td>
                          <td className="whitespace-nowrap panel-muted">
                            {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                          </td>
                          <td className="text-right font-semibold tabular-nums">{formatCurrency(booking.totalAmount)}</td>
                          <td>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[booking.status]}`}>
                              {STATUS_LABEL[booking.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel-card p-6">
              <h2 className="mb-5 text-base font-semibold panel-heading">Needs Attention</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between gap-4">
                  <span className="panel-muted">Bookings awaiting confirmation</span>
                  <span className="text-lg font-semibold tabular-nums panel-heading">{pendingBookings.length}</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span className="panel-muted">Payments awaiting payment</span>
                  <span className="text-lg font-semibold tabular-nums panel-heading">{pendingPayments.length}</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span className="panel-muted">Outstanding value</span>
                  <span className="text-lg font-semibold tabular-nums panel-heading">{formatCurrency(pendingValue)}</span>
                </li>
              </ul>
              <div className="mt-5 flex gap-3">
                <Link
                  href="/admin/bookings"
                  className="flex-1 rounded-lg border border-[var(--ui-border)] px-4 py-2.5 text-center text-sm font-semibold panel-heading transition hover:bg-[var(--ui-surface-2)]"
                >
                  Bookings
                </Link>
                <Link
                  href="/admin/payments"
                  className="flex-1 rounded-lg border border-[var(--ui-border)] px-4 py-2.5 text-center text-sm font-semibold panel-heading transition hover:bg-[var(--ui-surface-2)]"
                >
                  Payments
                </Link>
              </div>
            </section>

            <section className="panel-card mt-6 p-6">
              <h2 className="mb-4 text-base font-semibold panel-heading">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Manage rooms', href: '/admin/rooms', icon: BedDouble },
                  { label: 'View bookings', href: '/admin/bookings', icon: CalendarCheck },
                  { label: 'Payment reports', href: '/admin/payments', icon: CreditCard },
                  { label: 'Open public site', href: '/', icon: ExternalLink },
                ].map(action => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg border border-[var(--ui-border)] px-4 py-3 text-sm font-medium panel-heading transition hover:bg-[var(--ui-surface-2)]"
                  >
                    <action.icon size={16} className="text-[var(--ui-accent)]" aria-hidden="true" />
                    {action.label}
                    <ArrowRight size={14} className="ml-auto text-[var(--ui-text-soft)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
