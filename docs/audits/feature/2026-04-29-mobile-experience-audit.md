# Mobile experience audit — 2026-04-29

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells).  
**Criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Template:** [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)

## Executive summary

- **Overall:** Mobile architecture is coherent: single `md` breakpoint, `viewportFit: cover`, safe-area-aware main padding and bottom nav, and `MobileToolShell` used across analyzers, calculators, property tools (projections/mortgage wizard/refinance), and modeling via `ProjectionsTabContent`. Primary gaps are **accessibility/focus**, **touch-target sizing on secondary controls**, and the **documented SSR → client mobile layout swap** (`useIsMobile`).
- **Top risks:** Drawer focus behavior (WCAG-style usability), sub-44px tap targets on mode switchers and property overflow menu, and unverified full-suite CI in this pass (API test timeouts locally).
- **Recommendation:** Treat **focus return on app drawer close** and **minimum touch heights** as the first mobile polish batch; keep the `useIsMobile` SSR tradeoff explicit in any perf/CLS work.

## Severity-ranked findings

### Critical

- None identified in this **static review** pass (no evidence of wrong financial math or data-loss paths unique to mobile).

### High

- **App navigation drawer: focus not restored to the menu control on close** — Keyboard and screen-reader users lose predictable focus after dismissing the slide-out; opening **does** move focus to the first focusable item inside the panel. The marketing `landing-nav` pattern (`menuButtonRef` + `focus()` on close) is **not** mirrored in the authenticated shell. — *Impact:* Fails checklist **C1** / **J1** expectations for focus management. — *Evidence:* `app/app/(app)/app-layout-client.tsx` (`closeDrawer` is `setDrawerOpen(false)` only; hamburger `button` has no `ref`); contrast `app/components/landing-nav.tsx` (ref + focus on close).

- **`npm run test` not green in this audit environment** — Ten API route tests timed out on 401/unauthenticated cases (~5s each), while **mobile-focused** tests passed when run in isolation. — *Impact:* Checklist **O1** cannot be marked fully **Pass** from this run; CI health should be confirmed on the canonical pipeline. — *Evidence:* Full suite: 10 failed / 72 passed files; `vitest run components/mobile-tool-shell.test.tsx components/mobile-bottom-nav.test.tsx`: all passed.

### Medium

- **`useIsMobile` SSR snapshot always `false` → first paint uses desktop branch, then swaps to mobile** — Known tradeoff (documented in `.cursor/skills/veld-mobile/SKILL.md`); can present as layout flicker or extra work on hydration. — *Impact:* Checklist **A3** is not a clean **Pass** without product disclaimer or follow-up. — *Evidence:* `app/lib/use-is-mobile.ts` (`getServerSnapshot: () => false`).

- **Touch targets below ~44×44px on several mobile controls** — `MobileModeSwitcher` segment buttons use `px-3 py-2.5` without `min-h-[44px]`; property detail overflow trigger uses `size-10` (40px). `AppNav` drawer rows use `py-2` with `text-sm` (row height likely under 44px). — *Impact:* **D1** / **D2** friction for primary-adjacent and overflow actions. — *Evidence:* `app/components/mobile-mode-switcher.tsx`; `app/app/(app)/properties/[id]/property-detail-content.tsx` (`BreadcrumbActions` ~`size-10`); `app/app/(app)/app-nav.tsx` (`py-2`).

- **Workspace reachability from bottom nav** — Core tabs cover Dashboard / Properties / Analyze; **Modeling**, **Mortgage**, **Refinance**, **Plans**, **Settings** require **More → drawer** (≥2 taps from home). Acceptable by design but fails strict reading of **C2** “≤2 taps” for those destinations. — *Impact:* IA friction for power users on phone. — *Evidence:* `app/components/mobile-bottom-nav.tsx` vs `app/app/(app)/app-nav.tsx` tool list.

### Low

- **Backdrop uses `role="button"` with `tabIndex={-1}`** — Acceptable for pointer dismiss; minor divergence from ideal “dialog” overlay patterns. — *Evidence:* `app/app/(app)/app-layout-client.tsx`.

- **Analyze icon vs. label** — Bottom nav uses `Calculator` for “Analyze” while sidebar uses `ClipboardList` for “Analyze deal”; small cross-surface inconsistency (**M3**-adjacent, chrome only). — *Evidence:* `app/components/mobile-bottom-nav.tsx` vs `app/app/(app)/app-nav.tsx`.

## Criteria checklist (Section 4 — [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md))

**Legend:** Pass / Fail / N/A / Partial — “Partial” = code review OK but real-device / full CI not confirmed this run.

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| A1 | No unintended horizontal scroll (320–430) | Partial | Not viewport-tested in browser this run |
| A2 | 767 vs 768 predictable | Pass | `md:hidden` / `hidden md:*` patterns consistent in shell |
| A3 | Hydration / no persistent errors | Partial | `useIsMobile` SSR false → mobile swap; no runtime verification |
| A4 | Safe areas | Pass | `viewportFit: cover`; `env(safe-area-inset-*)` on main + bottom nav + tool footer |
| B1 | MobileToolShell surfaces | Partial | Deal analyzer, calculators, modeling (via projections), mortgage tab, refinance, add wizard — **Pass** on inventory; footer presence varies by surface |
| B2 | Context blocks usable | Partial | `MobileContextBar` min-height 44; property selectors vary by page |
| B3 | MobileCollapsible | Partial | Used in projections mobile surface; scroll traps not exercised |
| B4 | Card rhythm / duplication | Partial | Not systematically compared rail vs body |
| C1 | Nav drawer focus / overlay | Partial | Open focus OK; **close focus return Fail** |
| C2 | Workspace ≤2 taps | Partial | Many tools via **More** only |
| C3 | Deep links | N/A | Not exercised |
| C4 | Back / unsaved state | N/A | Not exercised |
| D1 | ~44px targets | Partial | Bottom nav **Pass**; mode switcher / overflow / drawer rows **gap** |
| D2 | Spacing mis-taps | Partial | Not device-tested |
| D3 | Scroll traps | Partial | Long tool forms present; not exercised |
| E1–E4 | Forms | Partial | `text-base` used in sampled projection inputs; not device keyboard test |
| F1–F3 | Typography / labels | Partial | Policy alignment not spot-checked per metric |
| G1–G3 | Visual consistency | Partial | Tokens appear consistent; no screenshot pass |
| H1–H3 | Charts | Partial | Recharts used; mobile legibility not verified |
| I1–I3 | Performance | N/A | No Lighthouse / device perf this run |
| J1 | Focus order | Partial | Drawer close gap |
| J2 | Contrast | N/A | Not measured |
| J3 | Motion | Partial | `app-respect-reduced-motion` present on some surfaces |
| K1–K3 | Auth / billing | N/A | Clerk modals not exercised at 320px |
| L1–L2 | Security / privacy | N/A | Not in scope for static pass |
| M1–M3 | Cross-surface consistency | Partial | Icon mismatch **Low** |
| N1–N2 | Desktop non-regression | Partial | Shell uses `md:hidden` for mobile-only blocks — intent aligns |
| O1 | Tests green + MobileToolShell tests | Partial | Mobile unit tests **Pass**; full suite **Fail** (timeouts) |
| O2 | lib/ math | N/A | Presentation-only assumption |
| P1–P2 | Marketing mobile | Partial | `MobileToolShell` on public calculators; landing not deep-reviewed |

## Evidence reviewed

- **Shell / layout:** `app/app/(app)/app-layout-client.tsx`, `app/components/mobile-bottom-nav.tsx`, `app/lib/use-is-mobile.ts`, `app/layout.tsx` (viewport)
- **Mobile tool shell:** `app/components/mobile-tool-shell.tsx`, `app/components/mobile-mode-switcher.tsx`, `app/components/mobile-context-bar.tsx`, `app/components/mobile-collapsible.tsx`
- **Representative consumers:** `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/properties/[id]/projections-tab-content.tsx`, `app/app/(app)/properties/[id]/property-detail-content.tsx`, marketing calculators under `app/components/marketing/*-calculator.tsx`, `public-calculator.tsx`
- **Nav IA:** `app/app/(app)/app-nav.tsx`
- **Reference pattern:** `app/components/landing-nav.tsx`
- **Tests:** `app/components/mobile-tool-shell.test.tsx`, `app/components/mobile-bottom-nav.test.tsx`; full `npm run test` (see findings)

**Limits:** No execution on physical iOS/Android; no systematic 320/375/390/430/768 visual matrix; no Lighthouse mobile or VoicerOver/TalkBack session this run.

## Risk & impact assessment

- **Unresolved High issues** mainly hurt **accessibility compliance and keyboard users** on the most frequent chrome interaction (open/close menu), and **reduce confidence in O1** if CI mirrors local timeouts.
- **Medium issues** affect **comfort and error rate** on dense tools (mode switching, overflow menus) but are unlikely to block core read-only flows.
- **Exposure:** All authenticated mobile users hit the drawer; frequent modelers hit mode switchers and property overflow menus.

## Recommendations (prioritized)

1. **Mirror `landing-nav` focus return** in `app-layout-client.tsx`: `useRef` on the hamburger, restore focus in `closeDrawer` (and Escape / swipe-close paths).
2. **Normalize touch targets:** `min-h-[44px]` (and `min-w` where segment buttons are narrow) on `MobileModeSwitcher`, property **actions** trigger, and optionally `AppNav` row buttons/links.
3. **Confirm CI:** Investigate API route test timeouts so **O1** is trustworthy; keep running `MobileToolShell` / `MobileBottomNav` tests on every change.

## Task candidates

- [ ] Add hamburger `ref` + focus restore when app mobile nav drawer closes (Escape, backdrop, swipe, nav link).
- [ ] Audit and fix sub-44px interactive controls: `MobileModeSwitcher`, property detail overflow menu, drawer nav rows.
- [ ] Document or ticket the `useIsMobile` SSR flicker tradeoff (accept vs `cookies`/`user-agent` hint vs CSS-only split).
- [ ] Fix or isolate flaky timeout failures in API route Vitest files so `npm run test` is reliable locally/CI.

## Re-test checklist

- [ ] Keyboard: open drawer → Tab through → close → focus returns to **Open menu** control.
- [ ] Touch: verify 44px targets on mode switcher and property actions (iOS/Android).
- [ ] Regression: desktop `≥768px` layouts unchanged for sampled routes.
- [ ] `npm run test` green repo-wide after CI/timeout fixes; `mobile-tool-shell` + `mobile-bottom-nav` still pass.

## Next trigger and cadence

- **Trigger:** After large UI refactors, navigation changes, or mobile bug reports; pre-release for landlord-facing tools.
- **Next window:** Align with quarterly UX audit or next minor release after drawer/touch-target fixes.
