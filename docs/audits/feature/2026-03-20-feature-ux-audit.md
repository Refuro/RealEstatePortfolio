# Feature / UX / IA Audit — 2026-03-20

## Executive summary

- **Overall:** App shell, loading states (`loading.tsx` routes), and property detail refactor (tabs, health strip) improve perceived quality. Sign-up **`signInUrl="/sign-in"`** is correct (regression check).
- **Top risks:** **Deals** and **long forms** may still carry friction (sorting, confirm patterns); mobile/touch on dense data tables not fully verified in this pass.
- **Recommendation:** Continue incremental UX debt from `docs/tasks.md` Batch 2+; validate primary flows against `docs/qa/property-flow-regression-matrix.md` before releases.

## Severity-ranked findings

### Critical

- *(none in code review)*

### High

- *(none new — prior sign-in loop fix verified in `app/sign-up/[[...sign-up]]/page.tsx`)*

### Medium

- **Information density on property detail** — Multiple tabs and metrics; ensure first-time users have guidance (onboarding / empty states) — partially addressed elsewhere; re-verify after IA changes. — `app/(app)/properties/[id]/`

### Low

- **Consistency of destructive actions** — Confirm delete/archive flows use the same modal pattern app-wide (grep shows no `window.confirm` in current tree — good).

## Evidence reviewed

- `app/app/sign-up/[[...sign-up]]/page.tsx`
- Property detail: `property-detail-tabs.tsx`, `overview-tab-content.tsx`, loading routes
- `app/(app)/deals/deals-list.tsx` (structure only — shallow)
- `docs/qa/property-flow-regression-matrix.md` (reference)

## Risk & impact assessment

UX issues here affect activation and support burden more than security; priority follows growth milestones.

## Recommendations (prioritized)

1. Keep **one regression matrix** run before major releases.
2. For Deals: if product priority is high, add **sort** + **search** (may already be in backlog).

## Task candidates (optional)

- [ ] UX review pass on **Deals** list (sort, filter, empty state) against competitor expectations.
- [ ] Add or refresh **“What’s next”** / empty-dashboard guidance if not shipped (see roadmap/tasks).

## Re-test checklist

- [ ] Sign-up → dashboard path (Clerk test instance).
- [ ] Add property wizard happy path.
- [ ] Property detail tab switching without layout shift errors.

## Next trigger and cadence

- **Trigger:** Navigation IA change, onboarding redesign, or major property UX release.
- **Next window:** Monthly.
