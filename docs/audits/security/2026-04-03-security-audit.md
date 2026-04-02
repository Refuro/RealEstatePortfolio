# Security & Privacy Audit — 2026-04-03

## Executive summary

- **Overall posture:** Strong baseline: Clerk `auth.protect()` on non-public routes in `app/proxy.ts`, protected APIs consistently use `getActiveAppUser()` (blocking soft-deleted accounts), resource access uses `findFirst` / `where: { id, userId }` or equivalent, Zod on mutating bodies, Stripe webhook signature verification, and secrets loaded from environment (`app/lib/env.ts`, `app/lib/stripe-config.ts`).
- **Top risks:** (1) Stripe subscription sync prefers `metadata.appUserId` over resolving the user from the Stripe customer ID stored in the database — integrity risk if Stripe metadata diverges from the customer↔user mapping. (2) Account deletion APIs require password verification via Clerk — may block OAuth-only users from completing deletion through these endpoints. (3) Several sensitive read/sync endpoints (`billing`, `portal`) intentionally omit `ApiRateLimitEntry` limits; abuse could increase Stripe usage or operational cost.
- **IDOR / auth bypass:** No evidence of cross-tenant data access on sampled property, deal, mortgage, export, or `me` routes; IDs are always combined with `user.id` from `getActiveAppUser()`. Admin routes gate on `isAdmin()` + `getActiveAppUser()` (except admin layout noted below).
- **Recommendation:** Ship is reasonable for a controlled rollout; prioritize fixing or hardening Stripe user resolution (metadata vs `stripeCustomerId`), document OAuth account-deletion path, and add rate limits or monitoring on billing sync/portal as capacity allows.

---

## Severity-ranked findings

### Critical

- *(None identified in this pass.)*

### High

- **Stripe webhook user resolution may apply subscription metadata before verifying Stripe customer ownership** — If `sub.metadata.appUserId` is set to a user ID that does not match the app user whose `stripeCustomerId` equals `sub.customer`, `syncSubscriptionToDb` still updates `appUserId` from metadata first (`||` fallback to `findUserIdByStripeCustomer`). That can attach the wrong user’s `subscription` row and `subscriptionTier` (data integrity / entitlement corruption) when metadata is wrong in Stripe or out of sync after manual operations. — **Evidence:** `app/app/api/billing/webhook/route.ts` (`syncSubscriptionToDb`, lines ~132–179); `findUserIdByStripeCustomer` at ~201–205.

### Medium

- **Account delete / delete-permanent require password verification** — `deleteAccountSchema` / `deletePermanentAccountSchema` require a non-empty password and routes call `clerkClient().users.verifyPassword({ userId: user.clerkUserId, password })` (`app/lib/validations/account.ts`, `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts`). OAuth-only or passwordless users may be unable to complete deletion via these APIs, which is an **availability / account-control** gap (not an auth bypass), unless the product supports an alternate path (e.g. Clerk-only delete flow). — **Evidence:** `app/lib/validations/account.ts`; `app/app/api/account/delete/route.ts` (verifyPassword block); `app/app/api/account/delete-permanent/route.ts`.

- **Admin UI layout uses `getAppUser()` instead of `getActiveAppUser()`** — `app/app/(app)/admin/layout.tsx` allows any signed-in Clerk user who maps to a DB user with `isAdmin(user)`; soft-deleted users still load via `getAppUser()`. Server-rendered admin UI may still render for a deleted admin while JSON APIs under `app/app/api/admin/*` return 401 via `getActiveAppUser()`. Low likelihood; inconsistent UX and potential confusion. — **Evidence:** `app/app/(app)/admin/layout.tsx` vs `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`.

- **Billing sync and portal sessions are not covered by `ApiRateLimitEntry`** — `GET /api/billing/sync` and `POST /api/billing/portal` have no `checkRateLimit` calls (unlike `POST /api/billing/create-checkout-session`). A compromised or abusive authenticated session could repeatedly trigger Stripe API calls (cost / quota). — **Evidence:** `app/app/api/billing/sync/route.ts`, `app/app/api/billing/portal/route.ts`; compare `app/app/api/billing/create-checkout-session/route.ts` (`billing:create-checkout`).

- **IP-derived rate limit identifiers depend on proxy headers** — `getRateLimitIdentifier(null, req)` uses `x-forwarded-for` / `x-real-ip` (`app/lib/rate-limit.ts`). `contact` duplicates similar logic (`app/app/api/contact/route.ts`). On platforms that do not strip client-supplied `X-Forwarded-For`, IP limits can be weaker. Vercel typically sets trusted values; self-hosted or misconfigured proxies increase risk. — **Evidence:** `app/lib/rate-limit.ts` (`getRateLimitIdentifier`); `app/app/api/contact/route.ts` (`getIdentifier`).

### Low

- **`checkRateLimit` allows all traffic when `action` is missing from `RATE_LIMITS`** — `if (!limit) return { allowed: true }` (`app/lib/rate-limit.ts`). New routes could forget to register an action and remain unlimited. Current reviewed routes use explicit keys from `RATE_LIMITS`. — **Evidence:** `app/lib/rate-limit.ts` (`checkRateLimit`).

- **CSP is Report-Only unless `CSP_ENFORCEMENT=true`** — Documented posture; XSS reliance on browser reporting until enforcement. — **Evidence:** `app/next.config.ts` (`CSP_ENFORCEMENT`, `Content-Security-Policy-Report-Only`); `docs/security/security-audit.md` §5.

- **Admin actions log to stdout only** — Admin tier PATCH and CSV export emit structured `console.info` JSON (`app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts`), not a durable audit store — aligns with `docs/security/security-audit.md` §1.2 gap.

- **API responses include internal `userId` (UUID)** on deal/property payloads — Low sensitivity; helps debugging; not an IDOR by itself when scoped to `user.id`. — **Evidence:** e.g. `app/app/api/deals/[id]/route.ts` (`serializeDeal` includes `userId`).

- **`GET /api/health` is public** — Returns `status` + `database` only; intentional for load balancers. — **Evidence:** `app/app/api/health/route.ts`; `app/proxy.ts` (public route); `docs/security/security-notes.md`.

---

## Evidence reviewed

| Area | Paths / surfaces |
|------|-------------------|
| Process & policy | `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md` (partial) |
| Network boundary | `app/proxy.ts` (Clerk `createRouteMatcher`, `auth.protect()`, matcher config) |
| Auth helpers | `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`) |
| Env / secrets | `app/lib/env.ts` (`validateEnv`, Vercel guards), `app/lib/db.ts` (calls `validateEnv()`), `app/lib/stripe-config.ts` (server-only Stripe keys), `app/instrumentation.ts` |
| Rate limits | `app/lib/rate-limit.ts` (`RATE_LIMITS`, `checkRateLimit`, `recordRateLimit`, `getRateLimitIdentifier`) |
| Billing | `app/app/api/billing/webhook/route.ts`, `create-checkout-session/route.ts`, `portal/route.ts`, `sync/route.ts`, `status/route.ts`, `subscription-details/route.ts` |
| Account | `app/app/api/account/delete/route.ts`, `delete-permanent/route.ts`, `restore/route.ts` (`getAppUser` — intentional for restore) |
| Properties | `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` (partial) |
| Deals | `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts` |
| Admin | `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts`, `app/app/(app)/admin/layout.tsx` |
| Public / abuse | `app/app/api/contact/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/health/route.ts` |
| Other sampled | `app/app/api/me/route.ts`, `app/app/api/onboarding/route.ts`, `app/app/api/import/portfolio/route.ts` (partial), `app/app/api/export/portfolio/route.ts` (partial), `app/lib/billing/portal-return-path.ts`, `app/lib/billing/get-subscription-details.ts` |

**Assumptions / limits:** Static review only; no runtime penetration test. `grep` for obvious hardcoded secrets under `app/` showed only `.env.example` placeholders. All `app/app/api/**/route.ts` files were enumerated; behavior of every line of every route was not exhaustively traced, but all 33 route files were listed and high-risk routes were read in full.

---

## Risk & impact assessment

- **Unresolved High (Stripe metadata):** Incorrect subscription linkage in production can corrupt billing state and user entitlements; impact is **integrity** and **support/legal** exposure, not anonymous remote exploit without Stripe-side or supply-chain access.
- **Medium items:** Mostly affect **operational cost**, **user experience** (deletion), **consistency** (admin layout), or **environment-dependent** IP trust.
- **Likelihood:** External IDOR on portfolio resources appears **low** given consistent `userId` scoping; Stripe metadata mismatch is **low** but **high impact** if it occurs.

---

## Recommendations (prioritized)

1. **Harden Stripe webhook user resolution:** Prefer resolving the app user from `stripeCustomerId` ↔ `sub.customer`, then assert `metadata.appUserId` matches (or ignore metadata when it conflicts). At minimum, document that subscription metadata must always match the customer’s app user in Stripe Dashboard.
2. **Clarify and implement account deletion for OAuth-only users:** e.g. Clerk-managed session action, magic link, or documented manual support process; ensure `security-notes.md` reflects the actual path.
3. **Add abuse controls on billing sync/portal:** Per-user rolling limits on `GET /api/billing/sync` and `POST /api/billing/portal`, or edge/CDN throttling + Stripe dashboard monitoring.
4. **Align admin layout with `getActiveAppUser()`** (or redirect deleted admins) to match API semantics.
5. **Keep `CSP_ENFORCEMENT=true`** gated on production CSP report review until violations are acceptable.

---

## Task candidates (optional)

- [ ] Change `syncSubscriptionToDb` to resolve user by Stripe customer ID first and validate metadata (`app/app/api/billing/webhook/route.ts`).
- [ ] Add `RATE_LIMITS` entries and `checkRateLimit`/`recordRateLimit` for `billing:sync` and `billing:portal` (or document intentional omission with monitoring).
- [ ] Replace `getAppUser` with `getActiveAppUser` in `app/app/(app)/admin/layout.tsx` and handle null redirect.
- [ ] Document OAuth / passwordless account deletion flow in `docs/security/security-notes.md` and product UX.
- [ ] Durable audit log for admin tier changes and CSV export (beyond `console.info`).

---

## Re-test checklist

- [ ] Verify Stripe webhook behavior after user-resolution change (replay test events in Stripe CLI).
- [ ] Verify no regression on `/api/billing/*` and subscription tier display.
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Monthly, after material auth/billing changes, or pre-production release per `docs/process/security-audit-process.md`.
- **Recommended next window:** 2026-05-01 or next billing/auth change.
