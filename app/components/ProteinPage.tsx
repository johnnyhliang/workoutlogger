'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { logProtein, deleteProtein } from '@/app/actions';
import { proteinQuickAdds, PROTEIN_GOAL_G } from '@/lib/meals';
import { todayISO } from '@/lib/date';
import type { Meal } from '@/db/schema';
import { Sparkline } from './Sparkline';

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
  const [pending, startTransition] = useTransition();

  useEffect(() => setDate(todayISO()), []);

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

  function addCustom() {
    const raw = prompt('Protein (g)?');
    if (!raw) return;
    const g = Number(raw);
    if (!Number.isFinite(g) || g <= 0) return;
    const note = prompt('Label?') ?? 'custom';
    add(note, Math.round(g), 'custom');
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
          onClick={addCustom}
          className="rounded-xl border border-dashed border-[var(--color-border)] p-3 text-[var(--color-muted)] text-sm"
        >
          Custom…
        </button>
      </div>

      <section className="mb-4">
        <h2 className="text-sm font-semibold mb-2">Today</h2>
        {entries.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)] italic">Nothing yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2"
              >
                <span className="text-sm">{e.note ?? e.source}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-sm">+{e.proteinG}g</span>
                  <button
                    type="button"
                    onClick={() => remove(e.id, e.proteinG)}
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
