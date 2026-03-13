import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shotPlans, aiEvaluations, notifications, themeLibrary } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { evaluatePlan } from '@/lib/ai/evaluate';
import { eq } from 'drizzle-orm';

export async function GET() {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'designer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const plans = await db.query.shotPlans.findMany({
            where: eq(shotPlans.designerId, session.userId!),
            orderBy: (shotPlans, { desc }) => [desc(shotPlans.createdAt)]
        });

        const allAiEvals = await db.query.aiEvaluations.findMany();
        const evalMap = new Map(allAiEvals.map(ev => [ev.planId, ev]));

        const enrichedPlans = plans.map(plan => ({
            ...plan,
            aiScore: evalMap.get(plan.id)?.score || null,
            aiLabel: evalMap.get(plan.id)?.label || null,
        }));

        return NextResponse.json({ success: true, plans: enrichedPlans });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'designer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const planData = await req.json();

        // 1. Fetch general theme context
        const generalThemeContext = await db.query.themeLibrary.findFirst({
            where: eq(themeLibrary.id, planData.generalThemeId)
        });

        if (!generalThemeContext) {
            return NextResponse.json({ error: 'Invalid general theme ID' }, { status: 400 });
        }

        // 2. Insert Plan
        const [newPlan] = await db.insert(shotPlans).values({
            designerId: session.userId!,
            parentPlanId: planData.parentPlanId || null,
            generalThemeId: planData.generalThemeId,
            specificTheme: planData.specificTheme,
            title: planData.title,
            productType: planData.productType,
            targetMarket: planData.targetMarket,
            appExplanation: planData.appExplanation,
            sectionsJson: planData.sectionsJson,
            screensJson: planData.screensJson,
            pagesJson: planData.pagesJson,
            refLinksJson: planData.refLinksJson,
            status: 'submitted'
        }).returning({ id: shotPlans.id });

        // 3. Trigger AI Evaluation
        const evaluation = await evaluatePlan(planData, generalThemeContext);

        // 4. Save Evaluation
        await db.insert(aiEvaluations).values({
            planId: newPlan.id,
            score: evaluation.score,
            label: evaluation.label,
            scoreBreakdownJson: evaluation.score_breakdown,
            fieldFeedbackJson: evaluation.field_feedback,
            overallVerdict: evaluation.overall_verdict
        });

        // 5. Optionally notify admins (not explicitly requested, but good practice)

        return NextResponse.json({ success: true, planId: newPlan.id });
    } catch (error) {
        console.error('Error submitting plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
