'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CalendarCheck, Download, Pencil, Search, SlidersHorizontal,
} from 'lucide-react';
import { bookingsApi, paymentsApi, roomsApi } from '@/lib/api';
import {
  addDays, bookingRef, formatCurrency, formatDate, getErrorMessage, initials,
  nightsBetween, roomTypeLabel, timeAgo, today,
} from '@/lib/utils';
import { downloadCsv } from '@/lib/csv';
import { getRoomName, getRoomType } from '@/lib/roomDisplay';
import { useDataTable } from '@/hooks/useDataTable';
import type { Booking, BookingStatus, Payment, Room, RoomType } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage, { EmptyState } from '@/components/ui/ErrorMessage';
import Modal from '@/components/admin/Modal';
import Pagination from '@/components/admin/Pagination';
import SortHeader from '@/components/admin/SortHeader';
import ActivityFeed from '@/components/admin/panel/ActivityFeed';
import SplitBar from '@/components/admin/panel/SplitBar';
import { useToast } from '@/components/admin/ToastProvider';

const STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  CANCELLED: 'Cancelled',
};

const STATUS_BADGE: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  CHECKED_IN: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  CHECKED_OUT: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

const ROOM_TYPE_DOT: Record<RoomType, string> = {
  SINGLE: '#16A34A',
  DOUBLE: '#16A34A',
  DELUXE: '#3B82F6',
  SUITE: '#8B5CF6',
};

interface EditForm {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests: string;
}

const emptyEdit: EditForm = { roomId: 0, checkInDate: '', checkOutDate: '', guestCount: 1, specialRequests: '' };

const guestName = (booking: Booking) =>
  booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : '';

const matchesBooking = (booking: Booking, query: string) =>
  [String(booking.id), bookingRef(booking.id), guestName(booking), booking.customer?.email, getRoomName(booking.room), booking.status]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(query));

const compareBooking = (a: Booking, b: Booking, key: string) => {
  switch (key) {
    case 'guest': return guestName(a).localeCompare(guestName(b));
    case 'room': return getRoomName(a.room).localeCompare(getRoomName(b.room));
    case 'checkIn': return a.checkInDate.localeCompare(b.checkInDate);
    case 'amount': return (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
    case 'status': return a.status.localeCompare(b.status);
    default: return a.id - b.id;
  }
};

function RowButton({
  children, onClick, tone = 'neutral', disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'primary' | 'neutral' | 'danger';
  disabled?: boolean;
}) {
  const tones = {
    primary: 'bg-[var(--ui-accent)] text-white hover:opacity-90',
    neutral: 'border border-[var(--ui-border)] panel-heading hover:bg-[var(--ui-surface-2)]',
    danger: 'border border-[var(--ui-danger)] text-[var(--ui-danger)] hover:bg-[var(--ui-danger-soft)]',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export default function AdminBookingsPage() {
  const { notify } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [editTarget, setEditTarget] = useState<Booking | null>(null);
  const [form, setForm] = useState<EditForm>(emptyEdit);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([bookingsApi.getAll(), roomsApi.getAll(), paymentsApi.getAll()])
      .then(([bookingsRes, roomsRes, paymentsRes]) => {
        if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value);
        else setError(getErrorMessage(bookingsRes.reason));
        if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value);
        if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusRows = useMemo(
    () => (statusFilter ? bookings.filter(booking => booking.status === statusFilter) : bookings),
    [bookings, statusFilter]
  );

  const table = useDataTable<Booking>({
    rows: statusRows,
    matches: matchesBooking,
    compare: compareBooking,
    initialSort: { key: 'id', dir: 'desc' },
  });

  const successful = useMemo(() => payments.filter(p => p.status === 'SUCCESSFUL'), [payments]);

  const weekSeries = useMemo(() => {
    const byDay = new Map<string, number>();
    successful.forEach(p => {
      const key = (p.paidAt ?? p.createdAt ?? '').slice(0, 10);
      if (key) byDay.set(key, (byDay.get(key) ?? 0) + Number(p.amount ?? 0));
    });
    const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
    return days.map(day => ({
      label: new Date(`${day}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      value: byDay.get(day) ?? 0,
    }));
  }, [successful]);

  const weekTotal = weekSeries.reduce((sum, point) => sum + point.value, 0);
  const weekMax = Math.max(1, ...weekSeries.map(point => point.value));
  const prevWeekTotal = useMemo(() => {
    const byDay = new Map<string, number>();
    successful.forEach(p => {
      const key = (p.paidAt ?? p.createdAt ?? '').slice(0, 10);
      if (key) byDay.set(key, (byDay.get(key) ?? 0) + Number(p.amount ?? 0));
    });
    return Array.from({ length: 7 }, (_, i) => addDays(today(), i - 13))
      .reduce((sum, day) => sum + (byDay.get(day) ?? 0), 0);
  }, [successful]);
  const weekDelta = prevWeekTotal ? Math.round(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100) : weekTotal > 0 ? 100 : 0;

  const activity = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || b.id - a.id)
        .slice(0, 4)
        .map(booking => ({
          id: booking.id,
          initials: initials(booking.customer?.firstName ?? '', booking.customer?.lastName ?? ''),
          text: `Room #${booking.room?.roomNumber ?? '—'}, ${booking.specialRequests?.trim() || STATUS_LABEL[booking.status].toLowerCase()}`,
          time: booking.createdAt ? timeAgo(booking.createdAt) : `#${booking.id}`,
        })),
    [bookings]
  );

  const activeCount = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;
  const atRiskCount = bookings.filter(b => b.status === 'PENDING' || b.status === 'CANCELLED').length;

  const pageIds = table.rows.map(b => b.id);
  const allSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const toggleAll = () => setSelected(prev => {
    const next = new Set(prev);
    if (allSelected) pageIds.forEach(id => next.delete(id));
    else pageIds.forEach(id => next.add(id));
    return next;
  });
  const toggleOne = (id: number) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const runAction = async (booking: Booking, action: () => Promise<Booking>, successMessage: string) => {
    setWorkingId(booking.id);
    try {
      const updated = await action();
      setBookings(current => current.map(item => item.id === updated.id ? updated : item));
      notify(successMessage);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setWorkingId(null);
    }
  };

  const openEdit = (booking: Booking) => {
    setEditTarget(booking);
    setForm({
      roomId: booking.room?.id ?? 0,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests ?? '',
    });
    setFormError(null);
  };

  const handleSave = async () => {
    if (!editTarget) return;
    if (!form.checkInDate || !form.checkOutDate) {
      setFormError('Check-in and check-out dates are required.');
      return;
    }
    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      setFormError('Check-out must be after check-in.');
      return;
    }
    if (form.guestCount < 1) {
      setFormError('There must be at least one guest.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const updated = await bookingsApi.update(editTarget.id, {
        roomId: form.roomId || undefined,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        guestCount: Number(form.guestCount),
        specialRequests: form.specialRequests.trim(),
      });
      setBookings(current => current.map(item => item.id === updated.id ? updated : item));
      setEditTarget(null);
      notify(`Booking #${editTarget.id} updated.`);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    downloadCsv(
      'nova-bookings.csv',
      ['Ref', 'Guest', 'Email', 'Room', 'Check in', 'Check out', 'Nights', 'Guests', 'Amount (NGN)', 'Status'],
      table.exportRows.map(booking => [
        booking.id,
        guestName(booking),
        booking.customer?.email ?? '',
        getRoomName(booking.room),
        booking.checkInDate,
        booking.checkOutDate,
        nightsBetween(booking.checkInDate, booking.checkOutDate),
        booking.guestCount,
        booking.totalAmount ?? 0,
        booking.status,
      ])
    );
    notify(`Exported ${table.exportRows.length} booking${table.exportRows.length === 1 ? '' : 's'}.`);
  };

  return (
    <div className="-mx-4 -my-5 min-h-full bg-[var(--ui-bg)] px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-my-7 lg:px-8 lg:py-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight panel-heading">Bookings</h1>
        <button
          type="button"
          onClick={exportCsv}
          disabled={table.rows.length === 0}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 text-sm font-semibold panel-heading transition hover:bg-[var(--ui-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} aria-hidden="true" /> Export
        </button>
      </header>

      {error && <ErrorMessage message={error} className="mt-6" />}

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : (
        <>
          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="panel-card p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold panel-heading">Recent activity</h2>
              </div>
              <ActivityFeed items={activity} />
            </div>

            <div className="panel-card p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold panel-heading">Revenue</h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    weekDelta >= 0
                      ? 'bg-[var(--ui-accent-soft)] text-[var(--ui-accent-text)]'
                      : 'bg-[var(--ui-danger-soft)] text-[var(--ui-danger)]'
                  }`}
                >
                  {weekDelta >= 0 ? '+' : ''}{weekDelta}%
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums panel-heading">{formatCurrency(weekTotal)}</p>
              <p className="mt-1 text-xs panel-muted">Last 7 days</p>
              <div className="mt-6 flex h-40 items-end gap-2">
                {weekSeries.map(point => (
                  <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${point.label}: ${formatCurrency(point.value)}`}>
                    <div
                      className="w-full rounded-t-md bg-[var(--ui-accent)] transition-all"
                      style={{ height: `${Math.max(4, Math.round((point.value / weekMax) * 100))}%` }}
                    />
                    <span className="text-[10px] panel-muted">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-card p-6">
              <h2 className="text-base font-semibold panel-heading">Bookings</h2>
              <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums panel-heading">{bookings.length}</p>
              <p className="mt-1 text-xs panel-muted">Total bookings</p>
              <div className="mt-6">
                <SplitBar
                  primary={{ label: 'Active', value: activeCount }}
                  secondary={{ label: 'Pending / Cancelled', value: atRiskCount }}
                />
              </div>
            </div>
          </section>

          <section className="panel-card mt-6 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[var(--ui-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold panel-heading">Booking List</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block sm:w-72">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ui-text-soft)]" aria-hidden="true" />
                  <span className="sr-only">Search bookings</span>
                  <input
                    value={table.query}
                    onChange={event => table.setQuery(event.target.value)}
                    placeholder="Search guest, ID, room…"
                    className="panel-input pl-10"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowFilters(value => !value)}
                  aria-expanded={showFilters}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                    showFilters
                      ? 'border-[var(--ui-accent)] text-[var(--ui-accent-text)]'
                      : 'border-[var(--ui-border)] panel-heading hover:bg-[var(--ui-surface-2)]'
                  }`}
                >
                  <SlidersHorizontal size={15} aria-hidden="true" /> Filters
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)] px-5 py-3">
                <label className="flex items-center gap-2 text-sm panel-muted">
                  Status
                  <select
                    value={statusFilter}
                    onChange={event => { setStatusFilter(event.target.value as BookingStatus | ''); table.setPage(1); }}
                    aria-label="Filter by status"
                    className="panel-input w-auto"
                  >
                    <option value="">All statuses</option>
                    {STATUSES.map(status => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
                  </select>
                </label>
                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="text-sm font-semibold text-[var(--ui-accent)] hover:underline"
                  >
                    Clear {selected.size} selected
                  </button>
                )}
              </div>
            )}

            {bookings.length === 0 ? (
              <EmptyState title="No bookings yet" description="Bookings will appear here as guests reserve rooms." />
            ) : table.filteredCount === 0 ? (
              <EmptyState title="No bookings match" description="Try a different search term or status." />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="panel-table">
                    <thead>
                      <tr>
                        <th className="w-10">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            aria-label="Select all on this page"
                          />
                        </th>
                        <SortHeader label="Booking ID" sortKey="id" sort={table.sort} onSort={table.toggleSort} />
                        <SortHeader label="Guest" sortKey="guest" sort={table.sort} onSort={table.toggleSort} />
                        <th>Room Type</th>
                        <th>Room</th>
                        <th>Duration</th>
                        <SortHeader label="Check-in & Check-out" sortKey="checkIn" sort={table.sort} onSort={table.toggleSort} />
                        <SortHeader label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map(booking => {
                        const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
                        const roomType = getRoomType(booking.room) as RoomType;
                        return (
                          <tr key={booking.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selected.has(booking.id)}
                                onChange={() => toggleOne(booking.id)}
                                aria-label={`Select booking ${booking.id}`}
                              />
                            </td>
                            <td className="font-mono text-xs panel-muted">{bookingRef(booking.id)}</td>
                            <td>
                              <p className="font-medium panel-heading">{guestName(booking) || '—'}</p>
                              {booking.customer?.email && <p className="text-xs panel-muted">{booking.customer.email}</p>}
                            </td>
                            <td>
                              <span className="inline-flex items-center gap-2 panel-muted">
                                <span className="h-2 w-2 rounded-full" style={{ background: ROOM_TYPE_DOT[roomType] ?? '#A1A1AA' }} aria-hidden="true" />
                                {roomTypeLabel(roomType)}
                              </span>
                            </td>
                            <td className="panel-muted">{booking.room?.roomNumber ?? '—'}</td>
                            <td className="whitespace-nowrap panel-muted">{nights} night{nights === 1 ? '' : 's'}</td>
                            <td className="whitespace-nowrap panel-muted">
                              {formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}
                            </td>
                            <td>
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[booking.status]}`}>
                                {STATUS_LABEL[booking.status]}
                              </span>
                            </td>
                            <td>
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                {booking.status === 'PENDING' && (
                                  <RowButton tone="primary" disabled={workingId === booking.id} onClick={() => runAction(booking, () => bookingsApi.confirm(booking.id), `Booking #${booking.id} confirmed.`)}>
                                    <CalendarCheck size={14} aria-hidden="true" /> Confirm
                                  </RowButton>
                                )}
                                {booking.status === 'CONFIRMED' && (
                                  <RowButton tone="primary" disabled={workingId === booking.id} onClick={() => runAction(booking, () => bookingsApi.checkIn(booking.id), `Booking #${booking.id} checked in.`)}>
                                    Check In
                                  </RowButton>
                                )}
                                {booking.status === 'CHECKED_IN' && (
                                  <RowButton tone="primary" disabled={workingId === booking.id} onClick={() => runAction(booking, () => bookingsApi.checkOut(booking.id), `Booking #${booking.id} checked out.`)}>
                                    Check Out
                                  </RowButton>
                                )}
                                {booking.status !== 'CANCELLED' && booking.status !== 'CHECKED_OUT' && (
                                  <RowButton tone="danger" disabled={workingId === booking.id} onClick={() => runAction(booking, () => bookingsApi.cancel(booking.id), `Booking #${booking.id} cancelled.`)}>
                                    Cancel
                                  </RowButton>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openEdit(booking)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ui-border)] panel-muted transition hover:bg-[var(--ui-surface-2)]"
                                  aria-label={`Edit booking ${booking.id}`}
                                >
                                  <Pencil size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={table.page}
                  pageCount={table.pageCount}
                  onChange={table.setPage}
                  total={table.filteredCount}
                  pageSize={8}
                  label="bookings"
                />
              </>
            )}
          </section>
        </>
      )}

      {editTarget && (
        <Modal
          title={`Edit Booking #${editTarget.id}`}
          onClose={() => setEditTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditTarget(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-5">
            {formError && <ErrorMessage message={formError} />}

            <div className="flex items-center gap-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-2)] p-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.16em] panel-muted">Current room</p>
                <p className="truncate text-lg font-semibold panel-heading">{getRoomName(editTarget.room)}</p>
              </div>
              <span className={`ml-auto inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[editTarget.status]}`}>
                {STATUS_LABEL[editTarget.status]}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-room" className="nova-form-label">Room</label>
              <select
                id="edit-room"
                value={form.roomId}
                onChange={event => setForm(current => ({ ...current, roomId: Number(event.target.value) }))}
                className="panel-input"
              >
                <option value={0}>Keep current room</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {getRoomName(room)} · Room {room.roomNumber} · {formatCurrency(room.pricePerNight)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="edit-checkin"
                type="date"
                label="Check In"
                value={form.checkInDate}
                onChange={event => setForm(current => ({ ...current, checkInDate: event.target.value }))}
              />
              <Input
                id="edit-checkout"
                type="date"
                label="Check Out"
                value={form.checkOutDate}
                min={form.checkInDate || undefined}
                onChange={event => setForm(current => ({ ...current, checkOutDate: event.target.value }))}
              />
            </div>

            <Input
              id="edit-guests"
              type="number"
              min={1}
              label="Number of Guests"
              value={String(form.guestCount)}
              onChange={event => setForm(current => ({ ...current, guestCount: Number(event.target.value) }))}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-requests" className="nova-form-label">Special Requests</label>
              <textarea
                id="edit-requests"
                rows={3}
                value={form.specialRequests}
                onChange={event => setForm(current => ({ ...current, specialRequests: event.target.value }))}
                className="panel-input resize-none"
                placeholder="Early check-in, high floor, twin beds…"
              />
            </div>

            {form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) > new Date(form.checkInDate) && (
              <p className="text-sm panel-muted">
                This stay is{' '}
                <strong className="panel-heading">{nightsBetween(form.checkInDate, form.checkOutDate)} night(s)</strong>.
              </p>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
}
