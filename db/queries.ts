import { db } from './client';

export type MobilityExercise = { key: string; name: string; reps: string; description: string | null };

const DEFAULT_MOBILITY: MobilityExercise[] = [
  { key: 'band_pull_aparts', name: 'Band Pull-aparts', reps: '50', description: null },
  { key: 'external_rotations', name: 'External Rotations', reps: '20 each side', description: null },
  { key: 'shoulder_dislocates', name: 'Shoulder Dislocates', reps: '10', description: null },
  { key: 'sleeper_stretch', name: 'Sleeper Stretch', reps: '1 min each side', description: null },
  { key: 'deep_squat_hold', name: 'Deep Squat Hold', reps: '60 sec', description: null },
];
import {
  workouts,
  sets,
  meals,
  bodyLog,
  vertLog,
  pickupLog,
  dayNotes,
  customExercises,
  mobilityConfig,
  mealsConfig,
} from './schema';
import { and, desc, eq, sql, inArray } from 'drizzle-orm';
import type { DayKey } from '@/lib/program';

export async function getLastFridayType(): Promise<DayKey | null> {
  const rows = await db
    .select({ dayKey: workouts.dayKey })
    .from(workouts)
    .where(inArray(workouts.dayKey, ['lower_power', 'upper_pull']))
    .orderBy(desc(workouts.date), desc(workouts.id))
    .limit(1);
  return (rows[0]?.dayKey as DayKey | undefined) ?? null;
}

export async function getWorkoutForDay(date: string) {
  const rows = await db
    .select()
    .from(workouts)
    .where(eq(workouts.date, date))
    .orderBy(desc(workouts.id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSetsForWorkout(workoutId: number) {
  return db
    .select()
    .from(sets)
    .where(eq(sets.workoutId, workoutId))
    .orderBy(sets.exerciseKey, sets.setNumber, sets.id);
}

/**
 * For a given exercise_key, return the sets from the most recent prior session
 * (any date strictly before `beforeDate`). Used by the "beat last week" badge.
 */
export async function getLastSessionForExercise(
  exerciseKey: string,
  beforeDate: string,
) {
  const last = await db
    .select({ workoutId: sets.workoutId, date: workouts.date })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(
      and(
        eq(sets.exerciseKey, exerciseKey),
        eq(sets.isWarmup, 0),
        sql`${workouts.date} < ${beforeDate}`,
      ),
    )
    .orderBy(desc(workouts.date), desc(sets.id))
    .limit(1);
  if (!last[0]) return null;
  const rows = await db
    .select()
    .from(sets)
    .where(
      and(
        eq(sets.workoutId, last[0].workoutId),
        eq(sets.exerciseKey, exerciseKey),
        eq(sets.isWarmup, 0),
      ),
    )
    .orderBy(sets.setNumber, sets.id);
  return { date: last[0].date, sets: rows };
}

export async function getProteinForDay(date: string) {
  const entries = await db
    .select()
    .from(meals)
    .where(eq(meals.date, date))
    .orderBy(desc(meals.id));
  const total = entries.reduce((s, e) => s + e.proteinG, 0);
  return { total, entries };
}

export async function getProteinForRange(startDate: string, endDate: string) {
  const rows = await db
    .select({
      date: meals.date,
      total: sql<number>`SUM(${meals.proteinG})`,
    })
    .from(meals)
    .where(and(sql`${meals.date} >= ${startDate}`, sql`${meals.date} <= ${endDate}`))
    .groupBy(meals.date)
    .orderBy(meals.date);
  return rows;
}

export async function getBodyLog(limit = 50) {
  return db.select().from(bodyLog).orderBy(desc(bodyLog.date), desc(bodyLog.id)).limit(limit);
}

export async function getVertLog(limit = 50) {
  return db.select().from(vertLog).orderBy(desc(vertLog.date), desc(vertLog.id)).limit(limit);
}

export async function getPickupLog(limit = 50) {
  return db
    .select()
    .from(pickupLog)
    .orderBy(desc(pickupLog.date), desc(pickupLog.id))
    .limit(limit);
}

export async function getDayNote(date: string): Promise<string | null> {
  const rows = await db.select().from(dayNotes).where(eq(dayNotes.date, date)).limit(1);
  return rows[0]?.note ?? null;
}

export async function getCustomExercises() {
  return db.select().from(customExercises).orderBy(customExercises.name);
}

export async function getMobilityExercises(): Promise<MobilityExercise[]> {
  const rows = await db.select().from(mobilityConfig).limit(1);
  if (!rows[0]) return DEFAULT_MOBILITY;
  try {
    return JSON.parse(rows[0].exercises) as MobilityExercise[];
  } catch {
    return DEFAULT_MOBILITY;
  }
}

export type ProteinPreset = { label: string; protein: number; source: string };

const DEFAULT_PRESETS: ProteinPreset[] = [
  { label: '3 eggs', protein: 21, source: 'eggs' },
  { label: '4 eggs', protein: 28, source: 'eggs' },
  { label: 'Chicken (palm)', protein: 35, source: 'chicken' },
  { label: 'Beef (palm)', protein: 35, source: 'beef' },
  { label: 'Fish (palm)', protein: 30, source: 'fish' },
  { label: 'Greek yogurt cup', protein: 20, source: 'yogurt' },
  { label: 'Cottage cheese cup', protein: 25, source: 'yogurt' },
  { label: 'Whey shake', protein: 25, source: 'shake' },
  { label: 'Tuna can', protein: 30, source: 'fish' },
];

export async function getMealsConfig(): Promise<{ presets: ProteinPreset[]; goalG: number }> {
  const rows = await db.select().from(mealsConfig).limit(1);
  if (!rows[0]) return { presets: DEFAULT_PRESETS, goalG: 180 };
  try {
    return { presets: JSON.parse(rows[0].presets) as ProteinPreset[], goalG: rows[0].goalG };
  } catch {
    return { presets: DEFAULT_PRESETS, goalG: 180 };
  }
}

export async function getExerciseHistory(exerciseKey: string, limit = 20) {
  // Returns one row per workout containing the exercise: top set + total volume.
  return db
    .select({
      workoutId: sets.workoutId,
      date: workouts.date,
      topWeight: sql<number | null>`MAX(${sets.weight})`,
      maxRepsAtTop: sql<number>`MAX(${sets.reps})`,
      totalReps: sql<number>`SUM(${sets.reps})`,
      totalVolume: sql<number>`COALESCE(SUM(${sets.weight} * ${sets.reps}), 0)`,
    })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(and(eq(sets.exerciseKey, exerciseKey), eq(sets.isWarmup, 0)))
    .groupBy(sets.workoutId, workouts.date)
    .orderBy(desc(workouts.date))
    .limit(limit);
}
