import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const sub = await req.json();
  const endpoint = sub.endpoint as string;
  const p256dh = sub.keys.p256dh as string;
  const auth = sub.keys.auth as string;
  const existing = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).limit(1);
  if (!existing[0]) {
    await db.insert(pushSubscriptions).values({ endpoint, p256dh, auth });
  }
  return NextResponse.json({ ok: true });
}
