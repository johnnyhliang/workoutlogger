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
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const workoutByDate = new Map(workouts.map((w) => [w.date, w]));
  const pickupsByDate = new Map<string, PickupRow[]>();
  for (const p of pickupRows) {
    const arr = pickupsByDate.get(p.date) ?? [];
    arr.push(p);
    pickupsByDate.set(p.date, arr);
  }
  const noteByDate = new Map(noteRows.map((n) => [n.date, n.note]));

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

  // Build grid: 365 days ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - 364);
  // Align to Monday of that week
  const startDow = (gridStart.getDay() + 6) % 7; // 0=Mon
  gridStart.setDate(gridStart.getDate() - startDow);

  const cells: { date: Date; iso: string; inRange: boolean }[] = [];
  const cur = new Date(gridStart);
  while (cur <= today || cells.length % 7 !== 0) {
    const iso = cur.toISOString().slice(0, 10);
    const inRange = cur >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - 364) && cur <= today;
    cells.push({ date: new Date(cur), iso, inRange });
    cur.setDate(cur.getDate() + 1);
  }

  const weeks: { date: Date; iso: string; inRange: boolean }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  function cellColor(iso: string, inRange: boolean): string {
    if (!inRange) return 'transparent';
    const w = workoutByDate.get(iso);
    const p = pickupsByDate.get(iso);
    if (w) {
      const intensity = Math.min(1, (w.setCount ?? 1) / 20);
      const opacity = 0.35 + intensity * 0.65;
      return `rgba(16,185,129,${opacity.toFixed(2)})`; // emerald
    }
    if (p && p.length > 0) return 'rgba(56,189,248,0.5)'; // sky
    return '#262626'; // neutral-800
  }

  // Month labels: find first week-column for each month
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstInRange = week.find((d) => d.inRange);
    if (firstInRange) {
      const m = firstInRange.date.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col, label: firstInRange.date.toLocaleString('default', { month: 'short' }) });
        lastMonth = m;
      }
    }
  });

  // Metric data helpers
  const bodyOrdered = [...bodyRows].sort((a, b) => a.date.localeCompare(b.date));
  const proteinOrdered = [...proteinRows].sort((a, b) => a.date.localeCompare(b.date));
  const vertOrdered = [...vertRows].sort((a, b) => a.date.localeCompare(b.date));

  const latestWeight = bodyOrdered.filter((r) => r.weightLb != null).slice(-1)[0];
  const weightMinus30 = bodyOrdered.filter((r) => r.weightLb != null).find((r) => {
    const d = new Date(today); d.setDate(d.getDate() - 30);
    return r.date >= d.toISOString().slice(0, 10);
  });
  const weightDelta = latestWeight && weightMinus30 && latestWeight.weightLb != null && weightMinus30.weightLb != null
    ? latestWeight.weightLb - weightMinus30.weightLb : null;

  const latestBf = bodyOrdered.filter((r) => r.bodyFatPct != null).slice(-1)[0];
  const latestVert = vertOrdered.slice(-1)[0];
  const prVert = vertOrdered.length ? Math.max(...vertOrdered.map((v) => v.vertIn)) : null;

  const recentProtein = proteinOrdered.slice(-7);
  const protein7dAvg = recentProtein.length
    ? Math.round(recentProtein.reduce((s, r) => s + r.total, 0) / recentProtein.length)
    : null;

  // 7d moving avg for weight
  function movingAvg(arr: BodyRow[], window = 7): { date: string; avg: number }[] {
    return arr
      .filter((r) => r.weightLb != null)
      .map((r, i, a) => {
        const slice = a.slice(Math.max(0, i - window + 1), i + 1).filter((x) => x.weightLb != null);
        return { date: r.date, avg: slice.reduce((s, x) => s + (x.weightLb ?? 0), 0) / slice.length };
      });
  }
  const weightAvg = movingAvg(bodyOrdered);

  // Inline sparkline component
  function MiniSparkline({ points, color, height = 50 }: { points: number[]; color: string; height?: number }) {
    if (points.length < 2) return <p className="text-xs text-[var(--color-muted)] italic py-2">Not enough data yet.</p>;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const w = 280;
    const pad = 4;
    const step = w / (points.length - 1);
    const d = points.map((v, i) => {
      const x = i * step;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return (
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-auto">
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <circle cx={((points.length - 1) * step).toFixed(1)} cy={(height - pad - ((points[points.length - 1] - min) / range) * (height - pad * 2)).toFixed(1)} r="3" fill={color} />
      </svg>
    );
  }

  function BarSparkline({ points, color, height = 50 }: { points: number[]; color: string; height?: number }) {
    if (points.length === 0) return <p className="text-xs text-[var(--color-muted)] italic py-2">No data.</p>;
    const max = Math.max(...points, 1);
    const w = 280;
    const barW = Math.max(2, w / points.length - 2);
    return (
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-auto">
        {points.map((v, i) => {
          const bh = (v / max) * (height - 4);
          return <rect key={i} x={i * (w / points.length)} y={height - 4 - bh} width={barW} height={bh} fill={color} rx="1" />;
        })}
      </svg>
    );
  }

  const workoutLimit = period === 'week' ? 7 : 30;
  const recentWorkouts = workouts.slice(0, workoutLimit);

  const selectedWorkout = selectedDate ? workoutByDate.get(selectedDate) : null;
  const selectedPickups = selectedDate ? (pickupsByDate.get(selectedDate) ?? []) : [];
  const selectedNote = selectedDate ? noteByDate.get(selectedDate) : null;

  return (
    <div>
      {/* Contribution grid */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">Activity — past year</h2>
        <div className="overflow-x-auto pb-1 relative">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: 0 }}>
            {weeks.map((_, col) => {
              const lbl = monthLabels.find((m) => m.col === col);
              return (
                <div key={col} style={{ width: 16, flexShrink: 0 }} className="text-[9px] text-[var(--color-muted)]">
                  {lbl?.label ?? ''}
                </div>
              );
            })}
          </div>
          {/* Grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, col) => (
              <div key={col} className="flex flex-col gap-0.5">
                {week.map((cell, row) => (
                  <button
                    key={row}
                    type="button"
                    onClick={(e) => {
                      if (!cell.inRange) return;
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                      setSelectedDate((d) => d === cell.iso ? null : cell.iso);
                    }}
                    className="rounded-sm focus:outline-none"
                    style={{ width: 14, height: 14, background: cellColor(cell.iso, cell.inRange), cursor: cell.inRange ? 'pointer' : 'default' }}
                    aria-label={cell.inRange ? cell.iso : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex gap-3 mt-2 text-[10px] text-[var(--color-muted)]">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'rgba(16,185,129,0.8)' }} /> Workout</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'rgba(56,189,248,0.5)' }} /> Pickup</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-neutral-800" /> Rest</span>
          </div>
        </div>

        {/* Tooltip */}
        {selectedDate && (
          <div
            ref={tooltipRef}
            className="mt-2 rounded-xl bg-neutral-800 border border-[var(--color-border)] p-3 text-sm"
          >
            <p className="font-semibold tabular-nums text-xs text-[var(--color-muted)] mb-1">{selectedDate}</p>
            {selectedWorkout ? (
              <p><span className="text-emerald-400">Workout:</span> {dayLabel(selectedWorkout.dayKey as DayKey)} · {selectedWorkout.setCount} sets</p>
            ) : null}
            {selectedPickups.length > 0 ? (
              <p><span className="text-sky-400">Pickup:</span> {selectedPickups.map((p) => p.sport).join(', ')}</p>
            ) : null}
            {!selectedWorkout && selectedPickups.length === 0 && <p className="text-[var(--color-muted)] italic">Rest day</p>}
            {selectedNote && <p className="text-xs text-[var(--color-muted)] mt-1 whitespace-pre-wrap">{selectedNote}</p>}
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

      {/* Metric panels 2×2 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Body weight */}
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
          {weightAvg.length >= 2 && (
            <MiniSparkline points={weightAvg.map((r) => r.avg)} color="rgba(16,185,129,0.35)" height={20} />
          )}
        </div>

        {/* Body fat */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">Body fat %</p>
          {latestBf?.bodyFatPct != null ? (
            <p className="text-xl font-bold tabular-nums">{latestBf.bodyFatPct.toFixed(1)}%</p>
          ) : <p className="text-xs text-[var(--color-muted)] italic">No data</p>}
          <MiniSparkline
            points={bodyOrdered.filter((r) => r.bodyFatPct != null).map((r) => r.bodyFatPct!)}
            color="#eab308"
          />
        </div>

        {/* Protein */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">Protein 7d avg</p>
          {protein7dAvg != null ? (
            <p className="text-xl font-bold tabular-nums">{protein7dAvg}g</p>
          ) : <p className="text-xs text-[var(--color-muted)] italic">No data</p>}
          <BarSparkline points={proteinOrdered.slice(-28).map((r) => r.total)} color="#10b981" />
        </div>

        {/* Vert */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-3 col-span-2">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">Vertical jump</p>
          {latestVert ? (
            <p className="text-xl font-bold tabular-nums">
              {latestVert.vertIn}&Prime;
              {prVert != null && latestVert.vertIn === prVert && <span className="text-sm font-normal text-yellow-400 ml-2">PR</span>}
              {prVert != null && latestVert.vertIn < prVert && <span className="text-sm font-normal text-[var(--color-muted)] ml-2">PR {prVert}&Prime;</span>}
            </p>
          ) : <p className="text-xs text-[var(--color-muted)] italic">No data</p>}
          <MiniSparkline points={vertOrdered.map((r) => r.vertIn)} color="#a855f7" />
        </div>
      </div>

      {/* Workout log */}
      <section>
        <h2 className="text-sm font-semibold mb-2">
          {period === 'week' ? 'Last 7 workouts' : 'Last 30 workouts'}
        </h2>
        {recentWorkouts.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] italic">No workouts logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentWorkouts.map((w) => (
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
    </div>
  );
}
