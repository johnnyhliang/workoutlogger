'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Exercise, DayKey } from '@/lib/program';
import { exerciseName } from '@/lib/program';
import type { WorkoutSet } from '@/db/schema';
import { logSet, deleteSet } from '@/app/actions';

type LastSession = { date: string; sets: WorkoutSet[] } | null;

type SetRow = {
  setNumber: number;
  weight: string;
  reps: string;
  id?: number;
  saved: boolean;
};

function topSet(s: WorkoutSet[]): { weight: number | null; reps: number } | null {
  if (s.length === 0) return null;
  return s.reduce<{ weight: number | null; reps: number }>(
    (best, cur) =>
      (cur.weight ?? 0) > (best.weight ?? 0) ||
      ((cur.weight ?? 0) === (best.weight ?? 0) && cur.reps > best.reps)
        ? { weight: cur.weight, reps: cur.reps }
        : best,
    { weight: s[0].weight, reps: s[0].reps },
  );
}

export function ExerciseCard({
  exercise,
  date,
  dayKey,
  existingSets,
  lastSession,
}: {
  exercise: Exercise;
  date: string;
  dayKey: DayKey;
  existingSets: WorkoutSet[];
  lastSession: LastSession;
}) {
  const [activeKey, setActiveKey] = useState<string>(() => {
    if (existingSets[0]?.isSwap) return existingSets[0].exerciseKey;
    return exercise.key;
  });
  const isSwap = activeKey !== exercise.key;
  const [showSwap, setShowSwap] = useState(false);
  const [pending, startTransition] = useTransition();

  const visibleExisting = useMemo(
    () => existingSets.filter((s) => s.exerciseKey === activeKey),
    [existingSets, activeKey],
  );
  const lastSetWeight =
    visibleExisting[visibleExisting.length - 1]?.weight ??
    lastSession?.sets[lastSession.sets.length - 1]?.weight ??
    null;

  const initialRows: SetRow[] = useMemo(() => {
    const rows: SetRow[] = [];
    for (let i = 1; i <= exercise.sets; i++) {
      const found = visibleExisting.find((s) => s.setNumber === i);
      rows.push({
        setNumber: i,
        weight: found?.weight != null ? String(found.weight) : '',
        reps: found?.reps != null ? String(found.reps) : '',
        id: found?.id,
        saved: !!found,
      });
    }
    return rows;
  }, [exercise.sets, visibleExisting]);

  const [rows, setRows] = useState<SetRow[]>(initialRows);

  // Re-sync when active swap changes
  useMemo(() => setRows(initialRows), [initialRows]);

  const last = lastSession;
  const lastTop = last ? topSet(last.sets) : null;
  const todayTop = topSet(
    visibleExisting.length
      ? visibleExisting
      : rows
          .filter((r) => r.saved && r.weight && r.reps)
          .map((r) => ({
            id: 0,
            workoutId: 0,
            exerciseKey: activeKey,
            setNumber: r.setNumber,
            weight: r.weight ? Number(r.weight) : null,
            reps: Number(r.reps),
            rpe: null,
            isSwap: 0,
            createdAt: 0,
          })),
  );

  const beatLastWeek =
    lastTop && todayTop
      ? (todayTop.weight ?? 0) > (lastTop.weight ?? 0) ||
        ((todayTop.weight ?? 0) === (lastTop.weight ?? 0) && todayTop.reps > lastTop.reps)
      : null;

  function updateRow(idx: number, field: 'weight' | 'reps', val: string) {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, [field]: val, saved: false } : r)));
  }

  function bumpWeight(idx: number, delta: number) {
    setRows((rs) =>
      rs.map((r, i) => {
        if (i !== idx) return r;
        const cur = Number(r.weight || lastSetWeight || 0);
        const next = Math.max(0, cur + delta);
        return { ...r, weight: String(next), saved: false };
      }),
    );
  }

  function bumpReps(idx: number, delta: number) {
    setRows((rs) =>
      rs.map((r, i) => {
        if (i !== idx) return r;
        const cur = Number(r.reps || 0);
        const next = Math.max(0, cur + delta);
        return { ...r, reps: String(next), saved: false };
      }),
    );
  }

  function saveRow(idx: number) {
    const row = rows[idx];
    if (!row.reps) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10);
    const weight = row.weight === '' ? null : Number(row.weight);
    const reps = Number(row.reps);
    startTransition(async () => {
      await logSet({
        date,
        dayKey,
        exerciseKey: activeKey,
        setNumber: row.setNumber,
        weight,
        reps,
        isSwap,
      });
      setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, saved: true } : r)));
    });
  }

  function removeRow(idx: number) {
    const row = rows[idx];
    if (!row.id) {
      setRows((rs) =>
        rs.map((r, i) => (i === idx ? { ...r, weight: '', reps: '', saved: false, id: undefined } : r)),
      );
      return;
    }
    startTransition(async () => {
      await deleteSet(row.id!);
      setRows((rs) =>
        rs.map((r, i) => (i === idx ? { ...r, weight: '', reps: '', saved: false, id: undefined } : r)),
      );
    });
  }

  const allLogged = rows.every((r) => r.saved);
  const displayName = isSwap ? `${exerciseName(activeKey)} (swap)` : exercise.name;

  return (
    <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
      <header className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h2 className="text-lg font-semibold leading-tight flex items-center gap-2">
            {displayName}
            {allLogged ? <span className="text-[var(--color-accent)]">✓</span> : null}
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            {exercise.sets} × {exercise.reps}
            {exercise.notes ? <span className="ml-1 italic">— {exercise.notes}</span> : null}
          </p>
          {last ? (
            <p className="text-xs mt-1">
              <span className="text-[var(--color-muted)]">Last ({last.date}):</span>{' '}
              <span className="font-mono">
                {last.sets
                  .map((s) => `${s.weight ?? 'BW'}×${s.reps}`)
                  .join(', ')}
              </span>
            </p>
          ) : (
            <p className="text-xs mt-1 text-[var(--color-muted)] italic">
              First time! Pick a starting weight.
            </p>
          )}
          {beatLastWeek === true && (
            <p className="text-xs mt-1 text-[var(--color-accent)] font-medium">
              ✓ Beat last week
            </p>
          )}
          {beatLastWeek === false && allLogged && (
            <p className="text-xs mt-1 text-[var(--color-bad)] font-medium">
              ✗ Below last week
            </p>
          )}
        </div>
        {exercise.swaps && exercise.swaps.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSwap((v) => !v)}
              className="text-xs px-2 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-muted)]"
            >
              Swap ▾
            </button>
            {showSwap && (
              <div className="absolute right-0 mt-1 z-10 w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setActiveKey(exercise.key);
                    setShowSwap(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-black ${
                    activeKey === exercise.key ? 'text-[var(--color-accent)]' : ''
                  }`}
                >
                  {exercise.name} (default)
                </button>
                {exercise.swaps.map((sk) => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => {
                      setActiveKey(sk);
                      setShowSwap(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-black ${
                      activeKey === sk ? 'text-[var(--color-accent)]' : ''
                    }`}
                  >
                    {exerciseName(sk)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <ol className="flex flex-col gap-2">
        {rows.map((row, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-1.5 rounded-lg ${
              row.saved ? 'bg-emerald-950/30' : 'bg-black'
            } px-2 py-1.5`}
          >
            <span className="w-5 text-xs text-[var(--color-muted)] tabular-nums">
              {row.setNumber}.
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => bumpWeight(idx, -2.5)}
                className="w-7 h-9 rounded-md bg-neutral-900 active:bg-neutral-800 text-lg leading-none"
              >
                −
              </button>
              <input
                type="number"
                inputMode="decimal"
                step="2.5"
                placeholder={lastSetWeight != null ? String(lastSetWeight) : 'lb'}
                value={row.weight}
                onChange={(e) => updateRow(idx, 'weight', e.target.value)}
                className="w-16 h-9 text-center bg-neutral-900 rounded-md text-lg tabular-nums font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => bumpWeight(idx, 2.5)}
                className="w-7 h-9 rounded-md bg-neutral-900 active:bg-neutral-800 text-lg leading-none"
              >
                +
              </button>
            </div>

            <span className="text-[var(--color-muted)] text-sm">×</span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => bumpReps(idx, -1)}
                className="w-7 h-9 rounded-md bg-neutral-900 active:bg-neutral-800 text-lg leading-none"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                placeholder="reps"
                value={row.reps}
                onChange={(e) => updateRow(idx, 'reps', e.target.value)}
                className="w-12 h-9 text-center bg-neutral-900 rounded-md text-lg tabular-nums font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => bumpReps(idx, 1)}
                className="w-7 h-9 rounded-md bg-neutral-900 active:bg-neutral-800 text-lg leading-none"
              >
                +
              </button>
            </div>

            <div className="ml-auto flex items-center gap-1">
              {row.saved ? (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={pending}
                  className="px-2 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-bad)]"
                >
                  ×
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => saveRow(idx)}
                  disabled={pending || !row.reps}
                  className="px-3 py-1.5 rounded-md bg-emerald-500 active:bg-emerald-600 text-black font-semibold text-sm disabled:opacity-30"
                >
                  Log
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
