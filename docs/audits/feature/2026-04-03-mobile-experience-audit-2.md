# Mobile Experience Audit — 2026-04-03 (Run 2)

**Canonical criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Lane process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Prior run (same day):** [`2026-04-03-mobile-experience-audit.md`](2026-04-03-mobile-experience-audit.md)

## Executive summary

- **Overall:** The landing page changes from [`2026-04-03-landing-mobile-cta-plan.md`](../../plans/2026-04-03-landing-mobile-cta-plan.md) are **reflected in code**: hero steps are hidden below `sm`, a **mobile-only** `MockupFrame` + `DashboardMockup` sits under the trust line, desktop mockup uses `hidden md:block` with chrome, and hero CTAs use **`w-full sm:w-auto`** with **centered secondary links on narrow viewports** and **`min-h-[44px]`**. Embedded mockups ([`2026-04-03-embedded-mockups-plan.md`](../../plans/2026-04-03-embedded-mockups-plan.md)) are integrated on **home** and **pricing**; `MockupFrame` uses **transform scaling** with **measured height** to avoid overflow.
- **Carryover from Run 1 (still open):** **App drawer** still does **not** restore focus to the hamburger after close—unlike [`landing-nav.tsx`](../../../app/components/landing-nav.tsx) (`closeMenu` → `menuButtonRef.current?.focus()`). **Dashboard workspace chips** in [`workspace-nav-mobile.tsx`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx) remain **`px-3 py-1.5`** without a **~44px** minimum height.
- **New observations:** `MockupFrame` starts with **`scale === 0`** and **`opacity: 0`** until `ResizeObserver` runs—possible **first-paint layout shift** or flash (not verified in a browser). This pass remains **static code review** plus **`MobileToolShell` unit tests**; the **full viewport matrix and real device** checks from the QA doc are still **human-only**.

---

## Severity-ranked findings

### Critical

- None identified in static review.

### High

- None identified. **Regression watch:** marketing + app breakpoints remain aligned around **`md` (768px)** for shell vs grid visibility (same as Run 1).

### Medium

- **M1 — No runtime viewport matrix or physical device:** Criteria A1, A3, A4, D3, E–I in [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §4 are only partially satisfied without 320–430px + 767/768px testing and at least one iOS/Android device per §2.

### Low

- **L1 — App nav drawer: focus not returned to menu trigger on close:** [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx) moves focus to the first focusable inside the drawer when opening (lines 139–148) but **`closeDrawer`** does not **`focus()`** the “Open menu” button (lines 179–186). **Pattern to match:** [`landing-nav.tsx`](../../../app/components/landing-nav.tsx) lines 19–22 (`menuButtonRef` + `closeMenu`).
- **L2 — `WorkspaceNavMobile` chip touch targets:** Chip links still use `px-3 py-1.5` ([`workspace-nav-mobile.tsx`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx) lines 22–38)—likely **under ~44px** height for touch; “Print portfolio summary” already uses `min-h-11` (line 41).
- **L3 — `MockupFrame` initial paint / CLS risk:** [`mockup-frame.tsx`](../../../app/components/mockups/mockup-frame.tsx) uses `scale` state `0`, `opacity: 0` on the scaled layer until measurement (lines 32–33, 91–93), and parent height is `undefined` until `scale > 0` (lines 78–83). **Impact:** Possible **layout shift** or brief **invisible-then-visible** flash when the observer fires—**not confirmed** with DevTools or Lighthouse.
- **L4 — Pricing “See it in action” on narrow widths:** Layout is a **single-column** `grid` with **`gap-4`** ([`pricing/page.tsx`](../../../app/app/pricing/page.tsx) lines 263–284). `MockupFrame` + `fitToHeight` on mortgage/deal uses **fixed `h-[340px]`** on mobile—reasonable, but **visual density** at **320px** should be confirmed manually (embedded plan §“Mobile hero mockup is appropriately sized”).

---

## Evidence reviewed

| Area | Paths / verification |
|------|----------------------|
| Landing mobile + CTA plan | [`app/app/page.tsx`](../../../app/app/page.tsx): `md:hidden` hero mockup (lines 265–275); `hidden … sm:grid sm:grid-cols-3` HERO_STEPS (277–278); `hidden md:block` desktop mockup + chrome (301–308); primary `w-full … sm:w-auto` + `min-h-[44px]` (211–211, 234–234); secondary `justify-center … sm:justify-start` (220, 243); calculator / pricing preview sign-up links and bottom CTA `ctaId`s (`grep` for `landing_calculator`, `landing_pricing_preview`, `create_free_account`, `compare_vs_spreadsheets`). |
| Embedded mockups | [`mockup-frame.tsx`](../../../app/components/mockups/mockup-frame.tsx); [`pricing/page.tsx`](../../../app/app/pricing/page.tsx) “See it in action” (253–285). |
| App drawer focus | [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx) (full file); contrast [`landing-nav.tsx`](../../../app/components/landing-nav.tsx). |
| Workspace chips | [`workspace-nav-mobile.tsx`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx). |
| `MobileToolShell` | [`mobile-tool-shell.tsx`](../../../app/components/mobile-tool-shell.tsx) — footer `env(safe-area-inset-bottom)` (line 84). |
| Mobile bottom nav | [`mobile-bottom-nav.tsx`](../../../app/components/mobile-bottom-nav.tsx) — `pb-[env(safe-area-inset-bottom)]`, `min-h-[44px]` links (lines 18–29). |
| Automated tests | `npx vitest run mobile-tool-shell` — **4 passed** (Vitest v4.1.0, 2026-04-03). |

**Assumptions / limits:** No browser DevTools, no Lighthouse mobile, no physical device. Run 1 checklist items A3, A4 (hardware safe area), D3, E–I remain **unverified** in this pass.

---

## Risk & impact assessment

- **Medium (no manual matrix):** Touch/scroll/keyboard behavior and horizontal-scroll regressions could ship without hands-on passes.
- **Low — focus return:** Affects keyboard and assistive-technology users; WCAG focus management consistency with marketing nav.
- **Low — chips:** Mis-taps on dashboard quick links for thumb users.
- **Low — MockupFrame:** If CLS or flash is noticeable, it hurts perceived quality on LCP-heavy landing/pricing—confirm with profiling if suspected.

---

## Recommendations (prioritized)

1. Execute the **viewport matrix** (320, 375, 390, 430, 767/768) on routes in [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §5, plus **one real device** for keyboard, `<select>`, and safe-area behavior.
2. Add **focus return** to the app drawer menu button on close, mirroring **`LandingNav`** (`useRef` on the hamburger + `focus()` in `closeDrawer` / backdrop / nav `onClose`).
3. **Increase vertical padding or `min-h-[44px]`** on `WorkspaceNavMobile` chips if manual testing confirms tight targets—or document an intentional compact exception.
4. **Profile** landing/pricing with embedded mockups: if **CLS** or **flash** is reported, consider reserving height or skeleton for `MockupFrame` until `scale > 0`.

---

## Task candidates (optional)

- [ ] **Manual:** Full criteria checklist from [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §4 with Pass/Fail at runtime (human-only scope).
- [ ] **App layout:** Hamburger `ref` + `focus()` after drawer close in [`app-layout-client.tsx`](../../../app/app/(app)/app-layout-client.tsx).
- [ ] **Dashboard:** `min-h-11` or equivalent on workspace chip [`Link`](../../../app/app/(app)/dashboard/workspace-nav-mobile.tsx)s.
- [ ] **MockupFrame:** If CLS is confirmed—reserve min-height or show subtle placeholder until first measure.

---

## Re-test checklist

- [ ] 320–767px: `/`, `/pricing`, `/dashboard`, `/properties`, `/modeling`, `/mortgage`, `/analyze` — mockup frames, no unintended horizontal scroll
- [ ] Drawer: open → close via backdrop, Escape, swipe — **focus returns** to “Open menu”
- [ ] Real device: numeric inputs, native `<select>`, safe-area with home indicator
- [ ] After any code fix: `npx vitest run mobile-tool-shell`; `npm run check` when applicable

---

## Next trigger and cadence

- **Trigger:** Further changes to `MockupFrame`, landing hero, pricing “See it in action”, `app-layout-client`, or `WorkspaceNavMobile`.
- **Cadence:** Monthly or before major release; full matrix after large UI refactors per [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md).
