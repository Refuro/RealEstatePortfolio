# Code Audit — 2026-04-02

## Executive summary

- **Overall:** Architecture remains aligned with `docs/architecture-and-build-practices.md`: thin API routes, metrics in `lib/metrics/`, Zod validation, `userId`-scoped queries. No widespread `any` drift observed in a spot check.
- **Recent surface:** `components/marketing/competitor-alternative-page.tsx` follows semantic tokens (`bg-subtle`, `border-default`, `text-muted`) and FunnelCtaLink patterns; layout is more conversion-oriented without breaking layered data flow (marketing-only).
- **Design strategy:** `docs/design/design-brief-2026.md` describes a future visual overhaul (indigo accent, marketing rebuild). **Not** a code defect—implementation is intentionally deferred; current code still targets `docs/policies/design-spec.md` tokens.
- **Top residual risks:** Large client modules (e.g. deal analyzer) called out in prior runs; optional splits remain backlog. `force-dynamic` on scoped app routes is acceptable per architecture doc.

## Severity-ranked findings

### Critical

- None identified this pass.

### High

- None identified this pass.

### Medium

- **Large form modules** — `deal-analyzer-form.tsx` and related remain high line-count; maintainability and bundle impact unchanged from prior audits. Evidence: prior synthesis + module size.
- **Prototype / slim API payloads** — Optional slimming of `GET /api/deals/[id]` portfolio context remains a performance nicety, not a correctness issue.

### Low

- **Comment drift** — Occasional inline comments may lag new behavior; routine PR review catches this.

## Evidence reviewed

- `app/components/marketing/competitor-alternative-page.tsx`, `app/lib/marketing/competitor-data.ts`
- `app/app/(app)/layout.tsx`, `analyze/page.tsx` — `force-dynamic` usage
- Grep: `force-dynamic` (4 files), `: any` (no matches in spot check)
- `docs/architecture-and-build-practices.md`, `docs/design/design-brief-2026.md` (context only)

## Risk & impact assessment

Unresolved Medium items are **maintainability and perf hygiene**, not user-facing defects. Design brief adoption is a **scheduled product initiative**, not a lint failure.

## Recommendations (prioritized)

1. When implementing **design-brief-2026**, do it via token migration + component passes per `docs/design/implementation-guide-2026.md` (if present) to avoid one-off colors.
2. Keep deferring large-file splits until a milestone touches those files.
3. Continue running `npm run check` before releases.

## Task candidates (optional)

- [ ] (Optional) Split `deal-analyzer-form.tsx` / `pricing-cards.tsx` when next major feature touches those surfaces (unchanged from prior audit).

## Re-test checklist

- [ ] After any refactor: `npm run check`, targeted property/deal flows.

## Next trigger and cadence

- **Trigger:** Monthly or after major refactor / design-brief implementation kickoff.
- **Next window:** Post–design-brief Phase 1 merge (re-audit token compliance).
