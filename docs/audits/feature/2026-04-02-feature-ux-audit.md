# Feature / UX / IA Audit — 2026-04-02

## Executive summary

- **Overall:** In-app IA and flows remain consistent with prior assessments. **Alternative pages** (`competitor-alternative-page.tsx`) were recently improved: hero CTAs, Veld column emphasis, inline CTA after table, “Who this is for,” pricing aside, reframed calculator heading, final CTA block—stronger first-touch funnel without changing product scope.
- **Design strategy note:** `docs/design/design-brief-2026.md` outlines a **future** full marketing and in-app visual refresh (indigo accent, landing rebuild). **This has not been implemented** by design; current UI should be judged against `docs/policies/design-spec.md` until the brief is scheduled. **No finding** for “anonymous” marketing visuals in this audit—they are **known backlog**, not regressions.
- **Residual (prior runs):** Onboarding dialog semantics, empty-state affordances, nav labeling polish items remain in Schedule from `2026-04-01-audit-synthesis-2.md` unless already completed in `tasks.md`.

## Severity-ranked findings

### Critical

- None.

### High

- None new this pass.

### Medium

- **Prior carryover:** Welcome overlay / `OnboardingPanel` semantics; deals list empty search; `OverLimitBanner` tokens; Analyze vs Deals nav clarity — see synthesis Schedule unless closed in tasks.
- **Marketing vs design brief:** Landing/pricing will eventually diverge from brief until implementation; track as **design-brief milestone**, not duplicate UX bugs.

### Low

- Microcopy consistency (e.g. “60s” vs “2 min”) — growth lane overlap.

## Evidence reviewed

- `app/components/marketing/competitor-alternative-page.tsx`, `app/lib/marketing/competitor-data.ts`
- `docs/design/design-brief-2026.md`, `docs/policies/design-spec.md`
- Prior synthesis: `docs/audits/synthesis/2026-04-01-audit-synthesis-2.md`

## Risk & impact assessment

Deferred Schedule items affect **polish and a11y**, not core money paths. Design brief delay does not block shipping functional fixes.

## Recommendations (prioritized)

1. **PM:** Schedule `design-brief-2026` implementation as its own epic; avoid one-off indigo splashes before token migration.
2. Reconcile remaining **Schedule** items from synthesis -2 against `docs/tasks.md`.
3. After alternative page deploy: quick **PostHog** or analytics check on `landingVariant` for alt routes.

## Task candidates (optional)

- [ ] Verify `fitFor` bullets on `/alternatives/*` match ICP after one editorial pass (copy-only).

## Re-test checklist

- [ ] `/alternatives/stessa` (and one other slug): hero CTAs, table scroll on mobile, FAQ accordion.

## Next trigger and cadence

- **Trigger:** Navigation changes, onboarding changes, or start of design-brief Phase 1.
- **Cadence:** Monthly.
