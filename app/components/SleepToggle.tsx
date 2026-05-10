'use client';

import { useState, useTransition } from 'react';
import type { DayKey } from '@/lib/program';
import { setSleptOk } from '@/app/actions';

export function SleepToggle({
  date,
  dayKey,
  initial,
}: {
  date: string;
  dayKey: DayKey;
  initial: number | null | undefined;
}) {
  const [val, setVal] = useState<boolean | null>(
    initial == null ? null : initial === 1,
  );
  const [pending, startTransition] = useTransition();

  function set(v: boolean) {
    setVal(v);
    startTransition(() => setSleptOk(date, dayKey, v));
  }

  return (
    <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Slept ≥7h?</h3>
          <p className="text-xs text-[var(--color-muted)]">Single best predictor of session quality.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set(true)}
            disabled={pending}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              val === true
                ? 'bg-emerald-500 text-black'
                : 'bg-neutral-900 text-[var(--color-muted)]'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => set(false)}
            disabled={pending}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              val === false
                ? 'bg-red-500 text-black'
                : 'bg-neutral-900 text-[var(--color-muted)]'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </section>
  );
}
