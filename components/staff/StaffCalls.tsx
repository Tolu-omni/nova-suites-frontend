'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, MessageSquare, Phone, Search } from 'lucide-react';
import { contactApi, customersApi } from '@/lib/api';
import type { Inquiry } from '@/lib/api';
import type { Customer } from '@/types';
import { formatDateTime, getErrorMessage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/components/admin/ToastProvider';

const typeLabel = (type?: string) => (type === 'CALL' ? 'Call' : 'Form');

export default function StaffCalls() {
  const { notify } = useToast();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [guests, setGuests] = useState<Customer[]>([]);
  const [guestQuery, setGuestQuery] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    contactApi.list()
      .then(setInquiries)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    customersApi.getAll().then(setGuests).catch(() => {});
  }, []);

  const markHandled = async (id: number) => {
    setBusyId(id);
    try {
      await contactApi.markHandled(id);
      notify('Marked as handled.');
      load();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const logCall = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setFormError('Caller name and a note are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await contactApi.logCall({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || 'Phone call',
        message: form.message.trim(),
      });
      notify('Call logged.');
      setOpen(false);
      setForm({ name: '', phone: '', subject: '', message: '' });
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const filteredGuests = guestQuery.trim()
    ? guests.filter(guest =>
        [guest.firstName, guest.lastName, guest.email, guest.phoneNumber]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(guestQuery.trim().toLowerCase()))
      )
    : guests;

  const newCount = inquiries.filter(inquiry => inquiry.status !== 'HANDLED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[var(--nova-text-dark)]">Calls &amp; Inbox</h2>
          <p className="mt-1 text-sm text-[var(--nova-text-muted)]">
            {newCount} open · {inquiries.length} total
          </p>
        </div>
        <Button variant="primary" onClick={() => { setOpen(true); setFormError(null); }}>
          <Phone size={16} /> Log a call
        </Button>
      </div>

      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}

      {loading ? (
        <p role="status" className="text-[var(--nova-text-muted)]">Loading inbox…</p>
      ) : inquiries.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-[var(--nova-text-muted)]">
          No messages or calls yet.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inquiry => (
                <tr key={inquiry.id}>
                  <td>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--nova-brown-muted)]">
                      {inquiry.type === 'CALL' ? <Phone size={12} /> : <MessageSquare size={12} />}
                      {typeLabel(inquiry.type)}
                    </span>
                  </td>
                  <td>
                    <p className="font-medium text-[var(--nova-text-dark)]">{inquiry.name}</p>
                    {inquiry.phone && <p className="text-xs text-[var(--nova-text-muted)]">{inquiry.phone}</p>}
                  </td>
                  <td className="text-[var(--nova-text-muted)]">{inquiry.subject}</td>
                  <td className="max-w-xs whitespace-pre-wrap text-[var(--nova-text-muted)]">
                    {inquiry.message}
                  </td>
                  <td>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      inquiry.status === 'HANDLED'
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : 'border-amber-300 bg-amber-50 text-amber-800'
                    }`}>
                      {inquiry.status === 'HANDLED' ? 'Handled' : 'New'}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end">
                      {inquiry.status !== 'HANDLED' && (
                        <Button size="sm" variant="secondary" isLoading={busyId === inquiry.id} onClick={() => markHandled(inquiry.id)}>
                          <CheckCircle2 size={14} /> Handled
                        </Button>
                      )}
                      {inquiry.status === 'HANDLED' && (
                        <span className="text-xs text-[var(--nova-text-muted)]">{inquiry.createdAt ? formatDateTime(inquiry.createdAt) : ''}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-card p-6">
        <h3 className="mb-1 font-serif text-xl text-[var(--nova-text-dark)]">Guest directory</h3>
        <label className="relative block max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nova-taupe)]" aria-hidden="true" />
          <span className="sr-only">Search guests</span>
          <input
            value={guestQuery}
            onChange={event => setGuestQuery(event.target.value)}
            placeholder="Search by name, email or phone"
            className="admin-input pl-10"
          />
        </label>
        {guestQuery.trim() && (
          <ul className="mt-4 space-y-2">
            {filteredGuests.slice(0, 10).map(guest => (
              <li key={guest.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nova-border-light)] pb-2 text-sm">
                <span className="font-medium text-[var(--nova-text-dark)]">
                  {guest.firstName} {guest.lastName}
                  <span className="ml-2 text-xs text-[var(--nova-text-muted)]">{guest.email}</span>
                </span>
                {guest.phoneNumber && (
                  <a href={`tel:${guest.phoneNumber}`} className="inline-flex items-center gap-1.5 font-semibold text-[var(--nova-gold)] hover:underline">
                    <Phone size={13} aria-hidden="true" /> {guest.phoneNumber}
                  </a>
                )}
              </li>
            ))}
            {filteredGuests.length === 0 && <li className="text-sm text-[var(--nova-text-muted)]">No guests match.</li>}
          </ul>
        )}
      </div>

      {open && (
        <Modal
          title="Log a call"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={logCall} isLoading={saving} className="flex-1">Save call</Button>
            </>
          }
        >
          <form onSubmit={logCall} className="space-y-4">
            {formError && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
            <Input id="call-name" label="Caller name" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required />
            <Input id="call-phone" type="tel" label="Phone (optional)" value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} />
            <Input id="call-subject" label="Subject" value={form.subject} onChange={event => setForm(current => ({ ...current, subject: event.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="call-message" className="nova-form-label">Note</label>
              <textarea id="call-message" rows={3} value={form.message} onChange={event => setForm(current => ({ ...current, message: event.target.value }))} className="admin-input resize-none" required />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
