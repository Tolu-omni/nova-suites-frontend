'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  total: number;
  pageSize: number;
  label?: string;
}

function pageWindow(page: number, pageCount: number): number[] {
  const span = 5;
  let start = Math.max(1, page - Math.floor(span / 2));
  const end = Math.min(pageCount, start + span - 1);
  start = Math.max(1, Math.min(start, end - span + 1));
  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

export default function Pagination({ page, pageCount, onChange, total, pageSize, label = 'items' }: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--nova-border-light)] px-4 py-3 text-sm">
      <p className="text-[var(--nova-text-muted)]">
        Showing <strong className="font-semibold text-[var(--nova-text-dark)]">{start}–{end}</strong> of {total} {label}
      </p>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--nova-border-light)] text-[var(--nova-brown-muted)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--nova-border-light)] disabled:hover:text-[var(--nova-brown-muted)]"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {pageWindow(page, pageCount).map(pageNumber => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onChange(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold transition ${
                pageNumber === page
                  ? 'border-[var(--nova-gold)] bg-[var(--nova-gold)] text-[var(--nova-espresso)]'
                  : 'border-[var(--nova-border-light)] text-[var(--nova-brown-muted)] hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold)]'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page >= pageCount}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--nova-border-light)] text-[var(--nova-brown-muted)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--nova-border-light)] disabled:hover:text-[var(--nova-brown-muted)]"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
