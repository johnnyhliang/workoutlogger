'use client';

import { useState, useTransition } from 'react';
import { logBodyWeight, deleteBodyWeight, editBodyWeight } from '@/app/actions';
import { todayISO } from '@/lib/date';
import type { BodyLogEntry } from '@/db/schema';
import { Sparkline } from './Sparkline';

export function WeightPanel({ initial }: { initial: BodyLogEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [weight, setWeight] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editW, setEditW] = useState('');
  const [pending, startTransition] = useTransition();

  function startEdit(id: number, w: number) {
    setEditingId(id);
    setEditW(String(w));
  }
  function saveEdit() {
    if (editingId == null) return;
    const w = Number(editW);
    if (!Number.isFinite(w) || w <= 0) return;
    startTransition(async () => {
      if (editingId > 0) await editBodyWeight({ id: editingId, weightLb: w });
      setEntries((es) =>
        es.map((e) => (e.id === editingId ? { ...e, weightLb: w } : e)),
      );
      setEditingId(null);
    });
  }

  function submit() {
    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) return;
    const date = todayISO();
    startTransition(async () => {
      await logBodyWeight({ date, weightLb: w });
      setEntries((es) => [
        { id: -Date.now(), date, weightLb: w, photoUrl: null, notes: null, createdAt: Date.now() },
        ...es,
      ]);
      setWeight('');
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      if (id > 0) await deleteBodyWeight(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    });
  }

  // 7-day moving average for chart
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const avgPoints = sorted.map((e, i) => {
    const window = sorted.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, x) => s + x.weightLb, 0) / window.length;
    return { x: i, y: Number(avg.toFixed(1)), label: e.date };
  });

  return (
    <main className="px-4 pt-6">
      <h1 className="text-3xl font-bold mb-1">Body Weight</h1>
      <nav className="text-xs text-[var(--color-muted)] mb-4 flex gap-3 flex-wrap">
        <a href="/vert" className="underline">Vert →</a>
        <a href="/pickup" className="underline">Pickup →</a>
        <a href="/plates" className="underline">Plates →</a>
        <a href="/custom" className="underline">Custom →</a>
        <a href="/guide" className="underline">Guide →</a>
      </nav>

      <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
        <label className="block text-xs text-[var(--color-muted)] mb-1">Today (lb)</label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.2"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="—"
            className="flex-1 bg-neutral-900 rounded-lg px-3 py-3 text-2xl font-semibold tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={submit}
            disabled={pending || !weight}
            className="px-4 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30"
          >
            Log
          </button>
        </div>
      </section>

      {avgPoints.length >= 2 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
          <h2 className="text-sm font-semibold mb-2">7-day moving avg</h2>
          <Sparkline points={avgPoints} />
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
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2"
              >
                {editingId === e.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-muted)] tabular-nums">{e.date}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.2"
                      value={editW}
                      onChange={(ev) => setEditW(ev.target.value)}
                      className="flex-1 bg-neutral-900 rounded-md px-2 py-1 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="px-2 py-1 rounded-md bg-emerald-500 text-black text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-[var(--color-muted)] text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-muted)] tabular-nums">{e.date}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-sm">{e.weightLb} lb</span>
                      <button
                        type="button"
                        onClick={() => startEdit(e.id, e.weightLb)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-fg)]"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(e.id)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-bad)]"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
