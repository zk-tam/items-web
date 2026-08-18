# ITEMS Web

Mobile-responsive ITEMS catalog and admin panel built with Next.js App Router, Tailwind CSS, PostgreSQL, and the `pg` package. All database and authentication access uses portable server-side SQL; Supabase is used only as the hosted PostgreSQL service and public image bucket.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Postgres, storage, and admin setup

The public catalog and admin panel read PostgreSQL exclusively. `DATABASE_URL` is required; the application never falls back to hardcoded artists or products.

1. Copy `.env.example` to `.env.local` and set the Postgres, storage, and seller-detail values.
2. For a new database, run `supabase/schema.sql` in the Supabase SQL editor. For an existing deployment, run the SQL files in `supabase/migrations/` in filename order (including `202608020001_add_catalog_seo_metadata.sql`).
3. Create the first admin after the schema exists:

```bash
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="a-long-unique-password" npm run admin:create
```

4. Sign in at `/admin/login`. The panel manages artists, items, image uploads, manual WhatsApp-originated orders, invoice PDFs, and receipt PDFs.

## First-party analytics

Set `ANALYTICS_HASH_SECRET` and `CRON_SECRET` to separate random values before deploying. Analytics stores only a server-side HMAC of an anonymous browser token, page paths, external referrer hostnames, and Vercel-derived two-letter country codes—never raw IP addresses. The daily Vercel Cron job removes events after 13 months. Apply the analytics migration files in order to an existing database, then view reports at `/admin/analytics`.

Run the live database smoke test after setup. It validates the schema, RLS, constraints, order snapshots, and image bucket inside a rolled-back transaction, so it does not leave test catalog or order records behind:

```bash
npm run test:integration
```

`@supabase/supabase-js` is imported only by `lib/storage/supabase-storage.ts`, which is server-only and uses a Supabase Secret key only for bucket operations. A publishable key cannot upload here because Storage RLS has no knowledge of this app's custom pg admin sessions. Swapping image storage requires replacing that adapter; switching Postgres hosts requires only changing `DATABASE_URL`.
