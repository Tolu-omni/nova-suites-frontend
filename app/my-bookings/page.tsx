'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BedDouble, CalendarCheck, CreditCard, Users } from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import {
  formatDate, formatCurrency, bookingStatusColor, bookingStatusLabel,
  getErrorMessage, nightsBetween, roomTypeLabel,
} from '@/lib/utils';
import type { Booking, RoomType } from '@/types';
import { getRoomName, getRoomType } from '@/lib/roomDisplay';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage, { EmptyState } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function MyBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/my-bookings');
      return;
    }
    bookingsApi.getMine()
      .then(setBookings)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <main className="min-h-screen bg-[var(--nova-ivory)] pt-28 text-[var(--nova-text-dark)] sm:pt-32">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="nova-eyebrow mb-3">Your Stays</p>
            <h1 className="font-serif text-3xl leading-tight sm:text-4xl">My Bookings</h1>
            <p className="mt-2 text-sm text-[var(--nova-text-muted)]">
              {bookings.length} reservation{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/rooms">
            <Button variant="primary">New Booking</Button>
          </Link>
        </div>

        {error && <ErrorMessage message={error} className="mt-8" />}

        <div className="mt-8">
          {error ? (
            <EmptyState
              title="Bookings unavailable"
              description="We could not load your reservations. Check your connection and try again."
              action={<Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>}
            />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="You haven't made any reservations. Browse our rooms to find your perfect stay."
              action={
                <Link href="/rooms">
                  <Button variant="primary">Browse Rooms <ArrowRight size={16} /></Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-5">
              {bookings.map(booking => {
                const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
                return (
                  <article key={booking.id} className="nova-card p-5 transition hover:shadow-lg sm:p-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-[var(--nova-brown-muted)]">#{booking.id}</span>
                          <Badge className={bookingStatusColor(booking.status)}>
                            {bookingStatusLabel(booking.status)}
                          </Badge>
                          {booking.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--nova-gold)] bg-[rgba(184,135,58,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--nova-espresso)]">
                              Payment due
                            </span>
                          )}
                        </div>

                        <h2 className="font-serif text-xl leading-tight">
                          {getRoomName(booking.room) || 'Room details loading…'}
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--nova-text-muted)]">
                          <span className="flex items-center gap-1.5">
                            <CalendarCheck size={14} className="text-[var(--nova-gold)]" aria-hidden="true" />
                            {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <BedDouble size={14} className="text-[var(--nova-gold)]" aria-hidden="true" />
                            {roomTypeLabel(getRoomType(booking.room) as RoomType)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-[var(--nova-gold)]" aria-hidden="true" />
                            {booking.guestCount} Guest{booking.guestCount > 1 ? 's' : ''} · {nights} night{nights === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-[var(--nova-border-light)] pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="font-serif text-xl font-bold text-[var(--nova-gold)]">
                            {formatCurrency(booking.totalAmount)}
                          </p>
                          <p className="text-xs text-[var(--nova-text-muted)]">Total</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {booking.status === 'PENDING' && (
                            <Link href={`/payment?bookingId=${booking.id}`}>
                              <Button size="sm" variant="primary"><CreditCard size={14} /> Pay</Button>
                            </Link>
                          )}
                          <Link
                            href={`/booking/confirmation?bookingId=${booking.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--nova-brown-muted)] transition hover:text-[var(--nova-gold)]"
                          >
                            Details <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
