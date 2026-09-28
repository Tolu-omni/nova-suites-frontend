'use client';

import { useState } from 'react';
import {contactApi} from '@/lib/api';
import {getErrorMessage} from '@/lib/utils';
import { Send } from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMPTY: FormState = { name: '', email: '', phone: '', subject: 'General enquiry', message: '' };

const SUBJECTS = ['General enquiry', 'Room reservation', 'Dining reservation', 'Events & meetings', 'Feedback'];

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(current => ({ ...current, [field]: event.target.value }));
    setErrors(current => ({ ...current, [field]: '' }));
    setSent(false);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.email.trim()) next.email = 'Please enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.message.trim()) next.message = 'Please tell us how we can help.';
    else if (form.message.trim().length < 10) next.message = 'Please add a little more detail.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try { await contactApi.send(form); setSent(true); setForm(EMPTY); } catch(e) { setErrors({server:getErrorMessage(e)}); } finally {setBusy(false);}
  };

  const fieldClass = (field: string) =>
    `w-full rounded-md border bg-white px-4 py-3 text-sm text-[var(--nova-text-dark)] transition placeholder:text-[var(--nova-taupe)] focus:border-[var(--nova-gold)] ${
      errors[field] ? 'border-red-500' : 'border-[var(--nova-border-light)]'
    }`;

  return (
    <form onSubmit={handleSubmit} className="nova-card space-y-5 p-7 sm:p-8" noValidate>
      <h2 className="nova-card-heading mb-2">Send Us a Message</h2>

      {errors.server && <p role="alert" className="text-sm text-red-700">{errors.server}</p>}
      {sent && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status" aria-live="polite">
          Thank you — your message has been received. Our team will get back to you shortly.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="nova-form-label mb-2 block">Full name</label>
          <input id="contact-name" value={form.name} onChange={update('name')} className={fieldClass('name')} placeholder="Alex Morgan" autoComplete="name" />
          {errors.name && <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="nova-form-label mb-2 block">Email address</label>
          <input id="contact-email" type="email" value={form.email} onChange={update('email')} className={fieldClass('email')} placeholder="you@example.com" autoComplete="email" />
          {errors.email && <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="nova-form-label mb-2 block">Phone <span className="font-normal text-[var(--nova-text-muted)]">(optional)</span></label>
          <input id="contact-phone" type="tel" value={form.phone} onChange={update('phone')} className={fieldClass('phone')} placeholder="+234 800 000 0000" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="contact-subject" className="nova-form-label mb-2 block">Subject</label>
          <select id="contact-subject" value={form.subject} onChange={update('subject')} className={fieldClass('subject')}>
            {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="nova-form-label mb-2 block">Message</label>
        <textarea id="contact-message" rows={5} value={form.message} onChange={update('message')} className={`${fieldClass('message')} resize-none`} placeholder="How can we help you?" />
        {errors.message && <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">{errors.message}</p>}
      </div>

      <button
        type="submit" disabled={busy}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--nova-espresso)] px-7 text-sm font-semibold text-[var(--nova-text-light)] transition hover:bg-[var(--nova-espresso-soft)] sm:w-auto"
      >
        <Send size={16} /> {busy ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
