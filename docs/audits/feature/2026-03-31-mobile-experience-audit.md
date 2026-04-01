# Mobile experience audit — 2026-03-31

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells, safe-area, desktop parity).  
**Criteria:** [docs/qa/mobile-experience-audit.md](../../qa/mobile-experience-audit.md)  
**Process:** [docs/process/mobile-experience-audit-process.md](../../process/mobile-experience-audit-process.md)

This pass is **audit-only** (static code review + automated tests). **Viewport matrix (320–768px) and real-device checks** were not executed in a browser or on hardware; those rows are marked **Unverified** where behavior depends on runtime.

---

## Executive summary

- **Overall:** The app shell implements **safe-area padding**, **Escape-to-close** and **initial focus** on the signed-in mobile drawer, and **`MobileToolShell`** is wired consistently on Deal Analyzer, Modeling, Mortgage (via tab content), and public calculators—with **Vitest green** including `MobileToolShell` tests.
- **Top risks:** (1) **Deal Analyzer** sticky results bar is `fixed bottom-0` **without** `env(safe-area-inset-bottom)`, so metrics may sit under the **home indicator** on notched phones. (2) **Marketing `LandingNav`** drawer lacks **Escape**, **focus management**, and **`aria-modal`**, unlike the app layout—keyboard and SR users get a weaker experience on public pages. (3) **`viewportFit: cover`** is not declared; **`env(safe-area-inset-*)`** may be **0** in some iOS Safari contexts until verified with `viewport-fit=cover`.
- **Recommendation:** Treat sticky chrome and viewport-fit as the first fixes after **on-device confirmation**; align marketing drawer behavior with `app-layout-client` patterns where feasible.

---

## Section 4 — Criteria checklist (systematic)

**Legend:** Pass | Fail | N/A | Unverified (needs device/browser)

### A. Responsive layout and breakpoints

| ID | Result | Notes / evidence |
|----|--------|------------------|
| A1 | Unverified | Primary column uses `max-w-4xl` / responsive grids; no obvious `min-w` overflow in reviewed shells—confirm no horizontal scroll at 320–430px on `/analyze`, property tabs, charts. |
| A2 | Pass | `MobileToolShell` includes `md:hidden`; modeling uses `hidden … md:block` header + mobile path via `ProjectionsTabContent`; desktop sidebar `hidden md:flex` in `app-layout-client.tsx`. |
| A3 | Unverified | `useIsMobile()` uses `getServerSnapshot: false`—expect brief mismatch until hydrate; no infinite-load pattern seen in reviewed code. |
| A4 | Partial / Fail | App `main` + footer use `.app-safe-area-bottom`; **Deal Analyzer** `fixed bottom-0` bar omits bottom safe inset — `deal-analyzer-form.tsx` ~1397. **Severity if confirmed on device: P1.** |

### B. Mobile shells and dense tools

| ID | Result | Notes / evidence |
|----|--------|------------------|
| B1 | Pass | `MobileToolShell`: eyebrow/title/context/summary rail; **footer** on analyzer (`deal-analyzer-form.tsx`); modeling/mortgage use shell with workspace eyebrow (`projections-tab-content.tsx`, `mortgage-tab-content.tsx`); public calculators wrap `MobileToolShell`. |
| B2 | Unverified | Context blocks (selects, links) use full-width controls and `rounded-xl` padding—spot-check for overlap on long addresses. |
| B3 | Pass | `MobileCollapsible` expands children in flow; no nested `overflow-hidden` trap in component itself (`mobile-collapsible.tsx`). |
| B4 | Unverified | Dense KPI surfaces—spot-check duplicate rail vs body on analyzer/modeling. |

### C. Navigation and IA

| ID | Result | Notes / evidence |
|----|--------|------------------|
| C1 | Partial | **App:** Escape, body scroll lock, focus first focusable in drawer (`app-layout-client.tsx`). **Marketing `landing-nav.tsx`:** no Escape handler, no focus move, drawer not `role="dialog"` — **P2**. |
| C2 | Pass | From dashboard: menu → any primary route in one tap after open (`app-nav.tsx`). |
| C3 | Pass | Property `?tab=` handled in `property-detail-tabs.tsx`; mortgage/projections deep links redirect to `/mortgage` / `/modeling` with query. |
| C4 | Unverified | Draft context on `/properties/new`—back/unsaved behavior not fully traced this pass. |

### D. Touch targets and gestures

| ID | Result | Notes / evidence |
|----|--------|------------------|
| D1 | Partial | App menu button `size-11` (44px). **`MobileCollapsible`** trigger `py-2` + `text-sm` likely **&lt;44px** vertical target — `mobile-collapsible.tsx` — **P2**. **`LandingNav`** hamburger `size-10` (40px) — **P3**. |
| D2 | Unverified | Destructive vs primary spacing—general spacing looks adequate in shells; confirm on forms. |
| D3 | Unverified | Recharts + long forms—scroll trap not validated in runtime. |

### E. Forms and inputs

| ID | Result | Notes / evidence |
|----|--------|------------------|
| E1 | Pass (code) | `inputMode` used in analyzer, property forms, `currency-input.tsx`, mortgage fields (sample grep). |
| E2 | Unverified | Autocomplete on address fields—spot-check wizard/form. |
| E3 | Unverified | Native `<select>` in modeling/mortgage mobile headers—confirm OS picker on iOS/Android. |
| E4 | Unverified | Validation visibility—spot-check Zod/error UI on narrow width. |

### F. Typography, copy, and density

| ID | Result | Notes / evidence |
|----|--------|------------------|
| F1 | Unverified | `text-sm` / `text-base` in shells—confirm 320px readability. |
| F2 | Unverified | Align metric labels with `analytics-math-policy.md` on sampled surfaces. |
| F3 | Unverified | Summary chips abbreviations—tooltips if any. |

### G. Visual design and consistency

| ID | Result | Notes / evidence |
|----|--------|------------------|
| G1 | Unverified | Semantic tokens in Tailwind classes—no ad-hoc audit beyond spot read. |
| G2 | Unverified | Loading states on dynamic imports (`modeling-workspace`, `mortgage-workspace` show loading text). |
| G3 | Unverified | Icon+text wrap in nav rows. |

### H. Charts and data visualization

| ID | Result | Notes / evidence |
|----|--------|------------------|
| H1–H3 | Unverified | Recharts in mortgage/property flows—legibility, tap tooltip overflow not exercised. |

### I. Performance and perceived performance

| ID | Result | Notes / evidence |
|----|--------|------------------|
| I1–I3 | Unverified | No Lighthouse mobile run this pass. |

### J. Accessibility (mobile-relevant)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| J1 | Partial | App drawer focuses first link; marketing drawer does not—**P2** with C1. |
| J2 | Unverified | Contrast—defer to design-spec / manual. |
| J3 | Pass | `app-respect-reduced-motion` on drawer transitions (`app-layout-client.tsx`, `globals.css`). |

### K. Authentication, billing, and plan limits

| ID | Result | Notes / evidence |
|----|--------|------------------|
| K1–K3 | Unverified | Clerk modals and `/plans` not reviewed in runtime; layout uses same shell as app. |

### L. Security and privacy

| ID | Result | Notes / evidence |
|----|--------|------------------|
| L1–L2 | Unverified | Clerk/session—configuration-dependent. |

### M. Cross-surface consistency

| ID | Result | Notes / evidence |
|----|--------|------------------|
| M1–M3 | Unverified | `formatCurrency` / dates—sample parity not diffed this pass. |

### N. Desktop non-regression

| ID | Result | Notes / evidence |
|----|--------|------------------|
| N1 | Pass | Desktop sidebar + `md:block` workspaces; mobile shell `md:hidden`. |
| N2 | Pass (code) | Mobile paths wrap or gate with `isMobile` / CSS; desktop sections preserved in modeling/mortgage/property content. |

### O. Automated coverage

| ID | Result | Notes / evidence |
|----|--------|------------------|
| O1 | Pass | `npm run test` — **227 tests passed** (2026-03-31), includes `mobile-tool-shell.test.tsx`. |
| O2 | Pass | Mobile UI consumes shared libs; no math test changes in scope. |

### P. Marketing and public pages

| ID | Result | Notes / evidence |
|----|--------|------------------|
| P1 | Unverified | Landing/pricing/calculators—CTA hierarchy at 320px. |
| P2 | Unverified | SEO vs interactions—out of static scope. |

---

## Severity-ranked findings

### Critical (P0)

- None identified in this static pass.

### High (P1)

- **Deal Analyzer sticky metrics bar vs home indicator** — Fixed `bottom-0` bar may obscure or crowd **cash flow / cap rate / DSCR** next to the iOS home indicator without bottom safe-area padding — `app/app/(app)/analyze/deal-analyzer-form.tsx` (mobile sticky block ~1397).

### Medium (P2)

- **Marketing mobile nav a11y / keyboard parity** — `app/components/landing-nav.tsx`: no **Escape** to close, no **initial focus** in drawer, no **`aria-modal` / `role="dialog"`**; backdrop is `aria-hidden` only—compare to `app-layout-client.tsx`.
- **`MobileCollapsible` touch target** — Full-width row but **`py-2`** is likely under **~44px** minimum height — `app/components/mobile-collapsible.tsx`.

### Low (P3)

- **Landing hamburger `size-10`** — 40×40px control, slightly under common 44px guideline — `landing-nav.tsx`.
- **`viewportFit` not set** — Root `app/layout.tsx` has no `viewport` export; without **`viewport-fit=cover`**, `env(safe-area-inset-*)` may not apply as expected on some iOS views — pair with `globals.css` `.app-safe-area-*`.

---

## Evidence reviewed

- `app/components/mobile-tool-shell.tsx`, `mobile-tool-shell.test.tsx`, `mobile-mode-switcher.tsx`, `mobile-summary-rail.tsx`, `mobile-collapsible.tsx`
- `app/app/(app)/app-layout-client.tsx`, `app-nav.tsx`
- `app/app/(app)/analyze/deal-analyzer-form.tsx`
- `app/app/(app)/modeling/modeling-workspace.tsx`
- `app/app/(app)/mortgage/mortgage-workspace.tsx` (partial)
- `app/app/(app)/properties/[id]/projections-tab-content.tsx`, `mortgage-tab-content.tsx`, `property-detail-tabs.tsx`
- `app/components/landing-nav.tsx`
- `app/app/globals.css` (safe-area + reduced-motion)
- `app/lib/use-is-mobile.ts`
- `app/package.json` test script; **Vitest run** (all green)
- Grep: `MobileToolShell`, `inputMode`, `safe-area`, `md:hidden`

**Limits:** No Chrome DevTools mobile emulation, no Lighthouse mobile, no physical iOS/Android device this run.

---

## Risk & impact assessment

Unresolved **P1** sticky bar issues mainly affect **Analyze** on **notched phones**, where users may misread key financial metrics. **P2** marketing nav issues affect **keyboard and assistive-tech users** on **all public entry points**, a smaller but compliance-aligned audience. **P3** viewport-fit gaps may **mute** safe-area CSS investment until verified on Safari.

---

## Recommendations (prioritized)

1. **On a real iPhone (or Simulator with home indicator),** confirm whether the Deal Analyzer bottom bar needs `padding-bottom: env(safe-area-inset-bottom)` (or shared utility class); add if metrics or tap targets intersect the indicator.
2. **Bring `LandingNav` closer to `AppLayoutClient` patterns:** `keydown` Escape, trap or move focus into the panel on open, restore focus on close, and expose `role="dialog"` + `aria-modal="true"`.
3. **Increase vertical padding / min-height** on `MobileCollapsible` triggers to meet ~44px; optionally bump landing hamburger to `size-11`.
4. **Evaluate** exporting Next.js `viewport` with `viewportFit: 'cover'` if product wants reliable safe-area insets on iOS (validate no full-bleed regressions).

---

## Task candidates (optional)

- [ ] Add bottom safe-area inset to Deal Analyzer mobile sticky results bar (after device confirmation).
- [ ] Align `landing-nav.tsx` mobile drawer with app drawer a11y behavior (Escape, focus, dialog semantics).
- [ ] Increase `MobileCollapsible` button min tap height to ~44px.
- [ ] Add `viewport` / `viewportFit: 'cover'` in root layout if iOS safe-area remains ineffective.

---

## Re-test checklist

- [ ] Verify Deal Analyzer bottom bar on notched iOS device or Simulator.
- [ ] Verify marketing nav with keyboard (Tab, Escape) and screen reader spot-check.
- [ ] Verify no regression on desktop ≥768px for touched routes.
- [ ] `npm run check` when code changes are made.

---

## Next trigger and cadence

- **Trigger:** Next major UI release, mobile shell changes, or reported mobile regression.
- **Suggested next run:** Within **one month** or before next launch milestone; include **at least one real device** pass per [viewport matrix §2](../../qa/mobile-experience-audit.md).

---

## Viewport matrix (§2) — status

| Width (px) | Status |
|------------|--------|
| 320 | Unverified |
| 375 | Unverified |
| 390 | Unverified |
| 430 | Unverified |
| 768 boundary | Unverified (code uses `md` = 768px) |
| Real device (iOS/Android) | Unverified |
