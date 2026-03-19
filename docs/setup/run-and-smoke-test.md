# Run the app & smoke test

**Purpose:** Verify the app runs and works end-to-end before deploying to production or handing off to users. Use this doc to get the app running locally and to run a quick smoke test.

---

## Quick setup

**Repo layout:** `/app` — Next.js app (run and deploy from here). `/docs` — Product and engineering docs. The repo root has a **minimal `package.json`** (Husky only) so git hooks can live at the git root.

**Local setup:** From repo root: **`npm install`** (installs Husky and wires git hooks) → `cd app` → `cp .env.example .env` → `npm install && npm run dev` → Open http://localhost:3000. When using Prisma: run `npx prisma migrate dev` and optionally `npx prisma db seed`.

**Deploying:** Vercel — set Root Directory to `app`, add env vars from `.env.example`, connect Postgres. Run `prisma migrate deploy` for production DB.

---

## 1. Run the project

From the repo root:

```bash
cd app
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:3000**.

### What works without env vars

- **Dev server** — `npm run dev` starts.
- **Landing page (maybe)** — `/` might load; it uses Clerk's `auth()`, so if Clerk keys are missing you may get an error or a Clerk error page. If you see "Veld Portfolio" with Sign in / Sign up, the landing page is working.

### What needs env vars

- **Sign in / Sign up** — Needs Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- **Dashboard, properties, settings** — Need Clerk + `DATABASE_URL`. Run `npm run db:migrate` from `app/` after setting `DATABASE_URL`.
- **Billing (checkout, portal)** — Needs Stripe env vars. See `app/.env.example` and [manual-steps.md](manual-steps.md).

**Summary:** To "just see it," run with an empty `.env` and check if the server and landing load. To use the app (sign in, dashboard, properties), you need Clerk + `DATABASE_URL` + migrations. To test billing, add Stripe env vars and Stripe Dashboard setup per [manual-steps.md](manual-steps.md).

---

## 2. First-time setup (after adding envs)

1. **Clerk** — Create app at clerk.com; add publishable and secret key to `.env`. Set redirect URLs (e.g. `/dashboard`).
2. **Database** — Create Postgres DB (Neon/Supabase/Railway); set `DATABASE_URL` in `.env`. From `app/` run `npm run db:migrate` (and optionally `npm run db:seed`).
3. **Stripe** — Create Stripe account (test mode), create Investor and Pro products with monthly and annual prices, add webhook for `https://<your-app>/api/billing/webhook`, set Stripe env vars in `.env`. See [manual-steps.md](manual-steps.md).

Then run `npm run dev` and open http://localhost:3000. Sign up, sign in, and you can use the full app.

---

## 3. Smoke test checklist

Use this before deploying or before approving a release.

**Deeper property flows:** If the release changed add/edit/detail property UX or property APIs, also run [Property flow regression matrix](../qa/property-flow-regression-matrix.md) (tabs, workspaces, PATCH validation).

### Core (needs Clerk + DB)

- [ ] **Landing** — `/` shows "Veld Portfolio" and Sign in / Sign up (or "Go to dashboard" when signed in).
- [ ] **Auth** — Sign up and sign in work; redirect to dashboard after login.
- [ ] **Dashboard** — Loads; shows empty state or portfolio summary (total value, debt, equity, cash flow).
- [ ] **Properties** — Can add a property; it appears in the list; can view, edit, delete.
- [ ] **Mortgages** — On a property detail, can add/edit/delete mortgages; numbers show correctly.
- [ ] **Metrics** — Dashboard and property detail show metrics (cap rate, cash flow, equity, LTV) that match the data.
- [ ] **Charts** — Dashboard shows charts (equity, debt vs value, cash flow); no crashes on empty data.
- [ ] **Amortization** — Property with mortgage shows amortization timeline; looks reasonable.

### Billing (needs Stripe env + Dashboard setup)

- [ ] **Pricing** — `/pricing` (public) and `/plans` (in-app) load; show plans (Free, Investor, Pro) and upgrade actions.
- [ ] **Property limit** — As Free (1 property), adding a second property is blocked with an upgrade message and link to `/plans`.
- [ ] **Checkout** — "Upgrade" goes to Stripe Checkout (test mode); success redirects to `/billing/success`.
- [ ] **Settings / billing** — Settings shows current plan, property count/limit, "Manage billing"; opens Stripe Billing Portal.
- [ ] **Webhook** — After a test checkout, subscription/plan in the app reflects the new plan (webhook endpoint must be reachable by Stripe, e.g. ngrok for local).

### Before push (recommended)

Run from `app/` before pushing or opening a PR — **same order as CI** ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)): lint after install, then tests.

```bash
npm run lint
npm run test
```

Optional: `npm run test:coverage` for coverage on configured modules. **CI does not run `npm run build`** (needs DB + secrets — see [`docs/qa/test-infrastructure-review.md`](../qa/test-infrastructure-review.md) §3.5); use local `npm run build` or Vercel preview for compile verification.

### Git hooks (Husky)

If you ran **`npm install` at the repo root**, [Husky](https://typicode.github.io/husky/) installs hooks that run the same checks as CI from **`app/`**: `npm run lint` then `npm run test`.

- **pre-commit** — runs before each **`git commit`** completes (blocks the commit if lint or tests fail).
- **pre-push** — runs before **`git push`** (same checks again, so a clean commit that later breaks tests still gets caught before the remote).

**Skip only when necessary** (broken laptop env, urgent hotfix): disable hooks for one command with `HUSKY=0` (e.g. `HUSKY=0 git commit` / `HUSKY=0 git push` on macOS/Linux/Git Bash) or PowerShell: `$env:HUSKY='0'; git commit`. Alternatively `git commit --no-verify` / `git push --no-verify` bypasses hook scripts—use sparingly; CI will still run on the remote.

**Fresh clone:** `npm install` at **repo root** (hooks) **and** `cd app && npm install` (app dependencies), or the hook may fail when `app/node_modules` is missing.

### Unit tests (Vitest)

From `app/`:

```bash
npm run test
npm run test:coverage   # optional — coverage for lib metrics, amortization, property validation, selected API routes
```

See [`docs/proposals/testing-implementation-plan.md`](../proposals/testing-implementation-plan.md). CI runs **`npm run lint`** then **`npm run test`** on push/PR ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)). Process notes: [`docs/qa/test-infrastructure-review.md`](../qa/test-infrastructure-review.md).

### Sanity

- [ ] **Build** — From `app/`: `npm run build` and `npm run lint` both pass.
- [ ] **No obvious leaks** — No visible secrets in UI or client bundles.

If the core list works (Clerk + DB) and the billing list works (Stripe set up), and build/lint pass, you're in good shape.
