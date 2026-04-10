import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';
import type { ShotPlan } from '@/lib/db/schema';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const planId = parseInt(id, 10);
  if (isNaN(planId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const { decision, fieldNotesJson } = await request.json();

    if (!['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const { data: plan, error: planError } = await db
      .from('shot_plans')
      .select('id, designer_id, title')
      .eq('id', planId)
      .single();
    if (planError || !plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const typedPlan = plan as Pick<ShotPlan, 'id' | 'designer_id' | 'title'>;

    const { data: review, error: reviewError } = await db
      .from('admin_reviews')
      .insert({
        plan_id: planId,
        reviewer_id: session.userId,
        decision,
        field_notes_json: fieldNotesJson ?? {},
      })
      .select('id')
      .single();
    if (reviewError || !review) throw reviewError;

    await db.from('shot_plans').update({ status: decision }).eq('id', planId);

    await db.from('notifications').insert({
      user_id: typedPlan.designer_id,
      plan_id: typedPlan.id,
      message: `Your Dribbble Shot Plan "${typedPlan.title}" has been ${decision}.`,
      type: decision,
    });

    return NextResponse.json({ success: true, reviewId: review.id });
  } catch (error) {
    console.error('Error reviewing plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
