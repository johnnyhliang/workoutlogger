import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHash } from 'crypto';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page and its action through
  if (pathname === '/login') return NextResponse.next();

  const password = process.env.APP_PASSWORD;
  const expected = password ? createHash('sha256').update(password).digest('hex') : null;
  const cookie = req.cookies.get('app_auth')?.value;
  if (expected && cookie === expected) return NextResponse.next();

  const login = req.nextUrl.clone();
  login.pathname = '/login';
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
