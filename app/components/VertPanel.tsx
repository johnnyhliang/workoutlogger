'use client';

import { useState, useTransition } from 'react';
import { logVert, deleteVert } from '@/app/actions';
import { todayISO } from '@/lib/date';
import type { VertLogEntry } from '@/db/schema';
import { Sparkline } from './Sparkline';

export function VertPanel({ initial }: { initial: VertLogEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [vert, setVert] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    const v = Number(vert);
    if (!Number.isFinite(v) || v <= 0) return;
    const date = todayISO();
    startTransition(async () => {
      await logVert({ date, vertIn: v, notes: notes || undefined });
      setEntries((es) => [
        {
          id: -Date.now(),
          date,
          vertIn: v,
          notes: notes || null,
          createdAt: Date.now(),
        },
        ...es,
      ]);
      setVert('');
      setNotes('');
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      if (id > 0) await deleteVert(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    });
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const points = sorted.map((e, i) => ({ x: i, y: e.vertIn, label: e.date }));
  const best = entries.reduce((m, e) => Math.max(m, e.vertIn), 0);

  return (
    <main className="px-4 pt-6">
      <h1 className="text-3xl font-bold mb-1">Vert</h1>
      <p className="text-xs text-[var(--color-muted)] mb-4">
        Test once a week or biweekly. Best ever: <span className="font-mono">{best || '—'}″</span>
      </p>

      <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
        <label className="block text-xs text-[var(--color-muted)] mb-1">Today (inches)</label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={vert}
            onChange={(e) => setVert(e.target.value)}
            placeholder="—"
            className="flex-1 bg-neutral-900 rounded-lg px-3 py-3 text-2xl font-semibold tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={submit}
            disabled={pending || !vert}
            className="px-4 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30"
          >
            Log
          </button>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="notes (approach? standing? fresh?)"
          className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </section>

      {points.length >= 2 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
          <h2 className="text-sm font-semibold mb-2">Trend</h2>
          <Sparkline points={points} />
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold mb-2">Log</h2>
        {entries.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)] italic">Nothing yet.</p>
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
                  <span className="font-mono tabular-nums text-sm">{e.vertIn}″</span>
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
