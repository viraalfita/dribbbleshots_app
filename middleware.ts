import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Decodes the JWT payload without verifying the signature.
 * Used only for routing decisions — actual token validation happens in each
 * API route via authClient.auth.getUser(token).
 */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const isPublicRoute = path === '/login' || path.startsWith('/api/auth');

  const accessToken = req.cookies.get('sb-access-token')?.value;
  const role = req.cookies.get('dribble-role')?.value;

  let isLoggedIn = false;
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    isLoggedIn = !!payload?.exp && payload.exp > Date.now() / 1000;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isLoggedIn && path === '/') {
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/plans', req.url));
  }

  if (isLoggedIn && path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/plans', req.url));
  }

  if (isLoggedIn && path.startsWith('/plans') && role !== 'designer') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
