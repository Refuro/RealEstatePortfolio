# Growth Funnel & Activation Audit — 2026-03-30 (Run 2, post-merge)

## Executive summary

- Funnel instrumentation remains broad and consistent after merge (signup, checkout, subscription lifecycle, plan-limit/import events).
- Consent gating and analytics wiring remain active and coherent.
- No immediate funnel-breaking regressions found from post-merge build/test checks.

## Severity-ranked findings

### Critical

- None.

### High

- None identified.

### Medium

- **Trust proof still deferred** — social proof/trust strip remains backlog/deferred and may limit conversion lift during paid or broader distribution pushes.

### Low

- Keep event docs synchronized whenever event names/properties evolve.

## Evidence reviewed

- `app/lib/analytics-events.ts`
- `app/components/analytics/`
- `docs/launch/analytics.md`
- `docs/tasks.md` (deferred trust-strip/trust-signal items)

## Risk & impact assessment

Main risk is conversion efficiency and messaging trust, not instrumentation failure.

## Recommendations (prioritized)

1. Keep dashboard funnels and event docs aligned post-iteration.
2. Promote trust-signal work when assets are ready and priorities allow.

## Task candidates (optional)

- [ ] Promote trust strip/testimonial/logo work from deferred to active once assets and copy are available.

## Re-test checklist

- [ ] Verify key funnel events in PostHog after launch-copy or IA changes
- [ ] Confirm consent behavior keeps analytics off until opt-in

## Next trigger and cadence

- **Trigger:** onboarding/pricing/signup-flow changes
- **Cadence:** Monthly
