import { DateRedirect } from '../components/DateRedirect';
import { CustomWorkout } from '../components/CustomWorkout';
import { db } from '@/db/client';
import { workouts, sets } from '@/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { program } from '@/lib/program';

export const dynamic = 'force-dynamic';

export default async function CustomPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const params = await searchParams;
  const date = params.d;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return <DateRedirect />;

  // Find or build today's custom workout's sets
  const today = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.date, date), eq(workouts.dayKey, 'custom')))
    .limit(1);
  const setsToday = today[0]
    ? await db.select().from(sets).where(eq(sets.workoutId, today[0].id))
    : [];

  // Suggestions: recent exercise_keys NOT already in the program defaults
  const programKeys = new Set(
    Object.values(program.workouts).flatMap((w) => w.exercises.map((e) => e.key)),
  );
  const recent = await db
    .selectDistinct({ key: sets.exerciseKey })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .orderBy(desc(sql`${workouts.date}`))
    .limit(40);
  const suggestions = recent
    .map((r) => r.key)
    .filter((k) => !programKeys.has(k));

  return (
    <main className="px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs text-[var(--color-muted)] tabular-nums">{date}</p>
        <h1 className="text-3xl font-bold tracking-tight">Custom Workout</h1>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Off-program / garage / improv. Logs save under day_key=&quot;custom&quot;.
        </p>
      </header>
      <CustomWorkout date={date} existingSets={setsToday} suggestions={suggestions} />
    </main>
  );
}
