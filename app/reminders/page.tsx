import { db } from '@/db/client';
import { reminders } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { RemindersPage } from '@/app/components/RemindersPage';

export const dynamic = 'force-dynamic';

export default async function RemindersRoute() {
  const rows = await db.select().from(reminders).orderBy(desc(reminders.createdAt));
  return <RemindersPage initial={rows} />;
}
