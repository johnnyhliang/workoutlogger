'use server';

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
} from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { exerciseName } from '@/lib/program';

export async function exportAllAsMarkdown(): Promise<string> {
  const [
    allWorkouts,
    allMeals,
    allBody,
    allVert,
    allPickup,
    allNotes,
    allCustom,
  ] = await Promise.all([
    db.select().from(workouts).orderBy(desc(workouts.date), desc(workouts.id)),
    db.select().from(meals).orderBy(desc(meals.date), desc(meals.id)),
    db.select().from(bodyLog).orderBy(desc(bodyLog.date), desc(bodyLog.id)),
    db.select().from(vertLog).orderBy(desc(vertLog.date), desc(vertLog.id)),
    db.select().from(pickupLog).orderBy(desc(pickupLog.date), desc(pickupLog.id)),
    db.select().from(dayNotes).orderBy(desc(dayNotes.date)),
    db.select().from(customExercises).orderBy(customExercises.name),
  ]);

  const workoutIds = allWorkouts.map((w) => w.id);
  const allSets = workoutIds.length
    ? await db.select().from(sets).where(inArray(sets.workoutId, workoutIds))
    : [];
  const setsByWorkout = new Map<number, typeof allSets>();
  for (const s of allSets) {
    const arr = setsByWorkout.get(s.workoutId) ?? [];
    arr.push(s);
    setsByWorkout.set(s.workoutId, arr);
  }

  const lines: string[] = [];
  lines.push('# Lift Tracker — Full Export');
  lines.push('');
  lines.push(`_Exported: ${new Date().toISOString()}_`);
  lines.push('');

  lines.push('## Workouts');
  lines.push('');
  for (const w of allWorkouts) {
    lines.push(`### ${w.date} · ${w.dayKey}`);
    if (w.sleptOk != null) lines.push(`- slept_ok: ${w.sleptOk === 1 ? 'yes' : 'no'}`);
    if (w.notes) lines.push(`- notes: ${w.notes}`);
    const ws = setsByWorkout.get(w.id) ?? [];
    const byEx = new Map<string, typeof ws>();
    for (const s of ws) {
      const arr = byEx.get(s.exerciseKey) ?? [];
      arr.push(s);
      byEx.set(s.exerciseKey, arr);
    }
    for (const [k, list] of byEx) {
      const sorted = [...list].sort((a, b) => a.setNumber - b.setNumber);
      const formatted = sorted
        .map((s) => {
          const tags: string[] = [];
          if (s.isWarmup) tags.push('W');
          if (s.isSwap) tags.push('swap');
          const t = tags.length ? ` (${tags.join(',')})` : '';
          return `${s.weight ?? 'BW'}×${s.reps}${t}`;
        })
        .join(', ');
      lines.push(`- ${exerciseName(k)}: ${formatted}`);
    }
    lines.push('');
  }

  lines.push('## Day Notes');
  lines.push('');
  for (const n of allNotes) {
    lines.push(`### ${n.date}`);
    lines.push(n.note);
    lines.push('');
  }

  lines.push('## Protein');
  lines.push('');
  lines.push('| date | g | source | note |');
  lines.push('|---|---|---|---|');
  for (const m of allMeals) {
    lines.push(`| ${m.date} | ${m.proteinG} | ${m.source} | ${m.note ?? ''} |`);
  }
  lines.push('');

  lines.push('## Body');
  lines.push('');
  lines.push('| date | weight lb | bf % | notes |');
  lines.push('|---|---|---|---|');
  for (const b of allBody) {
    lines.push(
      `| ${b.date} | ${b.weightLb} | ${b.bodyFatPct ?? ''} | ${b.notes ?? ''} |`,
    );
  }
  lines.push('');

  lines.push('## Vert');
  lines.push('');
  lines.push('| date | vert in | notes |');
  lines.push('|---|---|---|');
  for (const v of allVert) {
    lines.push(`| ${v.date} | ${v.vertIn} | ${v.notes ?? ''} |`);
  }
  lines.push('');

  lines.push('## Pickup');
  lines.push('');
  lines.push('| date | sport | duration | notes |');
  lines.push('|---|---|---|---|');
  for (const p of allPickup) {
    lines.push(
      `| ${p.date} | ${p.sport} | ${p.durationMin ?? ''} | ${p.notes ?? ''} |`,
    );
  }
  lines.push('');

  lines.push('## Custom Exercises');
  lines.push('');
  for (const c of allCustom) {
    lines.push(`### ${c.name} (\`${c.key}\`)`);
    if (c.description) lines.push(c.description);
    lines.push('');
  }

  return lines.join('\n');
}
