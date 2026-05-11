import { DateRedirect } from './components/DateRedirect';
import { ExerciseCard } from './components/ExerciseCard';
import { SleepToggle } from './components/SleepToggle';
import { MobilityChecklist } from './components/MobilityChecklist';
import { DayOverride } from './components/DayOverride';
import { PickupQuickToggle } from './components/PickupQuickToggle';
import { DayNotes } from './components/DayNotes';
import { program, type DayKey } from '@/lib/program';
import { suggestDayKey, dayLabel } from '@/lib/day-logic';
import {
  getLastFridayType,
  getWorkoutForDay,
  getSetsForWorkout,
  getLastSessionForExercise,
  getDayNote,
} from '@/db/queries';
import type { WorkoutSet } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { pickupLog } from '@/db/schema';

export const dynamic = 'force-dynamic';

const VALID_DAY_KEYS: DayKey[] = ['lower_heavy', 'upper_full', 'lower_power', 'upper_pull'];

export default async function Today({
  searchParams,
}: {
  searchParams: Promise<{ d?: string; w?: string; override?: string }>;
}) {
  const params = await searchParams;
  const date = params.d;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return <DateRedirect />;

  const weekday = (params.w ?? '').toLowerCase();
  const override = params.override && (VALID_DAY_KEYS as string[]).includes(params.override)
    ? (params.override as DayKey)
    : null;
  const lastFridayType = await getLastFridayType();
  const dayKey = override ?? suggestDayKey(weekday, lastFridayType);

  const [todayPickups, dayNote] = await Promise.all([
    db.select().from(pickupLog).where(eq(pickupLog.date, date)),
    getDayNote(date),
  ]);

  if (!dayKey) {
    return (
      <main className="px-4 pt-6">
        <Header date={date} weekday={weekday} dayKey={null} />
        <p className="text-[var(--color-muted)] text-sm mb-4">
          Rest day — pickup or recovery. Pick a workout below if you want to lift anyway.
        </p>
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">Override:</span>
            <DayOverride current={null} />
          </div>
        </div>
        <PickupQuickToggle date={date} today={todayPickups} />
        <DayNotes date={date} initial={dayNote} />
      </main>
    );
  }

  const workout = await getWorkoutForDay(date);
  const allSets: WorkoutSet[] = workout ? await getSetsForWorkout(workout.id) : [];
  const setsByEx = new Map<string, WorkoutSet[]>();
  for (const s of allSets) {
    const arr = setsByEx.get(s.exerciseKey) ?? [];
    arr.push(s);
    setsByEx.set(s.exerciseKey, arr);
  }

  const exercises = program.workouts[dayKey].exercises;

  // Beat-last-week: query last session per default exercise key
  // (ignores swaps; "compare same key" is the rule from IDEAS).
  const lastSessions = await Promise.all(
    exercises.map(async (ex) => {
      const activeKey = (() => {
        const setsForDefault = setsByEx.get(ex.key);
        if (setsForDefault && setsForDefault.length > 0) return ex.key;
        // If user already swapped, find the swap key in setsByEx
        for (const [k, v] of setsByEx) {
          if (v[0]?.isSwap === 1 && (ex.swaps ?? []).includes(k)) return k;
        }
        return ex.key;
      })();
      return getLastSessionForExercise(activeKey, date);
    }),
  );

  return (
    <main className="px-4 pt-6">
      <Header date={date} weekday={weekday} dayKey={dayKey} />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--color-muted)]">Override day</span>
        <DayOverride current={dayKey} />
      </div>

      {exercises.map((ex, i) => (
        <ExerciseCard
          key={ex.key}
          exercise={ex}
          date={date}
          dayKey={dayKey}
          existingSets={
            // Show sets for the active key (default or already-swapped)
            (() => {
              const def = setsByEx.get(ex.key) ?? [];
              if (def.length > 0) return def;
              for (const [k, v] of setsByEx) {
                if (v[0]?.isSwap === 1 && (ex.swaps ?? []).includes(k)) return v;
              }
              return [];
            })()
          }
          lastSession={lastSessions[i]}
        />
      ))}

      <SleepToggle date={date} dayKey={dayKey} initial={workout?.sleptOk} />
      <PickupQuickToggle date={date} today={todayPickups} />
      <DayNotes date={date} initial={dayNote} />
      <MobilityChecklist date={date} />
    </main>
  );
}

function Header({
  date,
  weekday,
  dayKey,
}: {
  date: string;
  weekday: string;
  dayKey: DayKey | null;
}) {
  const cap = weekday ? weekday[0].toUpperCase() + weekday.slice(1) : '';
  return (
    <header className="mb-4 flex items-start justify-between">
      <div>
        <p className="text-xs text-[var(--color-muted)] tabular-nums">
          {cap} · {date}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {dayKey ? dayLabel(dayKey) : 'Rest Day'}
        </h1>
      </div>
      <nav className="flex gap-2 pt-1 shrink-0">
        <a href={`/custom?d=${date}`} className="px-2.5 py-1 rounded-lg bg-neutral-900 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] border border-[var(--color-border)]">Custom</a>
        <a href="/plates" className="px-2.5 py-1 rounded-lg bg-neutral-900 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] border border-[var(--color-border)]">Plates</a>
        <a href="/guide" className="px-2.5 py-1 rounded-lg bg-neutral-900 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] border border-[var(--color-border)]">Guide</a>
      </nav>
    </header>
  );
}
