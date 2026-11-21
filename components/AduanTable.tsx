'use client';

import {
  ArrowRight,
  Check,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  AduanRecord,
  formatAduanCode,
  formatTarikh,
  getNextStatus,
} from '@/lib/aduan';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';

interface AduanTableProps {
  records: AduanRecord[];
  isLoading: boolean;
  updatingId: number | null;
  hasActiveFilter: boolean;
  onAdvanceStatus: (record: AduanRecord, nextStatus: string) => Promise<void>;
  onEdit: (record: AduanRecord) => void;
  onDelete: (record: AduanRecord) => void;
  onResetFilters: () => void;
  onOpenCreate: () => void;
}

export function AduanTable({
  records,
  isLoading,
  updatingId,
  hasActiveFilter,
  onAdvanceStatus,
  onEdit,
  onDelete,
  onResetFilters,
  onOpenCreate,
}: AduanTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-7 w-20 animate-pulse rounded-md bg-slate-100" />
                <div className="h-7 w-28 animate-pulse rounded-md bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {hasActiveFilter
            ? 'Tiada aduan sepadan ditemui'
            : 'Belum ada aduan kerosakan fasiliti'}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-slate-500">
          {hasActiveFilter
            ? 'Cuba tukar kata kunci lokasi atau tetapkan semula penapis status dan keutamaan.'
            : 'Rekod kerosakan yang dilaporkan oleh pelajar atau kakitangan akan dipaparkan di sini.'}
        </p>
        <div className="mt-6">
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Penapis</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Lapor Kerosakan Pertama</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
              <th scope="col" className="py-3.5 pl-5 pr-3">
                ID
              </th>
              <th scope="col" className="px-3 py-3.5">
                Lokasi &amp; Pengadu
              </th>
              <th scope="col" className="px-3 py-3.5">
                Kategori
              </th>
              <th scope="col" className="px-3 py-3.5">
                Keutamaan
              </th>
              <th scope="col" className="px-3 py-3.5">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5">
                Tindakan Pantas
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-5 text-right">
                Urus
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {records.map((record) => {
              const nextStatus = getNextStatus(record.status);
              const isRowBusy = updatingId === record.id;

              return (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="py-4 pl-5 pr-3 align-middle font-mono text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">
                    {formatAduanCode(record.id)}
                  </td>
                  <td className="max-w-xs px-3 py-4 align-middle">
                    <p className="font-semibold text-slate-900">
                      {record.lokasi}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span>{record.pengadu}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span className="tabular-nums">
                        {formatTarikh(record.createdAt)}
                      </span>
                    </p>
                  </td>
                  <td className="px-3 py-4 align-middle text-xs font-medium text-slate-700 whitespace-nowrap">
                    {record.kategori_kerosakan}
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <PriorityBadge priority={record.tahap_keutamaan} />
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-3 py-4 align-middle">
                    {nextStatus ? (
                      <button
                        type="button"
                        disabled={isRowBusy}
                        onClick={() => onAdvanceStatus(record, nextStatus)}
                        className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 whitespace-nowrap shrink-0 ${
                          nextStatus === 'Dalam Tindakan'
                            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isRowBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : nextStatus === 'Dalam Tindakan' ? (
                          <ArrowRight className="h-3.5 w-3.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {nextStatus === 'Dalam Tindakan'
                            ? 'Mula Tindakan'
                            : 'Tandakan Selesai'}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        Telah diselesaikan
                      </span>
                    )}
                  </td>
                  <td className="py-4 pl-3 pr-5 text-right align-middle">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        aria-label={`Sunting aduan ${formatAduanCode(record.id)}`}
                        title="Sunting aduan"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record)}
                        aria-label={`Padam aduan ${formatAduanCode(record.id)}`}
                        title="Padam aduan"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card List */}
      <div className="divide-y divide-slate-100 lg:hidden">
        {records.map((record) => {
          const nextStatus = getNextStatus(record.status);
          const isRowBusy = updatingId === record.id;

          return (
            <div key={record.id} className="space-y-3.5 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-700 tabular-nums">
                      {formatAduanCode(record.id)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{record.kategori_kerosakan}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    {record.lokasi}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <span>{record.pengadu}</span>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span className="tabular-nums">
                      {formatTarikh(record.createdAt)}
                    </span>
                  </p>
                </div>
                <PriorityBadge priority={record.tahap_keutamaan} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <StatusBadge status={record.status} />

                <div className="flex flex-wrap items-center gap-2">
                  {nextStatus && (
                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => onAdvanceStatus(record, nextStatus)}
                      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 whitespace-nowrap ${
                        nextStatus === 'Dalam Tindakan'
                          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isRowBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : nextStatus === 'Dalam Tindakan' ? (
                        <ArrowRight className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {nextStatus === 'Dalam Tindakan'
                          ? 'Mula Tindakan'
                          : 'Tandakan Selesai'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    aria-label={`Sunting aduan ${formatAduanCode(record.id)}`}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(record)}
                    aria-label={`Padam aduan ${formatAduanCode(record.id)}`}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-red-600 hover:border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
