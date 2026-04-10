import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import { validateApiKey } from '@/lib/api-auth';
import type { ThemeLibrary } from '@/lib/db/schema';

/**
 * GET /api/themes
 * Accepts either:
 *   - A valid Supabase session cookie (browser/frontend path)
 *   - A Bearer API key via Authorization header (external integrations e.g. OpenClaw)
 */
export async function GET(request: NextRequest) {
  const hasBearer = request.headers.get('Authorization')?.startsWith('Bearer ');

  if (hasBearer) {
    const authError = await validateApiKey(request);
    if (authError) return authError;
  } else {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', hint: 'Login via cookie session or pass Authorization: Bearer <API_KEY>' },
        { status: 401 },
      );
    }
  }

  try {
    const { data, error } = await db.from('theme_library').select('*');
    if (error) throw error;
    return NextResponse.json({ success: true, themes: (data ?? []) as ThemeLibrary[] });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
