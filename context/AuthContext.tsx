'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import type { AuthResponse, User, UserRole } from '@/types';
import {
  clearSession,
  getStoredUser,
  getToken,
  isTokenExpired,
  setStoredUser,
  setToken,
} from '@/lib/auth';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'CLEAR_USER':
      return { user: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login:   (response: AuthResponse) => void;
  logout:  () => void;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();

    if (token && storedUser && !isTokenExpired(token)) {
      dispatch({ type: 'SET_USER', payload: storedUser });
    } else {
      clearSession();
      dispatch({ type: 'CLEAR_USER' });
    }
    const invalidate = () => dispatch({ type: 'CLEAR_USER' });
    window.addEventListener('nova-auth-invalidated', invalidate);
    return () => window.removeEventListener('nova-auth-invalidated', invalidate);
  }, []);

  const login = useCallback((response: AuthResponse) => {
    // Handle both wrapped { token, user } and flat { token, id, email, role, ... } responses
    const token = response.token;
    const user: User = response.user ?? {
      id:        response.id!,
      firstName: response.firstName!,
      lastName:  response.lastName!,
      email:     response.email!,
      role:      response.role!,
    };

    setToken(token);
    setStoredUser(user);
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    dispatch({ type: 'CLEAR_USER' });
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => state.user?.role === role,
    [state.user]
  );

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    hasRole,
    isAdmin:    state.user?.role === 'ADMIN',
    isStaff:    state.user?.role === 'STAFF',
    isCustomer: state.user?.role === 'CUSTOMER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
