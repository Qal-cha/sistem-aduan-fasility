'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Wrench,
  X,
} from 'lucide-react';
import {
  AduanFormInput,
  AduanRecord,
  KEUTAMAAN_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/aduan';
import { StatsOverview } from '@/components/StatsOverview';
import { AduanTable } from '@/components/AduanTable';
import { AduanFormModal } from '@/components/AduanFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import {
  ToastItem,
  ToastNotification,
} from '@/components/ToastNotification';

type StatusFilter = 'Semua' | (typeof STATUS_OPTIONS)[number];
type PriorityFilter = 'Semua' | (typeof KEUTAMAAN_OPTIONS)[number];

export default function FacilityHelpdeskPage() {
  const [records, setRecords] = useState<AduanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('Semua');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AduanRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<AduanRecord | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: 'success' | 'error', title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  const loadAduan = useCallback(async (background = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    try {
      const response = await fetch('/api/aduan', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Gagal memuatkan senarai aduan.');
      }

      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Tidak dapat berhubung dengan pelayan.';
      setFetchError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchInitial() {
      try {
        const response = await fetch('/api/aduan', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Gagal memuatkan senarai aduan.');
        }

        if (!cancelled) {
          setRecords(Array.isArray(data) ? data : []);
          setFetchError(null);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : 'Tidak dapat berhubung dengan pelayan.';
          setFetchError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return records.filter((item) => {
      const matchesLocation =
        query === '' || item.lokasi.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'Semua' || item.tahap_keutamaan === priorityFilter;
      return matchesLocation && matchesStatus && matchesPriority;
    });
  }, [records, searchQuery, statusFilter, priorityFilter]);

  const hasActiveFilter =
    searchQuery.trim() !== '' ||
    statusFilter !== 'Semua' ||
    priorityFilter !== 'Semua';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('Semua');
    setPriorityFilter('Semua');
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record: AduanRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: AduanFormInput, editId?: number) => {
    const isEdit = typeof editId === 'number';
    const endpoint = isEdit ? `/api/aduan/${editId}` : '/api/aduan';
    const method = isEdit ? 'PATCH' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      const errMsg = result?.error || 'Gagal menyimpan rekod aduan.';
      pushToast('error', 'Operasi Gagal', errMsg);
      throw new Error(errMsg);
    }

    if (isEdit) {
      setRecords((prev) =>
        prev.map((item) => (item.id === editId ? result : item))
      );
      pushToast(
        'success',
        'Aduan Dikemas Kini',
        `Rekod di ${result.lokasi} berjaya disimpan.`
      );
    } else {
      setRecords((prev) => [result, ...prev]);
      pushToast(
        'success',
        'Aduan Dihantar',
        `Laporan kerosakan di ${result.lokasi} telah direkodkan.`
      );
    }

    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleAdvanceStatus = async (
    record: AduanRecord,
    nextStatus: string
  ) => {
    setUpdatingId(record.id);
    try {
      const response = await fetch(`/api/aduan/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Gagal mengemas kini status.');
      }

      setRecords((prev) =>
        prev.map((item) => (item.id === record.id ? result : item))
      );
      pushToast(
        'success',
        `Status: ${nextStatus}`,
        `${record.lokasi} dipindahkan ke status ${nextStatus}.`
      );
    } catch (error) {
      pushToast(
        'error',
        'Gagal Kemas Kini Status',
        error instanceof Error ? error.message : 'Sila cuba sebentar lagi.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/aduan/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Gagal memadam aduan.');
      }

      const removed = records.find((r) => r.id === id);
      setRecords((prev) => prev.filter((item) => item.id !== id));
      setDeletingRecord(null);
      pushToast(
        'success',
        'Aduan Dipadam',
        removed
          ? `Rekod di ${removed.lokasi} telah dipadam.`
          : 'Rekod berjaya dipadam.'
      );
    } catch (error) {
      pushToast(
        'error',
        'Gagal Memadam Rekod',
        error instanceof Error ? error.message : 'Sila cuba sebentar lagi.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 clean zones */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#ringkasan"
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Wrench className="h-4 w-4" />
            </span>
            <span>Sistem Aduan Fasiliti</span>
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
          >
            <a
              href="#ringkasan"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
            <a
              href="#senarai-aduan"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Senarai Aduan
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Lapor Kerosakan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Meja Bantuan Kerosakan Fasiliti
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Pantau, agihkan dan kemas kini laporan kerosakan bangunan,
              penyaman udara, elektrik, rangkaian Wi-Fi dan kemudahan kampus.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAduan(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 sm:self-auto whitespace-nowrap shrink-0"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Muat Semula</span>
          </button>
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div
            role="alert"
            className="flex flex-col justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  Sambungan pangkalan data tergendala
                </p>
                <p className="mt-0.5 text-xs text-red-700">{fetchError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadAduan(false)}
              className="min-h-[40px] rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 whitespace-nowrap shrink-0"
            >
              Cuba Semula
            </button>
          </div>
        )}

        {/* Statistics Overview Cards */}
        <StatsOverview records={records} isLoading={isLoading} />

        {/* Filter & Search Workspace */}
        <section id="senarai-aduan" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search by location / room name */}
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lokasi atau nama bilik..."
                aria-label="Cari aduan mengikut lokasi atau nama bilik"
                className="block min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pr-9 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Kosongkan carian"
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Segmented Status Filter */}
              <div
                role="group"
                aria-label="Tapis mengikut status"
                className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
              >
                {(['Semua', ...STATUS_OPTIONS] as StatusFilter[]).map(
                  (tab) => {
                    const active = statusFilter === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setStatusFilter(tab)}
                        className={`min-h-[32px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Priority Filter Dropdown */}
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as PriorityFilter)
                }
                aria-label="Tapis mengikut tahap keutamaan"
                className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-slate-900 focus:outline-none"
              >
                <option value="Semua">Semua Keutamaan</option>
                {KEUTAMAAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    Keutamaan: {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="tabular-nums">
              Memaparkan {filteredRecords.length} daripada {records.length}{' '}
              aduan
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-semibold text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Kosongkan penapis
              </button>
            )}
          </div>

          {/* Data Table */}
          <AduanTable
            records={filteredRecords}
            isLoading={isLoading}
            updatingId={updatingId}
            hasActiveFilter={hasActiveFilter}
            onAdvanceStatus={handleAdvanceStatus}
            onEdit={handleOpenEdit}
            onDelete={(record) => setDeletingRecord(record)}
            onResetFilters={handleResetFilters}
            onOpenCreate={handleOpenCreate}
          />
        </section>
      </main>

      <footer className="mx-auto mt-10 max-w-7xl border-t border-slate-200 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <span>
            Facility Damage Helpdesk · Sistem Aduan Kerosakan Fasiliti
          </span>
          <span>Pengurusan Penyelenggaraan Kampus &amp; Bangunan</span>
        </div>
      </footer>

      <AduanFormModal
        isOpen={isFormOpen}
        editingRecord={editingRecord}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        record={deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
