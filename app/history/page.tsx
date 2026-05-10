import { db } from '@/db/client';
import { workouts, sets } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { dayLabel } from '@/lib/day-logic';
import type { DayKey } from '@/lib/program';
import { exerciseName, program } from '@/lib/program';
import { getExerciseHistory } from '@/db/queries';
import { Sparkline } from '../components/Sparkline';

export const dynamic = 'force-dynamic';

const ALL_KEYS = Array.from(
  new Set(
    Object.values(program.workouts).flatMap((w) => w.exercises.map((e) => e.key)),
  ),
);

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const params = await searchParams;
  const focus = params.exercise ?? null;

  const recent = await db
    .select()
    .from(workouts)
    .orderBy(desc(workouts.date), desc(workouts.id))
    .limit(30);

  const ids = recent.map((w) => w.id);
  const allSets = ids.length
    ? await db.select().from(sets).where(inArray(sets.workoutId, ids))
    : [];
  const setsByWorkout = new Map<number, typeof allSets>();
  for (const s of allSets) {
    const arr = setsByWorkout.get(s.workoutId) ?? [];
    arr.push(s);
    setsByWorkout.set(s.workoutId, arr);
  }

  const focusHistory = focus ? await getExerciseHistory(focus, 20) : [];

  return (
    <main className="px-4 pt-6">
      <h1 className="text-3xl font-bold mb-4">History</h1>

      <section className="mb-4">
        <label className="block text-xs text-[var(--color-muted)] mb-1">
          Filter exercise (chart progression)
        </label>
        <form action="" className="flex gap-2">
          <select
            name="exercise"
            defaultValue={focus ?? ''}
            className="bg-neutral-900 border border-[var(--color-border)] rounded-md px-2 py-2 text-sm flex-1"
          >
            <option value="">— all —</option>
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>
                {exerciseName(k)}
              </option>
            ))}
          </select>
          <button className="px-3 py-2 rounded-md bg-emerald-500 text-black text-sm font-semibold">
            Go
          </button>
        </form>
      </section>

      {focus && focusHistory.length > 0 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
          <h2 className="font-semibold mb-1">{exerciseName(focus)} top set</h2>
          <p className="text-xs text-[var(--color-muted)] mb-2">
            Latest first → oldest. Y axis = top weight per session.
          </p>
          <Sparkline
            points={[...focusHistory]
              .reverse()
              .map((h, i) => ({ x: i, y: h.topWeight ?? 0, label: h.date }))}
          />
          <ul className="mt-2 text-xs space-y-0.5">
            {focusHistory.slice(0, 6).map((h) => (
              <li key={h.workoutId} className="flex justify-between tabular-nums">
                <span>{h.date}</span>
                <span>
                  {h.topWeight ?? 'BW'}×{h.maxRepsAtTop} ·{' '}
                  <span className="text-[var(--color-muted)]">vol {Math.round(h.totalVolume)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">No workouts logged yet.</p>
      )}

      <ul className="flex flex-col gap-3">
        {recent.map((w) => {
          const ws = setsByWorkout.get(w.id) ?? [];
          const byEx = new Map<string, typeof ws>();
          for (const s of ws) {
            const arr = byEx.get(s.exerciseKey) ?? [];
            arr.push(s);
            byEx.set(s.exerciseKey, arr);
          }
          return (
            <li
              key={w.id}
              className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-semibold">{dayLabel(w.dayKey as DayKey)}</h3>
                <span className="text-xs text-[var(--color-muted)] tabular-nums">{w.date}</span>
              </div>
              {byEx.size === 0 ? (
                <p className="text-xs text-[var(--color-muted)] italic">No sets logged.</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {Array.from(byEx.entries()).map(([k, list]) => (
                    <li key={k} className="flex justify-between gap-3">
                      <span className="text-[var(--color-muted)] truncate">
                        {exerciseName(k)}
                        {list[0]?.isSwap === 1 ? ' *' : ''}
                      </span>
                      <span className="font-mono tabular-nums">
                        {list
                          .map((s) => `${s.weight ?? 'BW'}×${s.reps}`)
                          .join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
