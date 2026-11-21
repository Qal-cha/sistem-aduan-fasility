export const KATEGORI_OPTIONS = [
  'Penyaman Udara',
  'Elektrik/Lampu',
  'Wi-Fi/Rangkaian',
  'Paip/Air',
  'Perabot',
  'Lain-lain',
] as const;

export const KEUTAMAAN_OPTIONS = ['Rendah', 'Sederhana', 'Kritikal'] as const;

export const STATUS_OPTIONS = ['Baru', 'Dalam Tindakan', 'Selesai'] as const;

export type KategoriKerosakan = (typeof KATEGORI_OPTIONS)[number];
export type TahapKeutamaan = (typeof KEUTAMAAN_OPTIONS)[number];
export type StatusAduan = (typeof STATUS_OPTIONS)[number];

export interface AduanRecord {
  id: number;
  pengadu: string;
  lokasi: string;
  kategori_kerosakan: string;
  tahap_keutamaan: string;
  status: string;
  createdAt: string;
}

export interface AduanFormInput {
  pengadu: string;
  lokasi: string;
  kategori_kerosakan: string;
  tahap_keutamaan: string;
  status?: string;
}

export function isValidKategori(value: unknown): value is KategoriKerosakan {
  return (
    typeof value === 'string' &&
    (KATEGORI_OPTIONS as readonly string[]).includes(value)
  );
}

export function isValidKeutamaan(value: unknown): value is TahapKeutamaan {
  return (
    typeof value === 'string' &&
    (KEUTAMAAN_OPTIONS as readonly string[]).includes(value)
  );
}

export function isValidStatus(value: unknown): value is StatusAduan {
  return (
    typeof value === 'string' &&
    (STATUS_OPTIONS as readonly string[]).includes(value)
  );
}

export function getNextStatus(current: string): StatusAduan | null {
  if (current === 'Baru') return 'Dalam Tindakan';
  if (current === 'Dalam Tindakan') return 'Selesai';
  return null;
}

export function formatAduanCode(id: number): string {
  return `AD-${String(id).padStart(4, '0')}`;
}

export function formatTarikh(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
