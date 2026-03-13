import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

export async function GET() {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userNotifications = await db.query.notifications.findMany({
            where: and(
                eq(notifications.userId, session.userId!),
                eq(notifications.isRead, false)
            ),
            orderBy: (notifications, { desc }) => [desc(notifications.createdAt)]
        });

        return NextResponse.json({ success: true, notifications: userNotifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
