'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function makeToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('auth'));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function loginAction(
  _: unknown,
  formData: FormData,
): Promise<{ error: true }> {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) redirect('/');

  const submitted = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/') || '/';

  if (submitted === password) {
    const token = await makeToken(secret);
    const jar = await cookies();
    jar.set('app_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 90,
    });
    redirect(next);
  }
  return { error: true };
}
