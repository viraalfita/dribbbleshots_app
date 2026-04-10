// Seeds theme_library in dribble_shots schema.
// Users are managed via Supabase Auth dashboard — no user seeding here.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import seedThemes from './seed-data.json';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'dribble_shots' },
  }
);

async function seed() {
  console.log('Seeding dribble_shots.theme_library...');

  await db.from('theme_library').delete().neq('id', 0);
  const { error } = await db.from('theme_library').insert(seedThemes);

  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }

  console.log(`Seeded ${seedThemes.length} themes.`);
}

seed();
