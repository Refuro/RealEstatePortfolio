# Feature / UX / IA Audit — 2026-03-30 (Run 2, post-merge)

## Executive summary

- Core user journeys remain coherent after merge (dashboard, properties, analyze, settings, plans).
- No blocking UX regressions surfaced during post-merge checks.
- Current UX gaps are prioritization/discoverability items, not broken flows.

## Severity-ranked findings

### Critical

- None.

### High

- None in this pass.

### Medium

- **Single-property dashboard polish remains backlog-driven** — still an opportunity area from roadmap/backlog, not a defect.

### Low

- Deep power features (modeling/mortgage/deal tooling) remain information-dense for first-time users.

## Evidence reviewed

- `app/app/(app)/dashboard/`
- `app/app/(app)/properties/`
- `app/app/(app)/analyze/`
- `docs/reference/roadmap.md`, `docs/tasks.md`

## Risk & impact assessment

Most risk is adoption friction from complexity, not functional breakage.

## Recommendations (prioritized)

1. Continue improving first-session guidance and next-step signposting.
2. Prioritize mobile readability whenever adding dashboard/property metrics density.

## Task candidates (optional)

- [ ] Promote next single-property dashboard improvement item from roadmap to `docs/tasks.md` when scheduled.

## Re-test checklist

- [ ] Smoke: sign-up/sign-in -> dashboard -> add property -> property detail
- [ ] Analyze deal form and output section readability

## Next trigger and cadence

- **Trigger:** IA/navigation/onboarding changes
- **Cadence:** Monthly
