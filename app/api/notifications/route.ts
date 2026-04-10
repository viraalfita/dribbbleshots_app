import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import type { Notification } from '@/lib/db/schema';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', session.userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ success: true, notifications: (data ?? []) as Notification[] });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
