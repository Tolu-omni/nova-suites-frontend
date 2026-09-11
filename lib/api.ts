import { getToken } from './auth';
import type {
  AuthResponse,
  Booking,
  BookingStatus,
  CreateBookingRequest,
  CreatePaymentRequest,
  CreateRoomRequest,
  Customer,
  LoginRequest,
  Payment,
  PaystackInitResponse,
  PaystackVerifyResponse,
  RegisterRequest,
  Room,
} from '@/types';

// ─── Base Config ──────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // No content responses (204 etc.)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const errorBody = body as { message?: string; errors?: Record<string, string> } | null;
    const message = errorBody?.message ?? httpStatusMessage(res.status);
    throw new ApiError(res.status, message, errorBody?.errors);
  }

  return body as T;
}

function httpStatusMessage(status: number): string {
  switch (status) {
    case 400: return 'Invalid request. Please check your input.';
    case 401: return 'You must be logged in to do that.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 409: return 'A conflict occurred. The resource may already exist.';
    case 500: return 'Server error. Please try again later.';
    default:  return `Unexpected error (${status}).`;
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Rooms API ────────────────────────────────────────────────────────────────

export const roomsApi = {
  getAll: () =>
    apiFetch<Room[]>('/api/rooms'),

  getById: (id: number) =>
    apiFetch<Room>(`/api/rooms/${id}`),

  getAvailable: (checkInDate: string, checkOutDate: string) =>
    apiFetch<Room[]>(
      `/api/rooms/available?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
    ),

  create: (data: CreateRoomRequest) =>
    apiFetch<Room>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateRoomRequest>) =>
    apiFetch<Room>(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/api/rooms/${id}`, { method: 'DELETE' }),
};

// ─── Bookings API ─────────────────────────────────────────────────────────────

export const bookingsApi = {
  create: (data: CreateBookingRequest) =>
    apiFetch<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    apiFetch<Booking[]>('/api/bookings'),

  getById: (id: number) =>
    apiFetch<Booking>(`/api/bookings/${id}`),

  confirm: (id: number) =>
    apiFetch<Booking>(`/api/bookings/${id}/confirm`, { method: 'PATCH' }),

  checkIn: (id: number) =>
    apiFetch<Booking>(`/api/bookings/${id}/check-in`, { method: 'PATCH' }),

  checkOut: (id: number) =>
    apiFetch<Booking>(`/api/bookings/${id}/check-out`, { method: 'PATCH' }),

  cancel: (id: number) =>
    apiFetch<Booking>(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),

  updateStatus: (id: number, status: BookingStatus) => {
    const actionMap: Record<string, () => Promise<Booking>> = {
      CONFIRMED:   () => bookingsApi.confirm(id),
      CHECKED_IN:  () => bookingsApi.checkIn(id),
      CHECKED_OUT: () => bookingsApi.checkOut(id),
      CANCELLED:   () => bookingsApi.cancel(id),
    };
    const action = actionMap[status];
    if (!action) throw new Error(`No action for status: ${status}`);
    return action();
  },
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export const paymentsApi = {
  create: (data: CreatePaymentRequest) =>
    apiFetch<Payment>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    apiFetch<Payment[]>('/api/payments'),

  getById: (id: number) =>
    apiFetch<Payment>(`/api/payments/${id}`),

  markSuccess: (id: number) =>
    apiFetch<Payment>(`/api/payments/${id}/success`, { method: 'PATCH' }),

  // Paystack integration
  initialize: (bookingId: number) =>
    apiFetch<PaystackInitResponse>(`/api/payments/initialize/${bookingId}`, {
      method: 'POST',
    }),

  verify: (reference: string) =>
    apiFetch<PaystackVerifyResponse>(`/api/payments/verify/${reference}`),
};

// ─── Customers API ────────────────────────────────────────────────────────────
// TODO: Confirm exact endpoint paths with backend (/api/customers vs /api/users)

export const customersApi = {
  getAll: () =>
    apiFetch<Customer[]>('/api/customers'),

  getById: (id: number) =>
    apiFetch<Customer>(`/api/customers/${id}`),
};
