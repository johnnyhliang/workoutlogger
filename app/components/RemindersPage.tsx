'use client';

import { useState, useTransition } from 'react';
import type { Reminder } from '@/db/schema';
import { saveReminder, deleteReminder, toggleReminder } from '@/app/actions';
import { PushSubscribe } from './PushSubscribe';

export function RemindersPage({ initial }: { initial: Reminder[] }) {
  const [reminders, setReminders] = useState<Reminder[]>(initial);
  const [name, setName] = useState('');
  const [time, setTime] = useState('08:00');
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!name.trim()) return;
    startTransition(async () => {
      await saveReminder({ name: name.trim(), timeHHMM: time });
      setName('');
      setTime('08:00');
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteReminder(id);
      setReminders(rs => rs.filter(r => r.id !== id));
    });
  }

  function handleToggle(id: number, enabled: boolean) {
    startTransition(async () => {
      await toggleReminder(id, !enabled);
      setReminders(rs => rs.map(r => r.id === id ? { ...r, enabled: enabled ? 0 : 1 } : r));
    });
  }

  return (
    <main className="px-4 pt-6 pb-24">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Reminders</h1>
      <p className="text-xs text-[var(--color-muted)] mb-4">Times are UTC — adjust for your timezone.</p>

      <div className="mb-6">
        <PushSubscribe />
        <p className="text-xs text-[var(--color-muted)] mt-1">On iPhone: add to Home Screen first, then enable.</p>
      </div>

      <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
        <p className="text-sm font-medium mb-3">Add reminder</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Reminder name (e.g. Log workout)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--color-border)] text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-black border border-[var(--color-border)] text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={pending || !name.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-sm disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] text-center py-8">No reminders yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {reminders.map(r => (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] px-4 py-3">
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${r.enabled ? '' : 'line-through text-[var(--color-muted)]'}`}>{r.name}</p>
                <p className="text-xs text-[var(--color-muted)]">{r.timeHHMM} UTC</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(r.id, !!r.enabled)}
                  disabled={pending}
                  className={`text-xs px-2.5 py-1 rounded-md border ${r.enabled ? 'border-emerald-700 text-emerald-400' : 'border-[var(--color-border)] text-[var(--color-muted)]'}`}
                >
                  {r.enabled ? 'On' : 'Off'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  disabled={pending}
                  className="w-8 h-8 text-[var(--color-muted)] hover:text-[var(--color-bad)]"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
