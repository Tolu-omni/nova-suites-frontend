'use client';

import { useMemo, useState } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortState {
  key: string;
  dir: SortDir;
}

interface UseDataTableOptions<T> {
  /** The full dataset. */
  rows: T[];
  /** Return true when a row matches the (already lowercased) search query. */
  matches: (row: T, query: string) => boolean;
  /** Stable comparison for a given sort key. */
  compare: (a: T, b: T, key: string) => number;
  initialSort: SortState;
  pageSize?: number;
}

/**
 * Search + sort + paginate a client-side dataset. Filtering and comparison logic
 * stay in the page (entity-specific); this owns the state machine.
 */
export function useDataTable<T>({
  rows,
  matches,
  compare,
  initialSort,
  pageSize = 8,
}: UseDataTableOptions<T>) {
  const [query, setQueryState] = useState('');
  const [sort, setSort] = useState<SortState>(initialSort);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? rows.filter(row => matches(row, needle)) : rows;
  }, [rows, query, matches]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => compare(a, b, sort.key) * (sort.dir === 'asc' ? 1 : -1));
    return copy;
  }, [filtered, sort, compare]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize]
  );

  const setQuery = (value: string) => {
    setQueryState(value);
    setPage(1);
  };

  const toggleSort = (key: string) => {
    setSort(current => (
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    ));
    setPage(1);
  };

  return {
    query,
    setQuery,
    sort,
    toggleSort,
    page: currentPage,
    setPage,
    pageCount,
    total: rows.length,
    filteredCount: sorted.length,
    rows: paged,
    exportRows: sorted,
  };
}
