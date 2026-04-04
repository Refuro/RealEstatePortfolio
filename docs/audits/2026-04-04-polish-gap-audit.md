# Veld Portfolio — Quality & Polish Gap Audit

**Date:** 2026-04-04  
**Type:** Discovery & triage only — no code changes  
**Quality bar reference:** `docs/design/design-spec-2026.md` (v3.1), `.cursor/skills/veld-ui/SKILL.md`, `.cursor/skills/veld-mobile/SKILL.md`, `.cursor/skills/veld-landing-cta/SKILL.md`  

---

## How to read this document

Each item has:
- **What / Where** — issue description + file path + route
- **Why** — spec rule violated
- **Severity:** High (visible to every user, breaks trust or usability) · Medium (noticeable but not blocking) · Low (minor inconsistency)
- **Effort:** S (< 30 min) · M (half day) · L (full day+)

Items are grouped by surface, sorted by severity within each group.

---

## 1. Cross-Cutting / Shared Components

These affect the most users because the components appear on multiple pages.

---

### 1.1 `tabular-nums` missing on `MetricCard` value `<dd>`

**File:** `components/metric-card.tsx`  
**Route:** Dashboard, Properties detail, everywhere `MetricCard` is used  
**What:** The value `<dd>` applies font size/weight but no `tabular-nums` class, so dollar figures shift horizontally as digits change width.  
**Why:** Spec §8, §13.1 — *"All MetricCard value renders (`<dd>`): tabular-nums"* is an explicit requirement.  
**Severity: High** — every data screen is affected. Financial figures with variable-width digits feel unpolished.  
**Effort: S**

---

### 1.2 `tabular-nums` missing on `calculator-metric.tsx` value paragraph

**File:** `components/calculators/calculator-metric.tsx`  
**Route:** All public calculators (`/tools/*`), all in-app calculators (`/calculators/*`), deal analyzer, modeling, mortgage  
**What:** The result tile's `<p>` for the computed value has no `tabular-nums`, despite being the primary number in every calculator output.  
**Why:** Spec §8, §13.13.  
**Severity: High** — affects the central output element of every calculator on the marketing and app surfaces.  
**Effort: S**

---

### 1.3 `MobileToolShell` eyebrow uses `uppercase tracking-[0.18em]`

**File:** `components/mobile-tool-shell.tsx`  
**Route:** `/analyze` (mobile), `/modeling` (mobile), `/mortgage` (mobile)  
**What:** The eyebrow label renders `text-[11px] font-semibold uppercase tracking-[0.18em] text-muted`. On every mobile tool page, the first thing visible at the top of the shell violates the spec.  
**Why:** Spec §4 — section labels within panels are `text-xs font-medium text-muted` with **no uppercase, no tracking-wide**. L4 uppercase is *only* for sidebar group headers and table column headers.  
**Severity: High** — visible on every mobile tool page, directly contradicts the spec and sets a wrong pattern.  
**Effort: S**

---

### 1.4 `bg-card/95` and `border-border/70` in `MobileToolShell`

**File:** `components/mobile-tool-shell.tsx`  
**Route:** All mobile tool pages  
**What:** Outer shell and section dividers use the deprecated `bg-card/95` and `border-border/70` opacity patterns.  
**Why:** Spec §5 and §16.2 — *"bg-card/95 — deprecated, use bg-card. border-border/70 — deprecated, use border-border."*  
**Severity: Medium** — slightly washed-out appearance on every mobile tool page.  
**Effort: S**

---

### 1.5 `MobileSummaryRail` — `border-border/70` and missing `tabular-nums`

**File:** `components/mobile-summary-rail.tsx`  
**Route:** All mobile tool pages (deal analyzer, modeling, mortgage)  
**What:** Each summary rail cell uses `border border-border/70` and value text lacks `tabular-nums`.  
**Why:** Spec §8, §16.2.  
**Severity: Medium**  
**Effort: S**

---

### 1.6 `footer.tsx` — hover without `transition-colors`

**File:** `components/footer.tsx`  
**Route:** All marketing pages (landing, pricing, changelog, tools, vs, alternatives)  
**What:** Nav and legal `<Link>` elements have `hover:text-foreground` with no accompanying `transition-colors` class.  
**Why:** Spec §10.2, §16.4 — *"Every hover:text-* must have a matching transition-* class."*  
**Severity: Medium** — jarring snap-to-color visible on every footer hover interaction.  
**Effort: S**

---

### 1.7 `footer.tsx` — touch targets likely under 44px

**File:** `components/footer.tsx`  
**Route:** All marketing pages  
**What:** Default `text-sm` links with no `min-h-[44px]` — footer renders on mobile on public pages and hit areas are too small.  
**Why:** Spec §9.2, §16.7 — *"Every button and a visible on mobile must have a minimum rendered height of 44px."*  
**Severity: Medium** — affects every marketing page footer on mobile.  
**Effort: S**

---

### 1.8 `LandingNav` — hamburger/close icon missing `aria-hidden`

**File:** `components/landing-nav.tsx`  
**Route:** All marketing pages  
**What:** `{mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}` — icons have no `aria-hidden` attribute. The button itself already has `aria-label`; the icon being announced creates a duplicate label for screen readers.  
**Why:** Spec §9.4 — *"Decorative icons must have aria-hidden."*  
**Severity: Medium**  
**Effort: S**

---

### 1.9 `AppNav` — group labels use `tracking-wider` instead of `tracking-wide`

**File:** `app/(app)/app-nav.tsx`  
**Route:** All authenticated app pages (sidebar)  
**What:** Sidebar group labels ("TOOLS", "ACCOUNT") use `tracking-wider`. Spec defines L4 group labels as `tracking-wide`.  
**Why:** Spec §4, §13.2 — minor class drift, but it affects every sidebar view.  
**Severity: Low**  
**Effort: S**

---

### 1.10 `AppNav` — nav link icons missing `aria-hidden`

**File:** `app/(app)/app-nav.tsx`  
**Route:** All authenticated app pages  
**What:** Lucide icons beside nav labels have no `aria-hidden`. The adjacent text already conveys meaning; the icon is decorative and redundant to AT.  
**Why:** Spec §9.4.  
**Severity: Low**  
**Effort: S**

---

### 1.11 Widespread `focus-visible:ring-*` gaps

**Files / Routes:**
- `app/(app)/app-layout-client.tsx` — hamburger button
- `app/(app)/app-nav.tsx` — all nav link/button rows
- `components/mobile-bottom-nav.tsx` — all items
- `app/(app)/properties/[id]/property-detail-tabs.tsx` — tab buttons
- `app/(app)/dashboard/dashboard-charts.tsx` — chart tab buttons
- `app/(app)/dashboard/metric-help-link.tsx` — help button
- `app/(app)/properties/benchmark-refresh-button.tsx` — refresh button
- `app/(app)/deals/deals-list.tsx` — search input, select

**What:** Multiple interactive elements have `hover:*` styling but rely only on the global `:focus-visible` CSS rule. In some cases `focus:outline-none` is applied without a custom ring replacement (e.g. deals inputs), which suppresses the global rule and leaves no visible keyboard indicator at all.  
**Why:** Spec §9.1, §16.4 — *"Never add outline-none without focus-visible:ring-* replacement."*  
**Severity: Medium** — directly impacts keyboard and AT accessibility across the entire app.  
**Effort: M** (many touch points, but mechanical)

---

## 2. Marketing — Landing Page (`/`)

---

### 2.1 Copy: "Try the deal analyzer" on calculator section

**File:** `app/app/page.tsx`  
**Route:** `/`  
**What:** The calculator section heading includes "Try the deal analyzer." The word "try" implies friction and is explicitly on the banned word list.  
**Why:** `veld-landing-cta` SKILL — *"Primary CTA on landing: never 'Try now' … anything that implies friction."* Copy tone rules say be direct and specific.  
**Severity: Medium** — every visitor reads this.  
**Effort: S**

---

### 2.2 Multiple `bg-accent` CTAs across the page

**File:** `app/app/page.tsx`  
**Route:** `/`  
**What:** The hero primary `FunnelCtaLink`, the bottom CTA strip "Create your free account", and (if `PaidIntentCheckoutBanner` renders) a "View plans" button can each show `bg-accent` in a single session. Even discounting scrolled-out-of-view instances, the repeated brand-color saturation dilutes the intended one-loud-action principle.  
**Why:** Spec §1 Pillar 5, §16.4 — *"One bg-accent CTA max."*  
**Severity: Medium** — interpretive tension; note for next design review.  
**Effort: L** (requires product decision on repeated CTAs in long pages)

---

## 3. Marketing — Pricing Page (`/pricing`)

---

### 3.1 `PricingCards` plan CTAs use plain `<Link>`, not `FunnelCtaLink`

**File:** `components/pricing-cards.tsx`  
**Route:** `/pricing` and landing page pricing preview  
**What:** "Choose Free," "Choose Investor," "Choose Pro" CTAs use `<Link>` directly, bypassing funnel tracking entirely.  
**Why:** Spec §13.14 — *"Use FunnelCtaLink for every primary and secondary CTA that leads to sign-up, sign-in, pricing, or plan upgrade."*  
**Severity: High** — conversion events from the primary pricing surface are untracked.  
**Effort: S**

---

### 3.2 Three simultaneous `bg-accent` buttons in the pricing cards grid

**File:** `components/pricing-cards.tsx`  
**Route:** `/pricing`, landing pricing preview  
**What:** All three plan cards render their primary action as `bg-accent`, so a free user visiting the pricing page sees three equally loud indigo buttons at once.  
**Why:** Spec §1 Pillar 5 — *"On any given screen there is at most one brand-colored CTA."*  
**Severity: Medium** — dilutes conversion hierarchy. Only the recommended tier (Investor) should be `bg-accent`; others should be bordered/ghost.  
**Effort: M** (design decision + implementation)

---

### 3.3 Bottom CTA card primary button missing `cta-accent-glow` and `min-h-[44px]`

**File:** `app/app/pricing/page.tsx`  
**Route:** `/pricing`  
**What:** The sign-up button in the bottom CTA card uses `rounded-lg bg-accent px-4 py-2.5` without `cta-accent-glow` or `min-h-[44px]`.  
**Why:** Spec §15.9, §16.7 — primary marketing accent button pattern requires both, and `py-2.5` alone likely renders below 44px on some devices.  
**Severity: Medium**  
**Effort: S**

---

## 4. Marketing — Tools Hub (`/tools`)

---

### 4.1 Primary hero CTA missing `cta-accent-glow` and `min-h-[44px]`

**File:** `app/app/tools/page.tsx`  
**Route:** `/tools`  
**What:** The signed-out CTA button uses `inline-flex ... rounded-md bg-accent px-5 py-2.5` without `cta-accent-glow` or `min-h-[44px]`.  
**Why:** Spec §14.12, §15.9, §16.7.  
**Severity: Medium**  
**Effort: S**

---

### 4.2 No trust line under hero CTA for signed-out users

**File:** `app/app/tools/page.tsx`  
**Route:** `/tools`  
**What:** The hero CTA shows for signed-out users without the "Free plan — no card required" trust line that appears on the landing page hero.  
**Why:** `veld-landing-cta` SKILL — *"This line must remain. It removes the two biggest signup objections."* The tools hub is a high-traffic SEO surface and has the same conversion intent.  
**Severity: Medium**  
**Effort: S**

---

### 4.3 `calculators-hub-cards.tsx` — all four cards have `text-accent` "Open calculator" links

**File:** `components/calculators/calculators-hub-cards.tsx`  
**Route:** `/tools`, `/calculators`  
**What:** Each of the four calculator cards ends with `text-sm font-medium text-accent` for "Open calculator →", meaning the entire card grid is saturated with accent-colored interactive text simultaneously.  
**Why:** Spec §16.1 — *"Do not use text-accent for decorative text that is not interactive or a primary CTA."* These are interactive links, but four simultaneous accent controls fight Pillar 5's one-loud-action principle.  
**Severity: Low**  
**Effort: S**

---

## 5. Marketing — Individual Calculator Pages (`/tools/brrr`, `/tools/fix-and-flip`, `/tools/str-vs-ltr`)

---

### 5.1 Two `bg-accent` CTAs in a single view (inline + footer strip)

**Files:** `app/app/tools/brrr/page.tsx`, `app/app/tools/fix-and-flip/page.tsx`, `app/app/tools/str-vs-ltr/page.tsx`; `components/calculators/brrr-calculator.tsx` (and equivalents)  
**Route:** `/tools/brrr`, `/tools/fix-and-flip`, `/tools/str-vs-ltr`  
**What:** Each calculator page renders a `bg-accent` "Get started free" button inside the calculator component (via `showCta` prop) *and* a separate `bg-accent` button in the footer CTA strip below. A user who scrolls down sees two equally loud indigo buttons.  
**Why:** Spec §1 Pillar 5, §16.4.  
**Severity: Medium**  
**Effort: S** (remove `showCta`-driven in-calculator button from these pages, keeping only the footer strip as the single loud CTA)

---

### 5.2 Calculator footer CTAs missing `cta-accent-glow` and `min-h-[44px]`

**Files:** Calculator page footers  
**Route:** `/tools/*`  
**What:** Primary accent buttons in the footer strip lack `cta-accent-glow` and `min-h-[44px]`.  
**Why:** Spec §15.9, §16.7.  
**Severity: Medium**  
**Effort: S**

---

### 5.3 "See plans" secondary CTA uses plain `<Link>`, not `FunnelCtaLink`

**Files:** Calculator footer CTA strips  
**Route:** `/tools/*`  
**What:** The "See plans" bordered secondary button links to `/pricing` via plain `<Link>`, bypassing funnel tracking.  
**Why:** Spec §13.14.  
**Severity: Low**  
**Effort: S**

---

## 6. Marketing — Alternatives & VS Pages (`/alternatives`, `/vs/*`)

---

### 6.1 `uppercase tracking-wide` on section labels in alternatives and VS pages

**Files:** `app/app/alternatives/page.tsx`, `app/app/vs/page.tsx`, `components/marketing/competitor-alternative-page.tsx`  
**Route:** `/alternatives`, `/vs`, `/vs/[slug]`  
**What:** "Compare" and similar section headings use `text-sm font-medium uppercase tracking-wide text-muted` and/or `text-sm font-semibold uppercase tracking-wide text-muted`. One instance in `competitor-alternative-page.tsx` uses this pattern on a full section heading ("See your numbers before you sign up").  
**Why:** Spec §4, §1 Pillar 6, §16.1 — uppercase+tracking-wide is *only* for sidebar nav group labels and table column headers, never for marketing section headings.  
**Severity: High** — these are public SEO pages with direct comparison intent. The styling signals "data label" instead of "marketing heading," undermining credibility.  
**Effort: S** (class replacement)

---

### 6.2 Copy: "Ready to try it?" in `competitor-alternative-page.tsx`

**File:** `components/marketing/competitor-alternative-page.tsx`  
**Route:** `/vs/[slug]`  
**What:** The footer CTA block headline reads "Ready to try it?" — uses the "try" framing on the comparison page that should be driving high-intent conversions.  
**Why:** `veld-landing-cta` SKILL copy rules, spec §15 marketing tone.  
**Severity: Medium**  
**Effort: S**

---

### 6.3 Primary `FunnelCtaLink` buttons in `competitor-alternative-page.tsx` missing `transition-*`

**File:** `components/marketing/competitor-alternative-page.tsx`  
**Route:** `/vs/[slug]`  
**What:** `hover:bg-accent-hover` on hero and footer `FunnelCtaLink` buttons has no accompanying `transition-all` or `transition-colors`.  
**Why:** Spec §10.2, §16.4.  
**Severity: Medium** — jarring instant color switch on the highest-intent comparison page.  
**Effort: S**

---

### 6.4 Multiple `bg-accent` CTAs on competitor pages + missing `cta-accent-glow` and `min-h-[44px]`

**File:** `components/marketing/competitor-alternative-page.tsx`  
**Route:** `/vs/[slug]`  
**What:** Hero CTA + footer CTA both use `bg-accent`. Neither has `cta-accent-glow` or `min-h-[44px]`. Simultaneously, any embedded `PublicCalculator` with `showCta` adds a third accent button.  
**Why:** Spec §1 Pillar 5, §15.9, §16.7.  
**Severity: Medium**  
**Effort: S**

---

## 7. App — Dashboard (`/dashboard`)

---

### 7.1 `border-border/70` and `bg-card/95` on first-property onboarding callout

**File:** `app/(app)/dashboard/page.tsx`  
**Route:** `/dashboard`  
**What:** The `onboarding === "first-property"` banner uses the deprecated `border-border/70 bg-card/95` opacity pattern. This is visible to every new user completing their first property.  
**Why:** Spec §5, §16.2.  
**Severity: Medium**  
**Effort: S**

---

### 7.2 Empty state heading/copy doesn't match spec table

**File:** `app/(app)/dashboard/page.tsx`  
**Route:** `/dashboard`  
**What:** The zero-property empty state renders `<h1>Welcome to Veld</h1>` with a separate CTA. The spec empty-state table (§11.4) defines: icon `Building2`, heading "Add your first property," support "Your portfolio metrics appear here once you add a property," CTA "Add property" → `/properties/new`.  
**Why:** Spec §11.4 — the welcome copy is generic; the designed empty state is a teaching moment with a specific activation prompt.  
**Severity: Medium** — every new user sees this.  
**Effort: S**

---

### 7.3 Multiple `bg-accent` CTAs in a single dashboard view

**File:** `app/(app)/dashboard/page.tsx`, `components/growth/paid-intent-checkout-banner.tsx`  
**Route:** `/dashboard`  
**What:** For a single-property user: (1) top row "Add property" = `bg-accent`, (2) bottom promo "Add property" = `bg-accent`, (3) if `PaidIntentCheckoutBanner` renders, "View plans" = `bg-accent`. All three can appear simultaneously above the fold.  
**Why:** Spec §1 Pillar 5.  
**Severity: Medium**  
**Effort: M** (requires deciding hierarchy: which action should be loud, which should be bordered/ghost)

---

### 7.4 Dashboard metric wrapper creates a nested panel appearance

**File:** `app/(app)/dashboard/page.tsx`  
**Route:** `/dashboard`  
**What:** MetricCards are wrapped in a `rounded-xl bg-subtle/30 p-2` container, which visually reads as a panel-in-panel stack. The MetricCards themselves are raised `border bg-card shadow-sm`, so the tinted outer wrapper creates a confusing depth relationship.  
**Why:** Spec §5 — *"No nested Panels — use Inset for secondary content inside a Panel."* This outer container isn't labeled as anything specific, making it feel like accidental styling rather than intentional structure.  
**Severity: Medium**  
**Effort: M** (needs product/design judgment on whether to remove the wrapper or treat cards differently)

---

### 7.5 Dashboard `loading.tsx` skeleton too generic

**File:** `app/(app)/dashboard/loading.tsx`  
**Route:** `/dashboard`  
**What:** The loading skeleton is a title bar + one block + metric grid. It does not reflect the workspace nav row, the secondary metrics collapsible, the charts region, or the `PaidIntentCheckoutBanner` slot.  
**Why:** Spec §12.1 Pattern C — *"The skeleton must resemble the page structure — not a single tall rectangle or a spinner."*  
**Severity: Low**  
**Effort: M**

---

### 7.6 `dashboard-charts.tsx` — `tabular-nums` missing on financial figures

**File:** `app/(app)/dashboard/dashboard-charts.tsx`  
**Route:** `/dashboard`  
**What:** "Property at a glance" section and the chart legend lines use `formatCurrency(...)` in `<p>` elements without `tabular-nums`.  
**Why:** Spec §8.  
**Severity: Medium**  
**Effort: S**

---

### 7.7 Rent vs. market — empty branch has no icon (not 4-part empty anatomy)

**File:** `app/(app)/dashboard/rent-vs-market-section.tsx`  
**Route:** `/dashboard`  
**What:** When `ordered.length === 0`, the block renders a heading and a text link but no icon — it misses the four-element anatomy: icon + heading + support + CTA.  
**Why:** Spec §11.2 — *"Every empty state has exactly four elements."*  
**Severity: Low**  
**Effort: S**

---

### 7.8 `WorkspaceNavMobile` chip links under 44px and hover without `transition-colors`

**File:** `app/(app)/dashboard/workspace-nav-mobile.tsx`  
**Route:** `/dashboard` (mobile)  
**What:** Chip links use `px-3 py-1.5 text-sm` with no `min-h-[44px]`. The `hover:bg-subtle` has no `transition-colors` class.  
**Why:** Spec §9.2, §16.4, §16.7 — confirmed known gap in `veld-mobile` SKILL.  
**Severity: Medium** — visible on mobile dashboard to users with properties.  
**Effort: S**

---

## 8. App — Properties List (`/properties`)

---

### 8.1 "Add property" `bg-accent` per-card repeats the loud action on every list item

**File:** `app/(app)/properties/page.tsx`  
**Route:** `/properties`  
**What:** The page-level "Add property" header button is `bg-accent`. Each property card also renders its primary action as `bg-accent`. On a 5-property list, a user sees 6 simultaneous loud indigo buttons.  
**Why:** Spec §1 Pillar 5.  
**Severity: Medium** — each per-card action should be `border bg-card` or ghost, not branded accent.  
**Effort: M**

---

### 8.2 Filter empty state missing "Clear filters" CTA

**File:** `app/(app)/properties/page.tsx`  
**Route:** `/properties`  
**What:** The "No matching properties" empty state has icon, heading, and support line but no "Clear filters" action button.  
**Why:** Spec §11.3 — *"For search/filter empty states, use a 'Clear search' or 'Clear filters' button instead of a route-change Link."*  
**Severity: Medium** — users who land in an empty filter state have no clear path out except manual interaction with the filter controls.  
**Effort: S**

---

## 9. App — Property Detail (`/properties/[id]`)

---

### 9.1 Tab buttons missing `focus-visible:ring-*`

**File:** `app/(app)/properties/[id]/property-detail-tabs.tsx`  
**Route:** `/properties/[id]`  
**What:** Tab `<button>` elements have `transition-all duration-200` but no `focus-visible:ring-*`. The global `:focus-visible` rule applies, but tab buttons in this pattern warrant explicit confirmation to avoid accidental suppression.  
**Why:** Spec §9.1.  
**Severity: Medium**  
**Effort: S**

---

### 9.2 Suspense fallback is a single generic block

**File:** `app/(app)/properties/[id]/page.tsx`  
**Route:** `/properties/[id]`  
**What:** `fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}` — a single tall rectangle. Property detail has tabs, metrics, and a health strip; the skeleton communicates nothing about the page structure.  
**Why:** Spec §12.1 Pattern C.  
**Severity: Low**  
**Effort: M**

---

### 9.3 "No mortgage on file" is not a proper empty state

**File:** `app/(app)/properties/[id]/details-tab-content.tsx`  
**Route:** `/properties/[id]` → Details tab  
**What:** The "No mortgage on file" state renders minimal text + a link, missing the full four-element anatomy (icon + heading + support + CTA).  
**Why:** Spec §11.2.  
**Severity: Low**  
**Effort: S**

---

### 9.4 `payoff-card.tsx` — multiple issues

**File:** `app/(app)/properties/[id]/payoff-card.tsx`  
**Route:** `/properties/[id]`  

- **Missing `shadow-sm`:** Main card section `rounded-lg border border-border bg-card p-6` has no shadow, while spec §6 requires *"Every content card that holds data gets at minimum Raised (shadow-sm)."* **Severity: Medium · Effort: S**
- **Nested borders:** Each mortgage item is `rounded-md border border-border bg-subtle/50 p-4` inside the outer card — nested panel stack. **Severity: Low · Effort: S**
- **Currency in narrative without `tabular-nums`:** `${projection.remainingAtTermEnd.toLocaleString()}` inside `<strong>` has no `tabular-nums` wrapper. **Severity: Low · Effort: S**
- **Year selector chips use `bg-accent`:** The selected chip uses `bg-accent text-accent-foreground`, adding loud accent inside a card that may already be on a screen with another primary CTA. **Severity: Low · Effort: S** (use `bg-subtle` border-active style instead)

---

### 9.5 `property-health-strip.tsx` — missing `shadow-sm`

**File:** `app/(app)/properties/[id]/property-health-strip.tsx`  
**Route:** `/properties/[id]`  
**What:** `rounded-lg border border-border bg-card p-4` with no `shadow-sm`. This is a data-bearing status strip that sits at the same depth as cards, but renders flat.  
**Why:** Spec §6 Pillar 4.  
**Severity: Low**  
**Effort: S**

---

### 9.6 `scenario-section.tsx` — `h2` uses `uppercase tracking-wide`

**File:** `app/(app)/properties/[id]/scenario-section.tsx` (appears to be orphaned — verify if actively rendered)  
**Route:** `/properties/[id]` (if component is still in use)  
**What:** The collapsible header `<h2>` uses `text-sm font-semibold uppercase tracking-wide text-muted` — precisely the L4 pattern forbidden on page-level section headings.  
**Why:** Spec §4, §1 Pillar 6, §16.1.  
**Severity: Medium** if component is rendered; **Low** if orphaned.  
**Effort: S**

---

### 9.7 `benchmark-refresh-button.tsx` — silent failure path

**File:** `app/(app)/properties/benchmark-refresh-button.tsx`  
**Route:** `/properties/[id]`  
**What:** `quick-actions.tsx` (if rendered) has a non-OK response path that silently clears loading with no user-visible error. The main `BenchmarkRefreshButton` does show error text, but the quick-actions path does not.  
**Why:** Architecture doc — *"robust: handle failures, validate inputs, recover gracefully."*  
**Severity: Low**  
**Effort: S**

---

## 10. App — Deals (`/deals`)

---

### 10.1 `tabular-nums` missing on financial metric cells in deals list

**File:** `app/(app)/deals/deals-list.tsx`  
**Route:** `/deals`  
**What:** `formatCurrency` / percentage `<dd>` values in deal cards have no `tabular-nums` class.  
**Why:** Spec §8.  
**Severity: Medium**  
**Effort: S**

---

### 10.2 Decorative icons missing `aria-hidden` in deals pages

**Files:** `app/(app)/deals/page.tsx` (`PlusCircle`), `app/(app)/deals/deals-list.tsx` (Search icon inside input)  
**Route:** `/deals`  
**What:** `<PlusCircle size={15} />` in the "New deal" link and `<Search size={16} className="absolute" />` inside the search input are decorative but lack `aria-hidden`.  
**Why:** Spec §9.4.  
**Severity: Low**  
**Effort: S**

---

### 10.3 Delete failure is silently swallowed

**File:** `app/(app)/deals/deals-list.tsx`  
**Route:** `/deals`  
**What:** `handleDelete` only refreshes on `res.ok` — if the delete fails or errors, the UI silently stays unchanged with no toast, error state, or retry prompt.  
**Why:** Architecture doc — *"recover gracefully."*  
**Severity: Medium** — user believes delete succeeded when it may have failed.  
**Effort: S**

---

## 11. App — Deal Analyzer (`/analyze`)

---

### 11.1 Pervasive `uppercase tracking-wide` / `tracking-[0.18em]` on section labels

**File:** `app/(app)/analyze/deal-analyzer-form.tsx`  
**Route:** `/analyze`  
**What:** Section labels "Deal assumptions," "Basics," "Income and expenses," "Live result," "Stress test," "Deal signal," "Rent sensitivity," "Active deal," and more all use `uppercase tracking-wide` (or `tracking-[0.18em]`). This is the most severe typography violation in the codebase: a primary app surface with ~15+ L4-style labels on headings that should be L5 sentence-case.  
**Why:** Spec §4, §1 Pillar 6, §16.1 — L4 uppercase reserved exclusively for sidebar group headers and table column headers.  
**Severity: High** — visible to every user who analyzes a deal. The entire form feels like it uses the wrong heading system.  
**Effort: M**

---

### 11.2 `bg-card/95` and `border-border/70` on multiple panels

**File:** `app/(app)/analyze/deal-analyzer-form.tsx`  
**Route:** `/analyze`  
**What:** Main assumptions column, side columns, and nested chips throughout the form use the deprecated opacity patterns.  
**Why:** Spec §5, §16.2.  
**Severity: Medium** — washed-out card surfaces across the deal analyzer's most-used view.  
**Effort: M** (many instances, mechanical class replacements)

---

### 11.3 `tabular-nums` missing on deal signal and comparison table

**File:** `app/(app)/analyze/deal-analyzer-form.tsx`  
**Route:** `/analyze`  
**What:** `DealPortfolioCompareBlock` table cells, mobile "Live result" grid, desktop "Deal signal" metrics, and sticky bottom bar amounts all render currency/percentage values without `tabular-nums`.  
**Why:** Spec §8.  
**Severity: Medium**  
**Effort: S**

---

### 11.4 Page `h1` "Analyze deal" vs `MobileToolShell` title "Deal Analyzer"

**Files:** `app/(app)/analyze/page.tsx`, `app/(app)/analyze/deal-analyzer-form.tsx`  
**Route:** `/analyze`  
**What:** Desktop shows h1 "Analyze deal"; mobile shell eyebrow/title reads "Deal Analyzer." The same screen has two different names for the same feature depending on viewport.  
**Why:** Architecture doc — brand consistency; naming should be consistent across all contexts.  
**Severity: Medium**  
**Effort: S** (decide on one name, apply consistently)

---

### 11.5 Dead `md:hidden` sticky results bar duplicates the `isMobile` path

**File:** `app/(app)/analyze/deal-analyzer-form.tsx`  
**Route:** `/analyze`  
**What:** A `fixed` bottom bar with `md:hidden` exists in the desktop return tree. When `useIsMobile()` is true, the component already returns the `MobileToolShell` path — so this bar is unreachable in the mobile shell and dead code in the desktop path. It creates confusion about what the intended mobile UX is.  
**Why:** `veld-mobile` SKILL — *"Do not add a separate md:hidden sticky results bar in the desktop return tree if the isMobile path already handles it — this creates dead/unreachable code (known issue in deal-analyzer-form.tsx)."*  
**Severity: Low** — already documented as a known issue, but cleaning it up would reduce confusion.  
**Effort: S**

---

## 12. App — Modeling & Mortgage Workspaces (`/modeling`, `/mortgage`)

---

### 12.1 Empty state containers use `bg-card/95` and `border-border/70`

**Files:** `app/(app)/modeling/modeling-workspace.tsx`, `app/(app)/mortgage/mortgage-workspace.tsx`  
**Route:** `/modeling`, `/mortgage`  
**What:** Empty state containers and the "no mortgage" panel use the deprecated opacity patterns.  
**Why:** Spec §5, §16.2.  
**Severity: Medium**  
**Effort: S**

---

### 12.2 `tabular-nums` missing on projections tab summary cards

**File:** `app/(app)/modeling/projections-tab-content.tsx` (or equivalent)  
**Route:** `/modeling`  
**What:** `summaryCards` displaying equity, debt, cash flow, and return values use `formatCurrency` without `tabular-nums`.  
**Why:** Spec §8.  
**Severity: Medium**  
**Effort: S**

---

## 13. App — Settings (`/settings`)

---

### 13.1 Cookie preferences `h2` uses `uppercase tracking-wide`

**File:** `app/(app)/settings/cookie-preferences-section.tsx`  
**Route:** `/settings`  
**What:** "Cookies & optional analytics" section heading uses `text-sm font-semibold uppercase tracking-wide text-muted` — applying the L4 data-label pattern to a page section heading.  
**Why:** Spec §4, §16.1.  
**Severity: Medium** — settings is a trusted page; typography inconsistency undermines the polished feel.  
**Effort: S**

---

### 13.2 Settings panel structure doesn't match canonical 4-panel spec

**File:** `app/(app)/settings/page.tsx`  
**Route:** `/settings`  
**What:** The actual panel structure has: a mobile-only account snapshot block, a combined Appearance + Portfolio display + Profile panel, Plan & billing, Your data, and a Delete section — with the Cookie preferences block floating outside the grouping. The spec (§5) defines exactly four panels: (A) Account preferences, (B) Plan & billing, (C) Your data, (D) Danger zone. The "Danger zone" label is missing as a named section.  
**Why:** Spec §5, §14.10.  
**Severity: Low** — functionally fine, but the mobile-only account snapshot creates an inconsistent reading experience between breakpoints.  
**Effort: M**

---

### 13.3 `import-csv-section.tsx` — template download error is silently swallowed

**File:** `app/(app)/settings/import-csv-section.tsx`  
**Route:** `/settings`  
**What:** `handleDownloadTemplate`'s `catch` block is empty — if the template download fails, nothing is shown to the user.  
**Why:** Architecture doc — *"recover gracefully."*  
**Severity: Medium** — user clicks "Download template," nothing happens, no indication of failure.  
**Effort: S**

---

## 14. App — Onboarding / Add Property Wizard

---

### 14.1 `onboarding-panel.tsx` — `border-border/70`, `bg-card/95`, `border-border/80` on welcome modal

**File:** `app/(app)/onboarding-panel.tsx`  
**Route:** `/dashboard` (modal shown to new users)  
**What:** The first thing a new user sees — the welcome modal — uses all three deprecated opacity patterns.  
**Why:** Spec §5, §16.2.  
**Severity: High** — first impression for every new user.  
**Effort: S**

---

### 14.2 `onboarding-panel.tsx` — CTA touch targets under 44px

**File:** `app/(app)/onboarding-panel.tsx`  
**Route:** `/dashboard` (welcome modal)  
**What:** "Maybe later" and "Add first property" use `py-2 text-sm` with no `min-h-[44px]` — likely around 36px on mobile.  
**Why:** Spec §9.2, §16.7.  
**Severity: Medium** — new users on mobile can't easily tap the primary onboarding CTA.  
**Effort: S**

---

### 14.3 `add-property-wizard.tsx` — error messages missing `role="alert"`

**File:** `app/(app)/properties/add-property-wizard.tsx`  
**Route:** `/properties/new`  
**What:** Form submit errors render in a `<div>` without `role="alert"` or `aria-live`, so screen readers don't announce validation failures.  
**Why:** Spec §9 accessibility standards.  
**Severity: Medium**  
**Effort: S**

---

### 14.4 `add-property-wizard.tsx` — step error message says "Step 1," UI labels it "Location & profile"

**File:** `app/(app)/properties/add-property-wizard.tsx`  
**Route:** `/properties/new`  
**What:** Validation errors reference "Step 1" while the UI displays the section label "Location & profile." Users see inconsistent naming for the same thing.  
**Why:** Architecture doc — consistency.  
**Severity: Low**  
**Effort: S**

---

### 14.5 `add-property-wizard.tsx` — `dealId` prefetch fails silently

**File:** `app/(app)/properties/add-property-wizard.tsx`  
**Route:** `/properties/new?from=...`  
**What:** `dealId` prefetch `.catch(() => {})` swallows all errors. If the deal prefill fails, the wizard opens silently with no feedback, and the user is unaware their deal context was lost.  
**Why:** Architecture doc — *"robust: handle failures, recover gracefully."*  
**Severity: Medium**  
**Effort: S**

---

### 14.6 `add-property-wizard.tsx` — rented/not-rented toggles have no `aria-pressed`

**File:** `app/(app)/properties/add-property-wizard.tsx`  
**Route:** `/properties/new`  
**What:** Toggle buttons for rented/not-rented have no `aria-pressed` (or `role="radio"` + `aria-checked`) to communicate selection state to assistive technology.  
**Why:** Spec §9 accessibility standards; ARIA button toggle pattern.  
**Severity: Medium**  
**Effort: S**

---

### 14.7 `properties/new/page.tsx` — deal prefill banner uses `border-border/70 bg-card/90`

**File:** `app/(app)/properties/new/page.tsx`  
**Route:** `/properties/new`  
**What:** The contextual banner for deal-prefill uses deprecated opacity patterns.  
**Why:** Spec §16.2.  
**Severity: Low**  
**Effort: S**

---

## 15. App — Authenticated Shell Chrome

---

### 15.1 `app-layout-client.tsx` — drawer close doesn't return focus to hamburger

**File:** `app/(app)/app-layout-client.tsx`  
**Route:** All authenticated app pages  
**What:** On drawer close, focus is not returned to the hamburger button — keyboard users lose their place in the page.  
**Why:** `veld-mobile` SKILL — *"On close, focus is NOT returned to the hamburger button. This is a known gap."* Spec §9.  
**Severity: High** — affects keyboard navigation across the entire authenticated app.  
**Effort: S** (add `menuButtonRef` and call `.focus()` on `closeDrawer`)

---

### 15.2 `app-layout-client.tsx` — hamburger `Menu` icon missing `aria-hidden`

**File:** `app/(app)/app-layout-client.tsx`  
**Route:** All authenticated app pages  
**What:** The hamburger `<Menu />` icon inside the header button has no `aria-hidden`.  
**Why:** Spec §9.4.  
**Severity: Low**  
**Effort: S**

---

### 15.3 `app-layout-client.tsx` — logo `div` with `onClick` is not keyboard-operable

**File:** `app/(app)/app-layout-client.tsx`  
**Route:** All authenticated app pages  
**What:** The sidebar logo row is a `<div>` with an `onClick={closeDrawer}` handler. Keyboard users cannot activate this via Enter/Space.  
**Why:** Spec §9 — interactive elements should be semantic (`<button>`) to be keyboard-accessible.  
**Severity: Medium**  
**Effort: S** (change `div` to `button` with appropriate styling, or remove the `onClick` if it's redundant with the drawer backdrop)

---

## 16. Summary Priority Table

| # | Area | Issue | Sev | Effort |
|---|------|--------|-----|--------|
| 1.1 | MetricCard | `tabular-nums` missing on value `<dd>` | **H** | S |
| 1.2 | CalculatorMetric | `tabular-nums` missing on value paragraph | **H** | S |
| 1.3 | MobileToolShell | Eyebrow uses `uppercase tracking-[0.18em]` | **H** | S |
| 3.1 | Pricing | `PricingCards` plan CTAs use `<Link>`, not `FunnelCtaLink` | **H** | S |
| 6.1 | VS/Alternatives | `uppercase tracking-wide` on section labels | **H** | S |
| 11.1 | Deal Analyzer | ~15+ section labels use `uppercase tracking-wide` | **H** | M |
| 14.1 | Onboarding | Welcome modal uses deprecated `bg-card/95`, `border-border/70`, `border-border/80` | **H** | S |
| 15.1 | App Shell | Drawer close doesn't return focus to hamburger | **H** | S |
| 1.4 | MobileToolShell | `bg-card/95` + `border-border/70` on shell | M | S |
| 1.5 | MobileSummaryRail | `border-border/70` + missing `tabular-nums` | M | S |
| 1.6 | Footer | Hover without `transition-colors` | M | S |
| 1.7 | Footer | Touch targets under 44px | M | S |
| 1.8 | LandingNav | Hamburger icon missing `aria-hidden` | M | S |
| 1.11 | App-wide | `focus-visible:ring-*` gaps across app chrome, nav, tabs | M | M |
| 2.1 | Landing | "Try the deal analyzer" copy | M | S |
| 3.2 | Pricing | Three simultaneous `bg-accent` plan CTAs | M | M |
| 3.3 | Pricing | Bottom CTA missing `cta-accent-glow` + `min-h-[44px]` | M | S |
| 4.1 | Tools Hub | Primary CTA missing `cta-accent-glow` + `min-h-[44px]` | M | S |
| 4.2 | Tools Hub | No trust line for signed-out users | M | S |
| 5.1 | Tool pages | Two `bg-accent` CTAs per view (inline + footer) | M | S |
| 5.2 | Tool pages | Footer CTAs missing `cta-accent-glow` + `min-h-[44px]` | M | S |
| 6.2 | VS pages | "Ready to try it?" copy | M | S |
| 6.3 | VS pages | Primary buttons missing `transition-*` on hover | M | S |
| 6.4 | VS pages | Multiple `bg-accent` + missing `cta-accent-glow`/`min-h-[44px]` | M | S |
| 7.1 | Dashboard | Deprecated tokens on onboarding callout | M | S |
| 7.2 | Dashboard | Empty state heading/copy doesn't match spec table | M | S |
| 7.3 | Dashboard | Multiple `bg-accent` CTAs in single view | M | M |
| 7.4 | Dashboard | Metric wrapper creates nested panel appearance | M | M |
| 7.6 | Dashboard | `tabular-nums` missing on chart financial figures | M | S |
| 7.8 | Dashboard | `WorkspaceNavMobile` chips under 44px, missing `transition-colors` | M | S |
| 8.1 | Properties | Per-card `bg-accent` CTA multiplied across list | M | M |
| 8.2 | Properties | Filter empty state missing "Clear filters" CTA | M | S |
| 9.1 | Prop. Detail | Tab buttons missing `focus-visible:ring-*` | M | S |
| 9.6 | Prop. Detail | `scenario-section.tsx` h2 uses `uppercase tracking-wide` | M | S |
| 10.1 | Deals | `tabular-nums` missing on financial cells | M | S |
| 10.3 | Deals | Delete failure silently swallowed | M | S |
| 11.2 | Deal Analyzer | `bg-card/95` + `border-border/70` pervasive | M | M |
| 11.3 | Deal Analyzer | `tabular-nums` missing on deal signal + comparison | M | S |
| 11.4 | Deal Analyzer | "Analyze deal" vs "Deal Analyzer" naming inconsistency | M | S |
| 12.1 | Modeling/Mortgage | Deprecated tokens on empty states | M | S |
| 12.2 | Modeling | `tabular-nums` missing on projections summary cards | M | S |
| 13.1 | Settings | Cookie preferences `h2` uses `uppercase tracking-wide` | M | S |
| 13.3 | Settings | Template download error silently swallowed | M | S |
| 14.2 | Onboarding | Welcome modal CTAs under 44px | M | S |
| 14.3 | Onboarding | Error messages missing `role="alert"` | M | S |
| 14.5 | Wizard | `dealId` prefetch silent failure | M | S |
| 14.6 | Wizard | Rented toggles missing `aria-pressed` | M | S |
| 15.3 | App Shell | Logo `div` with `onClick` not keyboard-operable | M | S |
| 1.9 | AppNav | `tracking-wider` vs `tracking-wide` on group labels | L | S |
| 1.10 | AppNav | Nav icons missing `aria-hidden` | L | S |
| 4.3 | Tools Hub | Four simultaneous `text-accent` links on hub card grid | L | S |
| 5.3 | Tool pages | "See plans" uses `<Link>`, not `FunnelCtaLink` | L | S |
| 7.5 | Dashboard | Loading skeleton too generic | L | M |
| 7.7 | Dashboard | Rent vs. market empty branch missing icon | L | S |
| 9.2 | Prop. Detail | Suspense fallback generic single block | L | M |
| 9.3 | Prop. Detail | "No mortgage on file" not a proper empty state | L | S |
| 9.4 | Prop. Detail | Payoff card: missing `shadow-sm`, nested borders, no `tabular-nums`, `bg-accent` chips | L | S |
| 9.5 | Prop. Detail | `property-health-strip` missing `shadow-sm` | L | S |
| 9.7 | Prop. Detail | Quick-actions benchmark: silent failure path | L | S |
| 10.2 | Deals | Decorative icons missing `aria-hidden` | L | S |
| 11.5 | Deal Analyzer | Dead `md:hidden` sticky bar (known issue) | L | S |
| 13.2 | Settings | Panel structure drifted from 4-panel canonical spec | L | M |
| 14.4 | Wizard | Error says "Step 1," UI says "Location & profile" | L | S |
| 14.7 | Wizard | Prefill banner uses `border-border/70 bg-card/90` | L | S |
| 15.2 | App Shell | Hamburger icon missing `aria-hidden` | L | S |

---

## High-Level Themes

Across the 60+ items above, five themes repeat everywhere:

1. **`tabular-nums` discipline** — The policy is clear in the spec but enforcement stopped at `MetricCard`. `CalculatorMetric`, `MobileSummaryRail`, `DashboardCharts`, `DealsList`, `PayoffCard`, and the deal analyzer all have financial numbers that shift horizontally. This is a global class-addition pass.

2. **Deprecated token creep** — `bg-card/95` and `border-border/70` appear in the onboarding modal, deal analyzer, modeling/mortgage workspaces, mobile tool shell, and multiple card surfaces. The spec deprecation is from Phase 3, but these components weren't touched. A targeted grep + replace pass would clear the bulk of these.

3. **`uppercase tracking-wide` misuse** — Despite Pillar 6 being one of the six design pillars, it's violated on the most-used tool surface (deal analyzer), the mobile tool shell eyebrow, settings (cookie section), and competitor pages. These are the most tonally jarring issues a first-time user would notice — "why does this feel like a dashboard designed in 2018?"

4. **CTA hierarchy dilution** — The "one loud action per screen" pillar is undermined at multiple scales: per-card `bg-accent` repeating down list views, three `bg-accent` plan tier buttons on one pricing screen, and inline + footer `bg-accent` on tool pages. The color loses its signaling power when it appears 6 times on one scroll.

5. **Focus and ARIA gaps** — Not a single showstopper, but collectively the lack of `aria-hidden` on decorative icons, missing `aria-pressed` on toggles, `focus:outline-none` without ring replacements, and the drawer focus-return gap add up to a product that keyboard and AT users would find notably rougher than mouse users.
