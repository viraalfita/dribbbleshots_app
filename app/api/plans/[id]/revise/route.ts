import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import { evaluatePlan } from '@/lib/ai/evaluate';
import type { ShotPlan, ThemeLibrary } from '@/lib/db/schema';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'designer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const originalPlanId = parseInt(id, 10);
  if (isNaN(originalPlanId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const { data: originalPlan, error: fetchError } = await db
      .from('shot_plans')
      .select('*')
      .eq('id', originalPlanId)
      .single();
    if (fetchError || !originalPlan) {
      return NextResponse.json({ error: 'Original plan not found' }, { status: 404 });
    }

    const typedOriginal = originalPlan as ShotPlan;
    if (typedOriginal.designer_id !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const planData = await req.json();

    const { data: theme, error: themeError } = await db
      .from('theme_library')
      .select('*')
      .eq('id', planData.generalThemeId)
      .single();
    if (themeError || !theme) {
      return NextResponse.json({ error: 'Invalid general theme ID' }, { status: 400 });
    }

    const { data: newPlan, error: insertError } = await db
      .from('shot_plans')
      .insert({
        designer_id: session.userId,
        parent_plan_id: originalPlanId,
        revision_number: typedOriginal.revision_number + 1,
        general_theme_id: planData.generalThemeId,
        specific_theme: planData.specificTheme,
        title: planData.title,
        product_type: planData.productType,
        target_market: planData.targetMarket,
        app_explanation: planData.appExplanation,
        sections_json: planData.sectionsJson ?? null,
        screens_json: planData.screensJson ?? null,
        pages_json: planData.pagesJson ?? null,
        ref_links_json: planData.refLinksJson ?? null,
        status: 'submitted',
      })
      .select('id')
      .single();
    if (insertError || !newPlan) throw insertError;

    const evaluation = await evaluatePlan(planData, theme as ThemeLibrary);

    await db.from('ai_evaluations').insert({
      plan_id: newPlan.id,
      score: evaluation.score,
      label: evaluation.label,
      score_breakdown_json: evaluation.score_breakdown,
      field_feedback_json: evaluation.field_feedback,
      overall_verdict: evaluation.overall_verdict,
    });

    return NextResponse.json({ success: true, planId: newPlan.id });
  } catch (error) {
    console.error('Error submitting revision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
