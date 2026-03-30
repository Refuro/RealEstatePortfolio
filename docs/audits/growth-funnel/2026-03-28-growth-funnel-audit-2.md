# Growth Funnel & Activation Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** Public routes include `/`, `/pricing`, `/sign-in`, `/sign-up` (`app/proxy.ts`). Plan limits are simple and communicable (`lib/plans.ts`). Consent layer supports analytics opt-in (`CookieConsentProvider`).
- **Top risks:** **Time-to-first-value** still depends on user effort (add property, enter mortgage data); RentCast quota messaging may confuse first-session users if they hit hourly limits while experimenting. **Trust** copy should stay aligned with privacy/analytics policies as tags fire.
- **Recommendation:** Add lightweight onboarding checklist progress (if not already prominent) and surface RentCast remaining quota on estimate actions to reduce support friction.

## Severity-ranked findings

### Critical

- None.

### High

- **External API quota as activation friction** — Users exploring value estimates may exhaust shared hourly RentCast pool and stall activation (see Performance/Cost lane).

### Medium

- **Cookie consent + conversion tags** — If analytics require consent, verify funnel attribution still works for opted-in users only (expected); document in growth docs.

### Low

- **Pricing clarity** — Ensure `/pricing` reflects current Stripe products (manual steps in `docs/setup/manual-steps.md` for Stripe).

## Evidence reviewed

- `app/proxy.ts` — public marketing/auth routes
- `app/lib/plans.ts` — tier limits, RentCast hourly caps
- `app/components/consent/cookie-consent-provider.tsx`
- `docs/launch/analytics.md` (referenced)
- `docs/reference/roadmap.md` — activation-related items

## Risk & impact assessment

Growth is less blocked by **signup mechanics** than by **habit formation** and **data entry effort** — typical for finance tools.

## Recommendations (prioritized)

1. In-product hint: “RentCast actions share an hourly limit” near refresh/estimate buttons.
2. Keep sign-up → first property path short; defer optional fields.
3. Align marketing pages with product limits (property counts per tier).

## Task candidates (optional)

- [ ] Show remaining RentCast calls this hour on estimate/refresh flows (ties Performance lane).

## Re-test checklist

- [ ] Funnel: anonymous `/` → `/pricing` → `/sign-up` (manual).
- [ ] Consent reject → no non-essential analytics (manual).

## Next trigger and cadence

- Trigger: monthly or onboarding/pricing changes
- Recommended next run: 2026-04-28
