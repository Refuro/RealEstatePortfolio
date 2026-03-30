# Code Audit — 2026-03-30

## Executive summary

- Overall codebase health is **strong**: layered `lib/` usage, Zod on APIs, semantic Tailwind tokens remain the norm.
- **Architecture** aligns with `docs/architecture-and-build-practices.md`; a few large route/component files remain the main maintainability drag.
- **Recommendation:** Keep extracting shared logic from oversized UI modules when touching those areas; avoid scope creep on unrelated refactors.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- **Large property/mortgage UI modules** — `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` and related property detail surfaces remain long files; risk of merge conflicts and inconsistent fixes. *Evidence:* file size and concentration of concerns (deferred refactor in `docs/tasks.md`).

### Medium

- **Dual lockfile / workspace root warning** — Next.js build warns about multiple lockfiles (`PersonalProject/package-lock.json` vs `app/package-lock.json`). *Evidence:* build output; consider documenting or silencing via `turbopack.root` if intentional.

### Low

- Occasional **inline one-off class strings** on marketing or legacy pages; most app surfaces use design tokens.

## Evidence reviewed

- `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md`
- Sample: `app/app/api/**/route.ts` auth patterns, `app/lib/metrics/`, `app/app/(app)/properties/` components
- Grep: no broad `any` / `as any` pattern in app TS/TSX (spot-check)

## Risk & impact assessment

Large files increase bug risk on change but do not block releases. Lockfile warning is operational clarity, not a runtime defect.

## Recommendations (prioritized)

1. When next editing property/mortgage/detail tabs, extract subcomponents or hooks per existing patterns.
2. Document or fix Turbopack/workspace root warning if it confuses contributors.

## Task candidates (optional)

- [ ] Document dual-root `package-lock` layout in `docs/architecture-and-build-practices.md` or `docs/setup/run-and-smoke-test.md` if repo layout is intentional.

## Re-test checklist

- [ ] After any large refactor in property detail, run `npm run check` from `app/`
- [ ] Spot-check property detail and mortgage tabs in browser

## Next trigger and cadence

- **Trigger:** Monthly or major refactor touching `app/` structure
- **Next window:** After next large property or metrics change
