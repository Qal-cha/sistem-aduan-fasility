'use client';

import { CheckCircle2, Clock, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === 'Selesai') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap shrink-0',
          className
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>Selesai</span>
      </span>
    );
  }

  if (status === 'Dalam Tindakan') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap shrink-0',
          className
        )}
      >
        <Wrench className="h-3.5 w-3.5 text-blue-600 shrink-0" aria-hidden="true" />
        <span>Dalam Tindakan</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0',
        className
      )}
    >
      <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden="true" />
      <span>{status || 'Baru'}</span>
    </span>
  );
}
