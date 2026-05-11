'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { logProtein, deleteProtein, editProtein, saveMealsConfig } from '@/app/actions';
import { todayISO } from '@/lib/date';
import type { Meal } from '@/db/schema';
import type { ProteinPreset } from '@/db/queries';
import { Sparkline } from './Sparkline';
import { useEscapeKey } from '@/lib/hooks';

type DailyTotal = { date: string; total: number };

export function ProteinPage({
  initialEntries,
  initialTotal,
  weekTotals,
  initialPresets,
  initialGoalG,
}: {
  initialEntries: Meal[];
  initialTotal: number;
  weekTotals: DailyTotal[];
  initialPresets: ProteinPreset[];
  initialGoalG: number;
}) {
  const [date, setDate] = useState<string | null>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [total, setTotal] = useState(initialTotal);
  const [showCustom, setShowCustom] = useState(false);
  const [customG, setCustomG] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editG, setEditG] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [pending, startTransition] = useTransition();

  // Preset editing
  const [presets, setPresets] = useState(initialPresets);
  const [goalG, setGoalG] = useState(initialGoalG);
  const [editingPresets, setEditingPresets] = useState(false);
  const [draftPresets, setDraftPresets] = useState(initialPresets);
  const [draftGoal, setDraftGoal] = useState(String(initialGoalG));

  useEffect(() => setDate(todayISO()), []);

  useEscapeKey(showCustom, () => {
    setShowCustom(false);
    setCustomG('');
    setCustomLabel('');
  });
  useEscapeKey(editingId != null, () => setEditingId(null));
  useEscapeKey(editingPresets, () => setEditingPresets(false));

  const hour = useMemo(() => new Date().getHours(), []);
  const colorClass =
    total >= 160
      ? 'text-[var(--color-accent)]'
      : total >= 100
        ? 'text-[var(--color-warn)]'
        : hour >= 18
          ? 'text-[var(--color-bad)]'
          : 'text-[var(--color-fg)]';

  function add(label: string, protein: number, source: string) {
    if (!date) return;
    if (typeof navigator !== 'undefined') navigator.vibrate?.(10);
    startTransition(async () => {
      await logProtein({ date, proteinG: protein, source });
      setEntries((es) => [{ id: -Date.now(), date, proteinG: protein, source, note: label, createdAt: Date.now() }, ...es]);
      setTotal((t) => t + protein);
    });
  }

  function submitCustom() {
    const g = Number(customG);
    if (!Number.isFinite(g) || g <= 0 || !date) return;
    const note = customLabel.trim() || null;
    startTransition(async () => {
      await logProtein({ date, proteinG: Math.round(g), source: 'custom', note: note ?? undefined });
      setEntries((es) => [{ id: -Date.now(), date, proteinG: Math.round(g), source: 'custom', note, createdAt: Date.now() }, ...es]);
      setTotal((t) => t + Math.round(g));
    });
    setCustomG('');
    setCustomLabel('');
    setShowCustom(false);
  }

  function startEdit(e: Meal) {
    setEditingId(e.id);
    setEditG(String(e.proteinG));
    setEditLabel(e.note ?? '');
  }

  function saveEdit() {
    if (editingId == null) return;
    const g = Number(editG);
    if (!Number.isFinite(g) || g <= 0) return;
    const prev = entries.find((x) => x.id === editingId);
    if (!prev) return;
    const delta = Math.round(g) - prev.proteinG;
    startTransition(async () => {
      if (editingId > 0) {
        await editProtein({ id: editingId, proteinG: Math.round(g), source: prev.source, note: editLabel || null });
      }
      setEntries((es) => es.map((x) => x.id === editingId ? { ...x, proteinG: Math.round(g), note: editLabel || null } : x));
      setTotal((t) => t + delta);
      setEditingId(null);
    });
  }

  function remove(id: number, g: number) {
    startTransition(async () => {
      if (id > 0) await deleteProtein(id);
      setEntries((es) => es.filter((e) => e.id !== id));
      setTotal((t) => t - g);
    });
  }

  function openPresetEditor() {
    setDraftPresets(presets.map((p) => ({ ...p })));
    setDraftGoal(String(goalG));
    setEditingPresets(true);
  }

  function updateDraftPreset(i: number, field: keyof ProteinPreset, value: string) {
    setDraftPresets((ps) => ps.map((p, idx) => idx === i ? { ...p, [field]: field === 'protein' ? Number(value) || 0 : value } : p));
  }

  function addDraftPreset() {
    setDraftPresets((ps) => [...ps, { label: '', protein: 0, source: 'custom' }]);
  }

  function removeDraftPreset(i: number) {
    setDraftPresets((ps) => ps.filter((_, idx) => idx !== i));
  }

  function savePresets() {
    const newGoal = Number(draftGoal);
    const validGoal = Number.isFinite(newGoal) && newGoal > 0 ? Math.round(newGoal) : goalG;
    const valid = draftPresets.filter((p) => p.label.trim() && p.protein > 0);
    startTransition(async () => {
      await saveMealsConfig(valid, validGoal);
      setPresets(valid);
      setGoalG(validGoal);
      setEditingPresets(false);
    });
  }

  return (
    <main className="px-4 pt-6">
      <h1 className="text-xs text-[var(--color-muted)] mb-1 tracking-wide uppercase">Protein</h1>
      <div className={`text-6xl font-bold tabular-nums leading-none mb-1 ${colorClass}`}>
        {total}
        <span className="text-2xl text-[var(--color-muted)]"> / {goalG}g</span>
      </div>
      <p className="text-xs text-[var(--color-muted)] mb-4 tabular-nums">
        {Math.max(0, goalG - total)}g to go
      </p>

      {!editingPresets ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {presets.map((q) => (
              <button
                key={q.label}
                type="button"
                disabled={pending || !date}
                onClick={() => add(q.label, q.protein, q.source)}
                className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] active:bg-neutral-900 p-3 text-left"
              >
                <div className="font-semibold">{q.label}</div>
                <div className="text-xs text-[var(--color-accent)] tabular-nums">+{q.protein}g</div>
              </button>
            ))}
            <button
              type="button"
              disabled={pending || !date}
              onClick={() => setShowCustom((v) => !v)}
              className="rounded-xl border border-dashed border-[var(--color-border)] p-3 text-[var(--color-muted)] text-sm"
            >
              {showCustom ? 'Cancel' : 'Custom…'}
            </button>
            <button
              type="button"
              onClick={openPresetEditor}
              className="rounded-xl border border-dashed border-[var(--color-border)] p-3 text-[var(--color-muted)] text-sm"
            >
              Edit presets…
            </button>
          </div>

          {showCustom && (
            <section className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--color-muted)]">Custom protein entry</span>
                <button
                  type="button"
                  onClick={() => { setShowCustom(false); setCustomG(''); setCustomLabel(''); }}
                  aria-label="Close"
                  className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  placeholder="grams"
                  value={customG}
                  onChange={(e) => setCustomG(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && customG) submitCustom(); }}
                  autoFocus
                  className="w-24 bg-neutral-900 rounded-lg px-3 py-2 tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="label (optional)"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && customG) submitCustom(); }}
                  className="min-w-0 flex-1 bg-neutral-900 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={submitCustom}
                  disabled={!customG}
                  className="px-4 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-30"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2">Esc to cancel · Enter to save</p>
            </section>
          )}
        </>
      ) : (
        <section className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Edit presets</span>
            <button type="button" onClick={() => setEditingPresets(false)} className="text-[var(--color-muted)] w-7 h-7 flex items-center justify-center">✕</button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-[var(--color-muted)] shrink-0">Daily goal</span>
            <input
              type="number"
              inputMode="numeric"
              value={draftGoal}
              onChange={(e) => setDraftGoal(e.target.value)}
              className="w-20 bg-neutral-900 rounded-lg px-2 py-1.5 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-xs text-[var(--color-muted)]">g</span>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            {draftPresets.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={p.label}
                  onChange={(e) => updateDraftPreset(i, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1 min-w-0 bg-neutral-900 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={p.protein || ''}
                  onChange={(e) => updateDraftPreset(i, 'protein', e.target.value)}
                  placeholder="g"
                  className="w-16 bg-neutral-900 rounded-lg px-2 py-1.5 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs text-[var(--color-muted)]">g</span>
                <button
                  type="button"
                  onClick={() => removeDraftPreset(i)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7 flex items-center justify-center shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addDraftPreset}
              className="flex-1 rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-muted)]"
            >
              + Add preset
            </button>
            <button
              type="button"
              onClick={savePresets}
              disabled={pending}
              className="px-4 rounded-lg bg-emerald-500 text-black text-sm font-semibold disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </section>
      )}

      <section className="mb-4">
        <h2 className="text-sm font-semibold mb-2">Today</h2>
        {entries.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)] italic">Nothing yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entries.map((e) => (
              <li key={e.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                {editingId === e.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={editG}
                      onChange={(ev) => setEditG(ev.target.value)}
                      className="w-20 bg-neutral-900 rounded-md px-2 py-1 text-sm tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(ev) => setEditLabel(ev.target.value)}
                      placeholder="label"
                      className="flex-1 bg-neutral-900 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button type="button" onClick={saveEdit} className="px-2 py-1 rounded-md bg-emerald-500 text-black text-xs font-semibold">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-[var(--color-muted)] text-xs">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{e.note ?? e.source}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-sm">+{e.proteinG}g</span>
                      <button type="button" onClick={() => startEdit(e)} className="text-[var(--color-muted)] hover:text-[var(--color-fg)]">✎</button>
                      <button type="button" onClick={() => remove(e.id, e.proteinG)} className="text-[var(--color-muted)] hover:text-[var(--color-bad)]">×</button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {weekTotals.length > 1 && (
        <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold mb-2">Last 7 days</h2>
          <Sparkline points={weekTotals.map((d, i) => ({ x: i, y: d.total, label: d.date }))} />
          <ul className="mt-2 text-xs space-y-0.5">
            {weekTotals.map((d) => (
              <li key={d.date} className="flex justify-between tabular-nums">
                <span className="text-[var(--color-muted)]">{d.date}</span>
                <span className={d.total >= 160 ? 'text-[var(--color-accent)]' : ''}>{d.total}g</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
