import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import type { ShotPlan, AiEvaluation, AdminReview, ThemeLibrary } from '@/lib/db/schema';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const planId = parseInt(id, 10);
  if (isNaN(planId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const { data: plan, error: planError } = await db
      .from('shot_plans')
      .select('*')
      .eq('id', planId)
      .single();
    if (planError || !plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const typedPlan = plan as ShotPlan;

    // Designers can only view their own plans
    if (session.role === 'designer' && typedPlan.designer_id !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [{ data: aiEval }, { data: adminReview }, { data: generalTheme }] = await Promise.all([
      db.from('ai_evaluations').select('*').eq('plan_id', planId).maybeSingle(),
      db.from('admin_reviews').select('*').eq('plan_id', planId).maybeSingle(),
      db.from('theme_library').select('*').eq('id', typedPlan.general_theme_id).single(),
    ]);

    return NextResponse.json({
      success: true,
      plan: typedPlan,
      aiEvaluation: (aiEval as AiEvaluation | null) ?? null,
      adminReview: (adminReview as AdminReview | null) ?? null,
      generalTheme: (generalTheme as ThemeLibrary | null) ?? null,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
