'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import type { SortState } from '@/hooks/useDataTable';

interface SortHeaderProps {
  label: string;
  sortKey: string;
  sort: SortState;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function SortHeader({ label, sortKey, sort, onSort, align = 'left', className = '' }: SortHeaderProps) {
  const active = sort.key === sortKey;
  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th
      scope="col"
      className={className}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex w-full items-center gap-1 transition hover:text-[var(--nova-gold)] ${alignClass} ${
          active ? 'text-[var(--nova-gold)]' : ''
        }`}
      >
        {label}
        {active
          ? (sort.dir === 'asc' ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />)
          : <ChevronsUpDown size={13} className="opacity-50" aria-hidden="true" />}
      </button>
    </th>
  );
}
