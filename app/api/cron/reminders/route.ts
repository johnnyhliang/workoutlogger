import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { db } from '@/db/client';
import { reminders, pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

webpush.setVapidDetails(
  'mailto:noreply@lifttracker.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = now.getUTCMinutes();
  const roundedMm = String(Math.floor(mm / 15) * 15).padStart(2, '0');
  const timeSlot = `${hh}:${roundedMm}`;

  const dueReminders = await db.select().from(reminders).where(eq(reminders.enabled, 1));
  const due = dueReminders.filter(r => r.timeHHMM === timeSlot);

  if (due.length === 0) return NextResponse.json({ sent: 0 });

  const subs = await db.select().from(pushSubscriptions);
  let sent = 0;
  for (const reminder of due) {
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: 'Lift Tracker', body: reminder.name })
        );
        sent++;
      } catch {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
  }
  return NextResponse.json({ sent });
}
