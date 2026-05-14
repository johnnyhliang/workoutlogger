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
        <div className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-8 mb-3 text-[var(--color-fg)] border-b border-[var(--color-border)] pb-2 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold mt-6 mb-2 text-[var(--color-fg)]">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mt-4 mb-1.5 text-[var(--color-accent)]">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-sm leading-relaxed mb-3 text-neutral-300">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-3 space-y-1 pl-4">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 space-y-1 pl-4 list-decimal">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-neutral-300 leading-relaxed list-disc marker:text-[var(--color-muted)]">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[var(--color-fg)]">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-[var(--color-muted)]">{children}</em>
              ),
              code: ({ children, className }) => {
                const isBlock = !!className;
                return isBlock ? (
                  <code className="block bg-neutral-900 border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 mb-3 overflow-x-auto whitespace-pre">{children}</code>
                ) : (
                  <code className="bg-neutral-900 rounded px-1.5 py-0.5 text-xs font-mono text-emerald-400">{children}</code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[var(--color-accent)] pl-3 mb-3 text-sm text-[var(--color-muted)] italic">{children}</blockquote>
              ),
              hr: () => (
                <hr className="border-[var(--color-border)] my-6" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-sm border-collapse">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-muted)] uppercase border-b border-[var(--color-border)]">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-sm text-neutral-300 border-b border-neutral-800">{children}</td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </main>
  );
}
