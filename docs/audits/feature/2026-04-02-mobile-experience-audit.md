# Mobile Experience Audit — 2026-04-02

## Executive summary

- **Overall:** Prior **Ship** fix for marketing calculators at **768–1023px** (`md` grid alignment vs `md:hidden` mobile shell) is documented in `tasks.md` and synthesis -2; this audit assumes that fix is in production unless regression observed.
- **Alternative pages:** New layout uses responsive grids (`md:grid-cols-3` for cards), stacked CTAs on narrow viewports, and horizontal scroll on the comparison table (`overflow-x-auto`)—consistent with mobile patterns.
- **Future:** `design-brief-2026` may change touch targets and shell chrome; re-run mobile audit after implementation.

## Severity-ranked findings

### Critical

- None new.

### High

- **Regression check:** If any calculator reintroduces `lg:grid` without matching `md` breakpoint for desktop shell, tablet blank layout could return — **spot-check** on release.

### Medium

- Safe-area / fixed chrome on marketing pages: continue to follow `mobile-experience-audit.md` criteria for app shell (primary focus of doc).

### Low

- Alternative page: long hero text on small screens — acceptable; monitor scroll-to-CTA.

## Evidence reviewed

- `competitor-alternative-page.tsx` — responsive classes, table overflow
- `docs/qa/mobile-experience-audit.md` (criteria reference)
- Prior: `2026-04-01-audit-synthesis-2.md` (tablet calculator)

## Risk & impact assessment

Tablet calculator regression would be **High** user-visible; alternative pages are **lower risk** (scrollable table, vertical stack).

## Recommendations (prioritized)

1. Manual pass: **768px and 900px** on `/alternatives/stessa` after deploy.
2. Keep calculator breakpoint patterns documented in `architecture-and-build-practices.md` or component README if duplicated.

## Task candidates (optional)

- [ ] (Optional) Add to release checklist: one alternative URL + one `/tools/*` URL at tablet width.

## Re-test checklist

- [ ] 375px: alternative hero + table horizontal scroll
- [ ] 768px: calculators (if touched this release)

## Next trigger and cadence

- **Trigger:** Any change to `MobileToolShell`, calculator layouts, or marketing hero sections.
- **Cadence:** Monthly or with major UI release.
