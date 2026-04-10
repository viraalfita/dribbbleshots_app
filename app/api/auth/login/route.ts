import { NextResponse } from 'next/server';
import { authClient, publicDb } from '@/lib/db';

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Fetch user's role for the dribble_shots project
    const { data: member } = await publicDb
      .from('project_members')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('project', 'dribble_shots')
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Not authorized for this project' }, { status: 403 });
    }

    const role = member.role as string;
    const { access_token, refresh_token, expires_in } = data.session;

    const response = NextResponse.json({ success: true, role });
    response.cookies.set('sb-access-token', access_token, {
      ...COOKIE_BASE,
      maxAge: expires_in ?? 3600,
    });
    response.cookies.set('sb-refresh-token', refresh_token, {
      ...COOKIE_BASE,
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set('dribble-role', role, {
      ...COOKIE_BASE,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
