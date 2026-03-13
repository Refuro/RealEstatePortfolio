# Current phase

**As of last update:** Phase 4 complete; **current phase is Phase 5 — Polishing.**

---

## Phase 0 — Foundation ✅

- [x] Repo setup (app in `/app`, docs in `/docs`)
- [x] Auth setup (Clerk, sign-in/sign-up, protected routes, user sync to DB)
- [x] Database schema (Prisma: User, Property, Mortgage, Subscription)
- [x] App shell/layout (sidebar nav, Dashboard, Properties, Settings)

---

## Phase 1 — Core Data Entry ✅

- [x] Property CRUD (API + UI: list, create, edit, delete)
- [x] Mortgage CRUD (API + UI, attached to properties)

---

## Phase 2 — Value Creation ✅

- [x] Metrics engine (property-level + portfolio-level calculations, API endpoints)
- [x] Dashboard summary (portfolio metrics on dashboard, empty state)
- [x] Property detail calculations (show metrics on property detail page)

---

## Phase 3 — Visualization ✅

- [x] Charts (portfolio equity, debt vs value, cash flow; see engineering-spec § Module I)
- [x] Amortization timeline (schedule generator, endpoint, UI; see engineering-spec § Module G)

---

## Phase 4 — Monetization ✅

- [x] Create Stripe products and prices (see engineering-spec § Module J) — user creates in Stripe Dashboard; app uses env price IDs
- [x] Add pricing page
- [x] Add checkout flow
- [x] Add Stripe webhook handling
- [x] Sync subscription status to database
- [x] Enforce property count limits by plan
- [x] Add upgrade/downgrade UI
- [x] Add billing portal access

---

## Phase 5 — Polishing (current)

- [ ] Onboarding (Module K): welcome screen, prompt first property, example metric explanations
- [ ] Settings/account (Module L): profile info display, data export placeholder, delete account placeholder
- [ ] Error handling and better empty states

*Full build order: [engineering-spec.md §8](engineering-spec.md).*

---

## Handoff (Phase 4 → PM)

**New env vars (documented in `app/.env.example` and `docs/manual-steps.md`):**

- `STRIPE_SECRET_KEY` — Stripe secret key (server-only).
- `STRIPE_WEBHOOK_SECRET` — Webhook signing secret (`whsec_...`); used to verify webhook signatures.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (optional for current server-side checkout).
- `STRIPE_PRICE_ID_INVESTOR` — Stripe price ID for Investor plan (5 properties).
- `STRIPE_PRICE_ID_PRO` — Stripe price ID for Pro plan (20 properties).

**Commands:** None. No new migrations (Subscription/User schema already present).

**Manual steps for user/PM:**

1. Create Stripe account and, in Dashboard, create two products (Investor, Pro) with recurring prices. Copy price IDs into env.
2. Create a webhook endpoint pointing to `https://<your-app>/api/billing/webhook`; subscribe to `customer.subscription.*` and `checkout.session.completed`. Set `STRIPE_WEBHOOK_SECRET` from the endpoint’s signing secret.
3. Set `STRIPE_SECRET_KEY` and optionally `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from Stripe Dashboard.
4. For production, use live keys and configure production webhook URL in Vercel (or host) env.
