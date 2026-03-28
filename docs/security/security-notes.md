# Security notes

Recorded as we build. For manual security steps (e.g. production keys, webhooks), see [manual-steps.md](../setup/manual-steps.md).

**Last reviewed:** 2026-03-19  
**Review cadence:** Monthly (or after material auth/billing/security changes)

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

- **Google Ads (gtag)** — When `NEXT_PUBLIC_GOOGLE_ADS_ID` is set, the root layout loads `gtag.js` from Google for ads measurement (client-side third-party script). ID is public; no secret. See privacy policy for disclosure.

- Audit lane reference: `docs/process/security-audit-process.md` and `docs/audits/security/`.

---

## Security headers + rate limiting (March 2025)

- **Security headers** — Added via `next.config.ts` async `headers()` for `/:path*`: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera, microphone, geolocation disabled).
- **Rent estimate rate limit** — GET `/api/estimates/rent` is limited to 20 calls per user per hour. Uses `RentCastApiCall` table count; returns 429 with `{ error: "Rate limit exceeded. Try again later." }` when exceeded. DB-based, no new dependencies.

---

## Security audit (March 2025)

- See [security-audit.md](./security-audit.md) for full assessment.
- **Summary:** Auth, authorization, input validation, and secrets handling are strong. Gaps: no rate limiting, no security headers, RentCast estimate could be abused. Prioritize rate limiting and security headers.

---

## Phase 4 — Stripe (implemented)

- **Webhook:** `/api/billing/webhook` is a public route (excluded from Clerk auth in middleware). Security is enforced by verifying the request body with `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent()`; invalid or missing signature returns 400.
- **Secrets:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only (no `NEXT_PUBLIC_`). See manual-steps for webhook URL and key setup.

---

## Account deletion + deleted user blocking (March 2025)

- **Permanent delete confirmText** — POST `/api/account/delete-permanent` requires `body.confirmText === "DELETE"` (exact, case-sensitive). Returns 400 if missing or incorrect. Closes gap for direct API calls bypassing client validation.
- **Block API access for deleted users** — `getActiveAppUser()` returns null when `user.deletedAt` is set. All protected API routes use `getActiveAppUser()` instead of `getAppUser()`; deleted users receive 401. The restore route and app layout keep `getAppUser()` so deleted users can restore their account.
- **Env validation** — `lib/env.ts` validates `DATABASE_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY` at first DB import. Fails fast with clear error if any are missing.
