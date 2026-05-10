'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface WindowEventMap {
    'rest:start': CustomEvent<{ seconds?: number; label?: string }>;
  }
}

export function startRest(seconds = 180, label?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('rest:start', { detail: { seconds, label } }));
}

export function RestTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [label, setLabel] = useState<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function onStart(e: WindowEventMap['rest:start']) {
      const sec = e.detail?.seconds ?? 180;
      setRemaining(sec);
      setLabel(e.detail?.label ?? 'Rest');
    }
    window.addEventListener('rest:start', onStart);
    return () => window.removeEventListener('rest:start', onStart);
  }, []);

  useEffect(() => {
    if (remaining == null) return;
    if (remaining <= 0) {
      if (typeof navigator !== 'undefined') navigator.vibrate?.([100, 50, 100]);
      try {
        const audioCtx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.connect(gain).connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch {}
      const t = setTimeout(() => setRemaining(null), 1200);
      return () => clearTimeout(t);
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r == null ? r : r - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [remaining]);

  if (remaining == null) return null;

  const mm = Math.max(0, Math.floor(remaining / 60));
  const ss = Math.max(0, remaining % 60).toString().padStart(2, '0');
  const done = remaining <= 0;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto rounded-2xl shadow-xl border px-4 py-3 flex items-center gap-3 ${
          done
            ? 'bg-emerald-500 border-emerald-400 text-black'
            : 'bg-[var(--color-card)] border-[var(--color-border)]'
        }`}
      >
        <div>
          <div className="text-xs opacity-70">{done ? 'GO' : label}</div>
          <div className="text-2xl font-bold tabular-nums leading-none">
            {mm}:{ss}
          </div>
        </div>
        {!done && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setRemaining((r) => (r == null ? r : Math.max(0, r - 30)))}
              className="w-9 h-9 rounded-lg bg-neutral-900 text-sm"
            >
              −30
            </button>
            <button
              type="button"
              onClick={() => setRemaining((r) => (r == null ? r : r + 30))}
              className="w-9 h-9 rounded-lg bg-neutral-900 text-sm"
            >
              +30
            </button>
            <button
              type="button"
              onClick={() => setRemaining(null)}
              className="w-9 h-9 rounded-lg bg-neutral-900 text-sm"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
