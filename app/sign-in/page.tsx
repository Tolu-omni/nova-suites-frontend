'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Suspense, useState } from 'react';
import AuthInput from '@/components/auth/AuthInput';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import PasswordInput from '@/components/auth/PasswordInput';
import NovaLogo from '@/components/brand/NovaLogo';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

const roomImage = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=90&auto=format&fit=crop';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectForRole = (role?: string) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'STAFF') return '/staff';
    return redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') && !redirectTo.includes('\\') ? redirectTo : '/';
  };

  const updateField = (field: 'email' | 'password') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(current => ({ ...current, [field]: event.target.value }));
    setErrors(current => ({ ...current, [field]: '' }));
    setError(null);
    setNotice(null);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.email.trim()) nextErrors.email = 'Email address is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await authApi.login({ email: form.email, password: form.password });
      login(response);
      setNotice('Signed in successfully. Taking you to Nova Suite.');
      router.push(redirectForRole(response.role ?? response.user?.role));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      imageUrl={roomImage}
      title="More Than a Stay"
      eyebrow="A brighter kind of away"
      footer="Exceptional stays. Brighter tomorrows."
    >
      <AuthBrand />
      <div className="mb-9 text-center">
        <h2 className="font-serif text-4xl leading-tight text-[#1C1713] sm:text-5xl">Welcome Back</h2>
        <p className="mt-2 text-base font-medium text-[#4F4338]">Sign in to continue your stay</p>
      </div>

      <StatusMessage error={error} notice={notice} />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthInput
          id="sign-in-email"
          label="Email address"
          type="email"
          placeholder="you@novasuite.com"
          value={form.email}
          onChange={updateField('email')}
          error={errors.email}
          autoComplete="email"
          disabled={loading}
          required
        />
        <PasswordInput
          id="sign-in-password"
          label="Password"
          placeholder="Enter your password"
          value={form.password}
          onChange={updateField('password')}
          error={errors.password}
          autoComplete="current-password"
          shown={showPassword}
          onToggle={() => setShowPassword(value => !value)}
          disabled={loading}
          required
        />

        <div className="flex items-center justify-between gap-4 text-sm text-[#4F4338]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={event => setForm(current => ({ ...current, remember: event.target.checked }))}
              className="h-5 w-5 rounded border-[#DDD1C1] text-[#27180F] focus:ring-[#B89255]"
            />
            Remember me
          </label>
          <Link href="/contact" className="font-medium underline underline-offset-4 hover:text-[#B89255]">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex h-13 w-full items-center justify-center gap-3 rounded-md bg-[#27180F] px-5 text-base font-semibold text-[#F7F1E7] shadow-lg shadow-[#27180F]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3A2417] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:hover:translate-y-0"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
        </button>
      </form>

      <AuthDivider />
      <GoogleAuthButton onError={setError} disabled={loading} redirectTo={redirectTo} />

      <p className="mt-7 text-center text-sm text-[#3E342C]">
        New to Nova Suite?{' '}
        <Link href={`/auth/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="font-semibold text-[#6D4A27] underline underline-offset-4 hover:text-[#B89255]">
          Create account
        </Link>
      </p>
      <AuthFooterText text="Beautiful places. A kinder tomorrow." />
    </AuthLayout>
  );
}

function AuthBrand() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <NovaLogo variant="dark" size="md" />
      <div className="mt-5 h-px w-10 bg-[#B89255]" />
    </div>
  );
}

function StatusMessage({ error, notice }: { error: string | null; notice: string | null }) {
  if (!error && !notice) return null;
  return (
    <div
      className={`mb-5 rounded-md border px-4 py-3 text-sm ${
        error ? 'border-red-300 bg-red-50 text-red-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
      }`}
      role="status"
      aria-live="polite"
    >
      {error ?? notice}
    </div>
  );
}

function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-[#76695C]">
      <div className="h-px flex-1 bg-[#DDD1C1]" />
      <span>Or continue with</span>
      <div className="h-px flex-1 bg-[#DDD1C1]" />
    </div>
  );
}

function AuthFooterText({ text }: { text: string }) {
  return (
    <div className="mt-8 text-center">
      <div className="mx-auto mb-5 h-px w-8 bg-[#B89255]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-[#8A7D6E]">{text}</p>
    </div>
  );
}




export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
