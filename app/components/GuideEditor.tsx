'use client';

import { useState, useTransition } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveGuide } from '@/app/actions';
import { useEscapeKey } from '@/lib/hooks';

export function GuideEditor({ initial }: { initial: string }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [pending, startTransition] = useTransition();

  useEscapeKey(editing, () => {
    setEditing(false);
    setDraft(content);
  });

  function save() {
    startTransition(async () => {
      await saveGuide(draft);
      setContent(draft);
      setEditing(false);
    });
  }

  return (
    <main className="px-4 pt-6 pb-24">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Manual</h1>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Goals · program · app map · logging flow · progress strategy
          </p>
        </div>
        {editing ? (
          <div className="flex gap-2 pt-1 shrink-0">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="px-3 py-1.5 rounded-md bg-emerald-500 text-black text-xs font-semibold disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setDraft(content); }}
              aria-label="Cancel"
              className="text-[var(--color-muted)] hover:text-[var(--color-bad)] w-7 h-7"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] pt-1 shrink-0"
            aria-label="Edit"
          >
            ✎ edit
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          className="w-full min-h-[70vh] bg-neutral-900 rounded-xl px-3 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
    </main>
  );
}
