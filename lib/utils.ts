import type { BookingStatus, PaymentStatus, RoomType } from '@/types';

// ─── Date & Time ──────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn).getTime();
  const end   = new Date(checkOut).getTime();
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(
  amount: number | undefined | null,
  currency = 'NGN'
): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-NG', {
    style:    'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Status Labels & Colors ───────────────────────────────────────────────────

export function bookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    PENDING:     'Pending',
    CONFIRMED:   'Confirmed',
    CHECKED_IN:  'Checked In',
    CHECKED_OUT: 'Checked Out',
    CANCELLED:   'Cancelled',
  };
  return labels[status] ?? status;
}

export function bookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    PENDING:     'bg-amber-100 text-amber-800',
    CONFIRMED:   'bg-blue-100 text-blue-800',
    CHECKED_IN:  'bg-green-100 text-green-800',
    CHECKED_OUT: 'bg-stone-100 text-stone-700',
    CANCELLED:   'bg-red-100 text-red-800',
  };
  return colors[status] ?? 'bg-stone-100 text-stone-700';
}

export function paymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING:  'bg-amber-100 text-amber-800',
    SUCCESS:  'bg-green-100 text-green-800',
    FAILED:   'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  };
  return colors[status] ?? 'bg-stone-100 text-stone-700';
}

export function roomTypeLabel(type: RoomType): string {
  const labels: Record<RoomType, string> = {
    STANDARD:  'Standard Room',
    DELUXE:    'Deluxe Room',
    SUITE:     'Suite',
    PENTHOUSE: 'Penthouse',
    VILLA:     'Private Villa',
  };
  return labels[type] ?? type;
}

// ─── Strings ──────────────────────────────────────────────────────────────────

export function truncate(str: string, maxLen = 120): string {
  return str.length > maxLen ? str.slice(0, maxLen).trimEnd() + '…' : str;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ─── Error Helpers ────────────────────────────────────────────────────────────

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred.';
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
