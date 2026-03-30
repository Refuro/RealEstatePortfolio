# Security & Privacy Audit — 2026-03-21

## Executive summary

- **Overall:** Auth via Clerk; API routes use app user helpers; rate limiting on sensitive endpoints; CSP report-only; Sentry in error boundary; **Privacy/Terms** updated 2026-03-20 with PostHog + Sentry disclosure.
- **Top risks:** **CSP** remains report-only (intentional) — promote to enforcing when violation noise is understood. **Secrets** must stay server-only (Stripe, webhooks, DB).
- **Recommendation:** Periodic secret scan / dependency audit; keep webhook signatures verified (already in billing webhook).

## Severity-ranked findings

### Critical

- *(none identified this pass)*

### High

- **CSP not enforcing** — `Content-Security-Policy-Report-Only` only; acceptable for iteration; tighten before assuming strong XSS posture. — `app/next.config.ts`

### Medium

- **Third-party data processors** — Clerk, Stripe, RentCast, PostHog, Sentry, Vercel, Neon documented in `/privacy`. Keep list updated when adding vendors. — `app/app/privacy/page.tsx`

### Low

- *(none new)*

## Evidence reviewed

- `app/next.config.ts` (headers)
- `app/app/api/contact/route.ts` — **rate limit:** 5 submissions/hour per user or IP via `contactFormSubmission` count + 429
- `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`
- `app/proxy.ts` / middleware pattern (reference)
- Prior: `docs/audits/security/2026-03-20-security-audit.md`

## Risk & impact assessment

Enforcing CSP reduces XSS impact; processor list accuracy supports GDPR-style transparency expectations for US-focused launch.

## Recommendations (prioritized)

1. Before “big” marketing spend: review CSP reports and consider `Content-Security-Policy` (enforcing) for key directives.
2. Keep honeypot + Zod validation on contact form when changing fields.

## Task candidates (optional)

- *(omit — contact rate limit present)*

## Re-test checklist

- [ ] Billing webhook signature failure still returns 400 (no secret leak).
- [ ] Sign-in / protected routes still reject anonymous users.

## Next trigger and cadence

- **Trigger:** Auth, billing, webhooks, new integrations, or privacy policy changes.
- **Next window:** Monthly or pre-major release.
