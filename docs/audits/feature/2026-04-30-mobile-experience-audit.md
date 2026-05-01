# Mobile experience audit — 2026-04-30

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells).  
**Criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Template:** [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)

## Executive summary

- **Overall:** Mobile shell patterns remain sound: `viewportFit: cover`, safe-area padding on main content and bottom nav, `MobileToolShell` + `MobileBottomNav`, and `md` as the single breakpoint. Automated confidence improved vs the prior audit: **`npm run test` completed green** (85 files / 618 tests) including `MobileToolShell` and `MobileBottomNav` unit tests.
- **Top risks:** **Drawer focus management on close** still leaves keyboard and screen-reader users without focus return to the “Open menu” control; **secondary touch targets** (mode switcher segments, property overflow trigger, dense drawer rows) remain below the ~44×44px comfort bar in code.
- **Recommendation:** Prioritize **focus restoration** on drawer dismiss (all close paths) and a **targeted touch-target pass** on `MobileModeSwitcher` and property chrome; treat `useIsMobile` SSR snapshot behavior as an explicit product/perf tradeoff if layout flicker is reported.

## Severity-ranked findings

### Critical

- None identified in this **static review + automated test** pass (no evidence of wrong financial math, data-loss paths, or security issues unique to mobile).

### High

- **App navigation drawer: focus not restored to the menu button on close** — On open, focus moves to the first focusable item inside the panel (`useEffect` + `querySelector` + `focus()`). On close (`closeDrawer`, Escape, backdrop, swipe, route change), there is **no `ref` on the hamburger** and **no `focus()`** back to “Open menu.” — *Impact:* Fails checklist **C1** / **J1** for predictable focus. — *Evidence:* `app/app/(app)/app-layout-client.tsx` (`closeDrawer` is `setDrawerOpen(false)` only; header button ~lines 190–197 has no ref; contrast opening focus ~lines 150–159).

### Medium

- **`useIsMobile` SSR snapshot always `false` → client may swap from desktop branch to mobile after hydration** — `getServerSnapshot` returns `false`. — *Impact:* **A3** / layout stability not a clean Pass without real-device verification or an intentional product note. — *Evidence:* `app/lib/use-is-mobile.ts`.

- **Touch targets below ~44×44px on several mobile controls** — `MobileModeSwitcher` buttons use `px-3 py-2.5` without `min-h-[44px]`; property detail overflow uses `size-10` (40px); `AppNav` rows use `py-2` with `text-sm` (likely under 44px row height). Bottom nav explicitly uses `min-h-[44px] min-w-[44px]` — good contrast. — *Impact:* **D1** / **D2** friction on dense tools. — *Evidence:* `app/components/mobile-mode-switcher.tsx`; `app/app/(app)/properties/[id]/property-detail-content.tsx` (`BreadcrumbActions`); `app/app/(app)/app-nav.tsx` (`NavGroup` classes).

- **Workspace reachability (strict reading of C2)** — Bottom nav covers Dashboard / Properties / Analyze; **Modeling**, **Mortgage**, **Refinance**, **Plans**, **Settings** require **More → drawer** (≥2 taps). — *Impact:* IA friction for power users; acceptable if intentional. — *Evidence:* `app/components/mobile-bottom-nav.tsx`; `app/app/(app)/app-nav.tsx`.

### Low

- **Backdrop uses `role="button"` with `tabIndex={-1}`** — Reasonable for pointer dismiss; minor divergence from ideal dialog overlay patterns. — *Evidence:* `app/app/(app)/app-layout-client.tsx`.

- **Analyze icon vs. label inconsistency** — Bottom nav uses `Calculator` for “Analyze” while sidebar uses `ClipboardList` for “Analyze deal.” — *Impact:* Chrome-only **M** consistency. — *Evidence:* `app/components/mobile-bottom-nav.tsx` vs `app/app/(app)/app-nav.tsx`.

## Criteria checklist (Section 4 — [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md))

**Legend:** Pass / Fail / N/A / Partial — “Partial” = code review or partial automation; viewport matrix and real-device checks not executed this run.

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| A1 | No unintended horizontal scroll (320–430) | Partial | Not viewport-tested in browser this run |
| A2 | 767 vs 768 predictable | Pass | `md:hidden` / `hidden md:*` patterns in shell |
| A3 | Hydration / no persistent errors | Partial | `useIsMobile` SSR `false` → possible swap; no runtime session |
| A4 | Safe areas | Pass | `viewportFit: cover`; `env(safe-area-inset-*)` on main + bottom nav |
| B1 | MobileToolShell surfaces | Partial | Inventory aligns with prior audits; footers vary by surface |
| B2 | Context blocks usable | Partial | `MobileContextBar` `min-h-[44px]`; other pages vary |
| B3 | MobileCollapsible | Partial | Not exercised |
| B4 | Card rhythm / duplication | Partial | Not systematically compared |
| C1 | Nav drawer focus / overlay | Partial | Open focus Pass; **close focus return Fail** |
| C2 | Workspace ≤2 taps | Partial | Many tools via **More** only |
| C3 | Deep links | N/A | Not exercised |
| C4 | Back / unsaved state | N/A | Not exercised |
| D1 | ~44px targets | Partial | Bottom nav Pass; mode switcher / overflow / drawer rows gap |
| D2 | Spacing mis-taps | Partial | Not device-tested |
| D3 | Scroll traps | Partial | Not exercised |
| E1–E4 | Forms | Partial | Not device keyboard test |
| F1–F3 | Typography / labels | Partial | No metric spot-check vs policy |
| G1–G3 | Visual consistency | Partial | Tokens appear consistent; no screenshot pass |
| H1–H3 | Charts | Partial | Not verified at mobile height |
| I1–I3 | Performance | N/A | No Lighthouse / device perf |
| J1 | Focus order | Partial | Drawer close gap |
| J2 | Contrast | N/A | Not measured |
| J3 | Motion | Partial | `app-respect-reduced-motion` used in shell |
| K1–K3 | Auth / billing | N/A | Clerk / pricing not exercised at 320px this run |
| L1–L2 | Security / privacy | N/A | Not in scope for this pass |
| M1–M3 | Cross-surface consistency | Partial | Icon mismatch Low |
| N1–N2 | Desktop non-regression | Partial | Code structure aligns with mobile-only `md:hidden` blocks |
| O1 | Tests green + MobileToolShell tests | **Pass** | `vitest run --run`: 85 files, 618 tests passed; mobile tests included |
| O2 | lib/ math | N/A | Presentation-only assumption |
| P1–P2 | Marketing mobile | Partial | Not deep-reviewed this run |

## Evidence reviewed

- **Shell / layout:** `app/app/(app)/app-layout-client.tsx`, `app/components/mobile-bottom-nav.tsx`, `app/lib/use-is-mobile.ts`, `app/app/layout.tsx` (`viewport`)
- **Mobile primitives:** `app/components/mobile-tool-shell.tsx`, `app/components/mobile-mode-switcher.tsx`, `app/components/mobile-context-bar.tsx`
- **Representative surfaces:** `app/app/(app)/app-nav.tsx`, `app/app/(app)/properties/[id]/property-detail-content.tsx`
- **Tests:** `npm run test -- --run` (full suite); scoped run `mobile-tool-shell.test.tsx`, `mobile-bottom-nav.test.tsx`

**Limits:** No systematic viewport matrix (320 / 375 / 390 / 430 / 768) in a browser; no physical iOS/Android session; no VoiceOver/TalkBack; no Lighthouse mobile.

## Risk & impact assessment

- **High:** Focus behavior affects **every authenticated mobile user** who uses the drawer with keyboard or assistive tech; fix is localized and low regression risk.
- **Medium:** Sub-44px targets elevate **mis-tap rate** on frequent controls (mode switching, overflow) but rarely block entire workflows.
- **Positive:** **O1** green locally reduces risk that mobile shell regressions slip past CI unnoticed (contrast with 2026-04-29 audit environment).

## Recommendations (prioritized)

1. **Restore focus to the “Open menu” control** when the mobile nav drawer closes (backdrop, Escape, swipe, nav link navigation, pathname-driven auto-close), mirroring the pattern in `app/components/landing-nav.tsx` where applicable.
2. **Normalize touch targets** on `MobileModeSwitcher` (`min-h-[44px]` / adequate `min-w` per segment), property overflow trigger, and optionally `AppNav` list rows in the drawer.
3. **Decide explicitly** whether to accept, document, or engineer around the `useIsMobile` SSR→client layout swap if CLS or user reports appear.

## Task candidates

- [ ] Add hamburger `ref` + focus restore when the app mobile nav drawer closes (all close paths).
- [ ] Audit and fix sub-44px interactive controls: `MobileModeSwitcher`, property detail overflow menu, drawer `AppNav` rows.
- [ ] Optional: document `useIsMobile` SSR tradeoff or explore CSS-first / hint-based narrowing to reduce first-paint mismatch.

## Re-test checklist

- [ ] Keyboard: open drawer → Tab through → close → focus returns to **Open menu**.
- [ ] Touch: verify ~44px targets on mode switcher and property actions on iOS/Android.
- [ ] Regression: desktop ≥768px layouts unchanged on sampled routes.
- [ ] `npm run test` remains green after changes; `mobile-tool-shell` + `mobile-bottom-nav` still pass.

## Next trigger and cadence

- **Trigger:** Large UI refactors, navigation changes, mobile bug reports, or pre-release for landlord tools.
- **Next window:** After drawer/focus and touch-target batch, or next quarterly mobile sweep; complete viewport matrix + one real device per QA doc §2 when schedules allow.
