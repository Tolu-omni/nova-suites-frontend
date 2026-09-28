'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronDown, Search, Users } from 'lucide-react';
import { addDays, getErrorMessage, today } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function SearchBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(addDays(today(), 2));
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (checkIn < today() || checkOut <= checkIn) throw new Error('Choose valid future stay dates.');
      const params = new URLSearchParams({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: String(guests),
      });
      router.push(`/rooms?${params.toString()}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-20 bg-[var(--nova-ivory)] px-5 pb-6 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSearch}
        className="mx-auto -mt-12 max-w-6xl border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] p-4 shadow-xl shadow-[rgba(38,24,15,0.14)] lg:p-5"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.9fr_240px] xl:items-end">
          <label className="flex min-h-14 items-center gap-3 border border-[var(--nova-border-light)] bg-white px-4">
            <CalendarDays size={22} className="shrink-0 text-[var(--nova-espresso)]" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-brown-muted)]">Check In</span>
              <input
                type="date"
                value={checkIn}
                min={today()}
                onChange={event => {
                  const value = event.target.value;
                  setCheckIn(value);
                  if (value >= checkOut) setCheckOut(addDays(value, 1));
                }}
                className="mt-1 w-full bg-transparent text-sm text-[var(--nova-text-dark)] outline-none"
              />
            </span>
          </label>

          <label className="flex min-h-14 items-center gap-3 border border-[var(--nova-border-light)] bg-white px-4">
            <CalendarDays size={22} className="shrink-0 text-[var(--nova-espresso)]" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-brown-muted)]">Check Out</span>
              <input
                type="date"
                value={checkOut}
                min={addDays(checkIn, 1)}
                onChange={event => setCheckOut(event.target.value)}
                className="mt-1 w-full bg-transparent text-sm text-[var(--nova-text-dark)] outline-none"
              />
            </span>
          </label>

          <label className="flex min-h-14 items-center gap-3 border border-[var(--nova-border-light)] bg-white px-4">
            <Users size={22} className="shrink-0 text-[var(--nova-espresso)]" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-brown-muted)]">Guests</span>
              <select
                value={guests}
                onChange={event => setGuests(Number(event.target.value))}
                className="mt-1 w-full appearance-none bg-transparent text-sm text-[var(--nova-text-dark)] outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </span>
            <ChevronDown size={16} className="shrink-0 text-[var(--nova-brown-muted)]" aria-hidden="true" />
          </label>

          <Button type="submit" isLoading={loading} className="min-h-14 w-full px-8 text-base">
            <Search size={18} /> Search Availability
          </Button>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
      </form>
    </section>
  );
}
