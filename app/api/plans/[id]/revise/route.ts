import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shotPlans, aiEvaluations, themeLibrary } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { evaluatePlan } from '@/lib/ai/evaluate';
import { eq } from 'drizzle-orm';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'designer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const originalPlanId = parseInt(resolvedParams.id, 10);
    if (isNaN(originalPlanId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        const planData = await req.json();

        // Verify original plan exists and belongs to the designer
        const originalPlan = await db.query.shotPlans.findFirst({
            where: eq(shotPlans.id, originalPlanId)
        });

        if (!originalPlan) return NextResponse.json({ error: 'Original plan not found' }, { status: 404 });
        if (originalPlan.designerId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Fetch general theme context
        const generalThemeContext = await db.query.themeLibrary.findFirst({
            where: eq(themeLibrary.id, planData.generalThemeId)
        });

        if (!generalThemeContext) {
            return NextResponse.json({ error: 'Invalid general theme ID' }, { status: 400 });
        }

        // Determine new revision number
        // We could count existing revisions, but for simplicity, we'll increment the original's
        const newRevisionNumber = originalPlan.revisionNumber + 1;

        // Insert new Plan revision
        const [newPlan] = await db.insert(shotPlans).values({
            designerId: session.userId!,
            parentPlanId: originalPlanId,
            revisionNumber: newRevisionNumber,
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

        // Trigger AI Evaluation on new plan
        const evaluation = await evaluatePlan(planData, generalThemeContext);

        // Save Evaluation
        await db.insert(aiEvaluations).values({
            planId: newPlan.id,
            score: evaluation.score,
            label: evaluation.label,
            scoreBreakdownJson: evaluation.score_breakdown,
            fieldFeedbackJson: evaluation.field_feedback,
            overallVerdict: evaluation.overall_verdict
        });

        return NextResponse.json({ success: true, planId: newPlan.id });
    } catch (error) {
        console.error('Error submitting revision:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
