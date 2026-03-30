# Security & Privacy Audit — 2026-03-20

## Executive summary

- **Overall:** **Clerk** auth boundary is implemented in `app/proxy.ts` with an explicit public-route allowlist; protected APIs consistently use **`getActiveAppUser()`** (with **`getAppUser()`** only where intended: contact optional identity, account restore). **Input validation** uses Zod on reviewed routes; **Stripe webhooks** verify signatures; **secrets** stay server-side (env + `.env.example` documentation). **Rate limiting** exists for high-impact actions (`app/lib/rate-limit.ts`) plus **RentCast** hourly caps shared across rent/value/benchmark flows (`RentCastApiCall` / `rentCastApiCall`). **Security headers** and **CSP (report-only)** are set in `app/next.config.ts`. **Operational readiness** includes `docs/runbooks/incident-response.md` (rollback, monitoring, health check, billing/auth triage).
- **Top risks:** **CSP is not enforcing** (report-only), so XSS-class issues would not be blocked by policy alone; the **public-route matcher** must stay accurate or routes may be wrongly exposed or blocked. **`STRIPE_WEBHOOK_SECRET` is not part of `validateEnv()`** — a missing webhook secret fails at handler invocation, not necessarily at process boot.
- **Recommendation:** Treat CSP graduation and public-route hygiene as ongoing release checks; keep admin and billing changes paired with review of `proxy.ts` and webhook envs.

## Severity-ranked findings

### Critical

- *(none identified in this pass)*

### High

- **CSP not enforcing (report-only)** — Violations are visible but not blocked; policy also allows `'unsafe-inline'` / `'unsafe-eval'` in `script-src`, which is typical for Next/Clerk but weakens XSS containment if markup/script injection ever occurred. — `app/next.config.ts` (`Content-Security-Policy-Report-Only`, `securityHeaders`)

### Medium

- **Public route allowlist must stay complete and accurate** — Any new guest-accessible page or unauthenticated API must be added to `isPublicRoute`; omission routes unauthenticated users through `auth.protect()` (broken UX/public pages) or, conversely, forgetting to list a sensitive path could incorrectly classify exposure (depends on Clerk behavior for that path). — `app/proxy.ts`
- **Webhook secret not validated at boot** — `validateEnv()` requires `DATABASE_URL`, `CLERK_SECRET_KEY`, and `STRIPE_SECRET_KEY` but not `STRIPE_WEBHOOK_SECRET`; misconfiguration surfaces when `getWebhookSecret()` runs on webhook traffic. — `app/lib/env.ts`, `app/lib/stripe-config.ts`, `app/app/api/billing/webhook/route.ts`

### Low

- **RentCast estimate failure responses use HTTP 200 with error payload** — On upstream failure, GET `estimates/rent` and `estimates/value` return `{ error: message }` with **status 200** and `message` derived from `Error.message`, which can confuse clients and may expose more detail than a generic error in edge cases. — `app/app/api/estimates/rent/route.ts` (catch block), `app/app/api/estimates/value/route.ts` (catch block). *(Benchmark refresh uses 502 for errors — `app/app/api/properties/[id]/benchmark/refresh/route.ts`.)*
- **Structured security/audit logging is partial** — Admin export and tier override emit JSON `console.info` lines; many other sensitive actions do not have a uniform audit log pattern (aligns with known backlog in `docs/security/security-audit.md`). — `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`
- **Dependency risk process** — No repo-local evidence of automated SCA in this pass; periodic `npm audit` / supply-chain review remains a manual cadence item. — (process gap; see `docs/security/security-audit.md`)

## Evidence reviewed

- Process and policy: `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` (security checklist)
- Auth boundary: `app/proxy.ts`
- Env / secrets: `app/lib/env.ts`, `app/lib/stripe-config.ts`, `app/.env.example`
- AuthZ helpers: `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- Rate limiting: `app/lib/rate-limit.ts`; sample consumers: `app/app/api/properties/route.ts`, `app/app/api/deals/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts`, `app/app/api/billing/create-checkout-session/route.ts`
- External estimate limits: `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`
- Public/sensitive APIs: `app/app/api/contact/route.ts` (Zod + honeypot + per-identifier hourly cap), `app/app/api/billing/webhook/route.ts`, `app/app/api/health/route.ts`, `app/app/api/account/restore/route.ts`
- Admin: `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`
- Headers/CSP: `app/next.config.ts`
- Ops: `docs/runbooks/incident-response.md`
- API surface enumeration: `app/app/api/**/route.ts` (30 route handlers)

**Limits of this pass:** Static review and documentation cross-check only; no penetration test, no production config review, no full `npm audit` execution in this run.

## Risk & impact assessment

Unresolved **High** CSP exposure mainly matters if an XSS or script-injection vector exists elsewhere; report-only CSP does not reduce exploitability by itself. **Medium** items affect **availability of correct auth routing**, **time-to-detect** for Stripe webhook misconfiguration, and **operational consistency**. **Low** items affect **client error handling**, **forensics depth**, and **dependency visibility** more than immediate confidentiality of core tenant data (which remains gated by Clerk + `userId` scoping in reviewed APIs).

## Recommendations (prioritized)

1. **Plan CSP enforcement:** Collect violations (e.g. `report-uri` / reporting API or Sentry integration referenced in `next.config.ts` comment), then tighten `script-src` / `connect-src` for Clerk, Stripe, Sentry, PostHog before switching from `Content-Security-Policy-Report-Only` to an enforcing policy.
2. **Harden deploy-time checks:** Ensure `STRIPE_WEBHOOK_SECRET` is present in production (extend `validateEnv()` or add an explicit deployment checklist step in `docs/setup/manual-steps.md`).
3. **Keep the public-route list as a release artifact:** When adding pages under `app/app/` or new `app/app/api/*` routes, update `isPublicRoute` in `proxy.ts` and verify unauthenticated vs authenticated behavior.

## Task candidates (optional)

- [ ] Add **`STRIPE_WEBHOOK_SECRET`** to startup validation alongside other required secrets (or document an equivalent mandatory deploy check) — closes boot-time gap in `app/lib/env.ts`.
- [ ] Align **RentCast estimate** error handling: return non-2xx for failures and avoid returning raw `Error.message` to clients in production — `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`.

## Re-test checklist

- [ ] Unauthenticated: `/`, `/pricing`, `/contact`, `/api/health`, `POST /api/billing/webhook` (signature valid vs invalid)
- [ ] Authenticated: protected API returns **401** without session; **403/404** on cross-user resource IDs where applicable
- [ ] Rate limits: hammer `POST` routes using `checkRateLimit` and RentCast estimate routes until **429**
- [ ] Admin: non-admin receives **401** on `/api/admin/*`
- [ ] After any security fix: `npm run check` in `app/`

## Next trigger and cadence

- **Trigger:** Changes to auth (`proxy.ts`, Clerk), billing/webhooks, new public APIs, or major dependencies.
- **Recommended next run:** Within one month or before production launch milestone — per `docs/process/security-audit-process.md` and `docs/security/security-notes.md` cadence.
