# Feature / UX / IA Audit — 2026-03-30

## Executive summary

- Core journeys (dashboard, properties, detail, analyze, modeling, plans) remain **coherent** with design-spec patterns and clear hierarchy.
- Recent work improved **Analyze Deal** stress controls readability; benchmark messaging is more consistent across surfaces.
- **Recommendation:** Continue prioritizing discoverability of high-value actions (add property, analyze deal, benchmarks) on first sessions; optional trust/social proof remains deferred per tasks.

## Severity-ranked findings

### Critical

- None.

### High

- None blocking launch in this pass.

### Medium

- **Single-property vs multi-property dashboard** — Roadmap still lists single-property improvements; worth validating against current dashboard when prioritizing. *Evidence:* `docs/reference/roadmap.md` § Dashboard — single-property improvements.

### Low

- **Deep property tools** — Mortgage/modeling/deals remain powerful but can feel nested for first-time users; onboarding and “what’s next” patterns partially mitigate.

## Evidence reviewed

- `docs/policies/design-spec.md`, `docs/policies/analytics-math-policy.md`
- `app/app/(app)/dashboard/`, `app/app/(app)/properties/`, `app/app/(app)/analyze/deal-analyzer-form.tsx`
- Public: `app/app/pricing/page.tsx`, landing nav patterns

## Risk & impact assessment

Friction is mostly **discovery** and **education**, not broken flows. Deferred marketing trust strip is a positioning gap, not a functional bug.

## Recommendations (prioritized)

1. When promoting roadmap items, validate empty/first-property states against launch messaging.
2. Keep metric density readable on mobile for dashboard and property detail.

## Task candidates (optional)

- [ ] When ready, promote **single-property dashboard** roadmap items to `docs/tasks.md` with acceptance criteria (see roadmap).

## Re-test checklist

- [ ] Smoke: sign-in → dashboard → add property path
- [ ] Analyze deal: stress presets and metrics section readability

## Next trigger and cadence

- **Trigger:** Navigation, onboarding, or major page redesign
- **Cadence:** Monthly
