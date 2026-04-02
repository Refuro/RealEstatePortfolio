# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.
**Ownership policy (ownership/metrics tasks):** Follow `docs/policies/ownership-metrics.md` as the canonical source for formulas and copy semantics.
**Analytics math policy (analytics/projection tasks):** Follow `docs/policies/analytics-math-policy.md` for debt-service basis, time-window labels, and UI/API/export reconciliation.

**Future features / roadmap:** See `docs/reference/roadmap.md`. PM promotes items from there to here when ready to build.

**Test quality gate (process):** How tests fit CI, PM review, and pre-push flow is in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md). **Completed** test-infra Phases 1–2, Husky, and audit batches **1–15** (checked-off detail) are in [`docs/tasks-archived.md`](tasks-archived.md) § **Tasks.md archive (2026-03-30)**. **Planned** automated-test expansion: **Testing hardening** below (aligned with [`qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md)).

---

## Completed

Historical completion logs and full checkbox snapshots are in [`docs/tasks-archived.md`](tasks-archived.md) — see **§ Tasks.md archive (2026-03-20)** and **§ Tasks.md archive (2026-03-30)**.

---

## Roadmap priority (value vs effort — last reviewed 2026-03-30)

| Order | Item | Effort | Value | Recommendation |
|-------|------|--------|-------|----------------|
| — | Mortgage balance advancement | ✓ Done | — | Balance advancement, escrow, amortization fix, loan type import, chart tooltip. |
| — | Admin membership override | ✓ Done | — | Tier override, admin UI, settings override display. |
| — | Benchmarking | ✓ Done | — | Rent vs market, surfacing on list/dashboard, inline refresh. |
| — | Error tracking (Sentry) | ✓ Done | — | Production error monitoring; set NEXT_PUBLIC_SENTRY_DSN in Vercel. |
| — | Dashboard single-property | ✓ Done | — | Property at a glance, metrics, Rent vs. Market auto-refresh. |
| **1** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **3** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **4** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **5** | Automated testing | High | High | Quality foundation; plan per Module M. |

**Defer:** Rent gap email (cost scales), Referral system (validate first).

---

## Active tasks

### Audit synthesis — Ship phase (2026-04-03 full audit)

*Source:* [`docs/audits/synthesis/2026-04-03-audit-synthesis.md`](audits/synthesis/2026-04-03-audit-synthesis.md) **Ship** triage. *Promoted 2026-04-03.*

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| 1 | **Security: Stripe webhook user resolution precedence** | `syncSubscriptionToDb` resolves app user by Stripe customer mapping first, validates metadata `appUserId` mismatch via warning telemetry, and prevents wrong-user subscription/tier update writes. Add test coverage for mismatch case in `app/app/api/billing/webhook/route.test.ts`. |
| 2 | **Growth: onboarding PATCH failure UX** | `OnboardingPanel` displays user-visible error when onboarding PATCH fails, does not silently swallow errors, and keeps retry path available. Busy state resets reliably on both success and failure. |
| 3 | **Math: payoff-years lag consistency** | `getPayoffYearsWithExtra` and `getPayoffYearsWithExtraWithTolerance` include payment-start lag in remaining-term cap to align with strict payoff projection helpers. Add regression test(s) in `app/lib/amortization.test.ts` for near-term-end lag case. |

- [x] **Ship 4-03 #1** — Stripe webhook user resolution precedence + mismatch warning
- [x] **Ship 4-03 #2** — Onboarding PATCH failure UX + retry-safe behavior
- [x] **Ship 4-03 #3** — Payoff-years lag consistency + regression tests

---

### Audit synthesis — Ship phase (2026-04-01 full audit)

*Source:* [`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md) **Ship** triage. *Completed by builder 2026-04-01.*

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| 1 | **Visible FAQ + JSON-LD** | Public calculator routes that emit `FAQPage` JSON-LD (`/investment-property-calculator`, `/tools/brrr`, `/tools/str-vs-ltr`, `/tools/fix-and-flip`) render a visible FAQ section whose **questions and answers match verbatim** the structured data (`lib/marketing/calculator-faqs.ts` single source of truth). |
| 2 | **Canonical URLs via `getAppOrigin()`** | Marketing/legal/landing `metadata.alternates.canonical` and root `metadataBase` use `getAppOrigin()` from `lib/app-url.ts` (trailing-slash stripped), consistent with `sitemap.ts`. |
| 3 | **DELETE rate limits** | `RATE_LIMITS` includes `properties:delete`, `deals:delete`, `properties:mortgage-delete` (60/hr); corresponding route handlers call `checkRateLimit` / `recordRateLimit` on success; [`docs/security/security-audit.md`](security/security-audit.md) §6 table updated. |
| 4 | **Account delete + Stripe** | If Stripe `subscriptions.cancel` throws, `Sentry.captureException`, response **503**, **no** soft-delete transaction; user sees retry/support message. |
| 5 | **PATCH properties `userId`** | `PATCH` update uses `where: { id, userId }` (verify in code; no regression). |
| 6 | **Multi-mortgage CSV disclosure** | `docs/reference/portfolio-csv-export.md` notes in-app warning; Settings import UI shows non-blocking notice about multi-lien lossy re-import. |
| 7 | **Doc link sweep** | `roadmap.md`, `tasks-archived.md`, `property-flow-regression-matrix.md`, `architecture-and-build-practices.md` point to `docs/archive/proposals/...` for archived epics/QA where applicable. |

- [x] **Ship 1** — Visible FAQ + shared FAQ data
- [x] **Ship 2** — `getAppOrigin()` canonical sweep
- [x] **Ship 3** — DELETE + mortgage DELETE rate limits + security doc
- [x] **Ship 4** — Account delete Stripe failure handling + Sentry
- [x] **Ship 5** — Verified PATCH `where` includes `userId`
- [x] **Ship 6** — Multi-mortgage doc + import notice
- [x] **Ship 7** — Documentation link sweep

---

### Audit synthesis — Ship run **-2** (tablet / `md`–`lg` calculator gap)

*Source:* [`docs/audits/synthesis/2026-04-01-audit-synthesis-2.md`](audits/synthesis/2026-04-01-audit-synthesis-2.md) **Ship** item 1 (expanded to all calculator surfaces). *Completed by builder 2026-04-01.*

**Problem:** Marketing calculators used `md:hidden` for `MobileToolShell` but `hidden lg:grid` for the desktop two-column layout, so **768px ≤ width &lt; 1024px** showed **no** inputs or results (public `/tools/*`, `/investment-property-calculator`, and signed-in `/calculators/*` — same components).

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| 1 | **Align breakpoints** | Desktop grid uses **`md:grid` / `md:grid-cols-12`** and column spans use **`md:col-span-*`** so the desktop layout appears at the same breakpoint where `md:hidden` hides the mobile shell (≥768px). |
| 2 | **Coverage** | Applies to all four marketing calculator components: `public-calculator.tsx`, `brrr-calculator.tsx`, `str-ltr-calculator.tsx`, `fix-and-flip-calculator.tsx` (covers both `/tools/...` and `/calculators/...` pages that embed them). |
| 3 | **Verification** | At **768px** and **900px** (or any width in 768–1023), each calculator shows full inputs + results; at **&lt;768px** mobile shell still works; at **≥1024px** desktop layout unchanged. |

- [x] **Ship -2 #1** — Tablet breakpoint fix (`md` desktop grid + spans)
- [x] **Ship -2 #2** — Mortgage `POST` / `PATCH` rate limits (`properties:mortgage-post`, `properties:mortgage-patch`, 60/hr; `security-audit.md` §6)

---

### Mobile shell verification (functionality, logic, math)

*Process:* PM promotes here → **builder** implements per `.cursor/rules/builder-agent.mdc`. **Canonical math:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`. **Playwright/E2E:** out of scope for this batch.

*Plan & checklist:* [`docs/qa/mobile-shell-verification.md`](qa/mobile-shell-verification.md). **Broader mobile audit criteria** (full app): [`docs/qa/mobile-experience-audit.md`](qa/mobile-experience-audit.md).

**Status:** Phase **A** (Vitest + `MobileToolShell` tests) is complete — detail in [`docs/tasks-archived.md`](tasks-archived.md) § Tasks.md archive (2026-03-30).

#### Phase 0 — Manual QA (PM or owner)

- [ ] **Run manual matrix** — At 320 / 375 / 430px and desktop ≥768px: verify all four `MobileToolShell` surfaces (Deal Analyzer, Modeling, Mortgage, Public calculator per landing/calc routes). Confirm functionality (shell chrome, inputs, collapsibles, charts), and spot-check logic/math against policies (see verification doc § Phase 0).
  - *Acceptance:* Checklist in `docs/qa/mobile-shell-verification.md` completed or issues filed; no blocking regressions.

#### Phase B — Optional integration smoke (builder, after A)

- [ ] **Optional: `matchMedia` + public calculator smoke** — Mock `(max-width: 767px)` and render `PublicCalculator` (or minimal wrapper) to assert mobile shell path renders — only if low flake.
  - *Acceptance:* Documented in `docs/qa/mobile-shell-verification.md`; skip with rationale if not worth maintenance.

---

### Calculator & tools — metric color / semantic treatment (UX)

*Escalated 2026-03-31.* *Source:* PM/design decision to make **coverage and risk-adjacent outputs** (e.g. DSCR, monthly cash flow) easier to scan on marketing and in-app calculator surfaces — without changing underlying math.

*Scope (when built):* All **user-facing calculator results** that show DSCR, cash flow, cash-on-cash, cap rate, and similar metrics — including **BRRRR** (`BrrrCalculator`), **public / rental-style** (`PublicCalculator`), and any **calculators hub** or mobile variants that reuse the same result blocks. *Out of scope for this task:* changing formulas; portfolio dashboard property cards (separate product decision unless PM aligns).

*Principles:*

- **Semantic, not decorative:** Color (and optional icon) signals *band* (e.g. DSCR vs 1.0x), not brand flair.
- **Not color-only:** Pair with **label, numeric precision, or short helper** so colorblind and screen-reader users get the same meaning (WCAG 1.4.1).
- **Cautious copy:** Helpers stay **educational** (“Stabilized coverage”) — avoid implying lender approval; align tone with `docs/policies/ownership-metrics.md` where metrics overlap.
- **Theme tokens:** Use existing CSS variables (`text-*`, `border-*`, subtle backgrounds) — no hard-coded hex in components; verify **light** and **dark** (and marketing vs app if themes diverge).

**Proposed default bands (tune in implementation with PM):**

| Metric | Suggested bands | Notes |
|--------|-----------------|--------|
| **DSCR** | ≥ **1.00** → positive/neutral; **0.90 up to 1.00** → caution; **under 0.90** or missing → muted/warning | Null/“—” → neutral, no “bad” tint. |
| **Monthly cash flow** | **Non-negative** → positive; **negative** → negative/caution | Already intuitive; avoid alarming green for tiny positive amounts if PM prefers subtlety. |
| **Cash-on-cash** | Only when numeric; optional bands for negative vs low vs high % | Often null on BRRRR when no equity left — keep **“—”** neutral (current behavior). |
| **Cap rate** | **Informational** by default — optional single muted accent, not red/green “good/bad” | Cap rate without context misleads; PM may choose **no** semantic color. |

- [x] **Spec + thresholds doc** — [`docs/policies/calculator-metric-tones.md`](policies/calculator-metric-tones.md) lists band edges, cap-rate exception, and CSS token note. Code: [`app/lib/calculator-metric-tones.ts`](../app/lib/calculator-metric-tones.ts).
  - *Acceptance:* PM-approved; builder can implement without guessing; thresholds are versioned in one place.

- [x] **`lib/calculator-metric-tones.ts` + `CalculatorMetric`** — `getDscrTone`, `getMonthlyCashFlowTone`, `getCashOnCashTone`, `getCapRateTone`; shared [`app/components/calculators/calculator-metric.tsx`](../app/components/calculators/calculator-metric.tsx). Tests: [`app/lib/calculator-metric-tones.test.ts`](../app/lib/calculator-metric-tones.test.ts).
  - *Acceptance:* No duplicated threshold magic numbers across `brrr-calculator.tsx` and `public-calculator.tsx`; unit tests for boundary values (e.g. 0.89 vs 0.90 vs 1.00 vs null).

- [x] **UI implementation** — `BrrrCalculator` + `PublicCalculator`: tinted metric values + optional **left border** on cards; mobile summary rails and mobile “Live result” cash flow use the same helpers.
  - *Acceptance:* Manual spot-check on **BRRRR** and **public** routes at desktop and mobile widths; null and “—” states never show “error” red; negative cash flow is visibly distinct from positive.

- [x] **Accessibility** — Helpers + numeric value remain; color uses existing theme tokens (`text-positive` / `text-warning` / `text-negative`). Policy doc states WCAG 1.4.1; no icon-only metrics added.
  - *Acceptance:* No reliance on color alone for meaning; spot-check with keyboard + one screen reader path optional per PM.

- [x] **Regression safety** — `npm run test` green (includes tone tests). ESLint clean on touched files; repo-wide `npm run lint` may still fail on unrelated files (e.g. export page).
  - *Acceptance:* `npm run test` green; Vitest covers tone selection per helper.

---

### New calculators — STR vs LTR and Fix-and-flip (Phases A → C)

*Escalated 2026-03-31.* *Strategy doc:* PM analysis recorded in chat. *Canonical patterns:* `proxy.ts` (public-route allowlist), `app/sitemap.ts` (sitemap entries), `app/app/tools/brrr/page.tsx` (public page pattern), `app/app/(app)/calculators/brrr/page.tsx` (in-app page pattern), `components/marketing/brrr-calculator.tsx` (calculator component pattern), `lib/brrr-calculator.ts` (pure-function lib pattern), `lib/calculator-metric-tones.ts` (tone helper pattern), `components/calculators/calculator-metric.tsx` (metric card pattern), `components/calculators/calculators-hub-cards.tsx` (hub card pattern).

*Principles (apply to every phase):*

- **Free math, gated portfolio intelligence.** Full calculator on every public `/tools/` route — no account gate on the math. Signed-in `/calculators/` shell is a soft upgrade (persistence, context). Paid upsell = portfolio impact, export, comparison.
- **Pure-function lib first.** All math lives in `lib/<name>.ts` with `Input` / `Result` types, `clamp`/`Math.max` input sanitization, and a colocated `*.test.ts` before any UI is written.
- **Reuse existing component stack.** `MobileToolShell` + `MobileSectionCard` + `MobileCollapsible` + `MobileSummaryRail` for mobile; desktop 12-col grid. `CalculatorMetric` for result tiles. `FunnelCtaLink` for CTAs. No new design primitives unless PM approves.
- **SEO identical to existing pages.** `Metadata` with `title`, `description`, `alternates.canonical`, `openGraph`; `FaqJsonLd` inline JSON-LD; breadcrumb nav; cross-links to sibling calculators; no `robots: index:false` on public pages (in-app pages get `robots: {index:false, follow:true}`).
- **Security identical to existing.** Add new public routes to `proxy.ts` `isPublicRoute` list; add to `sitemap.ts`. No new CSP changes needed (calculator components are client-side only, no external fetches). No API routes needed for these calculators.
- **Tests: lib first, then UI optional.** Every `lib/*.ts` file must have a colocated `*.test.ts` with happy-path, zero/boundary, and sanitization cases before the PR ships. Coverage gate in `vitest.config.ts` must stay green. Mobile component tests are optional (follow existing guidance in testing-hardening-proposal).

---

#### Phase A — STR vs LTR calculator

**Purpose:** Help an investor compare running a property as a short-term rental (STR) vs long-term rental (LTR) — NOI, monthly cash flow, and effective yield side by side. Serves existing investor persona making a real operating decision. Highest SEO + conversion fit of the remaining shortlist.

**Public routes:** `/tools/str-vs-ltr` · **In-app route:** `/calculators/str-vs-ltr`

**Math model:**

- *STR inputs:* projected nightly rate, annual occupancy %, platform fee % (e.g. Airbnb/VRBO), monthly STR-specific expenses (cleaning, supplies, extra maintenance), shared inputs (purchase price or skip for operating-only mode, mortgage payment, ownership %, vacancy already baked into occupancy).
- *LTR inputs:* monthly rent, vacancy %, monthly expenses, mortgage payment (shared with STR side for apples-to-apples).
- *Outputs per side:* effective monthly income, annual gross, NOI, monthly cash flow, cap rate (if purchase price provided), DSCR (if mortgage payment provided).
- *Comparison row:* STR vs LTR delta for NOI and monthly cash flow; tone from `getMonthlyCashFlowTone` / `getDscrTone`.
- All inputs sanitized: `Math.max(0, …)` for money/rates, `clamp(0, 100)` for percentages, `clamp(0, 365)` for nights.

- [x] **`lib/str-ltr-calculator.ts`** — Pure functions: `StrLtrCalculatorInput`, `StrLtrCalculatorResult`, `computeStrLtrResult(input)`. No UI imports. *Also:* `monthlyLtrExpenses` (LTR-only opex) + `downPaymentPercent` for loan balance.
  - *Acceptance:*
    - `StrLtrCalculatorInput` has `nightlyRate`, `annualOccupancyPercent`, `platformFeePercent`, `monthlyStrExpenses`, `monthlyLtrRent`, `monthlyLtrVacancyPercent`, `monthlySharedExpenses`, `monthlyMortgagePayment`, `purchasePrice` (optional, for cap rate), `ownershipPercent` (default 100).
    - `StrLtrCalculatorResult` has `str` and `ltr` sub-objects each containing: `effectiveMonthlyIncome`, `annualGrossIncome`, `noi`, `monthlyCashFlow`, `capRate: number | null`, `dscr: number | null`; plus `delta: { noi, monthlyCashFlow }`.
    - All inputs clamped/floored; negative money inputs → 0; percent inputs clamped 0–100.
    - `npm run test` green.

- [x] **`lib/str-ltr-calculator.test.ts`** — Colocated Vitest tests.
  - *Acceptance:*
    - **Happy path:** STR clearly beats LTR → delta positive, both DSCRs defined.
    - **LTR wins:** expenses/fees flip the advantage → delta negative.
    - **No mortgage:** DSCR null on both sides (not NaN, not 0).
    - **Zero occupancy:** STR income = 0; cap rate null if no `purchasePrice`.
    - **Sanitization:** negative nightly rate / occupancy >100 clamped; all outputs finite, no `NaN`.
    - Coverage gate stays green.

- [x] **`components/marketing/str-ltr-calculator.tsx`** — Client component following `brrr-calculator.tsx` structure exactly.
  - *Acceptance:*
    - Props: `compact?`, `showCta?`, `landingVariant?`, `surface?: "marketing" | "app"`.
    - Default values produce **positive cash flow on at least one side** (STR) and DSCR ≥ 1.0 on both; spot-check with `computeStrLtrResult` before committing defaults.
    - **Desktop (≥768px):** 12-col grid; inputs left (8 col), results right (4 col). Two `CalculatorMetric` groups side by side (STR / LTR) + a delta row. Uses `CalculatorMetric` for all metric tiles; tone from `getDscrTone` / `getMonthlyCashFlowTone` / `getCapRateTone`.
    - **Mobile:** `MobileToolShell` with `summaryItems` (cash flow STR, cash flow LTR, DSCR STR, DSCR LTR). `MobileSectionCard` + `MobileCollapsible` for STR inputs, LTR inputs, and shared financing assumptions (mirror `brrr-calculator.tsx` mobile pattern exactly).
    - `FunnelCtaLink` CTA (signed-out: sign-up; signed-in marketing: open analyze; app shell: deal analyzer + dashboard links).
    - No hard-coded colors; all tones via `calculator-metric-tones.ts`.
    - `npm run lint` clean on this file.

- [x] **`app/app/tools/str-vs-ltr/page.tsx`** — Public marketing page.
  - *Acceptance:*
    - `Metadata`: `title: "STR vs LTR Calculator"`, `description` (≤160 chars, includes "short-term vs long-term rental"), `alternates.canonical: \`${APP_URL}/tools/str-vs-ltr\``, `openGraph`.
    - `FaqJsonLd` with ≥2 Q&As (e.g. "How do STR platform fees affect returns?", "What occupancy makes STR worth it?").
    - Breadcrumb nav: Calculators → STR vs LTR (same markup as `tools/brrr/page.tsx`).
    - `auth()` for `userId`; `LandingNav`, `Footer`, `PlanIntentUrlSync` in `Suspense`.
    - Cross-links footer: All calculators / BRRRR calculator / Investment property calculator.
    - `<StrLtrCalculator showCta landingVariant="str_ltr_v1" />`.
    - `robots` not set (indexable by default).

- [x] **`app/app/(app)/calculators/str-vs-ltr/page.tsx`** — In-app shell page.
  - *Acceptance:*
    - `metadata.robots: { index: false, follow: true }`.
    - Breadcrumb nav: Calculators → STR vs LTR.
    - `<StrLtrCalculator surface="app" landingVariant="str_ltr_app" />`.
    - No `LandingNav`/`Footer` (in app shell).

- [x] **Security & routing** — `proxy.ts`: `"/tools(.*)"` already allows `/tools/str-vs-ltr` (no change; verified). `sitemap.ts`: `/tools/str-vs-ltr` at `priority: 0.8`. CSP unchanged; calculator is client-only.
  - *Acceptance:* Public route reachable without auth; `npm run build` clean.

- [x] **Hub cards** — `CalculatorsHubCards`: order **Investment property → BRRRR → STR vs LTR**; public/app `href`s wired.
  - *Acceptance:* Third card + description as specified.

- [x] **Roadmap update** — `docs/reference/roadmap.md` §1a **Shipped (v2)** + shortlist table note for STR vs LTR.

---

#### Phase B — Fix-and-flip calculator

**Purpose:** Purchase + rehab + hold period + sale → net profit, ROI, and annualized return. Extends the existing "deal math" cluster (BRRRR already ships); cross-links naturally. Targets the active-investor persona who may later hold/BRRRR.

**Public routes:** `/tools/fix-and-flip` · **In-app route:** `/calculators/fix-and-flip`

**Math model:**

- *Inputs:* purchase price, rehab cost, hold months, financing: purchase loan % (IO during hold), down payment %, ARV (after repair value), selling costs % of ARV (agent, closing), carrying costs/month (taxes, insurance, utilities — beyond interest).
- *Outputs:* total cash in (down + rehab + holding interest + carrying costs), gross sale proceeds (ARV − selling costs), net profit (sale − loan payoff − total cash in), total ROI %, annualized ROI % (annualize from hold months), cash-on-cash return (net profit / cash invested out-of-pocket).
- All inputs sanitized: same `clamp`/`Math.max` pattern as existing calcs.

- [x] **`lib/fix-and-flip-calculator.ts`** — Pure functions: `FixAndFlipInput`, `FixAndFlipResult`, `computeFixAndFlipResult(input)`.
  - *Acceptance:*
    - `FixAndFlipInput` has: `purchasePrice`, `rehabCost`, `holdMonths`, `downPaymentPercent`, `purchaseLoanRatePercent` (IO), `arv`, `sellingCostsPercent`, `monthlyCarryingCosts`.
    - `FixAndFlipResult` has: `downPaymentAmount`, `loanAmount`, `monthlyInterest`, `totalHoldingInterest`, `totalCarryingCosts`, `totalCashIn`, `grossSaleProceeds`, `sellingCosts`, `loanPayoff`, `netProfit`, `roiPercent`, `annualizedRoiPercent: number | null` (null if holdMonths = 0), `cashOnCashReturnPercent`.
    - All sanitized; no NaN; `holdMonths` clamped 0–120.
    - `npm run test` green.

- [x] **`lib/fix-and-flip-calculator.test.ts`**
  - *Acceptance:*
    - **Happy path:** positive deal with ~6 month hold; `netProfit > 0`, `roiPercent > 0`.
    - **Break-even:** ARV just covers all costs → `netProfit ≈ 0`.
    - **Underwater deal:** high rehab/sell costs → `netProfit < 0` (handled without NaN).
    - **Zero hold months:** `totalHoldingInterest = 0`; `annualizedRoiPercent = null`.
    - **Zero down payment:** loan = purchase price; holding interest reflects full loan.
    - **Sanitization:** negative inputs floored to 0; `sellingCostsPercent > 100` clamped.
    - Coverage gate stays green.

- [x] **`components/marketing/fix-and-flip-calculator.tsx`** — Client component following `brrr-calculator.tsx` structure.
  - *Acceptance:*
    - Props: `compact?`, `showCta?`, `landingVariant?`, `surface?: "marketing" | "app"`.
    - Default values produce **positive net profit**; verify with `computeFixAndFlipResult` before committing.
    - **Desktop:** 12-col grid; inputs left, results right. Key metric tiles: Net profit, Total ROI %, Annualized ROI %, Cash-on-cash. Footer line: "Cash in {amount} · Hold {n} months · Selling costs {amount}".
    - **Mobile:** `MobileToolShell`; summary rail shows Net profit (tone: positive/negative), ROI % (default tone), Annualized ROI (default tone), hold months (informational). `MobileCollapsible` for financing assumptions.
    - Profit/loss tone: `netProfit >= 0` → positive, `< 0` → negative (reuse `getMonthlyCashFlowTone` logic or extend `calculator-metric-tones.ts` with `getProfitTone` helper if needed — PM to decide; keep consistent with existing tones policy).
    - `FunnelCtaLink` CTA (same pattern as BRRRR: sign-up or deal analyzer).
    - `npm run lint` clean.

- [x] **`app/app/tools/fix-and-flip/page.tsx`** — Public page.
  - *Acceptance:*
    - `Metadata`: `title: "Fix and Flip Calculator"`, `description` ≤160 chars (includes "net profit", "ROI", "fix and flip"), canonical `/tools/fix-and-flip`, `openGraph`.
    - `FaqJsonLd` ≥2 Q&As (e.g. "How do you calculate fix and flip profit?", "What is a good ROI for house flipping?").
    - Breadcrumb, cross-links (All calculators / BRRRR / Investment property calculator).
    - `auth()`, `LandingNav`, `Footer`, `PlanIntentUrlSync`.
    - `<FixAndFlipCalculator showCta landingVariant="fix_flip_v1" />`.

- [x] **`app/app/(app)/calculators/fix-and-flip/page.tsx`** — In-app page.
  - *Acceptance:* `robots: { index:false, follow:true }`, breadcrumb, `surface="app"`.

- [x] **Security & routing** — `proxy.ts` + `sitemap.ts`.
  - *Acceptance:*
    - Public `/tools/*` calculators (including fix-and-flip) covered by existing **`/tools(.*)`** in `isPublicRoute` (comment in `proxy.ts`).
    - `/tools/fix-and-flip` in `sitemap.ts` at `priority: 0.8`.
    - `npm run build` clean.

- [x] **Hub cards** — Add Fix-and-flip entry to `CalculatorsHubCards`.
  - *Acceptance:* Fourth `<li>` with correct `href` for both variants. Description: "Estimate net profit, ROI, and annualized return on a flip — purchase, rehab, hold, and sale."

- [x] **`calculator-metric-tones.ts` extension (if needed)** — Add `getProfitTone(netProfit: number): CalculatorMetricTone` if `getMonthlyCashFlowTone` isn't semantically right for a one-time profit number.
  - *Acceptance:* Not needed — `getMonthlyCashFlowTone` used for net profit / ROI tiles (same positive/negative semantics).

- [x] **Roadmap update** — Mark Fix-and-flip as shipped in `docs/reference/roadmap.md`.

---

#### Phase C — Infrastructure: cross-calculator shared defaults + `vitest.config.ts` coverage expansion

*Run concurrently with Phase B, or immediately after Phase A; does not block Phase A or B shipping independently.*

- [x] **Coverage gate expansion** — Add new lib files to `coverage.include` in `vitest.config.ts`.
  - *Acceptance:*
    - `"lib/str-ltr-calculator.ts"` (already present) and `"lib/fix-and-flip-calculator.ts"` added to `coverage.include`.
    - `npm run test:coverage` still passes existing thresholds (statements ≥ 80%, lines ≥ 80%, branches ≥ 58%, functions ≥ 78%).

- [x] **`calculators-hub-cards.tsx` ordering** — PM approves order (suggested: Investment property → BRRRR → STR vs LTR → Fix-and-flip).
  - *Acceptance:* Hub displays all four cards in agreed order; no broken links; both `"public"` and `"app"` variants correct.

- [x] **Cross-link audit** — Every existing public calculator page links to the new ones in its footer.
  - *Acceptance:* `/tools/brrr` footer and `/investment-property-calculator` footer each gain links to `/tools/str-vs-ltr` and `/tools/fix-and-flip` (in addition to existing links); no broken `href`s.

- [x] **Sitemap priority review** — Confirm `/tools/str-vs-ltr` and `/tools/fix-and-flip` at `priority: 0.8`; confirm `/tools` hub bumps to `priority: 0.85` now that hub has four entries.
  - *Acceptance:* `sitemap.ts` updated; `npm run build` clean.

---

### Full audit remediation — 2026-03-31 synthesis

*Promoted from:* [`docs/audits/synthesis/2026-03-31-audit-synthesis.md`](audits/synthesis/2026-03-31-audit-synthesis.md) and per-lane reports `docs/audits/*/2026-03-31-*-audit.md`.

**Tracking tags**

| Tag | Meaning |
|-----|--------|
| **`[Synth]`** | Item appears in the synthesis consolidated task list — check off here to see what is still open vs addressed. |
| **`[Synth+]`** | Strongly implied by a lane report; not a separate line in synthesis (avoid duplicate PM tickets). |

**Out of scope for this plan (do not start here):** Refactors of very large TSX modules (wizard, deal analyzer, projections tab, etc.); dashboard data-path refactor to merge duplicate server work with `buildPortfolioSummaryPayload`; broad onboarding modal redesign. Those remain deferred until PM opens a dedicated batch.

**Process:** Builder implements by phase unless PM parallelizes; each phase exit = acceptance bullets met + `npm run test` green + `npm run lint` green on touched files.

---

#### Phase 1 — Data trust & billing truth (P0) — **✓ complete (2026-03-31)**

- [x] **`[Synth]` CSV import column aliases** — Accept export header strings: `escrow amount (first lien)`, `mortgage balance (stored sum)` (and any other export-only keys the import parser still drops).
  - *Acceptance:* Importing a row whose keys match a fresh CSV export restores first-lien escrow and stored mortgage balance fields correctly; existing aliases unchanged.
- [x] **`[Synth]` CSV round-trip regression test** — Vitest: object shaped like export headers parses to expected escrow + mortgage fields.
  - *Acceptance:* Colocated or `lib/import` test; `npm run test` green.
- [x] **`[Synth]` Doc: portfolio CSV matrix** — Update [`docs/reference/portfolio-csv-export.md`](reference/portfolio-csv-export.md) with which columns round-trip vs import-only vs export-only.
  - *Acceptance:* Table or list matches code after alias change; PM can verify without reading parsers.

- [x] **`[Synth]` Privacy: Resend + Sentry** — Extend `app/app/privacy/page.tsx` third-party / data-processors narrative: **Resend** (transactional email), **Sentry** (errors, optional client SDK, CSP-related telemetry as implemented).
  - *Acceptance:* Wording matches actual code paths; no new service claims without code reference.

- [x] **`[Synth]` Billing sync failures visible** — `app/app/(app)/app-layout-client.tsx`: on `/api/billing/sync` non-OK or `catch`, log structured context and `Sentry.captureException` (or shared helper); do not empty-catch.
  - *Acceptance:* Forced failure in dev/staging produces a Sentry event (or documented log sink); successful sync unchanged.

---

#### Phase 2 — Observability & defense-in-depth (P1) — **✓ complete (2026-03-31)** (optional `error.tsx` item not done)

- [x] **`[Synth]` RentCast upstream errors → Sentry** — `app/app/api/estimates/rent/route.ts`, `.../estimates/value/route.ts`, `.../properties/[id]/benchmark/refresh/route.ts`: on upstream failure, capture to Sentry (sample if noisy).
  - *Acceptance:* Controlled failure path emits event; happy path unchanged; no PII in payload.

- [x] **`[Synth]` Benchmark refresh `update` where** — Include `userId` (or equivalent ownership) in Prisma `update` `where` for benchmark refresh path.
  - *Acceptance:* Code review + existing tests green; behavior unchanged for valid user.

- [x] **`[Synth]` Property PATCH `update` where** — `app/app/api/properties/[id]/route.ts`: `update` includes `userId` in `where` clause (defense-in-depth).
  - *Acceptance:* PATCH tests still pass; 404/403 semantics unchanged for wrong owner.

- [x] **`[Synth]` Billing portal route errors** — `app/app/api/billing/portal/route.ts`: unexpected errors call Sentry (not only `console`).
  - *Acceptance:* Align with other billing routes; no secret leakage in event.

- [ ] **`[Synth+]` `error.tsx` Sentry + React 19** — *Skipped in this batch per PM; optional follow-up.*
  - *Acceptance:* PM approves scope; no duplicate flood of events in dev; document choice in PR.

---

#### Phase 3 — SEO quick wins (P1) — **✓ complete (2026-03-31)**

- [x] **`[Synth]` Title template duplication** — Eliminate doubled “Veld Portfolio” in rendered `<title>` on `/`, `/changelog`, `/contact`, and any route using full title string plus root `template`.
  - *Acceptance:* Spot-check View Source or devtools for listed URLs; titles read naturally; brand once.

- [x] **`[Synth]` `robots.ts` vs app shell** — Align `disallow` list with non-public authenticated prefixes; no accidental block of marketing URLs.
  - *Acceptance:* Fetch `/robots.txt` in staging/production checklist; compare to `proxy.ts` public allowlist.

- [x] **`[Synth]` FAQ JSON-LD on `/tools/brrr`** — Match pattern used on other calculator public pages (≥2 Q&As, honest copy).
  - *Acceptance:* Rich Results Test passes FAQ where applicable; build clean.

- [x] **`[Synth]` Terms meta description** — Expand `metadata.description` on terms page for clearer snippets.
  - *Acceptance:* ≤~160 chars target; accurate; no legal overclaim.

---

#### Phase 4 — UX & mobile (P2) — **✓ complete (2026-03-31)**

- [x] **`[Synth]` Portfolio export on mobile** — Surface “Print / export portfolio summary” (or equivalent) from mobile dashboard path comparable to desktop workspace strip.
  - *Acceptance:* 375px width: user can reach export without desktop-only control; link target matches existing route.

- [x] **`[Synth]` Analyze ↔ Deals** — Above-the-fold link or short copy on Analyze pointing to `/deals` (saved deals).
  - *Acceptance:* New user sees path to saved deals without scrolling past primary form.

- [x] **`[Synth]` Property detail page title** — Heading/title pattern aligned with `docs/policies/design-spec.md` page title guidance.
  - *Acceptance:* One clear H1; consistent with list → detail IA.

- [x] **`[Synth]` Calculators hub padding** — Remove double padding between `(app)/calculators/page.tsx` and `app-layout-client` `main` if present.
  - *Acceptance:* Visual parity with sibling app pages; no layout regression on mobile.

- [x] **`[Synth]` Deal Analyzer mobile sticky bar safe-area** — Bottom inset for home-indicator devices on sticky results bar.
  - *Acceptance:* Verified on notched device or simulator; no overlap with system UI.

- [x] **`[Synth+]` `MobileCollapsible` tap target** — Minimum ~44px hit height where feasible without breaking layout.
  - *Acceptance:* Spot-check tools + app calculator collapsibles.

- [x] **`[Synth+]` `LandingNav` mobile drawer a11y** — Escape to close, focus trap or return focus, `dialog` semantics aligned with app drawer pattern.
  - *Acceptance:* Keyboard smoke: Tab, Escape; spot-check screen reader label.

- [x] **`[Synth+]` Root `viewport` / `viewportFit`** — No `viewportFit: 'cover'` change: home-indicator spacing handled via `env(safe-area-inset-bottom)` on Deal Analyzer sticky bar and `MobileToolShell` footer; root layout already uses safe-area-aware app shell classes.
  - *Acceptance:* Document decision; no regression on Android/desktop.

---

#### Phase 5 — Growth copy & funnel (P2) — **✓ complete (2026-03-31)**

- [x] **`[Synth]` Home pricing strip** — Mention **saved deals** limits per tier where property limits are shown.
  - *Acceptance:* Copy matches `lib/plans.ts` limits; legal/marketing review if needed.

- [x] **`[Synth]` Post-auth paid intent** — Continuation after `investor`/`pro` signup (banner, redirect, or documented `afterSignUpUrl` strategy).
  - *Acceptance:* PM-defined happy path documented; implementation matches intent.

- [x] **`[Synth]` Empty state / welcome** — Recommended first path + secondary actions collapsed or de-emphasized per growth audit.
  - *Acceptance:* PM sign-off on copy hierarchy.

- [x] **`[Synth]` `/plans` intro** — Copy mentions **properties and deals** where relevant.
  - *Acceptance:* Consistent with plan limits.

- [x] **`[Synth]` Sign-in Terms + Privacy** — Footer or links match sign-up parity (same legal links).
  - *Acceptance:* Both auth pages link to `/privacy` and `/terms`.

- [x] **`[Synth]` Billing success CTA** — Balance “dashboard first” vs return to paywall context per growth audit.
  - *Acceptance:* PM picks primary CTA; single primary button.

- [x] **`[Synth+]` `clearPlanIntent` after subscribe** — If analytics should reset funnel intent after successful checkout, wire clear.
  - *Acceptance:* PostHog/person props still correct for tier after test checkout.

---

#### Phase 6 — Legal, security docs, support (P2 / counsel) — **✓ complete (2026-03-31)**

- [x] **`[Synth]` Terms operating entity** — Resolve `TODO(legal)` with counsel; update `app/app/terms/page.tsx`.
  - *Acceptance:* Counsel-approved entity string; TODO removed.

- [x] **`[Synth]` `SUPPORT_EMAIL` behavior** — Production env always set **or** Privacy/Terms/contact copy explains `/contact` when footer email hidden.
  - *Acceptance:* Staging without env does not imply a broken mailto; production verified.

- [x] **`[Synth]` Refresh `docs/security/security-audit.md`** — CSP and rate-limit sections match `app/next.config.ts` and `app/lib/rate-limit.ts`.
  - *Acceptance:* Engineer can triage incident from doc without wrong directives.

- [x] **`[Synth]` `docs/security/security-notes.md` RentCast** — Align hourly/tiered quota wording with [`docs/reference/rentcast-quota.md`](reference/rentcast-quota.md) / `lib/plans.ts`.
  - *Acceptance:* Single source of truth referenced.

---

#### Phase 7 — Math edge case (P1–P2) — **✓ complete (2026-03-31)**

- [x] **`[Synth]` Negative amortization guard** — When P&amp;I &lt; accrued interest, product decision: reject input, clamp, or disclose in UI/schedule — implement in `lib/amortization` + validation + tests per math audit.
  - *Acceptance:* No silent nonsensical schedules; unit tests cover edge case; mortgage/deal flows still pass existing tests.

---

#### Phase 8 — Business / analytics hygiene (non-code or light config) — **✓ complete (2026-03-31)**

- [x] **`[Synth]` Commercial matrix (internal)** — Single living doc or sheet: tier ↔ Stripe price IDs ↔ `NEXT_PUBLIC_PRICE_*` ↔ marketing owner.
  - *Acceptance:* PM can answer “what price is live?” in one place.
  - *Done:* [`docs/internal/billing-matrix.md`](internal/billing-matrix.md) — matrix + **Marketing & pricing ownership** table + release checklist.

- [x] **`[Synth]` Investor one-pager** — ICP, differentiation, shipped proof, explicit gaps (honest).
  - *Acceptance:* Linked from `docs/launch/` or internal; not necessarily customer-facing.
  - *Done:* [`docs/launch/investor-style-one-pager.md`](launch/investor-style-one-pager.md) — revised 2026-03-31 (analytics + commercial docs, honest gaps).

- [x] **`[Synth]` PostHog named funnel** — Funnel definition: signup → first property → plan view → checkout attempt → subscribed.
  - *Acceptance:* Exists in PostHog UI or documented steps to recreate.
  - *Done:* [`docs/launch/posthog-growth-funnel.md`](launch/posthog-growth-funnel.md) — step mapping to `app/lib/analytics-events.ts` + PostHog UI instructions + saved insight name **`Growth funnel — signup to subscribed`** (create in PostHog per doc).

---

#### Phase 9 — Production gate from 2026-04-01 synthesis (P0/P1) — **✓ complete (2026-04-01)**

- [x] **`[Synth 4-01]` Critical: CSV import mortgage validation parity** — `POST /api/import/portfolio` must enforce the same mortgage constraints as create/update mortgage routes (`validateEscrowAmount`, `validateMortgagePiCoversInterestFields` / schema-equivalent), with row-level errors for invalid rows.
  - *Acceptance:* Import rejects escrow >= payment and P&I < monthly interest rows with clear row-level messages; valid rows still import; regression tests cover both failure modes and one passing case; **mark this item complete in [`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md)** when shipped.
  - *Done:* [`app/lib/import/validate-import-mortgage.ts`](../app/lib/import/validate-import-mortgage.ts) + [`app/lib/import/validate-import-mortgage.test.ts`](../app/lib/import/validate-import-mortgage.test.ts); import route merges mortgage errors and filters rows; [`app/app/api/import/portfolio/route.test.ts`](../app/app/api/import/portfolio/route.test.ts) covers escrow failure, P&I failure, and partial import.

- [x] **`[Synth 4-01]` Critical: Client-side Sentry initialization** — Add browser Sentry config (`app/sentry.client.config.ts`) and align app error-boundary capture behavior so frontend exceptions are observable in production.
  - *Acceptance:* Browser-thrown test error appears in Sentry (non-localhost env), app error boundary capture path is consistent and DSN-safe, no client build/runtime regressions, and **mark this item complete in [`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md)** when shipped.
  - *Done:* [`app/sentry.client.config.ts`](../app/sentry.client.config.ts); [`app/(app)/error.tsx`](../app/app/(app)/error.tsx) calls `captureException` only when `NEXT_PUBLIC_SENTRY_DSN` is set.

- [x] **`[Synth 4-01]` Production billing reliability hardening** — (a) add `Sentry.captureException` in `POST /api/billing/create-checkout-session` catch path, and (b) fail-fast on missing `NEXT_PUBLIC_APP_URL` for production/Vercel deployments.
  - *Acceptance:* Forced checkout failure is captured in Sentry with safe context; deploy/runtime guard prevents localhost fallback URLs in production; checkout success/cancel redirects still work; tests/checks pass; **mark this item complete in [`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md)** when shipped.
  - *Done:* [`app/lib/env.ts`](../app/lib/env.ts) `assertPublicAppUrlForVercelDeploy` + `getPublicAppBaseUrlForBilling`; [`app/instrumentation.ts`](../app/instrumentation.ts); checkout/portal routes use billing base URL; [`create-checkout-session/route.test.ts`](../app/app/api/billing/create-checkout-session/route.test.ts) Sentry mock + Stripe failure case.

- [x] **`[Synth 4-01]` SEO hardening: explicit noindex for authenticated app shell** — Add explicit `robots: { index: false, follow: false }` metadata strategy for authenticated app surfaces (`app/(app)` layout and/or per-route coverage) instead of relying only on disallow + auth redirects.
  - *Acceptance:* Authenticated routes (e.g. `/dashboard`, `/properties`, `/analyze`, `/plans`) emit non-indexable metadata signals in production, public marketing/tool routes remain indexable/canonicalized as intended, and **mark this item complete in [`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md)** when shipped.
  - *Done:* [`app/(app)/layout.tsx`](../app/app/(app)/layout.tsx) `metadata.robots`.

- [x] **`[Synth 4-01]` Plan changes via Billing Portal (no stacked subscriptions)** — Free → paid stays on Stripe Checkout; paid users switching tier use `POST /api/billing/portal` with allowlisted `returnPath` (`/plans`, `/pricing`, `/settings`). `POST /api/billing/create-checkout-session` returns **409** if an active/trialing/past_due/unpaid subscription already exists. *Plan:* [`docs/internal/billing-plan-change-portal-implementation-plan.md`](internal/billing-plan-change-portal-implementation-plan.md).
  - *Acceptance:* Paid user “Switch to …” opens portal, not a second Checkout session; free user still gets Checkout; `npm run test` green; PostHog `billing_portal_opened` from pricing cards when changing plans.

---

#### Phases 10–21 — 2026-04-01 synthesis backlog ([`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md))

*Source of truth for open synthesis items is the audit synthesis doc; each phase below lists each item **once** (no duplicate bullets across phases). When a phase ships, check it off here and mirror in the synthesis consolidated list.*

**Suggested order:** 10 → 11 → 12 (safety & data) → 13 (ops/perf) → 14–16 (product surfaces) → 17–20 (docs/legal/governance) → 21 (manual verification gate). Phases 14 (UX) and 15 (growth) may parallelize after 13 if resourced.

---

##### Phase 10 — Security & threat-model hygiene (`[Synth 4-01]`) — **✓ complete (2026-04-01)**

*Boundary:* Transport/abuse/docs only — no CSV/export or mortgage math (those are Phases 11–12).

- [x] Targeted rate limits for high-risk mutating routes: `PATCH /api/properties/[id]`, `PATCH /api/deals/[id]`, `PATCH /api/admin/users/[id]/tier`. *`lib/rate-limit.ts`; recorded after successful mutation.*
- [x] Lightweight abuse guard for `POST /api/csp-report` (request body-size cap and/or minimal spam throttle). *Max body 8192 B + per-IP rate limit `csp-report:post`.*
- [x] Decide and document production stance for `GET /api/health` exposure (public vs restricted) in threat model / security docs. *Public LB probe — [`docs/security/security-audit.md`](security/security-audit.md) §7.*
- [x] Refresh `docs/security/security-audit.md` and `docs/security/security-notes.md` to match current CSP sources and rollout behavior in `app/next.config.ts`.

---

##### Phase 11 — Data integrity: API writes & ownership (`[Synth 4-01]`) — **✓ complete (2026-04-01)**

*Boundary:* Server-side validation and Prisma `where` scoping — not CSV column semantics or export formatting (Phase 12).

- [x] Add `validateEscrowAmount` parity to embedded mortgage creation in `POST /api/properties` (align with mortgage API / CSV import rules).
- [x] Harden write-path ownership defense-in-depth: user-scoped `where` constraints for property/mortgage delete/update calls that are currently id-only. *Property `delete`; mortgage `update`/`delete`; deal `update`/`delete`.*

---

##### Phase 12 — Data integrity: CSV import/export & reference doc (`[Synth 4-01]`) — **✓ complete (2026-04-01)**

*Boundary:* Import/export pipeline and `portfolio-csv-export` documentation — not generic API property create (Phase 11).

- [x] Add explicit mortgage start-date import support (vs implicit `purchaseDate` proxy) and document fallback behavior. *`mortgage start date` columns in `csv-parser`; import + validation use `mortgageStartDate ?? purchaseDate`.*
- [x] Fix export zero-vs-empty handling for mortgage balance columns (paid-off `0` vs no-mortgage blank). *`GET /api/export/portfolio` uses `lienCount === 0` for blank vs numeric string.*
- [x] Update [`docs/reference/portfolio-csv-export.md`](reference/portfolio-csv-export.md) with round-trip / export-only / lossy matrix and explicit percent basis notes. *Plus `mortgage start date (first lien)` export column.*

---

##### Phase 13 — Reliability & performance (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Observability on hot paths + client/server cost — not new funnel product events (Phase 15) or SEO (Phase 16).

- [x] Wrap high-traffic CRUD routes in structured try/catch + `Sentry.captureException` with `userId` and route metadata. *Properties + deals POST/PATCH/DELETE.*
- [x] Implement Stripe webhook `event.id` deduplication for PostHog server captures (avoid duplicate analytics on retries). Align with [`docs/internal/stripe-webhook-posthog-idempotency.md`](internal/stripe-webhook-posthog-idempotency.md) if applicable. *`StripePosthogDedup` + `lib/stripe-webhook-posthog.ts`.*
- [x] Reduce `PostHogPersonProperties` `/api/me` fan-out from every pathname change to mount/event-driven sync.
- [x] Unify dashboard data loading with `buildPortfolioSummaryPayload` (or shared server loader) to remove duplicated query and metric logic. *`buildDashboardPortfolioPayload`.*
- [x] Split heavy client bundles in analyze/marketing paths (`deal-analyzer-form` subregions, homepage `PublicCalculator`) with staged dynamic loading where practical. *Homepage `PublicCalculator` dynamic; deal-analyzer subregions still deferred.*
- [ ] Evaluate whether app-shell `force-dynamic` can be narrowed or isolated as traffic scales.
- [x] Optional: add Clerk preconnect/dns-prefetch in layout if RUM shows auth-origin connection delay. *`NEXT_PUBLIC_CLERK_PRECONNECT_ORIGIN` or `dns-prefetch` fallback.*

---

##### Phase 14 — UX, accessibility & mobile (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* In-app UX and marketing shell polish — not analytics instrumentation (Phase 15) or SEO mechanics (Phase 16).

- [x] Add mobile-accessible page-level `<h1>` landmarks for Modeling and Mortgage workspaces (narrow breakpoints). *(Synthesis merges a duplicate Mobile-lane note into this UX item.)*
- [x] Visible error feedback in `PastDueBanner` when billing portal launch fails.
- [x] Rewrite in-app calculators hub copy to remove SEO implementation language; keep user-facing intent only.
- [x] Reduce CTA overload: simplify Properties header action stack and promote one clear post-first-property next-step CTA. *Short “Modeling” / “Mortgage” links; primary remains Add property.*
- [x] Align workspace selector labels to user language (e.g. “Property” vs “Modeling context” / “Mortgage context”).
- [x] Increase landing-nav hamburger touch target from `size-10` to at least 44×44 (`size-11`) for parity with app shell controls. *`components/landing-nav.tsx` — `size-11` + `min-h/w-11`.*
- [ ] Run a device-backed narrow viewport matrix pass (320 / 375 / 390 / 430 and 767 / 768 boundary) and log evidence in the mobile verification or audit notes.

---

##### Phase 15 — Growth & activation (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Measurement and activation copy/UX — not PostHog transport efficiency (Phase 13) or billing matrix internal doc (Phase 17).

- [x] Track missing funnel events on high-intent paths: landing pricing-preview CTA and `PLAN_LIMIT_HIT` upgrade CTAs. *`funnel_cta_clicked` + `plan_limit_upgrade_cta_clicked`.*
- [x] Add plan-intent reinforcement content on sign-up for `investor` / `pro` intent users.
- [x] Improve activation discovery by surfacing alternative first actions without hidden disclosure friction. *Dashboard empty state “More ways to get started” + onboarding banner.*
- [x] Upgrade billing success content to include activated plan and new limits, not only generic success copy.
- [x] Reduce repeated paid-intent banner fatigue (bounded local persistence for dismiss behavior).

---

##### Phase 16 — SEO tooling & math edge (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Public discovery + one calculator edge case — not app-shell `noindex` (Phase 9).

- [x] Normalize root canonical / sitemap URL formatting to one convention (`sitemap.ts`, `metadata` patterns). *`getAppOrigin()` in `sitemap.ts` / `robots.ts`; pricing uses `getAppOrigin()`.*
- [x] Add lightweight release SEO regression check (script or checklist) so `sitemap.ts`, `robots.ts`, and route indexing intent stay aligned. *[`docs/qa/seo-release-checklist.md`](qa/seo-release-checklist.md).*
- [x] Guard `annualizedRoiPercent` in `fix-and-flip-calculator` against `NaN` in &gt;100% loss edge cases; add targeted unit test.

---

##### Phase 17 — Business, launch & internal analytics docs (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Operational documentation and evidence — not repo-wide README indexing (Phase 18).

- [x] Verify and document `past_due` user-facing path end-to-end (status route → shell → visible banner/state). *[`docs/internal/past-due-user-path.md`](internal/past-due-user-path.md).*
- [x] Extend [`docs/internal/billing-matrix.md`](internal/billing-matrix.md) with auxiliary billing route behavior (`/sync`, `/status`, `/subscription-details`).
- [x] Complete and evidence the PostHog named funnel verification checklist in [`docs/launch/posthog-growth-funnel.md`](launch/posthog-growth-funnel.md).
- [ ] Close unchecked operational items in [`docs/launch/launch-plan.md`](launch/launch-plan.md) section 9 against production reality. *Doc note added 2026-04-01; production verification remains on owner.*
- [x] Document currently undefined analytics events (beyond core funnel) in launch analytics docs. *[`docs/launch/analytics.md`](launch/analytics.md), posthog-growth-funnel supplement.*

---

##### Phase 18 — Repository documentation housekeeping (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Doc moves and indexing — not legal copy (Phase 20).

- [x] Archive completed proposals from `docs/proposals/` into `docs/archive/proposals/` (active proposals only in root). *Archived 2026-04-01; kept `refinance-payoff-proposal.md`, `test-hardening-phase-1-2-plan.md`, `testing-implementation-plan.md`.*
- [x] Expand `docs/README.md` indexing for `docs/internal/` and missing policy/process/launch docs.
- [x] Archive dated paid-ads readout artifacts from `docs/launch/` into an archive location. *[`docs/archive/launch/paid-ads-readouts/`](archive/launch/paid-ads-readouts/README.md).*
- [ ] Clean up superseded same-day documentation audit reruns once canonical copy is confirmed. *Owner: keep multiple same-day audits as real artifacts (2026-04-01).*

---

##### Phase 19 — Governance (`[Synth 4-01]`) — **✓ complete (2026-04-01)**

*Boundary:* Agent/process docs only — not calculator product code.

- [x] Fix stale lane count in `docs/cursor-agent-setup.md` summary (“12” → “14”).
- [x] Add explicit 14-lane statement (including SEO + Mobile experience) in `docs/process/agent-governance-audit-process.md`.
- [x] Optionally add [`docs/policies/calculator-metric-tones.md`](policies/calculator-metric-tones.md) to `.cursor/rules/builder-agent.mdc` references for calculator-surface tasks.

---

##### Phase 20 — Legal & compliance (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Customer-facing legal and pricing disclosure — builder implements copy/links; counsel review is an owner step.

- [x] Add concise billing/refund/cancellation disclosure near pricing and upgrade CTAs, linking to exact Terms sections. *Anchors `#subscriptions-and-payments`, `#refunds`, `#cancellation` on `/terms`.*
- [ ] Route Terms recurring-billing/auto-renew wording through counsel for target jurisdictions *(owner / PM; track outcome in repo or legal folder as appropriate)*.
- [ ] Standardize legal-page metadata hygiene (exact “Last updated” date format; optionally consistent processor policy links). *Terms/Privacy already use “Last updated: Month YYYY”; optional Privacy processor sentence deferred.*

---

##### Phase 21 — Synthesis manual verification gate (`[Synth 4-01]`)

*Boundary:* QA and evidence after implementation waves — no new product scope (re-run audits and smoke tests once Phases 10–20 are sufficiently complete). *PM/owner runs these; not automated in-repo.*

- [ ] Re-run impacted lane audits (minimum: Reliability, Data Integrity, Growth, Mobile when those domains were touched).
- [ ] Smoke: sign-up/sign-in, checkout, webhook sync, portal launch, `past_due` recovery (after billing-related phases).
- [ ] Manual CSV: export → import round-trip with escrow, stored balance, and negative-amortization edge rows (after Phase 12).
- [ ] Live/staging: verify `robots.txt`, `sitemap.xml`, and app-route `noindex` / public canonical behavior (after Phase 16).

---

#### Deferred from synthesis (explicitly not in Phases 10–21)

*Large or design-pending items stay deferred until promoted explicitly.*

- [ ] **`[Synth]` Mega-module refactors** — Wizard, deal analyzer, projections tab, etc. (Code audit) — **deferred.**
- [ ] **`[Synth]` Onboarding modal decorative reduction** — **deferred** with mega-ui batch.
- [ ] **`[Synth]` `@theme` `primary` vs `text-primary` / `bg-primary`** — **deferred** unless blocking another task.

*The following were **promoted** into Phase 13 (no longer deferred here): dashboard + `buildPortfolioSummaryPayload` deduplication; PostHog `/api/me` fan-out reduction; optional Clerk preconnect.*

*Batch 14 (deferred backlog below):* CSP enforcement verification in production still applies; **Phase 10** covers synthesis `csp-report` abuse guard. Complete Batch 14 verification alongside or after Phase 10 as appropriate.

---

### Pre-launch / PM — PostHog production (Batch 8.1)

- [ ] **Vercel production env** — `NEXT_PUBLIC_POSTHOG_KEY` / host set in Vercel; **production** loads the snippet and events appear in PostHog (“Live events”). Full acceptance bullets lived under Batch 8.1 in [`docs/tasks-archived.md`](tasks-archived.md) § Tasks.md archive (2026-03-30).

---

### Deferred backlog (owner decisions; not scheduled)

*Full context and completed synthesis phases are in the 2026-03-30 archive section.*

- [ ] **Batch 9 — Deferred:** Split `add-property-wizard.tsx` into smaller step modules/hooks (until complexity/velocity justify).
- [ ] **Batch 9 — Declined:** Onboarding panel decorative style simplification; optional nav micro-copy / tooltip changes — *no action unless design direction changes.*
- [ ] **Batch 11 — Deferred:** Trust strip / testimonials / logos (out of approved Batch 11 scope).
- [ ] **Batch 12 — Deferred:** Prepare business metrics snapshot for next valuation pass (MRR/subscriber); *owner preference: no in-repo placeholder until live metrics exist.*
- [ ] **Batch 14 — Deferred: CSP** — Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` match [`docs/policies/csp-rollout.md`](policies/csp-rollout.md). *`POST /api/csp-report` abuse/body guard is scheduled in **Phase 10** (synthesis); keep Batch 14 focused on rollout verification.*

---

### Testing hardening (phased — Vitest + optional E2E)

*Source & rationale:* [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) (tiers A–D, gaps, what “high confidence” means). *Process:* PM assigns by phase; **builder** implements per `.cursor/rules/builder-agent.mdc` and existing route-test patterns (`vi.mock` auth/db/rate-limit). *Sequencing:* **Complete Phase 1 before Phase 2** unless PM explicitly parallelizes. **Do not** start Phase 4 (E2E) until Phase 1 billing/webhook tests exist. Update [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §10 change log when a phase completes or CI policy changes.

**Correctness-first (applies to every phase):** Assertions must reflect **intended** behavior from [`docs/policies/ownership-metrics.md`](policies/ownership-metrics.md), [`docs/policies/analytics-math-policy.md`](policies/analytics-math-policy.md), [`docs/internal/api-list-contract.md`](internal/api-list-contract.md), and other agreed specs — not “whatever the route returns right now.” If code and policy disagree, **fix the code or update the policy doc**, then write tests that lock the corrected contract. See [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) §1.1.

#### Phase 1 — P0: Money and account safety — **✓ complete (2026-03-30)**

*Goal:* Confidence that billing and destructive account paths behave under controlled mocks. *Stack:* Vitest + colocated `*.test.ts` next to routes.

- [x] **`POST /api/billing/webhook`** — Stripe webhook handler (`app/app/api/billing/webhook/route.ts`). *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] `stripe.webhooks.constructEvent` is mocked; Prisma and `captureServerEvent` (or equivalent PostHog server capture) are mocked so tests do not hit network or real DB.
    - [x] **Case — success path:** At least one test where a valid `customer.subscription.updated` (or primary event your handler processes) runs through to successful tier/profile update without throw.
    - [x] **Case — bad signature / invalid payload:** Request returns **400** (current route behavior) when signature verification fails; no Prisma writes.
    - [x] **Case — irrelevant or unhandled event type:** Handler returns safely (e.g. 200 acknowledge or documented behavior) without corrupting data; no duplicate side effects on replay if idempotency is modeled (align with [`docs/internal/stripe-webhook-posthog-idempotency.md`](internal/stripe-webhook-posthog-idempotency.md) if applicable).
    - [x] `npm run test` from `app/` passes; no new lint errors.

- [x] **`POST /api/billing/create-checkout-session`** — Authenticated checkout creation. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] Mocked Stripe: authenticated user with valid body receives a session/url payload (match current route contract).
    - [x] Unauthenticated request → **401**.
    - [x] Malformed or Zod-failing body → **400** with stable error shape.
    - [x] Colocated test file under `app/app/api/billing/create-checkout-session/`.

- [x] **`POST /api/account/delete`** and **`POST /api/account/delete-permanent`** (as implemented) — Soft vs hard delete boundaries. *Tests:* `delete/route.test.ts`, `delete-permanent/route.test.ts`.
  - *Acceptance:*
    - [x] Unauthenticated → **401** on each route that requires auth.
    - [x] Authenticated: mocks prove intended transition (e.g. soft-delete fields set vs permanent removal) without calling real Resend/Stripe.
    - [x] **`/api/account/restore`** — not part of Phase 1 scope; defer if dedicated tests are needed.

- [x] **`GET /api/portfolio/summary`** — Plan slice / denominator correctness. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] Response JSON includes **`slice`** (or current contract) with `propertyCountTotal`, `propertyCountIncluded`, `propertyLimit`, `truncated` consistent with mocked `count` + `findMany` when total properties exceed plan cap.
    - [x] Case where user is under limit: `truncated` false and counts align with [`docs/internal/api-list-contract.md`](internal/api-list-contract.md).
    - [x] `npm run test` green.

- [x] **`GET /api/export/portfolio`** — CSV export headers and auth/rate-limit paths. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] With mocks, response includes **`X-Veld-Property-Count-Total`**, **`X-Veld-Property-Count-Included`**, **`X-Veld-Property-Limit`**, **`X-Veld-Property-Slice-Truncated`** matching the same semantics as summary slice (per api-list-contract).
    - [x] **401** when not authenticated; **429** (or documented behavior) when rate limit mock triggers.
    - [x] **Phase 1 exit:** Webhook suite has **≥ 3** distinct cases (success, bad signature, irrelevant/unhandled); all Phase 1 routes above have colocated tests meeting bullets.

#### Phase 2 — P1: Data path and limits — **✓ complete (2026-03-30)**

*Goal:* Import/export and nested resources do not regress silently. *Depends on:* Phase 1 patterns established (shared mocks/helpers may be extended).

- [x] **`POST /api/import/portfolio`** — Rows, validation, plan limit, rate limit. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] At least one **success** path (valid CSV or payload per handler).
    - [x] **400** when multipart has no `file` (handler contract); row-level parse errors return `errors` in JSON per existing import behavior (not necessarily 400).
    - [x] Plan cap → **403** with `PLAN_LIMIT_REACHED` or documented code.
    - [x] Rate limit → **429** when rate-limit mock is exhausted.

- [x] **`PATCH` / `DELETE` `/api/deals/[id]`** — Symmetry with `app/app/api/deals/route.test.ts` (list/create coverage). *Tests:* `app/app/api/deals/[id]/route.test.ts`.
  - *Acceptance:*
    - [x] PATCH success updates deal; invalid body → 400; not found → 404 as implemented.
    - [x] DELETE hard-deletes saved deal row; unauthorized → 401.

- [x] **`GET /api/properties/[id]/metrics`** — Computed metrics vs `lib/` contract. *Tests:* `app/app/api/properties/[id]/metrics/route.test.ts`.
  - *Acceptance:*
    - [x] Response equals `computePropertyMetrics(...)` for the same derived inputs (correctness-first).
    - [x] **401** without session when required.

- [x] **Shared test helpers** — No change to `api-route-mocks.ts` required; import/metrics use **colocated fixtures** and comments in each `route.test.ts` (acceptable per Phase 2 scope).

- [x] **Phase 2 exit:** Tier-1 extensions under `/api/properties` and `/api/deals` that return computed or nested data have route tests for the **GET/PATCH/DELETE** paths listed above; PM can trace each route to a `*.test.ts`.

#### Phase 3 — P2: `lib/` hardening and coverage discipline — **✓ complete (2026-03-30)**

*Goal:* Refactors do not break hidden assumptions; optional CI thresholds for core math.

- [x] **`lib/auth.ts` (or auth entry used by routes)** — Hybrid: **`isAdmin`** in `lib/auth.test.ts`; **`getAppUser` / `getActiveAppUser`** documented in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §2.4 as covered via mocked route tests (not Clerk/Prisma isolation).
  - *Acceptance:*
    - [x] Either: focused tests for `getActiveAppUser` / `getAppUser` behaviors that are easy to regress (e.g. soft-delete rejection), **or** a short note in `test-infrastructure-review.md` that auth is covered only via route integration tests — pick one strategy and list which routes cover which branches.

- [x] **`lib/plans.ts`** — Tier limits table-driven. *Tests:* `lib/plans.test.ts`.
  - *Acceptance:*
    - [x] Tests for `getPropertyLimit` / `getDealLimit` (or current API) for each tier string you support; failure cases for unknown tier if applicable.

- [x] **Coverage gates** — `app/vitest.config.ts`.
  - *Acceptance:*
    - [x] Aggregate **v8** thresholds on the **included** set: **statements ≥ 80%**, **lines ≥ 80%**, **branches ≥ 58%**, **functions ≥ 78%** — `npm run test:coverage` fails on regression; documented in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §3.4. *(CI still runs `npm run test` without coverage unless you add a job.)*
    - [x] `coverage.include` expanded with correct `app/app/api/...` paths + Phase 1–2 route files + `lib/plans.ts`.

#### Phase 4 — P3: Smoke E2E (optional; non-blocking until stable)

*Goal:* One browser happy path against test-mode Clerk/Stripe or staging. *Prerequisite:* Phase 1 complete.

- [ ] **Playwright (or Cypress) — one smoke file**
  - *Acceptance:*
    - [ ] Single spec: e.g. **guest → sign-in (test user) → dashboard loads** *or* **minimal add-property** flow — **≤ 5 min** local/CI runtime target.
    - [ ] Job runs on **`workflow_dispatch`** or **nightly** initially; document flakiness and promote to PR gate only when green consistently.
    - [ ] Secrets and URLs documented in [`docs/setup/manual-steps.md`](setup/manual-steps.md) (test Clerk keys, staging URL, no production secrets in logs).

#### Phase 5 — Ongoing (process; not a single completion checkbox)

- **Same PR rule:** When changing **metrics, Zod validations, CSV import, or billing**, add or extend tests in the same PR unless PM documents an exception.
- **Manual QA:** Keep [`docs/qa/mobile-shell-verification.md`](qa/mobile-shell-verification.md) and [`docs/qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) on a quarterly or pre-release cadence.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
