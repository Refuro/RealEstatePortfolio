# Mobile experience audit — 2026-04-09

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells).  
**Criteria (canonical):** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)

## Executive summary

- Mobile architecture is **coherent**: `MobileToolShell` (`app/components/mobile-tool-shell.tsx`) matches the documented contract (eyebrow/title/context, summary rail, modes, footer with safe-area padding); app chrome uses fixed header + bottom nav, safe-area utilities in `app/app/globals.css`, and `useIsMobile()` aligned to `(max-width: 767px)` (`app/lib/use-is-mobile.ts`).
- **Automated confidence is strong:** `npm run test` in `app/` completed with **67 files / 460 tests passed**, including `MobileToolShell` and `MobileBottomNav` unit tests.
- This pass is **code- and test-driven**; the criteria doc also requires viewport matrix checks (320–768px) and **at least one physical device**. Those were **not executed** in this run—several checklist rows are marked **Pending manual** below.
- Main gaps to validate or fix in a follow-up: **keyboard/focus behavior** for the mobile nav drawer, **sub-44px controls** in a few secondary UI spots, and **hydration layout** for surfaces that branch on `useIsMobile()` (e.g. Deal Analyzer) rather than relying solely on `md:hidden`.

## Severity-ranked findings

### Critical

- None identified from static review and unit tests alone (no P0 financial or save-path regressions observed in code reviewed).

### High

- None confirmed without browser/device verification.

### Medium

- **Mobile drawer focus management is incomplete** — `app/app/(app)/app-layout-client.tsx` moves focus to the first focusable element when the drawer opens (`useEffect` on `drawerOpen`) and locks `body` overflow, but there is **no focus trap** and **no documented return of focus** to the hamburger control when the drawer closes. Risk: keyboard and screen-reader users tab into obscured content or lose place (maps to criteria **C1**, **J1**).
- **`useIsMobile()`-gated render branches** (e.g. Deal Analyzer: `app/app/(app)/analyze/deal-analyzer-form.tsx` returns `MobileToolShell` only when `isMobile` is true) can show the **desktop layout on first paint** and then swap after hydration, which is heavier than the documented “one-frame” expectation for CSS-only `md:hidden` shells (`docs/qa/mobile-shell-verification.md`). Risk: jarring layout shift on `/analyze` and similar flows (maps to **A3**).

### Low

- **Secondary controls below ~44×44px** — e.g. chart “Show all / Show less” control in `app/app/(app)/dashboard/dashboard-charts.tsx` (`ExpandButton` uses `px-3 py-1.5 text-xs` without `min-h-[44px]`). Risk: harder taps on dense dashboards (maps to **D1**, **H2**).
- **`MobileModeSwitcher`** (`app/components/mobile-mode-switcher.tsx`) uses `py-2.5` without an explicit `min-h-[44px]`; likely borderline on small modes (maps to **D1**).
- **`MobileCollapsible`** chevron rotation uses `transition-transform` without the `app-respect-reduced-motion` pattern used elsewhere (maps to **J3**).

## Evidence reviewed

| Area | Paths / artifacts |
|------|-------------------|
| Shell & primitives | `app/components/mobile-tool-shell.tsx`, `mobile-tool-shell.test.tsx`, `mobile-bottom-nav.tsx`, `mobile-bottom-nav.test.tsx`, `mobile-collapsible.tsx`, `mobile-mode-switcher.tsx`, `mobile-stat-strip.tsx`, `mobile-context-bar.tsx` |
| Layout & nav | `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx` |
| Hooks | `app/lib/use-is-mobile.ts` |
| Tool surfaces (samples) | `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/refinance/refinance-workspace.tsx`, `app/components/marketing/public-calculator.tsx`, `app/app/(app)/properties/[id]/projections-tab-content.tsx` (grep inventory), `app/app/(app)/properties/add-property-wizard.tsx` (grep inventory) |
| Dashboard / charts | `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/dashboard/page.tsx` |
| Property IA | `app/app/(app)/properties/[id]/property-detail-tabs.tsx`, `page.tsx` |
| Styling | `app/app/globals.css` (safe-area, `prefers-reduced-motion`) |
| QA / process | `docs/qa/mobile-experience-audit.md`, `docs/qa/mobile-shell-verification.md`, `docs/process/audit-report-template.md` |
| Automated | `npm run test -- --run` in `app/` (2026-04-09): **all passed** |

**Limits of this pass:** No DevTools responsive sweep at 320 / 375 / 390 / 430 / 768px; no Lighthouse mobile; no iOS/Android device session; no Clerk modal clipping check at 320px.

## Risk & impact assessment

Unresolved **medium** items mainly affect **accessibility and perceived quality** on phones—not core math or persistence (covered elsewhere). Exposure is **all mobile web users** using keyboard/switch access or assistive tech, and **first-load** users on `useIsMobile`-branched pages. Likelihood is **moderate** for focus issues (smaller audience than touch-only) and **moderate** for hydration swap on heavy forms.

## Recommendations (prioritized)

1. **Manually run the viewport matrix** from [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §2 on priority routes (public + app inventory §5), plus one real device, and update this report or tasks with any new Fail rows.
2. **Improve mobile drawer a11y:** add focus trap while `drawerOpen`, restore focus to the menu button on close, and ensure `aria-hidden` or `inert` on the main column while the dialog is open (align with **C1** / **J1**).
3. **Normalize touch targets** on dashboard chart chrome (`ExpandButton`, and optionally `MobileModeSwitcher`) to at least ~44px min height where feasible.
4. **Revisit `useIsMobile()` vs CSS-only hiding** for the heaviest tools if hydration swap generates support noise; prefer `md:hidden` duplication only where product accepts the DOM cost, or skeletons that match mobile chrome.

## Criteria checklist (Section 4)

Legend: **Pass** / **Fail** / **N/A** / **Pending** (manual not done this run). Severity on **Fail** only.

### A. Responsive layout and breakpoints

| ID | Result | Notes |
|----|--------|--------|
| A1 | Pending | Primary column overflow not exercised in browser at 320–430px. |
| A2 | Pass | Consistent `md:hidden` / `hidden md:flex` split in app shell and shell components. |
| A3 | Pass | `useSyncExternalStore` + server snapshot `false` in `use-is-mobile.ts`; see Medium finding for branch-render swap. |
| A4 | Pending | Safe-area CSS present (`app-safe-area-top`, main `pb`/`pt` with `env(safe-area-inset-*)`); not verified on notched hardware. |

### B. Mobile shells and dense tools

| ID | Result | Notes |
|----|--------|--------|
| B1 | Pass | `MobileToolShell` implements context/header, summary strip, modes, footer; consumers include analyzer, public calculator, marketing calculators, refinance, wizard, projections (inventory per `mobile-shell-verification.md`). |
| B2 | Pending | Context density / overlap not visually verified. |
| B3 | Pending | `MobileCollapsible` scroll behavior not exercised in browser. |
| B4 | Pending | Intentional duplicate metrics not reviewed per surface. |

### C. Navigation and IA

| ID | Result | Notes |
|----|--------|--------|
| C1 | Fail | Drawer: focus trap and close focus return not implemented — **Medium**. |
| C2 | Pass | Bottom nav: Dashboard, Properties, Analyze + “More” → `open-mobile-menu` → `AppNav` with `onOpenMobileMenu` in drawer (`app-nav.tsx`, `mobile-bottom-nav.tsx`). |
| C3 | Pass | `property-detail-tabs.tsx` reads `tab` from `useSearchParams()`. |
| C4 | Pending | Back / unsaved state not systematically tested. |

### D. Touch targets and gestures

| ID | Result | Notes |
|----|--------|--------|
| D1 | Fail | Some controls under ~44px (e.g. `ExpandButton` in `dashboard-charts.tsx`); mode switcher borderline — **Low**. |
| D2 | Pending | Mis-tap spacing not systematically reviewed. |
| D3 | Pending | Chart scroll capture not tested. |

### E. Forms and inputs

| ID | Result | Notes |
|----|--------|--------|
| E1 | Pending | Real-device keyboard types not verified. |
| E2 | Pending | Autocomplete coverage spot-checked only (e.g. ZIP on analyzer). |
| E3 | Pending | Native `<select>` on device not verified. |
| E4 | Pending | Validation visibility not systematically tested. |

### F. Typography, copy, and density

| ID | Result | Notes |
|----|--------|--------|
| F1 | Pending | 320px readability not verified. |
| F2 | N/A | Metric label policy cross-check deferred to dedicated math/policy audits. |
| F3 | Pending | Abbreviations / chips not audited exhaustively. |

### G. Visual design and consistency

| ID | Result | Notes |
|----|--------|--------|
| G1 | Pending | Full token compliance vs `design-spec.md` not audited line-by-line. |
| G2 | Pending | Async empty/error states not sampled on all mobile views. |
| G3 | Pending | Icon+text wrap not systematically reviewed. |

### H. Charts and data visualization

| ID | Result | Notes |
|----|--------|--------|
| H1 | Pending | Legibility at mobile heights not verified. |
| H2 | Fail | Small expand control — **Low** (tooltip/overflow not tested). |
| H3 | Pending | Legends on mobile not verified. |

### I. Performance and perceived performance

| ID | Result | Notes |
|----|--------|--------|
| I1 | Pending | No Lighthouse mobile / throttled run. |
| I2 | Pending | Long-form scroll jank not assessed. |
| I3 | Pending | Large lists not stress-tested in session. |

### J. Accessibility (mobile-relevant)

| ID | Result | Notes |
|----|--------|--------|
| J1 | Fail | Drawer focus behavior — same as **C1** — **Medium**. |
| J2 | Pending | Contrast spot-check not run. |
| J3 | Fail | `MobileCollapsible` chevron animation without `app-respect-reduced-motion` — **Low**. |

### K. Authentication, billing, and plan limits

| ID | Result | Notes |
|----|--------|--------|
| K1 | Pending | Clerk at 320px not verified. |
| K2 | Pending | Pricing mobile scan not verified (`pricing` page has `md:hidden` sections — code only). |
| K3 | Pending | Plan limits / upgrade paths not exercised on device. |

### L. Security and privacy (mobile context)

| ID | Result | Notes |
|----|--------|--------|
| L1 | Pending | Keyboard overlap / sensitive fields not reviewed. |
| L2 | Pending | Session on shared device not tested. |

### M. Cross-surface consistency

| ID | Result | Notes |
|----|--------|--------|
| M1 | N/A | Semantic parity best confirmed in math/business audits. |
| M2 | N/A | Same. |
| M3 | N/A | Same. |

### N. Desktop non-regression

| ID | Result | Notes |
|----|--------|--------|
| N1 | Pass | Desktop sidebar `hidden md:flex`; mobile chrome `md:hidden`. |
| N2 | Pass | Mobile shells are additive/hidden at `md` via component or layout split; no evidence of desktop control deletion in files reviewed. |

### O. Automated coverage

| ID | Result | Notes |
|----|--------|--------|
| O1 | Pass | `npm run test -- --run`: 67 files, 460 tests passed (includes `MobileToolShell` / `MobileBottomNav`). |
| O2 | Pass | No `lib/` math changes in scope; mobile presentation separated in components. |

### P. Marketing and public pages

| ID | Result | Notes |
|----|--------|--------|
| P1 | Pending | Landing / calculator scannability at 320px not visually verified (code shows widespread `min-h-[44px]` on homepage CTAs). |
| P2 | Pending | SEO vs interaction hiding not audited. |

## Task candidates (optional)

- [ ] Manual viewport matrix + one real device: record Pass/Fail for all **Pending** rows above; attach screenshots for any **Fail**.
- [ ] Implement focus trap + focus return for `#app-mobile-nav-drawer` in `app-layout-client.tsx`.
- [ ] Add `min-h-[44px]` (or padding) to `ExpandButton` in `dashboard-charts.tsx` and review `MobileModeSwitcher` hit areas.
- [ ] Apply `app-respect-reduced-motion` to `MobileCollapsible` chevron transition (or gate animation on `prefers-reduced-motion`).
- [ ] Evaluate reducing hydration layout swap on `/analyze` (and similar) via CSS-first mobile/desktop duplication or loading skeleton.

## Re-test checklist

- [ ] Verify drawer keyboard/screen-reader flow after any focus-trap change
- [ ] Verify dashboard chart expand control at 375px width
- [ ] `npm run test` in `app/` after code changes
- [ ] Spot-check `/analyze` first paint on throttled mobile emulation

## Next trigger and cadence

- **Trigger:** Monthly per [`docs/audits/README.md`](../README.md), or after mobile shell / `md:hidden` / touch-target refactors.
- **Recommended next run:** After implementing focus-target fixes, or before next major release—include mandatory DevTools matrix + one device from criteria §2.

---

*Traceability: criteria source [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) (last updated 2026-03-30).*
