# Setup & deployment

## Repo layout

- **`/app`** — Next.js app (run and deploy from here).
- **`/docs`** — Product and engineering docs.

## Local setup

1. From repo root: `cd app`
2. `cp .env.example .env` and fill in values as we add auth, DB, Stripe.
3. `npm install && npm run dev`
4. Open http://localhost:3000

When we add Prisma: run `npx prisma migrate dev` and optionally `npx prisma db seed`.

## Deploying later

- **Vercel:** Point the project at this repo. If the repo root is the parent of `app`, set “Root Directory” to `app`. Add env vars (same names as `.env.example`). Connect a Postgres provider (Neon/Supabase/Railway) and set `DATABASE_URL`.
- **Build:** Vercel runs `npm run build` in the app directory; no extra config needed for a standard Next.js app.
- **Database:** Run migrations in production (e.g. `prisma migrate deploy`) via a one-off step or in your deploy pipeline once we add Prisma.
