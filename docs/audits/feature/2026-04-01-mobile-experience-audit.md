# Mobile Experience Audit — 2026-04-01

**Lane:** Mobile experience (narrow viewport, touch, `md:hidden` shells, safe-area, desktop parity).  
**Criteria:** [docs/qa/mobile-experience-audit.md](../../qa/mobile-experience-audit.md)  
**Process:** [docs/process/mobile-experience-audit-process.md](../../process/mobile-experience-audit-process.md)  
**Report template:** [docs/process/audit-report-template.md](../../process/audit-report-template.md)

This pass combined **static code review** (responsive patterns, shells, touch targets, safe-area, parity with desktop per criteria), **automated tests**, and **cross-file consistency** checks. **Viewport matrix (320–768px) and real-device checks** were not executed in a browser or on hardware during this run; criteria that require runtime interaction, native OS pickers, or Lighthouse are marked **Unverified** unless inferable from code.

## Executive summary

- **Overall:** Mobile architecture is coherent: `MobileToolShell` is used on Deal Analyzer, Modeling, Mortgage, public calculator, and marketing calculator variants; `useIsMobile()` aligns with Tailwind `md` (767px vs 768px); app shell uses fixed header, slide-out nav, and documented safe-area utilities in `globals.css`.
- **Top risks:** (1) **Focus management** on the authenticated app drawer—initial focus moves into the panel on open, but **focus is not restored** to the menu control on close (keyboard and some assistive-tech flows). (2) **Residual unverified exposure** on overflow, scroll chaining, and chart/tooltip behavior without a device-backed pass.
- **Recommendation:** Ship the current patterns for narrow viewports; prioritize **drawer focus return** and a **short device matrix** (320 / 375 / 430 / 767–768 boundary + one phone) before the next major mobile-facing release.

## Severity-ranked findings

### Critical

- None identified in this audit pass.

### High

- None identified. *(A prior draft cited missing `<h1>` on Modeling/Mortgage when properties exist—that is **incorrect**: both `modeling-workspace.tsx` and `mortgage-workspace.tsx` render a visible page-level `<h1>` outside the `hidden md:block` workspace header card.)*

### Medium

- **App nav drawer: focus not restored on close** — After `Escape` or backdrop close, focus is not programmatically returned to the “Open menu” control (`app/(app)/app-layout-client.tsx`). Initial focus on open is implemented; closure leaves focus ambiguous for keyboard users (WCAG 2.4.3 / dialog patterns).

- **App drawer bottom safe area** — The mobile drawer’s footer (`UserButton` / “Account”) uses `py-4` without `env(safe-area-inset-bottom)` padding on the drawer column itself. Main content uses `.app-safe-area-bottom`; the **fixed left drawer** may place the bottom actions close to the iOS home indicator on notched devices until verified on hardware (**A4 partially code-reviewed**).

### Low

- **`useIsMobile` SSR snapshot** — `getServerSnapshot` returns `false`, so the first paint can match desktop layout until the client reads `matchMedia`; product docs already note this (`docs/qa/mobile-shell-verification.md`). Acceptable if no hydration errors; still a brief layout swap on phones.

- **Deal Analyzer: sticky KPI bar is unreachable on narrow viewports** — `deal-analyzer-form.tsx` returns `MobileToolShell` when `isMobile` is true; the `fixed bottom-0 … md:hidden` sticky metrics strip lives in the **desktop** branch only, so it never renders when `useIsMobile()` is true. Dead or legacy path; low risk but confusing for maintainers.

- **Stress / preset chip buttons (analyzer mobile)** — Sensitivity preset controls use `px-2.5 py-1 text-xs` (`deal-analyzer-form.tsx`), likely **below ~44×44px** touch target guidelines; padding helps adjacent rows but chips themselves are small (**D1** edge case).

### Low (informational)

- **Duplicate titles** — Page `<h1>` (“Modeling” / “Mortgage”) plus `MobileToolShell` `<h2>` with the same label can feel redundant in screen-reader rotors; not a failure, optional polish.

## Section 4 — Criteria checklist (systematic)

**Legend:** Pass | Fail | Partial | N/A | Unverified (needs browser/device)

Criteria reference: [docs/qa/mobile-experience-audit.md §4](../../qa/mobile-experience-audit.md).

### A. Responsive layout and breakpoints

| ID | Result | Notes / evidence |
|----|--------|------------------|
| A1 | Partial / Unverified | Primary content uses `max-w-*`, `min-w-0`, and intentional `overflow-x-auto` (e.g. property tabs). **No full 320–430px runtime sweep**; tables/dense property lists remain overflow risk without visual pass. |
| A2 | Pass | Shells: `md:hidden` on `MobileToolShell` root; app: mobile header/drawer `md:hidden`, sidebar `hidden md:flex` (`mobile-tool-shell.tsx`, `app-layout-client.tsx`). |
| A3 | Partial | `useIsMobile` uses `useSyncExternalStore` + server snapshot `false` (`use-is-mobile.ts`). Documented SSR note; **no console verification** this run. |
| A4 | Partial | `env(safe-area-inset-*)` on app header padding, main `pt` calc, `.app-safe-area-*` (`globals.css`, `app-layout-client.tsx`); analyzer shell footer and **desktop-only** sticky strip use bottom inset (`deal-analyzer-form.tsx`). **Drawer footer** inset not explicit—see Medium. |

### B. Mobile shells and dense tools

| ID | Result | Notes / evidence |
|----|--------|------------------|
| B1 | Pass | Analyzer: eyebrow, title, context, summary rail, footer (`deal-analyzer-form.tsx`). Modeling/Mortgage/Public: eyebrow, title, context, summary rail; footer N/A where not used (`projections-tab-content.tsx`, `mortgage-tab-content.tsx`, `public-calculator.tsx`). BRRR/STR/fix-and-flip use same shell pattern. |
| B2 | Unverified | Selectors and links use full-width controls and spacing in workspace headers; overlap not runtime-tested. |
| B3 | Pass | `MobileCollapsible` is a simple toggle; content flows in document order (`mobile-collapsible.tsx`). |
| B4 | Pass (design) | Summary rail vs body may repeat KPIs (e.g. analyzer)—consistent with intentional scanability; not flagged as accidental duplication. |

### C. Navigation and IA

| ID | Result | Notes / evidence |
|----|--------|------------------|
| C1 | Partial | Drawer: `role="dialog"`, `aria-modal`, Escape, body scroll lock, first focusable focused on open (`app-layout-client.tsx`). **Focus restore on close** missing—see Medium. Backdrop uses `role="button"` (unusual; still clickable). |
| C2 | Pass | `AppNav` lists Dashboard → … → Settings; one menu open + tap (`app-nav.tsx`). |
| C3 | Pass | `?tab=mortgage` / `?tab=projections` redirect from property detail (`property-detail-tabs.tsx`); mortgage workspace syncs query (`mortgage-workspace.tsx`). |
| C4 | Unverified | Back/unsaved-state not exercised. |

### D. Touch targets and gestures

| ID | Result | Notes / evidence |
|----|--------|------------------|
| D1 | Partial | App menu button `size-11` (44px); `MobileCollapsible` trigger `min-h-11`. Landing nav hamburger **`size-11 min-h-11 min-w-11`** (`landing-nav.tsx`). Preset chips may fall under 44px—see Low. |
| D2 | Unverified | Mis-tap risk not runtime-tested. |
| D3 | Unverified | Nested scroll / chart pan vs page scroll not runtime-tested. |

### E. Forms and inputs

| ID | Result | Notes / evidence |
|----|--------|------------------|
| E1 | Pass (code) | `inputMode` on numeric/currency paths (`deal-analyzer-form.tsx`, `property-form.tsx`, `currency-input.tsx`, mortgage fields). |
| E2 | Unverified | Autocomplete/autofill requires browser. |
| E3 | Unverified | Native `<select>` picker requires iOS/Android. |
| E4 | Unverified | Error visibility next to fields—spot-check deferred. |

### F. Typography, copy, and density

| ID | Result | Notes / evidence |
|----|--------|------------------|
| F1 | Unverified | 320px readability not visually verified. |
| F2 | Unverified | Cross-surface policy label audit deferred. |
| F3 | Unverified | Abbreviations in chips/rails—spot-check deferred. |

### G. Visual design and consistency

| ID | Result | Notes / evidence |
|----|--------|------------------|
| G1 | Unverified | Full token/design-spec conformance not re-audited. |
| G2 | Unverified | Loading/empty/error on all async views not replayed at mobile width. |
| G3 | Unverified | Icon+text wrap—spot-check deferred. |

### H. Charts and data visualization

| ID | Result | Notes / evidence |
|----|--------|------------------|
| H1 | Partial (code) | Fixed chart heights at mobile breakpoints, e.g. `h-[220px]`–`h-[260px]` with `ResponsiveContainer` (`projections-tab-content.tsx`, `mortgage-tab-content.tsx`). |
| H2 | Unverified | Tooltip tap/overflow not tested. |
| H3 | Unverified | Legend vs mobile—spot-check deferred. |

### I. Performance and perceived performance

| ID | Result | Notes / evidence |
|----|--------|------------------|
| I1–I3 | Unverified | No Lighthouse mobile or scroll profiling this run. |

### J. Accessibility (mobile-relevant)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| J1 | Partial | Modeling/Mortgage retain visible `<h1>` on narrow viewports (`modeling-workspace.tsx`, `mortgage-workspace.tsx`). Drawer focus return gap—see Medium. |
| J2 | Unverified | Contrast not measured. |
| J3 | Pass | `app-respect-reduced-motion` on shell transitions (`globals.css`, `app-layout-client.tsx`). |

### K. Authentication, billing, and plan limits

| ID | Result | Notes / evidence |
|----|--------|------------------|
| K1–K3 | Unverified | Clerk modals and plan CTAs not runtime-tested; pricing cards use `w-full` CTAs on small screens (`pricing-cards.tsx` pattern). |

### L. Security and privacy (mobile context)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| L1–L2 | Unverified | Keyboard/session workflows deferred. |

### M. Cross-surface consistency

| ID | Result | Notes / evidence |
|----|--------|------------------|
| M1–M3 | Unverified | Full cross-surface format diff deferred. |

### N. Desktop non-regression (constraint)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| N1 | Pass | Desktop sidebar and wide layouts gated at `md`+; mobile shell does not replace desktop at ≥768px. |
| N2 | Pass (code) | Mobile branches are presentation; core logic shared with desktop paths. |

### O. Automated coverage (confidence)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| O1 | Pass | `npm run test` (Vitest): **42** files, **276** tests passed (2026-04-01); includes `components/mobile-tool-shell.test.tsx`. |
| O2 | Pass | Mobile UI defers to `lib/` for math; no change to math test intent observed. |

### P. Marketing and public pages (mobile)

| ID | Result | Notes / evidence |
|----|--------|------------------|
| P1 | Partial (code) | `PublicCalculator` + marketing calculators wrap mobile in `MobileToolShell`; landing uses responsive nav (`public-calculator.tsx`, marketing calculators). |
| P2 | Unverified | SEO vs interaction—deferred. |

## Evidence reviewed

- **Process / QA:** `docs/process/mobile-experience-audit-process.md`, `docs/qa/mobile-experience-audit.md`, `docs/qa/mobile-shell-verification.md`, `docs/process/audit-report-template.md`
- **Shells & detection:** `app/components/mobile-tool-shell.tsx`, `mobile-tool-shell.test.tsx`, `mobile-collapsible.tsx`, `mobile-mode-switcher.tsx`, `mobile-summary-rail.tsx`, `lib/use-is-mobile.ts`
- **App shell:** `app/(app)/app-layout-client.tsx`, `app/(app)/app-nav.tsx`
- **Tool surfaces:** `app/(app)/analyze/deal-analyzer-form.tsx`, `app/(app)/properties/[id]/projections-tab-content.tsx`, `app/(app)/properties/[id]/mortgage-tab-content.tsx`, `app/(app)/modeling/modeling-workspace.tsx`, `app/(app)/mortgage/mortgage-workspace.tsx`
- **Marketing / public:** `components/marketing/public-calculator.tsx`, `components/pricing-cards.tsx`, `components/landing-nav.tsx`
- **Property / tabs:** `app/(app)/properties/[id]/property-detail-tabs.tsx`
- **Global styles:** `app/globals.css`
- **Root layout:** `app/layout.tsx` (no explicit `viewport` export; Next.js default viewport behavior applies)
- **Automated:** `npm run test` in `app/` (Vitest), exit code 0

**Assumptions / limits:** No real device; no DevTools viewport recording; no Lighthouse. Native keyboard/picker behavior unverified.

## Risk & impact assessment

- **Unresolved Medium items** affect keyboard and some assistive-technology users on the most-used navigation pattern (open/close drawer), and may affect comfort of bottom actions on notched phones until hardware-checked.
- **Unverified** items (overflow, scroll, charts, Clerk, performance) leave **moderate residual risk** until a short targeted QA pass closes them.
- Automated tests increase confidence in **`MobileToolShell` contract** but do not substitute for interaction testing.

## Recommendations (prioritized)

1. **Return focus** to the mobile menu button when the app nav drawer closes (and verify `aria-*` on backdrop if keeping `role="button"`).
2. **Padding** — Add bottom safe-area padding to the mobile drawer’s scroll column or footer so account actions clear the home indicator on iOS; verify on a notched device or simulator.
3. **QA matrix** — Run 320 / 375 / 390 / 430 / 767–768 checks plus one physical device for horizontal scroll, nested scroll, Clerk, and chart tooltips; attach screenshots to the next audit revision.
4. **Optional cleanup** — Remove or repurpose unreachable Deal Analyzer sticky KPI block in the desktop-only branch if confirmed dead.

## Task candidates (optional)

- [ ] Implement focus restoration for `#app-mobile-nav-drawer` close path in `app-layout-client.tsx`.
- [ ] Add `padding-bottom: env(safe-area-inset-bottom)` (or Tailwind equivalent) to the app mobile drawer footer area and verify on iOS.
- [ ] Device-backed viewport pass to flip **Unverified** criteria to Pass/Fail with evidence.
- [ ] Increase touch padding on analyzer stress preset chips or document intentional small control pattern.

## Re-test checklist

- [ ] Verify focus cycles: open drawer → Tab → Escape → focus returns to menu button
- [ ] Verify drawer bottom actions clear home indicator on iPhone class device
- [ ] Verify no horizontal scroll regressions on `/properties`, `/dashboard`, `/analyze` at 320px
- [ ] `npm run test` after any code changes

## Next trigger and cadence

- **Trigger:** Before release with app shell, workspace, or `MobileToolShell` changes; after reported mobile regressions.
- **Recommended next run:** Within one month or immediately following large UI refactors.

---

*Audit criteria baseline: [docs/qa/mobile-experience-audit.md](../../qa/mobile-experience-audit.md) (2026-03-30).*
