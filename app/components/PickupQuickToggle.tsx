'use client';

import { useState, useTransition } from 'react';
import { logPickup, deletePickup } from '@/app/actions';
import type { PickupLogEntry } from '@/db/schema';

export function PickupQuickToggle({ date, today }: { date: string; today: PickupLogEntry[] }) {
  const [entries, setEntries] = useState(today);
  const [pending, startTransition] = useTransition();

  function add(sport: string) {
    if (typeof navigator !== 'undefined') navigator.vibrate?.(10);
    startTransition(async () => {
      await logPickup({ date, sport });
      setEntries((es) => [{ id: -Date.now(), date, sport, durationMin: null, notes: null, createdAt: Date.now() }, ...es]);
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      if (id > 0) await deletePickup(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    });
  }

  return (
    <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Pickup today?</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => add('basketball')}
            disabled={pending}
            className="px-3 py-2 rounded-lg bg-neutral-900 active:bg-neutral-800 text-sm"
          >
            🏀 Hoops
          </button>
          <button
            type="button"
            onClick={() => add('volleyball')}
            disabled={pending}
            className="px-3 py-2 rounded-lg bg-neutral-900 active:bg-neutral-800 text-sm"
          >
            🏐 Volley
          </button>
        </div>
      </div>
      {entries.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-950/40 text-xs"
            >
              {e.sport}
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="text-[var(--color-muted)] hover:text-[var(--color-bad)]"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
