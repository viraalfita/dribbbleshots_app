import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id, 10);
    if (isNaN(notificationId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        // Basic authorization: user can only mark their own notifications as read
        const existing = await db.query.notifications.findFirst({
            where: and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, session.userId!)
            )
        });

        if (!existing) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
