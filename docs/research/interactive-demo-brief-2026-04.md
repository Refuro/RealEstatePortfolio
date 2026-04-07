# Interactive Product Demo: Research Brief (v2)

**Date:** April 2026
**Product:** Veld Portfolio
**Author:** UX Research (AI-assisted)
**Status:** Recommendation — ready for decision
**Revision note:** v2 replaces the calculator-only recommendation from v1. The core strategic shift: Veld's primary value proposition is portfolio management, not deal analysis. The demo must show the portfolio.

---

## Executive Summary

Veld's homepage currently demos the wrong thing. The `PublicCalculator` — an embedded deal analysis tool — showcases the *acquisition* workflow, but Veld's core audience is passive landlords who **already own 1–10 properties** and need to replace their spreadsheet. The hero literally says "Replace spreadsheet chaos with one clear view of your rental portfolio." The demo should deliver on that promise.

**The recommendation:** Build a `/demo` route — a public, ungated, interactive portfolio preview pre-loaded with three realistic rental properties. The user can browse the portfolio dashboard, tap into individual properties, see mortgage projections, and edit key numbers (rent, value, expenses) to watch portfolio-level metrics recalculate live. The calculator stays on the homepage as a secondary engagement tool. The portfolio demo becomes the primary "see the product" experience.

**Why this matters for paid acquisition:** You've spent $500–1,000 on ads with low conversion. Research shows that interactive demos on landing pages lift ad conversion by 33–127% (FORM/Navattic, UpperHand). But the demo has to match the ad's promise. If your ads say "track your rental portfolio" and the demo shows a calculator, you're leaking intent. The `/demo` route gives you a landing page destination that matches portfolio-focused ad copy, and it gives cautious visitors a non-committal way to evaluate the product before they'll give you an email address.

**Expected impact:** beehiiv (prosumer SaaS, similar price point) saw a 20% demo-view-to-signup rate and 50% higher free-to-paid conversion after adding an interactive product demo (Supademo/beehiiv case study, 2025). Products that let users try before creating an account achieve 7–9% free-to-paid conversion vs 3–5% for gated freemium (ChartMogul 2026 Conversion Report, N=200 products).

---

## 1. Strategic Framing: Why Portfolio Demo, Not Just Calculator

### The mismatch problem

Veld's landing page makes a portfolio promise but delivers a calculator demo:

| What the landing page says | What the demo shows |
|---|---|
| "Replace spreadsheet chaos with one clear view of your rental portfolio" | A single-deal calculator |
| "Track equity, cash flow, and rent estimates across your rental portfolio" | Cash flow for one hypothetical property |
| "Built for landlords with 1–10 properties" | Analysis of zero existing properties |
| "Add your properties once and get equity, cash flow… always current" | A one-time calculation with no persistence story |

The calculator is a useful tool. It is not a product demo. It demonstrates one feature (deal analysis) but says nothing about the product's core value: **seeing all your properties in one place, always current, no spreadsheet maintenance.**

### Who actually lands on the homepage?

Two personas:

1. **The spreadsheet-fatigued owner** (primary) — Owns 2–5 rentals. Tracks everything in Google Sheets. Wants to know: "Can this replace my spreadsheet?" They need to *see* a portfolio view with realistic data to answer that question. A calculator doesn't help them.

2. **The deal shopper** (secondary) — Evaluating a specific property. Wants quick cash flow math. The existing `PublicCalculator` and `/investment-property-calculator` serve this persona well. They don't need a portfolio demo.

Paid traffic — especially from Google Ads targeting "rental property tracker," "landlord portfolio," "real estate portfolio management" — skews heavily toward persona 1. If your ad spend is going toward portfolio-related keywords and your conversion is low, the mismatch between ad intent and demo experience is a likely culprit.

### What the research says about product-fit demos

- **"Imagination tax":** "Empty dashboards force prospects to imagine how your product fits their world. Dummy data removes that imagination tax by showing realistic outcomes immediately." (Supademo 2025)
- **38% of freemium products** now let users try before creating an account — Canva, Notion, Replit, ChatGPT, Perplexity all use this pattern (ChartMogul 2026).
- **Interactive product demos convert at 7.9x** vs static approaches (24.35% vs 3.05% — Contrast/Factors.ai, N=110,000 sessions).
- **Multi-flow demos** (letting users explore different areas, not just one linear path) have **48% higher completion** than single-flow demos (Navattic 2026).
- **beehiiv** (prosumer SaaS, creator pricing): 20% demo-view-to-signup rate, 50% higher free-to-paid conversion after adding interactive product demos (Supademo case study).

---

## 2. Demo Format: Interactive Portfolio Preview

### Decision: Purpose-built `/demo` route with editable pre-filled portfolio data.

This is not a full sandbox. It's not a replica of the authenticated app. It's a lightweight, focused, client-side-only preview that shows the portfolio's core value with three realistic properties.

### Format details

| Aspect | Decision | Rationale |
|---|---|---|
| **Type** | Interactive product preview with editable data | Users who manipulate data convert 12% higher than observers (Navattic 2026). Editing a rent value and watching portfolio cash flow update is the aha moment. |
| **Route** | `/demo` (public, no auth) | Separate page, not embedded in landing page. Portfolio experience needs its own full-screen layout. |
| **Data** | 3 hardcoded properties, client-side state only | No DB, no API, no auth. All calculations via existing `computePropertyMetrics` + `computePortfolioMetrics`. |
| **Navigation** | Tab-based: Dashboard → Property Detail → Deal Analyzer | Multi-flow pattern. User explores at their own pace. 48% higher completion than single-flow (Navattic 2026). |
| **Editability** | Rent, value, and expenses editable on each property. Portfolio metrics recalculate live. | The "cause and effect" moment: change one property's rent, watch portfolio cash flow change. |
| **Gating** | Fully ungated. No email, no signup, no wall. | 66% of top demos are ungated (Navattic 2026). Ungated demos have 2.1x higher engagement (Storylane, N=535K). |
| **Mobile** | Responsive using existing `MobileToolShell` + `MobilePageSection` patterns | Veld already has a complete mobile design system. The demo should use it. |

### Why not the other formats?

| Format | Verdict |
|---|---|
| **Calculator only** (v1 recommendation) | Demos one feature, not the product. Doesn't match the portfolio value proposition. Attracts deal shoppers, not portfolio managers. |
| **Full sandbox with real app** | Too expensive. Requires auth bypass, seeded DB records, API mocking. 2–4 weeks of work plus ongoing maintenance of test data in production. |
| **Guided product tour (Shepherd.js)** | Passive. The user watches, they don't do. Also hostile on mobile (40% lower completion — Navattic 2026). |
| **Video walkthrough** | 12% lower conversion than interactive demos (Navattic 2026). Doesn't let the user feel the product. |
| **Screenshot carousel** | 2x lower conversion than interactive content (Aimers 2026). Feels like a brochure. Landlords distrust brochures. |
| **Iframe to demo account** | Fragile. Auth edge cases, demo account maintenance, no editability, and you can't control the UX. |

---

## 3. Demo Content: Three-Property Portfolio

### The portfolio

Three properties that represent a realistic small landlord portfolio — the kind of person who has 2–4 rentals, a mix of single-family and small multi, spread across the $200K–$350K range.

| Property | Nickname | Type | Purchase Price | Current Value | Monthly Rent | Monthly Expenses | Down % | Rate | Term | Vacancy % | Mortgage Balance |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Property 1** | 456 Maple St, Springfield | Single family | $245,000 | $268,000 | $1,850 | $580 | 20% | 6.75% | 30yr | 5% | $178,200 |
| **Property 2** | 1220 Oak Ave, Riverside | Duplex | $325,000 | $345,000 | $2,800 | $820 | 25% | 7.0% | 30yr | 5% | $218,400 |
| **Property 3** | 89 Pine Dr, Greenfield | Single family | $275,000 | $285,000 | $2,100 | $680 | 20% | 7.25% | 30yr | 5% | $203,500 |

### Why this data set

**Relatable scale.** Total portfolio ~$845K in value, ~$600K in debt, ~$298K in equity. This is a landlord who's been buying for 3–7 years. Not a beginner, not a whale. Exactly Veld's persona.

**Mixed results.** Property 1 is the "good one" (bought earlier, lower rate, solid cash flow). Property 3 is the "tight one" (higher rate, slimmer margins). This is realistic — no landlord has all winners. Research is clear: "Too perfect kills trust. Include some negatives/mixed results." (Supademo dummy data guide).

**Recognizable geography.** "Springfield," "Riverside," "Greenfield" are generic-but-real-sounding town names. Not "123 Test St" or "Acme Property." The names need to feel like properties the user might actually own, without being any real address.

**No fantasy numbers.** Monthly cash flows should range from ~$50 to ~$300 per property. A combined portfolio cash flow of ~$400–$700/mo. This feels real. A landlord seeing +$2,000/mo portfolio cash flow knows it's fake.

### Portfolio-level metrics (expected outputs)

These will compute automatically via `computePortfolioMetrics`:

- **Total value:** ~$898K
- **Total debt:** ~$600K
- **Total equity:** ~$298K
- **Monthly cash flow:** ~$400–700 (varies by exact amortization)
- **Weighted cap rate:** ~6.5–7.5%
- **Portfolio LTV:** ~67%
- **DSCR:** ~1.1–1.3

### The aha moments

**Aha #1 (immediate, on load):** The user sees a complete portfolio dashboard — three properties, total equity, monthly cash flow, cap rate — in one view. This is the "oh, this is what my spreadsheet is trying to be" moment. No input required.

**Aha #2 (interactive, within 30 seconds):** The user taps into a property and sees its individual metrics — cash flow, cap rate, LTV, DSCR — with a mortgage summary. They change the rent by $100. The property metrics update. They go back to the dashboard. The portfolio cash flow has changed. Cause and effect across the portfolio.

**Aha #3 (aspirational, within 60 seconds):** A subtle prompt appears: "This is sample data. What would your properties look like?" CTA: "Add your own properties — free →"

### Demo data best practices applied

| Practice | Implementation |
|---|---|
| Mirror real workflows | Show properties with different purchase dates, rates, and performance profiles — not identical rows |
| Include edge cases | Property 3 has tight cash flow (~$50/mo). This feels real and shows the product handles marginal deals |
| Use just enough data | 3 properties is enough to show portfolio aggregation without overwhelming. Research: "Small, representative sets" (Supademo) |
| Label clearly | Show a "Sample portfolio" label in the demo nav. No one should mistake this for their own data |
| Don't be too perfect | Mixed results across properties. Some metrics green, some neutral. Realistic. |

---

## 4. Placement and Flow

### Landing page integration

The `/demo` route is a separate page. On the landing page, it's promoted via:

**1. Navigation CTA:** Add "Try the demo" to `LandingNav` — both desktop links and mobile hamburger. 80% of top-performing demos have a CTA in the site nav (Navattic 2026).

**2. Hero secondary CTA:** Below "Get started free," add "or try the demo →" as a text link. This gives cautious visitors a non-committal alternative.

```
[Get started free]  ← primary, indigo button (unchanged)
or try the demo →   ← secondary, text link to /demo (NEW)
See pricing →        ← tertiary (move from current secondary position)
```

**3. Product showcase section (NEW):** Between "Value props" and "How it works," add a section with a static mockup/screenshot of the demo dashboard + a "Try the demo" CTA. This is where the user who's scrolled past the calculator and value props gets the "but what does it actually look like?" answer.

### The `/demo` page layout

```
[Demo Nav]  — LandingNav with "Exit demo" + "Sign up free" CTA
[Demo Header] — "See what Veld looks like with your properties"
              — "This is a sample portfolio. Edit any number."
[Tab bar]   — Dashboard | Property 1 | Property 2 | Property 3 | Deal Analyzer
[Content]   — Active tab content
[Sticky CTA] — "Add your own properties — free" (mobile: bottom bar, desktop: subtle footer)
```

**Tab 1: Dashboard (default)**
- Portfolio summary metrics: total value, total debt, total equity, monthly cash flow, cap rate, LTV
- Property list with key metrics per property (name, value, cash flow, cap rate)
- "More metrics" collapsible: NOI, CoC, annual rent, DSCR

**Tabs 2–4: Property detail (one per property)**
- Property hero: name, type, value, equity
- Performance metrics: cash flow, cap rate, DSCR, CoC, LTV
- Editable inputs: monthly rent, monthly expenses, estimated value (inline editing)
- Mortgage summary: balance, payment, rate, term
- On input change: property metrics recalculate → portfolio metrics recalculate on return to Dashboard tab

**Tab 5: Deal Analyzer**
- The existing `PublicCalculator` (or a slightly adapted version), embedded within the demo context
- Shows: "Already tracking 3 properties. Analyze your next deal."
- Ties the deal analysis into the portfolio story

### Gated vs ungated

**Decision: Fully ungated.** No gate at any point in the demo.

- Ungated demos: 2.1x higher engagement rate (19.4% vs 9.2%) across 535,763 sessions (Storylane).
- 66% of top-performing demos are ungated (Navattic 2026).
- At Veld's price point ($0–$15/mo), volume matters more than lead qualification. The Obility study ($20M, 11,286 ads) found free trial CTAs drive 2x CTR and 167% more conversions per impression than gated demos for low-cost SaaS.

The conversion mechanism is the "Add your own properties" CTA *after* value delivery, not a gate before it.

### CTA copy and placement within the demo

| Location | CTA | Destination |
|---|---|---|
| Demo nav (persistent) | "Sign up free" | `/sign-up?intent=free&ref=demo` |
| Sticky bottom bar (mobile) | "Add your properties — free" | `/sign-up?intent=free&ref=demo` |
| After 60 seconds or 3+ interactions | Subtle inline banner: "This is sample data. Add your own properties to get your real numbers." | `/sign-up?intent=free&ref=demo` |
| Deal Analyzer tab | "Save this deal to your portfolio" | `/sign-up?intent=free&ref=demo_analyzer` |
| On exit (back to homepage) | No exit-intent popup. Clean exit. | N/A |

The `ref=demo` parameter lets you track demo-originated signups separately from direct homepage signups. Critical for measuring ROI.

### As a paid traffic landing page

The `/demo` route can serve as a Google Ads landing page for portfolio-related keywords:

- Ad: "Track your rental properties in one place. Try Veld free."
- Landing page: `/demo` (not the homepage)
- Message match between ad copy and demo experience
- Research: dedicated landing pages convert 2–5x higher than homepage for paid traffic (Unbounce). Message match lifts conversion 15–25% (SaaS Hero).

This gives you a testable alternative: run the same ad pointing at homepage (control) vs `/demo` (treatment) and see which converts better.

---

## 5. Friction Elimination

### Load Performance

| Risk | Mitigation |
|---|---|
| Demo bundle size | The demo is a single client component with hardcoded data + `computePropertyMetrics` / `computePortfolioMetrics` (pure math, <5KB). Total component: estimated ~20–30KB gzipped. Use `dynamic()` import if the demo is linked from the landing page. |
| Time to first meaningful paint | Results render on mount with hardcoded data — no API calls, no loading states. The user sees a complete dashboard immediately. Target: <100ms to meaningful content after JS hydration. |
| Route load time | `/demo` is its own route — Next.js App Router will code-split it automatically. No impact on homepage bundle. |

### Mobile UX

| Risk | Mitigation |
|---|---|
| Dashboard metrics overflow | Use `MobileToolShell` with `summaryItems` for the 4 primary metrics + `MobileCollapsible` for secondary metrics. Proven pattern from the existing app. |
| Property switching on mobile | Use a dropdown or horizontal scroll tab bar (not a fixed tab row with 5 items — that overflows on small screens). |
| Editable inputs | Use the same `inputClass` pattern from `PublicCalculator` (`text-base` for iOS zoom prevention, `min-h-[44px]` touch targets). |
| Sticky CTA bar | Fixed bottom bar with "Add your properties — free" button. Account for safe area insets via existing `viewportFit: "cover"` + padding. |

### Cognitive Overload

| Risk | Mitigation |
|---|---|
| Too much data on the dashboard | Show 4 primary metrics (value, equity, cash flow, cap rate) with the property list. Collapse everything else behind "More metrics." Progressive disclosure — same pattern as the real dashboard. |
| Unfamiliar financial terms | Add `helper` text on each metric: "Cap rate" → "Annual return as % of property value." "DSCR" → "Can rental income cover the mortgage?" Same approach as `CalculatorMetric`'s existing `helper` prop, applied to `MetricCard`. |
| Too many tabs | 5 tabs is at the upper limit. On mobile, start with Dashboard as the default and let the user navigate to properties via the property list (tap a property card → navigate to its tab), not the tab bar. The tab bar is for desktop navigation. |
| Editing confusion | When a user edits a number, show a small "Edited" indicator and a "Reset to sample data" link. They should never feel lost. |

### Trust Signals

| Signal | Implementation |
|---|---|
| "Sample portfolio" label | Persistent badge in the demo header: "Sample portfolio — 3 properties." |
| "No account needed" | Subheading: "Explore freely. No signup required." |
| Data privacy | "This demo runs entirely in your browser. Nothing is stored." (Below the header, `text-xs text-muted`.) |
| Transparency | Optional "How we calculate" expandable in the metrics section. Links to formula explanations. Builds trust with skeptical landlords. |

### Demo-to-Signup Transition

**The transition must feel natural, not like a sales trap.**

The approach: accumulate micro-commitments, then offer the logical next step.

1. **Passive exposure (0–30 sec):** User browses dashboard. No CTAs interrupt.
2. **Active engagement (30–60 sec):** User edits a number or drills into a property. The "Sign up free" button in the nav is always visible but not pushy.
3. **Value realized (60+ sec or 3+ interactions):** A gentle inline banner appears: "This is sample data. What would your portfolio look like? **Add your own properties — free →**"
4. **Click CTA:** Navigate to `/sign-up?intent=free&ref=demo`.
5. **Post-signup onboarding:** The new onboarding framework (recently reworked) takes over. No data passes from demo to account — the user adds their real properties during onboarding.

**Future enhancement (Phase 2):** After signup, offer to pre-load the demo property templates into the user's account as starting points they can edit. This bridges the gap between "I was playing with sample data" and "now I have an empty account."

---

## 6. Implementation Approach for Next.js 15 App Router

### Architecture decision: Purpose-built demo page using shared calculation libraries and UI primitives.

This is **not** a fork of the dashboard. It's a new page that:
- Imports `computePropertyMetrics` and `computePortfolioMetrics` for math
- Imports `MetricCard`, `CalculatorMetric`, `MobileToolShell`, `MobilePageSection`, `MobileCollapsible` for UI
- Imports `formatCurrency`, tone functions, and design tokens for consistency
- Manages all state locally with `useState` — no DB, no API, no auth
- Has its own layout optimized for the demo experience

### Component structure

```
app/
├── app/
│   └── demo/
│       ├── page.tsx                     ← Server component: metadata + DemoPortfolio client import
│       └── demo-portfolio.tsx           ← "use client" — main demo orchestrator
├── components/
│   └── demo/
│       ├── demo-dashboard.tsx           ← Portfolio dashboard view (metrics + property list)
│       ├── demo-property-detail.tsx     ← Single property view (metrics + editable inputs)
│       ├── demo-nav.tsx                 ← Demo-specific nav bar (logo, "Sample portfolio" badge, "Sign up free" CTA)
│       ├── demo-tab-bar.tsx             ← Tab navigation (Dashboard | Properties | Analyzer)
│       ├── demo-cta-banner.tsx          ← Conditional "Add your properties" banner (appears after interaction)
│       └── demo-editable-field.tsx      ← Inline-editable metric input with "Edited" indicator
├── lib/
│   ├── metrics/
│   │   ├── property-metrics.ts          ← NO CHANGE (shared math)
│   │   └── portfolio-metrics.ts         ← NO CHANGE (shared math)
│   └── demo/
│       └── demo-seed-data.ts            ← Hardcoded property data + types
```

### Seed data module (`demo-seed-data.ts`)

```typescript
import type { PortfolioPropertyInput } from "@/lib/metrics/portfolio-metrics";

export type DemoProperty = {
  id: string;
  nickname: string;
  addressLine1: string;
  city: string;
  state: string;
  propertyType: "single_family" | "duplex" | "triplex" | "fourplex";
  purchasePrice: number;
  currentEstimatedValue: number;
  monthlyRent: number;
  monthlyExpenses: number;
  mortgageBalance: number;
  monthlyPayment: number;
  interestRate: number;
  downPaymentPercent: number;
  termYears: number;
  vacancyPercent: number;
  cashInvested: number;
  ownershipPercent: number;
};

export const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: "demo-1",
    nickname: "456 Maple St",
    addressLine1: "456 Maple St",
    city: "Springfield",
    state: "IL",
    propertyType: "single_family",
    purchasePrice: 245000,
    currentEstimatedValue: 268000,
    monthlyRent: 1850,
    monthlyExpenses: 580,
    mortgageBalance: 178200,
    monthlyPayment: 1272,
    interestRate: 6.75,
    downPaymentPercent: 20,
    termYears: 30,
    vacancyPercent: 5,
    cashInvested: 49000,
    ownershipPercent: 100,
  },
  // ... properties 2 and 3
];
```

### State management (`demo-portfolio.tsx`)

```typescript
"use client";

// All state is local. No Context, no stores, no API calls.
const [properties, setProperties] = useState<DemoProperty[]>(DEMO_PROPERTIES);
const [activeTab, setActiveTab] = useState<string>("dashboard");
const [interactionCount, setInteractionCount] = useState(0);
const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

// Derive metrics from state (recompute on every property change)
const portfolioInput: PortfolioPropertyInput[] = properties.map(p => ({
  id: p.id,
  monthlyRent: p.monthlyRent,
  monthlyExpenses: p.monthlyExpenses,
  estimatedValue: p.currentEstimatedValue,
  cashInvested: p.cashInvested,
  totalMortgageBalance: p.mortgageBalance,
  totalMonthlyPayment: p.monthlyPayment,
  ownershipPercent: p.ownershipPercent,
  vacancyPercent: p.vacancyPercent,
}));

const portfolioMetrics = useMemo(
  () => computePortfolioMetrics(portfolioInput),
  [portfolioInput]
);
```

### Route registration

Add `/demo` to the public routes in `proxy.ts`:

```typescript
// In isPublicRoute matcher, add:
"/demo",
"/demo(.*)",
```

### How this stays in sync

| Layer | Sync mechanism | Drift risk |
|---|---|---|
| **Calculation logic** (`computePropertyMetrics`, `computePortfolioMetrics`) | Direct import. Auto-synced. | None |
| **UI primitives** (`MetricCard`, `MobileToolShell`, etc.) | Direct import. Auto-synced. | None |
| **Design tokens** (colors, fonts, spacing) | Tailwind classes reference the same CSS variables. Auto-synced. | None |
| **Demo layout vs real dashboard layout** | Independent. Demo has its own layout components. | Acceptable. The demo is a preview, not a replica. Visual parity is not required. |
| **Seed data** | Hardcoded in `demo-seed-data.ts`. Does not auto-update. | Low risk. Property prices and rates change slowly. Review quarterly. |
| **Feature additions** | If the real app adds a new metric (e.g., GRM), the demo won't show it until manually added. | Acceptable. The demo shows core metrics. New features are a reason to sign up, not a demo requirement. |

### Why this is cheaper than a full sandbox

| Full sandbox approach | This approach |
|---|---|
| Fork or bypass auth system | No auth at all — public route |
| Seed and maintain test DB records | Hardcoded JSON in one file |
| Mock API endpoints (rent estimates, value enrichment) | No API calls — pure client-side math |
| Keep demo account in sync with schema migrations | No database interaction |
| Handle edge cases (demo user accidentally deletes data, session expiry) | Stateless. Refresh = reset. |
| **Estimated effort: 2–4 weeks** | **Estimated effort: 1–1.5 weeks** |

---

## 7. Implementation Plan (Build Order)

### Phase 0: Landing page prep (Day 1)

1. **Add "Try the demo" to `LandingNav`** — text link in desktop nav links and mobile hamburger menu. Points to `/demo`.
2. **Add hero secondary CTA** — "or try the demo →" below "Get started free" in the hero. Use `FunnelCtaLink` with `placement="landing_hero"` and `ctaId="try_demo"`.
3. **Add `/demo` to public routes** in `proxy.ts`.

### Phase 1: Seed data + portfolio math (Day 1–2)

4. **Create `app/lib/demo/demo-seed-data.ts`** — hardcoded 3-property portfolio with types.
5. **Verify math** — write a quick test or console check that `computePortfolioMetrics` with the seed data produces the expected portfolio metrics (equity ~$298K, cash flow ~$400–700/mo, cap rate ~6.5–7.5%).
6. **Create `app/app/demo/page.tsx`** — server component with metadata (`title: "Try Veld Portfolio — Interactive Demo"`, `robots: { index: true }`). Dynamic import of `DemoPortfolio`.

### Phase 2: Demo dashboard (Days 2–4)

7. **Create `app/components/demo/demo-nav.tsx`** — minimal nav: Veld logo (links to `/`), "Sample portfolio" badge, "Sign up free" button (indigo accent). Use `LandingNav` as reference but keep it simpler.
8. **Create `app/components/demo/demo-dashboard.tsx`** — portfolio metrics grid using `MetricCard` + property list (cards with name, value, cash flow, cap rate). Include `MobileCollapsible` for secondary metrics.
9. **Create `app/app/demo/demo-portfolio.tsx`** — "use client" orchestrator. Manages `properties` state, `activeTab`, `interactionCount`. Renders `DemoNav` + `DemoTabBar` + active view. Computes `portfolioMetrics` via `useMemo`.
10. **Create `app/components/demo/demo-tab-bar.tsx`** — Desktop: horizontal tabs. Mobile: dropdown or segmented control for top-level views (Dashboard / Properties / Analyzer).

### Phase 3: Property detail with editable fields (Days 4–6)

11. **Create `app/components/demo/demo-editable-field.tsx`** — an input that looks like a display value but becomes editable on tap/click. Shows "Edited" badge when modified. Has "Reset" affordance.
12. **Create `app/components/demo/demo-property-detail.tsx`** — single property view. Shows: property hero (name, type, city/state), metrics grid (`MetricCard` for cash flow, cap rate, DSCR, CoC, LTV), editable fields (rent, expenses, value), mortgage summary (balance, payment, rate — read-only).
13. **Wire up editing** — when user edits a field, update the specific property in `properties` state. `portfolioMetrics` recomputes automatically via `useMemo`. Track `interactionCount`.

### Phase 4: Deal Analyzer tab + CTA system (Days 6–7)

14. **Integrate `PublicCalculator`** in the Deal Analyzer tab — render the existing component with `surface="app"` and `showCta={false}`. Add a contextual header: "Already tracking 3 properties. Analyze your next deal."
15. **Create `app/components/demo/demo-cta-banner.tsx`** — renders after `interactionCount >= 3` or after 60 seconds (whichever comes first). Copy: "This is sample data. What would your portfolio look like? **Add your own properties — free →**". Animate in with `transition-opacity duration-300`.
16. **Add sticky mobile CTA** — fixed bottom bar on mobile: "Add your properties — free" button. Accounts for safe-area insets.

### Phase 5: Polish + mobile optimization (Days 7–8)

17. **Mobile property navigation** — on mobile, tapping a property card in the dashboard navigates to its detail view (updates `activeTab`). Back button returns to dashboard.
18. **"Reset to sample data"** — global reset button in demo nav (or per-field). Resets `properties` to `DEMO_PROPERTIES`.
19. **Responsive testing** — verify on iPhone SE (320px), iPhone 15 (390px), iPad (768px), desktop (1280px+). Check: no horizontal overflow, touch targets ≥ 44px, no iOS zoom on input focus.
20. **SEO** — add structured data, OG tags, and a meta description optimized for "rental property portfolio demo" / "try landlord portfolio tracker."

### Phase 6: Analytics (Days 8–9)

21. **Instrument events** (see Section 8).
22. **PostHog feature flag** — `demo-page-enabled` for gradual rollout.

### Phase 7: Calculator section enhancement (Days 9–10)

23. **Update `PublicCalculator` seed data** — $285K / $2,200 / $650 (from v1 recommendation — still valid for the homepage calculator).
24. **Add product showcase section** to landing page — between value props and how it works. Static mockup of the demo dashboard + "Try the demo →" CTA. Use existing `MockupFrame` + `DashboardMockup` (enhanced with more realistic data).
25. **Refine calculator section** — keep it in current position but update heading to "Analyze a deal before you buy" and add "or explore the full product →" link to `/demo`.

---

## 8. Measurement

### Events to Fire (PostHog)

**Landing page events (existing + new):**

| Event | Trigger | Properties |
|---|---|---|
| `demo_link_clicked` | User clicks "Try the demo" anywhere on landing page | `placement` (hero/nav/showcase/calculator_section), `landing_variant`, `viewport` |

**Demo page events:**

| Event | Trigger | Properties |
|---|---|---|
| `demo_viewed` | `/demo` page loads | `viewport`, `referrer` (homepage/direct/ad), `ref` param |
| `demo_tab_switched` | User switches between tabs | `from_tab`, `to_tab`, `time_on_previous_tab`, `viewport` |
| `demo_property_viewed` | User views a specific property detail | `property_id` (demo-1/2/3), `viewport` |
| `demo_field_edited` | User edits any property field | `property_id`, `field` (rent/expenses/value), `viewport`, `interaction_number` |
| `demo_portfolio_recalculated` | Portfolio metrics recompute after edit | `total_edits`, `properties_edited_count` |
| `demo_analyzer_used` | User interacts with the Deal Analyzer tab | `viewport` |
| `demo_cta_shown` | "Add your properties" banner becomes visible | `trigger` (interaction_count/time), `total_interactions`, `time_on_page` |
| `demo_cta_clicked` | User clicks any signup CTA within demo | `cta_location` (nav/banner/sticky_bar/analyzer), `total_interactions`, `time_on_page`, `viewport` |
| `demo_session_ended` | User leaves the demo (page unload or navigate away) | `total_time`, `tabs_viewed`, `properties_edited`, `cta_clicked` (boolean), `viewport` |
| `demo_reset_clicked` | User resets to sample data | `total_edits_before_reset` |

### Funnel to Track

```
demo_link_clicked (from landing page)
  → demo_viewed                         (target: 90%+ — drop-off = page load failure)
    → demo_tab_switched                 (target: 50%+ — user explored beyond dashboard)
      → demo_field_edited               (target: 30%+ of viewers — user engaged deeply)
        → demo_cta_shown                (target: auto — fires for all editors)
          → demo_cta_clicked            (target: 15-25% of CTA shown)
            → signup_started            (existing event)
              → signup_completed        (existing event)
```

**End-to-end target:** 10–20% of demo viewers convert to signup (based on beehiiv's 20% demo-view-to-signup benchmark for prosumer SaaS).

### Conversion Baselines

**Before launching the demo, measure:**
- Homepage visitor → signup rate (current, all sources)
- Homepage visitor → signup rate (paid traffic only)
- Calculator interaction → signup rate (current)

**After launching, compare:**
- Demo viewer → signup rate vs homepage visitor → signup rate
- Paid traffic to `/demo` → signup vs paid traffic to homepage → signup
- Demo-originated signups → paid plan conversion vs non-demo signups → paid plan conversion

### A/B Tests

**Test 1: Demo link placement** (low effort, high signal)
- A: "Try the demo" in hero only
- B: "Try the demo" in hero + nav + showcase section
- Metric: `demo_link_clicked` rate
- Sample: 2,000 visitors per variant, 14 days

**Test 2: Demo as ad landing page** (high effort, high signal)
- A: Google Ad → homepage
- B: Google Ad → `/demo`
- Metric: ad click → signup_completed
- Budget: allocate $250–$500 to each variant
- Runtime: until budget spent or 14 days, whichever comes first

**Test 3: Demo with calculator vs demo alone** (medium effort)
- A: Landing page with calculator section + demo link
- B: Landing page with demo link replacing calculator section
- Metric: homepage visitor → signup_completed
- Sample: 3,800 per variant at 3% baseline, 14 days

---

## Deliverable A: Recommendation Summary

| Question | Decision |
|---|---|
| **Demo format** | Interactive portfolio preview at `/demo` with 3 pre-filled properties. Editable rent/value/expenses with live portfolio recalculation. |
| **Demo content** | 3-property portfolio ($245K–$325K range, mixed property types, realistic cash flows). Aha moment: seeing the complete portfolio on load, then watching metrics update on edit. |
| **Landing page integration** | "Try the demo" CTA in hero (secondary) + nav + new product showcase section. Calculator stays as secondary engagement tool. |
| **Gating** | Fully ungated. No email, no signup, no wall at any point. |
| **CTA copy** | "Add your own properties — free →" (primary, after interaction). "Sign up free" (nav, persistent). |
| **Mobile behavior** | Full responsive layout using `MobileToolShell`, `MobilePageSection`, `MobileCollapsible`. Property navigation via tappable cards, not tab bar. Sticky bottom CTA bar. |
| **Implementation** | Purpose-built `/demo` route. ~9–10 days across 7 phases. No new dependencies. Shared math + UI primitives. |
| **As ad landing page** | `/demo` as a testable Google Ads destination for portfolio-related keywords. Budget: $250–$500 test. |
| **Measurement** | 11 PostHog events. 3 A/B tests. 10–20% demo-to-signup target. |

---

## Deliverable B: Demo Spec

### Route
`/demo` — public, no auth, indexed by search engines.

### Format
Multi-tab interactive portfolio preview. Client-side only. No API calls.

### Navigation Tabs
1. **Dashboard** (default) — portfolio metrics + property list
2. **Property detail** (×3) — individual metrics + editable inputs
3. **Deal Analyzer** — existing `PublicCalculator` in demo context

### Seed Data

| Property | Type | Value | Rent | Expenses | Mortgage | Cash Flow (est.) |
|---|---|---|---|---|---|---|
| 456 Maple St, Springfield IL | SFH | $268K | $1,850 | $580 | $178K @ 6.75% | ~$100–200/mo |
| 1220 Oak Ave, Riverside OH | Duplex | $345K | $2,800 | $820 | $218K @ 7.0% | ~$200–300/mo |
| 89 Pine Dr, Greenfield TN | SFH | $285K | $2,100 | $680 | $204K @ 7.25% | ~$50–100/mo |

### Portfolio Summary (on load)
~$898K value · ~$600K debt · ~$298K equity · ~$400–700/mo cash flow · ~6.5–7.5% cap rate · ~67% LTV

### Editable Fields (per property)
Monthly rent, Monthly expenses, Estimated value. Portfolio recalculates on edit.

### Aha Moments
1. See complete portfolio on load (0 sec)
2. Edit a number, watch portfolio update (30 sec)
3. "What would your portfolio look like?" prompt (60 sec / 3 interactions)

### CTA
- Nav: "Sign up free"
- Inline banner (after engagement): "This is sample data. Add your own properties — free →"
- Mobile: sticky bottom bar "Add your properties — free"
- All CTAs → `/sign-up?intent=free&ref=demo`

### Mobile Behavior
- Dashboard: `MobileToolShell` with `summaryItems` (value, equity, cash flow, cap rate) + collapsible secondary metrics + scrollable property cards
- Property detail: `MobileToolShell` with property metrics + `MobilePageSection` groups for editable inputs and mortgage info
- Navigation: dashboard → tap property card → property detail. Back button returns to dashboard.
- Sticky bottom CTA bar with safe-area padding

### Desktop Behavior
- Horizontal tab bar at top
- Dashboard: 4-metric grid + property table/cards
- Property detail: 2-column layout (metrics left, editable inputs right)
- Persistent "Sign up free" in nav

---

## Deliverable C: Maintenance Contract

### What must stay in sync

| Element | Sync mechanism | Effort |
|---|---|---|
| Calculation logic (`computePropertyMetrics`, `computePortfolioMetrics`) | Direct import — auto-synced | Zero |
| UI primitives (`MetricCard`, `MobileToolShell`, tone functions) | Direct import — auto-synced | Zero |
| Design tokens (colors, fonts, shadows) | Tailwind CSS variables — auto-synced | Zero |
| Metric definitions (cap rate, DSCR, CoC) | If the app renames or redefines a metric, update demo labels | Trivial (1 file) |

### What can drift

- **Demo layout vs real dashboard layout.** The demo is a simplified preview. It doesn't need every dashboard feature (charts, rent estimates, benchmarks). New dashboard features are a reason to sign up, not a demo update requirement.
- **Seed data.** Property prices and mortgage rates can change. This affects realism, not correctness. Update when it starts to feel dated.
- **Demo property count.** Starting with 3 is correct. If the product adds new features that only make sense at 5+ properties, consider adding a 4th demo property. But don't over-stuff it.

### Review cadence

| Trigger | Action |
|---|---|
| **Monthly** | Check that seed data mortgage rates are within 0.5% of current market. If not, adjust. |
| **Quarterly** | Review demo-to-signup conversion funnel. If demo_cta_clicked → signup_completed drops below 50% of launch baseline, investigate. |
| **On new app feature** | Evaluate: does this feature need to appear in the demo to tell the story? Usually no. Only add it if it's a *core* portfolio feature (not a power-user tool). |
| **On pricing change** | Verify CTA links include correct `intent` param. |
| **On design system change** | Auto-synced via shared components. Spot-check the demo after major visual updates. |

### What to never do

- **Don't add auth to the demo.** The moment you require login, engagement drops 2.1x (Storylane data).
- **Don't make the demo a replica of the app.** It's a preview. Simplicity is the point. A feature-complete demo is a product, not a demo.
- **Don't gate the demo after launch** because lead gen pressure mounts. The data is unambiguous: ungated wins at this price point.

---

## Deliverable D: Risk Table

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Demo cannibalizes signups** — users satisfied by demo data never sign up because they don't need "their own" portfolio | Medium | High | Track `demo_session_ended` with `cta_clicked: false`. If >80% of engaged demo users (3+ interactions) leave without clicking CTA, the demo is satisfying curiosity without creating urgency. Fix: add portfolio-only features that are visible but grayed out in demo ("Rent estimates — requires account," "Mortgage payoff projections — requires account"). |
| 2 | **Seed data feels fake** — generic town names and round numbers signal "this is marketing" to a skeptical landlord | Medium | Medium | Use specific-sounding addresses (not "123 Main St"). Use non-round numbers ($268,000 not $270,000). Include a property with tight/negative cash flow. Test with 3–5 actual landlords before launch (qualitative user test). |
| 3 | **Mobile demo UX is poor** — 5-tab navigation breaks on small screens, editable fields feel clunky | Medium | High | Don't use a 5-tab bar on mobile. Use dashboard-as-home + tappable property cards for navigation. Test on iPhone SE (320px) as the minimum viewport. Prioritize mobile UX in Phase 5 (days 7–8). |
| 4 | **Demo confuses paid traffic** — ad viewers expect to land on a signup page, not a product demo, creating friction | Low | Medium | A/B test ads to `/demo` vs ads to homepage (Test 2 in measurement plan). If demo landing performs worse, revert to homepage and keep demo as an organic/nav-linked experience only. |
| 5 | **Maintenance burden grows** — demo layout diverges from the real app over multiple design iterations, creating a "second codebase" | Low | Medium | The demo intentionally uses shared primitives (`MetricCard`, `MobileToolShell`) so visual updates propagate automatically. Layout divergence is acceptable. If drift becomes a problem, schedule a 1-day "demo refresh" every 6 months. Budget for it. |
| 6 | **10-day build estimate is wrong** — scope creep from trying to replicate too much of the real app | Medium | Medium | Define a hard scope boundary: the demo shows metrics + editable inputs. No charts, no amortization schedules, no rent estimates, no CSV export. If a feature isn't in the demo spec, it's out of scope. Phase 2 review: if behind by day 4, cut the Deal Analyzer tab (Phase 4) and ship without it. |

---

## Deliverable E: Relationship Between Calculator and Demo

The calculator and portfolio demo serve different personas at different intent levels. Both should exist.

| | Homepage Calculator | Portfolio Demo (`/demo`) |
|---|---|---|
| **Persona** | Deal shopper evaluating a specific property | Spreadsheet-fatigued owner looking for a portfolio tool |
| **Intent level** | Tactical ("What's the cash flow on this deal?") | Strategic ("Can this replace my spreadsheet?") |
| **Engagement model** | Input own numbers → see result | Browse sample data → edit to explore → imagine own portfolio |
| **Aha moment** | Positive cash flow on a deal | Complete portfolio view in one place |
| **Conversion path** | "Save this analysis → Sign up" | "Add your own properties → Sign up" |
| **Placement** | Embedded in landing page (current position) | Separate `/demo` route, linked from landing page + nav |
| **Maintenance** | Near-zero (shared math, existing component) | Low (shared math + UI, custom layout) |
| **Ad landing page use** | For deal-analysis keywords | For portfolio-management keywords |

### The recommended landing page flow (updated)

```
Hero
  "Get started free" (primary CTA)
  "or try the demo →" (secondary — links to /demo)
  "See pricing →" (tertiary)

Social proof strip (unchanged)

Calculator section
  Heading: "Analyze a deal before you buy"
  PublicCalculator (enhanced seed data)
  "Open full calculator →" + "or explore the full product →" (links to /demo)

Value props (unchanged)

NEW: Product showcase section
  Static mockup of the demo dashboard
  "See Veld with real data — try the demo →"

How it works (unchanged)

Honest scope (unchanged)

Pricing (unchanged)

Bottom CTA
  "Create your free account" (primary)
  "or explore the demo first →" (secondary — links to /demo)
```

---

## Appendix: Research Sources

### Prosumer/B2C SaaS Demo Data
- Supademo / beehiiv, "beehiiv Case Study" — 20% demo-view-to-signup, 50% higher free-to-paid. supademo.com/customers/beehiiv-case-study
- ChartMogul, "SaaS Conversion Report 2026" (N=200 products) — ungated freemium: 7–9% free-to-paid. chartmogul.com/reports/saas-conversion-report
- Contrast / Factors.ai (N=110,000 sessions) — interactive demos: 24.35% conversion (7.9x). Via Walnut Blog.

### Interactive Demo Benchmarks
- Navattic, "State of the Interactive Product Demo 2025 & 2026" — multi-flow: 48% higher completion; 66% ungated; 80% nav CTA. navattic.com/report/
- Storylane, "The Gate Debate" (N=535,763) — ungated: 2.1x engagement. storylane.uk/plot/should-you-gate-your-interactive-demos
- Outgrow, "User Engagement Benchmarks 2026" (N=10,000+) — ROI calculators: 47.3% interaction rate; financial services: 48% completion, 38% lead conversion.

### Demo Data Best Practices
- Supademo, "Dummy Data Guide" — imagination tax concept, 7 best practices. supademo.com/blog/dummy-data
- SmartCue, "Demo Data Guide" — too-perfect kills trust. getsmartcue.com/blog/demo-data

### Ad Conversion
- Obility / MarTech ($20M, 11,286 ads) — free trial CTA: 2x CTR, 167% more conversions vs demo CTA for low-cost SaaS. martech.org
- SaaS Hero — dedicated landing pages: 2–5x over homepage; message match: 15–25% lift. saashero.net
- FORM / Navattic — interactive demos on PPC landing pages: 33% conversion increase. navattic.com/blog/product-demos-ads
- UpperHand — ungated tour replaced "Request a Demo": 127% increase in qualified leads. Via Aimers.

### General CRO
- Unbounce (41,000 pages) — SaaS LP median: 3.8%, top 25%: 11.6%+. unbounce.com
- DollarPocket — "Calculate My Savings": +62% CVR; sticky mobile CTA: +42% mobile CVR. dollarpocket.com
- ConversionLab / BetterWorld — removing email field: 99.5% CVR uplift. blog.conversionlab.no
- Webim — progressive disclosure: +27% signup, −18% Step 1 drop-off. insights.webim.space
- Aimers, "SaaS CRO Trends 2026" — interactive demos: 2x engagement vs video. aimers.io
- Elena Verna, "Reverse Trials Examples" — Canva, Notion, Airtable, Dropbox patterns. elenaverna.com
