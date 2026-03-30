# Reliability & Operations Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** `instrumentation.ts` registers Sentry (`onRequestError` = `Sentry.captureRequestError`) and asserts Stripe webhook secret on Vercel via `assertStripeWebhookSecretForVercelDeploy`. `global-error.tsx` captures exceptions client-side when `NEXT_PUBLIC_SENTRY_DSN` is set.
- **Top risks:** **CSP reports** are dev-logged only in `app/app/api/csp-report/route.ts` (`console.warn` in development); production observability for CSP violations is not wired to Sentry yet. **Stripe** billing sync failures are documented to log + Sentry in security notes.
- **Recommendation:** If CSP enforcement tightens, add structured logging or Sentry breadcrumbs for CSP POSTs in production (with sampling).

## Severity-ranked findings

### Critical

- None.

### High

- **Anonymous CSP reporting path** — May be blocked by Clerk — Overlaps Security: without public `/api/csp-report`, reliability of CSP telemetry on public pages is weak.

### Medium

- **CSP report production logging** — Gap — Comment in route suggests optional Sentry; not implemented. Violations may go unseen in prod.

### Low

- **Health check** — `/api/health` is public per `proxy.ts`; confirm deployment probes use it consistently (not verified in this pass).

## Evidence reviewed

- `app/instrumentation.ts`
- `app/app/global-error.tsx`
- `app/lib/env.ts` (referenced via security notes — Stripe assert)
- `app/app/api/csp-report/route.ts`
- `docs/setup/manual-steps.md` (referenced)
- `docs/security/security-notes.md`

## Risk & impact assessment

Core **error capture** for app exceptions is in good shape with Sentry. Gaps are mainly **security-policy telemetry** (CSP), not user-facing uptime.

## Recommendations (prioritized)

1. Align `proxy.ts` public routes with CSP reporting needs (see Security audit).
2. Add sampled production logging or Sentry for CSP reports if enforcement ramps up.
3. Keep webhook secret assertion in CI/Vercel builds (already present).

## Task candidates (optional)

- [ ] Forward CSP violation summaries to Sentry (sampled) when `NODE_ENV === 'production'`.

## Re-test checklist

- [ ] Induce test error in staging; verify Sentry event.
- [ ] `GET /api/health` returns success from deploy probe.

## Next trigger and cadence

- Trigger: monthly or release hardening window
- Recommended next run: 2026-04-28
