# Mobile Experience Audit — 2026-04-05

**Canonical criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Lane process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Prior run:** [`2026-04-04-mobile-experience-audit.md`](2026-04-04-mobile-experience-audit.md)

---

## Executive summary

- **Overall health:** The `MobileToolShell` infrastructure remains solid. Three P2/P3 findings from the 2026-04-04 run are confirmed **fixed** this cycle: stress-test preset buttons raised to `min-h-[44px]`, `WorkspaceNavMobile` chip links raised to `min-h-[44px]`, and `PublicCalculator` inputs now carry correct `inputMode` attributes. This represents meaningful improvement to core touch-target compliance and keyboard UX.
- **Carryover risk (P2):** The app nav drawer still does not return focus to the hamburger trigger on close — a WCAG 2.4.3 violation persisting since the 2026-04-03 run. Dashboard and Properties page action links (`py-1.5`, ~32px) remain below the 44px touch target minimum.
- **New findings this run:** Two new P2 items: (1) `MobileCollapsible` toggle button is missing `aria-expanded` — screen readers cannot convey expand/collapse state across all tool surfaces; (2) the Refinance Workspace (`refinance-workspace.tsx`) chart tooltip has no mobile-specific variant and no `max-w` constraint, creating viewport overflow risk at 320px. Two new surfaces (Refinance and Add Property Wizard) received first-time audit coverage.
- **Scope:** Static code review. The full viewport matrix (320–768px) and real-device verification (keyboard, safe-area, native `<select>`, scroll momentum) remain **human-only** tasks and are not satisfied by this pass.

---

## Viewport matrix coverage

| Width (px) | Verified (this pass) |
|------------|----------------------|
| **320** | Static code review only — runtime unverified |
| **375** | Static code review only |
| **390** | Static code review only |
| **430** | Static code review only |
| **768** | `md:hidden` / `md:block` breakpoint verified in code |

**Real device:** Not verified. See §O.

---

## Surface inventory coverage

| Area | Surfaces reviewed | Method |
|------|-------------------|--------|
| Public | `/investment-property-calculator` (`PublicCalculator`) | Static |
| App shell | `AppLayoutClient`, `MobileBottomNav`, `AppNav` custom-event listener | Static |
| Deal Analyzer | `/analyze` — `DealAnalyzerForm` (mobile + desktop branches) | Static |
| Modeling | `ProjectionsTabContent` (MobileToolShell branch, workspace variant) | Static |
| Mortgage | `MortgageTabContent` (MobileToolShell branch, workspace variant) | Static |
| Refinance | `RefinanceWorkspace` — **first-time coverage** | Static |
| Add Property | `AddPropertyWizard` — **first-time coverage** | Static |
| Mobile primitives | `MobileToolShell`, `MobileSummaryRail`, `MobileCollapsible`, `MobileModeSwitcher`, `MobileSegmentedView`, `MobileBottomNav`, `MobileSectionCard` | Static |
| Landing nav | `LandingNav` (marketing pages) | Static |

---

## Sections A–P: criteria checklist

### A. Responsive layout and breakpoints

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| A1 | No unintended horizontal scroll at 320–430px | **Pass (static)** | — | Primary columns use `flex flex-wrap`, `grid grid-cols-2`. Portfolio-compare table (`deal-analyzer-form.tsx:78`) wrapped in `overflow-x-auto` with `min-w-[280px]`. WizardStepNav wrapped in `overflow-x-auto pb-1` in MobileToolShell context block. No fixed-width primary columns detected. Runtime confirmation required. |
| A2 | At 767/768px, layout switches predictably; no permanent duplicate chrome | **Pass** | — | `MobileToolShell` root: `md:hidden` ✓. Desktop shells: `hidden md:block` / `hidden md:flex`. `AppLayoutClient` top bar: `md:hidden`; sidebar: `hidden md:flex`. Refinance workspace: mobile in `div.md:hidden`, desktop in `div.hidden.md:block`. No duplicate chrome detected. |
| A3 | No persistent React/console errors after hydration at mobile width | **Partial — flag** | P3 | `useIsMobile()` returns `false` on server (`getServerSnapshot`), `true` on client after hydration. `DealAnalyzerForm`, `ProjectionsTabContent`, `MortgageTabContent`, and `RefinanceWorkspace` all conditionally render completely different component trees (`if (isMobile) return <MobileToolShell>`) — server renders desktop, client immediately re-renders mobile, causing a layout flash on first mobile paint. React 18 suppresses hard mismatch errors via `useSyncExternalStore` server snapshot. No fix detected from prior runs; no regression. |
| A4 | Safe areas not obscured on notched devices | **Pass (static)** | — | `MobileToolShell` footer: `pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1.5rem)]` ✓. `MobileBottomNav`: `pb-[env(safe-area-inset-bottom)]` ✓. `AppLayoutClient` main: `pb-[calc(4rem+env(safe-area-inset-bottom))]` ✓. Custom CSS `.app-safe-area-top` / `.app-safe-area-bottom` defined in `globals.css`. Needs real-hardware confirmation. |

---

### B. Mobile shells and dense tools

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| B1 | All `MobileToolShell` surfaces render eyebrow, title, summary rail; footer where applicable | **Pass** | — | **Deal Analyzer** (`deal-analyzer-form.tsx:1045`): `eyebrow="Analyzer"`, `title="Deal Analyzer"`, 4-item summary rail, footer with Save/New buttons ✓. **Modeling** (`projections-tab-content.tsx:1304`): `eyebrow="Workspace"`, `title="Modeling"`, summaryItems, mobileHeader as context, no footer (appropriate — no save action) ✓. **Mortgage** (`mortgage-tab-content.tsx:999`): `eyebrow="Workspace"`, `title="Mortgage"`, summaryItems, mobileHeader as context ✓. **Refinance** (`refinance-workspace.tsx:628`): `eyebrow="Refinance"`, `title="What-If Comparison"`, summaryItems (2 items when rate is set, empty otherwise — `MobileSummaryRail` returns null on empty ✓), no footer ✓. **Add Property Wizard** (`add-property-wizard.tsx:2534`): `eyebrow="Add Property"`, `title={STEP_LABELS[currentStep-1]}`, no summaryItems (appropriate for wizard), footer with Back/Next/Create ✓. **Public Calculator** (`public-calculator.tsx`): `eyebrow="Calculator"`, `title="Investment Property Calculator"`, 4-item summary rail ✓. All six surfaces covered. |
| B2 | Context blocks usable; no overlapping text, adequate tap targets | **Pass** | — | Refinance context: property `<select>` `py-2.5 text-sm rounded-xl` ✓, mortgage `<select>` same ✓. Deal Analyzer context: deal title, city/state line, deal count chip — no interactive elements competing. Wizard context: WizardStepNav with `overflow-x-auto`. No overlap detected statically. |
| B3 | Progressive disclosure (`MobileCollapsible`): labels clear, expanded content scrolls inside page | **Pass (with accessibility gap)** | — | Trigger: `min-h-[44px] w-full items-center justify-between` ✓. Labels: contextual and clear ("Balance projection", "Stress test", "Full metrics", "How this estimate works"). Expansion: `{open && children}` — no trapped overflow. **Accessibility gap flagged in J1:** button lacks `aria-expanded`. |
| B4 | No redundant duplicate metrics beyond intentional scanability | **Note — P3** | P3 | Deal Analyzer: 4-item summary rail (Cash flow, Cap rate, DSCR, Cash-on-cash) also in "Live result" MobileSectionCard body below. Duplication intentional for scrolled-down scanability. Acceptable at P3; flag for PM review at 320px density. |

---

### C. Navigation and IA

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| C1 | App shell drawer opens, focuses, closes without trapping focus or invisible overlay | **Fail — carryover** | **P2** | `AppLayoutClient` `closeDrawer` (`app-layout-client.tsx:76`): `const closeDrawer = () => setDrawerOpen(false)` — does **not** call `focus()` on the hamburger button. Opening correctly focuses first element in panel via `drawerPanelRef.current?.querySelector(...)?.focus()` ✓. Escape closes ✓. Backdrop closes ✓. Swipe-left closes ✓. **Missing:** hamburger `ref` + `focus()` on close. Compare `LandingNav` which correctly calls `menuButtonRef.current?.focus()` in `closeMenu`. WCAG 2.1 SC 2.4.3 violation. Unaddressed since 2026-04-03. |
| C2 | Workspace navigation reachable in ≤2 taps from common entry points | **Pass** | — | `MobileBottomNav` direct links: Dashboard (1 tap), Properties (1 tap), Analyze (1 tap). Modeling/Mortgage via drawer from "More": 2 taps. Refinance via drawer: 2 taps. Criterion met. |
| C3 | Deep links (`?tab=`, `#anchors`) resolve correctly on mobile | **Pass (static)** | — | Mortgage workspace context: `href="/properties/${id}?tab=details#mortgages"` ✓. Projections workspace context: `href="/modeling?propertyId=..."` ✓. |
| C4 | Browser back does not strand user or lose unsaved state without warning | **Pass** | — | Deal Analyzer: `beforeunload` event on `isDirty` ✓. Wizard: DraftProvider with `navigateTo` guard ✓. |

---

### D. Touch targets and gestures

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| D1 | Primary buttons and list rows meet ~44×44px minimum | **Fail (partial — improved)** | **P2** | **Fixed since prior run:** Stress test preset buttons now have `min-h-[44px]` (`deal-analyzer-form.tsx:872, 1441`) ✓. `WorkspaceNavMobile` chips now have `min-h-[44px]` (`workspace-nav-mobile.tsx:24,30,36`) ✓. **Still failing:** Properties page "Open Modeling" / "Open Mortgage" links: `py-1.5 text-sm rounded-md` ≈ 32px (`properties/page.tsx:503, 601`). Dashboard action links ("Add property" header row, "Analyze" quick actions): `py-1.5 text-sm` ≈ 32px (`dashboard/page.tsx:176–245`). `MobileModeSwitcher` buttons: `py-2.5 text-sm` ≈ 40px — borderline, component currently unused in production (P3). |
| D2 | Spacing between adjacent tappable controls avoids mis-taps | **Pass** | — | With stress test buttons raised to `min-h-[44px]`, the prior D2 mis-tap risk is resolved. Footer buttons in wizard and analyzer use `gap-3`. No new adjacent small-button clusters detected. |
| D3 | Charts/scrollable regions do not steal all vertical scroll | **N/A (static)** | — | Charts use Recharts `ResponsiveContainer`. Cannot verify nested scroll trap without runtime. Dashboard uses `overflow-x-auto` on filter chip rows (intentional horizontal scroll). |

---

### E. Forms and inputs

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| E1 | `inputMode`/`type` invoke appropriate software keyboards | **Pass** | — | **Fixed since prior run:** `PublicCalculator` now has `inputMode="decimal"` on purchase price, rent, expenses, down %, rate, vacancy % and `inputMode="numeric"` on term years ✓. `CurrencyInput` component: `type="text" inputMode="decimal"` ✓. Refinance workspace: rate input `type="text" inputMode="decimal"` ✓, closing costs `type="text" inputMode="decimal"` ✓. Deal Analyzer: ZIP `inputMode="numeric"` ✓, vacancy/ownership `inputMode="numeric"` ✓. Consistent across surfaces. |
| E2 | `autocomplete` on address and related fields | **Partial — P3** | P3 | Deal Analyzer mobile form: `autoComplete="street-address"` ✓, `autoComplete="address-line2"` ✓, `autoComplete="address-level2"` (city) ✓, `autoComplete="postal-code"` ✓. State `<select>` has no `autoComplete="address-level1"` — minor gap at P3. Wizard uses `AddressAutocompleteInput` component with same pattern. |
| E3 | Native `<select>` uses OS picker on real mobile | **Pass (static)** | — | Native `<select>` used for state (deal-analyzer, wizard), mortgage selection (mortgage-tab, refinance), term (refinance). Cannot verify OS picker without real device. |
| E4 | Validation errors visible without zooming; programmatically associated | **Pass** | — | Deal Analyzer: save error in `mobileHeader` context styled with `border-negative/30 bg-negative/10` ✓. Wizard: error div adjacent to step content with plan-limit link ✓. Refinance: rate out-of-range error inline `text-negative` ✓. |

---

### F. Typography, copy, and density

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| F1 | Body text readable without zoom at 320px | **Pass** | — | Minimum body text: `text-sm` (14px). Inputs use `text-base md:text-sm` (16px on mobile avoids iOS auto-zoom). Summary rail values: `text-base font-semibold` ✓. Helper / label text: `text-[11px]` — small but consistent with design spec for supplemental labels. |
| F2 | Labels for metrics consistent with analytics-math-policy | **Pass** | — | "Cap rate", "DSCR", "Cash-on-cash", "Monthly cash flow", "Equity", "NOI" — consistent across analyzer, projections, mortgage, and summary rails. No label drift in new surfaces (Refinance: "Monthly savings", "Total interest saved", "Break-even" — contextually appropriate and not conflicting with portfolio metric policy). |
| F3 | Abbreviations understandable or tooltipped | **Pass (marginal)** | — | "DSCR" in summary rails without tooltip — acceptable for RE investor audience. Refinance surface uses "P&I" without expansion in `basePiLabel` — understandable in context but could confuse new users at P3. Projections mobile summary abbreviates "Equity Y10", "Return Y10" etc. — truncated but contextually clear. |

---

### G. Visual design and consistency

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| G1 | Alignment with design-spec: semantic tokens, spacing scale, no ad-hoc colors | **Pass** | — | Consistent use of `text-muted`, `text-foreground`, `text-positive`, `text-negative`, `text-warning`, `bg-card`, `bg-background`, `bg-subtle`, `border-border`. Refinance and wizard surfaces follow same token conventions. No raw hex or ad-hoc overrides detected. |
| G2 | Loading, empty, and error states present on mobile for async views | **Pass** | — | Deal Analyzer: `loadingDeal` renders "Loading deal…" in header section ✓. Mortgage empty state: dedicated `<div>` with "Add a mortgage" link ✓. Refinance no-properties state: styled `<div>` with CTA ✓. Refinance no-mortgage-selected state: "No mortgage selected" panel ✓. Wizard: no async data loading (client-only form). |
| G3 | Icon + text pairs aligned when text wraps | **Pass** | — | `MobileBottomNav` nav items: `flex-col items-center gap-0.5` ✓. Context block links: `inline-flex items-center gap-1`. ChevronDown in `MobileCollapsible`: `flex items-center justify-between` ✓. |

---

### H. Charts and data visualization

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| H1 | Charts visible at mobile height; axes labels legible or abbreviated | **Pass (static)** | — | `MortgageTabContent` chart: `h-[220px]` on mobile ✓. `ProjectionsTabContent` chart: `h-[220px]` on mobile ✓. Refinance chart: `h-[280px]` (no mobile override) — acceptable, but should be verified at 320px that chart does not crowd the MobileSectionCard. Axes use `tick={{ fontSize: 10 }}` ✓. `tickFormatter` for Y-axis: `$${v/1000}k` (abbreviated) ✓. |
| H2 | Tooltips on tap; do not overflow viewport | **Fail (partial)** | **P2** | **Mortgage and Projections:** Tooltips have `max-w-[180px]` on mobile variant ✓. **Refinance** (`refinance-workspace.tsx:500–515`): Tooltip div uses `className="rounded border border-border bg-card px-3 py-2 text-sm shadow-sm"` — no `max-w` constraint and **no mobile-specific variant** despite `isMobile` being available in the component. At 320px, a tooltip showing "Current loan: $XXX,XXX" and "If refinanced: $XXX,XXX" could overflow the right edge. **New finding.** |
| H3 | Legend readable or intentionally hidden on mobile | **Pass** | — | `ProjectionsTabContent` line 992: `{!isMobile && <Legend />}` — legend explicitly hidden on mobile; colored dots in `MortgageTabContent` and inline legend spans (`app/app/(app)/properties/[id]/mortgage-tab-content.tsx:733-741`) render below chart without `isMobile` guard — visible on mobile ✓. Refinance chart: no `<Legend>` component at all; inline legend uses two colored dots below chart, not guarded — visible on mobile ✓. Acceptable. |

---

### I. Performance and perceived performance

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| I1 | Time to interactive acceptable on mid-tier mobile | **N/A (static)** | — | `ProjectionsTabContent` and `MortgageTabContent` loaded via `next/dynamic` with `ssr: false`. Charts dynamically loaded. Cannot assess LCP/TTI without Lighthouse mobile run. |
| I2 | Scroll jank not severe on long forms | **N/A (static)** | — | Deal Analyzer mobile form split into `MobileCollapsible` sections. Projections tab heavy chart/controls behind collapsibles. Add Property Wizard uses step-by-step paging to minimize DOM. Architecture favorable. Runtime verification needed. |
| I3 | Large lists: virtualization or pagination acceptable | **Pass (static)** | — | Properties page uses plan-gated `take: propertyLimit` upper bound on DB query. Server-rendered list. No virtual scroll needed at typical plan limits. |

---

### J. Accessibility (mobile-relevant)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| J1 | Focus order logical; VoiceOver/TalkBack spot-check on primary flow | **Fail (two items)** | **P2** | **(Carryover)** `AppLayoutClient` drawer close does not return focus to hamburger trigger — WCAG 2.1 SC 2.4.3 violation (see C1). **(New finding)** `MobileCollapsible` toggle button (`mobile-collapsible.tsx:26–35`) has no `aria-expanded` attribute. Used on all tool surfaces (Deal Analyzer: 4 collapsibles, Mortgage: 2, Projections: 3, Refinance: 1, PricingCards, Dashboard). Without `aria-expanded`, screen readers cannot inform users of open/closed state. No `aria-controls` linking button to content panel. WCAG 4.1.2 non-conformance for all collapsible sections in the app. |
| J2 | Contrast of text vs background meets WCAG intent | **Pass (assumed)** | — | All text uses design-spec semantic tokens. Cannot verify computed contrast ratios without DevTools. Assuming design-spec compliance per policy. |
| J3 | No seizure-inducing flashing; `prefers-reduced-motion` respected | **Pass** | — | `app-respect-reduced-motion` CSS class applied to drawer transition and backdrop in `AppLayoutClient` ✓. Defined in `globals.css:194–201` with `transition-duration: 0.01ms` ✓. `LandingNav` drawer uses same class. No rapid flashing patterns detected. |

---

### K. Authentication, billing, and plan limits

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| K1 | Clerk sign-in/sign-up usable at 320px | **N/A (runtime)** | — | Clerk modal behavior at 320px is human-only scope. |
| K2 | Plans/pricing cards scannable; CTAs full-width on mobile | **Pass (static)** | — | `PricingCards` uses `MobileCollapsible` for feature lists (defaultOpen=false on mobile — features collapsed but plan name, price, and CTA remain visible). Primary CTAs: full-width `block w-full` pattern ✓. |
| K3 | Plan limit messaging visible; upgrade paths reachable | **Pass** | — | `OverLimitBanner` in `AppLayoutClient` ✓. Deal Analyzer: deal-limit message in `mobileHeader` with `UpgradePlanLink` ✓. `PastDueBanner` in app layout ✓. Refinance: no plan-limit surface (appropriate — refinance is available to all tiers). |

---

### L. Security and privacy (mobile context)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| L1 | Sensitive fields not obscured in way that encourages screenshotting | **Pass** | — | No credential or authentication fields in audited tool components. Financial figures are user-entered, not secret. |
| L2 | Session behavior on shared device | **Pass (static)** | — | Session managed by Clerk. No custom session handling detected that would expose wrong account. |

---

### M. Cross-surface consistency

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| M1 | Same metric names mean the same thing across surfaces | **Pass** | — | "Cap rate", "DSCR", "Cash-on-cash", "Monthly cash flow", "Equity", "NOI", "LTV" — consistent across Deal Analyzer, Dashboard, Properties, and all MobileToolShell summary rails. Refinance uses "Monthly savings", "Break-even", "P&I" — context-specific, no policy conflicts. |
| M2 | Currency formatting consistent | **Pass** | — | `formatCurrency` used throughout. Refinance uses `formatMoneySigned` for signed values — locale-consistent with minus sign `−` (U+2212). `formatCurrency` pattern unchanged. |
| M3 | Date formatting consistent | **Pass** | — | Refinance payoff dates: `toLocaleDateString` ✓. Projections: none (year labels). Mortgage: `toLocaleDateString("en-US", { month: "short", year: "numeric" })` ✓. |

---

### N. Desktop non-regression (constraint)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| N1 | At ≥768px, previously expected desktop layouts present | **Pass** | — | `MobileToolShell` root: `md:hidden` ✓. Refinance mobile shell: `div.md:hidden` wrapper ✓. Desktop content: `div.hidden.md:block` ✓. All desktop layouts confirmed present at ≥768px. |
| N2 | Feature parity: mobile does not delete logic, only progressively discloses | **Pass** | — | `MobileCollapsible` renders children directly on desktop (`if (!isMobile) return <>{children}</>`) ✓. Refinance: all inputs and chart present in both mobile `MobileToolShell` and desktop `div.hidden.md:block` branches. Wizard: same 4 steps on mobile and desktop. |

---

### O. Automated coverage (confidence)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| O1 | `npm run test` green; includes `MobileToolShell` unit tests | **Pass (not re-run this pass)** | — | `mobile-tool-shell.test.tsx` exists with 4 unit tests covering: eyebrow/title/summary/context/children render, footer render, modes + `MobileModeSwitcher`, children-over-modes priority, `md:hidden` on root. No re-run in this pass. |
| O2 | `lib/` math tests unchanged in intent; mobile UI is presentation-only | **Pass** | — | No math logic in mobile primitives or new surfaces. `computePropertyMetrics`, `getRefinanceProjection`, `computePublicCalculatorResult`, etc. called from presentation components only. |

---

### P. Marketing and public pages (mobile)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| P1 | Landing and calculator pages scannable; CTA hierarchy clear at 320px | **Pass** | — | Public Calculator: `MobileToolShell` with summary rail always visible on narrow widths ✓. All `inputMode` attributes confirmed present (fixed since prior run) ✓. Landing hero: single-column at < sm, `w-full min-h-[44px]` primary CTA ✓. |
| P2 | SEO-critical content not hidden only behind interactions that hurt discovery | **Pass** | — | FAQ section on calculator page uses `<details>/<summary>` — crawlable ✓. No critical copy gated behind JS-only interactions. |

---

## Severity-ranked findings

### P0 — Blocker

- None identified in static review.

### P1 — Major

- None identified in static review. **Risk watch:** The full viewport matrix and real-device verification remain unexecuted, leaving open the possibility of undetected P1 issues at runtime (safe-area, keyboard coverage, native `<select>` behavior).

### P2 — Moderate

- **F1 — App nav drawer: focus not returned to trigger on close** *(carryover from 2026-04-03)*  
  `AppLayoutClient` `closeDrawer` (`app-layout-client.tsx:76`) does not call `focus()` on the hamburger button after close. Keyboard users and VoiceOver/TalkBack lose focus context. Pattern to mirror: `LandingNav` `closeMenu` → `menuButtonRef.current?.focus()`.  
  *Source:* `app/app/(app)/app-layout-client.tsx` lines 76, 129–148, 179–186.

- **F2 — Properties and Dashboard action links: ~32px touch height** *(carryover from 2026-04-04)*  
  "Open Modeling" and "Open Mortgage" links on properties list cards use `py-1.5 text-sm rounded-md` (≈ 32px). Dashboard quick-action links (lines 176–245 of `dashboard/page.tsx`) use `py-1.5 text-sm` (≈ 32px). Below 44px minimum.  
  *Source:* `app/app/(app)/properties/page.tsx` lines 503, 601. `app/app/(app)/dashboard/page.tsx` lines 176–245.

- **F3 — `MobileCollapsible` missing `aria-expanded`** *(new finding)*  
  `MobileCollapsible` toggle button (`mobile-collapsible.tsx:26–35`) has no `aria-expanded` or `aria-controls` attributes. Used across all tool surfaces: Deal Analyzer (4 collapsibles), Mortgage (2), Projections (3), Refinance (1), PricingCards, Dashboard. Screen readers cannot communicate open/closed state. WCAG 4.1.2 non-conformance on all collapsible sections app-wide. Fix: add `aria-expanded={open}` to the `<button>` and an `id` + `aria-controls` on the content `<div>`.  
  *Source:* `app/components/mobile-collapsible.tsx` lines 26–35.

- **F4 — Refinance Workspace chart tooltip: no viewport-overflow guard** *(new finding)*  
  `RefinanceWorkspace` chart tooltip (`refinance-workspace.tsx:500–515`) renders `<div className="rounded border border-border bg-card px-3 py-2 text-sm shadow-sm">` with no `max-w` constraint and no `isMobile`-specific variant. On narrow viewports (320–375px), tooltip content ("Current loan: $XXX,XXX / If refinanced: $XXX,XXX") can overflow the right viewport edge. All other charts in the app include `max-w-[180px]` on their mobile tooltip variant.  
  *Source:* `app/app/(app)/refinance/refinance-workspace.tsx` lines 492–515.

### P3 — Minor

- **G1 — `MobileModeSwitcher` buttons borderline at ~40px** *(carryover — component unused in production)*  
  `MobileModeSwitcher` (`mobile-mode-switcher.tsx:31`) buttons use `py-2.5 text-sm` (≈ 40px). No `min-h-[44px]`. Currently not exercised in production (no active `MobileToolShell` usage passes `modes`). Fix proactively before enabling `modes` on any tool shell.  
  *Source:* `app/components/mobile-mode-switcher.tsx` line 31.

- **G2 — `MobileSegmentedView` buttons sub-44px** *(new finding — component unused in production)*  
  `MobileSegmentedView` (`mobile-segmented-view.tsx:37`) buttons use `py-2 text-sm` (≈ 36px). No `min-h-[44px]`. Component definition only — not imported anywhere. Add `min-h-[44px]` before activating.  
  *Source:* `app/components/mobile-segmented-view.tsx` line 37.

- **G3 — `MockupFrame` initial paint / CLS risk** *(carryover from prior runs)*  
  `MockupFrame` starts `scale === 0` / `opacity: 0` until `ResizeObserver` fires. Potential invisible-to-visible flash or layout shift on landing. Not confirmed in DevTools.  
  *Source:* `app/components/mockups/mockup-frame.tsx`.

- **G4 — Deal Analyzer B4 metric duplication at 320px** *(observation)*  
  Summary rail (Cash flow / Cap rate / DSCR / Cash-on-cash) duplicated in "Live result" MobileSectionCard body. Intentional for scrolled-down scanability but may feel dense at 320px. Flag for PM.

- **G5 — State `<select>` missing `autoComplete="address-level1"`** *(new observation)*  
  State selects in Deal Analyzer mobile form (`deal-analyzer-form.tsx:588`) and wizard do not carry `autoComplete="address-level1"`. Minor impact since state selection is a short single-select.

---

## Fixed since prior run (2026-04-04)

| Prior finding | Status | Evidence |
|--------------|--------|---------|
| F2 — Stress test preset buttons ~24px | **Fixed ✅** | `deal-analyzer-form.tsx:872,1441`: both now have `min-h-[44px]` |
| F3 — WorkspaceNavMobile chips ~32px | **Fixed ✅** | `workspace-nav-mobile.tsx:24,30,36`: all have `min-h-[44px]` |
| F4 — PublicCalculator missing `inputMode` | **Fixed ✅** | `public-calculator.tsx`: all 7 inputs now carry `inputMode="decimal"` or `inputMode="numeric"` |

---

## Evidence reviewed

| Component / Path | What was verified |
|-----------------|-------------------|
| `app/components/mobile-tool-shell.tsx` | Props, `md:hidden` root, safe-area footer, modes vs children |
| `app/lib/use-is-mobile.ts` | `useSyncExternalStore`, `getServerSnapshot = false`, `(max-width: 767px)` |
| `app/components/mobile-bottom-nav.tsx` | `min-h-[44px]`, `pb-[env(safe-area-inset-bottom)]`, aria labels, "More" event dispatch |
| `app/components/mobile-collapsible.tsx` | `min-h-[44px]`, no `aria-expanded`, desktop passthrough |
| `app/components/mobile-summary-rail.tsx` | Grid layout, tone classes, item rendering, empty return |
| `app/components/mobile-mode-switcher.tsx` | `py-2.5` button height (~40px), unused in production |
| `app/components/mobile-segmented-view.tsx` | `py-2` button height (~36px), unused in production |
| `app/components/mobile-section-card.tsx` | Tone classes, grid-cols usage |
| `app/app/(app)/app-layout-client.tsx` | Drawer open/close/focus, safe-area, `MobileBottomNav`, `closeDrawer` missing focus |
| `app/app/(app)/app-nav.tsx` | `open-mobile-menu` custom event listener ✓ |
| `app/app/(app)/dashboard/workspace-nav-mobile.tsx` | All chips now `min-h-[44px]` ✓ |
| `app/app/(app)/dashboard/page.tsx` | Action links `py-1.5` remaining touch target issue |
| `app/app/(app)/analyze/deal-analyzer-form.tsx` | Full mobile/desktop branching, stress test buttons fixed, summary rail, footer |
| `app/app/(app)/properties/page.tsx` | "Open Modeling"/"Open Mortgage" `py-1.5` remaining touch target issue |
| `app/app/(app)/properties/[id]/projections-tab-content.tsx` | `MobileToolShell` branch, `{!isMobile && <Legend />}`, `isMobile` chart height |
| `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` | `MobileToolShell` branch, mobile tooltip `max-w-[180px]` ✓, inline legend ✓ |
| `app/app/(app)/refinance/refinance-workspace.tsx` | **First coverage:** `MobileToolShell` in `md:hidden` wrapper, chart tooltip missing `max-w`, mobile context selects |
| `app/app/(app)/properties/add-property-wizard.tsx` | **First coverage:** `MobileToolShell` usage, WizardStepNav `overflow-x-auto`, footer `min-h-[44px]` ✓ |
| `app/components/marketing/public-calculator.tsx` | `inputMode` confirmed on all 7 inputs ✓ |
| `app/components/currency-input.tsx` | `type="text" inputMode="decimal"` ✓ |
| `app/components/landing-nav.tsx` | Focus management ✓, `menuButtonRef.current?.focus()` on close ✓ |
| `app/app/globals.css` | `.app-safe-area-top`, `.app-safe-area-bottom`, `.app-respect-reduced-motion` |

**Assumptions / limits of this pass:**
- No browser DevTools, Lighthouse, or physical device used.
- Runtime checks (A1, A3, A4, D3, E3, H2, I1–I3, J1 VoiceOver, K1) are not satisfied by static review.
- `docs/policies/design-spec.md` and `docs/policies/analytics-math-policy.md` not directly read; consistency checked by pattern-matching semantic tokens and metric labels in code.

---

## Risk and impact assessment

| Finding | Business / user impact | Likelihood of user impact |
|---------|----------------------|--------------------------|
| F1 — Focus not returned to drawer trigger | WCAG 2.4.3 violation; keyboard/VoiceOver users lose focus context after drawer close | Medium — affects keyboard and assistive-tech users on every navigation |
| F2 — Properties/dashboard action links 32px | Mis-taps on "Open Modeling" / "Open Mortgage" links in properties list and dashboard quick actions | Medium — frequent interaction path for core users |
| F3 — `MobileCollapsible` missing `aria-expanded` | Screen readers cannot inform users of expand/collapse state; collapsible sections effectively inaccessible to AT users | Medium — affects all VoiceOver/TalkBack users using tool surfaces |
| F4 — Refinance chart tooltip no `max-w` | Tooltip text overflows at 320–375px, partially obscuring content | Low-medium — affects Refinance surface specifically; 320px phones most at risk |
| G1 — MockupFrame CLS | Potential landing page perceived quality impact | Low — not confirmed |
| G2/G3 — Unused component touch targets | Latent defect; no current user impact; risk activates when components are used | Low (preemptive) |
| No viewport matrix | Undetected regressions at 320px, 768px boundary, and real-device scenarios | Unknown |

---

## Task candidates

- [ ] **`app/components/mobile-collapsible.tsx`:** Add `aria-expanded={open}` to the toggle `<button>`; assign a stable `id` to the content `<div>` and `aria-controls={contentId}` to the button. This fixes WCAG 4.1.2 for all collapsible sections app-wide.
- [ ] **`app/app/(app)/app-layout-client.tsx`:** Add `menuButtonRef = useRef<HTMLButtonElement>(null)` and attach to the hamburger `<button>`; call `menuButtonRef.current?.focus()` inside `closeDrawer`, Escape handler, and backdrop click — mirrors `LandingNav` pattern.
- [ ] **`app/app/(app)/refinance/refinance-workspace.tsx`:** Add mobile-specific tooltip variant inside the Recharts `<Tooltip content={...}>` (guard with `isMobile` already imported); add `max-w-[180px]` to the mobile div, mirroring `mortgage-tab-content.tsx:680–688`.
- [ ] **`app/app/(app)/properties/page.tsx`:** Raise "Open Modeling" and "Open Mortgage" link padding to `py-2` or add `min-h-[44px]` (lines 503, 601).
- [ ] **`app/app/(app)/dashboard/page.tsx`:** Raise quick-action link padding from `py-1.5` to `py-2` or `min-h-[44px]` across lines 176–245.
- [ ] **`app/components/mobile-mode-switcher.tsx`:** Add `min-h-[44px]` to the `<button>` element (line 31) — proactive fix before any `modes` usage activates.
- [ ] **`app/components/mobile-segmented-view.tsx`:** Add `min-h-[44px]` to the `<button>` element (line 37) — proactive fix before first usage.
- [ ] **Manual:** Execute full viewport matrix (320, 375, 390, 430, 767/768px) + one real iOS/Android device on all §5 routes — safe-area, native `<select>`, keyboard, scroll momentum, VoiceOver focus on collapsible sections.

---

## Re-test checklist

- [ ] `MobileCollapsible`: open/close with VoiceOver/TalkBack — verify state is announced.
- [ ] `AppLayoutClient`: open drawer → close via backdrop / Escape / hamburger → verify focus returns to "Open menu" button.
- [ ] Refinance chart tooltip: at 375px width, tap a data point — verify tooltip does not overflow right edge.
- [ ] Properties list: "Open Modeling" and "Open Mortgage" links meet 44px at 375px.
- [ ] Dashboard quick-action links: confirm 44px target at 375px.
- [ ] 320–767px: `/`, `/investment-property-calculator`, `/dashboard`, `/properties`, `/analyze`, `/modeling`, `/mortgage`, `/refinance` — no unintended horizontal scroll.
- [ ] Real device (iOS or Android): native `<select>` state picker, keyboard behavior on CurrencyInput fields, safe-area on `/analyze` footer.
- [ ] After any code fix: `npx vitest run mobile-tool-shell`; `npm run check` when applicable.

---

## Next trigger and cadence

- **Trigger:** Changes to `MobileCollapsible`, `app-layout-client.tsx`, `RefinanceWorkspace`, `properties/page.tsx`, `dashboard/page.tsx`, or any new `MobileToolShell` surface added to §5 inventory.
- **Cadence:** Monthly or before major release. Full viewport matrix once per release cycle.
- **Human-only items:** Viewport matrix (320–430px, 767/768px), real-device keyboard/safe-area/scroll, VoiceOver/TalkBack primary flow.
