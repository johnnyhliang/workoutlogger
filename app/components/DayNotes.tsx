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

  return (
    <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm">Day notes</h3>
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
          rows={3}
          placeholder="One field for everything today: how it felt, observations, sleep, weather, anything…"
          className="w-full bg-neutral-900 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
        />
      ) : note ? (
        <p className="text-sm whitespace-pre-wrap text-[var(--color-fg)]">{note}</p>
      ) : (
        <p className="text-xs text-[var(--color-muted)] italic">
          One field for the whole day — felt, observations, sleep, weather.
        </p>
      )}
    </section>
  );
}
