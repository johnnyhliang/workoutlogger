import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? '/';

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-xs flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Lift Tracker</h1>
          <p className="text-xs text-neutral-600 mt-1">who are you</p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
