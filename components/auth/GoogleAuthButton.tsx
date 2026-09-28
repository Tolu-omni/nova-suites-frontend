'use client';

import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: string; size: string; width: string }
          ) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  onError: (message: string) => void;
  disabled?: boolean;
  redirectTo?: string | null;
}

let googleInitialized = false;
let googleCredentialHandler: ((credential?: string) => void) | null = null;

export default function GoogleAuthButton({ onError, disabled = false, redirectTo = null }: GoogleAuthButtonProps) {
  const router = useRouter();
  const { login } = useAuth();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const redirectForRole = useCallback((role?: string) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'STAFF') return '/staff';
    return redirectTo && redirectTo.startsWith('/') ? redirectTo : '/';
  }, [redirectTo]);

  const handleCredential = useCallback(async (credential?: string) => {
    if (!credential) {
      onError('Google did not return a credential.');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.googleLogin(credential);
      login(response);
      router.push(redirectForRole(response.role ?? response.user?.role));
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [login, onError, redirectForRole, router]);

  const renderButton = useCallback(() => {
    const parent = buttonRef.current;
    if (!window.google || !parent) return;
    const width = parent.clientWidth || 320;
    parent.innerHTML = '';
    window.google.accounts.id.renderButton(parent, {
      theme: 'outline',
      size: 'large',
      width: String(width),
    });
  }, []);

  const init = useCallback(() => {
    if (!googleClientId) {
      onError('Google login is not configured.');
      return;
    }
    if (!window.google) return;
    // Google Identity Services warns if initialize() runs more than once per page
    // load (React StrictMode, or navigating between auth pages), so initialise a
    // single time and route credentials through the latest mounted handler.
    googleCredentialHandler = credential => { void handleCredential(credential); };
    if (!googleInitialized) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: response => googleCredentialHandler?.(response.credential),
      });
      googleInitialized = true;
    }
    renderButton();
  }, [googleClientId, handleCredential, onError, renderButton]);

  useEffect(() => {
    init();
  }, [init]);

  // Keep the button full-width as the auth card resizes (mobile → desktop).
  useEffect(() => {
    const parent = buttonRef.current;
    if (!parent) return;
    const observer = new ResizeObserver(() => renderButton());
    observer.observe(parent);
    return () => observer.disconnect();
  }, [renderButton]);

  return (
    <div className={disabled || loading ? 'pointer-events-none opacity-60' : undefined} aria-busy={loading}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={init} />
      <div ref={buttonRef} className="flex min-h-11 w-full items-center justify-center" />
    </div>
  );
}
