'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarCheck, CheckCircle, Clock, Mail, XCircle } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>(reference ? 'loading' : 'error');
  const [error, setError] = useState<string | null>(reference ? null : 'No payment reference found.');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(`/payment/verify?${searchParams.toString()}`)}`);
      return;
    }
    if (!reference) return;
    paymentsApi.verify(reference)
      .then(res => {
        const payStatus = res.data?.status || res.paymentStatus;
        if (['success', 'SUCCESS', 'SUCCESSFUL'].includes(payStatus ?? '')) setStatus('success');
        else { setError('Payment is not confirmed yet. Check My Bookings and retry verification; do not pay again while the status is uncertain.'); setStatus('error'); }
      })
      .catch(err => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, [authLoading, isAuthenticated, reference, router, searchParams]);

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--nova-ivory)] px-5 pt-28 text-[var(--nova-text-dark)] sm:pt-32">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div>
            <LoadingSpinner size="lg" className="mb-6" />
            <h1 className="font-serif text-2xl">Verifying Payment</h1>
            <p className="mt-2 text-sm text-[var(--nova-text-muted)]">
              Please wait while we confirm your payment with Paystack…
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto mb-6 flex h-24 w-24 animate-fade-in items-center justify-center rounded-full border-2 border-green-300 bg-green-100">
              <CheckCircle size={48} className="text-green-700" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-3xl">Payment Successful!</h1>
            <p className="mt-3 text-sm text-[var(--nova-text-muted)]">Your reservation at Nova Suites is confirmed.</p>
            {reference && (
              <p className="mt-2 text-xs text-[var(--nova-text-muted)]">
                Reference: <span className="font-mono text-[var(--nova-text-dark)]">{reference}</span>
              </p>
            )}

            <ul className="nova-card mt-8 space-y-3 p-5 text-left text-sm">
              <li className="flex items-center gap-2.5">
                <CheckCircle size={15} className="shrink-0 text-green-700" aria-hidden="true" /> Payment confirmed
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-green-700" aria-hidden="true" /> View your confirmation in My Bookings
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={15} className="shrink-0 text-[var(--nova-gold)]" aria-hidden="true" /> Check-in instructions to follow
              </li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/my-bookings">
                <Button variant="primary" size="lg" className="w-full">
                  <CalendarCheck size={18} /> View My Bookings
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="md" className="w-full">Return to Home</Button>
              </Link>
            </div>
          </div>
        )}

        {(status === 'failed' || status === 'error') && (
          <div>
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-300 bg-red-100">
              <XCircle size={48} className="text-red-700" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-3xl">
              {status === 'error' ? 'Verification Error' : 'Payment Failed'}
            </h1>
            <p className="mt-3 text-sm text-[var(--nova-text-muted)]">
              {status === 'error'
                ? error || 'We could not verify your payment.'
                : 'Payment was not confirmed. Contact reception if you need help with this reference.'}
            </p>
            {reference && (
              <p className="mt-2 text-xs text-[var(--nova-text-muted)]">
                Reference: <span className="font-mono text-[var(--nova-text-dark)]">{reference}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/my-bookings">
                <Button variant="primary" size="lg" className="w-full">View My Bookings</Button>
              </Link>
              <Link href="/rooms">
                <Button variant="outline" size="md" className="w-full">Browse Rooms</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
      <VerifyContent />
    </Suspense>
  );
}
