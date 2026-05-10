'use client';

import { useMemo, useState } from 'react';

const PLATES_LB = [45, 35, 25, 10, 5, 2.5];
const BARS = [
  { label: '45 (standard)', weight: 45 },
  { label: '35 (women)', weight: 35 },
  { label: '55 (trap)', weight: 55 },
  { label: '65 (safety)', weight: 65 },
];

function platesPerSide(target: number, bar: number): { plates: number[]; loaded: number } {
  const perSide = (target - bar) / 2;
  if (perSide <= 0) return { plates: [], loaded: bar };
  const out: number[] = [];
  let remaining = perSide;
  for (const p of PLATES_LB) {
    while (remaining >= p - 0.0001) {
      out.push(p);
      remaining = +(remaining - p).toFixed(4);
    }
  }
  const loaded = bar + out.reduce((s, p) => s + p, 0) * 2;
  return { plates: out, loaded };
}

const PLATE_COLOR: Record<number, string> = {
  45: 'bg-blue-600',
  35: 'bg-yellow-500',
  25: 'bg-green-600',
  10: 'bg-neutral-100 text-black',
  5: 'bg-red-600',
  2.5: 'bg-neutral-400 text-black',
};

export default function PlatesPage() {
  const [target, setTarget] = useState('135');
  const [bar, setBar] = useState(45);
  const t = Number(target);
  const valid = Number.isFinite(t) && t >= bar;
  const { plates, loaded } = useMemo(
    () => (valid ? platesPerSide(t, bar) : { plates: [] as number[], loaded: bar }),
    [t, bar, valid],
  );

  function bump(delta: number) {
    setTarget((p) => String(Math.max(0, Number(p || 0) + delta)));
  }

  return (
    <main className="px-4 pt-6">
      <h1 className="text-3xl font-bold mb-4">Plates</h1>

      <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-4">
        <label className="block text-xs text-[var(--color-muted)] mb-1">Target weight</label>
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => bump(-5)}
            className="w-10 h-12 rounded-lg bg-neutral-900 text-xl"
          >
            −5
          </button>
          <input
            type="number"
            inputMode="decimal"
            step="2.5"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 h-12 text-center bg-neutral-900 rounded-lg text-2xl font-semibold tabular-nums outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => bump(5)}
            className="w-10 h-12 rounded-lg bg-neutral-900 text-xl"
          >
            +5
          </button>
        </div>

        <label className="block text-xs text-[var(--color-muted)] mb-1">Bar</label>
        <div className="grid grid-cols-2 gap-1">
          {BARS.map((b) => (
            <button
              key={b.weight}
              type="button"
              onClick={() => setBar(b.weight)}
              className={`py-2 rounded-lg text-sm ${
                bar === b.weight ? 'bg-emerald-500 text-black font-semibold' : 'bg-neutral-900'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      {valid ? (
        plates.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] italic">
            Just the bar — {bar} lb.
          </p>
        ) : (
          <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-sm font-semibold">Per side</h2>
              <span className="text-xs text-[var(--color-muted)]">
                {plates.length} plate{plates.length === 1 ? '' : 's'}
              </span>
            </div>
            <ul className="flex flex-wrap gap-2 mb-3">
              {plates.map((p, i) => (
                <li
                  key={i}
                  className={`min-w-12 px-3 py-2 rounded-lg text-center font-bold tabular-nums ${
                    PLATE_COLOR[p] ?? 'bg-neutral-900'
                  }`}
                >
                  {p}
                </li>
              ))}
            </ul>
            <div className="text-xs text-[var(--color-muted)] tabular-nums">
              Loaded: <span className="font-mono">{loaded}</span> lb
              {loaded !== t && (
                <span className="text-[var(--color-warn)] ml-1">
                  (target {t}, off by {Math.abs(t - loaded)})
                </span>
              )}
            </div>
          </section>
        )
      ) : (
        <p className="text-sm text-[var(--color-muted)] italic">
          Target must be at least {bar} lb (the bar).
        </p>
      )}
    </main>
  );
}
