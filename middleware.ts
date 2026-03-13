import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './lib/auth/session';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    // We need to pass the request and response to get the session from headers
    // For middleware, we have to construct it manually because standard cookies() header is read-only here
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    const path = req.nextUrl.pathname;
    const isPublicRoute = path === '/login' || path.startsWith('/api/auth');

    if (!session.isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (session.isLoggedIn && path === '/') {
        // redirect based on role
        if (session.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url));
        } else {
            return NextResponse.redirect(new URL('/plans', req.url));
        }
    }

    // Protect /admin routes from designers
    if (session.isLoggedIn && path.startsWith('/admin') && session.role !== 'admin') {
        return NextResponse.redirect(new URL('/plans', req.url));
    }

    // Protect /plans routes from admins (optional, but good for separation)
    if (session.isLoggedIn && path.startsWith('/plans') && session.role !== 'designer') {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
