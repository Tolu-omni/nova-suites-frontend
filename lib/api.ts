import { clearSession, getToken } from './auth';
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
  UpdateBookingRequest,
  UpdateCustomerRequest,
} from '@/types';

// ─── Base Config ──────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '') ?? '';

export function getApiBaseUrl(): string {
  return API_URL;
}

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

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(0, 'The Nova Suites API is not configured. Please contact support.');
  }

  const token = getToken();

  const headers: HeadersInit = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, 'Unable to reach Nova Suites. Check your connection and try again.');
  }

  // No content responses (204 etc.)
  if (res.ok && (res.status === 204 || res.headers.get('content-length') === '0')) {
    return undefined as unknown as T;
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    if (res.status === 401 && token && typeof window !== 'undefined') {
      clearSession();
      window.dispatchEvent(new Event('nova-auth-invalidated'));
    }
    const errorBody = body as { message?: string; error?: string; errors?: Record<string, string> } | null;
    const message = errorBody?.message ?? errorBody?.error ?? httpStatusMessage(res.status);
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

  googleLogin: (credential: string) =>
    apiFetch<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),

  register: (data: RegisterRequest) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

};
// ─── Rooms API ────────────────────────────────────────────────────────────────

function toBackendRoomPayload(data: Partial<CreateRoomRequest>) {
  return {
    name:          data.name,
    roomNumber:    data.roomNumber,
    roomType:      data.roomType ?? data.type,
    description:   data.description,
    pricePerNight: data.pricePerNight,
    maxGuests:     data.maxGuests,
    amenities:     data.amenities,
    imageUrl:      data.imageUrl,
    floorNumber:   data.floorNumber,
    size:          data.size,
    status:        data.status,
  };
}
export const roomsApi = {
  getAll: () => apiFetch<Room[]>('/api/rooms'),
  getById: (id: number) => apiFetch<Room>(`/api/rooms/${id}`),
  getAvailable: (checkInDate: string, checkOutDate: string) => apiFetch<Room[]>(`/api/rooms/available?${new URLSearchParams({checkInDate, checkOutDate})}`),

  create: (data: CreateRoomRequest) =>
    apiFetch<Room>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(toBackendRoomPayload({ ...data, status: data.status ?? 'AVAILABLE' })),
    }),

  update: (id: number, data: Partial<CreateRoomRequest>) =>
    apiFetch<Room>(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toBackendRoomPayload(data)),
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

  getMine: () =>
    apiFetch<Booking[]>('/api/bookings/my'),

  getAll: () =>
    apiFetch<Booking[]>('/api/bookings'),

  getById: (id: number) =>
    apiFetch<Booking>(`/api/bookings/${id}`),

  update: (id: number, data: UpdateBookingRequest) =>
    apiFetch<Booking>(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

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
export const customersApi = {
  getAll: () =>
    apiFetch<Customer[]>('/api/customers'),

  getById: (id: number) =>
    apiFetch<Customer>(`/api/customers/${id}`),

  update: (id: number, data: UpdateCustomerRequest) =>
    apiFetch<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};









export type InquiryStatus = 'NEW' | 'HANDLED';
export type InquiryType = 'CALL' | 'FORM';
export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: InquiryStatus;
  type?: InquiryType;
  createdAt: string;
}
export interface CallRequest {
  name: string;
  phone?: string;
  subject: string;
  message: string;
}
export const contactApi = {
  send: (data: Omit<Inquiry, 'id' | 'createdAt' | 'status' | 'type'>) =>
    apiFetch<Inquiry>('/api/contact', { method: 'POST', body: JSON.stringify(data) }),
  list: () => apiFetch<Inquiry[]>('/api/contact'),
  logCall: (data: CallRequest) =>
    apiFetch<Inquiry>('/api/contact/call', { method: 'POST', body: JSON.stringify(data) }),
  markHandled: (id: number) =>
    apiFetch<Inquiry>(`/api/contact/${id}/handled`, { method: 'PATCH' }),
};

export interface StaffPolicy {
  canAnswerCalls: boolean;
  canViewGuests: boolean;
  canCheckIn: boolean;
  canEditBookings: boolean;
  canTakePayments: boolean;
}
export const staffApi = {
  getPolicy: () => apiFetch<StaffPolicy>('/api/admin/staff-permissions'),
  updatePolicy: (data: StaffPolicy) =>
    apiFetch<StaffPolicy>('/api/admin/staff-permissions', { method: 'PUT', body: JSON.stringify(data) }),
};
