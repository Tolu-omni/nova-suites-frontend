'use client';

import { useEffect, useState } from 'react';
import { staffApi } from '@/lib/api';
import type { StaffPolicy } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useToast } from '@/components/admin/ToastProvider';

const PERMISSIONS: { key: keyof StaffPolicy; label: string }[] = [
  { key: 'canAnswerCalls', label: 'Answer calls / inbox' },
  { key: 'canViewGuests', label: 'Guest phone lookup' },
  { key: 'canCheckIn', label: 'Check in / out' },
  { key: 'canEditBookings', label: 'Edit bookings' },
  { key: 'canTakePayments', label: 'Take payments' },
];

export default function StaffPermissionsPage() {
  const { notify } = useToast();
  const [policy, setPolicy] = useState<StaffPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    staffApi.getPolicy()
      .then(setPolicy)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: keyof StaffPolicy) => {
    if (!policy) return;
    const updated = { ...policy, [key]: !policy[key] };
    setPolicy(updated);
    setSaving(true);
    setError(null);
    try {
      const saved = await staffApi.updatePolicy(updated);
      setPolicy(saved);
      notify('Staff permissions updated.');
    } catch (err) {
      setError(getErrorMessage(err));
      setPolicy(policy);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff & Permissions"
      />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading || !policy ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : (
        <div className="admin-card overflow-hidden">
          <ul className="divide-y divide-[var(--nova-border-light)]">
            {PERMISSIONS.map(item => {
              const enabled = policy[item.key];
              return (
                <li key={item.key} className="flex items-center justify-between gap-6 p-5">
                  <div>
                    <p className="font-medium text-[var(--nova-text-dark)]">{item.label}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={item.label}
                    disabled={saving}
                    onClick={() => toggle(item.key)}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                      enabled ? 'bg-[var(--nova-gold)]' : 'bg-[var(--nova-border-light)]'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
