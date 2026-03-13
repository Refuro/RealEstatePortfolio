# Real Estate Portfolio Intelligence — App

Next.js application. See repo root and `../docs/` for product and engineering specs.

## Setup

```bash
cp .env.example .env
# Edit .env with your values (database, auth, etc.) as we add them.
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command   | Description        |
|----------|--------------------|
| `npm run dev`   | Dev server         |
| `npm run build` | Production build   |
| `npm run start` | Run production     |
| `npm run lint`  | Run ESLint         |

## Deploy (Vercel)

1. Push repo to GitHub; import project in Vercel (root directory: `app` if repo root is parent).
2. Set environment variables in Vercel from `.env.example`.
3. Connect a PostgreSQL database (Neon, Supabase, or Railway) and set `DATABASE_URL`.
4. Deploy. Vercel runs `build` and serves with `start`.

If the repo root is this folder, use default root and the above applies as-is.
