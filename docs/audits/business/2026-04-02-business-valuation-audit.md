# Business & Valuation Audit — 2026-04-02

## Executive summary

- **Overall:** Product positioning on alternative pages is **honest** (scope limits, competitor matrix). Improved CTAs support conversion without overstating parity with incumbents.
- **Strategic context:** `docs/design/design-brief-2026.md` positions a future **brand and marketing** lift—valuable for differentiation; treat as roadmap work with measurable conversion goals (PostHog).
- **Pricing:** Free tier callouts on alternative pages align with documented limits; full tiers remain on `/pricing`.

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **Launch plan alignment:** Owner should confirm `docs/launch/launch-plan.md` milestones vs analytics when design brief ships.

### Low

- Changelog visibility for major marketing updates.

## Evidence reviewed

- `app/lib/marketing/competitor-data.ts` — lede, features, fitFor
- `docs/design/design-brief-2026.md` — executive summary
- `docs/launch/launch-plan.md` (reference)

## Risk & impact assessment

Overclaiming vs competitors would hurt trust; current copy emphasizes **fit and scope**. Business risk is **moderate** if analytics not reviewed after funnel changes.

## Recommendations (prioritized)

1. Add or verify **UTM** / `landingVariant` dashboards for `/alternatives/*` after deploy.
2. Revisit **ICP** copy on `fitFor` after first month of traffic.

## Task candidates (optional)

- [ ] (Optional) PostHog insight: sign-ups by `landingVariant` including `alt_stessa_v1`, `alt_rentastic_v1`, `alt_cozy_v1`.

## Re-test checklist

- [ ] Owner: quarterly review of competitor matrix accuracy vs competitor product changes.

## Next trigger and cadence

- **Trigger:** Pricing change, packaging change, or major marketing launch.
- **Cadence:** Quarterly.
