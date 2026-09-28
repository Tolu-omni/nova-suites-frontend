import type { BookingStatus, PaymentStatus, RoomType } from '@/types';

// ─── Date & Time ──────────────────────────────────────────────────────────────

// Parses a naive "YYYY-MM-DD" as a local date (new Date() would treat it as UTC
// midnight, which can shift the calendar day in non-UTC timezones).
function parseDateInput(dateStr: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(dateStr);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return parseDateInput(dateStr).toLocaleDateString('en-US', {
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
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function today(): string {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateInput(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = parseDateInput(checkIn).getTime();
  const end   = parseDateInput(checkOut).getTime();
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
    currencyDisplay: 'narrowSymbol',
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
    SUCCESSFUL: 'bg-green-100 text-green-800',
    FAILED:   'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  };
  return colors[status] ?? 'bg-stone-100 text-stone-700';
}

export function roomTypeLabel(type: RoomType): string {
  const labels: Record<RoomType, string> = {
    SINGLE: 'Single Room',
    DOUBLE: 'Double Room',
    DELUXE: 'Deluxe Room',
    SUITE: 'Suite',
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

/** Human-friendly relative time, e.g. "16 mins ago". */
export function timeAgo(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.round(months / 12)} yr ago`;
}

/** Display reference for a booking id, e.g. 108 → "LG-B00108". */
export function bookingRef(id: number): string {
  return `LG-B${String(id).padStart(5, '0')}`;
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
