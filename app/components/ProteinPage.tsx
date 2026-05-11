'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { logProtein, deleteProtein, editProtein } from '@/app/actions';
import { proteinQuickAdds, PROTEIN_GOAL_G } from '@/lib/meals';
import { todayISO } from '@/lib/date';
import type { Meal } from '@/db/schema';
import { Sparkline } from './Sparkline';
import { useEscapeKey } from '@/lib/hooks';

type DailyTotal = { date: string; total: number };

export function ProteinPage({
  initialEntries,
  initialTotal,
  weekTotals,
}: {
  initialEntries: Meal[];
  initialTotal: number;
  weekTotals: DailyTotal[];
}) {
  const [date, setDate] = useState<string | null>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [total, setTotal] = useState(initialTotal);
  const [showCustom, setShowCustom] = useState(false);
  const [customG, setCustomG] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editG, setEditG] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => setDate(todayISO()), []);

  useEscapeKey(showCustom, () => {
    setShowCustom(false);
    setCustomG('');
    setCustomLabel('');
  });
  useEscapeKey(editingId != null, () => setEditingId(null));

  const hour = useMemo(() => new Date().getHours(), []);
  const colorClass =
    total >= 160
      ? 'text-[var(--color-accent)]'
      : total >= 100
        ? 'text-[var(--color-warn)]'
        : hour >= 18
          ? 'text-[var(--color-bad)]'
          : 'text-[var(--color-fg)]';

  function add(label: string, protein: number, source: string) {
    if (!date) return;
    if (typeof navigator !== 'undefined') navigator.vibrate?.(10);
    startTransition(async () => {
      await logProtein({ date, proteinG: protein, source });
      setEntries((es) => [
        {
          id: -Date.now(),
          date,
          proteinG: protein,
          source,
          note: label,
          createdAt: Date.now(),
        },
        ...es,
      ]);
      setTotal((t) => t + protein);
    });
  }

  function submitCustom() {
    const g = Number(customG);
    if (!Number.isFinite(g) || g <= 0) return;
    add(customLabel || 'custom', Math.round(g), 'custom');
    setCustomG('');
    setCustomLabel('');
    setShowCustom(false);
  }

  function startEdit(e: Meal) {
    setEditingId(e.id);
    setEditG(String(e.proteinG));
    setEditLabel(e.note ?? '');
  }

  function saveEdit() {
    if (editingId == null) return;
    const g = Number(editG);
    if (!Number.isFinite(g) || g <= 0) return;
    const prev = entries.find((x) => x.id === editingId);
    if (!prev) return;
    const delta = Math.round(g) - prev.proteinG;
    startTransition(async () => {
      if (editingId > 0) {
        await editProtein({
          id: editingId,
          proteinG: Math.round(g),
          source: prev.source,
          note: editLabel || null,
        });
      }
      setEntries((es) =>
        es.map((x) =>
          x.id === editingId ? { ...x, proteinG: Math.round(g), note: editLabel || null } : x,
        ),
      );
      setTotal((t) => t + delta);
      setEditingId(null);
    });
  }

  function remove(id: number, g: number) {
    startTransition(async () => {
      if (id > 0) await deleteProtein(id);
      setEntries((es) => es.filter((e) => e.id !== id));
      setTotal((t) => t - g);
    });
  }

  return (
    <main className="px-4 pt-6">
      <h1 className="text-xs text-[var(--color-muted)] mb-1 tracking-wide uppercase">Protein</h1>
      <div className={`text-6xl font-bold tabular-nums leading-none mb-1 ${colorClass}`}>
        {total}
        <span className="text-2xl text-[var(--color-muted)]"> / {PROTEIN_GOAL_G}g</span>
      </div>
      <p className="text-xs text-[var(--color-muted)] mb-4 tabular-nums">
        {Math.max(0, PROTEIN_GOAL_G - total)}g to go
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {proteinQuickAdds.map((q) => (
          <button
            key={q.label}
            type="button"
            disabled={pending || !date}
            onClick={() => add(q.label, q.protein, q.source)}
            className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] active:bg-neutral-900 p-3 text-left"
          >
            <div className="font-semibold">{q.label}</div>
            <div className="text-xs text-[var(--color-accent)] tabular-nums">+{q.protein}g</div>
          </button>
        ))}
        <button
          type="button"
          disabled={pending || !date}
          onClick={() => setShowCustom((v) => !v)}
          className="rounded-xl border border-dashed border-[var(--color-border)] p-3 text-[var(--color-muted)] text-sm"
        >
          {showCustom ? 'Cancel' : 'Custom…'}
        </button>
      </div>

      {showCustom && (
        <section className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-muted)]">Custom protein entry</span>
            <button
              type="button"
              onClick={() => {
                setShowCustom(false);
                setCustomG('');
                setCustomLabel('');
              }}
              aria-label="Close"
              className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              inputMode="numeric"
              step="1"
              placeholder="grams"
              value={customG}
              onChange={(e) => setCustomG(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customG) submitCustom();
              }}
              autoFocus
              className="w-24 bg-neutral-900 rounded-lg px-3 py-2 tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="label (optional)"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customG) submitCustom();
              }}
              className="min-w-0 flex-1 bg-neutral-900 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={submitCustom}
              disabled={!customG}
              className="px-4 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-2">Esc to cancel · Enter to save</p>
        </section>
      )}

      <section className="mb-4">
        <h2 className="text-sm font-semibold mb-2">Today</h2>
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
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={editG}
                      onChange={(ev) => setEditG(ev.target.value)}
                      className="w-20 bg-neutral-900 rounded-md px-2 py-1 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(ev) => setEditLabel(ev.target.value)}
                      placeholder="label"
                      className="flex-1 bg-neutral-900 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
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
                    <span className="text-sm">{e.note ?? e.source}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-sm">+{e.proteinG}g</span>
                      <button
                        type="button"
                        onClick={() => startEdit(e)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-fg)]"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(e.id, e.proteinG)}
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

      {weekTotals.length > 1 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold mb-2">Last 7 days</h2>
          <Sparkline points={weekTotals.map((d, i) => ({ x: i, y: d.total, label: d.date }))} />
          <ul className="mt-2 text-xs space-y-0.5">
            {weekTotals.map((d) => (
              <li key={d.date} className="flex justify-between tabular-nums">
                <span className="text-[var(--color-muted)]">{d.date}</span>
                <span className={d.total >= 160 ? 'text-[var(--color-accent)]' : ''}>
                  {d.total}g
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
