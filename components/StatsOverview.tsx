'use client';

import { AduanRecord } from '@/lib/aduan';

interface StatsOverviewProps {
  records: AduanRecord[];
  isLoading: boolean;
}

export function StatsOverview({ records, isLoading }: StatsOverviewProps) {
  const total = records.length;
  const baruCount = records.filter((r) => r.status === 'Baru').length;
  const dalamTindakanCount = records.filter(
    (r) => r.status === 'Dalam Tindakan'
  ).length;
  const openCount = baruCount + dalamTindakanCount;
  const resolvedCount = records.filter((r) => r.status === 'Selesai').length;
  const criticalOpenCount = records.filter(
    (r) => r.tahap_keutamaan === 'Kritikal' && r.status !== 'Selesai'
  ).length;

  const resolvedRate =
    total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const cards = [
    {
      label: 'Aduan Terbuka',
      value: openCount,
      subtext: `${baruCount} Baru · ${dalamTindakanCount} Dalam Tindakan`,
      highlight: openCount > 0 ? 'text-slate-900' : 'text-slate-600',
    },
    {
      label: 'Aduan Selesai',
      value: resolvedCount,
      subtext: `${resolvedRate}% kadar penyelesaian`,
      highlight: 'text-emerald-700',
    },
    {
      label: 'Jumlah Aduan',
      value: total,
      subtext: 'Semua rekod berdaftar',
      highlight: 'text-slate-900',
    },
    {
      label: 'Kritikal Aktif',
      value: criticalOpenCount,
      subtext:
        criticalOpenCount > 0
          ? 'Perlu tindakan segera'
          : 'Tiada kes kritikal terbuka',
      highlight: criticalOpenCount > 0 ? 'text-red-700' : 'text-slate-600',
    },
  ];

  return (
    <section
      id="ringkasan"
      aria-label="Ringkasan Statistik Aduan"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
        >
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
          {isLoading ? (
            <div className="mt-2.5 h-8 w-16 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p
              className={`mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums ${card.highlight}`}
            >
              {card.value}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 tabular-nums">
            {isLoading ? 'Memuatkan data...' : card.subtext}
          </p>
        </div>
      ))}
    </section>
  );
}
