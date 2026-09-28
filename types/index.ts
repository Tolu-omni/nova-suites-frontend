// ─── TypeScript Interfaces for Nova Suites ───────────────────────────────────

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user?: User;
  // Some Spring Boot JWT responses include these fields directly
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// ─── Room Types ───────────────────────────────────────────────────────────────

export type RoomType = 'SINGLE' | 'DOUBLE' | 'DELUXE' | 'SUITE';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Room {
  id: number;
  name: string;
  roomNumber: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  status: RoomStatus;
  amenities?: string[];
  imageUrl?: string;
  floorNumber?: number;
  size?: number; // sqm
}

export interface CreateRoomRequest {
  name?: string;
  roomNumber: string;
  roomType?: RoomType;
  type?: RoomType;
  description: string;
  pricePerNight: number;
  maxGuests?: number;
  amenities?: string[];
  imageUrl?: string;
  floorNumber?: number;
  size?: number;
  status?: RoomStatus;
}

// ─── Booking Types ────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface Booking {
  id: number;
  room: Room;
  customer: User;
  checkInDate: string;   // ISO date string YYYY-MM-DD
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt?: string;
  updatedAt?: string;
  holdExpiresAt?: string;
}

export interface CreateBookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests?: string;
}

export interface UpdateBookingRequest {
  roomId?: number;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  status?: BookingStatus;
  specialRequests?: string;
}

// ─── Payment Types ────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH';

export interface Payment {
  id: number;
  booking: Booking;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionReference?: string;
  paidAt?: string;
  createdAt?: string;
}

export interface CreatePaymentRequest {
  bookingId: number;
  paymentMethod?: PaymentMethod;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  // Some backends return these at the top level
  authorization_url?: string;
  transactionReference?: string;
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    paid_at?: string;
  };
  paymentStatus?: PaymentStatus;
}

// ─── Customer Types ───────────────────────────────────────────────────────────

export interface Customer {
  id: number; firstName: string; lastName: string; email: string;
  phoneNumber?: string; address?: string;
}
export interface UpdateCustomerRequest {
  firstName?: string; lastName?: string; phoneNumber?: string; address?: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ─── UI / Form State ──────────────────────────────────────────────────────────

export interface AvailabilitySearch {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
}

export interface BookingFormState {
  roomId: number | null;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests: string;
}
