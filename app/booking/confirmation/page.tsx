'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BedDouble, CalendarCheck, CheckCircle, CreditCard, Users } from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import { formatDate, formatCurrency, bookingStatusLabel, bookingStatusColor, getErrorMessage, nightsBetween } from '@/lib/utils';
import type { Booking } from '@/types';
import { getRoomName } from '@/lib/roomDisplay';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const bookingId = Number(searchParams.get('bookingId'));

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(Boolean(bookingId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(`/booking/confirmation?${searchParams.toString()}`)}`);
      return;
    }
    if (!bookingId) return;
    bookingsApi.getById(bookingId)
      .then(setBooking)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [authLoading, bookingId, isAuthenticated, router, searchParams]);

  if (authLoading || !isAuthenticated || loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  const nights = booking ? nightsBetween(booking.checkInDate, booking.checkOutDate) : 0;

  return (
    <main className="min-h-screen bg-[var(--nova-ivory)] pt-28 text-[var(--nova-text-dark)] sm:pt-32">
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6">
        <Link href="/my-bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--nova-brown-muted)] transition hover:text-[var(--nova-gold)]">
          <ArrowLeft size={14} /> My Bookings
        </Link>

        {error && <ErrorMessage message={error} className="mt-6" />}

        {booking && (
          <>
            <header className="mt-6 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={28} className="text-green-700" aria-hidden="true" />
              </span>
              <div>
                <h1 className="font-serif text-3xl leading-tight">Booking #{booking.id}</h1>
                <Badge className={`mt-2 ${bookingStatusColor(booking.status)}`}>
                  {bookingStatusLabel(booking.status)}
                </Badge>
              </div>
            </header>

            <section className="nova-card mt-8 p-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">Booking Details</h2>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  { icon: BedDouble, label: 'Room', value: getRoomName(booking.room) },
                  { icon: Users, label: 'Guests', value: `${booking.guestCount} Guest${booking.guestCount > 1 ? 's' : ''}` },
                  { icon: CalendarCheck, label: 'Check In', value: formatDate(booking.checkInDate) },
                  { icon: CalendarCheck, label: 'Check Out', value: formatDate(booking.checkOutDate) },
                  { icon: CreditCard, label: 'Total', value: `${formatCurrency(booking.totalAmount)} · ${nights} night${nights === 1 ? '' : 's'}` },
                ].map(item => (
                  <div key={item.label}>
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-brown-muted)]">
                      <item.icon size={13} className="text-[var(--nova-gold)]" aria-hidden="true" /> {item.label}
                    </dt>
                    <dd className="mt-1.5 font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>

              {booking.specialRequests && (
                <div className="mt-6 border-t border-[var(--nova-border-light)] pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-brown-muted)]">Special Requests</p>
                  <p className="mt-1.5 text-sm italic text-[var(--nova-text-muted)]">{booking.specialRequests}</p>
                </div>
              )}
            </section>

            {booking.status === 'PENDING' && (
              <div className="mt-6">
                <Link href={`/payment?bookingId=${booking.id}`}>
                  <Button variant="primary" size="lg" className="w-full">
                    <CreditCard size={18} /> Payment Instructions
                  </Button>
                </Link>
              </div>
            )}

            {booking.status !== 'PENDING' && (
              <div className="mt-6">
                <Link href="/my-bookings">
                  <Button variant="outline" size="lg" className="w-full">Back to My Bookings</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
