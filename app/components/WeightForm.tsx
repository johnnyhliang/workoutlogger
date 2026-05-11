'use client';

import { useState, useTransition } from 'react';
import { logBodyWeight, deleteBodyWeight, editBodyWeight } from '@/app/actions';
import { todayISO } from '@/lib/date';
import type { BodyLogEntry } from '@/db/schema';
import { Sparkline } from './Sparkline';
import { useEscapeKey } from '@/lib/hooks';

export function WeightPanel({ initial }: { initial: BodyLogEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [weight, setWeight] = useState('');
  const [bf, setBf] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editW, setEditW] = useState('');
  const [editBf, setEditBf] = useState('');
  const [editN, setEditN] = useState('');
  const [pending, startTransition] = useTransition();

  useEscapeKey(editingId != null, () => setEditingId(null));

  function submit() {
    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) return;
    const date = todayISO();
    const bfNum = bf === '' ? null : Number(bf);
    const bfClean = bfNum != null && Number.isFinite(bfNum) ? bfNum : null;
    startTransition(async () => {
      await logBodyWeight({
        date,
        weightLb: w,
        bodyFatPct: bfClean,
        notes: notes || undefined,
      });
      setEntries((es) => [
        {
          id: -Date.now(),
          date,
          weightLb: w,
          bodyFatPct: bfClean,
          photoUrl: null,
          notes: notes || null,
          createdAt: Date.now(),
        },
        ...es,
      ]);
      setWeight('');
      setBf('');
      setNotes('');
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      if (id > 0) await deleteBodyWeight(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    });
  }

  function startEdit(e: BodyLogEntry) {
    setEditingId(e.id);
    setEditW(String(e.weightLb));
    setEditBf(e.bodyFatPct != null ? String(e.bodyFatPct) : '');
    setEditN(e.notes ?? '');
  }
  function saveEdit() {
    if (editingId == null) return;
    const w = Number(editW);
    if (!Number.isFinite(w) || w <= 0) return;
    const bfNum = editBf === '' ? null : Number(editBf);
    const bfClean = bfNum != null && Number.isFinite(bfNum) ? bfNum : null;
    startTransition(async () => {
      if (editingId > 0)
        await editBodyWeight({
          id: editingId,
          weightLb: w,
          bodyFatPct: bfClean,
          notes: editN || null,
        });
      setEntries((es) =>
        es.map((e) =>
          e.id === editingId
            ? { ...e, weightLb: w, bodyFatPct: bfClean, notes: editN || null }
            : e,
        ),
      );
      setEditingId(null);
    });
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const avgPoints = sorted.map((e, i) => {
    const window = sorted.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, x) => s + x.weightLb, 0) / window.length;
    return { x: i, y: Number(avg.toFixed(1)), label: e.date };
  });
  const bfPoints = sorted
    .filter((e) => e.bodyFatPct != null)
    .map((e, i) => ({ x: i, y: e.bodyFatPct as number, label: e.date }));

  return (
    <main className="px-4 pt-6">
      <h1 className="text-3xl font-bold mb-1">Body</h1>
      <nav className="mb-4 flex gap-2 flex-wrap">
        {[
          ['/vert', 'Vert'],
          ['/pickup', 'Pickup'],
          ['/plates', 'Plates'],
          ['/custom', 'Custom'],
          ['/guide', 'Guide'],
          ['/export', 'Export'],
        ].map(([href, label]) => (
          <a key={href} href={href} className="px-2.5 py-1 rounded-lg bg-neutral-900 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] border border-[var(--color-border)]">
            {label}
          </a>
        ))}
      </nav>

      <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
        <div className="flex gap-2 mb-2">
          <label className="flex-1">
            <span className="block text-xs text-[var(--color-muted)] mb-1">Weight (lb)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.2"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && weight) submit(); }}
              placeholder="—"
              className="w-full bg-neutral-900 rounded-lg px-3 py-3 text-2xl font-semibold tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>
          <label className="w-28">
            <span className="block text-xs text-[var(--color-muted)] mb-1">Body fat %</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={bf}
              onChange={(e) => setBf(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && weight) submit(); }}
              placeholder="—"
              className="w-full bg-neutral-900 rounded-lg px-3 py-3 text-2xl font-semibold tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="notes (optional)"
          className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || !weight}
          className="w-full py-3 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30"
        >
          Log
        </button>
        <p className="text-xs text-[var(--color-muted)] mt-2 italic">
          Renpho-class scales: trust the trend, not the absolute number.
        </p>
      </section>

      {avgPoints.length >= 2 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
          <h2 className="text-sm font-semibold mb-2">7-day moving avg (weight)</h2>
          <Sparkline points={avgPoints} />
        </section>
      )}

      {bfPoints.length >= 2 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
          <h2 className="text-sm font-semibold mb-2">Body fat % trend</h2>
          <Sparkline points={bfPoints} color="#eab308" />
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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-muted)] tabular-nums">{e.date}</span>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel"
                        className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <span className="block text-[10px] text-[var(--color-muted)]">lb</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.2"
                          value={editW}
                          onChange={(ev) => setEditW(ev.target.value)}
                          onKeyDown={(ev) => { if (ev.key === 'Enter') saveEdit(); }}
                          className="w-full bg-neutral-900 rounded-md px-2 py-1 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </label>
                      <label className="w-20">
                        <span className="block text-[10px] text-[var(--color-muted)]">bf %</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          value={editBf}
                          onChange={(ev) => setEditBf(ev.target.value)}
                          onKeyDown={(ev) => { if (ev.key === 'Enter') saveEdit(); }}
                          className="w-full bg-neutral-900 rounded-md px-2 py-1 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={editN}
                      onChange={(ev) => setEditN(ev.target.value)}
                      onKeyDown={(ev) => { if (ev.key === 'Enter') saveEdit(); }}
                      placeholder="notes"
                      className="bg-neutral-900 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="px-3 py-1.5 rounded-md bg-emerald-500 text-black text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-[var(--color-muted)] tabular-nums">{e.date}</span>
                      {e.notes && <span className="text-xs italic text-[var(--color-muted)]">{e.notes}</span>}
                    </div>
                    <span className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-sm">{e.weightLb} lb</span>
                      {e.bodyFatPct != null && (
                        <span className="font-mono tabular-nums text-xs text-yellow-400">
                          {e.bodyFatPct}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(e)}
                        aria-label="Edit"
                        className="text-[var(--color-muted)] hover:text-[var(--color-fg)] w-7 h-7"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(e.id)}
                        aria-label="Delete"
                        className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7"
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
