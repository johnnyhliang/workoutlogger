'use client';

import { useState } from 'react';
import { ExerciseCard } from './ExerciseCard';
import type { WorkoutSet, CustomExercise } from '@/db/schema';
import type { Exercise } from '@/lib/program';

function toExercise(key: string, name: string): Exercise {
  return { key, name, sets: 3, reps: '8–12' };
}

function slugify(name: string) {
  return 'custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function CustomExerciseSection({
  date,
  savedExercises,
  existingSets,
}: {
  date: string;
  savedExercises: CustomExercise[];
  existingSets: WorkoutSet[];
}) {
  const existingKeys = [...new Set(existingSets.map((s) => s.exerciseKey))];
  const [activeKeys, setActiveKeys] = useState<string[]>(existingKeys);
  const [showPicker, setShowPicker] = useState(false);
  const [customName, setCustomName] = useState('');

  const setsByKey = new Map<string, WorkoutSet[]>();
  for (const s of existingSets) {
    const arr = setsByKey.get(s.exerciseKey) ?? [];
    arr.push(s);
    setsByKey.set(s.exerciseKey, arr);
  }

  const nameForKey = (key: string) => {
    const saved = savedExercises.find((e) => e.key === key);
    if (saved) return saved.name;
    return key.replace(/^custom_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const availableSaved = savedExercises.filter((e) => !activeKeys.includes(e.key));

  function addExercise(key: string) {
    setActiveKeys((ks) => (ks.includes(key) ? ks : [...ks, key]));
    setShowPicker(false);
    setCustomName('');
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    addExercise(slugify(name));
  }

  if (activeKeys.length === 0 && !showPicker) {
    return (
      <div className="mt-2 mb-3">
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full py-2 rounded-xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)]"
        >
          + add exercise
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {activeKeys.map((key) => (
        <ExerciseCard
          key={key}
          exercise={toExercise(key, nameForKey(key))}
          date={date}
          dayKey="custom"
          existingSets={setsByKey.get(key) ?? []}
          lastSession={null}
        />
      ))}

      {showPicker ? (
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
          <p className="text-sm font-semibold mb-3">Add exercise</p>
          {availableSaved.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {availableSaved.map((e) => (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => addExercise(e.key)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-[var(--color-border)] text-sm"
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New exercise name…"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); if (e.key === 'Escape') setShowPicker(false); }}
              autoFocus
              className="flex-1 h-9 px-3 rounded-lg bg-neutral-900 border border-[var(--color-border)] text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!customName.trim()}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-semibold disabled:opacity-30"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full py-2 mb-3 rounded-xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)]"
        >
          + add exercise
        </button>
      )}
    </div>
  );
}
