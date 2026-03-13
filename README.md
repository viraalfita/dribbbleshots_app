## Dribbbleshots App

Next.js application for submitting and reviewing Dribbble shot plans. The app now uses Neon PostgreSQL exclusively through Drizzle ORM.

## Environment

Create an `.env` or `.env.local` file with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
SECRET_COOKIE_PASSWORD=change_me_to_a_long_random_string_32chars_minimum
OPENAI_API_KEY=optional_for_ai_features
```

## Local Development

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The seed creates:

- `admin / admin123`
- `designer1 / designer123`

## Docker Production

Build and run the app:

```bash
docker compose up -d --build
```

Run migrations and seed explicitly:

```bash
docker compose run --rm app npm run db:migrate
docker compose run --rm app npm run db:seed
```

The container does not auto-run migrations on startup. This keeps production startup predictable and avoids destructive schema changes on boot.
