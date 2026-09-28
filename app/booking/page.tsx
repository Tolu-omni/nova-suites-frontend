'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BedDouble, CalendarDays, CheckCircle, CreditCard, MessageSquare, Users,
} from 'lucide-react';
import { roomsApi, bookingsApi } from '@/lib/api';
import { formatCurrency, formatDate, nightsBetween, getErrorMessage, roomTypeLabel, today } from '@/lib/utils';
import type { Room, RoomType } from '@/types';
import { getRoomImage, getRoomMaxGuests, getRoomName, getRoomType } from '@/lib/roomDisplay';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useAuth } from '@/context/AuthContext';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const roomId = Number(searchParams.get('roomId'));
  const checkIn = searchParams.get('checkInDate') || '';
  const checkOut = searchParams.get('checkOutDate') || '';
  const guestCount = Number(searchParams.get('guestCount') || 1);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'review' | 'confirm'>('review');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/booking?${searchParams.toString()}`)}`);
    }
  }, [authLoading, isAuthenticated, router, searchParams]);

  useEffect(() => {
    if (!roomId) return;
    roomsApi.getById(roomId)
      .then(setRoom)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [roomId]);

  const nights = nightsBetween(checkIn, checkOut);
  const totalPrice = (room?.pricePerNight ?? 0) * nights;
  const validStay = Boolean(
    room &&
    checkIn >= today() &&
    checkOut > checkIn &&
    guestCount >= 1 &&
    guestCount <= getRoomMaxGuests(room)
  );

  const handleCreateBooking = async () => {
    if (!room || !validStay) {
      setError('Choose valid future dates and a guest count within the room capacity.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const booking = await bookingsApi.create({
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
        specialRequests: specialRequests.trim() || undefined,
      });
      setBookingId(booking.id);
      setStep('confirm');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (!roomId || !checkIn || !checkOut) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--nova-ivory)] px-4 pt-28 text-center">
        <p className="text-[var(--nova-text-muted)]">Missing booking information.</p>
        <Link href="/rooms" className="font-semibold text-[var(--nova-gold)] hover:underline">Browse rooms</Link>
      </main>
    );
  }

  if (step === 'confirm' && bookingId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--nova-ivory)] px-4 pt-28 text-[var(--nova-text-dark)]">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={38} className="text-green-700" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-3xl">Booking Created!</h1>
          <p className="mt-3 text-sm text-[var(--nova-text-muted)]">
            Your booking <strong className="text-[var(--nova-text-dark)]">#{bookingId}</strong> has been created successfully.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg" onClick={() => router.push(`/payment?bookingId=${bookingId}`)}>
              <CreditCard size={18} /> Proceed to Instructions
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push('/my-bookings')}>
              View My Bookings
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--nova-ivory)] pt-28 text-[var(--nova-text-dark)] sm:pt-32">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <Link href="/rooms" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--nova-brown-muted)] transition hover:text-[var(--nova-gold)]">
          <ArrowLeft size={14} /> Back to Rooms
        </Link>

        <p className="nova-eyebrow mb-3 mt-6">Almost There</p>
        <h1 className="font-serif text-3xl leading-tight sm:text-4xl">Review Your Booking</h1>

        {error && <ErrorMessage message={error} className="mt-6" />}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {room && (
              <section className="nova-card overflow-hidden">
                <div className="relative h-52">
                  <Image src={getRoomImage(room)} alt={getRoomName(room)} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">Room</h2>
                  <p className="mt-3 font-serif text-2xl">{getRoomName(room)}</p>
                  <p className="mt-1 text-sm text-[var(--nova-text-muted)]">
                    {roomTypeLabel(getRoomType(room) as RoomType)} · Room {room.roomNumber}
                  </p>
                  <p className="mt-3 font-semibold text-[var(--nova-gold)]">{formatCurrency(room.pricePerNight)} <span className="font-normal text-[var(--nova-text-muted)]">/ night</span></p>
                </div>
              </section>
            )}

            <section className="nova-card p-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">Your Stay</h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                  { icon: CalendarDays, label: 'Check In', value: formatDate(checkIn) },
                  { icon: CalendarDays, label: 'Check Out', value: formatDate(checkOut) },
                  { icon: Users, label: 'Guests', value: `${guestCount} Guest${guestCount > 1 ? 's' : ''}` },
                ].map(item => (
                  <div key={item.label}>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-brown-muted)]">
                      <item.icon size={13} className="text-[var(--nova-gold)]" aria-hidden="true" /> {item.label}
                    </p>
                    <p className="mt-1.5 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {user && (
              <section className="nova-card p-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">Guest Details</h2>
                <p className="mt-3 font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-[var(--nova-text-muted)]">{user.email}</p>
              </section>
            )}

            <section className="nova-card p-6">
              <label htmlFor="special-requests" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-[var(--nova-brown-muted)]">
                <MessageSquare size={14} className="text-[var(--nova-gold)]" aria-hidden="true" /> Special Requests (Optional)
              </label>
              <textarea
                id="special-requests"
                rows={3}
                value={specialRequests}
                onChange={event => setSpecialRequests(event.target.value)}
                placeholder="e.g. Early check-in, high floor, twin beds…"
                className="admin-input mt-3 resize-none"
              />
            </section>
          </div>

          <div>
            <section className="nova-card p-6 lg:sticky lg:top-32">
              <h2 className="font-serif text-xl">Price Summary</h2>
              <div className="mt-5 space-y-3 border-b border-[var(--nova-border-light)] pb-5 text-sm">
                <div className="flex justify-between text-[var(--nova-text-muted)]">
                  <span>{formatCurrency(room?.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="font-medium text-[var(--nova-text-dark)]">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[var(--nova-text-muted)]">
                  <span>Taxes &amp; fees</span>
                  <span className="font-medium text-[var(--nova-text-dark)]">Included</span>
                </div>
              </div>
              <div className="flex items-end justify-between py-5">
                <span className="font-semibold">Total</span>
                <span className="font-serif text-2xl font-bold text-[var(--nova-gold)]">{formatCurrency(totalPrice)}</span>
              </div>

              <Button variant="primary" size="lg" className="w-full" onClick={handleCreateBooking} isLoading={submitting} disabled={!validStay || !isAuthenticated}>
                <CreditCard size={18} /> Confirm Booking
              </Button>
              {!validStay && <p role="alert" className="mt-3 text-center text-xs text-red-700">Choose valid dates and a guest count within this room&apos;s capacity.</p>}
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--nova-text-muted)]">
                <BedDouble size={13} className="text-[var(--nova-gold)]" aria-hidden="true" /> Free cancellation up to 48h before check-in
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
      <BookingContent />
    </Suspense>
  );
}
