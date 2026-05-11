'use client';

import { useEffect, useState, useTransition } from 'react';
import { ExerciseCard } from './ExerciseCard';
import type { WorkoutSet, CustomExercise } from '@/db/schema';
import { useEscapeKey } from '@/lib/hooks';
import { saveCustomExercise, deleteCustomExercise } from '@/app/actions';

type DisplayExercise = CustomExercise & { sets: number; reps: string };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function prettify(slug: string): string {
  return slug.split('_').map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p)).join(' ');
}

export function CustomWorkout({
  date,
  existingSets,
  suggestions,
  savedExercises,
}: {
  date: string;
  existingSets: WorkoutSet[];
  suggestions: string[];
  savedExercises: CustomExercise[];
}) {
  const [items, setItems] = useState<DisplayExercise[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'workout' | 'library'>('workout');

  // Add form state
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [setsN, setSetsN] = useState('3');
  const [reps, setReps] = useState('—');

  // Edit state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');

  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const map = new Map<string, DisplayExercise>();
    for (const ex of savedExercises) {
      map.set(ex.key, { ...ex, sets: 3, reps: '—' });
    }
    // Reconcile: keys in DB sets not yet in library
    const dbKeys = Array.from(new Set(existingSets.map((s) => s.exerciseKey)));
    for (const k of dbKeys) {
      if (!map.has(k)) {
        map.set(k, {
          key: k, name: prettify(k), description: null,
          category: null, videoUrl: null,
          createdAt: Date.now(), sets: 3, reps: '—',
        });
      }
    }
    setItems(Array.from(map.values()));
    // Pre-activate any exercise with existing sets today
    setActiveKeys(new Set(dbKeys));
  }, [savedExercises, existingSets]);

  const formActive = name.trim() !== '' || desc.trim() !== '' || videoUrl.trim() !== '';
  useEscapeKey(formActive, () => { setName(''); setDesc(''); setCategory(''); setVideoUrl(''); });
  useEscapeKey(editingKey !== null, () => setEditingKey(null));

  function addExercise() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = slugify(trimmed);
    if (!key) return;
    const n = Math.max(1, Number(setsN) || 3);
    const finalDesc = desc.trim() || null;
    const finalCat = category.trim() || null;
    const finalUrl = videoUrl.trim() || null;
    startTransition(async () => {
      await saveCustomExercise({ key, name: trimmed, description: finalDesc, category: finalCat, videoUrl: finalUrl });
      const newEx: DisplayExercise = {
        key, name: trimmed, description: finalDesc, category: finalCat,
        videoUrl: finalUrl, createdAt: Date.now(), sets: n, reps: reps || '—',
      };
      setItems((xs) => {
        const existing = xs.find((i) => i.key === key);
        if (existing) return xs.map((i) => i.key === key ? { ...i, ...newEx } : i);
        return [...xs, newEx];
      });
      setActiveKeys((s) => new Set([...s, key]));
      setName(''); setDesc(''); setCategory(''); setVideoUrl('');
    });
  }

  function saveEdit(key: string) {
    startTransition(async () => {
      await saveCustomExercise({
        key,
        name: items.find((i) => i.key === key)?.name ?? key,
        description: editDesc.trim() || null,
        category: editCategory.trim() || null,
        videoUrl: editVideoUrl.trim() || null,
      });
      setItems((xs) => xs.map((i) => i.key === key
        ? { ...i, description: editDesc.trim() || null, category: editCategory.trim() || null, videoUrl: editVideoUrl.trim() || null }
        : i
      ));
      setEditingKey(null);
    });
  }

  function removeExercise(key: string) {
    const hasLogs = existingSets.find((s) => s.exerciseKey === key);
    const msg = hasLogs
      ? `"${prettify(key)}" has logged sets. Delete from library? (Sets stay in DB.)`
      : `Delete "${prettify(key)}" from library?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      await deleteCustomExercise(key);
      setItems((xs) => xs.filter((i) => i.key !== key));
      setActiveKeys((s) => { const n = new Set(s); n.delete(key); return n; });
    });
  }

  function toggleActive(key: string) {
    setActiveKeys((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  }

  // Group by category for library view
  const categories = Array.from(new Set(items.map((i) => i.category ?? 'Uncategorized'))).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  const activeItems = items.filter((i) => activeKeys.has(i.key));

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('workout')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${tab === 'workout' ? 'bg-emerald-500 text-black' : 'bg-neutral-900'}`}
        >
          Today's workout
        </button>
        <button
          type="button"
          onClick={() => setTab('library')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${tab === 'library' ? 'bg-emerald-500 text-black' : 'bg-neutral-900'}`}
        >
          Exercise library
        </button>
      </div>

      {tab === 'workout' && (
        <>
          {/* Quick-add picker from library */}
          {items.length > 0 && (
            <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
              <h2 className="font-semibold text-sm mb-2">Add to today</h2>
              <div className="flex flex-wrap gap-2">
                {items.map((ex) => (
                  <button
                    key={ex.key}
                    type="button"
                    onClick={() => toggleActive(ex.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      activeKeys.has(ex.key)
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-neutral-900 text-[var(--color-muted)] border-[var(--color-border)]'
                    }`}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2 italic">Tap to add/remove from today. Go to library to create new exercises.</p>
            </section>
          )}

          {activeItems.length === 0 && (
            <p className="text-sm text-[var(--color-muted)] italic mb-3">
              {items.length === 0
                ? 'No exercises in library yet. Go to Exercise library to add some.'
                : 'Tap exercises above to add them to today\'s workout.'}
            </p>
          )}

          {activeItems.map((ex) => (
            <ExerciseCard
              key={ex.key}
              exercise={{ key: ex.key, name: ex.name, sets: ex.sets, reps: ex.reps, swaps: [] }}
              date={date}
              dayKey="custom"
              existingSets={existingSets.filter((s) => s.exerciseKey === ex.key)}
              lastSession={null}
            />
          ))}
        </>
      )}

      {tab === 'library' && (
        <>
          {/* Add exercise form */}
          <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
            <h2 className="font-semibold mb-3">New exercise</h2>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addExercise(); }}
                placeholder="Exercise name"
                list="exercise-suggestions"
                className="flex-1 bg-neutral-900 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                disabled={pending}
              />
              <button
                type="button"
                onClick={addExercise}
                disabled={!name.trim() || pending}
                className="px-4 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30"
              >
                Add
              </button>
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g. Lower, Upper, Core)"
              className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
              disabled={pending}
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Technique notes — cues, setup, what to watch for, common mistakes…"
              rows={4}
              className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 mb-2 resize-y"
              disabled={pending}
            />
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube / video URL (optional)"
              className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
              disabled={pending}
            />
            <datalist id="exercise-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <div className="flex gap-2 text-xs">
              <label className="flex items-center gap-1 text-[var(--color-muted)]">
                default sets
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

          {/* Exercise list grouped by category */}
          {items.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] italic">No exercises in library yet.</p>
          ) : (
            categories.map((cat) => {
              const catItems = items.filter((i) => (i.category ?? 'Uncategorized') === cat);
              return (
                <section key={cat} className="mb-4">
                  <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">{cat}</h3>
                  <ul className="flex flex-col gap-2">
                    {catItems.map((ex) => (
                      <li
                        key={ex.key}
                        className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3"
                      >
                        {editingKey === ex.key ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">{ex.name}</span>
                              <button type="button" onClick={() => setEditingKey(null)} className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7">✕</button>
                            </div>
                            <input
                              type="text"
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              placeholder="Category"
                              className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              placeholder="Technique notes…"
                              rows={4}
                              className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
                            />
                            <input
                              type="url"
                              value={editVideoUrl}
                              onChange={(e) => setEditVideoUrl(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(ex.key); }}
                              placeholder="YouTube / video URL"
                              className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(ex.key)}
                                disabled={pending}
                                className="px-3 py-1.5 rounded-md bg-emerald-500 text-black text-xs font-semibold disabled:opacity-30"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-sm">{ex.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingKey(ex.key);
                                    setEditDesc(ex.description ?? '');
                                    setEditCategory(ex.category ?? '');
                                    setEditVideoUrl(ex.videoUrl ?? '');
                                  }}
                                  className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-sm"
                                  aria-label="Edit"
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeExercise(ex.key)}
                                  disabled={pending}
                                  className="text-[var(--color-muted)] hover:text-[var(--color-bad)] text-sm"
                                  aria-label="Delete"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                            {ex.description && (
                              <p className="text-xs text-[var(--color-muted)] mt-1 whitespace-pre-wrap">{ex.description}</p>
                            )}
                            {ex.videoUrl && (
                              <a
                                href={ex.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-400 underline mt-1 block truncate"
                              >
                                {ex.videoUrl}
                              </a>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </>
      )}
    </>
  );
}
