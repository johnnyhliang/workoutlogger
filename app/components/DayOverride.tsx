'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { DayKey } from '@/lib/program';
import { dayLabel } from '@/lib/day-logic';

const ALL: DayKey[] = ['lower_heavy', 'upper_full', 'lower_power', 'upper_pull'];

export function DayOverride({ current }: { current: DayKey | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  function pick(k: string) {
    if (k === 'custom') {
      const d = search.get('d') ?? '';
      router.push(`/custom?d=${d}`);
      return;
    }
    const params = new URLSearchParams(search);
    if (k) params.set('override', k);
    else params.delete('override');
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current ?? ''}
      onChange={(e) => pick(e.target.value)}
      className="bg-neutral-900 border border-[var(--color-border)] rounded-md px-2 py-1 text-sm"
    >
      <option value="">— pick a day —</option>
      {ALL.map((k) => (
        <option key={k} value={k}>
          {dayLabel(k)}
        </option>
      ))}
      <option value="custom">Custom (off-program)…</option>
    </select>
  );
}
