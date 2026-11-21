'use client';

import { AlertOctagon, AlertTriangle, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (priority === 'Kritikal') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 whitespace-nowrap shrink-0',
          className
        )}
      >
        <AlertOctagon className="h-3.5 w-3.5 text-red-600 shrink-0" aria-hidden="true" />
        <span>Kritikal</span>
      </span>
    );
  }

  if (priority === 'Sederhana') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 whitespace-nowrap shrink-0',
          className
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
        <span>Sederhana</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 whitespace-nowrap shrink-0',
        className
      )}
    >
      <ArrowDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
      <span>{priority || 'Rendah'}</span>
    </span>
  );
}
