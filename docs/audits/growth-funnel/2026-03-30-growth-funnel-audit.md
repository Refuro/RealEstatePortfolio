# Growth Funnel & Activation Audit — 2026-03-30

## Executive summary

- **PostHog** events and consent gating align with `docs/launch/analytics.md`; funnel instrumentation has been expanded in prior batches.
- **Plan intent** propagation and signup flows are documented.
- **Recommendation:** Keep pricing and landing copy aligned with product reality; validate trust signals when you decide to ship deferred testimonials/logos.

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **Trust strip deferred** — Social proof not shipped; may affect conversion vs competitors. *Evidence:* `docs/tasks.md` Batch 11 deferred item.

### Low

- **Analytics completeness** — Ensure new flows get events when IA changes (onboarding, add property).

## Evidence reviewed

- `docs/launch/analytics.md`, `docs/launch/launch-plan.md`
- `app/components/analytics/`, cookie consent patterns
- `app/app/pricing/page.tsx`, sign-up flows (conceptual)

## Risk & impact assessment

Growth risk is **positioning and trust** more than broken funnel wiring.

## Recommendations (prioritized)

1. When launching campaigns, confirm UTM and PostHog dashboards match current event names.
2. Revisit deferred trust strip when you have assets or testimonials.

## Task candidates (optional)

- [ ] Promote trust strip / testimonials / logos from deferred to active when assets and copy are ready (`docs/tasks.md`).

## Re-test checklist

- [ ] Sign-up → dashboard path and key events in PostHog (production)
- [ ] Cookie consent: analytics off until opt-in

## Next trigger and cadence

- **Trigger:** Onboarding, pricing CTA, or signup-flow changes
- **Cadence:** Monthly
