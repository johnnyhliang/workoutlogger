import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Logout() {
  const jar = await cookies();
  jar.delete('app_auth');
  redirect('/login');
}
