import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
};

// Service-role client scoped to dribble_shots schema.
// Use for all dribble_shots table queries in API routes.
export const db = createClient(url, serviceKey, {
  ...clientOptions,
  db: { schema: 'dribble_shots' },
});

// Service-role client scoped to public schema.
// Use for queries against public.users_profile and public.project_members.
export const publicDb = createClient(url, serviceKey, clientOptions);

// Anon-key client for Supabase Auth operations (signIn, signOut, getUser).
export const authClient = createClient(url, anonKey, clientOptions);
