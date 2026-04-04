# Security & Privacy Audit — 2026-04-04 (Run 2)

**Run context:** Second security audit pass of the day. The morning run (`2026-04-04-security-audit.md`) provided the baseline — this run adds independent verification of the morning's findings and specifically audits the four new plans introduced today: Refinance & Payoff Insights Phase 3, Property Detail & Edit Page Revamp, Calculators Premium CTA, and Changelog Polish. All carried Medium items from `2026-04-03-security-audit-2.md` are re-verified.

---

## Executive summary

- **Posture: Strong. All carried Medium findings from yesterday are confirmed resolved.** `billing:sync` and `billing:portal` now have `checkRateLimit`/`recordRateLimit` in their routes and entries in `RATE_LIMITS`; `admin/layout.tsx` now uses `getActiveAppUser()` with redirect to `/sign-in` on null. The CSP documentation in `security-audit.md` §5 is confirmed in sync with `next.config.ts` (version 2.2, last updated 2026-04-04). The `localPatterns` wildcard has been removed from `next.config.ts`.
- **New surfaces (today's plans): zero incremental security risk.** Refinance Phase 3 is entirely client-side computation — no new API routes, no PII, no server calls. Property Detail Revamp and Changelog Polish are UI/layout-only changes. Calculators CTA plan touches only public marketing pages — no new authenticated routes. None introduce new API surfaces, new secrets, or new data handling paths.
- **Four new routes reviewed independently**: `GET /api/billing/subscription-details`, `GET /api/billing/status`, `GET+PATCH /api/me`, and `GET+PATCH /api/onboarding` — all use `getActiveAppUser()`, scope queries by `userId`, apply Zod validation on mutations. No IDOR risk. Minor informational note: none carry `ApiRateLimitEntry` limits, but the operations are lightweight and inherently bounded.
- **Recommendation:** Posture is fit for continued rollout. The open Medium findings from the morning pass (OAuth deletion, CSP breadth, SCA cadence, audit log depth) are correctly classified and require design/ops decisions rather than immediate code changes. No new issues arise from today's code.

---

## Severity-ranked findings

### Critical

- *(None identified in this pass.)*

### High

- *(None. Morning's confirmed-fixed items — billing rate limits, admin layout gate — are verified resolved in this pass. See Evidence reviewed.)*

### Medium — Carried from morning run (unchanged, no regression)

- **OAuth/passwordless account deletion UX gap** — `delete/route.ts` and `delete-permanent/route.ts` both call `clerkClient().users.verifyPassword()`; OAuth-only or passwordless users cannot complete self-serve deletion via the current password-gated API. No change in this code path. — **Evidence:** `app/app/api/account/delete/route.ts` (line 46–58); `app/app/api/account/delete-permanent/route.ts` (line 48–58); `app/lib/validations/account.ts`.

- **Stripe webhook metadata fallback when customer not mapped in DB** — `resolveAppUserIdForSubscription` resolves by `stripeCustomerId` DB mapping first (correct), but falls back to `sub.metadata.appUserId` when no row is found. If Stripe metadata is mis-set (out-of-band edit or misconfigured checkout), subscription sync could target the wrong user for a customer with no DB match. No change in this code path. — **Evidence:** `app/app/api/billing/webhook/route.ts` (`resolveAppUserIdForSubscription`).

- **CSP `connect-src: https:`** — Broadly permits HTTPS egress from scripts; defense-in-depth depth is reduced if other controls fail. Intentional for integration flexibility. CSP is still Report-Only unless `CSP_ENFORCEMENT=true`. No change. — **Evidence:** `app/next.config.ts` (`cspDirectives`); `docs/security/security-audit.md` §5.

- **IP-derived identifiers for anonymous rate limits trust `x-forwarded-for`** — `getRateLimitIdentifier(null, req)` in `app/lib/rate-limit.ts` and the contact form use `x-forwarded-for` for per-IP limits. Vercel's edge sets a trusted header, but this is a generic note for any infrastructure change. No change. — **Evidence:** `app/lib/rate-limit.ts`; `app/app/api/contact/route.ts`.

- **No automated dependency / SCA step in npm scripts** — `app/package.json` has no `npm audit` or OSV/Snyk step in CI. Supply-chain risk visibility is manual. No change. — **Evidence:** `app/package.json`.

- **Admin actions log to stdout only (no durable audit trail)** — `admin_tier_override` and `admin_export_users` emit structured `console.info` JSON. Correct for operational visibility but not a durable audit store. No change. — **Evidence:** `app/app/api/admin/users/[id]/tier/route.ts` (lines 52–62); `app/app/api/admin/export/users/route.ts` (lines 21–27).

### Low — Carried (no change)

- **CSP enforcement remains Report-Only** — `CSP_ENFORCEMENT` not set to `true` in production by default. Monitoring in Sentry is the intended gate before enforcement. — **Evidence:** `app/next.config.ts` (`enforceCsp`); `docs/security/security-notes.md`.

- **`checkRateLimit` silently allows all traffic for unregistered actions** — `if (!limit) return { allowed: true }` means any route invoking `checkRateLimit` with an unregistered action string is silently unrestricted. New routes could omit registration. No new routes of concern found this pass. — **Evidence:** `app/lib/rate-limit.ts` line 43.

- **Admin CSV export intentionally has no `ApiRateLimitEntry`** — Documented rationale in `docs/security/security-notes.md`: tightly gated by `isAdmin()`; structured log on each call. Still valid. — **Evidence:** `app/app/api/admin/export/users/route.ts`; `docs/security/security-notes.md`.

- **Incident runbook lacks dedicated secret-rotation subsection** — `docs/runbooks/incident-response.md` covers rollback/env verification; key rotation procedure is in `docs/setup/manual-steps.md` but not cross-linked. — **Evidence:** `docs/runbooks/incident-response.md`; `docs/setup/manual-steps.md`.

### Informational (new this pass)

- **`GET /api/billing/subscription-details` and `GET /api/billing/status` carry no `ApiRateLimitEntry`** — Both endpoints are read-only DB queries (no Stripe API calls). Neither is listed in `RATE_LIMITS`. Risk is low: both require an authenticated session, have negligible compute cost, and there is no external API quota at stake. However, the pattern of adding new read-only billing routes without explicit rate-limit consideration is worth documenting as a gap to watch. — **Evidence:** `app/app/api/billing/subscription-details/route.ts` (no `checkRateLimit`/`recordRateLimit`); `app/app/api/billing/status/route.ts` (no rate-limit calls); `app/lib/rate-limit.ts` (`RATE_LIMITS` — `billing:subscription-details` and `billing:status` absent).

- **`PATCH /api/me` and `PATCH /api/onboarding` carry no `ApiRateLimitEntry`** — Both write to the authenticated user's own record only (`ownershipDisplayMode`, onboarding timestamps). No rate-limit registration. Risk is negligible: mutations are user-scoped, field-constrained by Zod, and have no external side-effects. — **Evidence:** `app/app/api/me/route.ts` (PATCH, no rate-limit calls); `app/app/api/onboarding/route.ts` (PATCH, no rate-limit calls).

---

## Evidence reviewed

| Area | Paths / surfaces |
|------|-----------------|
| Process & policy | `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md` |
| Morning pass | `docs/audits/security/2026-04-04-security-audit.md` |
| Previous audit (verification baseline) | `docs/audits/security/2026-04-03-security-audit-2.md` |
| Network boundary | `app/proxy.ts` (full read) |
| Auth helpers | `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin` — full read) |
| Rate limits | `app/lib/rate-limit.ts` (`RATE_LIMITS`, `checkRateLimit`, `recordRateLimit` — full read) |
| Headers / CSP | `app/next.config.ts` (full read) |
| Confirmed-fixed routes | `app/app/api/billing/sync/route.ts` (full read); `app/app/api/billing/portal/route.ts` (full read) |
| Admin layout | `app/app/(app)/admin/layout.tsx` (full read) |
| New billing routes | `app/app/api/billing/subscription-details/route.ts`; `app/app/api/billing/status/route.ts` (both full read) |
| New user-settings routes | `app/app/api/me/route.ts`; `app/app/api/onboarding/route.ts` (both full read) |
| New property computation routes | `app/app/api/properties/[id]/amortization/route.ts`; `app/app/api/properties/[id]/metrics/route.ts` (both full read) |
| Other reviewed routes | `app/app/api/import/portfolio/route.ts`; `app/app/api/import/portfolio/template/route.ts`; `app/app/api/rentcast-quota/route.ts`; `app/app/api/account/restore/route.ts`; `app/app/api/account/delete/route.ts`; `app/app/api/account/delete-permanent/route.ts`; `app/app/api/contact/route.ts`; `app/app/api/admin/users/[id]/tier/route.ts`; `app/app/api/admin/export/users/route.ts` (all full read) |
| Today's new plans | `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`; `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md`; `docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md`; `docs/archive/plans/2026-04-04-changelog-polish-plan.md` (all reviewed for new API surfaces) |

**Assumptions / limits:** Static review only; no runtime penetration test or Clerk/Stripe dashboard audit. Route enumeration covered all 48 `app/app/api/**/route.ts` files via glob.

---

## Risk & impact assessment

- **Resolved items (High/Medium from yesterday):** `billing:sync` and `billing:portal` rate limits are live; `admin/layout.tsx` uses `getActiveAppUser()`. Both were the only items in the previous "carry forward" set.  Risk eliminated.
- **Open Mediums:** Affect user control (OAuth deletion), billing integrity at the edge (metadata fallback), defense-in-depth (CSP connect-src breadth), proxy trust (x-forwarded-for), and operational maturity (SCA, audit trail). None represent direct, exploitable attack paths against arbitrary users. All require product/ops decisions or CI workflow additions, not urgent code changes.
- **New surfaces (today's plans):** Refinance computation is purely client-side math — no server state read or write, no API calls, no user data returned beyond what the client already holds. Property, Calculators, and Changelog changes are UI-only. Incremental risk from today's work: **zero**.
- **New read-only routes:** `billing/subscription-details`, `billing/status`, `me GET`, `onboarding GET`, `amortization`, `metrics` — all authenticated, all scoped to `userId`. No data leakage between users. No IDOR risk.

---

## Recommendations (prioritized)

1. **Document OAuth/passwordless account deletion path** — Decide whether Clerk supports an alternate identity verification step for OAuth users, or whether deletion requires a support ticket. Update `docs/security/security-notes.md` and align UI copy accordingly.
2. **Add recurring SCA step to CI or ops calendar** — `npm audit` or Snyk/OSV integration with a documented triage policy. This can be low-ceremony: a monthly calendar reminder with a pass/fail criterion suffices until a CI integration is built.
3. **Add secret/key rotation subsection to `docs/runbooks/incident-response.md`** — Cross-link from `docs/setup/manual-steps.md` so the rotation procedure is discoverable from the incident playbook.
4. **Expand durable audit logging for admin actions** — Once operational needs justify it, pipe `admin_tier_override` and `admin_export_users` events to a persistent store (DB row, Sentry breadcrumb, or logging sink) beyond stdout.
5. **Monitor CSP reports in Sentry before enabling enforcement** — Keep `CSP_ENFORCEMENT` off in production until CSP violation volume settles. Today's new plans do not add any new origins that would create new violations.
6. **Consider adding `billing:subscription-details` and `billing:status` to `RATE_LIMITS`** — Low urgency (read-only DB calls), but proactive registration prevents silent bypass if the routes later gain more expensive operations.

---

## Task candidates

- [ ] Document OAuth/passwordless permanent account deletion path in `docs/security/security-notes.md` and align UI copy (`app/app/(app)/settings/` — deletion section).
- [ ] Add `npm audit` step to CI or monthly ops calendar; document triage policy in `docs/security/security-audit.md`.
- [ ] Add secret/key rotation checklist subsection to `docs/runbooks/incident-response.md`.
- [ ] (Optional) Add `billing:subscription-details` and `billing:status` entries to `RATE_LIMITS` in `app/lib/rate-limit.ts` as forward-looking hygiene.

---

## Re-test checklist

- [x] Confirm `billing:sync` uses `checkRateLimit` / `recordRateLimit` — **confirmed** (`app/app/api/billing/sync/route.ts` lines 32, 41).
- [x] Confirm `billing:portal` uses `checkRateLimit` / `recordRateLimit` — **confirmed** (`app/app/api/billing/portal/route.ts` lines 25–31, 108, 126).
- [x] Confirm `admin/layout.tsx` uses `getActiveAppUser()` and redirects on null — **confirmed** (`app/app/(app)/admin/layout.tsx` line 11, redirect to `/sign-in`).
- [x] Confirm `billing:sync` and `billing:portal` entries in `RATE_LIMITS` — **confirmed** (`app/lib/rate-limit.ts` lines 25–27).
- [x] Confirm CSP `security-audit.md` §5 matches `next.config.ts` — **confirmed** (version 2.2, 2026-04-04, directives align).
- [x] Confirm `localPatterns` wildcard removed from `next.config.ts` — **confirmed** (no `images.localPatterns` present).
- [ ] After any OAuth deletion flow change: test password vs OAuth users in staging.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Monthly, after material auth/billing/security changes, or pre-production release per `docs/process/security-audit-process.md`.
- **Recommended next window:** 2026-05-01 or next billing/auth/admin change — whichever comes first.
