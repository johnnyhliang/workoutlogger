import { ProteinPage } from '../components/ProteinPage';
import { getProteinForDay, getProteinForRange } from '@/db/queries';

export const dynamic = 'force-dynamic';

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
}

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const params = await searchParams;
  // Server-side: best effort. The page will refresh once the client knows true
  // local date via revalidatePath after add/delete.
  const date = params.d ?? isoDaysAgo(0);
  const today = await getProteinForDay(date);
  const start = isoDaysAgo(6);
  const range = await getProteinForRange(start, date);

  // Fill missing days with 0
  const map = new Map(range.map((r) => [r.date, Number(r.total)]));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = isoDaysAgo(6 - i);
    return { date: d, total: map.get(d) ?? 0 };
  });

  return (
    <ProteinPage
      initialEntries={today.entries}
      initialTotal={today.total}
      weekTotals={week}
    />
  );
}
