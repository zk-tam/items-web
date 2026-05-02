# ITEMS Web

Mobile-responsive ITEMS catalog built with Next.js App Router, Tailwind CSS, shadcn-style components, Supabase-compatible Postgres, and the `pg` package for portable server-side SQL.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase / Postgres

The UI ships with typed seed data so it runs without environment variables. To use Supabase Postgres, copy `.env.example` to `.env.local`, set `DATABASE_URL`, and run `supabase/schema.sql` in your Supabase SQL editor.

The app reads catalog data through `pg` in `lib/db/items-repository.ts`, keeping the database access SQL-based instead of Supabase SDK-specific. The Supabase browser client is available in `lib/supabase/client.ts` for future auth or storage work.
