# Growth Funnel & Activation Audit — 2026-04-02

## Executive summary

- **Overall:** Alternative pages now present a **clear CTA funnel**: hero sign-up + pricing, post-table inline CTA, pricing aside, embedded calculator, final CTA before FAQ—material improvement over text-only footer.
- **FunnelCtaLink** placements use distinct `placement` values (`competitor_alt_hero`, `competitor_alt_table`, `competitor_alt_footer`) for attribution—good for PostHog funnel analysis.
- **Prior Schedule items** (onboarding PATCH UX, empty dashboard prompts, `PlanIntentUrlSync` on sign-in) remain to verify against `tasks.md`.

## Severity-ranked findings

### Critical

- None.

### High

- None new.

### Medium

- **Activation:** Ensure new users from alternative landers see a **clear first property / analyze** path—unchanged product requirement; verify in onboarding flow.

### Low

- Copy alignment (time estimates) across onboarding vs marketing.

## Evidence reviewed

- `competitor-alternative-page.tsx` — CTA placements, FunnelCtaLink usage
- Prior synthesis Schedule — growth items

## Risk & impact assessment

Weak activation after sign-up wastes paid/organic traffic; alternative page fixes address **top-of-funnel** only.

## Recommendations (prioritized)

1. Dashboard empty-state CTAs (if not done) per prior synthesis.
2. A/B or sequential review of **hero headline** on alternatives via Search Console CTR.

## Task candidates (optional)

- [ ] Verify PostHog events fire for `competitor_alt_table` and `competitor_alt_footer` (if instrumented in `FunnelCtaLink`).

## Re-test checklist

- [ ] Sign-up from `/alternatives/stessa` → confirm `landingVariant` in session/user metadata if applicable.

## Next trigger and cadence

- **Trigger:** Onboarding, pricing, or signup flow changes.
- **Cadence:** Monthly.
