'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import {
  AduanFormInput,
  AduanRecord,
  KATEGORI_OPTIONS,
  KEUTAMAAN_OPTIONS,
  STATUS_OPTIONS,
  formatAduanCode,
} from '@/lib/aduan';

interface AduanFormModalProps {
  isOpen: boolean;
  editingRecord: AduanRecord | null;
  onClose: () => void;
  onSubmit: (data: AduanFormInput, editId?: number) => Promise<void>;
}

interface AduanFormDialogProps {
  editingRecord: AduanRecord | null;
  onClose: () => void;
  onSubmit: (data: AduanFormInput, editId?: number) => Promise<void>;
}

function AduanFormDialog({
  editingRecord,
  onClose,
  onSubmit,
}: AduanFormDialogProps) {
  const [pengadu, setPengadu] = useState(editingRecord?.pengadu ?? '');
  const [lokasi, setLokasi] = useState(editingRecord?.lokasi ?? '');
  const [kategori, setKategori] = useState<string>(
    editingRecord?.kategori_kerosakan ?? KATEGORI_OPTIONS[0]
  );
  const [keutamaan, setKeutamaan] = useState<string>(
    editingRecord?.tahap_keutamaan ?? 'Sederhana'
  );
  const [status, setStatus] = useState<string>(
    editingRecord?.status ?? 'Baru'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPengadu = pengadu.trim();
    const trimmedLokasi = lokasi.trim();

    if (trimmedPengadu.length < 2) {
      setFormError('Sila masukkan nama pengadu sekurang-kurangnya 2 aksara.');
      return;
    }
    if (trimmedLokasi.length < 2) {
      setFormError(
        'Sila masukkan lokasi atau nama bilik sekurang-kurangnya 2 aksara.'
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          pengadu: trimmedPengadu,
          lokasi: trimmedLokasi,
          kategori_kerosakan: kategori,
          tahap_keutamaan: keutamaan,
          status: editingRecord ? status : 'Baru',
        },
        editingRecord?.id
      );
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan aduan. Sila cuba lagi.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aduan-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2
              id="aduan-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {editingRecord
                ? `Sunting Aduan ${formatAduanCode(editingRecord.id)}`
                : 'Lapor Kerosakan Fasiliti'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {editingRecord
                ? 'Kemas kini butiran kerosakan atau status tindakan semasa.'
                : 'Isi maklumat lokasi dan jenis kerosakan untuk tindakan penyelenggaraan.'}
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup borang"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="pengadu"
              className="block text-xs font-semibold text-slate-700"
            >
              Nama Pengadu
            </label>
            <input
              id="pengadu"
              type="text"
              required
              value={pengadu}
              onChange={(e) => setPengadu(e.target.value)}
              placeholder="cth. Ahmad Danial bin Razak"
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="lokasi"
              className="block text-xs font-semibold text-slate-700"
            >
              Lokasi / Nama Bilik
            </label>
            <input
              id="lokasi"
              type="text"
              required
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="cth. Blok A - Bilik Kuliah 3"
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="kategori"
              className="block text-xs font-semibold text-slate-700"
            >
              Kategori Kerosakan
            </label>
            <select
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            >
              {KATEGORI_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700">
              Tahap Keutamaan
            </span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {KEUTAMAAN_OPTIONS.map((opt) => {
                const active = keutamaan === opt;
                const activeStyle =
                  opt === 'Kritikal'
                    ? 'border-red-300 bg-red-50 text-red-800 ring-1 ring-red-200'
                    : opt === 'Sederhana'
                      ? 'border-amber-300 bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200';
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setKeutamaan(opt)}
                    className={`min-h-[40px] rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? activeStyle
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {editingRecord && (
            <div>
              <label
                htmlFor="status"
                className="block text-xs font-semibold text-slate-700"
              >
                Status Tindakan
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isSubmitting && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>
                {editingRecord ? 'Simpan Perubahan' : 'Hantar Aduan'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function AduanFormModal({
  isOpen,
  editingRecord,
  onClose,
  onSubmit,
}: AduanFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <AduanFormDialog
          key={editingRecord ? `edit-${editingRecord.id}` : 'create-new'}
          editingRecord={editingRecord}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </AnimatePresence>
  );
}
