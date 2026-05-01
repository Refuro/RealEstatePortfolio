# Tools Hub Expansion — Stage-by-Stage Execution

**Purpose:** Execute the tools hub SEO expansion plan in isolated, reviewable stages. Each stage is self-contained — the agent running it only needs this document plus the files listed.

**Recommended model per stage:** Listed at the top of each stage. See [`docs/process/AVAILABLE_AGENTS.md`](process/AVAILABLE_AGENTS.md) for Cursor rule slugs and model-tier notes.

**Skills used across this plan** (workspace paths — parent of `RealEstatePortfolio/`):
- `RealEstateProject/.cursor/skills/veld-ui/SKILL.md` — design tokens, component patterns (read before any UI stage)
- `RealEstateProject/.cursor/skills/veld-mobile/SKILL.md` — MobileToolShell, touch targets (read before any calculator component stage)
- `RealEstateProject/.cursor/skills/veld-landing-cta/SKILL.md` — CTA hierarchy, public page conversion rules (read before any public tool page stage)

**Architecture reference:** `docs/reference/complete-engineering-reference.md`

**Testing policy:** Calculator math libs require a `.test.ts` file in the same change. See `docs/qa/testing-hardening-proposal.md` §1.1.

---

## Stage 1 — Hub page revamp

**Recommended model:** Composer 2 Fast

**What this does:** Replaces the vertical list in `CalculatorsHubCards` with a 2-column responsive grid grouped by category. Fixes the `reveal-up-d*` animation class ceiling. Updates hub page metadata to name all calculators.

**Read before starting:**
- `RealEstateProject/.cursor/skills/veld-ui/SKILL.md`
- `RealEstateProject/.cursor/skills/veld-landing-cta/SKILL.md`
- `app/components/calculators/calculators-hub-cards.tsx` (current component to replace)
- `app/app/tools/page.tsx` (public hub — metadata update)
- `app/app/(app)/calculators/page.tsx` (in-app hub — metadata update)

### Task

Restructure `app/components/calculators/calculators-hub-cards.tsx` from a hardcoded `space-y-4` vertical list to a **data-driven 2-column responsive grid** (1 column on mobile) grouped by category section headers.

**Category groups:**

| Category | Calculators (in order) |
|----------|----------------------|
| Rental strategy | Investment property, STR vs LTR, Cap rate, Cash-on-cash, DSCR |
| Transaction | BRRR, Fix and flip, Wholesale / MAO |
| Compare | Rent vs buy |

**Note:** Cap rate, Cash-on-cash, DSCR, Wholesale, and Rent vs buy don't exist yet — add their card definitions now as stubs (correct href, icon, title, description copy, "Open calculator" link). They will wire up to real pages in later stages. The `variant="public"` hrefs will be `/tools/[slug]`; `variant="app"` will be `/calculators/[slug]`.

**Animation:** Category headers use `reveal-up` with staggered `animationDelay` via inline style (e.g. `style={{ animationDelay: "0ms" }}`). Do NOT use `reveal-up-d5` or higher — those classes don't exist in the CSS. Cards within each category use inline `animationDelay` incremented by 50ms per card.

**Also update:**
- `app/app/tools/page.tsx` — update `metadata.description` to name all 9 calculators including the 5 new ones
- `app/app/(app)/calculators/page.tsx` — same metadata description update

### Acceptance criteria

- [ ] Hub renders as a 2-column grid on desktop, 1 column on mobile
- [ ] 3 category section headers visible (Rental strategy, Transaction, Compare)
- [ ] All 9 calculator cards present (4 existing + 5 stubs)
- [ ] Stub cards for new calculators link to correct `/tools/[slug]` and `/calculators/[slug]` paths (404 until later stages — that's fine)
- [ ] No `reveal-up-d5` or higher classes used anywhere
- [ ] `npm run check` passes

---

## Stage 2 — LocationData extension + location page update

**Recommended model:** Claude Sonnet 4.6

**What this does:** Adds `medianHomePrice` and `avgCapRate` fields to all 50 states in `location-data.ts`. Updates `calculator-location-page.tsx` to pass state-specific values to each calculator and show calculator-relevant stats in the local context panel.

**Read before starting:**
- `app/lib/marketing/location-data.ts` — full file (50-state array to extend)
- `app/components/marketing/calculator-location-page.tsx` — full file (dispatcher + stats block to update)
- `app/lib/marketing/calculator-location-pages.ts` — full file (SIBLING_CALCULATORS to update)

### Task A — Extend `LocationData` type and populate all 50 states

Add two new optional fields to the `LocationData` type in `app/lib/marketing/location-data.ts`:

```typescript
medianHomePrice?: number;   // median SFR/condo sale price, 2024/2025. Source: Redfin/Zillow Research.
avgCapRate?: number;        // typical residential investment cap rate, decimal (e.g. 0.06 = 6%). Source: CBRE/local market data.
```

Populate both fields for all 50 states using publicly available 2024–2025 data. Add a JSDoc comment citing the source. Example values for reference (use accurate sourced data, not these exact numbers):
- Texas: `medianHomePrice: 310000, avgCapRate: 0.065`
- California: `medianHomePrice: 790000, avgCapRate: 0.045`
- Florida: `medianHomePrice: 410000, avgCapRate: 0.058`
- New York: `medianHomePrice: 450000, avgCapRate: 0.042`

### Task B — Update `calculator-location-page.tsx` dispatcher

The component has hardcoded `{calculator === "brrr" && <BrrrCalculator .../>}` blocks. Make the following changes:

1. **Add dispatch blocks for all 5 new calculators** (components don't exist yet — import them with `// TODO: import` comments and use a placeholder `<div>Coming soon</div>` for now). This ensures the file is ready and won't need structural changes in later stages.

2. **Fix `fix-and-flip` — add missing pre-fill:**
```tsx
{calculator === "fix-and-flip" && (
  <FixAndFlipCalculator
    showCta
    landingVariant={variant}
    initialPurchasePrice={location.medianHomePrice}  // ADD THIS
  />
)}
```

3. **Pass new initial values to existing calculators** (only if the component already accepts these props — if not, the prop will be added in the calculator's own stage):

| Calculator | New prop to add |
|-----------|----------------|
| `cap-rate` | `initialPurchasePrice={location.medianHomePrice}` |
| `cash-on-cash` | `initialCashInvested={location.medianHomePrice ? location.medianHomePrice * 0.20 : undefined}` |
| `dscr` | `initialLoanBalance={location.medianHomePrice ? location.medianHomePrice * 0.80 : undefined}` |
| `wholesale` | `initialArv={location.medianHomePrice}` |

4. **Update `SIBLING_CALCULATORS`** array (currently 4 items, hardcoded at the top of the file):
```typescript
const SIBLING_CALCULATORS: CalculatorLocationSlug[] = [
  "brrr",
  "str-vs-ltr",
  "fix-and-flip",
  "investment-property",
  "cap-rate",
  "cash-on-cash",
  "dscr",
  "wholesale",
  "rent-vs-buy",
];
```
The `siblingLinks()` function already slices to 2, so order determines which siblings show. This is fine.

5. **Make the local context stats block calculator-aware** — add a 4th `<dt>/<dd>` row that is conditional on `calculator`:

```tsx
{calculator === "cap-rate" && location.avgCapRate != null && (
  <>
    <dt className="text-muted">Typical cap rate</dt>
    <dd className="font-medium text-foreground sm:col-span-2">
      ~{(location.avgCapRate * 100).toFixed(1)}%
    </dd>
  </>
)}
{(calculator === "cash-on-cash" || calculator === "wholesale" || calculator === "rent-vs-buy") && location.medianHomePrice != null && (
  <>
    <dt className="text-muted">Median home price</dt>
    <dd className="font-medium text-foreground sm:col-span-2">
      ~${location.medianHomePrice.toLocaleString()}
    </dd>
  </>
)}
{calculator === "dscr" && (
  <>
    <dt className="text-muted">Lender DSCR minimum</dt>
    <dd className="font-medium text-foreground sm:col-span-2">
      Typically 1.25 — confirm with your lender
    </dd>
  </>
)}
```

### Task C — Add high-traffic state extraFaqs for new calculators

In `app/lib/marketing/location-data.ts`, add calculator-specific `extraFaqs` to Texas and Florida (only — don't do all 50 states). The `extraFaqs` mechanism already exists and is merged in the location page component.

Add 1 FAQ per new calculator per state. Example:
- Texas + cap-rate: "What is a good cap rate in Texas?" → Texas-specific answer (DFW/Houston ranges, effect of ~1.6% property tax)
- Florida + dscr: "What DSCR do Florida lenders typically require?" → Florida-specific answer

### Acceptance criteria

- [ ] All 50 states have `medianHomePrice` and `avgCapRate` populated with sourced values
- [ ] Source is cited in JSDoc above the array
- [ ] `calculator-location-page.tsx` has dispatch stubs for all 9 calculator slugs
- [ ] `fix-and-flip` state pages now receive `initialPurchasePrice`
- [ ] `SIBLING_CALCULATORS` includes all 9 slugs
- [ ] Local context stats block shows calculator-specific 4th row
- [ ] TX and FL have new `extraFaqs` for at least 2 of the 5 new calculators
- [ ] `npm run check` passes

> **Human review recommended before deploying this stage:** Spot-check `medianHomePrice` and `avgCapRate` for TX, FL, CA, NY, GA, CO against a current source (Redfin, Zillow Research, CBRE) before shipping. These are static content shown to users.

---

## Stage 3 — Cap Rate Calculator

**Recommended model:** Composer 2 Fast

**Read before starting:**
- `RealEstateProject/.cursor/skills/veld-ui/SKILL.md`
- `RealEstateProject/.cursor/skills/veld-mobile/SKILL.md`
- `RealEstateProject/.cursor/skills/veld-landing-cta/SKILL.md`
- `app/lib/fix-and-flip-calculator.ts` — reference for math lib pattern
- `app/components/marketing/fix-and-flip-calculator.tsx` — reference for client component pattern (DEFAULTS, state, MobileToolShell, CalculatorMetric)
- `app/app/tools/fix-and-flip/page.tsx` — reference for public page pattern (metadata, breadcrumb, hero, FAQ, CTA block)
- `app/app/(app)/calculators/fix-and-flip/page.tsx` — reference for in-app page pattern
- `app/lib/marketing/calculator-faqs.ts` — to add new FAQ constant
- `app/lib/marketing/calculator-location-pages.ts` — to add slug
- `app/app/sitemap.ts` — to add URL entry

### New files to create

**`app/lib/cap-rate-calculator.ts`**

```typescript
export type CapRateInput = {
  purchasePrice: number;
  monthlyRent: number;
  vacancyPercent: number;        // e.g. 5 for 5%
  monthlyOperatingExpenses: number;
  annualPropertyTaxes: number;
  annualInsurance: number;
  otherMonthlyCosts: number;
};

export type CapRateResult = {
  capRate: number | null;        // null if purchasePrice is 0
  annualNoi: number;
  monthlyNoi: number;
  grossRentMultiplier: number | null;
  effectiveGrossIncome: number;  // annual gross rent after vacancy
  totalAnnualExpenses: number;
};

export function computeCapRateResult(input: CapRateInput): CapRateResult { ... }
```

Math:
- `effectiveGrossIncome = monthlyRent * 12 * (1 - vacancyPercent / 100)`
- `totalAnnualExpenses = (monthlyOperatingExpenses + otherMonthlyCosts) * 12 + annualPropertyTaxes + annualInsurance`
- `annualNoi = effectiveGrossIncome - totalAnnualExpenses`
- `monthlyNoi = annualNoi / 12`
- `capRate = purchasePrice > 0 ? annualNoi / purchasePrice : null`
- `grossRentMultiplier = monthlyRent > 0 ? purchasePrice / (monthlyRent * 12) : null`

**`app/lib/cap-rate-calculator.test.ts`**

Minimum 6 test cases: normal case, zero purchase price (capRate null), zero rent, high vacancy, expense-heavy (negative NOI), and a known-answer reference case.

**`app/components/marketing/cap-rate-calculator.tsx`**

Client component following the exact `str-ltr-calculator.tsx` / `fix-and-flip-calculator.tsx` structural pattern:
- `"use client"`
- `DEFAULTS` constant (purchase price ~$300,000, monthly rent ~$2,200, vacancy 5%, expenses ~$400/mo, taxes ~$4,500/yr, insurance ~$1,800/yr, other ~$0)
- Props: `compact?`, `showCta?`, `landingVariant?`, `surface?: "marketing" | "app"`, `initialPurchasePrice?: number`, `initialMonthlyRent?: number`
- `useMemo` for result
- Desktop layout: `md:grid md:grid-cols-12` — inputs col-span-8, results col-span-4
- `md:hidden` block: full `MobileToolShell` with:
  - `eyebrow="Calculator"`, `title="Cap Rate"`, `description="..."`, `context` (live summary), `summaryItems` (cap rate %, annual NOI, GRM)
  - Mobile inputs in `MobilePageSection` + `MobileCollapsible` for secondary fields
  - Mobile results in `MobilePageSection title="Results"`
  - Full-width CTAs
- `CalculatorMetric` for all output values with appropriate tones (use `getCapRateTone` from `lib/calculator-metric-tones.ts` for cap rate output)
- `FunnelCtaLink` for inline CTAs (`placement="cap_rate_inline"`, `ctaId="get_started_free"`, `planIntent="free"`, `landingVariant`)
- When `surface="app"`: inline CTA shows "Open deal analyzer" link, not sign-up

**`app/app/tools/cap-rate/page.tsx`**

Public SEO page following exact `app/app/tools/fix-and-flip/page.tsx` pattern:
```typescript
export const metadata: Metadata = {
  title: "Cap Rate Calculator",
  description: "Free cap rate calculator: estimate NOI, gross rent multiplier, and annual return from purchase price and expenses. Save deals in Veld.",
  alternates: { canonical: `${APP_URL}/tools/cap-rate` },
  openGraph: {
    title: "Cap Rate Calculator | Veld Portfolio",
    description: "Calculate cap rate with transparent NOI breakdown.",
    url: "/tools/cap-rate",
  },
  // NO robots override
};
```

Must include:
- `<CalculatorFaqJsonLd items={CAP_RATE_CALCULATOR_FAQ} />` inside `<main>`
- `<CalculatorFaqSection items={CAP_RATE_CALCULATOR_FAQ} />`
- `hero-animate` on `<header>`, `reveal-up reveal-up-d1` on calculator wrapper, `reveal-up reveal-up-d2` on FAQ
- Guest-only footer CTA block (`reveal-up reveal-up-d3`): `FunnelCtaLink` primary + "See plans" secondary
- "Continue in app" link for signed-in users
- `LandingNav`, `Footer`, `Suspense + PlanIntentUrlSync`
- Footer cross-links to sibling calculators + 3 state pages (Texas, Florida, Georgia)
- `landingVariant="cap_rate_v1"`

**`app/app/(app)/calculators/cap-rate/page.tsx`**

In-app mirror:
```typescript
export const metadata: Metadata = {
  title: "Cap rate calculator",
  robots: { index: false, follow: true },
};
// Renders <CapRateCalculator surface="app" landingVariant="cap_rate_app" />
// No LandingNav, no Footer — inherits app shell
```

### Existing files to update

- `app/lib/marketing/calculator-faqs.ts` — add `CAP_RATE_CALCULATOR_FAQ` constant (3 FAQ items covering: how to calculate cap rate, what is a good cap rate, can I save results)
- `app/components/calculators/calculators-hub-cards.tsx` — replace the stub card added in Stage 1 with the real card (same href, just update the copy if needed)
- `app/lib/marketing/calculator-location-pages.ts` — add `"cap-rate"` to `CALCULATOR_LOCATION_SLUGS` and add entry to `CALCULATOR_LOCATION_DEFS`:
```typescript
"cap-rate": {
  slug: "cap-rate",
  h1Short: "cap rate calculator",
  metaTitleShort: "Cap Rate Calculator",
  metaHook: "Estimate NOI, GRM, and annual return — confirm with your accountant.",
  basePath: "/tools/cap-rate",
  faqs: CAP_RATE_CALCULATOR_FAQ,
},
```
- `app/components/marketing/calculator-location-page.tsx` — replace the `// TODO` stub with the real import and dispatch block, passing `initialPurchasePrice` and `initialMonthlyRent`
- `app/app/sitemap.ts` — add: `{ url: \`${APP_URL}/tools/cap-rate\`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 }`

### Acceptance criteria

- [ ] `computeCapRateResult` passes all tests (`npm test`)
- [ ] Cap rate calculator renders correctly on desktop (inputs left, results right)
- [ ] `MobileToolShell` renders on mobile with correct summary items
- [ ] All inputs have 44px+ touch targets
- [ ] Public `/tools/cap-rate` page has correct metadata (title, description, canonical, OG, no robots override)
- [ ] `CalculatorFaqJsonLd` present on public page
- [ ] In-app `/calculators/cap-rate` page has `robots: noindex`
- [ ] State pages at `/tools/cap-rate/texas` render with pre-filled purchase price from `medianHomePrice`
- [ ] `CALCULATOR_LOCATION_SLUGS` and `CALCULATOR_LOCATION_DEFS` both include `"cap-rate"`
- [ ] Sitemap entry added
- [ ] `npm run check` passes

---

## Stage 4 — Cash-on-Cash Return Calculator

**Recommended model:** Composer 2 Fast

**Read before starting:**
- Same skills as Stage 3
- `app/lib/cap-rate-calculator.ts` — just built; use as structural reference
- `app/components/marketing/cap-rate-calculator.tsx` — just built; use as structural reference
- `app/app/tools/cap-rate/page.tsx` — just built; use as page reference

### New files to create

**`app/lib/cash-on-cash-calculator.ts`**

```typescript
export type CashOnCashInput = {
  monthlyRent: number;
  vacancyPercent: number;
  monthlyOperatingExpenses: number;
  monthlyMortgagePayment: number;
  downPayment: number;
  closingCosts: number;
  rehabCapex: number;
  otherUpfrontCosts: number;
};

export type CashOnCashResult = {
  cocReturnPercent: number | null;  // null if totalCashInvested is 0
  monthlyCashFlow: number;
  annualCashFlow: number;
  totalCashInvested: number;        // sum of all upfront cash components
  grossYieldPercent: number | null;
  breakEvenMonths: number | null;   // null if monthly cash flow <= 0
  annualCashDollar: number;         // same as annualCashFlow, useful for display
};
```

Math:
- `effectiveMonthlyRent = monthlyRent * (1 - vacancyPercent / 100)`
- `monthlyCashFlow = effectiveMonthlyRent - monthlyOperatingExpenses - monthlyMortgagePayment`
- `annualCashFlow = monthlyCashFlow * 12`
- `totalCashInvested = downPayment + closingCosts + rehabCapex + otherUpfrontCosts`
- `cocReturnPercent = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : null`
- `grossYieldPercent = totalCashInvested > 0 ? (monthlyRent * 12 / totalCashInvested) * 100 : null`
- `breakEvenMonths = monthlyCashFlow > 0 ? totalCashInvested / monthlyCashFlow : null`

**`app/lib/cash-on-cash-calculator.test.ts`** — Minimum 6 test cases.

**`app/components/marketing/cash-on-cash-calculator.tsx`**

Props: `compact?`, `showCta?`, `landingVariant?`, `surface?`, `initialMonthlyRent?: number`, `initialCashInvested?: number` (pre-fills down payment field)

DEFAULTS: monthly rent ~$2,000, vacancy 5%, expenses ~$400/mo, mortgage ~$1,200/mo, down payment $60,000, closing costs $4,000, rehab $0, other $0

Key UX note: The cash components (down payment, closing costs, rehab, other) should be visually grouped under a "Cash invested" section header. Show a computed "Total cash invested: $X" running total as a `CalculatorMetric` in the results. This breakdown is the core value prop of this calculator.

Mobile summary items: CoC return %, monthly cash flow, total cash invested

`FunnelCtaLink placement="cash_on_cash_inline"`, `landingVariant="cash_on_cash_v1"`

**`app/app/tools/cash-on-cash/page.tsx`**
```typescript
metadata.title = "Cash-on-Cash Return Calculator"
metadata.description = "Free cash-on-cash return calculator: break out down payment, closing costs, and rehab to compute annual CoC return and break-even. Track deals in Veld."
metadata.alternates.canonical = `${APP_URL}/tools/cash-on-cash`
landingVariant = "cash_on_cash_v1"
```

**`app/app/(app)/calculators/cash-on-cash/page.tsx`** — noindex in-app mirror.

### Existing files to update

Same 6 files as Stage 3, with slug `"cash-on-cash"`:
- `calculator-faqs.ts` — add `CASH_ON_CASH_CALCULATOR_FAQ`
- `calculators-hub-cards.tsx` — real card (stub already present from Stage 1)
- `calculator-location-pages.ts` — add slug + def
- `calculator-location-page.tsx` — replace TODO stub with real dispatch, pass `initialMonthlyRent` and `initialCashInvested`
- `sitemap.ts` — add `/tools/cash-on-cash` at priority 0.8

### Acceptance criteria

Same checklist as Stage 3, adapted for cash-on-cash. Additionally:
- [ ] Cash component breakdown is visually grouped under a section header
- [ ] "Total cash invested" shows as a running total in results, broken out into components
- [ ] State pages at `/tools/cash-on-cash/texas` pre-fill cash invested from `medianHomePrice × 0.20`

---

## Stage 5 — Wholesale / MAO Calculator

**Recommended model:** Composer 2 Fast

**Read before starting:** Same skills as Stage 3. Reference Stage 3/4 calculators as pattern.

### New files to create

**`app/lib/wholesale-calculator.ts`**

```typescript
export type WholesaleInput = {
  arv: number;
  estimatedRepairs: number;
  assignmentFee: number;
  buyerClosingCosts: number;
  sellerClosingCosts: number;
  monthlyHoldingCosts: number;
  holdMonths: number;
  arvMultiplier: number;        // defaults to 0.70 (70% rule), editable
};

export type WholesaleResult = {
  mao: number;
  maoAsPercentArv: number | null;
  totalDealCosts: number;
  grossSpread: number;
  wholesalerNetProfit: number;
  endBuyerEquityCushion: number; // ARV - (MAO + repairs + buyer closing costs)
};
```

Math:
- `totalDealCosts = estimatedRepairs + assignmentFee + buyerClosingCosts + sellerClosingCosts + (monthlyHoldingCosts * holdMonths)`
- `mao = (arv * arvMultiplier) - estimatedRepairs - buyerClosingCosts - sellerClosingCosts - (monthlyHoldingCosts * holdMonths) - assignmentFee`
- `grossSpread = arv - totalDealCosts`
- `wholesalerNetProfit = assignmentFee`
- `endBuyerEquityCushion = arv - mao - estimatedRepairs - buyerClosingCosts`

**`app/lib/wholesale-calculator.test.ts`** — Minimum 6 tests including edge case where MAO is negative (valid — means deal doesn't work at those inputs).

**`app/components/marketing/wholesale-calculator.tsx`**

DEFAULTS: ARV $250,000, repairs $35,000, assignment fee $10,000, buyer closing $3,000, seller closing $5,000, holding $800/mo, hold 3 months, multiplier 70%

Key UX note: The `arvMultiplier` field should be presented as "ARV multiplier %" with a helper note "70% rule is the common wholesale baseline — adjust for your market." This is the one field that differentiates a serious wholesaler's calculator from a toy.

Mobile summary items: MAO, assignment fee, MAO as % of ARV

`FunnelCtaLink placement="wholesale_inline"`, `landingVariant="wholesale_v1"`

**`app/app/tools/wholesale/page.tsx`**
```typescript
metadata.title = "Wholesale Real Estate Calculator"
metadata.description = "Free wholesale real estate calculator: compute Maximum Allowable Offer (MAO), assignment fee, and equity cushion using the 70% rule. Adjust for your market."
metadata.alternates.canonical = `${APP_URL}/tools/wholesale`
landingVariant = "wholesale_v1"
```

**`app/app/(app)/calculators/wholesale/page.tsx`** — noindex in-app mirror.

### Existing files to update (same 6 as Stages 3–4, slug `"wholesale"`)

### Acceptance criteria

Same checklist as Stage 3. Additionally:
- [ ] ARV multiplier field is editable and defaults to 70
- [ ] Negative MAO renders correctly (no crashes — display as negative number with a helper note "Deal doesn't work at these numbers")
- [ ] State pages at `/tools/wholesale/texas` pre-fill ARV from `medianHomePrice`

---

## Stage 6 — DSCR Calculator

**Recommended model:** Composer 2 Fast

**Read before starting:** Same skills as Stage 3. The back-solve math (max loan for a given DSCR) is the only new complexity — solve for loan balance using the present value formula.

### New files to create

**`app/lib/dscr-calculator.ts`**

```typescript
export type DscrInput = {
  monthlyRent: number;
  vacancyPercent: number;
  monthlyOperatingExpenses: number;  // taxes + insurance + HOA + maintenance
  loanAmount: number;
  interestRatePercent: number;
  loanTermYears: number;
  interestOnly: boolean;             // many DSCR products offer IO periods
};

export type DscrResult = {
  dscr: number | null;               // null if annualDebtService is 0
  annualNoi: number;
  annualDebtService: number;
  passesAt1_0: boolean;
  passesAt1_25: boolean;
  maxLoanAt1_25: number | null;      // PV back-solve
  maxLoanAt1_0: number | null;
};
```

Math:
- `annualNoi = (monthlyRent * (1 - vacancyPercent/100) - monthlyOperatingExpenses) * 12`
- If `interestOnly`: `monthlyDebtService = loanAmount * (interestRatePercent/100/12)`
- If amortizing: `monthlyDebtService = PMT(rate/12, termMonths, loanAmount)` (standard amortization)
- `annualDebtService = monthlyDebtService * 12`
- `dscr = annualDebtService > 0 ? annualNoi / annualDebtService : null`
- Back-solve max loan: `maxMonthlyPayment = annualNoi / targetDscr / 12`; then PV of that payment at rate/term

**`app/lib/dscr-calculator.test.ts`** — Minimum 6 tests: normal case, IO vs amortizing comparison, failing DSCR, back-solve validation, zero rent, zero loan.

**`app/components/marketing/dscr-calculator.tsx`**

DEFAULTS: monthly rent $2,200, vacancy 5%, expenses $650/mo, loan $240,000, rate 7.5%, term 30 years, IO false

Key UX note: The pass/fail display at 1.0 and 1.25 should be visually distinct — use `getDscrTone` from `lib/calculator-metric-tones.ts`. The "Max qualifying loan at 1.25 DSCR" is the hero output alongside the DSCR ratio itself.

Mobile summary items: DSCR ratio, pass/fail at 1.25 (colored), max qualifying loan

`FunnelCtaLink placement="dscr_inline"`, `landingVariant="dscr_v1"`

**`app/app/tools/dscr/page.tsx`**
```typescript
metadata.title = "DSCR Calculator"
metadata.description = "Free DSCR calculator for rental property: compute debt service coverage ratio, check 1.0 and 1.25 thresholds, and find your max qualifying loan amount."
metadata.alternates.canonical = `${APP_URL}/tools/dscr`
landingVariant = "dscr_v1"
```

**`app/app/(app)/calculators/dscr/page.tsx`** — noindex in-app mirror.

### Existing files to update (same 6 as previous stages, slug `"dscr"`)

### Acceptance criteria

Same checklist as Stage 3. Additionally:
- [ ] IO toggle correctly switches between IO and amortizing debt service calculations
- [ ] Pass/fail indicators at 1.0 and 1.25 are visually distinct (colored tones)
- [ ] Max qualifying loan back-solve produces a reasonable result and matches manual verification
- [ ] State pages at `/tools/dscr/texas` pre-fill loan balance from `medianHomePrice × 0.80`

---

## Stage 7 — Rent vs Buy Calculator

**Recommended model:** Claude Sonnet 4.6

**Why Sonnet here:** This is the most complex stage. It requires a Recharts line chart (time-series UX), a year-by-year simulation loop, careful desktop layout for a two-column chart + table output, and the marketing copy is the most nuanced (audience is broader, not pure investors).

**Read before starting:**
- `RealEstateProject/.cursor/skills/veld-ui/SKILL.md`
- `RealEstateProject/.cursor/skills/veld-mobile/SKILL.md`
- `RealEstateProject/.cursor/skills/veld-landing-cta/SKILL.md`
- `app/app/(app)/properties/[id]/projections-tab-content.tsx` — reference for how Recharts `LineChart` is used in this codebase
- `app/app/(app)/refinance/refinance-workspace.tsx` — another Recharts reference
- `app/components/marketing/str-ltr-calculator.tsx` — reference for complex calculator component pattern

### New files to create

**`app/lib/rent-vs-buy-calculator.ts`**

```typescript
export type RentVsBuyInput = {
  monthlyRent: number;
  annualRentGrowthPercent: number;   // e.g. 3
  homePrice: number;
  downPaymentPercent: number;
  mortgageRatePercent: number;
  loanTermYears: number;
  annualAppreciationPercent: number; // home value growth
  investmentReturnPercent: number;   // opportunity cost: what the down payment earns if rented
  annualPropertyTaxPercent: number;  // as % of home value, e.g. 1.2
  monthlyInsuranceAndMaintenance: number;
  horizonYears: number;              // how many years to simulate, 1–30
};

export type RentVsBuyYearData = {
  year: number;
  cumulativeRentCost: number;
  cumulativeOwnCost: number;
  ownNetCost: number;               // owning cost minus equity gained
};

export type RentVsBuyResult = {
  breakEvenYear: number | null;     // first year owning costs less than renting, null if never
  yearData: RentVsBuyYearData[];    // one entry per year up to horizonYears
  costAt5Years: { rent: number; own: number; delta: number };
  costAt10Years: { rent: number; own: number; delta: number };
  costAt20Years: { rent: number; own: number; delta: number };
};
```

Math (year-by-year simulation):
- Rent path: cumulative rent = sum of `monthlyRent × (1 + rentGrowth)^(year-1) × 12` + foregone investment returns (down payment compounding at `investmentReturnPercent` per year — opportunity cost)
- Own path: cumulative costs = sum of annual mortgage + property taxes + insurance/maintenance; minus equity gained (principal paydown + appreciation); break-even is when `cumulativeOwnCost < cumulativeRentCost`

**`app/lib/rent-vs-buy-calculator.test.ts`** — Minimum 6 tests including: break-even found within horizon, break-even never found (very high home price), zero appreciation, high rent growth, and a reference case with known values.

**`app/components/marketing/rent-vs-buy-calculator.tsx`**

DEFAULTS: rent $2,000, rent growth 3%, home price $400,000, down 20%, rate 7%, term 30yr, appreciation 3%, investment return 7%, property tax 1.2%, insurance + maintenance $300/mo, horizon 20 years

**Key UX requirements:**
- Desktop: inputs on the left (col-span-5), chart + summary table on the right (col-span-7)
- Chart: Recharts `LineChart` with two `Line` series — "Renting" and "Owning (net of equity)". X-axis: Year. Y-axis: cumulative cost ($). Add a `ReferenceLine` at the break-even year with a label. Use existing chart color tokens from the codebase.
- Below chart: 3-row summary table (5yr / 10yr / 20yr) showing cost delta and which is cheaper at each horizon
- Mobile: NO chart. Instead, show the break-even year prominently as the hero metric, then the 5/10/20-year table in `MobileCollapsible`. Full input form in `MobilePageSection` groups.

Mobile summary items: break-even year, 10-year delta

`FunnelCtaLink placement="rent_vs_buy_inline"`, `landingVariant="rent_vs_buy_v1"`
CTA copy: "Ready to buy? Track your investment in Veld"

**`app/app/tools/rent-vs-buy/page.tsx`**
```typescript
metadata.title = "Rent vs Buy Calculator"
metadata.description = "Free rent vs buy calculator: find your break-even year and compare 5, 10, and 20-year total costs with a clear chart. See when buying makes financial sense."
metadata.alternates.canonical = `${APP_URL}/tools/rent-vs-buy`
landingVariant = "rent_vs_buy_v1"
```

**`app/app/(app)/calculators/rent-vs-buy/page.tsx`** — noindex in-app mirror. Chart should render on the in-app version too (surface="app").

### Existing files to update (same 6 as previous stages, slug `"rent-vs-buy"`)

Note: `rent-vs-buy` does not need `initialPurchasePrice` from `medianHomePrice` on state pages — it takes `homePrice` which maps to `location.medianHomePrice`. Pass `initialHomePrice={location.medianHomePrice}` in the location page dispatcher.

### Acceptance criteria

- [ ] Year-by-year simulation produces correct results (test cases pass)
- [ ] Recharts line chart renders on desktop with correct two-series data
- [ ] Break-even `ReferenceLine` appears at the correct year
- [ ] Mobile shows break-even year + summary table, NO chart
- [ ] All inputs have 44px+ touch targets on mobile
- [ ] Horizon slider or input allows 1–30 years
- [ ] Public page has correct metadata, canonical, OG, no robots override
- [ ] State pages at `/tools/rent-vs-buy/texas` pre-fill home price from `medianHomePrice`
- [ ] `npm run check` passes

---

## Stage 8 — Cross-links, SEO cleanup, and final audit

**Recommended model:** Composer 2 Fast

**What this does:** Updates footer cross-links on all existing tool pages to include new calculators; updates sitemap; final check that all SEO requirements are met.

### Tasks

**A. Update footer cross-links on existing tool pages**

Each existing public tool page has a `<p>` at the bottom listing sibling calculators. Update all of them to link to the new calculators where relevant:

| Page | Add links to |
|------|-------------|
| `app/app/tools/brrr/page.tsx` | wholesale, cash-on-cash, cap-rate |
| `app/app/tools/fix-and-flip/page.tsx` | wholesale, cash-on-cash |
| `app/app/tools/str-vs-ltr/page.tsx` | dscr, cap-rate |
| `app/app/investment-property-calculator/page.tsx` | cap-rate, cash-on-cash, dscr |
| `app/app/tools/page.tsx` | Verify metadata description mentions all 9 calculators |

**B. Confirm all 5 sitemap entries are present** in `app/app/sitemap.ts`:
```typescript
{ url: `${APP_URL}/tools/cap-rate`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
{ url: `${APP_URL}/tools/cash-on-cash`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
{ url: `${APP_URL}/tools/wholesale`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
{ url: `${APP_URL}/tools/dscr`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
{ url: `${APP_URL}/tools/rent-vs-buy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
```

**C. SEO audit checklist — verify for every new public page**

For each of the 5 new `/tools/[slug]/page.tsx` files, confirm:
- [ ] `metadata.title` set (no `robots: noindex` present)
- [ ] `metadata.description` includes "free", is ~150 chars, ends with Veld mention
- [ ] `metadata.alternates.canonical` is absolute URL via `getAppOrigin()`
- [ ] `metadata.openGraph.url` is relative path
- [ ] `CalculatorFaqJsonLd` is inside `<main>`
- [ ] `LandingNav`, `Suspense + PlanIntentUrlSync`, `Footer` all present
- [ ] Guest-only footer CTA block present (hides when signed in)
- [ ] `hero-animate`, `reveal-up reveal-up-d1`, animation classes correct

**D. Sync check — confirm `CALCULATOR_LOCATION_SLUGS` matches `Object.keys(CALCULATOR_LOCATION_DEFS)`**

These two must have identical members. Run a quick grep or scan to confirm.

**E. `robots.ts` — confirm no new disallow entries needed**

All `/tools/*` routes are covered by `allow: "/"` with no disallow entry for `/tools`. No changes needed — just confirm.

### Acceptance criteria

- [ ] All existing tool pages cross-link to at least 2 new calculators where relevant
- [ ] All 5 new tool page entries present in `sitemap.ts`
- [ ] SEO checklist passed for all 5 new pages
- [ ] `CALCULATOR_LOCATION_SLUGS` and `CALCULATOR_LOCATION_DEFS` keys are identical sets
- [ ] `npm run check` passes
- [ ] Full test suite passes (`npm test`)

---

## Summary

| Stage | Task | Model | Est. effort |
|-------|------|-------|------------|
| 1 | Hub page grid revamp | Composer 2 Fast | ~1 hr |
| 2 | LocationData extension (50 states) | Claude Sonnet 4.6 | ~2–3 hrs |
| 3 | Cap Rate Calculator | Composer 2 Fast | ~2 hrs |
| 4 | Cash-on-Cash Calculator | Composer 2 Fast | ~2 hrs |
| 5 | Wholesale / MAO Calculator | Composer 2 Fast | ~2–3 hrs |
| 6 | DSCR Calculator | Composer 2 Fast | ~2–3 hrs |
| 7 | Rent vs Buy Calculator | Claude Sonnet 4.6 | ~4–5 hrs |
| 8 | Cross-links + SEO audit | Composer 2 Fast | ~1 hr |
| **Total** | | | **~16–20 hrs** |

**After all stages complete:** 9 indexed tool pages + 450 state pages = 459 public calculator surfaces.
