# Security & Privacy Audit — 2026-04-04

## Executive summary

- **Overall posture:** Strong. Clerk `auth.protect()` gates non-public routes (`app/proxy.ts`); API handlers consistently use `getActiveAppUser()` for protected data (blocking soft-deleted accounts except the documented restore path); resource reads/writes combine route IDs with `user.id` (e.g. `findFirst({ where: { id, userId } })`); mutating bodies use Zod; Stripe webhooks verify signatures; secrets stay server-side (`app/lib/env.ts`, `app/lib/stripe-config.ts`); security headers and CSP are set in `app/next.config.ts`; DB-backed rate limits cover sensitive writes, exports, account deletion, billing flows, and CSP reports (`app/lib/rate-limit.ts`, aligned with `docs/security/security-audit.md` §6).
- **Top residual risks:** (1) **Account deletion** still requires Clerk password verification — OAuth-only users may need an alternate path. (2) **Stripe webhook user resolution** prefers `stripeCustomerId` → DB mapping, then falls back to subscription `metadata.appUserId` when no DB row exists — acceptable for onboarding, but metadata-only sync remains a integrity edge case if Stripe objects are edited out of band. (3) **Operational depth:** no recurring automated dependency/SCA step in `app/package.json`; admin-sensitive actions rely on structured `console.info` rather than a durable audit store.
- **Privacy / abuse:** Contact form uses Zod, honeypot (`website`), IP/user-scoped hourly limits, and optional Resend — PII in email to support is expected; `POST /api/csp-report` is capped (8192 bytes) and rate-limited per IP. `GET /api/health` is intentionally minimal and public.
- **Recommendation:** Posture remains **fit for continued rollout** with prioritized follow-up on OAuth deletion UX, optional webhook resolution hardening for metadata-only cases, and backlog items for audit logging and dependency scanning cadence.

---

## Severity-ranked findings

### Critical

- *(None identified in this pass.)*

### High

- *(None identified in this pass.)*  
  **Note:** `resolveAppUserIdForSubscription` in `app/app/api/billing/webhook/route.ts` returns `appUserId: customerUserId ?? metadataAppUserId`, i.e. **Stripe customer → DB mapping is preferred** before metadata. A prior concern about metadata taking precedence is **not** reflected in the current implementation; residual risk is limited to **metadata-only** resolution when no user row matches `sub.customer`.

### Medium

- **Account soft-delete and permanent-delete require password verification via Clerk** — `deleteAccountSchema` / `deletePermanentAccountSchema` require password + (for permanent) literal `confirmText: "DELETE"` (`app/lib/validations/account.ts`). Routes call `clerkClient().users.verifyPassword` (`app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts`). **Impact:** OAuth-only or passwordless users may be unable to complete self-serve deletion through these APIs (availability / privacy control), unless product provides another path. — **Evidence:** `app/lib/validations/account.ts`; `app/app/api/account/delete/route.ts`; `app/app/api/account/delete-permanent/route.ts`.

- **Stripe webhook: metadata fallback when customer is not mapped in DB** — If `findUserIdByStripeCustomer(customerId)` returns `null` but `sub.metadata.appUserId` is set, sync uses metadata (`app/app/api/billing/webhook/route.ts`, `resolveAppUserIdForSubscription`). Mis-set metadata in Stripe (manual error or compromised Stripe Dashboard access) could target the wrong app user until detected. — **Evidence:** `app/app/api/billing/webhook/route.ts` (`resolveAppUserIdForSubscription`, `syncSubscriptionToDb`).

- **CSP `connect-src` is broadly `https:`** — If script injection ever occurred despite other controls, exfiltration to many HTTPS origins would be permitted (`app/next.config.ts`, `cspDirectives`). Tradeoff is integration flexibility; enforcement is still **Report-Only** unless `CSP_ENFORCEMENT=true`. — **Evidence:** `app/next.config.ts`; `docs/security/security-audit.md` §5.

- **IP-derived identifiers for anonymous rate limits** — `getRateLimitIdentifier(null, req)` uses `x-forwarded-for` / `x-real-ip` (`app/lib/rate-limit.ts`). Contact form duplicates similar logic (`app/app/api/contact/route.ts`). On misconfigured proxies, per-IP limits can be weaker. Vercel’s managed edge typically overwrites/forwards trusted values. — **Evidence:** `app/lib/rate-limit.ts`; `app/app/api/contact/route.ts`.

- **No automated dependency / SCA script in npm workflows** — `app/package.json` scripts include `build`, `lint`, `test`, but no `npm audit` or OSV/Snyk step. **Impact:** Supply-chain risk visibility relies on manual or external CI. — **Evidence:** `app/package.json`.

- **Security event logging is not a durable audit trail** — Admin tier override and CSV export emit structured `console.info` JSON (`app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts`), consistent with `docs/security/security-audit.md` §1.2 gap. — **Evidence:** those files; `docs/security/security-audit.md`.

### Low

- **CSP enforcement disabled by default** — `CSP_ENFORCEMENT` must be `true` for an enforced `Content-Security-Policy` header; otherwise Report-Only (`app/next.config.ts`). — **Evidence:** `app/next.config.ts`; `docs/security/security-notes.md`.

- **`checkRateLimit` allows all traffic when `action` is absent from `RATE_LIMITS`** — `if (!limit) return { allowed: true }` (`app/lib/rate-limit.ts`). New routes could omit registration. — **Evidence:** `app/lib/rate-limit.ts`.

- **`GET /api/health` is unauthenticated** — Returns only `status` and `database`; intentional for probes. — **Evidence:** `app/app/api/health/route.ts`; `app/proxy.ts` (public matcher); `docs/security/security-audit.md` §7.

- **Admin CSV export has no `ApiRateLimitEntry` action** — Documented rationale: access already gated by `getActiveAppUser()` + `isAdmin()` (`ADMIN_EMAILS`); structured log on each request (`app/app/api/admin/export/users/route.ts`). — **Evidence:** `app/app/api/admin/export/users/route.ts`; `docs/security/security-notes.md` §Admin CSV export.

- **Prisma query logging in development** — `app/lib/db.ts` enables query logs when `NODE_ENV === "development"`. Acceptable for dev; ensure production keeps `["error"]` only (as configured). — **Evidence:** `app/lib/db.ts`.

- **Incident runbook lacks a dedicated “key rotation” playbook** — `docs/runbooks/incident-response.md` covers rollback, monitoring, and env verification; **secret rotation** is not a first-class section (setup lives in `docs/setup/manual-steps.md`). — **Evidence:** `docs/runbooks/incident-response.md`; `docs/setup/manual-steps.md` (grep for secret/setup).

---

## Evidence reviewed

| Area | Paths / surfaces |
|------|------------------|
| Process & policy | `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` |
| Network boundary | `app/proxy.ts` (`isPublicRoute`, `auth.protect`, matcher) |
| Auth | `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`) |
| Env / secrets | `app/lib/env.ts`, `app/lib/db.ts` (`validateEnv`), `app/lib/stripe-config.ts`, `app/instrumentation.ts` |
| Rate limits | `app/lib/rate-limit.ts` (`RATE_LIMITS`, `checkRateLimit`, `recordRateLimit`) |
| Headers / CSP | `app/next.config.ts` |
| Billing | `app/app/api/billing/webhook/route.ts`, `create-checkout-session/route.ts`, `portal/route.ts`, `sync/route.ts` |
| Account | `app/app/api/account/delete/route.ts`, `delete-permanent/route.ts`, `restore/route.ts` |
| Admin | `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts`, `app/app/(app)/admin/layout.tsx` |
| Public / abuse | `app/app/api/contact/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/health/route.ts` |
| Scoping sample | `app/app/api/properties/[id]/route.ts` (`getPropertyForUser`) |

**Assumptions / limits:** Static review and selective file reads; no live penetration test or Stripe/Clerk dashboard review. All `app/app/api/**/route.ts` handlers were enumerated (33 files). Prior audit finding on **admin layout** (`getAppUser` vs `getActiveAppUser`) is **closed**: `app/app/(app)/admin/layout.tsx` now uses `getActiveAppUser()`. Prior finding on **billing sync/portal lacking rate limits** is **closed**: both use `checkRateLimit` / `recordRateLimit` with `billing:sync` and `billing:portal` (`app/lib/rate-limit.ts`).

---

## Risk & impact assessment

- **Medium findings** affect **user control** (deletion), **billing integrity** (edge-case Stripe metadata), **defense-in-depth** (CSP breadth, IP trust), and **operational maturity** (SCA cadence, audit logs).
- **Likelihood** of metadata-only webhook mis-sync is **low** in normal operations (requires Stripe-side misconfiguration or unusual customer lifecycle).
- **Business impact** of unresolved items is moderate for compliance/support (deletion, audit trail), not anonymous remote takeover of arbitrary accounts given current IDOR controls.

---

## Recommendations (prioritized)

1. **Document and productize account deletion for OAuth-only users** (Clerk-supported flow or support process); update `docs/security/security-notes.md` when decided.
2. **Optional webhook hardening:** When `customerUserId` is null but `metadataAppUserId` is present, require a match to a user whose email or Clerk ID aligns with Stripe customer record, or queue for manual review — only if metadata-only cases are non-trivial in production.
3. **Add a recurring dependency check** (e.g. `npm audit` in CI, or Snyk/OSV) and document owner/cadence in `docs/security/security-audit.md` or ops docs.
4. **Expand durable audit logging** for admin tier changes and exports (store + retention policy), beyond stdout.
5. **Continue CSP report review** in Sentry before setting `CSP_ENFORCEMENT=true` in production.

---

## Task candidates (optional)

- [ ] Document OAuth / passwordless permanent account deletion path in `docs/security/security-notes.md` and align UI copy.
- [ ] Add CI step or monthly calendar reminder for `npm audit` / SCA (and triage policy).
- [ ] Add secret/key rotation subsection to `docs/runbooks/incident-response.md` (or link from manual-steps with rotation checklist).
- [ ] Evaluate durable audit log sink for `admin_tier_override` and `admin_export_users` (ids already in structured logs).
- [ ] Revisit CSP `connect-src` tightening after enforcement is on and integrations are stable.

---

## Re-test checklist

- [ ] After any webhook resolution change: replay Stripe CLI test events and verify `User` / `Subscription` rows for mapped customers.
- [ ] After account-deletion flow changes: test password, OAuth, and edge cases.
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Monthly, after material auth/billing/security changes, or pre-production release per `docs/process/security-audit-process.md`.
- **Recommended next window:** 2026-05-01 or following the next billing/auth/CSP change.
