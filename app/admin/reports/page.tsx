'use client';

import { useEffect, useState } from 'react';
import {
  Banknote, BedDouble, CalendarCheck, Download, Percent, Timer,
} from 'lucide-react';
import { roomsApi, bookingsApi, paymentsApi, customersApi } from '@/lib/api';
import {
  bookingStatusLabel, formatCurrency, getErrorMessage, nightsBetween,
} from '@/lib/utils';
import { getRoomName } from '@/lib/roomDisplay';
import { downloadCsv } from '@/lib/csv';
import type { Booking, BookingStatus, Payment, PaymentStatus, Room, RoomStatus } from '@/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import { BarChart, DonutChart } from '@/components/admin/charts';
import { useToast } from '@/components/admin/ToastProvider';

const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED'];
const ROOM_STATUSES: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];

const BOOKING_COLOR: Record<BookingStatus, string> = {
  PENDING: '#D97706',
  CONFIRMED: '#2563EB',
  CHECKED_IN: '#16A34A',
  CHECKED_OUT: '#78716C',
  CANCELLED: '#DC2626',
};

const PAYMENT_COLOR: Record<PaymentStatus, string> = {
  PENDING: '#D97706',
  SUCCESSFUL: '#16A34A',
  FAILED: '#DC2626',
  REFUNDED: '#7C3AED',
};

const ROOM_COLOR: Record<RoomStatus, string> = {
  AVAILABLE: '#16A34A',
  OCCUPIED: '#DC2626',
  MAINTENANCE: '#D97706',
};

function lastMonths(count: number): { key: string; label: string }[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return months;
}

export default function AdminReportsPage() {
  const { notify } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      roomsApi.getAll(),
      bookingsApi.getAll(),
      paymentsApi.getAll(),
      customersApi.getAll(),
    ]).then(results => {
      const [roomsRes, bookingsRes, paymentsRes, customersRes] = results;
      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value);
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value);
      if (customersRes.status === 'fulfilled') setCustomerCount(customersRes.value.length);

      const failed = results.find(result => result.status === 'rejected');
      if (failed && failed.status === 'rejected') setError(getErrorMessage(failed.reason));
    }).finally(() => setLoading(false));
  }, []);

  const successful = payments.filter(payment => payment.status === 'SUCCESSFUL');
  const revenue = successful.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
  const bookingValue = bookings.reduce((sum, booking) => sum + (booking.totalAmount ?? 0), 0);
  const averageBooking = bookings.length ? Math.round(bookingValue / bookings.length) : 0;
  const totalNights = bookings.reduce((sum, booking) => sum + nightsBetween(booking.checkInDate, booking.checkOutDate), 0);
  const averageStay = bookings.length ? (totalNights / bookings.length).toFixed(1) : '0.0';
  const occupiedRooms = rooms.filter(room => room.status === 'OCCUPIED').length;
  const occupancy = rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const months = lastMonths(12);
  const revenueByMonth = months.map(month => ({
    ...month,
    total: successful
      .filter(payment => (payment.paidAt ?? payment.createdAt ?? '').slice(0, 7) === month.key)
      .reduce((sum, payment) => sum + (payment.amount ?? 0), 0),
  }));

  const roomPerformance = rooms
    .map(room => {
      const roomBookings = bookings.filter(booking => booking.room?.id === room.id);
      return {
        id: room.id,
        name: getRoomName(room),
        roomNumber: room.roomNumber,
        bookings: roomBookings.length,
        revenue: successful.filter(payment => payment.booking?.room?.id === room.id).reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const maxRoomRevenue = Math.max(1, ...roomPerformance.map(room => room.revenue));

  const bookingCounts = BOOKING_STATUSES.map(status => ({
    status,
    count: bookings.filter(booking => booking.status === status).length,
  }));
  const paymentCounts = PAYMENT_STATUSES.map(status => ({
    status,
    count: payments.filter(payment => payment.status === status).length,
  }));
  const roomCounts = ROOM_STATUSES.map(status => ({
    status,
    count: rooms.filter(room => room.status === status).length,
  }));

  const exportRevenue = () => {
    downloadCsv(
      `nova-revenue-${todayStamp()}.csv`,
      ['Month', 'Revenue (NGN)'],
      revenueByMonth.map(month => [month.label, month.total])
    );
    notify('Revenue report exported.');
  };

  const exportRooms = () => {
    downloadCsv(
      `nova-room-performance-${todayStamp()}.csv`,
      ['Room', 'Room Number', 'Bookings', 'Revenue (NGN)'],
      roomPerformance.map(room => [room.name, room.roomNumber, room.bookings, room.revenue])
    );
    notify('Room performance exported.');
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        actions={
          <>
            <Button variant="secondary" onClick={exportRevenue}><Download size={16} /> Revenue CSV</Button>
            <Button variant="secondary" onClick={exportRooms}><Download size={16} /> Rooms CSV</Button>
          </>
        }
      />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : error ? <p className="py-10">Reports are unavailable until all sources load. Refresh the page to retry.</p> : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(revenue)} icon={Banknote} hint={`${successful.length} successful payments`} />
            <StatCard label="Average Booking" value={formatCurrency(averageBooking)} icon={CalendarCheck} hint={`${bookings.length} bookings`} />
            <StatCard label="Average Stay" value={`${averageStay} nights`} icon={Timer} hint={`${totalNights} nights booked`} />
            <StatCard label="Occupancy" value={`${occupancy}%`} icon={Percent} hint={`${occupiedRooms} of ${rooms.length} rooms`} />
          </div>

          <section className="admin-card mt-8 p-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl text-[var(--nova-text-dark)]">Revenue — last 12 months</h2>
              </div>
              <span className="font-serif text-2xl font-bold text-[var(--nova-gold)]">{formatCurrency(revenueByMonth.reduce((sum, month) => sum + month.total, 0))}</span>
            </div>
            <BarChart
              data={revenueByMonth.map(month => ({ label: month.label, value: month.total }))}
              formatValue={formatCurrency}
              height={240}
              caption="Revenue over the last twelve months"
            />
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="admin-card p-6">
              <h2 className="mb-5 font-serif text-xl text-[var(--nova-text-dark)]">Top Rooms by Collected Payments</h2>
              {roomPerformance.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--nova-text-muted)]">No room data yet.</p>
              ) : (
                <ul className="space-y-4">
                  {roomPerformance.map(room => (
                    <li key={room.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
                        <span className="flex items-center gap-2 font-medium text-[var(--nova-text-dark)]">
                          <BedDouble size={14} className="text-[var(--nova-gold)]" aria-hidden="true" />
                          {room.name} <span className="text-[var(--nova-text-muted)]">· {room.roomNumber}</span>
                        </span>
                        <span className="shrink-0 font-semibold">{formatCurrency(room.revenue)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--nova-ivory)]">
                        <div
                          className="h-full rounded-full bg-[var(--nova-gold)]"
                          style={{ width: `${Math.max(2, Math.round((room.revenue / maxRoomRevenue) * 100))}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-[var(--nova-text-muted)]">{room.bookings} booking{room.bookings === 1 ? '' : 's'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="space-y-6">
              <section className="admin-card p-6">
                <h2 className="mb-5 font-serif text-xl text-[var(--nova-text-dark)]">Bookings by Status</h2>
                <DonutChart
                  caption="Bookings by status"
                  centerLabel="bookings"
                  segments={bookingCounts.map(item => ({
                    label: bookingStatusLabel(item.status),
                    value: item.count,
                    color: BOOKING_COLOR[item.status],
                  }))}
                />
              </section>

              <section className="admin-card p-6">
                <h2 className="mb-5 font-serif text-xl text-[var(--nova-text-dark)]">Payments by Status</h2>
                <DonutChart
                  caption="Payments by status"
                  centerLabel="payments"
                  segments={paymentCounts.map(item => ({
                    label: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
                    value: item.count,
                    color: PAYMENT_COLOR[item.status],
                  }))}
                />
              </section>

              <section className="admin-card p-6">
                <h2 className="mb-5 font-serif text-xl text-[var(--nova-text-dark)]">Occupancy Breakdown</h2>
                <DonutChart
                  caption="Rooms by status"
                  centerLabel="rooms"
                  segments={roomCounts.map(item => ({
                    label: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
                    value: item.count,
                    color: ROOM_COLOR[item.status],
                  }))}
                />
                <p className="mt-5 border-t border-[var(--nova-border-light)] pt-4 text-xs text-[var(--nova-text-muted)]">
                  {customerCount} registered customers · {bookings.length} bookings · {payments.length} payments
                </p>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function todayStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}
