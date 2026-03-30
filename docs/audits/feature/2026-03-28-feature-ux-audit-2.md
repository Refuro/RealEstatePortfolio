# Feature / UX / IA Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** Core journeys (dashboard, properties list/detail, modeling/mortgage workspaces, pricing) align with the design-spec direction; cookie consent and analytics gating are present via `CookieConsentProvider` and related components.
- **Top risks:** Property detail **Mortgage** tab complexity is high for scanability; roadmap item **benchmarking v2** (rental-status-aware comparison) remains important to avoid misleading “vs market” messaging when `isRented` or rent is not meaningful.
- **Recommendation:** After benchmarking v2, run a focused UX pass on properties list + dashboard benchmark callouts for consistent empty/missing states.

## Severity-ranked findings

### Critical

- None.

### High

- **Benchmark semantics vs rental status** — User trust — Roadmap `benchmarking v2` describes hiding percent comparison when not rented or rent is zero. Until fully implemented everywhere, users could misread benchmark UI (coordination with Data Integrity).

### Medium

- **Mortgage workspace density** — Cognitive load — Large mortgage surfaces pack many metrics and controls; progressive disclosure or section anchors would help (ties to Code audit mega-file note).

### Low

- **Single-property dashboard** — Discoverability — Roadmap still lists “Dashboard — single-property improvements”; low-property-count users may under-discover detail actions.

## Evidence reviewed

- `docs/policies/design-spec.md` (reference)
- `docs/reference/roadmap.md` — benchmarking v2, dashboard single-property
- `app/components/consent/cookie-consent-provider.tsx` — consent state
- `app/app/(app)/dashboard/` — charts and layout (prior knowledge + architecture docs)
- `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` — scope/complexity

## Risk & impact assessment

Misleading benchmark copy primarily affects **trust and support burden**, not ledger math. Consent/analytics path looks intentional for compliance.

## Recommendations (prioritized)

1. Ship benchmarking v2 acceptance criteria (shared eligibility contract across dashboard, list, detail).
2. Improve single-property dashboard affordances per roadmap proposal when prioritized.
3. Consider section tabs or sticky sub-navigation within the mortgage detail view.

## Task candidates (optional)

- [ ] UX review of benchmark empty states after `isRented` is fully wired through all surfaces.

## Re-test checklist

- [ ] Manual pass: logged-out landing → pricing → sign-up path (no code change in this audit).
- [ ] Cookie consent: reject optional → analytics scripts gated (manual).

## Next trigger and cadence

- Trigger: monthly or navigation/onboarding redesign
- Recommended next run: 2026-04-28
