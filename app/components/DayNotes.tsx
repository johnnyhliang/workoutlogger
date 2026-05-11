'use client';

import { useState, useTransition } from 'react';
import { setDayNote } from '@/app/actions';
import { useEscapeKey } from '@/lib/hooks';

export function DayNotes({ date, initial }: { date: string; initial: string | null }) {
  const [note, setNote] = useState(initial ?? '');
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  useEscapeKey(editing, () => {
    setEditing(false);
    setNote(initial ?? '');
  });

  function save() {
    startTransition(async () => {
      await setDayNote(date, note);
      setEditing(false);
    });
  }

  function loadPlan() {
    const athleticPlan = `Athletic Conditioning Plan:
- Zone 2 (30-45m, bike/incline walk) - 2x/week
- Lactate Intervals (6-8 rounds, 30s hard / 90s rest) - 1x/week
- Slow Eccentrics (3s lowering) on Squats/RDLs
- Copenhagens + Hip Flexor raises (2 sets each)
- SL Balance (1m eyes closed)`;
    setNote(note ? note + '\n\n' + athleticPlan : athleticPlan);
    setEditing(true);
  }

  return (
    <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Day notes</h3>
          {!note && !editing && (
            <button
              onClick={loadPlan}
              className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              + Load Athletic Plan
            </button>
          )}
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="px-3 py-1 rounded-md bg-emerald-500 text-black text-xs font-semibold"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setNote(initial ?? '');
              }}
              aria-label="Cancel"
              className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit"
            className="text-[var(--color-muted)] hover:text-[var(--color-fg)] text-xs"
          >
            {note ? '✎' : '+ add'}
          </button>
        )}
      </div>
      {editing ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
          rows={5}
          placeholder="How did it feel? Conditioning done? Sleep/recovery notes?"
          className="w-full bg-neutral-900 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
        />
      ) : note ? (
        <p className="text-sm whitespace-pre-wrap text-[var(--color-fg)]">{note}</p>
      ) : (
        <p className="text-xs text-[var(--color-muted)] italic">
          Track conditioning, feel, recovery, or high-level observations.
        </p>
      )}
    </section>
  );
}
