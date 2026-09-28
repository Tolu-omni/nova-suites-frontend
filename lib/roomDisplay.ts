import type { Room, RoomStatus } from '@/types';
import { getApiBaseUrl } from '@/lib/api';

export type PresentationRoomType = 'SINGLE' | 'DOUBLE' | 'DELUXE' | 'SUITE' | 'STANDARD';

type BackendRoom = Partial<Room> & { roomType?: string; type?: string };

const ROOM_IMAGES: Record<PresentationRoomType, string> = {
  SINGLE: '/images/rooms/single-room.png',
  DOUBLE: '/images/rooms/double-room.png',
  DELUXE: '/images/rooms/deluxe-room.png',
  SUITE: '/images/rooms/suite-room.png',
  STANDARD: '/images/rooms/double-room.png',
};

export const ROOMS_HERO_IMAGE = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=2200&q=90&auto=format&fit=crop';
export const ROOMS_PROMO_IMAGE = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1800&q=90&auto=format&fit=crop';

export function getRoomType(room: BackendRoom | null | undefined): string {
  return room?.roomType || room?.type || 'STANDARD';
}

export function getRoomName(room: BackendRoom | null | undefined): string {
  const type = getRoomType(room);
  const labels: Record<string, string> = {
    SINGLE: 'Single Room',
    DOUBLE: 'Double Room',
    DELUXE: 'Deluxe Room',
    SUITE: 'Suite Room',
    STANDARD: 'Standard Room',
  };
  return room?.name || labels[type] || `${type.charAt(0)}${type.slice(1).toLowerCase()} Room`;
}

export function getRoomGuestLabel(room: BackendRoom | null | undefined): string {
  const type = getRoomType(room);
  if (typeof room?.maxGuests === 'number') return `${room.maxGuests} Guest${room.maxGuests === 1 ? '' : 's'}`;
  if (type === 'SINGLE') return '1-2 Guests';
  if (type === 'SUITE') return '4 Guests';
  if (type === 'DOUBLE' || type === 'DELUXE') return '2 Guests';
  return '2 Guests';
}

export function getRoomMaxGuests(room: BackendRoom | null | undefined): number {
  if (typeof room?.maxGuests === 'number') return room.maxGuests;
  const type = getRoomType(room);
  if (type === 'SUITE') return 4;
  if (type === 'SINGLE' || type === 'DOUBLE' || type === 'DELUXE') return 2;
  return 2;
}

export function getRoomImage(room: BackendRoom | null | undefined): string {
  const imageUrl = room?.imageUrl?.trim();
  if (imageUrl?.startsWith('/')) return imageUrl;
  if (imageUrl) {
    try {
      const candidate = new URL(imageUrl);
      const apiUrl = getApiBaseUrl();
      const apiOrigin = apiUrl ? new URL(apiUrl).origin : null;
      const allowedOrigins = new Set([
        'https://images.unsplash.com',
        'https://plus.unsplash.com',
        apiOrigin,
      ]);
      if (allowedOrigins.has(candidate.origin)) return imageUrl;
    } catch {
      // Invalid or unconfigured remote images use the local room-type fallback.
    }
  }

  const type = getRoomType(room) as PresentationRoomType;
  return ROOM_IMAGES[type] || ROOM_IMAGES.STANDARD;
}

export function getRoomStatusLabel(status: RoomStatus | string | undefined): string {
  if (status === 'AVAILABLE') return 'Available';
  if (status === 'OCCUPIED') return 'Occupied';
  if (status === 'MAINTENANCE') return 'Maintenance';
  return 'Unavailable';
}

export function getRoomStatusClasses(status: RoomStatus | string | undefined): string {
  if (status === 'AVAILABLE') return 'text-green-700 before:bg-green-600';
  if (status === 'MAINTENANCE') return 'text-amber-700 before:bg-amber-500';
  return 'text-red-700 before:bg-red-600';
}
