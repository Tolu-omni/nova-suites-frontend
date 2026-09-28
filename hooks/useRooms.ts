'use client';

import { useCallback, useEffect, useState } from 'react';
import { roomsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { Room } from '@/types';

export function useRooms() {
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomsApi.getAll();
      setRooms(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchRooms);
  }, [fetchRooms]);

  return { rooms, loading, error, refetch: fetchRooms };
}

export function useAvailableRooms(
  checkInDate: string,
  checkOutDate: string,
  enabled = false
) {
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!checkInDate || !checkOutDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await roomsApi.getAvailable(checkInDate, checkOutDate);
      setRooms(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    if (enabled) Promise.resolve().then(search);
  }, [enabled, search]);

  return { rooms, loading, error, search };
}
