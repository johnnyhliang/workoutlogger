'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { todayISO, weekdayKey } from '@/lib/date';

export function DateRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (!params.get('d')) params.set('d', todayISO());
    if (!params.get('w')) params.set('w', weekdayKey());
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, search]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center text-[var(--color-muted)]">
      Loading…
    </main>
  );
}
