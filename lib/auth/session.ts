import { cookies } from 'next/headers';
import { authClient } from '@/lib/db';

export type DribbleRole = 'designer' | 'admin';

export interface AppSession {
  userId: string;  // Supabase Auth UUID
  email: string;
  role: DribbleRole;
}

/**
 * Validates the Supabase access token from the request cookie and returns
 * the current session. Returns null if the token is missing or invalid.
 *
 * Used in API route handlers. For middleware, JWT expiry is checked locally
 * without an HTTP call (see middleware.ts).
 */
export async function getCurrentSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const role = cookieStore.get('dribble-role')?.value as DribbleRole | undefined;

  if (!accessToken || !role) return null;

  const { data: { user }, error } = await authClient.auth.getUser(accessToken);

  if (error || !user || !user.email) return null;

  return {
    userId: user.id,
    email: user.email,
    role,
  };
}
