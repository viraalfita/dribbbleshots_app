import { NextResponse } from 'next/server';
import { db, publicDb } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import type { ShotPlan, AiEvaluation, UsersProfile } from '@/lib/db/schema';

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      { data: plans, error: plansError },
      { data: allAiEvals },
      { data: allProfiles },
    ] = await Promise.all([
      db.from('shot_plans').select('*').order('created_at', { ascending: false }),
      db.from('ai_evaluations').select('plan_id, score, label'),
      publicDb.from('users_profile').select('id, name'),
    ]);

    if (plansError) throw plansError;

    const evalMap = new Map(
      ((allAiEvals ?? []) as Pick<AiEvaluation, 'plan_id' | 'score' | 'label'>[]).map(ev => [ev.plan_id, ev])
    );
    const profileMap = new Map(
      ((allProfiles ?? []) as UsersProfile[]).map(p => [p.id, p])
    );

    const enrichedPlans = ((plans ?? []) as ShotPlan[]).map(plan => ({
      ...plan,
      designerUsername: profileMap.get(plan.designer_id)?.name ?? 'Unknown',
      aiScore: evalMap.get(plan.id)?.score ?? null,
      aiLabel: evalMap.get(plan.id)?.label ?? null,
    }));

    return NextResponse.json({ success: true, plans: enrichedPlans });
  } catch (error) {
    console.error('Error fetching admin plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
