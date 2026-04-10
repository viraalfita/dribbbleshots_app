import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import { evaluatePlan } from '@/lib/ai/evaluate';
import type { ShotPlan, AiEvaluation, ThemeLibrary } from '@/lib/db/schema';

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'designer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: plans, error: plansError } = await db
      .from('shot_plans')
      .select('*')
      .eq('designer_id', session.userId)
      .order('created_at', { ascending: false });
    if (plansError) throw plansError;

    const { data: allAiEvals } = await db
      .from('ai_evaluations')
      .select('plan_id, score, label');
    const evalMap = new Map(
      ((allAiEvals ?? []) as Pick<AiEvaluation, 'plan_id' | 'score' | 'label'>[]).map(ev => [ev.plan_id, ev])
    );

    const enrichedPlans = ((plans ?? []) as ShotPlan[]).map(plan => ({
      ...plan,
      aiScore: evalMap.get(plan.id)?.score ?? null,
      aiLabel: evalMap.get(plan.id)?.label ?? null,
    }));

    return NextResponse.json({ success: true, plans: enrichedPlans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'designer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
        parent_plan_id: planData.parentPlanId ?? null,
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
    console.error('Error submitting plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
