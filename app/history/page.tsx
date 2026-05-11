import { db } from '@/db/client';
import { workouts, sets, bodyLog, meals, vertLog, pickupLog, dayNotes } from '@/db/schema';
import { desc, eq, gte, sql, inArray } from 'drizzle-orm';
import { HistoryDashboard } from '../components/HistoryDashboard';
import { getExerciseHistory } from '@/db/queries';
import { exerciseName, program } from '@/lib/program';
import { Sparkline } from '../components/Sparkline';

export const dynamic = 'force-dynamic';

const ALL_KEYS = Array.from(
  new Set(Object.values(program.workouts).flatMap((w) => w.exercises.map((e) => e.key))),
);

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const params = await searchParams;
  const focus = params.exercise ?? null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const d365 = new Date(today); d365.setDate(today.getDate() - 364);
  const d90 = new Date(today); d90.setDate(today.getDate() - 89);

  const [recentWorkouts, recentBody, recentProtein, recentVert, recentPickup, recentNotes, focusHistory] =
    await Promise.all([
      (async () => {
        const ws = await db
          .select()
          .from(workouts)
          .where(gte(workouts.date, iso(d365)))
          .orderBy(desc(workouts.date), desc(workouts.id));
        const ids = ws.map((w) => w.id);
        const setCounts = ids.length
          ? await db
              .select({ workoutId: sets.workoutId, count: sql<number>`COUNT(*)` })
              .from(sets)
              .where(inArray(sets.workoutId, ids))
              .groupBy(sets.workoutId)
          : [];
        const countMap = new Map(setCounts.map((r) => [r.workoutId, r.count]));
        return ws.map((w) => ({ ...w, setCount: countMap.get(w.id) ?? 0 }));
      })(),
      db.select({ date: bodyLog.date, weightLb: bodyLog.weightLb, bodyFatPct: bodyLog.bodyFatPct })
        .from(bodyLog).where(gte(bodyLog.date, iso(d90))).orderBy(bodyLog.date),
      db.select({ date: meals.date, total: sql<number>`SUM(${meals.proteinG})` })
        .from(meals).where(gte(meals.date, iso(d90))).groupBy(meals.date).orderBy(meals.date),
      db.select({ date: vertLog.date, vertIn: vertLog.vertIn })
        .from(vertLog).where(gte(vertLog.date, iso(d90))).orderBy(vertLog.date),
      db.select({ date: pickupLog.date, sport: pickupLog.sport })
        .from(pickupLog).where(gte(pickupLog.date, iso(d90))).orderBy(desc(pickupLog.date)),
      db.select({ date: dayNotes.date, note: dayNotes.note })
        .from(dayNotes).where(gte(dayNotes.date, iso(d90))).orderBy(dayNotes.date),
      focus ? getExerciseHistory(focus, 20) : Promise.resolve([]),
    ]);

  return (
    <main className="px-4 pt-6 pb-24">
      <h1 className="text-3xl font-bold mb-4">History</h1>

      <HistoryDashboard
        workouts={recentWorkouts}
        bodyRows={recentBody}
        proteinRows={recentProtein}
        vertRows={recentVert}
        pickupRows={recentPickup}
        noteRows={recentNotes}
      />

      {/* Per-exercise progression */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Exercise progression</h2>
        <form className="flex gap-2 mb-3">
          <select
            name="exercise"
            defaultValue={focus ?? ''}
            className="bg-neutral-900 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm flex-1"
          >
            <option value="">— pick an exercise —</option>
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>{exerciseName(k)}</option>
            ))}
          </select>
          <button className="px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold">
            View
          </button>
        </form>

        {focus && focusHistory.length > 0 && (
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4">
            <h3 className="font-semibold mb-1">{exerciseName(focus)}</h3>
            <p className="text-xs text-[var(--color-muted)] mb-2">Top set weight per session (oldest → newest)</p>
            <Sparkline
              points={[...focusHistory].reverse().map((h, i) => ({ x: i, y: h.topWeight ?? 0, label: h.date }))}
            />
            <ul className="mt-3 text-xs space-y-1">
              {focusHistory.slice(0, 8).map((h) => (
                <li key={h.workoutId} className="flex justify-between tabular-nums">
                  <span className="text-[var(--color-muted)]">{h.date}</span>
                  <span>
                    {h.topWeight ?? 'BW'}×{h.maxRepsAtTop}
                    <span className="text-[var(--color-muted)] ml-2">vol {Math.round(h.totalVolume)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {focus && focusHistory.length === 0 && (
          <p className="text-sm text-[var(--color-muted)] italic">No data for {exerciseName(focus)} yet.</p>
        )}
      </section>
    </main>
  );
}
