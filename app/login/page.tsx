import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'app_auth';

async function login(formData: FormData) {
  'use server';
  const password = process.env.APP_PASSWORD;
  if (!password) redirect('/');

  const submitted = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/') || '/';

  if (submitted === password) {
    const jar = await cookies();
    jar.set(COOKIE_NAME, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    redirect(next);
  }
  redirect(`/login?next=${encodeURIComponent(next)}&error=1`);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? '/';
  const error = params.error === '1';

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-black text-white">
      <form action={login} className="w-full max-w-xs flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Lift Tracker</h1>
        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-lg outline-none focus:border-emerald-500"
        />
        {error ? <p className="text-red-500 text-sm">Wrong password.</p> : null}
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-semibold py-3 text-lg"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
