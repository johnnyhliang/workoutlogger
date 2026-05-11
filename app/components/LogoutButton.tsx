'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { logoutAction } from '@/app/actions';

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  function confirm() {
    startTransition(() => logoutAction());
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Log out"
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-900 border border-[var(--color-border)] text-neutral-700 hover:text-neutral-500 active:text-neutral-400 transition-colors"
        title="Log out"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 2h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8" />
          <path d="M5 9l3-3-3-3" />
          <path d="M8 6H1" />
        </svg>
      </button>

      {/* Slide-out confirmation panel */}
      <div
        className="absolute right-0 top-9 z-20 overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: open ? '80px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="bg-neutral-900 border border-[var(--color-border)] rounded-xl p-3 flex items-center gap-3 whitespace-nowrap shadow-lg">
          <span className="text-xs text-[var(--color-muted)]">Log out?</span>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="px-3 py-1 rounded-lg bg-red-900 text-red-300 text-xs font-semibold active:bg-red-800 disabled:opacity-40"
          >
            {pending ? '...' : 'Yes'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1 rounded-lg bg-neutral-800 text-[var(--color-muted)] text-xs active:bg-neutral-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
