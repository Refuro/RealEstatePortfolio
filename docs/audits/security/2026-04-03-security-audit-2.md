# Security & Privacy Audit — 2026-04-03 (Run 2)

**Run context:** Second security audit of the day. The morning run (2026-04-03-security-audit.md) identified one High finding (Stripe webhook user resolution) that was resolved between runs; two Schedule items remain open. Today's new plans add three new UI surfaces (embedded mockups, landing CTA improvements, pricing page polish) — all reviewed below for security implications.

---

## Executive summary

- **Posture:** Strong and improving. The morning's High finding (Stripe webhook `metadata.appUserId` could shadow the `stripeCustomerId`-based user resolution) is **confirmed fixed** — `resolveAppUserIdForSubscription` now resolves by `stripeCustomerId` first and logs a Sentry warning on any mismatch. No new High or Critical findings this run.
- **Carried medium items:** Two morning Schedule items remain open: (1) no rate limits on `GET /api/billing/sync` and `POST /api/billing/portal`; (2) `admin/layout.tsx` still calls `getAppUser()` instead of `getActiveAppUser()`, creating a semantic inconsistency with the admin API layer.
- **New surfaces (mockups, landing, pricing):** The implemented `app/components/mockups/` components are purely static, hardcoded, non-interactive presentational components. No API calls, no PII, no secrets, no `dangerouslySetInnerHTML`. Security impact is zero.
- **New observation (low):** The CSP directive list in `next.config.ts` has grown since `docs/security/security-audit.md` §5 was last updated (added Google Ads, PostHog, Facebook Pixel, Clerk custom domain, Google Fonts) — documentation is stale, not a vulnerability, but creates a maintenance gap.
- **Recommendation:** Secure for controlled rollout. Prioritize the two carried Schedule items; update security-audit.md CSP table to match current `next.config.ts`.

---

## Severity-ranked findings

### Critical

- *(None identified in this pass.)*

### High

- *(None. Morning's High (Stripe webhook user resolution) confirmed resolved — see verification below.)*

### Medium

- **`GET /api/billing/sync` and `POST /api/billing/portal` remain unrate-limited** — No `checkRateLimit` / `recordRateLimit` calls in either route; no `billing:sync` or `billing:portal` entry in `RATE_LIMITS`. An active authenticated session can repeatedly invoke Stripe API calls (subscription list, portal session creation) without throttling, creating Stripe quota / cost exposure. Carries from morning audit unchanged. — **Evidence:** `app/app/api/billing/sync/route.ts` (no rate-limit calls); `app/app/api/billing/portal/route.ts` (no rate-limit calls); `app/lib/rate-limit.ts` (`RATE_LIMITS` table, no `billing:sync` or `billing:portal` entry).

- **`admin/layout.tsx` still uses `getAppUser()` instead of `getActiveAppUser()`** — A soft-deleted admin account passes `isAdmin()` and the layout renders the admin shell, even though every underlying admin API route (`/api/admin/**`) will return 401 via `getActiveAppUser()`. The inconsistency creates a confusing UX and a semantic gap between the layout gate and the API gate. Carries from morning audit unchanged. — **Evidence:** `app/app/(app)/admin/layout.tsx` line 11 (`getAppUser()`); `app/lib/auth.ts` (`getActiveAppUser` blocks `deletedAt` users); contrast with `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts` (use `getActiveAppUser`).

### Low

- **CSP documentation in `security-audit.md` §5 is stale** — The current `app/next.config.ts` `script-src` includes several additions not reflected in the §5 policy table: `https://clerk.veldportfolio.com` (custom Clerk domain), `https://www.googletagmanager.com`, `https://googleads.g.doubleclick.net`, `https://us-assets.i.posthog.com` (PostHog), and `https://connect.facebook.net` (Facebook Pixel); `style-src` now includes `https://fonts.googleapis.com`; `font-src` includes `https://fonts.gstatic.com`; `frame-src` includes `https://clerk.veldportfolio.com`. All additions appear intentional (tracking integrations noted in `security-notes.md` under Google Ads). The stale doc creates a maintenance gap: future reviewers comparing code to docs will find unexplained divergence. — **Evidence:** `app/next.config.ts` (`cspDirectives`); `docs/security/security-audit.md` §5 (last updated 2026-03-31, pre-dates these additions); `docs/security/security-notes.md` (Google Ads entry mentions `gtag.js` but CSP section does not enumerate all new domains).

- **`localPatterns` in `next.config.ts` cleanup pending** — `images.localPatterns: [{ pathname: "**", search: "" }]` is still present. The embedded-mockups plan (2026-04-03-embedded-mockups-plan.md) notes this entry should be removed when the screenshot PNGs are deleted. Until then it is a configuration debt item, not a security vulnerability. — **Evidence:** `app/next.config.ts` line 55; `docs/plans/2026-04-03-embedded-mockups-plan.md` (Cleanup section).

- **CSP remains Report-Only** — Carried from morning. No change; enforcement is gated on `CSP_ENFORCEMENT=true`. — **Evidence:** `app/next.config.ts` (`enforceCsp`, `cspHeaders`).

- **Admin actions log to stdout only** — Carried from morning. — **Evidence:** `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts`.

---

## Evidence reviewed

| Area | Paths / surfaces |
|------|-----------------|
| Process & policy | `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md` |
| Morning audit | `docs/audits/security/2026-04-03-security-audit.md` |
| New plans (today) | `docs/plans/2026-04-03-pricing-page-premium-plan.md`, `docs/plans/2026-04-03-embedded-mockups-plan.md`, `docs/plans/2026-04-03-landing-mobile-cta-plan.md` |
| Webhook fix verification | `app/app/api/billing/webhook/route.ts` — `resolveAppUserIdForSubscription` and `syncSubscriptionToDb` (full read) |
| Billing routes | `app/app/api/billing/sync/route.ts` (full read), `app/app/api/billing/portal/route.ts` (full read) |
| Admin layout | `app/app/(app)/admin/layout.tsx` (full read) |
| Auth helpers | `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin` — full read) |
| Rate limits | `app/lib/rate-limit.ts` (`RATE_LIMITS`, `checkRateLimit`, `getRateLimitIdentifier` — full read) |
| CSP / headers | `app/next.config.ts` (`cspDirectives`, security headers — full read) |
| New mockup components | `app/components/mockups/mockup-frame.tsx`, `dashboard-mockup.tsx`, `mortgage-mockup.tsx`, `deal-analyzer-mockup.tsx` (all full read) |

**Assumptions / limits:** Static review only; no runtime penetration test. Morning audit's broader route enumeration (33 routes) not re-read in full — focused review on surfaces touched by today's work and the two carried open items.

---

## Risk & impact assessment

- **Resolved High (Stripe webhook):** `resolveAppUserIdForSubscription` now resolves by `stripeCustomerId` first (`customerUserId`), then falls back to `metadataAppUserId` only if no DB customer match exists. When both resolve but differ, a Sentry `warning`-level event fires with `subscriptionId`, `customerId`, `customerUserId`, and `metadataAppUserId`. This is the correct, secure posture. Entitlement corruption via metadata injection is no longer possible without compromising the Stripe customer-to-user DB mapping. **Risk eliminated.**
- **Open Medium (rate limits):** Billing sync and portal exposure is **low likelihood** (requires valid authenticated session, benefits from existing Stripe-side rate controls) but **non-trivial impact** if an account is compromised or abused in a scripted loop (Stripe API quota, portal session costs). Severity held at Medium.
- **Open Medium (admin layout):** Likelihood is **very low** — requires a soft-deleted account that was previously an admin. Impact is limited to a confusing admin shell rendering with no API access. Severity held at Medium.
- **New surfaces (mockups, landing, pricing):** All purely presentational; no server-side data handling, no new API routes, no new secrets, no user data rendered. **Zero incremental security risk.**
- **CSP doc drift:** No runtime risk. Maintenance / audit quality risk only.

---

## Recommendations (prioritized)

1. **Add rate limits to `billing:sync` and `billing:portal`** — Add `billing:sync` (e.g. 20/hr per user) and `billing:portal` (e.g. 10/hr per user) to `RATE_LIMITS` in `app/lib/rate-limit.ts`, and call `checkRateLimit` / `recordRateLimit` in both routes — or document intentional omission with evidence of Stripe-side throttling and monitoring in `security-notes.md`.
2. **Replace `getAppUser()` with `getActiveAppUser()` in admin layout** — `app/app/(app)/admin/layout.tsx` should call `getActiveAppUser()` and redirect to `/sign-in` (or `/`) on null, matching the API layer's deleted-account gate.
3. **Update CSP table in `security-audit.md` §5** — Bring the documented `script-src`, `style-src`, `font-src`, and `frame-src` directives into sync with `next.config.ts` — include the custom Clerk domain, Google Ads domains, PostHog, Facebook Pixel, and Google Fonts entries. Add a note linking each addition to the feature that required it.
4. **Remove `localPatterns` after screenshot PNG cleanup** — Once the embedded mockup migration completes and PNGs are deleted, remove the `images.localPatterns` wildcard from `next.config.ts` as the mockups plan specifies.
5. **Continue monitoring CSP reports before enforcing** — Keep `CSP_ENFORCEMENT` off in production until CSP violation report volume in Sentry settles; no new directives appear to create new violation risk.

---

## Task candidates

- [ ] Add `RATE_LIMITS` entries and `checkRateLimit`/`recordRateLimit` for `billing:sync` and `billing:portal` in `app/lib/rate-limit.ts` and the respective route files (or document in `security-notes.md` with monitoring rationale).
- [ ] Replace `getAppUser` with `getActiveAppUser` in `app/app/(app)/admin/layout.tsx` and add null → redirect.
- [ ] Update `docs/security/security-audit.md` §5 CSP table to match current `next.config.ts` directive set.
- [ ] Remove `images.localPatterns` wildcard from `app/next.config.ts` after PNG cleanup (coordinate with embedded-mockups implementation).

---

## Re-test checklist

- [x] Verify `resolveAppUserIdForSubscription` prefers `stripeCustomerId` mapping over `metadata.appUserId` — **confirmed in this run** (`customerUserId ?? metadataAppUserId` with mismatch Sentry alert).
- [ ] Verify `admin/layout.tsx` redirects soft-deleted admins after fix (if fix is implemented).
- [ ] Verify no regression on `/api/billing/*` and subscription tier display after any rate-limit addition.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Monthly, after material auth/billing changes, or pre-production release per `docs/process/security-audit-process.md`.
- **Recommended next window:** 2026-05-01 or next billing/auth/admin change — whichever comes first.
