# Mobile experience audit — 2026-04-27

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells).  
**Criteria (canonical):** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Report template:** [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)

## Executive summary

- Mobile architecture remains **coherent and aligned with internal docs**: `MobileToolShell` (`app/components/mobile-tool-shell.tsx`) provides eyebrow/title, optional context, `MobileStatStrip` summary, mode switcher, and footer with `env(safe-area-inset-bottom)`; `useIsMobile()` uses `useSyncExternalStore` and `(max-width: 767px)` (`app/lib/use-is-mobile.ts`); app chrome is fixed header + slide-out nav + `MobileBottomNav` with `min-h-[44px] min-w-[44px]` links (`app/components/mobile-bottom-nav.tsx`).
- **Automated coverage:** `npm run test` in `app/` on 2026-04-27: **67 test files, 466 tests passed**, including `MobileToolShell` and `MobileBottomNav` unit tests (criteria **O1**).
- This lane pass is **code review, file inventory, and unit-test verification** only. The criteria doc requires a **viewport matrix (320–768px)** and **at least one real device** ([`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §2); those were **not executed** here. Rows below use **Pending** for anything that depends on visual or hardware verification.
- **Top risks to close in a manual follow-up:** mobile nav drawer **focus management** (trap + return focus on close), and **first-paint / hydration** behavior where components branch on `useIsMobile()` instead of CSS-only `md:hidden` (e.g. Deal Analyzer). Secondary: **sub-44px** controls on dense dashboard and mode-switcher UI.

## Severity-ranked findings

### Critical

- None identified from static review and unit tests (no P0 financial, data-loss, or save-path issues observed in the paths reviewed).

### High

- None **confirmed** without browser or device runs (horizontal overflow, chart legibility, Clerk clipping, and similar require the viewport matrix from criteria §2).

### Medium

- **Mobile drawer: incomplete focus management** — In `app/app/(app)/app-layout-client.tsx`, opening the drawer moves focus to the first focusable element inside the panel and locks `body` overflow; there is **no focus trap** within the dialog and **no restore of focus** to the hamburger control on close. Keyboard and screen-reader users can tab into obscured main content or lose context. Maps to criteria **C1** and **J1**; evidence: `useEffect` focus on `drawerPanelRef` (lines ~150–159), `Escape` handler (~141–147), no `inert` / `aria-hidden` on the main column while open.
- **Hydration layout swap on `useIsMobile()`-gated UIs** — e.g. `app/app/(app)/analyze/deal-analyzer-form.tsx` renders `MobileToolShell` only when `isMobile` is true; server snapshot for `useIsMobile()` is `false` (`app/lib/use-is-mobile.ts`). This can show **desktop structure first**, then switch after hydration—more jarring than CSS-only `md:hidden` shells. Maps to **A3** and [`docs/qa/mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) SSR note. Similar pattern exists in other large forms that branch on `isMobile` (e.g. property flows).

### Low

- **Chart “Show all / Show less” control** — `ExpandButton` in `app/app/(app)/dashboard/dashboard-charts.tsx` uses `px-3 py-1.5 text-xs` without `min-h-[44px]`. Risk: undersized tap target on mobile dashboards. Maps to **D1**, **H2**.
- **`MobileModeSwitcher`** (`app/components/mobile-mode-switcher.tsx`) uses `py-2.5` without explicit `min-h-[44px]`; may be borderline for 44×44pt guidance. Maps to **D1**.
- **`MobileCollapsible`** (`app/components/mobile-collapsible.tsx`) chevron uses `transition-transform` without the `app-respect-reduced-motion` class used elsewhere in the app shell. Maps to **J3**.

## Evidence reviewed

| Area | Paths / artifacts |
|------|-------------------|
| Shell & primitives | `app/components/mobile-tool-shell.tsx`, `mobile-tool-shell.test.tsx`, `mobile-bottom-nav.tsx`, `mobile-bottom-nav.test.tsx`, `mobile-collapsible.tsx`, `mobile-mode-switcher.tsx`, `mobile-stat-strip.tsx`, `mobile-context-bar.tsx` |
| Layout & nav | `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx` |
| Hooks | `app/lib/use-is-mobile.ts` |
| Tool surfaces (inventory) | `app/app/(app)/analyze/deal-analyzer-form.tsx`; `app/app/(app)/properties/[id]/projections-tab-content.tsx`, `mortgage-tab-content.tsx`; `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx` (dynamic import + `ssr: false` loading states); `app/components/marketing/*calculator*.tsx`, `public-calculator.tsx`; `app/app/(app)/refinance/refinance-workspace.tsx`; `app/app/(app)/properties/add-property-wizard.tsx` |
| Property IA | `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (`tab` / redirects for `mortgage` and `projections`) |
| Dashboard / charts | `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/dashboard/page.tsx` |
| Styling | `app/app/globals.css` (`.app-safe-area-top`, `prefers-reduced-motion` for `.app-respect-reduced-motion`) |
| QA / process | `docs/qa/mobile-experience-audit.md`, `docs/qa/mobile-shell-verification.md` |
| Automated | `npm run test` in `app/` (2026-04-27): **67 files, 466 tests passed** |

**Limits of this pass:** No DevTools responsive sweep at 320 / 375 / 390 / 430 / 768px; no Lighthouse mobile; no iOS/Android device session; no Clerk sign-in modal clipping check at 320px; no live verification of `native` select pickers or software keyboards.

## Risk & impact assessment

**Medium** findings affect **accessibility** (keyboard, screen readers) and **perceived quality** (layout flash on first load for touch users on analyzer-like flows). They do not invalidate **math or persistence** guarantees covered by `lib/` tests. Exposure: mobile web users broadly for perceived jank; smaller but important audience for focus issues. **Low** items affect convenience on dense tool UIs and motion-sensitive users.

## Recommendations (prioritized)

1. **Run the criteria §2 viewport matrix** on the §5 surface inventory (public + app routes), plus **at least one physical device**, and move **Pending** rows to Pass/Fail with screenshots where useful.
2. **Harden the mobile nav drawer for a11y:** focus trap while `drawerOpen`, return focus to the menu button on close, and consider `inert` (or equivalent) on the main content region when the drawer is open.
3. **Reduce hydration mismatch** on the heaviest tools: prefer CSS `md:hidden` / `hidden md:*` for shell visibility where acceptable, or mobile-shaped loading skeletons so first paint does not show the wrong layout.
4. **Normalize touch targets** for `ExpandButton` and, if needed, `MobileModeSwitcher` to meet ~44px minimum height/width where design allows.
5. **Apply `app-respect-reduced-motion`** to `MobileCollapsible` chevron transition (or gate on `prefers-reduced-motion`).

## Task candidates (optional)

- [ ] Manual viewport matrix + one real device: record Pass/Fail for **Pending** checklist rows; attach screenshots for any **Fail**.
- [ ] Implement focus trap + focus return for `#app-mobile-nav-drawer` in `app-layout-client.tsx`.
- [ ] Add `min-h-[44px]` (or padding) to `ExpandButton` in `dashboard-charts.tsx` and review `MobileModeSwitcher` hit areas.
- [ ] Apply `app-respect-reduced-motion` to `MobileCollapsible` chevron `transition` (or conditionally disable animation).
- [ ] Re-evaluate `useIsMobile()` vs CSS-only mobile/desktop presentation on `/analyze` and similar to reduce first-paint swap.

## Criteria checklist (Section 4)

**Legend:** **Pass** / **Fail** / **N/A** / **Pending** (manual or device not done this run). Severity on **Fail** only.

### A. Responsive layout and breakpoints

| ID | Result | Notes |
|----|--------|--------|
| A1 | Pending | Primary column overflow at 320–430px not exercised in browser. |
| A2 | Pass | App shell: `md:hidden` mobile chrome vs `hidden md:flex` desktop sidebar in `app-layout-client.tsx`. |
| A3 | Pass | `useSyncExternalStore` + server snapshot `false` in `use-is-mobile.ts`; see **Medium** finding for branch-render swap on some routes. |
| A4 | Pending | Safe-area CSS present; not verified on notched hardware. |

### B. Mobile shells and dense tools

| ID | Result | Notes |
|----|--------|--------|
| B1 | Pass | `MobileToolShell` contract; consumers per [`docs/qa/mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) inventory (analyzer, modeling/mortgage tab content, calculators, refinance, wizard, public calculator, etc.). |
| B2 | Pending | Context overlap / tap density not visually verified. |
| B3 | Pending | `MobileCollapsible` overflow not exercised in browser. |
| B4 | Pending | Duplicate rail vs body metrics not reviewed per surface. |

### C. Navigation and IA

| ID | Result | Notes |
|----|--------|--------|
| C1 | Fail | No focus trap / focus return on mobile drawer — **Medium** (see findings). |
| C2 | Pass | `MobileBottomNav` + `open-mobile-menu` → `AppNav` in drawer (`app-nav.tsx` listens for custom event). |
| C3 | Pass | `property-detail-tabs.tsx`: `useSearchParams`, `tab=mortgage` / `tab=projections` redirect to dedicated routes. |
| C4 | Pending | Back / unsaved draft behavior not systematically tested. |

### D. Touch targets and gestures

| ID | Result | Notes |
|----|--------|--------|
| D1 | Fail | Some controls under ~44px (`ExpandButton`, borderline `MobileModeSwitcher`) — **Low**. Bottom nav items use `min-h-[44px] min-w-[44px]`. |
| D2 | Pending | Mis-tap spacing not systematically reviewed. |
| D3 | Pending | Chart / nested scroll not tested on device. |

### E. Forms and inputs

| ID | Result | Notes |
|----|--------|--------|
| E1 | Pending | Real-device keyboard types not verified. `deal-analyzer-form.tsx` uses `inputMode="numeric"` in multiple places (code review). |
| E2 | Pending | Autocomplete coverage not exhaustively reviewed. |
| E3 | Pending | Native `<select>` in `MobileContextBar` property pickers not verified on device. |
| E4 | Pending | Validation visibility not systematically tested. |

### F. Typography, copy, and density

| ID | Result | Notes |
|----|--------|--------|
| F1 | Pending | 320px readability not verified. |
| F2 | N/A | Metric label policy: defer to `analytics-math-policy` / dedicated audits. |
| F3 | Pending | Mobile abbreviations / chips not fully audited. |

### G. Visual design and consistency

| ID | Result | Notes |
|----|--------|--------|
| G1 | Pending | Line-by-line token check vs `design-spec.md` not done. |
| G2 | Pending | Async empty/error states not sampled for all mobile views. |
| G3 | Pending | Icon+text wrap not systematically reviewed. |

### H. Charts and data visualization

| ID | Result | Notes |
|----|--------|--------|
| H1 | Pending | Legibility at mobile chart heights not verified. |
| H2 | Fail | Small expand control in `dashboard-charts.tsx` — **Low**; tooltip overflow not tested. |
| H3 | Pending | Legends on small screens not verified. |

### I. Performance and perceived performance

| ID | Result | Notes |
|----|--------|--------|
| I1 | Pending | No Lighthouse mobile / throttled run. |
| I2 | Pending | Modeling/mortgage workspaces use dynamic `ssr: false` — loading placeholders present; jank not measured. |
| I3 | Pending | Property list scale not stress-tested in session. |

### J. Accessibility (mobile-relevant)

| ID | Result | Notes |
|----|--------|--------|
| J1 | Fail | Same as C1 — **Medium**. |
| J2 | Pending | Contrast not spot-checked. |
| J3 | Fail | `MobileCollapsible` chevron without `app-respect-reduced-motion` — **Low**. |

### K. Authentication, billing, and plan limits

| ID | Result | Notes |
|----|--------|--------|
| K1 | Pending | Clerk at 320px not verified. |
| K2 | Pending | `/pricing` mobile layout not visually verified. |
| K3 | Pending | Plan limits / upgrade paths not exercised on device. |

### L. Security and privacy (mobile context)

| ID | Result | Notes |
|----|--------|--------|
| L1 | Pending | Keyboard overlap / sensitive fields not reviewed. |
| L2 | Pending | Session on shared device not tested. |

### M. Cross-surface consistency

| ID | Result | Notes |
|----|--------|--------|
| M1 | N/A | Metric semantics: confirm in policy / business audits. |
| M2 | N/A | |
| M3 | N/A | |

### N. Desktop non-regression

| ID | Result | Notes |
|----|--------|--------|
| N1 | Pass | Desktop vs mobile layout split as above. |
| N2 | Pass | No evidence in reviewed files of desktop feature removal; mobile uses progressive disclosure / `md:hidden` patterns. |

### O. Automated coverage

| ID | Result | Notes |
|----|--------|--------|
| O1 | Pass | `npm run test`: 67 files, 466 tests passed (includes `MobileToolShell` / `MobileBottomNav`). |
| O2 | Pass | Math remains in `lib/`; mobile UI is presentation layer in components reviewed. |

### P. Marketing and public pages

| ID | Result | Notes |
|----|--------|--------|
| P1 | Pending | Landing / calculator scannability at 320px not visually verified. |
| P2 | Pending | SEO vs interaction gating not audited. |

## Re-test checklist

- [ ] After drawer a11y changes: keyboard tab order and screen reader on open/close
- [ ] After touch-target changes: verify dashboard charts at 375px
- [ ] `npm run check` in `app/` when implementation work ships
- [ ] Spot-check `/analyze` first paint on mobile emulation (throttle CPU/network optional)

## Next trigger and cadence

- **Trigger:** Before major release, after large UI refactors affecting `md:` breakpoints, mobile shell, or touch targets; or per [`docs/audits/README.md`](../README.md) cadence if listed.
- **Recommended next run:** After addressing focus-trap / hydration medium items, or pre-release with mandatory DevTools matrix + one real device (criteria §2).

---

*Traceability: criteria source [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) (baseline 2026-03-30).*
