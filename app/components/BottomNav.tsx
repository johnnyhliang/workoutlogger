'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, ChartLine, Drumstick, Scale, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const items: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/', label: 'Today', Icon: Dumbbell },
  { href: '/history', label: 'History', Icon: ChartLine },
  { href: '/meals', label: 'Protein', Icon: Drumstick },
  { href: '/weight', label: 'Body', Icon: Scale },
  { href: '/reminders', label: 'Alerts', Icon: Bell },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/70">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ href, label, Icon }) => {
          const active =
            pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                  active
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 2}
                  className="transition-transform"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
