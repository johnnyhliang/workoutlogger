'use client';

import { useState, useTransition } from 'react';
import { logPickup, deletePickup } from '@/app/actions';
import { todayISO } from '@/lib/date';
import type { PickupLogEntry } from '@/db/schema';

export function PickupPanel({ initial }: { initial: PickupLogEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [sport, setSport] = useState<'basketball' | 'volleyball'>('basketball');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    const dur = duration ? Number(duration) : null;
    const date = todayISO();
    startTransition(async () => {
      await logPickup({ date, sport, durationMin: dur ?? undefined, notes: notes || undefined });
      setEntries((es) => [
        {
          id: -Date.now(),
          date,
          sport,
          durationMin: dur,
          notes: notes || null,
          createdAt: Date.now(),
        },
        ...es,
      ]);
      setDuration('');
      setNotes('');
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      if (id > 0) await deletePickup(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    });
  }

  const last4Weeks = entries.filter((e) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 28);
    return new Date(e.date) >= cutoff;
  }).length;

  return (
    <main className="px-4 pt-6">
      <h1 className="text-3xl font-bold mb-1">Pickup</h1>
      <p className="text-xs text-[var(--color-muted)] mb-4">
        Last 4 weeks: <span className="font-mono">{last4Weeks}</span> sessions
      </p>

      <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setSport('basketball')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
              sport === 'basketball' ? 'bg-emerald-500 text-black' : 'bg-neutral-900'
            }`}
          >
            🏀 Basketball
          </button>
          <button
            type="button"
            onClick={() => setSport('volleyball')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
              sport === 'volleyball' ? 'bg-emerald-500 text-black' : 'bg-neutral-900'
            }`}
          >
            🏐 Volleyball
          </button>
        </div>
        <input
          type="number"
          inputMode="numeric"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="duration (min, optional)"
          className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="notes"
          className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
        />
        <button
          onClick={submit}
          disabled={pending}
          className="w-full py-3 rounded-lg bg-emerald-500 text-black font-semibold"
        >
          Log session
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">Log</h2>
        {entries.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)] italic">No sessions logged.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-[var(--color-muted)] tabular-nums">{e.date}</span>
                  {e.notes && <span className="text-xs italic text-[var(--color-muted)]">{e.notes}</span>}
                </div>
                <span className="flex items-center gap-2">
                  <span className="text-sm">{e.sport === 'basketball' ? '🏀' : '🏐'}</span>
                  {e.durationMin && <span className="font-mono tabular-nums text-xs">{e.durationMin}m</span>}
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="text-[var(--color-muted)] hover:text-[var(--color-bad)]"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
