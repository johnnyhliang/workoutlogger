'use client';

import { useState, useRef, useEffect } from 'react';
import type { DayKey } from '@/lib/program';
import { dayLabel } from '@/lib/day-logic';

type WorkoutRow = { id: number; date: string; dayKey: string; sleptOk: number | null; setCount: number };
type BodyRow = { date: string; weightLb: number | null; bodyFatPct: number | null };
type ProteinRow = { date: string; total: number };
type VertRow = { date: string; vertIn: number };
type PickupRow = { date: string; sport: string };
type NoteRow = { date: string; note: string };

export function HistoryDashboard({
  workouts,
  bodyRows,
  proteinRows,
  vertRows,
  pickupRows,
  noteRows,
}: {
  workouts: WorkoutRow[];
  bodyRows: BodyRow[];
  proteinRows: ProteinRow[];
  vertRows: VertRow[];
  pickupRows: PickupRow[];
  noteRows: NoteRow[];
}) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Build lookup maps
  const workoutByDate = new Map(workouts.map((w) => [w.date, w]));
  const pickupsByDate = new Map<string, PickupRow[]>();
  for (const p of pickupRows) {
    const arr = pickupsByDate.get(p.date) ?? [];
    arr.push(p);
    pickupsByDate.set(p.date, arr);
  }
  const noteByDate = new Map(noteRows.map((n) => [n.date, n.note]));
  const proteinByDate = new Map(proteinRows.map((r) => [r.date, r.total]));
  const bodyByDate = new Map(bodyRows.map((r) => [r.date, r]));
  const vertByDate = new Map(vertRows.map((r) => [r.date, r.vertIn]));

  // Click outside to dismiss tooltip
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setSelectedDate(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedDate(null);
    }
    document.addEventListener('mousedown', handler);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', handler); window.removeEventListener('keydown', onKey); };
  }, []);

  // Build year grid: 365 days ending today, aligned to Monday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - 364);
  const startDow = (gridStart.getDay() + 6) % 7;
  gridStart.setDate(gridStart.getDate() - startDow);

  const cells: { date: Date; iso: string; inRange: boolean }[] = [];
  const cur = new Date(gridStart);
  const rangeStart = new Date(today); rangeStart.setDate(today.getDate() - 364);
  while (cur <= today || cells.length % 7 !== 0) {
    const iso = cur.toISOString().slice(0, 10);
    cells.push({ date: new Date(cur), iso, inRange: cur >= rangeStart && cur <= today });
    cur.setDate(cur.getDate() + 1);
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  function cellColor(iso: string, inRange: boolean): string {
    if (!inRange) return 'transparent';
    const w = workoutByDate.get(iso);
    const p = pickupsByDate.get(iso);
    if (w) {
      const opacity = Math.min(1, 0.35 + (w.setCount / 20) * 0.65);
      return `rgba(16,185,129,${opacity.toFixed(2)})`;
    }
    if (p?.length) return 'rgba(56,189,248,0.5)';
    return '#262626';
  }

  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const first = week.find((d) => d.inRange);
    if (first) {
      const m = first.date.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col, label: first.date.toLocaleString('default', { month: 'short' }) });
        lastMonth = m;
      }
    }
  });

  // Metric helpers
  const bodyOrdered = [...bodyRows].sort((a, b) => a.date.localeCompare(b.date));
  const proteinOrdered = [...proteinRows].sort((a, b) => a.date.localeCompare(b.date));
  const vertOrdered = [...vertRows].sort((a, b) => a.date.localeCompare(b.date));

  const latestWeight = bodyOrdered.filter((r) => r.weightLb != null).slice(-1)[0];
  const weight30dAgo = [...bodyOrdered].filter((r) => r.weightLb != null && r.date <= (() => { const d = new Date(today); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); })()).slice(-1)[0];
  const weightDelta = latestWeight?.weightLb != null && weight30dAgo?.weightLb != null
    ? latestWeight.weightLb - weight30dAgo.weightLb : null;
  const latestBf = bodyOrdered.filter((r) => r.bodyFatPct != null).slice(-1)[0];
  const latestVert = vertOrdered.slice(-1)[0];
  const prVert = vertOrdered.length ? Math.max(...vertOrdered.map((v) => v.vertIn)) : null;
  const recentProtein = proteinOrdered.slice(-7);
  const protein7dAvg = recentProtein.length
    ? Math.round(recentProtein.reduce((s, r) => s + r.total, 0) / recentProtein.length) : null;

  function movingAvg(arr: BodyRow[], w = 7) {
    return arr.filter((r) => r.weightLb != null).map((r, i, a) => {
      const sl = a.slice(Math.max(0, i - w + 1), i + 1);
      return { date: r.date, avg: sl.reduce((s, x) => s + (x.weightLb ?? 0), 0) / sl.length };
    });
  }
  const weightAvg = movingAvg(bodyOrdered);

  function MiniSparkline({ points, color, height = 50 }: { points: number[]; color: string; height?: number }) {
    if (points.length < 2) return <p className="text-xs text-[var(--color-muted)] italic py-1">Not enough data.</p>;
    const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
    const W = 280, pad = 4, step = W / (points.length - 1);
    const d = points.map((v, i) => {
      const x = i * step, y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const lx = ((points.length - 1) * step).toFixed(1);
    const ly = (height - pad - ((points[points.length - 1] - min) / range) * (height - pad * 2)).toFixed(1);
    return (
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto">
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <circle cx={lx} cy={ly} r="3" fill={color} />
      </svg>
    );
  }

  function BarSparkline({ points, color, height = 50 }: { points: number[]; color: string; height?: number }) {
    if (!points.length) return <p className="text-xs text-[var(--color-muted)] italic py-1">No data.</p>;
    const max = Math.max(...points, 1), W = 280, bw = Math.max(2, W / points.length - 2);
    return (
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto">
        {points.map((v, i) => {
          const bh = (v / max) * (height - 4);
          return <rect key={i} x={i * (W / points.length)} y={height - 4 - bh} width={bw} height={bh} fill={color} rx="1" />;
        })}
      </svg>
    );
  }

  function buildMonthCalendar() {
    const days: { iso: string; day: number }[] = [];
    const start = new Date(today); start.setDate(today.getDate() - 29);
    const c = new Date(start);
    const dow = (c.getDay() + 6) % 7;
    c.setDate(c.getDate() - dow);
    while (c <= today || days.length % 7 !== 0) {
      const iso = c.toISOString().slice(0, 10);
      days.push({ iso, day: c.getDate() });
      c.setDate(c.getDate() + 1);
    }
    const rows: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }

  const todayISO = today.toISOString().slice(0, 10);
  const d30ISO = (() => { const d = new Date(today); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10); })();
  const calRows = buildMonthCalendar();
  const workoutLimit = period === 'week' ? 7 : 30;
  const recentWorkoutsSlice = workouts.slice(0, workoutLimit);

  const sel = selectedDate;
  const selWorkout = sel ? workoutByDate.get(sel) : null;
  const selPickups = sel ? (pickupsByDate.get(sel) ?? []) : [];
  const selNote = sel ? noteByDate.get(sel) : null;
  const selProtein = sel ? proteinByDate.get(sel) : null;
  const selBody = sel ? bodyByDate.get(sel) : null;
  const selVert = sel ? vertByDate.get(sel) : null;

  return (
    <div>
      {/* Contribution grid */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold mb-2">Activity — past year</h2>
        <div className="overflow-x-auto pb-1">
          <div className="flex mb-1">
            {weeks.map((_, col) => {
              const lbl = monthLabels.find((m) => m.col === col);
              return (
                <div key={col} style={{ width: 16, flexShrink: 0 }} className="text-[9px] text-[var(--color-muted)]">
                  {lbl?.label ?? ''}
                </div>
              );
            })}
          </div>
          <div className="flex gap-0.5">
            {weeks.map((week, col) => (
              <div key={col} className="flex flex-col gap-0.5">
                {week.map((cell, row) => (
                  <button
                    key={row}
                    type="button"
                    onClick={() => {
                      if (!cell.inRange) return;
                      setSelectedDate((d) => d === cell.iso ? null : cell.iso);
                    }}
                    className="rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    style={{ width: 14, height: 14, background: cellColor(cell.iso, cell.inRange), cursor: cell.inRange ? 'pointer' : 'default' }}
                    aria-label={cell.inRange ? cell.iso : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 text-[10px] text-[var(--color-muted)]">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'rgba(16,185,129,0.8)' }} /> Workout</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'rgba(56,189,248,0.5)' }} /> Pickup</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-neutral-800" /> Rest</span>
          </div>
        </div>

        {/* Day detail panel */}
        {sel && (
          <div ref={tooltipRef} className="mt-3 rounded-xl bg-neutral-800 border border-[var(--color-border)] p-3 text-sm space-y-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold tabular-nums text-xs text-[var(--color-muted)]">{sel}</p>
              <button type="button" onClick={() => setSelectedDate(null)} className="text-[var(--color-muted)] hover:text-[var(--color-bad)] text-xs">✕</button>
            </div>
            {selWorkout
              ? <p><span className="text-emerald-400">Workout:</span> {dayLabel(selWorkout.dayKey as DayKey)} · {selWorkout.setCount} sets{selWorkout.sleptOk === 1 ? ' · slept ✓' : ''}</p>
              : null}
            {selPickups.length > 0
              ? <p><span className="text-sky-400">Pickup:</span> {selPickups.map((p) => p.sport).join(', ')}</p>
              : null}
            {selProtein != null
              ? <p><span className="text-orange-400">Protein:</span> {Math.round(selProtein)}g</p>
              : null}
            {selBody?.weightLb != null
              ? <p><span className="text-blue-400">Weight:</span> {selBody.weightLb.toFixed(1)} lb{selBody.bodyFatPct != null ? ` · ${selBody.bodyFatPct.toFixed(1)}% bf` : ''}</p>
              : null}
            {selVert != null
              ? <p><span className="text-purple-400">Vert:</span> {selVert}&Prime;</p>
              : null}
            {!selWorkout && !selPickups.length && selProtein == null && selBody == null && selVert == null
              ? <p className="text-[var(--color-muted)] italic">Rest day — nothing logged.</p>
              : null}
            {selNote && <p className="text-xs text-[var(--color-muted)] mt-1 whitespace-pre-wrap border-t border-neutral-700 pt-1">{selNote}</p>}
            <div className="mt-2 pt-2 border-t border-neutral-700">
              <a
                href={`/?d=${sel}&w=${['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date(sel + 'T12:00:00').getDay()]}`}
                className="text-xs text-emerald-400 underline"
              >
                Go to day / edit →
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Week / Month toggle */}
      <div className="flex gap-2 mb-4">
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize ${period === p ? 'bg-emerald-500 text-black' : 'bg-neutral-900'}`}
          >
            {p === 'week' ? 'Last 7 days' : 'Last 30 days'}
          </button>
        ))}
      </div>

      {/* Metric panels */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-3 col-span-2">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">Body weight</p>
          {latestWeight?.weightLb != null ? (
            <p className="text-2xl font-bold tabular-nums">
              {latestWeight.weightLb.toFixed(1)} lb
              {weightDelta != null && (
                <span className={`text-sm font-normal ml-2 ${weightDelta > 0 ? 'text-[var(--color-bad)]' : 'text-emerald-400'}`}>
                  {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} (30d)
                </span>
              )}
            </p>
          ) : <p className="text-sm text-[var(--color-muted)] italic">No data</p>}
          <MiniSparkline points={bodyOrdered.filter((r) => r.weightLb != null).map((r) => r.weightLb!)} color="#10b981" />
          {weightAvg.length >= 2 && <MiniSparkline points={weightAvg.map((r) => r.avg)} color="rgba(16,185,129,0.3)" height={20} />}
        </div>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">Body fat %</p>
          {latestBf?.bodyFatPct != null
            ? <p className="text-xl font-bold tabular-nums">{latestBf.bodyFatPct.toFixed(1)}%</p>
            : <p className="text-xs text-[var(--color-muted)] italic">No data</p>}
          <MiniSparkline points={bodyOrdered.filter((r) => r.bodyFatPct != null).map((r) => r.bodyFatPct!)} color="#eab308" />
        </div>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">Protein 7d avg</p>
          {protein7dAvg != null
            ? <p className="text-xl font-bold tabular-nums">{protein7dAvg}g</p>
            : <p className="text-xs text-[var(--color-muted)] italic">No data</p>}
          <BarSparkline points={proteinOrdered.slice(-28).map((r) => r.total)} color="#10b981" />
        </div>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-3 col-span-2">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">Vertical jump</p>
          {latestVert
            ? <p className="text-xl font-bold tabular-nums">
                {latestVert.vertIn}&Prime;
                {prVert != null && latestVert.vertIn === prVert && <span className="text-sm font-normal text-yellow-400 ml-2">PR</span>}
                {prVert != null && latestVert.vertIn < prVert && <span className="text-sm font-normal text-[var(--color-muted)] ml-2">PR {prVert}&Prime;</span>}
              </p>
            : <p className="text-xs text-[var(--color-muted)] italic">No data</p>}
          <MiniSparkline points={vertOrdered.map((r) => r.vertIn)} color="#a855f7" />
        </div>
      </div>

      {/* Week = list view, Month = calendar view */}
      {period === 'week' ? (
        <section>
          <h2 className="text-sm font-semibold mb-2">Last 7 workouts</h2>
          {recentWorkoutsSlice.length === 0
            ? <p className="text-sm text-[var(--color-muted)] italic">No workouts logged yet.</p>
            : (
              <ul className="flex flex-col gap-2">
                {recentWorkoutsSlice.map((w) => (
                  <li key={w.id} className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{dayLabel(w.dayKey as DayKey)}</p>
                      <p className="text-xs text-[var(--color-muted)] tabular-nums">{w.date}</p>
                    </div>
                    <div className="text-right text-xs text-[var(--color-muted)]">
                      <p>{w.setCount} sets</p>
                      {w.sleptOk === 1 && <p className="text-emerald-400">slept ✓</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </section>
      ) : (
        <section>
          <h2 className="text-sm font-semibold mb-2">Last 30 days</h2>
          {/* Calendar header */}
          <div className="grid grid-cols-7 text-center text-[10px] text-[var(--color-muted)] mb-1 font-medium">
            {['M','T','W','T','F','S','S'].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="flex flex-col gap-1">
            {calRows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-7 gap-1">
                {row.map((cell, ci) => {
                  const isInLast30 = cell.iso >= d30ISO && cell.iso <= todayISO;
                  const w = workoutByDate.get(cell.iso);
                  const p = pickupsByDate.get(cell.iso);
                  const hasActivity = w || p?.length;
                  const isToday = cell.iso === todayISO;
                  return (
                    <button
                      key={ci}
                      type="button"
                      onClick={() => { if (isInLast30) setSelectedDate((d) => d === cell.iso ? null : cell.iso); }}
                      className={`rounded-lg py-2 flex flex-col items-center text-xs transition-colors ${
                        !isInLast30 ? 'opacity-0 pointer-events-none' :
                        selectedDate === cell.iso ? 'bg-emerald-500 text-black' :
                        w ? 'bg-emerald-950 border border-emerald-800' :
                        p?.length ? 'bg-sky-950 border border-sky-800' :
                        'bg-[var(--color-card)] border border-[var(--color-border)]'
                      }`}
                    >
                      <span className={`font-semibold ${isToday ? 'text-emerald-400' : ''}`}>{cell.day}</span>
                      {hasActivity && isInLast30 && (
                        <span className="mt-0.5 text-[8px] leading-none">
                          {w ? '●' : '◌'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
