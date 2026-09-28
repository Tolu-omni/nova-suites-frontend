'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Bath, BedDouble, CheckCircle, Coffee, Maximize2, Star, Tv, Users, Wind, Wifi,
} from 'lucide-react';
import { roomsApi } from '@/lib/api';
import { formatCurrency, roomTypeLabel, nightsBetween, getErrorMessage, today, addDays } from '@/lib/utils';
import { getRoomImage, getRoomMaxGuests, getRoomName, getRoomType } from '@/lib/roomDisplay';
import type { Room, RoomType } from '@/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_AMENITIES = [
  { icon: Wifi, label: 'High-Speed Wi-Fi' },
  { icon: Tv, label: 'Smart TV' },
  { icon: Coffee, label: 'Nespresso Machine' },
  { icon: Wind, label: 'Climate Control' },
  { icon: Bath, label: 'Luxury Bathroom' },
  { icon: CheckCircle, label: 'Daily Housekeeping' },
];

function RoomDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const roomId = Number(params.id);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState(searchParams.get('checkInDate') || today());
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOutDate') || addDays(today(), 2));
  const [guests, setGuests] = useState(Number(searchParams.get('guestCount') || 2));

  useEffect(() => {
    if (!Number.isInteger(roomId) || roomId <= 0) { Promise.resolve().then(() => { setError('Room not found.'); setLoading(false); }); return; }
    roomsApi.getById(roomId)
      .then(setRoom)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [roomId]);

  const [availability, setAvailability] = useState<{key:string; available:boolean; error?:string}>({key:'',available:false});
  const selectionKey = `${roomId}:${checkIn}:${checkOut}:${guests}`;
  useEffect(() => {
    let active = true;
    if (!room || checkIn < today() || checkOut <= checkIn || guests < 1 || guests > getRoomMaxGuests(room)) return;
    roomsApi.getAvailable(checkIn, checkOut).then(rows => { if(active) setAvailability({key:selectionKey,available:rows.some(r=>r.id===roomId)}); }).catch(e=>{if(active)setAvailability({key:selectionKey,available:false,error:getErrorMessage(e)});});
    return ()=>{active=false;};
  }, [room, roomId, checkIn, checkOut, guests, selectionKey]);
  const canBook = availability.key === selectionKey && availability.available;
  const bookingUrl = `/booking?${new URLSearchParams({roomId:String(roomId),checkInDate:checkIn,checkOutDate:checkOut,guestCount:String(guests)})}`;

  const nights = nightsBetween(checkIn, checkOut);
  const totalPrice = (room?.pricePerNight ?? 0) * nights;

  const handleBook = () => {
    if (!canBook) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(bookingUrl)}`);
      return;
    }
    const bookingParams = new URLSearchParams({
      roomId: String(roomId),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount: String(guests),
    });
    router.push(`/booking?${bookingParams.toString()}`);
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--nova-ivory)] px-4 pt-28 text-center">
        <ErrorMessage message={error} />
        <Link href="/rooms" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--nova-gold)] hover:underline">
          <ArrowLeft size={14} /> Back to Rooms
        </Link>
      </main>
    );
  }

  if (!room) return null;

  const imgSrc = getRoomImage(room);
  const roomName = getRoomName(room);
  const roomType = getRoomType(room);
  const maxGuests = getRoomMaxGuests(room);
  const amenities = room.amenities?.length
    ? room.amenities.map(label => ({ icon: CheckCircle, label }))
    : DEFAULT_AMENITIES;

  return (
    <main className="min-h-screen bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      {/* Hero image */}
      <div className="relative h-[52vh] min-h-[380px] sm:h-[60vh]">
        <Image src={imgSrc} alt={roomName} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(38,24,15,0.35)] to-[rgba(38,24,15,0.85)]" />
        <div className="absolute inset-x-0 bottom-6 px-5 sm:px-8 lg:px-16">
          <Link href="/rooms" className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--nova-text-light)]/85 transition hover:text-[var(--nova-gold-light)]">
            <ArrowLeft size={14} /> All Rooms
          </Link>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="inline-block rounded-full border border-[var(--nova-gold)]/50 bg-[rgba(38,24,15,0.55)] px-3 py-1 text-xs font-semibold text-[var(--nova-gold-light)] backdrop-blur-sm">
              {roomTypeLabel(roomType as RoomType)}
            </span>
            <span className="inline-block rounded-full border border-white/25 bg-[rgba(38,24,15,0.55)] px-3 py-1 text-xs font-semibold text-[var(--nova-text-light)] backdrop-blur-sm">
              Room {room.roomNumber}
            </span>
          </div>
          <h1 className="font-serif text-3xl text-white sm:text-5xl">{roomName}</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <section className="flex flex-wrap items-center gap-6 border-b border-[var(--nova-border-light)] pb-6">
              <span className="flex items-center gap-2.5 text-sm text-[var(--nova-text-muted)]">
                <BedDouble size={18} className="text-[var(--nova-gold)]" aria-hidden="true" /> Room {room.roomNumber}
              </span>
              <span className="flex items-center gap-2.5 text-sm text-[var(--nova-text-muted)]">
                <Users size={18} className="text-[var(--nova-gold)]" aria-hidden="true" /> Up to {maxGuests} guests
              </span>
              {typeof room.size === 'number' && room.size > 0 && (
                <span className="flex items-center gap-2.5 text-sm text-[var(--nova-text-muted)]">
                  <Maximize2 size={18} className="text-[var(--nova-gold)]" aria-hidden="true" /> {room.size} m²
                </span>
              )}
              <span className="flex items-center gap-1" aria-label="Rated 5 out of 5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[var(--nova-gold)] text-[var(--nova-gold)]" aria-hidden="true" />
                ))}
              </span>
            </section>

            <section>
              <h2 className="font-serif text-2xl">About This Room</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--nova-text-muted)] sm:text-base">
                {room.description || 'A refined room designed for comfort, calm, and effortless style.'}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl">Room Amenities</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((amenity, index) => (
                  <div key={`${amenity.label}-${index}`} className="flex items-center gap-2.5 rounded-xl border border-[var(--nova-border-light)] bg-white p-3.5">
                    <amenity.icon size={16} className="shrink-0 text-[var(--nova-gold)]" aria-hidden="true" />
                    <span className="text-sm text-[var(--nova-text-muted)]">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="self-start lg:sticky lg:top-32">
            <section className="nova-card p-6">
              <div className="border-b border-[var(--nova-border-light)] pb-5">
                <span className="font-serif text-3xl font-bold text-[var(--nova-gold)]">{formatCurrency(room.pricePerNight)}</span>
                <span className="ml-1 text-sm text-[var(--nova-text-muted)]">per night</span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="detail-checkin" className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-brown-muted)]">Check In</label>
                  <input
                    id="detail-checkin"
                    type="date"
                    value={checkIn}
                    min={today()}
                    onChange={event => {
                      const value = event.target.value;
                      setCheckIn(value);
                      if (value >= checkOut) setCheckOut(addDays(value, 1));
                    }}
                    className="admin-input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="detail-checkout" className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-brown-muted)]">Check Out</label>
                  <input
                    id="detail-checkout"
                    type="date"
                    value={checkOut}
                    min={addDays(checkIn, 1)}
                    onChange={event => setCheckOut(event.target.value)}
                    className="admin-input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="detail-guests" className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-brown-muted)]">Guests</label>
                  <select
                    id="detail-guests"
                    value={guests}
                    onChange={event => setGuests(Number(event.target.value))}
                    className="admin-input"
                  >
                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="mt-5 space-y-2 border-t border-[var(--nova-border-light)] pt-5 text-sm">
                  <div className="flex justify-between text-[var(--nova-text-muted)]">
                    <span>{formatCurrency(room.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span className="font-medium text-[var(--nova-text-dark)]">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex items-end justify-between pt-1 text-base font-semibold">
                    <span>Total</span>
                    <span className="font-serif text-xl text-[var(--nova-gold)]">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}

              <Button
                variant={canBook ? 'primary' : 'secondary'}
                size="lg"
                className="mt-6 w-full"
                disabled={!canBook}
                onClick={handleBook}
              >
                {canBook ? 'Book Now' : availability.key !== selectionKey ? 'Select valid dates / checking' : 'Unavailable for these dates'}
              </Button>

              {availability.error && <p role="alert" className="mt-3 text-sm text-red-700">{availability.error}</p>}
              {!isAuthenticated && (
                <p className="mt-3 text-center text-xs text-[var(--nova-text-muted)]">
                  <Link href={`/auth/login?redirect=${encodeURIComponent(bookingUrl)}`} className="font-semibold text-[var(--nova-gold)] hover:underline">Sign in</Link> to complete your booking
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RoomDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
      <RoomDetailContent />
    </Suspense>
  );
}
