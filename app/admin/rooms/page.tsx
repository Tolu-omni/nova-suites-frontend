'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, Download, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { roomsApi } from '@/lib/api';
import { formatCurrency, roomTypeLabel, getErrorMessage } from '@/lib/utils';
import { downloadCsv } from '@/lib/csv';
import { getRoomImage, getRoomMaxGuests, getRoomName, getRoomType } from '@/lib/roomDisplay';
import type { CreateRoomRequest, Room, RoomStatus, RoomType } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage, { EmptyState } from '@/components/ui/ErrorMessage';
import PageHeader from '@/components/admin/PageHeader';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/components/admin/ToastProvider';

const ROOM_TYPES: RoomType[] = ['SINGLE', 'DOUBLE', 'DELUXE', 'SUITE'];
const ROOM_STATUSES: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];

type RoomSort = 'number' | 'price-asc' | 'price-desc' | 'status';

const EMPTY_FORM: CreateRoomRequest = {
  roomNumber: '',
  type: 'SINGLE',
  status: 'AVAILABLE',
  description: '',
  pricePerNight: 0,
};

const statusPill: Record<RoomStatus, string> = {
  AVAILABLE: 'border-green-300 bg-green-50 text-green-800',
  OCCUPIED: 'border-red-300 bg-red-50 text-red-800',
  MAINTENANCE: 'border-amber-300 bg-amber-50 text-amber-800',
};

const statusLabel = (status: RoomStatus) => status.charAt(0) + status.slice(1).toLowerCase();

export default function AdminRoomsPage() {
  const { notify } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RoomType | ''>('');
  const [sortMode, setSortMode] = useState<RoomSort>('number');

  const [modal, setModal] = useState<'none' | 'add' | 'edit' | 'delete'>('none');
  const [selected, setSelected] = useState<Room | null>(null);
  const [form, setForm] = useState<CreateRoomRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRooms = useCallback(() => {
    setLoading(true);
    roomsApi.getAll()
      .then(setRooms)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchRooms);
  }, [fetchRooms]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = rooms.filter(room => {
      if (typeFilter && getRoomType(room) !== typeFilter) return false;
      if (!needle) return true;
      return [room.roomNumber, room.name, getRoomName(room), getRoomType(room), room.description]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle));
    });

    result.sort((a, b) => {
      if (sortMode === 'price-asc') return (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0);
      if (sortMode === 'price-desc') return (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0);
      if (sortMode === 'status') return a.status.localeCompare(b.status);
      return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true });
    });

    return result;
  }, [rooms, query, typeFilter, sortMode]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal('add');
  };

  const openEdit = (room: Room) => {
    setSelected(room);
    setForm({
      roomNumber: room.roomNumber,
      type: getRoomType(room) as RoomType,
      status: room.status,
      description: room.description,
      pricePerNight: room.pricePerNight,
    });
    setFormError(null);
    setModal('edit');
  };

  const openDelete = (room: Room) => {
    setSelected(room);
    setFormError(null);
    setModal('delete');
  };

  const closeModal = () => {
    setModal('none');
    setSelected(null);
  };

  const update = (field: keyof CreateRoomRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(current => ({ ...current, [field]: event.target.value }));

  const handleSave = async () => {
    if (!form.roomNumber.trim()) {
      setFormError('A room number is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreateRoomRequest = { ...form, pricePerNight: Number(form.pricePerNight) };
      if (modal === 'add') await roomsApi.create(payload);
      if (modal === 'edit' && selected) await roomsApi.update(selected.id, payload);
      notify(modal === 'add' ? `Room ${payload.roomNumber} added.` : `Room ${payload.roomNumber} updated.`);
      closeModal();
      fetchRooms();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    setFormError(null);
    try {
      await roomsApi.delete(selected.id);
      notify(`Room ${selected.roomNumber} deleted.`);
      closeModal();
      fetchRooms();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    downloadCsv(
      'nova-rooms.csv',
      ['Room number', 'Name', 'Type', 'Status', 'Price per night (NGN)', 'Max guests', 'Description'],
      filtered.map(room => [
        room.roomNumber,
        getRoomName(room),
        getRoomType(room),
        room.status,
        room.pricePerNight ?? 0,
        getRoomMaxGuests(room),
        room.description ?? '',
      ])
    );
    notify(`Exported ${filtered.length} room${filtered.length === 1 ? '' : 's'}.`);
  };

  return (
    <div>
      <PageHeader
        title="Room Management"
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download size={16} /> Export
            </Button>
            <Button variant="primary" onClick={openAdd}>
              <Plus size={16} /> Add Room
            </Button>
          </>
        }
      />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {!loading && !error && rooms.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nova-taupe)]" aria-hidden="true" />
            <span className="sr-only">Search rooms</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search by room number, type or description"
              className="admin-input pl-10"
            />
          </label>
          <select
            value={typeFilter}
            onChange={event => setTypeFilter(event.target.value as RoomType | '')}
            className="admin-input sm:max-w-52"
            aria-label="Filter by room type"
          >
            <option value="">All room types</option>
            {ROOM_TYPES.map(type => <option key={type} value={type}>{roomTypeLabel(type)}</option>)}
          </select>
          <select
            value={sortMode}
            onChange={event => setSortMode(event.target.value as RoomSort)}
            className="admin-input sm:max-w-52"
            aria-label="Sort rooms"
          >
            <option value="number">Sort: Room number</option>
            <option value="price-asc">Sort: Price (low to high)</option>
            <option value="price-desc">Sort: Price (high to low)</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="No rooms yet"
          description="Add your first room to get started."
          action={<Button variant="primary" onClick={openAdd}><Plus size={16} /> Add Room</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No rooms match" description="Try a different search term or room type." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(room => {
            const roomName = getRoomName(room);
            const roomType = getRoomType(room);
            return (
              <article key={room.id} className="admin-card overflow-hidden">
                <div className="relative h-44">
                  <Image
                    src={getRoomImage(room)}
                    alt={roomName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 30vw"
                    className="object-cover"
                  />
                  <span className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold ${statusPill[room.status]}`}>
                    {statusLabel(room.status)}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg leading-tight text-[var(--nova-text-dark)]">{roomName}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--nova-brown-muted)]">
                        {roomTypeLabel(roomType as RoomType)} · Room {room.roomNumber}
                      </p>
                    </div>
                    <span className="shrink-0 text-right font-semibold text-[var(--nova-text-dark)]">
                      {formatCurrency(room.pricePerNight)}
                      <span className="block text-[10px] font-normal uppercase tracking-[0.12em] text-[var(--nova-text-muted)]">per night</span>
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-[40px] text-sm leading-6 text-[var(--nova-text-muted)]">
                    {room.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--nova-border-light)] pt-4">
                    <span className="text-xs text-[var(--nova-text-muted)]">Up to {getRoomMaxGuests(room)} guests</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(room)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--nova-border-light)] text-[var(--nova-brown-muted)] transition hover:border-[var(--nova-gold)] hover:text-[var(--nova-gold)]"
                        aria-label={`Edit ${roomName}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(room)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--nova-border-light)] text-[var(--nova-brown-muted)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Delete ${roomName}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Add New Room' : `Edit Room ${selected?.roomNumber ?? ''}`}
          onClose={closeModal}
          footer={
            <>
              <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">
                <Save size={16} /> {modal === 'add' ? 'Add Room' : 'Save Changes'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {formError && <ErrorMessage message={formError} />}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="room-number" label="Room Number" value={form.roomNumber} onChange={update('roomNumber')} placeholder="101" required />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="room-type" className="nova-form-label">Room Type</label>
                <select id="room-type" value={form.type} onChange={update('type')} className="admin-input">
                  {ROOM_TYPES.map(type => <option key={type} value={type}>{roomTypeLabel(type)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="room-price" label="Price Per Night (₦)" type="number" min={0} value={String(form.pricePerNight)} onChange={update('pricePerNight')} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="room-status" className="nova-form-label">Status</label>
                <select id="room-status" value={form.status} onChange={update('status')} className="admin-input">
                  {ROOM_STATUSES.map(status => <option key={status} value={status}>{statusLabel(status)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="room-description" className="nova-form-label">Description</label>
              <textarea
                id="room-description"
                value={form.description}
                onChange={update('description')}
                rows={3}
                className="admin-input resize-none"
                placeholder="Describe the room for guests…"
              />
            </div>
          </div>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal
          title="Delete Room"
          maxWidth="max-w-sm"
          onClose={closeModal}
          footer={
            <>
              <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={saving} className="flex-1">Delete</Button>
            </>
          }
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={28} className="text-red-600" aria-hidden="true" />
            </div>
            <p className="text-sm text-[var(--nova-text-muted)]">
              Are you sure you want to delete room <strong className="text-[var(--nova-text-dark)]">{selected.roomNumber}</strong>? This cannot be undone.
            </p>
            {formError && <ErrorMessage message={formError} className="mt-4" />}
          </div>
        </Modal>
      )}
    </div>
  );
}
