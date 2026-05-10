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
} from '@/db/schema';
import type { DayKey } from '@/lib/program';

async function ensureWorkout(date: string, dayKey: DayKey): Promise<number> {
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
  dayKey: DayKey;
  exerciseKey: string;
  setNumber: number;
  weight: number | null;
  reps: number;
  rpe?: number | null;
  isSwap?: boolean;
}) {
  const workoutId = await ensureWorkout(input.date, input.dayKey);
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
}

export async function deleteProtein(id: number) {
  await db.delete(meals).where(eq(meals.id, id));
  revalidatePath('/meals');
}

export async function logBodyWeight(input: { date: string; weightLb: number; notes?: string }) {
  await db.insert(bodyLog).values({
    date: input.date,
    weightLb: input.weightLb,
    notes: input.notes ?? null,
  });
  revalidatePath('/weight');
}

export async function deleteBodyWeight(id: number) {
  await db.delete(bodyLog).where(eq(bodyLog.id, id));
  revalidatePath('/weight');
}

export async function logVert(input: { date: string; vertIn: number; notes?: string }) {
  await db.insert(vertLog).values({
    date: input.date,
    vertIn: input.vertIn,
    notes: input.notes ?? null,
  });
  revalidatePath('/vert');
}

export async function deleteVert(id: number) {
  await db.delete(vertLog).where(eq(vertLog.id, id));
  revalidatePath('/vert');
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
}

export async function deletePickup(id: number) {
  await db.delete(pickupLog).where(eq(pickupLog.id, id));
  revalidatePath('/pickup');
  revalidatePath('/');
}
