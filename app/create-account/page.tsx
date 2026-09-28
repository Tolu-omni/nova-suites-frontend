'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import AuthInput from '@/components/auth/AuthInput';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import PasswordInput from '@/components/auth/PasswordInput';
import NovaLogo from '@/components/brand/NovaLogo';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

const suiteImage = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=90&auto=format&fit=crop';

export default function CreateAccountPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'acceptedTerms' ? event.target.checked : event.target.value;
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: '' }));
    setError(null);
    setNotice(null);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    else if (form.fullName.trim().split(/\s+/).length < 2) nextErrors.fullName = 'Enter your first and last name.';
    if (!form.email.trim()) nextErrors.email = 'Email address is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!/^(\+?[1-9]\d{6,14}|0[789][01]\d{8})$/.test(form.phone.replace(/[\s()-]/g, ''))) {
      nextErrors.phone = 'Enter a valid Nigerian or international phone number.';
    }
    if (form.password.length < 8) nextErrors.password = 'Password must be at least eight characters.';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    if (!form.acceptedTerms) nextErrors.acceptedTerms = 'You must agree to the Terms and Privacy Policy.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const splitName = () => {
    const parts = form.fullName.trim().split(/\s+/);
    const firstName = parts.shift() ?? '';
    return { firstName, lastName: parts.join(' ') || firstName };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { firstName, lastName } = splitName();
      await authApi.register({
        firstName,
        lastName,
        email: form.email,
        password: form.password,
      });
      const response = await authApi.login({ email: form.email, password: form.password });
      login(response);
      setNotice('Account created successfully. Welcome to Nova Suite.');
      const target = new URLSearchParams(window.location.search).get('redirect');
      router.push(target?.startsWith('/') && !target.startsWith('//') && !target.includes('\\') ? target : '/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      imageUrl={suiteImage}
      title="Extraordinary Stays for a Brighter You"
      eyebrow="People places possibilities"
      footer="Same incredible world. A brighter you."
      reverse
    >
      <AuthBrand />
      <div className="mb-7 text-center">
        <h2 className="font-serif text-4xl leading-tight text-[#1C1713] sm:text-5xl">Create Your Account</h2>
        <p className="mt-2 text-base font-medium text-[#4F4338]">Begin your Nova Suite experience</p>
      </div>

      <StatusMessage error={error} notice={notice} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthInput
          id="create-full-name"
          label="Full name"
          placeholder="Alex Morgan"
          value={form.fullName}
          onChange={updateField('fullName')}
          error={errors.fullName}
          autoComplete="name"
          disabled={loading}
          required
        />
        <AuthInput
          id="create-email"
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
          id="create-password"
          label="Password"
          placeholder="Create a secure password"
          value={form.password}
          onChange={updateField('password')}
          error={errors.password}
          autoComplete="new-password"
          shown={showPassword}
          onToggle={() => setShowPassword(value => !value)}
          disabled={loading}
          required
        />
        <PasswordInput
          id="create-confirm-password"
          label="Confirm password"
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={updateField('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
          shown={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(value => !value)}
          disabled={loading}
          required
        />

        <div className="space-y-1">
          <label className="flex items-start gap-3 text-sm text-[#4F4338]">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={updateField('acceptedTerms')}
              className="mt-0.5 h-5 w-5 rounded border-[#DDD1C1] text-[#27180F] focus:ring-[#B89255]"
              aria-describedby={errors.acceptedTerms ? 'terms-error' : undefined}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms-of-service" className="font-medium underline underline-offset-4 hover:text-[#B89255]">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy-policy" className="font-medium underline underline-offset-4 hover:text-[#B89255]">Privacy Policy</Link>
            </span>
          </label>
          {errors.acceptedTerms && <p id="terms-error" className="text-sm font-medium text-red-700" role="alert">{errors.acceptedTerms}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex h-13 w-full items-center justify-center gap-3 rounded-md bg-[#27180F] px-5 text-base font-semibold text-[#F7F1E7] shadow-lg shadow-[#27180F]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3A2417] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:hover:translate-y-0"
        >
          {loading ? 'Creating account...' : 'Create Account'}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
        </button>
      </form>

      <AuthDivider />
      <GoogleAuthButton onError={setError} disabled={loading} />

      <p className="mt-5 text-center text-sm text-[#3E342C]">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-[#6D4A27] underline underline-offset-4 hover:text-[#B89255]">
          Sign in
        </Link>
      </p>
      <AuthFooterText text="Same incredible world. A brighter you." />
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
    <div className="my-5 flex items-center gap-4 text-sm text-[#76695C]">
      <div className="h-px flex-1 bg-[#DDD1C1]" />
      <span>Or continue with</span>
      <div className="h-px flex-1 bg-[#DDD1C1]" />
    </div>
  );
}

function AuthFooterText({ text }: { text: string }) {
  return (
    <div className="mt-7 text-center">
      <div className="mx-auto mb-5 h-px w-8 bg-[#B89255]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-[#8A7D6E]">{text}</p>
    </div>
  );
}
