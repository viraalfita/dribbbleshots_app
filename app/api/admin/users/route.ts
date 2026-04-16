import { NextRequest, NextResponse } from 'next/server';
import { publicDb } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: members, error: membersError } = await publicDb
      .from('project_members')
      .select('user_id, role')
      .eq('project', 'dribble_shots')
      .order('joined_at', { ascending: true });

    if (membersError) throw membersError;

    const memberIds = (members ?? []).map(m => m.user_id);

    const { data: allProfiles } = await publicDb
      .from('users_profile')
      .select('id, name');

    const profileMap = new Map(
      (allProfiles ?? []).map((p: { id: string; name: string }) => [p.id, p])
    );

    const users = (members ?? []).map(m => ({
      user_id: m.user_id,
      name: profileMap.get(m.user_id)?.name ?? 'Unknown',
      role: m.role,
    }));

    // If ?available=true, also return users not yet in the project
    const available = req.nextUrl.searchParams.get('available') === 'true'
      ? (allProfiles ?? [])
          .filter((p: { id: string }) => !memberIds.includes(p.id))
          .map((p: { id: string; name: string }) => ({ user_id: p.id, name: p.name }))
      : undefined;

    return NextResponse.json({ success: true, users, available });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST — add a user to the dribble_shots project */
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user_id, role } = await req.json();

    if (!user_id || !role) {
      return NextResponse.json({ error: 'user_id and role are required' }, { status: 400 });
    }
    if (!['admin', 'designer'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or designer' }, { status: 400 });
    }

    // Verify user exists
    const { data: profile } = await publicDb
      .from('users_profile')
      .select('id, name')
      .eq('id', user_id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const { error: insertError } = await publicDb
      .from('project_members')
      .insert({ user_id, project: 'dribble_shots', role });

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      user: { user_id: profile.id, name: profile.name, role },
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE — remove a user from the dribble_shots project */
export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (user_id === session.userId) {
      return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 400 });
    }

    const { error } = await publicDb
      .from('project_members')
      .delete()
      .eq('user_id', user_id)
      .eq('project', 'dribble_shots');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH — change a user's role */
export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user_id, role } = await req.json();

    if (!user_id || !role) {
      return NextResponse.json({ error: 'user_id and role are required' }, { status: 400 });
    }
    if (!['admin', 'designer'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or designer' }, { status: 400 });
    }

    const { error } = await publicDb
      .from('project_members')
      .update({ role })
      .eq('user_id', user_id)
      .eq('project', 'dribble_shots');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
