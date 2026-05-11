'use client';

import { useState, useTransition } from 'react';
import { exportAllAsMarkdown } from '@/lib/export';

export function ExportButton() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function download() {
    startTransition(async () => {
      const md = await exportAllAsMarkdown();
      const date = new Date().toISOString().slice(0, 10);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifttracker-${date}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    });
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={pending}
      className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-semibold text-lg disabled:opacity-50"
    >
      {pending ? 'Preparing…' : done ? '✓ Downloaded' : 'Download Markdown'}
    </button>
  );
}
