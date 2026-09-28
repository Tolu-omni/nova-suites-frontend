'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  BedDouble, Users, Search, X, ArrowRight, Wifi, Utensils, Waves, Dumbbell,
  Flower2, CalendarDays, RotateCcw, ChevronDown,
} from 'lucide-react';
import { roomsApi } from '@/lib/api';
import { addDays, formatCurrency, getErrorMessage, roomTypeLabel, today } from '@/lib/utils';
import {
  getRoomGuestLabel,
  getRoomImage,
  getRoomMaxGuests,
  getRoomName,
  getRoomStatusClasses,
  getRoomStatusLabel,
  getRoomType,
  ROOMS_HERO_IMAGE,
} from '@/lib/roomDisplay';
import type { Room, RoomStatus, RoomType } from '@/types';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ROOM_TYPES: RoomType[] = ['SUITE', 'DOUBLE', 'SINGLE', 'DELUXE'];
type SortMode = 'recommended' | 'price-asc' | 'price-desc' | 'room-number' | 'type';
type StatusFilter = 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const highlights = [
  { label: 'Luxury Rooms', note: 'Designed for comfort', icon: BedDouble, href: '/rooms' },
  { label: 'Fine Dining', note: 'A culinary experience', icon: Utensils, href: '/dining' },
  { label: 'Swimming Pool', note: 'Relax and unwind', icon: Waves, href: '/amenities' },
  { label: 'Fitness Center', note: 'Stay active', icon: Dumbbell, href: '/amenities' },
  { label: 'Spa & Wellness', note: 'Rejuvenate your mind', icon: Flower2, href: '/amenities' },
  { label: 'High-Speed WiFi', note: 'Stay connected', icon: Wifi, href: '/amenities' },
];

function roomTypeText(type: string) {
  return ROOM_TYPES.includes(type as RoomType) ? roomTypeLabel(type as RoomType) : 'Room';
}

function RoomCard({ room, checkIn, checkOut, guests, unavailable }: { room: Room; checkIn: string; checkOut: string; guests: number; unavailable: boolean }) {
  const params = new URLSearchParams({ checkInDate: checkIn, checkOutDate: checkOut, guestCount: String(guests) });
  const roomName = getRoomName(room);
  const roomType = getRoomType(room);
  const effectiveStatus: RoomStatus =
    room.status === 'MAINTENANCE' ? 'MAINTENANCE'
      : (unavailable || room.status === 'OCCUPIED') ? 'OCCUPIED'
        : 'AVAILABLE';
  const canBook = effectiveStatus === 'AVAILABLE';

  return (
    <article className="group h-full overflow-hidden border border-[var(--nova-border-light)] bg-white shadow-sm shadow-[rgba(38,24,15,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[rgba(38,24,15,0.14)] motion-reduce:hover:translate-y-0">
      <Link href={`/rooms/${room.id}?${params.toString()}`} className="block" aria-label={`View ${roomName}`}>
        <div className="relative aspect-[1.62] overflow-hidden bg-[var(--nova-sand)]">
          <Image src={getRoomImage(room)} alt={`${roomName} at Nova Suites`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 28vw" className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
          <span className="absolute left-4 top-4 bg-[rgba(38,24,15,0.86)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--nova-text-light)]">
            {roomTypeText(roomType)}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl leading-tight text-[var(--nova-text-dark)] sm:text-2xl">{roomName}</h3>
            <span className={`relative mt-1 inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-bold before:h-2 before:w-2 before:rounded-full ${getRoomStatusClasses(effectiveStatus)}`}>
              {getRoomStatusLabel(effectiveStatus)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 min-h-[44px] text-sm leading-6 text-[var(--nova-text-muted)]">
            {room.description || 'A refined room designed for comfort, calm, and effortless style.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--nova-brown-muted)]">
            <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-[var(--nova-gold)]" /> {getRoomGuestLabel(room)}</span>
            <span className="inline-flex items-center gap-1.5"><BedDouble size={14} className="text-[var(--nova-gold)]" /> {roomTypeText(roomType)}</span>
            <span className="inline-flex items-center gap-1.5"><BedDouble size={14} className="text-[var(--nova-gold)]" /> Room {room.roomNumber}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--nova-border-light)] pt-4">
            <p className="text-lg font-extrabold tabular-nums text-[var(--nova-text-dark)] sm:text-xl">
              {formatCurrency(room.pricePerNight)} <span className="text-sm font-normal text-[var(--nova-text-muted)]">/ night</span>
            </p>
            <span className={`flex h-11 w-11 items-center justify-center rounded-full transition ${canBook ? 'bg-[var(--nova-gold)] text-white group-hover:bg-[var(--nova-espresso)]' : 'bg-[var(--nova-sand)] text-[var(--nova-brown-muted)]'}`} aria-hidden="true">
              <ArrowRight size={17} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
function RoomSkeleton() {
  return (
    <div className="min-h-[392px] border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)]">
      <div className="h-[210px] animate-pulse bg-[var(--nova-sand)]/60" />
      <div className="space-y-4 p-6">
        <div className="h-7 w-2/3 animate-pulse bg-[var(--nova-sand)]/50" />
        <div className="h-4 w-full animate-pulse bg-[var(--nova-sand)]/40" />
        <div className="h-4 w-4/5 animate-pulse bg-[var(--nova-sand)]/40" />
        <div className="h-10 w-full animate-pulse bg-[var(--nova-sand)]/35" />
      </div>
    </div>
  );
}

function RoomsContent() {
  const searchParams = useSearchParams();
  const initCheckIn = searchParams.get('checkInDate') || today();
  const initCheckOut = searchParams.get('checkOutDate') || addDays(today(), 2);
  const initGuests = Number(searchParams.get('guestCount') || 2);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const requestId = useRef(0);
  const [resultDates, setResultDates] = useState('');
  const [availableIds, setAvailableIds] = useState<Set<number> | null>(null);

  const [checkIn, setCheckIn] = useState(initCheckIn);
  const [checkOut, setCheckOut] = useState(initCheckOut);
  const [guests, setGuests] = useState(initGuests);
  const [typeFilter, setTypeFilter] = useState<RoomType | ''>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [formError, setFormError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await roomsApi.getAll();
      if (id !== requestId.current) return;
      setRooms(data);
      setAvailableIds(null);
      setSearched(false);
      setResultDates('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadRooms);
  }, [loadRooms]);

  const counts = useMemo(() => ({
    all: rooms.length,
    available: rooms.filter(room => room.status === 'AVAILABLE').length,
    byType: ROOM_TYPES.reduce((acc, type) => {
      acc[type] = rooms.filter(room => getRoomType(room) === type).length;
      return acc;
    }, {} as Record<RoomType, number>),
  }), [rooms]);

  const maxRoomPrice = useMemo(() => {
    const prices = rooms.map(room => Number(room.pricePerNight) || 0);
    return Math.max(500000, ...prices);
  }, [rooms]);

  const filtered = useMemo(() => {
    const result = rooms.filter(room => {
      if (typeFilter && getRoomType(room) !== typeFilter) return false;
      if (statusFilter !== 'ALL' && room.status !== statusFilter) return false;
      if (maxPrice !== '' && Number(room.pricePerNight) > Number(maxPrice)) return false;
      if (guests && getRoomMaxGuests(room) < guests) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortMode === 'price-asc') return Number(a.pricePerNight) - Number(b.pricePerNight);
      if (sortMode === 'price-desc') return Number(b.pricePerNight) - Number(a.pricePerNight);
      if (sortMode === 'room-number') return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true });
      if (sortMode === 'type') return getRoomType(a).localeCompare(getRoomType(b));
      if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
      if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE') return 1;
      return Number(a.pricePerNight) - Number(b.pricePerNight);
    });

    return result;
  }, [rooms, typeFilter, statusFilter, maxPrice, guests, sortMode]);

  const validateDates = () => {
    if (!checkIn || checkIn < today()) return 'Choose a check-in date today or later.';
    if (!checkOut) return 'Check-out date is required.';
    if (new Date(checkOut) <= new Date(checkIn)) return 'Check-out must be after check-in.';
    return null;
  };

  const handleSearch = async () => {
    const validationError = validateDates();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSearching(true);
    setFormError(null);
    setError(null);
    try {
      const id = ++requestId.current;
      const data = await roomsApi.getAvailable(checkIn, checkOut);
      if (id !== requestId.current) return;
      setResultDates(`${checkIn} to ${checkOut}`);
      setAvailableIds(new Set(data.map(room => room.id)));
      setSearched(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const resetFilters = () => {
    setTypeFilter('');
    setStatusFilter('ALL');
    setMaxPrice('');
    setSortMode('recommended');
    setFormError(null);
  };

  const resetDatesAndRooms = async () => {
    setCheckIn(today());
    setCheckOut(addDays(today(), 2));
    setGuests(2);
    resetFilters();
    await loadRooms();
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[var(--nova-ivory)] text-[var(--nova-text-dark)]">
      <section className="relative w-full pt-20 sm:pt-28">
        <div className="relative h-[320px] overflow-hidden lg:h-[360px]">
          <Image src={ROOMS_HERO_IMAGE} alt="Nova Suites bedroom overlooking Lagos" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[rgba(38,24,15,0.48)]" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[rgba(38,24,15,0.74)] to-transparent" />
          <div className="absolute right-10 top-1/2 z-10 hidden -translate-y-1/2 text-right text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--nova-text-light)]/90 xl:block">
            <span className="block">People</span>
            <span className="mt-2 block">Places</span>
            <span className="mt-2 block">Possibilities</span>
          </div>
          <div className="relative z-10 flex h-full w-full flex-col justify-center px-5 text-[var(--nova-text-light)] md:px-8 lg:px-16 2xl:px-20">
            <nav className="mb-5 flex items-center gap-2 text-sm text-[var(--nova-text-light)]/80" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[var(--nova-gold-light)]">Home</Link>
              <span>/</span>
              <span>Rooms</span>
            </nav>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.42em] text-[var(--nova-gold-light)]">Our Rooms</p>
            <h1 className="font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">Rooms &amp; Suites</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--nova-text-light)]/90 sm:text-lg">
              Discover our collection of rooms and suites, designed for your comfort, whether you&apos;re here for business or leisure.
            </p>
          </div>
        </div>

        <div className="relative z-20 mt-0 lg:-mt-8 w-full px-5 md:px-8 lg:px-16 2xl:px-20">
          <div className="border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] p-4 shadow-xl shadow-[rgba(38,24,15,0.12)]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.9fr_1fr_240px] xl:items-end">
              <label className="flex min-h-14 items-center gap-3 border border-[var(--nova-border-light)] bg-white px-4">
                <CalendarDays size={22} className="text-[var(--nova-espresso)]" />
                <span className="flex-1"><span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-brown-muted)]">Check In</span><input type="date" value={checkIn} min={today()} onChange={e => { setCheckIn(e.target.value); setSearched(false); setAvailableIds(null); requestId.current++; }} className="mt-1 w-full bg-transparent text-sm text-[var(--nova-text-dark)] outline-none" /></span>
              </label>
              <label className="flex min-h-14 items-center gap-3 border border-[var(--nova-border-light)] bg-white px-4">
                <CalendarDays size={22} className="text-[var(--nova-espresso)]" />
                <span className="flex-1"><span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-brown-muted)]">Check Out</span><input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={e => { setCheckOut(e.target.value); setSearched(false); setAvailableIds(null); requestId.current++; }} className="mt-1 w-full bg-transparent text-sm text-[var(--nova-text-dark)] outline-none" /></span>
              </label>
              <label className="flex min-h-14 items-center gap-3 border border-[var(--nova-border-light)] bg-white px-4">
                <Users size={22} className="text-[var(--nova-espresso)]" />
                <span className="flex-1"><span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-brown-muted)]">Guests</span><select value={guests} onChange={e => setGuests(Number(e.target.value))} className="mt-1 w-full appearance-none bg-transparent text-sm text-[var(--nova-text-dark)] outline-none">{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}</select></span><ChevronDown size={16} /></label>
              <label className="flex min-h-14 items-center gap-3 border border-[var(--nova-border-light)] bg-white px-4">
                <BedDouble size={22} className="text-[var(--nova-espresso)]" />
                <span className="flex-1"><span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-brown-muted)]">Room Type</span><select value={typeFilter} onChange={e => setTypeFilter(e.target.value as RoomType | '')} className="mt-1 w-full appearance-none bg-transparent text-sm text-[var(--nova-text-dark)] outline-none"><option value="">All Types</option>{ROOM_TYPES.map(type => <option key={type} value={type}>{roomTypeLabel(type)}</option>)}</select></span><ChevronDown size={16} /></label>
              <Button onClick={handleSearch} isLoading={searching} className="min-h-14 w-full px-8 text-base">
                <Search size={18} /> Search Availability
              </Button>
            </div>
            {(formError || searched) && (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--nova-border-light)] pt-4 text-sm">
                {formError && <span className="font-semibold text-red-700">{formError}</span>}
                {searched && !formError && <span className="text-[var(--nova-text-muted)]">Availability checked for <strong className="text-[var(--nova-espresso)]">{resultDates}</strong></span>}
                {searched && <button onClick={resetDatesAndRooms} className="ml-auto inline-flex min-h-9 items-center gap-1 font-semibold text-[var(--nova-brown-muted)] hover:text-[var(--nova-espresso)]"><X size={14} /> Clear search</button>}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full px-5 pb-6 pt-6 md:px-8 lg:px-16 2xl:px-20">
        <div className="grid grid-cols-2 gap-y-6 border-b border-[var(--nova-border-light)] pb-7 sm:grid-cols-3 lg:grid-cols-6">
          {highlights.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className="group flex min-h-20 flex-col items-center justify-center border-[var(--nova-border-light)] px-4 text-center transition hover:text-[var(--nova-gold)] lg:border-r last:border-r-0">
                <Icon size={30} className="mb-3 text-[var(--nova-gold)] transition group-hover:-translate-y-0.5" />
                <span className="text-sm font-bold text-[var(--nova-text-dark)]">{item.label}</span>
                <span className="mt-1 text-xs text-[var(--nova-text-muted)]">{item.note}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="w-full px-5 pb-10 md:px-8 lg:px-16 2xl:px-20">
        {error ? (
          <div className="border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] p-8">
            <h2 className="mb-3 font-serif text-3xl text-[var(--nova-text-dark)]">Unable to load rooms</h2>
            <ErrorMessage message={error} className="mb-5" />
            <Button onClick={loadRooms}><RotateCcw size={16} /> Try Again</Button>
          </div>
        ) : loading ? (
          <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
            <div className="hidden h-80 animate-pulse border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] lg:block" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map(item => <RoomSkeleton key={item} />)}</div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
            <aside className="border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] p-6 shadow-sm shadow-[rgba(38,24,15,0.06)] lg:sticky lg:top-36">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--nova-border-light)] pb-4">
                <h2 className="font-serif text-2xl text-[var(--nova-text-dark)]">Filter Rooms</h2>
                <button onClick={resetFilters} className="text-sm font-semibold text-[var(--nova-gold)] underline-offset-4 hover:underline">Reset Filters</button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-bold text-[var(--nova-text-dark)]">Price Range <span className="font-normal text-[var(--nova-text-muted)]">(per night)</span></label>
                  <input
                    type="range"
                    min={0}
                    max={maxRoomPrice}
                    step={5000}
                    value={maxPrice === '' ? maxRoomPrice : maxPrice}
                    onChange={event => setMaxPrice(Number(event.target.value))}
                    className="w-full accent-[var(--nova-gold)]"
                  />
                  <div className="mt-2 flex items-center justify-between text-sm font-bold text-[var(--nova-text-dark)]">
                    <span>{formatCurrency(0)}</span>
                    <span>{formatCurrency(maxPrice === '' ? maxRoomPrice : maxPrice)}</span>
                  </div>
                </div>
                <div className="border-t border-[var(--nova-border-light)] pt-5">
                  <p className="mb-3 text-sm font-bold text-[var(--nova-text-dark)]">Room Type</p>
                  <div className="space-y-2 text-sm text-[var(--nova-text-muted)]">
                    <label className="flex items-center gap-3"><input type="checkbox" checked={typeFilter === ''} onChange={() => setTypeFilter('')} /> All Rooms ({counts.all})</label>
                    {ROOM_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-3">
                        <input type="checkbox" checked={typeFilter === type} onChange={() => setTypeFilter(typeFilter === type ? '' : type)} />
                        {roomTypeLabel(type)} ({counts.byType[type] ?? 0})
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[var(--nova-border-light)] pt-5">
                  <p className="mb-3 text-sm font-bold text-[var(--nova-text-dark)]">Room Status</p>
                  <div className="space-y-2 text-sm text-[var(--nova-text-muted)]">
                    <label className="flex items-center gap-3"><input type="checkbox" checked={statusFilter === 'ALL'} onChange={() => setStatusFilter('ALL')} /> All Statuses ({counts.all})</label>
                    {statusOptions.map(option => (
                      <label key={option.value} className="flex items-center gap-3">
                        <input type="checkbox" checked={statusFilter === option.value} onChange={() => setStatusFilter(statusFilter === option.value ? 'ALL' : option.value)} />
                        {option.label} ({rooms.filter(room => room.status === option.value).length})
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[var(--nova-text-muted)]">{filtered.length} Room{filtered.length === 1 ? '' : 's'} Found</span>
                <label className="flex min-h-11 w-full items-center justify-between border border-[var(--nova-border-light)] bg-white px-3 text-sm sm:w-[270px]">
                  <span className="font-bold text-[var(--nova-text-dark)]">Sort by</span>
                  <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} className="bg-transparent text-[var(--nova-text-dark)] outline-none">
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="room-number">Room Number</option>
                    <option value="type">Room Type</option>
                  </select>
                </label>
              </div>
              {filtered.length === 0 ? (
                <div className="border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] px-6 py-20 text-center">
                  <BedDouble size={48} className="mx-auto mb-4 text-[var(--nova-gold)]" />
                  <h3 className="mb-2 font-serif text-3xl text-[var(--nova-text-dark)]">No rooms match your stay</h3>
                  <p className="mx-auto mb-6 max-w-md text-[var(--nova-text-muted)]">Try changing your dates, room type, or guest selection.</p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row"><Button onClick={resetFilters} variant="outline"><RotateCcw size={16} /> Reset Filters</Button><Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Change Dates</Button></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map(room => <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} guests={guests} unavailable={availableIds !== null && !availableIds.has(room.id)} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
      <RoomsContent />
    </Suspense>
  );
}
