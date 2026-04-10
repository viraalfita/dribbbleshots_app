import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { publicDb } from '@/lib/db';

function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/**
 * Validates a Bearer API key from the Authorization header against public.api_keys.
 * Returns null if the key is valid (proceed), or a NextResponse error if not.
 */
export async function validateApiKey(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header', hint: 'Use: Authorization: Bearer <API_KEY>' },
      { status: 401 },
    );
  }

  const rawKey = authHeader.slice(7).trim();
  const hash = hashKey(rawKey);

  const { data, error } = await publicDb
    .from('api_keys')
    .select('id, is_active')
    .eq('key_hash', hash)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  if (!data.is_active) return NextResponse.json({ error: 'API key is inactive' }, { status: 403 });

  // fire-and-forget: update last_used_at
  void Promise.resolve(
    publicDb
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)
  ).catch(() => {});

  return null;
}
