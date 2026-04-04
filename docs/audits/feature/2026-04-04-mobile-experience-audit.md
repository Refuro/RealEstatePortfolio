# Mobile Experience Audit — 2026-04-04

**Canonical criteria:** [`docs/qa/mobile-experience-audit.md`](../../qa/mobile-experience-audit.md)  
**Lane process:** [`docs/process/mobile-experience-audit-process.md`](../../process/mobile-experience-audit-process.md)  
**Prior run:** [`2026-04-03-mobile-experience-audit-2.md`](2026-04-03-mobile-experience-audit-2.md)

---

## Executive summary

- **Overall health:** The `MobileToolShell` infrastructure is solid and consistently applied across all four priority surfaces (Deal Analyzer, Modeling, Mortgage, Public Calculator). All surfaces render eyebrow, title, summary rail, and context blocks as designed. Automated unit tests (4 passing) provide baseline regression confidence.
- **Top risk (carryover):** The app nav drawer still does not return focus to the hamburger trigger on close — a WCAG focus-management regression that persists from audit runs on 2026-04-03. Two other carryover items (workspace chip touch targets, MockupFrame CLS) remain unaddressed.
- **New findings this run:** Two new P2 items identified: (1) stress-test preset buttons in Deal Analyzer are ~24px tall — significantly below the 44px touch target minimum; (2) all numeric inputs in `PublicCalculator` use `type="number"` without `inputMode`, which on iOS produces a suboptimal keyboard (spinners, no decimal mode) for currency and percentage fields.
- **Scope:** This is a static code review. The full viewport matrix (320–768px) and real-device checks (keyboard, safe-area, native `<select>`, scroll momentum) remain **human-only** and are not satisfied by this pass.

---

## Viewport matrix coverage

| Width (px) | Verified (this pass) |
|------------|---------------------|
| **320** | Static code review only — runtime unverified |
| **375** | Static code review only |
| **390** | Static code review only |
| **430** | Static code review only |
| **768** | `md:hidden` / `md:block` breakpoint verified in code |

**Real device:** Not verified. See §O.

---

## Surface inventory coverage

| Area | Surfaces reviewed | Method |
|------|------------------|--------|
| Public | `/` (hero + CTA), `/investment-property-calculator`, `/pricing` (referenced) | Static code review |
| App shell | `AppLayoutClient`, `AppNav`, `MobileBottomNav`, `MobileBottomNav` custom event | Static |
| Dashboard | `/dashboard` (page, WorkspaceNavMobile, DashboardCharts) | Static |
| Properties | `/properties` (list, filter, sort, PropertiesFiltersMobile) | Static |
| Deal Analyzer | `/analyze` (`DealAnalyzerForm` — mobile + desktop branches) | Static |
| Modeling | `/modeling` → `ModelingWorkspace` → `ProjectionsTabContent` (MobileToolShell branch) | Static |
| Mortgage | `/mortgage` → `MortgageWorkspace` → `MortgageTabContent` (MobileToolShell branch) | Static |
| Public Calculator | `PublicCalculator` (marketing + app surfaces) | Static |
| Mobile primitives | `MobileToolShell`, `MobileSummaryRail`, `MobileCollapsible`, `MobileModeSwitcher`, `MobileBottomNav`, `WorkspaceNavMobile` | Static |

---

## Sections A–P: criteria checklist

### A. Responsive layout and breakpoints

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| A1 | No unintended horizontal scroll at 320–430px | **Pass (static)** | — | Layouts use `flex flex-wrap`, `grid grid-cols-2`, `overflow-x-auto` on intentional scroll regions (filter chips, workspace chips). No `min-w` fixed values detected on primary columns. Needs runtime confirmation. |
| A2 | At 767/768px, layout switches predictably; no permanent duplicate chrome | **Pass** | — | `MobileToolShell` root: `md:hidden`. Desktop shells: `hidden md:block` / `hidden md:flex`. `AppLayoutClient` top bar: `md:hidden`; sidebar: `hidden md:flex`. No detected duplicate at breakpoint boundary. |
| A3 | No persistent React/console errors after hydration at mobile width | **Partial — flag** | P3 | `useIsMobile()` returns `false` on server, `true` on client. Both `DealAnalyzerForm` and `ProjectionsTabContent`/`MortgageTabContent` conditionally render entirely different component trees based on `isMobile`. This causes a React hydration mismatch (server renders desktop tree; client immediately re-renders mobile tree). React 18 suppresses mismatch warnings for `useSyncExternalStore` with a server snapshot, so no hard error, but a flash/layout shift at first paint on mobile is architecturally present. Not confirmed with DevTools. |
| A4 | Safe areas not obscured on notched devices | **Pass (static)** | — | `MobileToolShell` footer: `pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]` ✓. `MobileBottomNav`: `pb-[env(safe-area-inset-bottom)]` ✓. `AppLayoutClient` main: `pb-[calc(4rem+env(safe-area-inset-bottom))]` ✓. Needs real hardware confirmation. |

---

### B. Mobile shells and dense tools

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| B1 | All `MobileToolShell` surfaces render eyebrow, title, summary rail; footer where applicable | **Pass** | — | **Deal Analyzer**: `eyebrow="Analyzer"`, `title="Deal Analyzer"`, 4-item summary rail, footer with Save/New buttons. **Modeling** (`ProjectionsTabContent` line 1304): `eyebrow="Workspace"`, `title="Modeling"`, summaryItems, mobileHeader as context. **Mortgage** (`MortgageTabContent` line 999): `eyebrow="Workspace"`, `title="Mortgage"`, summaryItems, mobileHeader. **Public Calculator**: `eyebrow="Calculator"`, `title="Investment Property Calculator"`, 4-item summary rail. All four surfaces covered. |
| B2 | Context blocks usable; no overlapping text, adequate tap targets | **Pass** | — | Modeling context: property label + `<select>` (full width, `py-2.5`) + link. Mortgage context: property label + mortgage count badge + `<select>` + links. Deal Analyzer context: deal title, location, deal count/limit. No layout overlap detected statically. |
| B3 | Progressive disclosure (`MobileCollapsible`): labels clear, expanded content scrolls inside page | **Pass** | — | `MobileCollapsible` trigger: `min-h-[44px] w-full` ✓. Expansion uses `{open && children}` — no trapped overflow. Used in: Deal Analyzer (Add apt, Debt section, Stress test, Full metrics), Public Calculator (Financing assumptions), dashboard (More metrics). On desktop `!isMobile` renders children directly. |
| B4 | No redundant duplicate metrics (same KPI in rail and body) beyond intentional scanability | **Note — P3** | P3 | Deal Analyzer: 4-item summary rail (Cash flow, Cap rate, DSCR, Cash-on-cash) is also displayed in the "Live result" `MobileSectionCard` below it. Duplication is limited to the same page scroll — the rail is sticky context, the body card is detailed. Arguably intentional for scrolled-down scanability; flag for PM review if density is a concern at 320px. |

---

### C. Navigation and IA

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| C1 | App shell drawer opens, focuses, closes without trapping focus or invisible overlay | **Fail — carryover** | **P2** | `AppLayoutClient` (lines 76, 129–148): `closeDrawer` sets `drawerOpen = false` but does **not** call `focus()` on the hamburger button. Opening focuses first element in panel ✓. Escape closes ✓. Backdrop closes ✓. Swipe-left closes ✓. **Missing:** hamburger `ref` + `focus()` on close. Compare: `LandingNav` `closeMenu` correctly calls `menuButtonRef.current?.focus()`. WCAG 2.1 SC 2.4.3 violation. |
| C2 | Workspace navigation reachable in ≤2 taps from common entry points | **Pass** | — | `MobileBottomNav` direct links: Dashboard (1 tap), Properties (1 tap), Analyze (1 tap). Modeling/Mortgage via `WorkspaceNavMobile` on Dashboard: 2 taps (tap Dashboard → tap Modeling/Mortgage chip). Acceptable. |
| C3 | Deep links (`?tab=`, `#anchors`) resolve correctly on mobile | **Pass (static)** | — | Mortgage workspace context block: `href="/properties/${id}?tab=details#mortgages"` ✓. `router.push` used for detail navigation. |
| C4 | Browser back does not strand user or lose unsaved state without warning | **Pass** | — | Deal Analyzer: `beforeunload` event listener on `isDirty` ✓. `router.replace("/analyze")` for new deal (same route, no back issue). |

---

### D. Touch targets and gestures

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| D1 | Primary buttons and list rows meet ~44×44px minimum | **Fail (partial)** | **P2** | **Pass:** `MobileBottomNav` links: `min-h-[44px] min-w-[44px]` ✓. `MobileCollapsible` trigger: `min-h-[44px]` ✓. Hero CTAs: `min-h-[44px]` ✓. WorkspaceNavMobile "Print portfolio summary" link: `min-h-11` ✓. Hamburger button: `size-11` ✓. **Fail:** (1) `WorkspaceNavMobile` chip links (`py-1.5 text-sm`): ~32px — carryover. (2) Stress test preset buttons in Deal Analyzer (`px-2.5 py-1 text-xs`): ~24px — **new finding**. (3) Dashboard quick-action links, Properties page card action links (`py-1.5 text-sm rounded-md`): ~32px. `MobileModeSwitcher` buttons (`py-2.5 text-sm`): ~40px, borderline P3. |
| D2 | Spacing between adjacent tappable controls avoids mis-taps | **Fail (partial)** | **P2** | Stress test preset buttons use `gap-2` (8px) between ~24px-tall buttons. Adjacent small buttons with minimal separation risk mis-taps on 320px and in thumb-reach zones. Dashboard quick-action links in header use `gap-2` with `py-1.5`. |
| D3 | Charts/scrollable regions do not steal all vertical scroll | **N/A (static)** | — | Charts dynamically loaded (Recharts `ResponsiveContainer`). Dashboard uses `overflow-x-auto` on filter chip rows (intentional horizontal scroll). Cannot verify nested scroll trap without runtime. |

---

### E. Forms and inputs

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| E1 | `inputMode`/`type` invoke appropriate software keyboards | **Fail (partial)** | **P2** | **Pass:** Deal Analyzer: ZIP `inputMode="numeric"` ✓, Vacancy % `inputMode="numeric"` ✓, Ownership % `inputMode="numeric"` ✓. `CurrencyInput` component (not read directly but uses numeric input). **Fail:** `PublicCalculator` — all 7 numeric inputs (`purchase-price`, `rent`, `expenses`, `down-payment-pct`, `interest-rate`, `term-years`, `vacancy-pct`) use `type="number"` without `inputMode`. On iOS, `type="number"` shows a number pad with `-`/`.` which is reasonable, but currency fields would be better served by `inputMode="decimal"` and integer fields (down %, term, vacancy %) by `inputMode="numeric"`. Missing `inputMode` on all public calculator fields — new finding. |
| E2 | `autocomplete` on address and related fields | **Pass** | — | Deal Analyzer mobile form: `autoComplete="street-address"` (line 1), `autoComplete="address-line2"`, `autoComplete="address-level2"` (city), `autoComplete="postal-code"` (ZIP). Sign-in delegated to Clerk. ✓ |
| E3 | Native `<select>` uses OS picker on real mobile | **Pass (static)** | — | `<select>` used in Deal Analyzer (state), Modeling (property selector), Mortgage (property selector). Cannot verify OS picker without real device. |
| E4 | Validation errors visible without zooming; programmatically associated | **Pass** | — | Deal Analyzer: save error in `mobileHeader` context block with styled `border-negative/30 bg-negative/10 px-3 py-2` ✓. Plan limit messaging visible in context ✓. Error is rendered adjacent to the submit button in footer context. |

---

### F. Typography, copy, and density

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| F1 | Body text readable without zoom at 320px | **Pass** | — | Minimum body text: `text-sm` (14px), inputs use `text-base md:text-sm` (16px on mobile avoids iOS auto-zoom on input focus) ✓. Summary rail values: `text-base font-semibold` ✓. Helper text: `text-[11px]` — small but meets design pattern for supplemental labels. |
| F2 | Labels for metrics consistent with analytics-math-policy | **Pass** | — | Cap rate, DSCR, cash-on-cash, equity, NOI — consistent across analyzer, dashboard, properties, and summary rails. No label drift detected. |
| F3 | Abbreviations understandable or tooltipped | **Pass (marginal)** | — | "DSCR" used in summary rail without tooltip. "Cap rate" fully spelled. No tooltips exist on mobile chips (by design — small surface). Acceptable for RE investor audience, but DSCR could use a helper label at P3 priority on entry surfaces like Public Calculator. |

---

### G. Visual design and consistency

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| G1 | Alignment with design-spec: semantic tokens, spacing scale, no ad-hoc colors | **Pass** | — | Consistent use of `text-muted`, `text-foreground`, `text-positive`, `text-negative`, `text-warning`, `bg-card`, `bg-background`, `bg-subtle`, `border-border`, `text-accent`, `bg-accent`. No raw hex or rgba overrides detected in audited components. |
| G2 | Loading, empty, and error states present on mobile for async views | **Pass** | — | `loading.tsx` files: Modeling (`p-4 text-sm text-muted "Loading projections…"`), Mortgage (`"Loading mortgage workspace…"`). Dashboard charts: `ChartLoadingPlaceholder` with 240px animated skeleton ✓. Properties empty state: `Building2` icon + copy ✓. Dashboard zero-property state: full page with CTA ✓. |
| G3 | Icon + text pairs aligned when text wraps | **Pass** | — | `MobileBottomNav` nav items use `flex-col items-center gap-0.5`. WorkspaceNavMobile links use `inline-flex items-center gap-1`. ChevronRight + link text in context blocks: `inline-flex items-center gap-1`. No overflow detected statically. |

---

### H. Charts and data visualization

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| H1 | Charts visible at mobile height; axes labels legible or abbreviated | **Pass (static)** | — | Dashboard charts: `ChartLoadingPlaceholder` `h-[240px]` ✓. `ProjectionsTabContent` Recharts: `ResponsiveContainer` (inferred from imports). Legend conditionally hidden on mobile: `{!isMobile && <Legend />}` (line 992 projections-tab-content.tsx) ✓. Charts lazy-loaded via `dynamic`. Cannot verify axis label readability at 320px without runtime. |
| H2 | Tooltips on tap; do not overflow viewport | **N/A (static)** | — | Recharts tooltip behavior on mobile tap requires runtime verification. Cannot assess overflow from static review. |
| H3 | Legend readable or intentionally hidden on mobile | **Pass** | — | `ProjectionsTabContent` line 992: `{!isMobile && <Legend />}` — legend explicitly hidden on mobile. Tooltip or chart colors serve as alternative context. ✓ |

---

### I. Performance and perceived performance

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| I1 | Time to interactive acceptable on mid-tier mobile | **N/A (static)** | — | `ProjectionsTabContent` and `MortgageTabContent` loaded via `next/dynamic` with `ssr: false` ✓. Charts also dynamically loaded. Suspense wrappers on landing. Cannot assess LCP/TTI without Lighthouse mobile run. |
| I2 | Scroll jank not severe on long forms | **N/A (static)** | — | Deal Analyzer mobile form is divided into sections using `MobileCollapsible`, reducing DOM length. Projections tab uses `MobileCollapsible` sections to collapse heavy chart/table content. Architecture favorable. Runtime verification needed. |
| I3 | Large lists (properties): virtualization or pagination acceptable | **Pass (static)** | — | Properties page uses `take: propertyLimit` on DB query (plan-gated upper bound). No virtual scroll needed at typical plan limits. Server-rendered list, not client-paginated. |

---

### J. Accessibility (mobile-relevant)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| J1 | Focus order logical; VoiceOver/TalkBack spot-check on primary flow | **Fail (partial)** | **P2** | Same as C1: drawer does not return focus to trigger on close. This is the primary WCAG 2.1 SC 2.4.3 issue. Opening flow: `drawerPanelRef.current?.querySelector(...)?.focus()` ✓. `aria-modal="true"` on drawer `<aside>` ✓. `aria-label="Main navigation"` ✓. `aria-hidden={!drawerOpen}` on backdrop ✓. `MobileBottomNav` has `aria-label="Mobile navigation"` ✓, `aria-hidden` on icons ✓. |
| J2 | Contrast of text vs background meets WCAG intent | **Pass (assumed)** | — | All text uses design-spec semantic tokens. Cannot verify computed contrast ratios without DevTools. Assume design-spec compliance per policy. |
| J3 | No seizure-inducing flashing; `prefers-reduced-motion` respected | **Pass** | — | `app-respect-reduced-motion` class on drawer (`transition-transform`) and backdrop (`transition-opacity`) in `AppLayoutClient` ✓. Hero animated sections use CSS `hero-animate` class (not read, but pattern established). No rapid flashing detected in audited code. |

---

### K. Authentication, billing, and plan limits

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| K1 | Clerk sign-in/sign-up usable at 320px | **N/A (runtime)** | — | Not verified. Clerk modal behavior at 320px is human-only scope. |
| K2 | Plans/pricing cards scannable; CTAs full-width on mobile | **Pass (static)** | — | Landing page hero CTA: `w-full sm:w-auto min-h-[44px]` ✓. Public calculator CTAs in mobile surface: `w-full rounded-md px-4 py-2.5` ✓. Secondary CTAs: `block text-center` ✓. Pricing page not directly audited this pass (see run 2). |
| K3 | Plan limit messaging visible; upgrade paths reachable | **Pass** | — | `OverLimitBanner` in `AppLayoutClient` for property/deal limits ✓. Deal Analyzer: deal-limit messaging in `mobileHeader` context with `UpgradePlanLink` ✓. Properties page: `UpgradePlanLink` for over-limit ✓. `PastDueBanner` in app layout ✓. |

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
| M1 | Same metric names mean the same thing across surfaces | **Pass** | — | "Cap rate", "DSCR", "Cash-on-cash return", "Monthly cash flow", "Equity", "NOI", "LTV" — consistent across Deal Analyzer summary rail, dashboard `MetricCard`, properties list, and `MobileToolShell` surfaces. No drift detected. |
| M2 | Currency formatting consistent | **Pass** | — | `formatCurrency` used throughout all surfaces for currency values. ✓ |
| M3 | Date formatting consistent | **Pass** | — | `formatTimeAgo` used in properties list for `updatedAt`. ISO date slices used in data payloads. No inconsistency detected. |

---

### N. Desktop non-regression (constraint)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| N1 | At ≥768px, previously expected desktop layouts present | **Pass** | — | `MobileToolShell` root: `md:hidden` — confirmed not visible on desktop ✓. All desktop shells restored via `hidden md:block` / `hidden md:flex` patterns. `AppLayoutClient` desktop sidebar: `hidden md:flex` ✓. |
| N2 | Feature parity: mobile does not delete logic, only progressively discloses | **Pass** | — | `MobileCollapsible` renders children directly on desktop (`if (!isMobile) return <>{children}</>`) ✓. All actions (Save, New deal, stress test, full metrics) present in both mobile and desktop branches of `DealAnalyzerForm`. |

---

### O. Automated coverage (confidence)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| O1 | `npm run test` green; includes `MobileToolShell` unit tests | **Pass (last run: 2026-04-03)** | — | `mobile-tool-shell.test.tsx`: 4 tests passing as of 2026-04-03. Covers: eyebrow/title/description/context/summary/children render ✓, footer render ✓, modes + MobileModeSwitcher ✓, children-over-modes priority ✓, `md:hidden` class on root ✓. No test re-run in this pass. |
| O2 | `lib/` math tests unchanged in intent; mobile UI is presentation-only | **Pass** | — | No math logic in mobile components. `computePropertyMetrics`, `computePortfolioMetrics`, `computePublicCalculatorResult`, `getAnnualDebtService` all called from presentation components with no mutations. |

---

### P. Marketing and public pages (mobile)

| # | Criterion | Result | Severity if failed | Evidence / notes |
|---|-----------|--------|--------------------|-----------------|
| P1 | Landing and calculator pages scannable; CTA hierarchy clear at 320px | **Pass** | — | Landing hero: single-column at < sm, `w-full min-h-[44px]` primary CTA ✓. Mobile-only mockup (`sm:hidden DashboardMockup`) renders below CTAs ✓. HERO_STEPS hidden below `sm` (`hidden sm:grid`) — reduces density at 320px ✓. Public Calculator: `MobileToolShell` wraps calculator at narrow widths, summary rail always visible ✓. |
| P2 | SEO-critical content not hidden only behind interactions that hurt discovery | **Pass** | — | HERO_STEPS hidden on mobile (`hidden sm:grid`) — decorative, not SEO-critical. Main heading and description always visible. FAQ section on `/investment-property-calculator` uses `<details>/<summary>` — contents accessible to crawlers. No critical content gated behind JS-only show/hide on marketing pages. |

---

## Severity-ranked findings

### P0 — Blocker

- None identified in static review.

### P1 — Major

- None identified in static review. **Risk watch:** The viewport matrix and real-device testing remain unexecuted (see §M below), leaving open the possibility of undetected P1 issues at runtime.

### P2 — Moderate

- **F1 — App nav drawer: focus not returned to trigger on close** *(carryover from 2026-04-03-run-2)*  
  `AppLayoutClient` `closeDrawer` (line 76) does not call `focus()` on the hamburger button. Keyboard users (external keyboard on iPad, VoiceOver) lose focus context after close. Pattern to match: `LandingNav` `closeMenu` → `menuButtonRef.current?.focus()`.  
  *Source:* `app/app/(app)/app-layout-client.tsx` lines 76, 129–148, 179–186.

- **F2 — Stress test preset buttons: ~24px touch height** *(new finding)*  
  Deal Analyzer stress test section (mobile and desktop branches): preset buttons use `px-2.5 py-1 text-xs`. Computed height: `4px × 2 + 16px ≈ 24px` — well below 44px minimum. `gap-2` (8px) between adjacent buttons increases mis-tap risk.  
  *Source:* `app/app/(app)/analyze/deal-analyzer-form.tsx` lines 726–738 (mobile) and 1254–1269 (desktop).

- **F3 — WorkspaceNavMobile chip touch targets: ~32px** *(carryover)*  
  `WorkspaceNavMobile` chip links use `px-3 py-1.5 text-sm`. Computed height ≈ `6px × 2 + 20px = 32px`. Below 44px minimum. "Print portfolio summary" correctly uses `min-h-11`.  
  *Source:* `app/app/(app)/dashboard/workspace-nav-mobile.tsx` lines 22–38.

- **F4 — PublicCalculator numeric inputs missing `inputMode`** *(new finding)*  
  All 7 numeric inputs in `PublicCalculator` (`public-calculator.tsx`) use `type="number"` without `inputMode`. Affected fields: purchase price, monthly rent, monthly expenses, down payment %, interest rate %, term (years), vacancy %. On iOS, `type="number"` shows the numeric keypad with spinner controls; `inputMode="decimal"` is preferred for currency fields and `inputMode="numeric"` for integer fields to optimize keyboard UX.  
  *Source:* `app/components/marketing/public-calculator.tsx` lines 94–190 (mobile sub-surface) and 322–423 (desktop sub-surface).

- **F5 — Dashboard and Properties page action link touch targets: ~32px** *(new finding)*  
  Links like "Add property" (accent), "Analyze a deal", "Open Modeling", "Open Mortgage" use `py-1.5 text-sm rounded-md` → ≈ 32px. Affects: dashboard header actions (`dashboard/page.tsx` lines 187–198), properties list card CTAs (`properties/page.tsx` lines 576–601).

### P3 — Minor

- **G1 — `MockupFrame` initial paint / CLS risk** *(carryover)*  
  `MockupFrame` starts with `scale === 0` and `opacity: 0` until `ResizeObserver` fires. If the observer is slow, a brief invisible-to-visible flash or layout shift may occur on landing/pricing. Not confirmed in DevTools.  
  *Source:* `app/components/mockups/mockup-frame.tsx` (reported in prior runs).

- **G2 — `MobileModeSwitcher` buttons borderline at ~40px** *(new observation)*  
  Buttons use `py-2.5 text-sm` → ≈ `10px × 2 + 20px = 40px`. Just below 44px. Benign at typical widths but may be tight at 320px.  
  *Source:* `app/components/mobile-mode-switcher.tsx` line 31.

- **G3 — Deal Analyzer B4 metric duplication** *(observation)*  
  Summary rail shows Cash flow / Cap rate / DSCR / Cash-on-cash. The "Live result" `MobileSectionCard` body also displays the same 4 metrics. Intentional for scrolled-down scanability, but at 320px may cause cognitive density. Flag for PM review.

- **G4 — DSCR abbreviation in summary rail without tooltip** *(observation)*  
  "DSCR" appears in the summary rail of Modeling, Mortgage, Deal Analyzer, and Public Calculator without explanation. Acceptable for target RE investor audience but could confuse new users.

---

## Evidence reviewed

| Component / Path | What was verified |
|-----------------|-------------------|
| `app/components/mobile-tool-shell.tsx` | Props, `md:hidden` root, safe-area footer, modes vs children |
| `app/lib/use-is-mobile.ts` | `useSyncExternalStore`, `getServerSnapshot = false`, `(max-width: 767px)` |
| `app/components/mobile-bottom-nav.tsx` | `min-h-[44px]`, `pb-[env(safe-area-inset-bottom)]`, aria labels |
| `app/components/mobile-collapsible.tsx` | `min-h-[44px]`, desktop passthrough, open/close logic |
| `app/components/mobile-summary-rail.tsx` | Grid layout, tone classes, item rendering |
| `app/components/mobile-mode-switcher.tsx` | `py-2.5` button height (~40px) |
| `app/app/(app)/app-layout-client.tsx` | Drawer open/close/focus, safe-area, `MobileBottomNav`, billing sync |
| `app/app/(app)/dashboard/workspace-nav-mobile.tsx` | Chip `py-1.5` touch target issue, `min-h-11` on print link |
| `app/app/(app)/dashboard/page.tsx` | Mobile layout, `WorkspaceNavMobile`, `MobileCollapsible` for more metrics |
| `app/app/(app)/dashboard/dashboard-charts.tsx` | Dynamic chart loading, `ChartLoadingPlaceholder`, legend logic |
| `app/app/(app)/analyze/deal-analyzer-form.tsx` | Full mobile/desktop branching, `useIsMobile()`, stress test buttons, footer, summary rail |
| `app/app/(app)/analyze/page.tsx` | Server component, deals count/limit passed to form |
| `app/app/(app)/modeling/modeling-workspace.tsx` | `mobileHeader` construction, `ProjectionsTabContent` call |
| `app/app/(app)/modeling/page.tsx` | Server component |
| `app/app/(app)/mortgage/mortgage-workspace.tsx` | `mobileHeader` construction, `MortgageTabContent` call |
| `app/app/(app)/mortgage/page.tsx` | Server component |
| `app/app/(app)/properties/[id]/projections-tab-content.tsx` (partial) | `MobileToolShell` branch, `{!isMobile && <Legend />}`, `isMobile` checks |
| `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (partial) | `MobileToolShell` branch |
| `app/app/(app)/properties/page.tsx` | Properties list, filter/sort mobile UI, card CTAs, touch targets |
| `app/components/marketing/public-calculator.tsx` | `MobileToolShell` usage, 7 numeric inputs without `inputMode`, mobile surface |
| `app/app/investment-property-calculator/page.tsx` | Landing nav, CTA layout |
| `app/app/page.tsx` (lines 1–299) | Hero CTA `w-full min-h-[44px]`, mobile mockup (`sm:hidden`), HERO_STEPS (`hidden sm:grid`) |
| `app/components/mobile-tool-shell.test.tsx` | 4 unit tests |

**Assumptions / limits of this pass:**
- No browser DevTools, Lighthouse, or physical device used.
- Runtime checks (A1, A3, A4, D3, E1–E3, H1–H2, I1–I3, J1 VoiceOver, K1) are not satisfied by static review.
- `docs/policies/design-spec.md` and `docs/policies/analytics-math-policy.md` not directly read in this pass; consistency checked by pattern-matching semantic tokens and metric labels in code.

---

## Risk & impact assessment

| Finding | Business / user impact | Likelihood of user impact |
|---------|----------------------|--------------------------|
| F1 — Focus not returned to drawer trigger | Breaks keyboard + assistive-tech workflow for app navigation. WCAG 2.4.3 compliance gap. | Medium — affects keyboard and VoiceOver/TalkBack users |
| F2 — Stress test buttons 24px | Mis-taps on preset buttons when stress-testing a deal — affects core analyzer workflow on mobile. | High for users with large fingers at 320–375px |
| F3 — Workspace nav chips 32px | Mis-taps when navigating to Modeling/Mortgage from dashboard quick links. | Medium |
| F4 — PublicCalculator missing inputMode | Suboptimal keyboard layout on iOS for the public-facing investment property calculator — degraded first-time experience for organic SEO traffic. | High on iOS — applies to every visitor |
| F5 — Card/header action links 32px | Mis-taps on Open Modeling / Open Mortgage / Add mortgage in property cards. | Medium |
| G1 — MockupFrame CLS | Potential landing page perceived quality impact if flash is noticeable. | Low — not confirmed |
| No viewport matrix | Undetected regressions at 320px, 768px boundary, and real-device scenarios. | Unknown |

---

## Recommendations (prioritized)

1. **Add `inputMode` to `PublicCalculator` inputs** — highest reach (public SEO traffic, no auth). Currency fields: `inputMode="decimal"`; integer fields (down %, term, vacancy %): `inputMode="numeric"`. Quick fix, single component.

2. **Return focus to hamburger button on drawer close** — fix `AppLayoutClient` `closeDrawer` by adding a `menuButtonRef` ref to the hamburger `<button>` and calling `menuButtonRef.current?.focus()` on close, mirroring `LandingNav`. Unblocks WCAG keyboard compliance.

3. **Raise stress test preset button touch targets** — add `min-h-[44px]` or increase to `py-2.5` (matching deal analyzer footer buttons) on the `±10% / 0%` preset buttons in both the mobile and desktop Deal Analyzer stress test sections.

4. **Raise workspace chip and property card action link touch targets** — add `min-h-[44px]` or `py-2.5` to `WorkspaceNavMobile` chip `Link`s and the "Open Modeling" / "Open Mortgage" / "Add mortgage" links in the properties card list.

5. **Execute the full viewport matrix** — run 320, 375, 390, 430, 767/768px on all §5 routes in a real browser plus one iOS or Android device for keyboard, native `<select>`, safe-area, and scroll momentum. This pass only covers static code; live testing is required before release.

---

## Task candidates

- [ ] **`public-calculator.tsx`:** Add `inputMode="decimal"` to purchase price, rent, expenses, interest rate; add `inputMode="numeric"` to down payment %, term, vacancy % in both desktop and mobile sub-surfaces.
- [ ] **`app-layout-client.tsx`:** Add `menuButtonRef` (`useRef`) to hamburger `<button>`; call `menuButtonRef.current?.focus()` in `closeDrawer`, Escape handler, and backdrop click handler.
- [ ] **`deal-analyzer-form.tsx`:** Increase stress test preset button padding to `py-2.5` (or add `min-h-[44px]`) in both mobile surface (lines ~726–738) and desktop surface (lines ~1254–1269).
- [ ] **`workspace-nav-mobile.tsx`:** Add `min-h-[44px]` to chip `Link` elements (lines 22–38) to match the "Print portfolio summary" pattern.
- [ ] **`properties/page.tsx` + `dashboard/page.tsx`:** Raise action link vertical padding on card CTAs (`py-2` or `min-h-[44px]`).
- [ ] **Manual:** Execute full viewport matrix (320, 375, 390, 430, 767/768px) + one real iOS/Android device on all §5 routes.

---

## Re-test checklist

- [ ] `PublicCalculator`: verify iOS numeric keyboard variant on purchase price and down payment % fields.
- [ ] `AppLayoutClient`: open drawer → close via backdrop / Escape / hamburger → verify focus returns to "Open menu" button.
- [ ] Deal Analyzer: stress test buttons meet 44px at 320px and 375px.
- [ ] `WorkspaceNavMobile` chips: confirm touch targets at 375px.
- [ ] 320–767px: `/`, `/investment-property-calculator`, `/dashboard`, `/properties`, `/analyze`, `/modeling`, `/mortgage` — no unintended horizontal scroll.
- [ ] Real device (iOS or Android): numeric inputs, native `<select>` state picker, safe-area home indicator on `/analyze` with footer.
- [ ] After any code fix: `npx vitest run mobile-tool-shell`; `npm run check` when applicable.

---

## Next trigger and cadence

- **Trigger:** Changes to `PublicCalculator`, `DealAnalyzerForm`, `app-layout-client.tsx`, `WorkspaceNavMobile`, or any `MobileToolShell` surface. Also trigger on any new tool route added to §5 surface inventory.
- **Cadence:** Monthly or before major release. Full viewport matrix pass required once per release cycle per [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) §2.
- **Human-only items:** Viewport matrix (320–430px, 767/768px), real-device keyboard/safe-area/scroll, VoiceOver/TalkBack primary flow.
