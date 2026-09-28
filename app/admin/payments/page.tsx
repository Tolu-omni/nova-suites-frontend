'use client';

import { useEffect, useMemo, useState } from 'react';
import { Banknote, CheckCircle2, Download, Clock, Copy, Search, TrendingUp } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getErrorMessage, paymentStatusColor } from '@/lib/utils';
import { downloadCsv } from '@/lib/csv';
import { useDataTable } from '@/hooks/useDataTable';
import type { Payment, PaymentStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage, { EmptyState } from '@/components/ui/ErrorMessage';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import SortHeader from '@/components/admin/SortHeader';
import StatCard from '@/components/admin/StatCard';
import { useToast } from '@/components/admin/ToastProvider';

const STATUSES: PaymentStatus[] = ['PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED'];

const statusText = (status: PaymentStatus) => status.charAt(0) + status.slice(1).toLowerCase();

const matchesPayment = (payment: Payment, query: string) =>
  [
    String(payment.id),
    String(payment.booking?.id ?? ''),
    payment.transactionReference,
    payment.paymentMethod,
    payment.status,
  ]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(query));

const comparePayment = (a: Payment, b: Payment, key: string) => {
  switch (key) {
    case 'amount': return (a.amount ?? 0) - (b.amount ?? 0);
    case 'status': return a.status.localeCompare(b.status);
    case 'date': return (a.paidAt ?? a.createdAt ?? '').localeCompare(b.paidAt ?? b.createdAt ?? '');
    default: return a.id - b.id;
  }
};

export default function AdminPaymentsPage() {
  const { notify } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [workingId, setWorkingId] = useState<number | null>(null);

  useEffect(() => {
    paymentsApi.getAll()
      .then(setPayments)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const statusRows = useMemo(
    () => (statusFilter ? payments.filter(payment => payment.status === statusFilter) : payments),
    [payments, statusFilter]
  );

  const table = useDataTable<Payment>({
    rows: statusRows,
    matches: matchesPayment,
    compare: comparePayment,
    initialSort: { key: 'date', dir: 'desc' },
  });

  const markSuccessful = async (payment: Payment) => {
    setWorkingId(payment.id);
    try {
      if (payment.paymentMethod !== 'CASH') {
        if (!payment.transactionReference) throw new Error('Missing provider reference.');
        await paymentsApi.verify(payment.transactionReference);
        setPayments(await paymentsApi.getAll());
        notify('Provider status refreshed.');
        return;
      }
      const updated = await paymentsApi.markSuccess(payment.id);
      setPayments(current => current.map(item => item.id === updated.id ? updated : item));
      notify(`Payment #${payment.id} marked as successful.`);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setWorkingId(null);
    }
  };

  const copyReference = async (payment: Payment) => {
    const reference = payment.transactionReference;
    if (!reference) {
      notify('This payment has no reference to copy.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(reference);
      notify('Reference copied to clipboard.');
    } catch {
      notify('Could not copy to clipboard.', 'error');
    }
  };

  const successful = payments.filter(payment => payment.status === 'SUCCESSFUL');
  const pending = payments.filter(payment => payment.status === 'PENDING');
  const revenue = successful.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
  const average = successful.length ? Math.round(revenue / successful.length) : 0;

  const exportCsv = () => {
    downloadCsv(
      'nova-payments.csv',
      ['ID', 'Booking', 'Amount (NGN)', 'Method', 'Status', 'Reference', 'Date'],
      table.exportRows.map(payment => [
        payment.id,
        payment.booking?.id ?? '',
        payment.amount ?? 0,
        payment.paymentMethod ?? 'CARD',
        payment.status,
        payment.transactionReference ?? '',
        payment.paidAt ?? payment.createdAt ?? '',
      ])
    );
    notify(`Exported ${table.exportRows.length} payment${table.exportRows.length === 1 ? '' : 's'}.`);
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        actions={
          <Button variant="secondary" onClick={exportCsv} disabled={table.rows.length === 0}>
            <Download size={16} /> Export
          </Button>
        }
      />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(revenue)} icon={Banknote} hint={`${successful.length} successful`} />
            <StatCard label="Pending" value={formatCurrency(pending.reduce((sum, payment) => sum + (payment.amount ?? 0), 0))} icon={Clock} hint={`${pending.length} awaiting payment`} />
            <StatCard label="Average Payment" value={formatCurrency(average)} icon={TrendingUp} hint="per successful transaction" />
          </div>

          {payments.length > 0 && (
            <div className="mb-6 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nova-taupe)]" aria-hidden="true" />
                <span className="sr-only">Search payments</span>
                <input
                  value={table.query}
                  onChange={event => table.setQuery(event.target.value)}
                  placeholder="Search by reference, booking or method"
                  className="admin-input pl-10"
                />
              </label>
              <select
                value={statusFilter}
                onChange={event => { setStatusFilter(event.target.value as PaymentStatus | ''); table.setPage(1); }}
                className="admin-input sm:max-w-52"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {STATUSES.map(status => <option key={status} value={status}>{statusText(status)}</option>)}
              </select>
            </div>
          )}

          {payments.length === 0 ? (
            <div className="mt-8">
              <EmptyState title="No payments yet" description="Transactions will appear here once guests pay for their bookings." />
            </div>
          ) : table.filteredCount === 0 ? (
            <EmptyState title="No payments match" description="Try a different search term or status." />
          ) : (
            <div className="admin-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <SortHeader label="Ref" sortKey="id" sort={table.sort} onSort={table.toggleSort} />
                      <th>Booking</th>
                      <SortHeader label="Amount" sortKey="amount" sort={table.sort} onSort={table.toggleSort} align="right" />
                      <th>Method</th>
                      <SortHeader label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                      <th>Reference</th>
                      <SortHeader label="Date" sortKey="date" sort={table.sort} onSort={table.toggleSort} />
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map(payment => (
                      <tr key={payment.id}>
                        <td className="font-mono tabular-nums text-[var(--nova-brown-muted)]">#{payment.id}</td>
                        <td className="tabular-nums text-[var(--nova-text-muted)]">#{payment.booking?.id ?? '—'}</td>
                        <td className="text-right font-semibold tabular-nums">{formatCurrency(payment.amount)}</td>
                        <td className="text-[var(--nova-text-muted)]">{payment.paymentMethod ?? 'CARD'}</td>
                        <td><Badge className={paymentStatusColor(payment.status)}>{statusText(payment.status)}</Badge></td>
                        <td className="font-mono text-xs text-[var(--nova-text-muted)]">{payment.transactionReference || '—'}</td>
                        <td className="whitespace-nowrap text-[var(--nova-text-muted)]">{formatDateTime(payment.paidAt ?? payment.createdAt)}</td>
                        <td>
                          <div className="flex flex-wrap justify-end gap-2">
                            {payment.status === 'PENDING' && (
                              <Button size="sm" variant="primary" isLoading={workingId === payment.id} onClick={() => markSuccessful(payment)}>
                                <CheckCircle2 size={14} /> {payment.paymentMethod === 'CASH' ? 'Record Cash' : 'Verify'}
                              </Button>
                            )}
                            {payment.transactionReference && (
                              <button
                                type="button"
                                onClick={() => copyReference(payment)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--nova-border-light)] text-[var(--nova-brown-muted)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold)]"
                                aria-label={`Copy reference for payment ${payment.id}`}
                              >
                                <Copy size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={table.page}
                pageCount={table.pageCount}
                onChange={table.setPage}
                total={table.filteredCount}
                pageSize={8}
                label="payments"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
