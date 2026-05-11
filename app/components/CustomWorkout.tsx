'use client';

import { useState, useTransition } from 'react';
import { ExerciseCard } from './ExerciseCard';
import type { WorkoutSet, CustomExercise } from '@/db/schema';
import type { MobilityExercise } from '@/db/queries';
import { useEscapeKey } from '@/lib/hooks';
import { saveCustomExercise, deleteCustomExercise, saveMobilityConfig } from '@/app/actions';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function prettify(slug: string): string {
  return slug.split('_').map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p)).join(' ');
}

// ── Mobility section ─────────────────────────────────────────────────────────

function MobilityManager({ initial }: { initial: MobilityExercise[] }) {
  const [exercises, setExercises] = useState<MobilityExercise[]>(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [addName, setAddName] = useState('');
  const [addReps, setAddReps] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [editName, setEditName] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [pending, startTransition] = useTransition();

  useEscapeKey(showAdd, () => { setShowAdd(false); setAddName(''); setAddReps(''); setAddDesc(''); });
  useEscapeKey(editingKey !== null, () => setEditingKey(null));

  async function save(next: MobilityExercise[]) {
    setExercises(next);
    await saveMobilityConfig(next);
  }

  function addExercise() {
    const name = addName.trim();
    if (!name) return;
    const key = 'mob_' + slugify(name);
    const ex: MobilityExercise = { key, name, reps: addReps.trim() || '—', description: addDesc.trim() || null };
    startTransition(() => save([...exercises, ex]));
    setAddName(''); setAddReps(''); setAddDesc(''); setShowAdd(false);
  }

  function saveEdit(key: string) {
    const next = exercises.map((e) =>
      e.key === key ? { ...e, name: editName.trim() || e.name, reps: editReps.trim() || e.reps, description: editDesc.trim() || null } : e
    );
    startTransition(() => save(next));
    setEditingKey(null);
  }

  function remove(key: string) {
    if (!confirm('Remove this mobility exercise?')) return;
    startTransition(() => save(exercises.filter((e) => e.key !== key)));
  }

  function startEdit(e: MobilityExercise) {
    setEditingKey(e.key);
    setEditName(e.name);
    setEditReps(e.reps);
    setEditDesc(e.description ?? '');
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">Daily Mobility</h2>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-[var(--color-border)] text-[var(--color-muted)]"
        >
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3 mb-3 flex flex-col gap-2">
          <input
            type="text" placeholder="Exercise name" value={addName} autoFocus
            onChange={(e) => setAddName(e.target.value)}
            className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="text" placeholder="Reps / time (e.g. 20 each side)" value={addReps}
            onChange={(e) => setAddReps(e.target.value)}
            className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <textarea
            placeholder="Description / cues (optional)" value={addDesc} rows={3}
            onChange={(e) => setAddDesc(e.target.value)}
            className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
          />
          <button
            type="button" onClick={addExercise} disabled={!addName.trim() || pending}
            className="self-end px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-semibold disabled:opacity-30"
          >
            Add
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {exercises.map((ex) => (
          <li key={ex.key} className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3">
            {editingKey === ex.key ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text" value={editReps} onChange={(e) => setEditReps(e.target.value)}
                  placeholder="Reps / time"
                  className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <textarea
                  value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description / cues" rows={3}
                  className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingKey(null)} className="text-xs text-[var(--color-muted)]">Cancel</button>
                  <button
                    type="button" onClick={() => saveEdit(ex.key)} disabled={pending}
                    className="px-3 py-1 rounded-md bg-emerald-500 text-black text-xs font-semibold disabled:opacity-30"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{ex.name} <span className="font-normal text-xs text-[var(--color-muted)]">— {ex.reps}</span></p>
                  {ex.description && <p className="text-xs text-[var(--color-muted)] mt-0.5 whitespace-pre-wrap">{ex.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => startEdit(ex)} className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-sm" aria-label="Edit">✎</button>
                  <button type="button" onClick={() => remove(ex.key)} disabled={pending} className="text-[var(--color-muted)] hover:text-[var(--color-bad)] text-sm" aria-label="Remove">×</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CustomWorkout({
  date,
  existingSets,
  suggestions,
  savedExercises,
  mobilityExercises,
}: {
  date: string;
  existingSets: WorkoutSet[];
  suggestions: string[];
  savedExercises: CustomExercise[];
  mobilityExercises: MobilityExercise[];
}) {
  const existingKeys = [...new Set(existingSets.map((s) => s.exerciseKey))];
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(existingKeys));
  const [showAdd, setShowAdd] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Library items (saved exercises + any unsaved keys from existing sets)
  const [library, setLibrary] = useState<CustomExercise[]>(() => {
    const map = new Map(savedExercises.map((e) => [e.key, e]));
    for (const k of existingKeys) {
      if (!map.has(k)) map.set(k, { key: k, name: prettify(k), description: null, category: null, videoUrl: null, createdAt: Date.now() });
    }
    return [...map.values()];
  });

  // Add form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');

  const [pending, startTransition] = useTransition();

  useEscapeKey(showAdd, () => { setShowAdd(false); setName(''); setDesc(''); setCategory(''); setVideoUrl(''); });
  useEscapeKey(editingKey !== null, () => setEditingKey(null));

  function toggleActive(key: string) {
    setActiveKeys((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  }

  function addExercise() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = slugify(trimmed);
    const ex: CustomExercise = { key, name: trimmed, description: desc.trim() || null, category: category.trim() || null, videoUrl: videoUrl.trim() || null, createdAt: Date.now() };
    startTransition(async () => {
      await saveCustomExercise({ key, name: trimmed, description: ex.description, category: ex.category, videoUrl: ex.videoUrl });
      setLibrary((xs) => xs.some((i) => i.key === key) ? xs.map((i) => i.key === key ? ex : i) : [...xs, ex]);
      setActiveKeys((s) => new Set([...s, key]));
    });
    setName(''); setDesc(''); setCategory(''); setVideoUrl(''); setShowAdd(false);
  }

  function saveEdit(key: string) {
    const orig = library.find((i) => i.key === key);
    if (!orig) return;
    const updated = { ...orig, name: editName.trim() || orig.name, description: editDesc.trim() || null, category: editCategory.trim() || null, videoUrl: editVideoUrl.trim() || null };
    startTransition(async () => {
      await saveCustomExercise({ key, name: updated.name, description: updated.description, category: updated.category, videoUrl: updated.videoUrl });
      setLibrary((xs) => xs.map((i) => i.key === key ? updated : i));
    });
    setEditingKey(null);
  }

  function removeExercise(key: string) {
    const hasLogs = existingSets.some((s) => s.exerciseKey === key);
    if (!confirm(hasLogs ? `"${prettify(key)}" has logged sets. Remove from library? (Sets stay in DB.)` : `Remove "${prettify(key)}" from library?`)) return;
    startTransition(async () => {
      await deleteCustomExercise(key);
      setLibrary((xs) => xs.filter((i) => i.key !== key));
      setActiveKeys((s) => { const n = new Set(s); n.delete(key); return n; });
    });
  }

  const categories = [...new Set(library.map((i) => i.category ?? 'Uncategorized'))].sort((a, b) => a === 'Uncategorized' ? 1 : b === 'Uncategorized' ? -1 : a.localeCompare(b));
  const activeItems = library.filter((i) => activeKeys.has(i.key));
  const setsByKey = new Map<string, WorkoutSet[]>();
  for (const s of existingSets) {
    const arr = setsByKey.get(s.exerciseKey) ?? [];
    arr.push(s);
    setsByKey.set(s.exerciseKey, arr);
  }

  return (
    <>
      {/* ── Today's workout ── */}
      {library.length > 0 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
          <h2 className="font-semibold text-sm mb-2">Add to today</h2>
          <div className="flex flex-wrap gap-2">
            {library.map((ex) => (
              <button
                key={ex.key} type="button" onClick={() => toggleActive(ex.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${activeKeys.has(ex.key) ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-neutral-900 text-[var(--color-muted)] border-[var(--color-border)]'}`}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {activeItems.length === 0 && library.length === 0 && (
        <p className="text-sm text-[var(--color-muted)] italic mb-3">Add exercises to the library below, then tap them to log sets.</p>
      )}

      {activeItems.map((ex) => (
        <ExerciseCard
          key={ex.key}
          exercise={{ key: ex.key, name: ex.name, sets: 3, reps: '8–12' }}
          date={date} dayKey="custom"
          existingSets={setsByKey.get(ex.key) ?? []}
          lastSession={null}
        />
      ))}

      {/* ── Exercise library ── */}
      <div className="mt-4 mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">Exercise Library</h2>
        <button
          type="button" onClick={() => setShowAdd((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-[var(--color-border)] text-[var(--color-muted)]"
        >
          {showAdd ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text" placeholder="Exercise name" value={name} autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addExercise(); }}
              list="exercise-suggestions"
              className="flex-1 bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={pending}
            />
            <button type="button" onClick={addExercise} disabled={!name.trim() || pending} className="px-4 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30">Add</button>
          </div>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Lower, Upper, Core)" className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500" disabled={pending} />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Technique notes…" rows={3} className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-y" disabled={pending} />
          <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube / video URL (optional)" className="w-full bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500" disabled={pending} />
          <datalist id="exercise-suggestions">{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
      )}

      {library.length === 0 && !showAdd ? (
        <p className="text-sm text-[var(--color-muted)] italic mb-2">No exercises yet. Tap &ldquo;+ New&rdquo; to add one.</p>
      ) : (
        categories.map((cat) => {
          const catItems = library.filter((i) => (i.category ?? 'Uncategorized') === cat);
          return (
            <section key={cat} className="mb-4">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">{cat}</h3>
              <ul className="flex flex-col gap-2">
                {catItems.map((ex) => (
                  <li key={ex.key} className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3">
                    {editingKey === ex.key ? (
                      <div className="flex flex-col gap-2">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
                        <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Category" className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
                        <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Technique notes…" rows={3} className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-y" />
                        <input type="url" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)} placeholder="YouTube / video URL" className="w-full bg-neutral-900 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingKey(null)} className="text-xs text-[var(--color-muted)]">Cancel</button>
                          <button type="button" onClick={() => saveEdit(ex.key)} disabled={pending} className="px-3 py-1 rounded-md bg-emerald-500 text-black text-xs font-semibold disabled:opacity-30">Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{ex.name}</p>
                          {ex.description && <p className="text-xs text-[var(--color-muted)] mt-0.5 whitespace-pre-wrap">{ex.description}</p>}
                          {ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 underline mt-0.5 block truncate">{ex.videoUrl}</a>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button type="button" onClick={() => { setEditingKey(ex.key); setEditName(ex.name); setEditDesc(ex.description ?? ''); setEditCategory(ex.category ?? ''); setEditVideoUrl(ex.videoUrl ?? ''); }} className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-sm" aria-label="Edit">✎</button>
                          <button type="button" onClick={() => removeExercise(ex.key)} disabled={pending} className="text-[var(--color-muted)] hover:text-[var(--color-bad)] text-sm" aria-label="Delete">×</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {/* ── Mobility routine ── */}
      <MobilityManager initial={mobilityExercises} />
    </>
  );
}
