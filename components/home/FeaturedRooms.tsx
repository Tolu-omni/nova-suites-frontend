'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BedDouble, Users } from 'lucide-react';
import { roomsApi } from '@/lib/api';
import { formatCurrency, getErrorMessage, roomTypeLabel } from '@/lib/utils';
import { getRoomGuestLabel, getRoomImage, getRoomName, getRoomType } from '@/lib/roomDisplay';
import type { Room, RoomType } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function RoomCard({ room }: { room: Room }) {
  const roomName = getRoomName(room);
  const roomType = getRoomType(room);

  return (
    <article className="group h-full overflow-hidden border border-[var(--nova-border-light)] bg-white shadow-sm shadow-[rgba(38,24,15,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[rgba(38,24,15,0.14)] motion-reduce:hover:translate-y-0">
      <Link href={`/rooms/${room.id}`} className="block" aria-label={`View ${roomName}`}>
        <div className="relative aspect-[1.62] overflow-hidden bg-[var(--nova-sand)]">
          <Image
            src={getRoomImage(room)}
            alt={`${roomName} at Nova Suites`}
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="absolute left-4 top-4 bg-[rgba(38,24,15,0.86)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--nova-text-light)]">
            {roomTypeLabel(roomType as RoomType)}
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-serif text-xl leading-tight text-[var(--nova-text-dark)]">{roomName}</h3>
          <p className="mt-1 line-clamp-2 min-h-[44px] text-sm leading-6 text-[var(--nova-text-muted)]">
            {room.description || 'A refined room designed for comfort, calm, and effortless style.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--nova-brown-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="text-[var(--nova-gold)]" aria-hidden="true" /> {getRoomGuestLabel(room)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BedDouble size={14} className="text-[var(--nova-gold)]" aria-hidden="true" /> {roomTypeLabel(roomType as RoomType)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--nova-border-light)] pt-4">
            <p className="text-lg font-extrabold tabular-nums text-[var(--nova-text-dark)]">
              {formatCurrency(room.pricePerNight)}
              <span className="text-sm font-normal text-[var(--nova-text-muted)]"> / night</span>
            </p>
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--nova-gold)] text-white transition group-hover:bg-[var(--nova-espresso)]"
              aria-hidden="true"
            >
              <ArrowRight size={17} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function FeaturedRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    roomsApi.getAll()
      .then(data => setRooms(data.slice(0, 3)))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-[var(--nova-ivory)] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_2.18fr] lg:items-start">
        <div>
          <p className="nova-eyebrow mb-3">Our Suites</p>
          <h2 className="font-serif text-4xl leading-none text-[var(--nova-text-dark)] sm:text-5xl">Featured Rooms</h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--nova-text-muted)]">
            Discover thoughtfully designed rooms and suites, each offering a unique blend of comfort, style and elegance.
          </p>
          <Link
            href="/rooms"
            className="mt-7 inline-flex min-h-11 items-center gap-2 border border-[var(--nova-border-light)] px-6 text-sm font-semibold text-[var(--nova-text-dark)] transition hover:border-[var(--nova-gold)] hover:bg-white"
          >
            View All Rooms <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : error ? (
          <div className="border border-red-200 bg-white p-8 text-sm text-red-700">{error}</div>
        ) : rooms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {rooms.map(room => <RoomCard key={room.id} room={room} />)}
          </div>
        ) : (
          <div className="border border-[var(--nova-border-light)] bg-white p-8 text-sm text-[var(--nova-text-muted)]">
            No rooms are available from the backend yet.
          </div>
        )}
      </div>
    </section>
  );
}
