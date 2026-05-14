'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  workouts,
  sets,
  meals,
  bodyLog,
  vertLog,
  pickupLog,
  dayNotes,
  customExercises,
  guideContent,
  mobilityConfig,
  mealsConfig,
  reminders,
} from '@/db/schema';
import type { MobilityExercise, ProteinPreset } from '@/db/queries';
import type { DayKey } from '@/lib/program';

async function ensureWorkout(date: string, dayKey: string): Promise<number> {
  const existing = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.date, date), eq(workouts.dayKey, dayKey)))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const inserted = await db
    .insert(workouts)
    .values({ date, dayKey })
    .returning({ id: workouts.id });
  return inserted[0].id;
}

export async function logSet(input: {
  date: string;
  dayKey: DayKey | 'custom';
  exerciseKey: string;
  setNumber: number;
  weight: number | null;
  reps: number;
  rpe?: number | null;
  isSwap?: boolean;
  isWarmup?: boolean;
}) {
  const workoutId = await ensureWorkout(input.date, input.dayKey as DayKey);
  // Upsert by (workout_id, exercise_key, set_number).
  const existing = await db
    .select({ id: sets.id })
    .from(sets)
    .where(
      and(
        eq(sets.workoutId, workoutId),
        eq(sets.exerciseKey, input.exerciseKey),
        eq(sets.setNumber, input.setNumber),
      ),
    )
    .limit(1);
  if (existing[0]) {
    await db
      .update(sets)
      .set({
        weight: input.weight,
        reps: input.reps,
        rpe: input.rpe ?? null,
        isSwap: input.isSwap ? 1 : 0,
        isWarmup: input.isWarmup ? 1 : 0,
      })
      .where(eq(sets.id, existing[0].id));
  } else {
    await db.insert(sets).values({
      workoutId,
      exerciseKey: input.exerciseKey,
      setNumber: input.setNumber,
      weight: input.weight,
      reps: input.reps,
      rpe: input.rpe ?? null,
      isSwap: input.isSwap ? 1 : 0,
      isWarmup: input.isWarmup ? 1 : 0,
    });
  }
  revalidatePath('/');
  revalidatePath('/history');
}

export async function deleteSet(setId: number) {
  await db.delete(sets).where(eq(sets.id, setId));
  revalidatePath('/');
  revalidatePath('/history');
}

export async function setSleptOk(date: string, dayKey: DayKey, slept: boolean | null) {
  const workoutId = await ensureWorkout(date, dayKey);
  await db
    .update(workouts)
    .set({ sleptOk: slept === null ? null : slept ? 1 : 0 })
    .where(eq(workouts.id, workoutId));
  revalidatePath('/');
}

export async function logProtein(input: { date: string; proteinG: number; source: string; note?: string }) {
  await db.insert(meals).values({
    date: input.date,
    proteinG: input.proteinG,
    source: input.source,
    note: input.note ?? null,
  });
  revalidatePath('/meals');
  revalidatePath('/history');
}

export async function deleteProtein(id: number) {
  await db.delete(meals).where(eq(meals.id, id));
  revalidatePath('/meals');
  revalidatePath('/history');
}

export async function editProtein(input: {
  id: number;
  proteinG: number;
  source: string;
  note?: string | null;
}) {
  await db
    .update(meals)
    .set({ proteinG: input.proteinG, source: input.source, note: input.note ?? null })
    .where(eq(meals.id, input.id));
  revalidatePath('/meals');
  revalidatePath('/history');
}

export async function logBodyWeight(input: {
  date: string;
  weightLb: number;
  bodyFatPct?: number | null;
  notes?: string;
}) {
  await db.insert(bodyLog).values({
    date: input.date,
    weightLb: input.weightLb,
    bodyFatPct: input.bodyFatPct ?? null,
    notes: input.notes ?? null,
  });
  revalidatePath('/weight');
  revalidatePath('/history');
}

export async function deleteBodyWeight(id: number) {
  await db.delete(bodyLog).where(eq(bodyLog.id, id));
  revalidatePath('/weight');
  revalidatePath('/history');
}

export async function editBodyWeight(input: {
  id: number;
  weightLb: number;
  bodyFatPct?: number | null;
  notes?: string | null;
}) {
  await db
    .update(bodyLog)
    .set({
      weightLb: input.weightLb,
      bodyFatPct: input.bodyFatPct ?? null,
      notes: input.notes ?? null,
    })
    .where(eq(bodyLog.id, input.id));
  revalidatePath('/weight');
  revalidatePath('/history');
}

export async function logVert(input: { date: string; vertIn: number; notes?: string }) {
  await db.insert(vertLog).values({
    date: input.date,
    vertIn: input.vertIn,
    notes: input.notes ?? null,
  });
  revalidatePath('/vert');
  revalidatePath('/history');
}

export async function deleteVert(id: number) {
  await db.delete(vertLog).where(eq(vertLog.id, id));
  revalidatePath('/vert');
  revalidatePath('/history');
}

export async function editVert(input: { id: number; vertIn: number; notes?: string | null }) {
  await db
    .update(vertLog)
    .set({ vertIn: input.vertIn, notes: input.notes ?? null })
    .where(eq(vertLog.id, input.id));
  revalidatePath('/vert');
  revalidatePath('/history');
}

export async function logPickup(input: {
  date: string;
  sport: string;
  durationMin?: number | null;
  notes?: string;
}) {
  await db.insert(pickupLog).values({
    date: input.date,
    sport: input.sport,
    durationMin: input.durationMin ?? null,
    notes: input.notes ?? null,
  });
  revalidatePath('/pickup');
  revalidatePath('/');
  revalidatePath('/history');
}

export async function deletePickup(id: number) {
  await db.delete(pickupLog).where(eq(pickupLog.id, id));
  revalidatePath('/pickup');
  revalidatePath('/');
  revalidatePath('/history');
}

export async function editPickup(input: {
  id: number;
  sport: string;
  durationMin: number | null;
  notes?: string | null;
}) {
  await db
    .update(pickupLog)
    .set({ sport: input.sport, durationMin: input.durationMin, notes: input.notes ?? null })
    .where(eq(pickupLog.id, input.id));
  revalidatePath('/pickup');
  revalidatePath('/history');
}

export async function setDayNote(date: string, note: string) {
  if (!note.trim()) {
    await db.delete(dayNotes).where(eq(dayNotes.date, date));
  } else {
    const existing = await db.select({ date: dayNotes.date }).from(dayNotes).where(eq(dayNotes.date, date)).limit(1);
    if (existing[0]) {
      await db
        .update(dayNotes)
        .set({ note, updatedAt: Date.now() })
        .where(eq(dayNotes.date, date));
    } else {
      await db.insert(dayNotes).values({ date, note });
    }
  }
  revalidatePath('/');
  revalidatePath('/history');
}

export async function saveCustomExercise(input: {
  key: string;
  name: string;
  description?: string | null;
  category?: string | null;
  videoUrl?: string | null;
}) {
  const existing = await db
    .select({ key: customExercises.key })
    .from(customExercises)
    .where(eq(customExercises.key, input.key))
    .limit(1);
  if (existing[0]) {
    await db
      .update(customExercises)
      .set({
        name: input.name,
        description: input.description ?? null,
        category: input.category ?? null,
        videoUrl: input.videoUrl ?? null,
      })
      .where(eq(customExercises.key, input.key));
  } else {
    await db.insert(customExercises).values({
      key: input.key,
      name: input.name,
      description: input.description ?? null,
      category: input.category ?? null,
      videoUrl: input.videoUrl ?? null,
    });
  }
  revalidatePath('/custom');
  revalidatePath('/custom');
}

export async function deleteCustomExercise(key: string) {
  await db.delete(customExercises).where(eq(customExercises.key, key));
  revalidatePath('/custom');
  revalidatePath('/custom');
}

export async function saveMobilityConfig(exercises: MobilityExercise[]) {
  const json = JSON.stringify(exercises);
  const existing = await db.select({ id: mobilityConfig.id }).from(mobilityConfig).limit(1);
  if (existing[0]) {
    await db.update(mobilityConfig).set({ exercises: json, updatedAt: Date.now() }).where(eq(mobilityConfig.id, existing[0].id));
  } else {
    await db.insert(mobilityConfig).values({ id: 1, exercises: json });
  }
  revalidatePath('/');
  revalidatePath('/custom');
}

export async function saveMealsConfig(presets: ProteinPreset[], goalG: number) {
  const json = JSON.stringify(presets);
  const existing = await db.select({ id: mealsConfig.id }).from(mealsConfig).limit(1);
  if (existing[0]) {
    await db.update(mealsConfig).set({ presets: json, goalG, updatedAt: Date.now() }).where(eq(mealsConfig.id, existing[0].id));
  } else {
    await db.insert(mealsConfig).values({ id: 1, presets: json, goalG });
  }
  revalidatePath('/meals');
}

export async function logoutAction() {
  const { cookies } = await import('next/headers');
  const { redirect: redir } = await import('next/navigation');
  const jar = await cookies();
  jar.delete('app_auth');
  redir('/login');
}

export async function saveReminder(input: { name: string; timeHHMM: string }) {
  await db.insert(reminders).values({ name: input.name, timeHHMM: input.timeHHMM });
  revalidatePath('/reminders');
}

export async function deleteReminder(id: number) {
  await db.delete(reminders).where(eq(reminders.id, id));
  revalidatePath('/reminders');
}

export async function toggleReminder(id: number, enabled: boolean) {
  await db.update(reminders).set({ enabled: enabled ? 1 : 0 }).where(eq(reminders.id, id));
  revalidatePath('/reminders');
}

export async function saveGuide(content: string) {
  const existing = await db.select({ id: guideContent.id }).from(guideContent).limit(1);
  if (existing[0]) {
    await db
      .update(guideContent)
      .set({ content, updatedAt: Date.now() })
      .where(eq(guideContent.id, existing[0].id));
  } else {
    await db.insert(guideContent).values({ id: 1, content });
  }
  revalidatePath('/guide');
}
