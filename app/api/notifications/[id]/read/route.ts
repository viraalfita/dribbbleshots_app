import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const notificationId = parseInt(id, 10);
  if (isNaN(notificationId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    // Verify ownership before updating
    const { data: existing } = await db
      .from('notifications')
      .select('id')
      .eq('id', notificationId)
      .eq('user_id', session.userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
