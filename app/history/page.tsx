import { db } from '@/db/client';
import { workouts, sets, bodyLog, meals, vertLog, pickupLog, dayNotes } from '@/db/schema';
import { desc, eq, gte, sql, inArray } from 'drizzle-orm';
import { HistoryDashboard } from '../components/HistoryDashboard';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const d365 = new Date(today); d365.setDate(today.getDate() - 364);
  const d90 = new Date(today); d90.setDate(today.getDate() - 89);

  const [recentWorkouts, recentBody, recentProtein, recentVert, recentPickup, recentNotes] =
    await Promise.all([
      // Workouts + set counts for past 365 days
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
      db
        .select({ date: bodyLog.date, weightLb: bodyLog.weightLb, bodyFatPct: bodyLog.bodyFatPct })
        .from(bodyLog)
        .where(gte(bodyLog.date, iso(d90)))
        .orderBy(bodyLog.date),
      db
        .select({ date: meals.date, total: sql<number>`SUM(${meals.proteinG})` })
        .from(meals)
        .where(gte(meals.date, iso(d90)))
        .groupBy(meals.date)
        .orderBy(meals.date),
      db
        .select({ date: vertLog.date, vertIn: vertLog.vertIn })
        .from(vertLog)
        .where(gte(vertLog.date, iso(d90)))
        .orderBy(vertLog.date),
      db
        .select({ date: pickupLog.date, sport: pickupLog.sport })
        .from(pickupLog)
        .where(gte(pickupLog.date, iso(d90)))
        .orderBy(desc(pickupLog.date)),
      db
        .select({ date: dayNotes.date, note: dayNotes.note })
        .from(dayNotes)
        .where(gte(dayNotes.date, iso(d90)))
        .orderBy(dayNotes.date),
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
    </main>
  );
}
