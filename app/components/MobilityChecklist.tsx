'use client';

import { useEffect, useState } from 'react';
import { program } from '@/lib/program';

export function MobilityChecklist({ date }: { date: string }) {
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

  function toggle(name: string) {
    setChecked((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const done = program.daily_mobility.filter((m) => checked[m.name]).length;
  const total = program.daily_mobility.length;

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
          {program.daily_mobility.map((m) => (
            <li key={m.name}>
              <label className="flex items-center gap-3 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[m.name]}
                  onChange={() => toggle(m.name)}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className={checked[m.name] ? 'line-through text-[var(--color-muted)]' : ''}>
                  {m.name}{' '}
                  <span className="text-xs text-[var(--color-muted)]">— {m.reps}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
