'use client';

import { useEffect, useState } from 'react';
import type { MobilityExercise } from '@/db/queries';

export function MobilityChecklist({ date, exercises }: { date: string; exercises: MobilityExercise[] }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const storageKey = `mobility:${date}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
      else setChecked({});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const done = exercises.filter((m) => checked[m.key]).length;
  const total = exercises.length;

  return (
    <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] mb-3 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="text-left">
          <h3 className="font-semibold">Daily Mobility</h3>
          <p className="text-xs text-[var(--color-muted)]">{done}/{total} done</p>
        </div>
        <span className="text-[var(--color-muted)]">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="px-4 pb-4 flex flex-col gap-2">
          {exercises.map((m) => (
            <li key={m.key}>
              <label className="flex items-start gap-3 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[m.key]}
                  onChange={() => toggle(m.key)}
                  className="w-5 h-5 mt-0.5 accent-emerald-500 shrink-0"
                />
                <div>
                  <span className={checked[m.key] ? 'line-through text-[var(--color-muted)]' : ''}>
                    {m.name}{' '}
                    <span className="text-xs text-[var(--color-muted)]">— {m.reps}</span>
                  </span>
                  {m.description && (
                    <p className="text-xs text-[var(--color-muted)] mt-0.5 whitespace-pre-wrap">{m.description}</p>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
