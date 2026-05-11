import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page and its action through
  if (pathname === '/login') return NextResponse.next();

  const cookie = req.cookies.get('app_auth')?.value;
  if (cookie === process.env.APP_PASSWORD) return NextResponse.next();

  const login = req.nextUrl.clone();
  login.pathname = '/login';
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
