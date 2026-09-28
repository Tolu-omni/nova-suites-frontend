'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CalendarCheck, MessageCircle, ShieldCheck } from 'lucide-react';
import { bookingsApi, paymentsApi } from '@/lib/api';
import { formatCurrency, formatDate, bookingStatusLabel, bookingStatusColor, getErrorMessage } from '@/lib/utils';
import type { Booking } from '@/types';
import { getRoomName } from '@/lib/roomDisplay';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useAuth } from '@/context/AuthContext';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const bookingId = Number(searchParams.get('bookingId'));

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(Boolean(bookingId));
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(`/payment?${searchParams.toString()}`)}`);
      return;
    }
    if (!bookingId) return;
    bookingsApi.getById(bookingId)
      .then(setBooking)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [authLoading, bookingId, isAuthenticated, router, searchParams]);

  const handlePaystackPayment = async () => {
    if (!bookingId) return;
    setPaying(true);
    setError(null);
    try {
      const response = await paymentsApi.initialize(bookingId);
      const authorizationUrl = response.data?.authorization_url ?? response.authorization_url;
      if (!authorizationUrl) throw new Error('Paystack did not return an authorization URL.');
      window.location.href = authorizationUrl;
    } catch (err) {
      setError(getErrorMessage(err));
      setPaying(false);
    }
  };

  if (authLoading || !isAuthenticated || loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <main className="min-h-screen bg-[var(--nova-ivory)] pt-28 text-[var(--nova-text-dark)] sm:pt-32">
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6">
        <Link href="/my-bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--nova-brown-muted)] transition hover:text-[var(--nova-gold)]">
          <ArrowLeft size={14} /> My Bookings
        </Link>

        <p className="nova-eyebrow mb-3 mt-6">Secure Checkout</p>
        <h1 className="font-serif text-3xl leading-tight sm:text-4xl">Payment Instructions</h1>

        {error && <ErrorMessage message={error} className="mt-6" />}

        {!bookingId ? (
          <div className="mt-8">
            <ErrorMessage message="Invalid booking. Please start from the booking page." />
          </div>
        ) : booking ? (
          <section className="nova-card mt-8 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">Booking Summary</h2>
              <Badge className={bookingStatusColor(booking.status)}>{bookingStatusLabel(booking.status)}</Badge>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              {[
                { label: 'Booking', value: `#${booking.id}` },
                { label: 'Room', value: getRoomName(booking.room) },
                { label: 'Check In', value: formatDate(booking.checkInDate) },
                { label: 'Check Out', value: formatDate(booking.checkOutDate) },
              ].map(item => (
                <div key={item.label} className="flex justify-between gap-4 border-b border-[var(--nova-border-light)] pb-3 last:border-0">
                  <dt className="text-[var(--nova-text-muted)]">{item.label}</dt>
                  <dd className="font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex items-end justify-between rounded-xl bg-[var(--nova-ivory-soft)] px-5 py-4">
              <span className="font-semibold">Total Amount</span>
              <span className="font-serif text-2xl font-bold text-[var(--nova-gold)]">{formatCurrency(booking.totalAmount)}</span>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--nova-gold)]/35 bg-[rgba(184,135,58,0.08)] p-4">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[var(--nova-gold)]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Pay securely with Paystack</p>
                <p className="mt-1 text-xs leading-6 text-[var(--nova-text-muted)]">
                  Card details are never stored by Nova Suites.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button variant="primary" size="lg" className="w-full" onClick={handlePaystackPayment} isLoading={paying} disabled={booking.status !== 'PENDING'}>
                <CalendarCheck size={18} /> Pay with Paystack
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => router.push('/contact')}>
                <MessageCircle size={18} /> Contact Hotel
              </Button>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--nova-text-muted)]">
              <AlertCircle size={13} aria-hidden="true" /> Having trouble paying? Contact the hotel before retrying.
            </p>
          </section>
        ) : (
          <div className="mt-8">
            <ErrorMessage message="Booking not found. Please check your bookings page." />
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
      <PaymentContent />
    </Suspense>
  );
}
