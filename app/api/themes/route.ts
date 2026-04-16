import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import type { ThemeLibrary } from '@/lib/db/schema';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
