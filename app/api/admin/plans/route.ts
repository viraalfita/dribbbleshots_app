import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shotPlans, users, aiEvaluations } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function GET() {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Basic fetch of all plans. In a real app we might want pagination,
        // and we might need to join or fetch users to show designer name.
        // For simplicity with Drizzle sqlite, we'll fetch plans and join manually or use relations if defined.

        // Instead of complex joins for this prototype, we'll fetch plans and
        // doing a naive map to attach basic AI eval score if needed for a dashboard list.
        const plans = await db.query.shotPlans.findMany({
            orderBy: (shotPlans, { desc }) => [desc(shotPlans.createdAt)]
        });

        const allAiEvals = await db.query.aiEvaluations.findMany();
        const evalMap = new Map(allAiEvals.map(ev => [ev.planId, ev]));

        const allUsers = await db.query.users.findMany();
        const userMap = new Map(allUsers.map(u => [u.id, u]));

        const enrichedPlans = plans.map(plan => ({
            ...plan,
            designerUsername: userMap.get(plan.designerId)?.username || 'Unknown',
            aiScore: evalMap.get(plan.id)?.score || null,
            aiLabel: evalMap.get(plan.id)?.label || null,
        }));

        return NextResponse.json({ success: true, plans: enrichedPlans });
    } catch (error) {
        console.error('Error fetching admin plans:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
