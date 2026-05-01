# Mobile experience audit — 2026-05-01

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells).  
**Criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Template:** [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)

## Executive summary

- **Overall:** Patterns match the documented architecture: **`viewportFit: cover`** in `app/layout.tsx`, safe-area-aware main padding and **MobileBottomNav**, **`MobileToolShell`** with **`md:hidden`** root, **`useIsMobile`** at `(max-width: 767px)`, and **`md`** as the sole mobile/desktop split. **Dedicated mobile-component tests passed** (`mobile-tool-shell.test.tsx`, `mobile-bottom-nav.test.tsx`). A **full** `npm run test` from [`app/package.json`](../../../app/package.json) **did not complete green** on this runner (timeouts in several API route tests—environment or suite health; not mobile-specific).
- **Top risks:** **No focus return** to the “Open menu” control when the app nav drawer closes (**J1 / C1**). **Secondary controls** still sit **below ~44×44px** in several places (**D1**). **`useIsMobile`** SSR snapshot **`false`** implies a **post-hydration branch swap** on real phones (**A3**).
- **Recommendation:** Ship **drawer focus restoration** and a **narrow touch-target pass** (`MobileModeSwitcher`, overflow menus, dense `AppNav` rows). Re-run **full Vitest** in CI or a clean local env to confirm **O1**; refresh [`docs/qa/mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) inventory to list **refinance**, **add-property wizard**, and **marketing calculators** that now use `MobileToolShell`.

## Severity-ranked findings

QA rubric mapping: **P0** ≈ Critical, **P1** ≈ High, **P2** ≈ Medium, **P3** ≈ Low.

### Critical (P0)

- None identified in this **static code review** (no evidence of wrong financial display, data loss, or mobile-only security defects).

### High (P1)

- **App navigation drawer: focus not restored to the menu button on close** — `closeDrawer` only calls `setDrawerOpen(false)`; the hamburger has **no `ref`** and **no `focus()`** on dismiss. Opening **does** move focus to the first focusable item in the panel (`useEffect` on `drawerOpen` + `querySelector` + `focus()`). — *Impact:* Keyboard and screen-reader users lose predictable focus (**C1**, **J1**). — *Evidence:* [`app/app/(app)/app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx) (e.g. `closeDrawer` ~81; header button ~190–197; focus-into-panel effect ~150–159).

### Medium (P2)

- **`useIsMobile` always `false` on the server** — `getServerSnapshot` returns `false`, so the **desktop** branch can render first and **swap** after hydration on narrow viewports. — *Impact:* Possible layout flicker/CLS (**A3**); documented tradeoff in [`.cursor/skills/veld-mobile/SKILL.md`](../../../../.cursor/skills/veld-mobile/SKILL.md). — *Evidence:* [`app/lib/use-is-mobile.ts`](../../../app/lib/use-is-mobile.ts).

- **`MobileModeSwitcher` segment buttons under ~44px height** — `px-3 py-2.5 text-sm` with **no** `min-h-[44px]`. Heavy use from **`MobileToolShell`** when `modes` is set (e.g. deal analyzer Inputs/Results). — *Impact:* **D1** / **D2** on dense tools. — *Evidence:* [`app/components/mobile-mode-switcher.tsx`](../../../app/components/mobile-mode-switcher.tsx).

- **`AppNav` row links ~`py-2` + `text-sm`** — likely **below 44px** row hit area in the drawer. — *Impact:* **D1** on primary IA surface. — *Evidence:* [`app/app/(app)/app-nav.tsx`](../../../app/app/(app)/app-nav.tsx) (`NavGroup` base class ~78).

- **Property overflow / actions control `size-10` (40×40)** — under the stated **44×44** minimum when strict. — *Impact:* **D1** on property detail chrome. — *Evidence:* [`app/app/(app)/properties/[id]/property-detail-content.tsx`](../../../app/app/(app)/properties/[id]/property-detail-content.tsx) (`BreadcrumbActions` ~389).

- **Modeling mobile property `<select>` uses `text-sm`** in `MobileContextBar` subtitle cluster — diverges from the repo **iOS input zoom** rule (`text-base md:text-sm` on controls). May trigger Safari zoom-on-focus (**E1**). — *Evidence:* [`app/app/(app)/modeling/modeling-workspace.tsx`](../../../app/app/(app)/modeling/modeling-workspace.tsx) (~76–82). Contrast refinance mobile select **`text-base`**: [`app/app/(app)/refinance/refinance-workspace.tsx`](../../../app/app/(app)/refinance/refinance-workspace.tsx) (~623–634).

- **Full Vitest suite: 10 failures (timeouts)** on this run — **`GET`/auth-related API route tests** hit **5000ms** timeout; **75** files passed, **628** tests total with **618** passed. **Not** attributable to mobile UI changes but **blocks treating O1 as Pass** until CI/local passes. — *Evidence:* Command: `npm run test` from `app/` directory (2026-05-01). **Scoped:** `vitest run components/mobile-tool-shell.test.tsx components/mobile-bottom-nav.test.tsx` → **8/8 passed**.

### Low (P3)

- **Bottom nav “Analyze” uses `Calculator`** while sidebar copy/iconography may differ (sidebar “Analyze deal” / `ClipboardList` pattern per prior notes). — *Impact:* **M3** chrome consistency only. — *Evidence:* [`app/components/mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx) vs [`app/app/(app)/app-nav.tsx`](../../../app/app/(app)/app-nav.tsx).

- **Drawer backdrop** uses `role="button"` and `tabIndex={-1}` for pointer dismiss—acceptable but not ideal dialog-overlay pattern. — *Evidence:* [`app/app/(app)/app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx) (backdrop region ~246–250).

- **Docs drift:** [`docs/qa/mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) § inventory lists only analyzer, modeling/mortgage/projections, public calculator; **code** also wraps **refinance**, **add-property wizard**, and **multiple marketing calculators** in `MobileToolShell`. — *Impact:* Audit/onboarding accuracy, not runtime.

## Criteria checklist (Section 4 — [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md))

**Legend:** Pass / Fail / Partial / N/A — **Partial** = static review or partial automation; **viewport matrix (320–768) and real devices not exercised** this run.

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| A1 | No unintended horizontal scroll (320–430) | Partial | Not browser-tested |
| A2 | 767 vs 768 predictable | Pass | `md:hidden` on shell, `hidden md:*` for desktop blocks (e.g. [`public-calculator.tsx`](../../../app/components/marketing/public-calculator.tsx) ~534–555; [`refinance-workspace.tsx`](../../../app/app/(app)/refinance/refinance-workspace.tsx) ~614–659) |
| A3 | Hydration / errors | Partial | `useIsMobile` SSR `false` → branch swap; no live session |
| A4 | Safe areas | Pass | `viewportFit: "cover"` [`app/layout.tsx`](../../../app/app/layout.tsx) ~28–32; main `pb-[calc(4rem+1.5rem+env(safe-area-inset-bottom))]` [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx) ~293; nav `pb-[env(safe-area-inset-bottom)]` [`mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx) ~18; shell footer safe padding [`mobile-tool-shell.tsx`](../../../app/components/mobile-tool-shell.tsx) ~96 |
| B1 | MobileToolShell surfaces | Partial | Footers vary (analyzer has `footer`; modeling/refi/public often omit—by design); **inventory wider than QA doc table** |
| B2 | Context blocks usable | Partial | `MobileContextBar` **`min-h-[44px]`** [`mobile-context-bar.tsx`](../../../app/components/mobile-context-bar.tsx) ~13 |
| B3 | MobileCollapsible | Partial | **`min-h-[44px]`** trigger [`mobile-collapsible.tsx`](../../../app/components/mobile-collapsible.tsx) ~28; not exercised |
| B4 | Card rhythm | Partial | Not systematically compared |
| C1 | Nav drawer / overlay | Partial | Focus **into** panel on open Pass; **close focus return Fail** |
| C2 | Workspace ≤2 taps | Partial | Modeling / Mortgage / Settings / Plans via **More → drawer** (≥2 taps)—likely intentional |
| C3 | Deep links | N/A | Not exercised |
| C4 | Back / unsaved state | N/A | Not exercised |
| D1 | ~44px targets | Partial | Bottom nav **Pass** (`min-h/w-[44px]`); mode switcher / nav rows / `size-10` gap |
| D2 | Spacing / mis-taps | Partial | Not device-tested |
| D3 | Scroll traps | Partial | Not exercised |
| E1–E4 | Forms | Partial | Modeling inline `select` **`text-sm`** vs project rule; other inputs not keyboard-tested on device |
| F1–F3 | Typography / labels | Partial | No policy spot-check |
| G1–G3 | Visual / states | Partial | Tokens appear consistent; no screenshot pass |
| H1–H3 | Charts | Partial | Recharts `ResponsiveContainer` usage; not verified at mobile height |
| I1–I3 | Performance | N/A | No Lighthouse / device |
| J1 | Focus order | Partial | Drawer close gap |
| J2 | Contrast | N/A | Not measured |
| J3 | Motion | Partial | Assumed `prefers-reduced-motion` usage in shell where present—not audited line-by-line |
| K1–K3 | Auth / billing | N/A | Clerk / pricing not exercised at 320px |
| L1–L2 | Security / privacy | N/A | Not in scope |
| M1–M3 | Cross-surface consistency | Partial | Icon/label **Low** finding |
| N1–N2 | Desktop non-regression | Partial | Structure keeps desktop behind `md:`; SSR shows desktop tree first |
| O1 | Tests + MobileToolShell | **Partial** | **Mobile** component tests **Pass**; **full** suite **Fail** (timeouts) this run |
| O2 | `lib/` math | N/A | Presentation-only assumption |
| P1–P2 | Marketing mobile | Partial | `public-calculator` follows `md:hidden` shell + `hidden md:grid` desktop |

## Evidence reviewed

- **Layout / chrome:** [`app/app/(app)/app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx), [`app/components/mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx), [`app/lib/use-is-mobile.ts`](../../../app/lib/use-is-mobile.ts), [`app/app/layout.tsx`](../../../app/app/layout.tsx) (`viewport`)
- **Primitives:** [`app/components/mobile-tool-shell.tsx`](../../../app/components/mobile-tool-shell.tsx), [`app/components/mobile-mode-switcher.tsx`](../../../app/components/mobile-mode-switcher.tsx), [`app/components/mobile-context-bar.tsx`](../../../app/components/mobile-context-bar.tsx), [`app/components/mobile-collapsible.tsx`](../../../app/components/mobile-collapsible.tsx), [`app/components/ui/drawer.tsx`](../../../app/components/ui/drawer.tsx) (Vaul vs Radix by `useIsMobile`)
- **Representative surfaces:** [`app/app/(app)/analyze/deal-analyzer-form.tsx`](../../../app/app/(app)/analyze/deal-analyzer-form.tsx), [`app/app/(app)/properties/[id]/projections-tab-content.tsx`](../../../app/app/(app)/properties/[id]/projections-tab-content.tsx), [`app/app/(app)/modeling/modeling-workspace.tsx`](../../../app/app/(app)/modeling/modeling-workspace.tsx), [`app/app/(app)/refinance/refinance-workspace.tsx`](../../../app/app/(app)/refinance/refinance-workspace.tsx), [`app/components/marketing/public-calculator.tsx`](../../../app/components/marketing/public-calculator.tsx), [`app/app/(app)/properties/[id]/property-detail-content.tsx`](../../../app/app/(app)/properties/[id]/property-detail-content.tsx), [`app/app/(app)/app-nav.tsx`](../../../app/app/(app)/app-nav.tsx)
- **Marketing / consent:** [`app/components/consent/cookie-consent-banner.tsx`](../../../app/components/consent/cookie-consent-banner.tsx) (`fixed` + `bottom-[calc(4rem+env(safe-area-inset-bottom,0px))]` clears bottom nav)
- **Tests executed:** `npx vitest run components/mobile-tool-shell.test.tsx components/mobile-bottom-nav.test.tsx` (**pass**); `npm run test` from `app/` (**10 API test timeouts**, 2026-05-01)

### Assumptions and limits

- **No emulator or physical device** this run—no verification of momentum scroll, OS `<select>` sheets, or notch overlap beyond code paths.
- **No route-by-route** scroll/overflow pass for the §5 surface inventory; criteria marked Partial pending manual matrix.

## Risk & impact assessment

Unresolved **drawer focus** affects **accessibility compliance** and **power keyboard users** on every drawer open/close cycle—high frequency. **Small touch targets** accumulate friction on **Analyze / Modeling / Mortgage** flows where mode switching and drawer navigation dominate. **`useIsMobile` hydration swap** may cause **perceived instability** or support tickets if flicker is noticeable on slow devices.

## Recommendations (prioritized)

1. **Restore focus** to the hamburger control on **every** drawer close path in [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx) (mirror [`landing-nav.tsx`](../../../app/components/marketing/landing-nav.tsx) pattern referenced in Velde mobile skill).
2. Enforce **`min-h-[44px]`** (and icon-only **`min-w`**) on **`MobileModeSwitcher`**, **`AppNav`** row targets, and property **`BreadcrumbActions`** trigger—or document explicit exceptions with design sign-off.
3. Align modeling **mobile property `select`** with **`text-base md:text-sm`** to match iOS zoom policy; align **Analyze** nav **icon** with sidebar semantics if product agrees.
4. **Stabilize or investigate** Vitest timeouts on **`app/api/*/route.test.ts`** so **O1** is a reliable gate; until then treat full-suite green as **environment-dependent**.
5. **Update** [`mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) **inventory** for all **`MobileToolShell`** call sites found in grep (refinance, wizard, cap-rate, BRRRR, DSCR, etc.).

## Task candidates

- [ ] **P1 — Drawer focus restoration:** Add hamburger `ref`; on `closeDrawer`, Escape, backdrop, swipe-dismiss, and route-change close, `focus()` the menu button (**file:** [`app/app/(app)/app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx)).
- [ ] **P2 — Touch targets:** `min-h-[44px]` (and width for icon-only) on [`mobile-mode-switcher.tsx`](../../../app/components/mobile-mode-switcher.tsx) buttons; increase hit area on [`app-nav.tsx`](../../../app/app/(app)/app-nav.tsx) `NavGroup` links; bump [`property-detail-content.tsx`](../../../app/app/(app)/properties/[id]/property-detail-content.tsx) overflow trigger from `size-10` to ≥44px effective target.
- [ ] **P2 — Modeling select typography:** Apply `text-base md:text-sm` (or equivalent) to the modeling workspace mobile property `<select>` in [`modeling-workspace.tsx`](../../../app/app/(app)/modeling/modeling-workspace.tsx).
- [ ] **P2 — Vitest stability:** Investigate **5s timeouts** on unauthenticated/401 API route tests (`dynamic import` of routes under test)—restore **`npm run test`** green in [`app/`](../../../app/).
- [ ] **P3 — Nav icon consistency:** Reconcile **Analyze** tab icon between [`mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx) and [`app-nav.tsx`](../../../app/app/(app)/app-nav.tsx) if UX review wants parity.
- [ ] **P3 — Documentation:** Expand [`docs/qa/mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) **MobileToolShell** inventory to match implementation (refinance, add-property wizard, marketing calculators).

## Re-test checklist

- [ ] VoiceOver / TalkBack: open **More** → **AppNav**, close via backdrop and Escape; confirm **focus** returns to **Open menu**.
- [ ] Device spot-check: **Modeling** property picker focus—**no Safari zoom** on `select` open.
- [ ] Viewport **320 / 375 / 430 / 767–768** on `/analyze`, `/modeling`, `/mortgage`, `/refinance`, `/investment-property-calculator`.
- [ ] `npm run test` from **`app/`** after API test fixes; retain **`mobile-tool-shell`** + **`mobile-bottom-nav`** Vitest jobs.

## Next trigger and cadence

- **Trigger:** Before major mobile-affecting release, after large responsive refactors, or when mobile regressions are reported.
- **Next run:** After implementing **focus restoration** + **touch-target** batch; or next scheduled **full audit** cadence per PM.

---

*Traceability: criteria [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) · mobile patterns [`.cursor/skills/veld-mobile/SKILL.md`](../../../../.cursor/skills/veld-mobile/SKILL.md). Audit method: **current-code review**, 2026-05-01.*
