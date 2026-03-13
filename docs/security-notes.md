# Security notes

Recorded as we build. For manual security steps (e.g. production keys, webhooks), see [manual-steps.md](manual-steps.md).

---

## Current setup (Phases 0–2)

- **Auth:** Clerk; middleware protects all non-public routes (including `/api/*`). Public routes: `/`, `/sign-in`, `/sign-up`.
- **Authorization:** Every API and server page uses `getAppUser()`; all data access scoped by `userId`. No IDOR risk for properties/mortgages.
- **Input:** Request bodies validated with Zod before use; invalid input returns 400.
- **Secrets:** Env vars only; `.env*` gitignored; no secrets in code.
- **DB:** Prisma only (parameterized queries).

---

## As we go

- *Add any new security-related decisions or findings here (e.g. new APIs, auth changes, rate limiting, headers).*

---

## Phase 4 — Stripe (implemented)

- **Webhook:** `/api/billing/webhook` is a public route (excluded from Clerk auth in middleware). Security is enforced by verifying the request body with `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent()`; invalid or missing signature returns 400.
- **Secrets:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only (no `NEXT_PUBLIC_`). See manual-steps for webhook URL and key setup.
