import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shotPlans, aiEvaluations, adminReviews, themeLibrary } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const planId = parseInt(resolvedParams.id, 10);
    if (isNaN(planId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        const plan = await db.query.shotPlans.findFirst({
            where: eq(shotPlans.id, planId),
            with: {
                // Note: Drizzle relations need to be defined in schema.ts for `with` to work easily, 
                // or we can just fetch them sequentially. Sequential is safer here since relations aren't explicitly defined yet.
            }
        });

        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

        // Authorization check: designers can only see their own plans
        if (session.role === 'designer' && plan.designerId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const aiEval = await db.query.aiEvaluations.findFirst({
            where: eq(aiEvaluations.planId, planId)
        });

        const adminReview = await db.query.adminReviews.findFirst({
            where: eq(adminReviews.planId, planId)
        });

        const generalTheme = await db.query.themeLibrary.findFirst({
            where: eq(themeLibrary.id, plan.generalThemeId)
        });

        return NextResponse.json({
            success: true,
            plan,
            aiEvaluation: aiEval || null,
            adminReview: adminReview || null,
            generalTheme: generalTheme || null
        });

    } catch (error) {
        console.error('Error fetching plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
