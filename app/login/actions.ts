'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash } from 'crypto';

function hash(pw: string) {
  return createHash('sha256').update(pw).digest('hex');
}

export async function loginAction(
  _: unknown,
  formData: FormData,
): Promise<{ error: true }> {
  const password = process.env.APP_PASSWORD;
  if (!password) redirect('/');

  const submitted = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/') || '/';

  if (submitted === password) {
    const jar = await cookies();
    jar.set('app_auth', hash(password), {
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
