'use server';

import { randomBytes, createHash } from 'crypto';
import { publicDb } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth/session';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  last_used_at: string | null;
}

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function getApiKeysAction(): Promise<ActionResult<ApiKey[]>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: 'Unauthorized' };

  const { data, error } = await publicDb
    .from('api_keys')
    .select('id, name, key_prefix, is_active, created_by, created_at, last_used_at')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: 'Failed to fetch API keys' };
  return { success: true, data: (data ?? []) as ApiKey[] };
}

export async function generateApiKeyAction(name: string): Promise<ActionResult<{ key: string; record: ApiKey }>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: 'Unauthorized' };

  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Key name is required' };
  }

  const rawSuffix = randomBytes(20).toString('hex'); // 40 hex chars
  const rawKey = `elux_${rawSuffix}`;
  const keyPrefix = rawKey.slice(0, 16);
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const { data, error } = await publicDb
    .from('api_keys')
    .insert({
      name: name.trim(),
      key_prefix: keyPrefix,
      key_hash: keyHash,
      is_active: true,
      created_by: session.email,
    })
    .select('id, name, key_prefix, is_active, created_by, created_at, last_used_at')
    .single();

  if (error || !data) return { success: false, error: 'Failed to generate API key' };

  return {
    success: true,
    data: { key: rawKey, record: data as ApiKey },
  };
}

export async function toggleApiKeyAction(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: 'Unauthorized' };

  const { error } = await publicDb
    .from('api_keys')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) return { success: false, error: 'Failed to update API key' };
  return { success: true, data: undefined };
}

export async function deleteApiKeyAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: 'Unauthorized' };

  const { error } = await publicDb
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: 'Failed to delete API key' };
  return { success: true, data: undefined };
}
