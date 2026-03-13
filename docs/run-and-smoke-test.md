# How to run the project & what to check before approval

## 1. Run the project (see it)

From the repo root:

```bash
cd app
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:3000**.

### What works **without** env vars set

- **Dev server** — `npm run dev` starts.
- **Landing page (maybe)** — `/` might load; it uses Clerk’s `auth()`, so if Clerk keys are missing you may get an error or a Clerk error page. If you see “Portfolio Intelligence” with Sign in / Sign up, the landing page is working.

### What **does not** work without envs

- **Sign in / Sign up** — Needs Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Without these, auth routes fail.
- **After sign-in (dashboard, properties, etc.)** — The app syncs the signed-in user to the DB via `getAppUser()` (Prisma `user.upsert`). If **`DATABASE_URL`** is missing or wrong, you get a **`PrismaClientInitializationError`** as soon as you hit the dashboard or any protected page. Fix: set `DATABASE_URL` in `.env`, then from `app/` run **`npm run db:migrate`** so the database exists and Prisma can connect. After that, sign-in and dashboard will work.
- **Dashboard, properties, settings, pricing** — All need **Clerk + database**. Without DB, any protected page or API will error.
- **Billing (pricing, checkout, portal)** — Needs **Stripe** env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_INVESTOR`, `STRIPE_PRICE_ID_PRO` (and optionally `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). Without these, pricing page may load but checkout and portal will fail when used.

**Summary:** To “just see it” you can run with an empty `.env` and see if the server and landing page load. To use the app at all (sign in, dashboard, properties), you need **Clerk + `DATABASE_URL`** (and migrations). To test billing, add **Stripe** env vars and Stripe Dashboard setup (products/prices, webhook) per `docs/manual-steps.md`.

---

## 2. After you add envs

1. **Clerk** — Create app at clerk.com, add publishable and secret key to `.env`. Set redirect URLs (e.g. `/dashboard`).
2. **Database** — Create Postgres DB (Neon/Supabase/Railway), set `DATABASE_URL` in `.env`. From `app/` run: `npm run db:migrate` (and optionally `npm run db:seed`).
3. **Stripe (for billing)** — Create Stripe account (test mode), create Investor and Pro products/prices, add webhook for `https://<your-ngrok-or-host>/api/billing/webhook`, set Stripe env vars in `.env` (see `app/.env.example` and `docs/manual-steps.md`).

Then run again: `npm run dev` and open http://localhost:3000. Sign up, sign in, and you can use the full app.

---

## 3. What to look for before approval (smoke test)

Use this as a quick checklist before you approve Phase 4 (or before moving to Phase 5).

### Core (needs Clerk + DB only)

- [ ] **Landing** — `/` shows “Portfolio Intelligence” and Sign in / Sign up (or “Go to dashboard” when signed in).
- [ ] **Auth** — Sign up and sign in work; redirect to dashboard (or intended route) after login.
- [ ] **Dashboard** — Loads; shows empty state or portfolio summary (total value, debt, equity, cash flow, etc.).
- [ ] **Properties** — Can add a property (address, purchase info, value, rent, expenses, etc.); it appears in the list; can view, edit, delete.
- [ ] **Mortgages** — On a property detail, can add/edit/delete mortgages; numbers show correctly.
- [ ] **Metrics** — Dashboard and property detail show metrics (cap rate, cash flow, equity, LTV, etc.) that match the data.
- [ ] **Charts** — Dashboard (or relevant page) shows charts (e.g. equity, debt vs value, cash flow); no crashes on empty data.
- [ ] **Amortization** — Property with mortgage shows amortization timeline/schedule; looks reasonable.

### Billing (needs Stripe env + Dashboard setup)

- [ ] **Pricing** — `/pricing` loads; shows plans (Free, Investor, Pro) and upgrade actions.
- [ ] **Property limit** — As Free (1 property), adding a second property is blocked with an upgrade message and link to pricing.
- [ ] **Checkout** — “Upgrade” on pricing goes to Stripe Checkout (test mode); success redirects to `/billing/success` (or configured URL).
- [ ] **Settings / billing** — Settings shows current plan, property count/limit, “Manage billing” (or similar); “Manage billing” opens Stripe Billing Portal (test mode).
- [ ] **Webhook** — After a test checkout, subscription/plan in the app (or DB) reflects the new plan (requires webhook endpoint reachable by Stripe, e.g. ngrok for local).

### Quick sanity

- [ ] **Build** — From `app/`: `npm run build` and `npm run lint` both pass.
- [ ] **No obvious leaks** — No visible secrets in UI or client bundles; billing and auth only use env-based config.

If the core list works (with Clerk + DB) and the billing list works (with Stripe set up), and build/lint pass, you’re in good shape to approve and move on to Phase 5 when ready.
