# Mobile Experience Audit — 2026-04-03

**Canonical criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Lane process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)

## Executive summary

- **Overall:** App shell, `MobileToolShell`, and marketing calculators are **coherent at the `md` (768px) boundary**: mobile-only surfaces use `md:hidden`, desktop grids use `hidden md:grid`, and `useIsMobile()` matches `(max-width: 767px)` per [`app/lib/use-is-mobile.ts`](../../../app/lib/use-is-mobile.ts). Safe-area handling is implemented for fixed chrome (`app-safe-area-*`, main padding with `env(safe-area-inset-*)`).
- **Top gaps:** This pass is **static code review** only—no real device, Lighthouse mobile, or full viewport matrix execution. **App drawer** lacks focus return to the menu trigger (unlike [`landing-nav.tsx`](../../../app/components/landing-nav.tsx)). **Workspace chips** on the dashboard mobile rail use compact padding that may fall **below ~44×44px** touch guidance.
- **Recommendation:** Treat as **baseline / regression-oriented** audit; schedule a **manual matrix** (320–768px + one physical device) before release or after large UI changes.

---

## Criteria checklist (Section 4 — [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md))

| ID | Criterion | Result | Evidence / notes |
|----|-----------|--------|------------------|
| **A1** | No unintended horizontal scroll on primary column (320–430px) | **Pass*** | `min-w-0` on flex children in [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx); property tabs use `overflow-x-auto` where needed. *Not verified in browser.* |
| **A2** | 767px vs 768px: predictable `md:hidden` / `md:block` | **Pass** | Mobile header + drawer + bottom nav `md:hidden`; desktop sidebar `hidden md:flex`. Marketing calculators: `md:hidden` shell + `hidden md:grid md:grid-cols-12` in [`public-calculator.tsx`](../../../app/components/marketing/public-calculator.tsx) (same pattern in brrr, fix-and-flip, str-ltr). |
| **A3** | Hydration: no persistent React errors at mobile width | **N/A** | Requires runtime verification. |
| **A4** | Safe areas: critical actions not obscured | **Pass*** | [`globals.css`](../../../app/app/globals.css) `.app-safe-area-top` / `.app-safe-area-bottom`; main `pt`/`pb` with `env(safe-area-inset-*)` in [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx); [`mobile-tool-shell.tsx`](../../../app/components/mobile-tool-shell.tsx) footer padding; [`mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx) `pb-[env(safe-area-inset-bottom)]`. *Notch/home indicator on hardware not verified.* |
| **B1** | `MobileToolShell`: eyebrow, title, summary rail; footer where designed | **Pass** | Deal analyzer passes `footer` ([`deal-analyzer-form.tsx`](../../../app/app/(app)/analyze/deal-analyzer-form.tsx)); public calculators use `summaryItems` + `MobileToolShell` wrapper; mortgage/projections tabs use shell with context ([`mortgage-tab-content.tsx`](../../../app/app/(app)/properties/[id]/mortgage-tab-content.tsx), [`projections-tab-content.tsx`](../../../app/app/(app)/properties/[id]/projections-tab-content.tsx)). |
| **B2** | Context blocks usable | **Pass** | Modeling/mortgage workspaces pass `mobileHeader` with full-width selects and links ([`modeling-workspace.tsx`](../../../app/app/(app)/modeling/modeling-workspace.tsx), [`mortgage-workspace.tsx`](../../../app/app/(app)/mortgage/mortgage-workspace.tsx)). |
| **B3** | `MobileCollapsible` / overflow | **Pass*** | Used in deal analyzer and marketing calculators; *scroll trap not exercised manually.* |
| **B4** | Card rhythm / duplicate KPIs | **Pass*** | Subjective; no duplicate flagged in review. |
| **C1** | Hamburger / drawer: open, focus, close | **Pass** / **Partial** | [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx): Escape, backdrop click, `body` scroll lock, focus moves to first focusable in drawer, swipe-to-close on panel. **Gap:** no return focus to hamburger on close (contrast `landing-nav.tsx` `closeMenu` → `menuButtonRef.current?.focus()`). |
| **C2** | Workspace nav ≤2 taps | **Pass** | Bottom nav: Dashboard / Properties / Analyze + More → drawer for Modeling, Mortgage, Calculators, etc. |
| **C3** | Deep links `?tab=` | **Pass** | [`property-detail-tabs.tsx`](../../../app/app/(app)/properties/[id]/property-detail-tabs.tsx) reads `tab`; redirects `mortgage` / `projections` to dedicated routes. |
| **C4** | Back / unsaved state | **N/A** | Product-specific; not exhaustively tested. |
| **D1** | ~44×44px primary targets | **Pass** / **Partial** | [`mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx): `min-h-[44px] min-w-[44px]`; landing menu button `size-11 min-h-11 min-w-11`; app header hamburger `size-11`. [`workspace-nav-mobile.tsx`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx) chip links `py-1.5` — likely **below** 44px height. |
| **D2** | Spacing between adjacent tappable controls | **Pass*** | Not measured pixel-perfect. |
| **D3** | Scroll / nested scroll traps | **N/A** | Requires interaction testing. |
| **E1**–**E4** | Forms / inputs | **Pass*** | `inputMode="numeric"` on several fields in deal analyzer; `text-base` on calculator inputs (`public-calculator.tsx`) supports mobile keyboard sizing. *Real keyboard behavior not verified.* |
| **F1**–**F3** | Typography / labels | **Pass*** | Single-column stacks; *320px readability not visually confirmed.* |
| **G1**–**G3** | Visual design | **Pass*** | Uses design tokens; *full audit vs design-spec not repeated.* |
| **H1**–**H3** | Charts | **N/A** | Not deep-dived this pass. |
| **I1**–**I3** | Performance | **N/A** | No Lighthouse / network run. |
| **J1**–**J3** | a11y | **Partial** | Focus order in drawer improved; focus return missing; **reduced-motion** class exists (`app-respect-reduced-motion`). |
| **K1**–**K3** | Auth / billing | **N/A** | Clerk modals not resized in this pass. |
| **L1**–**L2** | Security | **N/A** | Out of scope for static UI review. |
| **M1**–**M3** | Cross-surface consistency | **Pass*** | Relies on shared formatters; see policy docs. |
| **N1** | ≥768px desktop layouts present | **Pass** | Desktop sidebar `md:flex`; tool shells hidden on `md+`. |
| **N2** | Feature parity | **Pass*** | Mobile uses `MobileToolShell` + shared content paths; desktop retains full grids. |
| **O1** | `npm run test` | **Pass** | `mobile-tool-shell.test.tsx`: **4 passed** (Vitest, 2026-04-03). |
| **O2** | `lib/` math tests | **N/A** | Not re-run full suite; mobile UI is presentation-only per policy. |
| **P1**–**P2** | Marketing landing / SEO | **Pass*** | Calculators align `md` breakpoint with shell; *landing hero not re-screenshotted.* |

---

## Severity-ranked findings

### Critical

- None identified in static review.

### High

- None identified. **Regression risk:** If any marketing calculator reintroduces `lg:`-only visibility for the desktop grid while `MobileToolShell` stays `md:hidden`, a **tablet blank** could reappear (see prior [`2026-04-02-mobile-experience-audit.md`](2026-04-02-mobile-experience-audit.md)). Current pattern is `hidden md:grid md:grid-cols-12` for desktop columns.

### Medium

- **M1 — No real-device or viewport matrix execution:** Criteria A1, A3, A4, D3, E–I sections are only partially satisfied without 320–430px + 768px boundary testing and at least one iOS/Android device per [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §2.

### Low

- **L1 — App nav drawer focus management:** On close, focus is not restored to the “Open menu” control (`app-layout-client.tsx`). Compare with [`landing-nav.tsx`](../../../app/components/landing-nav.tsx) lines 19–22, 167–171 (`closeMenu` → focus menu button).
- **L2 — Dashboard `WorkspaceNavMobile` chip targets:** Links use `px-3 py-1.5` ([`workspace-nav-mobile.tsx`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx) lines 22–38)—compact pills may be under **~44px** minimum height for touch.
- **L3 — Deal analyzer “mobile sticky results bar”:** In [`deal-analyzer-form.tsx`](../../../app/app/(app)/analyze/deal-analyzer-form.tsx), the `<768px` path **early-returns** `MobileToolShell` (`isMobile` from `useIsMobile()`); the desktop branch includes a `fixed` `md:hidden` strip (lines 1405–1431) that **does not render** when `isMobile` is true. Appears **unreachable** in current logic—dead code or legacy; consider removal or documentation to avoid confusion.

---

## Evidence reviewed

| Area | Paths / artifacts |
|------|-------------------|
| App shell | [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx), [`mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx), [`app-nav.tsx`](../../../app/app/(app)/app-nav.tsx) |
| Safe area | [`globals.css`](../../../app/app/globals.css) (lines 179–191), `app-layout-client` main padding |
| Mobile shell | [`mobile-tool-shell.tsx`](../../../app/components/mobile-tool-shell.tsx), [`mobile-tool-shell.test.tsx`](../../../app/components/mobile-tool-shell.test.tsx) |
| Breakpoints | [`use-is-mobile.ts`](../../../app/lib/use-is-mobile.ts) — `(max-width: 767px)` |
| Marketing calculators | [`public-calculator.tsx`](../../../app/components/marketing/public-calculator.tsx), [`brrr-calculator.tsx`](../../../app/components/marketing/brrr-calculator.tsx), [`fix-and-flip-calculator.tsx`](../../../app/components/marketing/fix-and-flip-calculator.tsx), [`str-ltr-calculator.tsx`](../../../app/components/marketing/str-ltr-calculator.tsx) — `md:hidden` + `hidden md:grid md:grid-cols-12`; input grids `sm:grid-cols-2 lg:grid-cols-3` (intentional **2→3 column** step at `lg`, not `md`) |
| Property flows | [`property-detail-tabs.tsx`](../../../app/app/(app)/properties/[id]/property-detail-tabs.tsx), [`modeling-workspace.tsx`](../../../app/app/(app)/modeling/modeling-workspace.tsx), [`mortgage-workspace.tsx`](../../../app/app/(app)/mortgage/mortgage-workspace.tsx), [`workspace-nav-mobile.tsx`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx) |
| Landing | [`landing-nav.tsx`](../../../app/components/landing-nav.tsx) |
| Deal analyzer | [`deal-analyzer-form.tsx`](../../../app/app/(app)/analyze/deal-analyzer-form.tsx) — `MobileToolShell` + `useIsMobile()` |

**Assumptions / limits:** No browser DevTools, no Lighthouse, no physical device. Automated tests: only `mobile-tool-shell` Vitest file executed for this report.

---

## Risk & impact assessment

- **Unresolved medium finding (no manual matrix):** Mobile-specific regressions (horizontal scroll, keyboard types, scroll traps) could ship until a hands-on pass is done.
- **Low findings:** Focus return affects keyboard and assistive-tech users; small chips affect mis-taps on dashboard; dead code in deal analyzer is maintenance noise only.

---

## Recommendations (prioritized)

1. Run the **viewport matrix** (320, 375, 390, 430, 767/768) on priority routes from [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §5, plus **one real device** for keyboard and scroll behavior.
2. Align **app drawer** with **landing drawer** focus pattern: restore focus to the menu button on close.
3. Increase **touch padding** on `WorkspaceNavMobile` chip links (or document exception) if manual testing confirms tight targets.

---

## Task candidates (optional)

- [ ] Manual: full criteria checklist from [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §4 with Pass/Fail at runtime.
- [ ] **App layout:** `useRef` + `focus()` on hamburger after `closeDrawer` in [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx) (mirror `landing-nav.tsx`).
- [ ] **Dashboard:** `min-h-11` / padding on workspace chip links in [`workspace-nav-mobile.tsx`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx).
- [ ] **Deal analyzer:** Remove or repurpose unreachable `fixed` `md:hidden` strip (lines 1405–1431) if confirmed dead.

---

## Re-test checklist

- [ ] 320–767px: `/`, `/investment-property-calculator`, `/dashboard`, `/properties`, `/properties/[id]`, `/modeling`, `/mortgage`, `/analyze`, `/plans`, `/settings`
- [ ] 768px: calculators show desktop grid, **no** blank between mobile shell and desktop
- [ ] Real device: numeric inputs, `<select>`, safe-area with home indicator
- [ ] After any fix: `npx vitest run mobile-tool-shell`

---

## Next trigger and cadence

- **Trigger:** Changes to `MobileToolShell`, `app-layout-client`, marketing calculator components, or property tab navigation.
- **Cadence:** Monthly or before major release; full matrix after large UI refactors per [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §“When to run.”
