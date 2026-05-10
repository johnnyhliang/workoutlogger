'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Today', icon: '🏋' },
  { href: '/history', label: 'History', icon: '📈' },
  { href: '/meals', label: 'Protein', icon: '🍳' },
  { href: '/weight', label: 'Body', icon: '⚖' },
  { href: '/vert', label: 'Vert', icon: '🚀' },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/70">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((it) => {
          const active =
            pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href));
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
                }`}
              >
                <span className="text-lg leading-none">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
