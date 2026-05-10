'use client';

import { useEffect, useState } from 'react';
import { ExerciseCard } from './ExerciseCard';
import type { WorkoutSet } from '@/db/schema';

type CustomExercise = { key: string; name: string; sets: number; reps: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function CustomWorkout({
  date,
  existingSets,
  suggestions,
}: {
  date: string;
  existingSets: WorkoutSet[];
  suggestions: string[];
}) {
  const storageKey = `custom-workout:${date}`;
  const [items, setItems] = useState<CustomExercise[]>([]);
  const [name, setName] = useState('');
  const [setsN, setSetsN] = useState('3');
  const [reps, setReps] = useState('—');

  useEffect(() => {
    // Hydrate from localStorage + reconcile with any keys already in DB
    let saved: CustomExercise[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    const dbKeys = Array.from(new Set(existingSets.map((s) => s.exerciseKey)));
    for (const k of dbKeys) {
      if (!saved.find((s) => s.key === k)) {
        saved.push({ key: k, name: prettify(k), sets: 3, reps: '—' });
      }
    }
    setItems(saved);
  }, [storageKey, existingSets]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);

  function add(rawName: string) {
    const trimmed = rawName.trim();
    if (!trimmed) return;
    const key = slugify(trimmed);
    if (!key) return;
    if (items.find((i) => i.key === key)) return;
    const n = Math.max(1, Number(setsN) || 3);
    setItems((xs) => [...xs, { key, name: trimmed, sets: n, reps: reps || '—' }]);
    setName('');
  }

  function removeItem(key: string) {
    if (existingSets.find((s) => s.exerciseKey === key)) {
      const ok = confirm(`"${prettify(key)}" has logged sets. Hide from this view? (Sets stay in DB.)`);
      if (!ok) return;
    }
    setItems((xs) => xs.filter((i) => i.key !== key));
  }

  return (
    <>
      <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
        <h2 className="font-semibold mb-2">Add exercise</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sled Push"
            list="exercise-suggestions"
            className="flex-1 bg-neutral-900 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => add(name)}
            disabled={!name.trim()}
            className="px-4 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30"
          >
            Add
          </button>
        </div>
        <datalist id="exercise-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={prettify(s)} />
          ))}
        </datalist>
        <div className="flex gap-2 text-xs">
          <label className="flex items-center gap-1 text-[var(--color-muted)]">
            sets
            <input
              type="number"
              inputMode="numeric"
              value={setsN}
              onChange={(e) => setSetsN(e.target.value)}
              className="w-12 bg-neutral-900 rounded-md px-2 py-1 tabular-nums outline-none"
            />
          </label>
          <label className="flex items-center gap-1 text-[var(--color-muted)] flex-1">
            target reps
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g. 8-10"
              className="flex-1 bg-neutral-900 rounded-md px-2 py-1 outline-none"
            />
          </label>
        </div>
      </section>

      {items.map((ex) => (
        <div key={ex.key} className="relative">
          <ExerciseCard
            exercise={{ key: ex.key, name: ex.name, sets: ex.sets, reps: ex.reps, swaps: [] }}
            date={date}
            dayKey="custom"
            existingSets={existingSets.filter((s) => s.exerciseKey === ex.key)}
            lastSession={null}
          />
          <button
            type="button"
            onClick={() => removeItem(ex.key)}
            aria-label="Remove from view"
            className="absolute top-3 right-14 text-xs text-[var(--color-muted)] hover:text-[var(--color-bad)]"
          >
            hide
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-sm text-[var(--color-muted)] italic">
          No exercises yet. Add one above — type any name.
        </p>
      )}
    </>
  );
}

function prettify(slug: string): string {
  return slug
    .split('_')
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ');
}
