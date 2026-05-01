# Veld Portfolio — Roadmap

**Purpose:** Canonical backlog of value-add features, initiatives, and long-term vision. The PM promotes items from here to `docs/tasks.md` when ready to build. The builder references this doc for scope and acceptance criteria when a task references a roadmap item.

**Strategy:** Stay in the **investor intelligence** lane — not property management (rent collection, tenants, maintenance, full GL accounting). Deeper analysis: `docs/internal/differentiator-value-add-analysis.md`.

---

## 1. Product map — how major surfaces relate (avoid duplicate work)

| Surface | Primary job | Not a substitute for |
|---------|-------------|----------------------|
| **Dashboard** | Portfolio snapshot, drill-down to property | Full underwriting |
| **Analyze deal** (`/analyze`) | Full in-app deal workspace; saved **Deals** | Quick one-off calculators |
| **Modeling** (`/modeling`) | Time-horizon projections for an **owned** property | Hypothetical property sandbox (see §Simulation remainder) |
| **Mortgage** | Loans, payoff, amortization on real properties | Standalone BRRR/flip math (→ **Tools hub**) |
| **Deals** | Saved analyses; convert to property | Portfolio-wide alerts |
| **Investment property calculator** (public) | Marketing + SEO funnel | Logged-in portfolio truth |
| **Tools hub** (`/tools`, `/calculators`) | Fast calculators; **public indexable routes** + in-app hub | Full Analyze workspace |
| **§1a Strategic backlog** | Alerts, deal↔portfolio, exports, comparison UI | Benchmarking v2 (done) or staleness nudges alone |

**App Router inventory (maintainers):** Canonical segments live under `app/app/`. Signed-in **`(app)/` group:** `dashboard`, `properties` (incl. `new`, `[id]`, `amortization`, `mortgage/quick`), `deals`, `deals/[id]`, `analyze`, `modeling`, `mortgage`, `refinance`, `calculators/*`, `export/portfolio-summary`, `settings`, `plans`, `billing/success`, `admin`. **Public / hybrid:** `/` (landing), `pricing`, `about`, `contact`, `changelog`, `resources`, `resources/[slug]`, `vs`, `vs/[slug]`, `alternatives`, `alternatives/[slug]`, `tools`, `tools/[calculator]`, `tools/[calculator]/[location]`, `investment-property-calculator`, `lp/investment-property-calculator`, `privacy`, `terms`, `sign-in`, `sign-up`, `learn/*` (e.g. React labs). Omit from marketing tables unless user-facing.

**Cron / retention-related API (Vercel cron + `CRON_SECRET`):** `GET /api/cron/monthly-digest`, `monthly-refresh`, `milestone-emails`, `trial-emails`, `onboarding-emails`, `winback-emails`, `rate-limit-cleanup` (verify `app/proxy.ts` / middleware allowlists match deployed jobs). Operational detail: **`docs/tasks.md`** maintenance items.

---

## 1a. Strategic backlog (market-informed) — decision intelligence & growth

Prioritized initiatives (2026). Each has **one** primary purpose; older sections below **point here** instead of re-scoping the same work.

### Portfolio insights & prioritized alerts

**Priority:** 9

**Purpose:** From **metrics + nudges** to **what to do next** — ranked, plain-language guidance (e.g. weak DSCR, rent opportunity, refi worth a look, stale assumptions).

**Distinct from:** **Benchmarking** and **data staleness nudges** (shipped) — this layer **interprets** and **prioritizes**. Complements **Refinance / payoff insights**.

**Acknowledge / snooze mechanism (backlog, not scheduled):** Persistent insight alerts (e.g. "negative cash flow", "rent below market") can become nagging in real estate where resolution timelines are measured in months (lease renewals, refinancing, market shifts). Before shipping any persistent health summary or alert banner, build an **acknowledge / snooze** system: per-property, per-alert-type dismiss state stored in the DB, with optional snooze duration ("Remind me at lease renewal" / "Snooze 3 months") and optional user note ("Renovation in progress, rent increase planned for June"). Auto-resurface when the underlying data changes or the snooze expires. Without this mechanism, persistent alerts hurt the premium experience rather than help it. See also: **Lease renewal tracking** below.

---

### Portfolio health score

**Priority:** 9

**Purpose:** Composite score summarizing portfolio health across LTV, DSCR, cash flow trend, and vacancy exposure. Transparent and explainable — not a black box. Each score surfaces the **primary driver** behind the rating so users understand what's pulling their score down and what action addresses it.

**Key dimensions:**
- **LTV** — leverage risk signal; low LTV = strong equity cushion
- **DSCR** — debt service coverage; sub-1.0 = cash flow absorbed by debt
- **Cash flow trend** — direction and velocity of net cash flow over time
- **Vacancy exposure** — proportion of portfolio at risk from vacancies

**Weighting validation requirement:** Validate weights against realistic portfolio compositions before shipping. A strong composite score masking a critical single-metric failure (e.g. high DSCR on most properties hiding a severely overleveraged outlier) is worse than no score. The primary-driver call-out must match the actual score movement; edge cases (vacant property, no mortgage) must not produce nonsensical scores.

**UI treatment:** Dashboard-level summary card with score + primary-driver label. Property-level breakdown optional.

**Connection to existing features:**
- **Portfolio insights & prioritized alerts** (§1a) — score is the "at a glance" diagnostic; the insights layer is the "what to do" layer. The two complement each other; do not collapse them into one component.
- **Acknowledge / snooze** (§1a insights): if the health score surfaces a persistent low rating, the same snooze mechanism applies.

**Distinct from:** **Portfolio insights & prioritized alerts** (ranked action queue) — health score is a **summary diagnostic**, not an action list.

---

### Lease renewal tracking & rent adjustment reminders

**Priority:** 9–10

**Purpose:** Track lease dates per property (start, end, term type — month-to-month vs fixed, per unit for multi-family) and proactively surface rent adjustment opportunities tied to renewal timing. Transforms the existing rent-vs-market benchmark from a static observation ("your rent is 4% below market") into a time-bound, actionable prompt ("lease renews in 45 days — market rent is 4.2% above your current rate, consider adjusting").

**Why it matters for Pro users:** A landlord with 20 properties can't act on rent benchmarks at arbitrary times — rent changes happen at lease renewal. Knowing *when* each property's lease renews and *what the market says* at that moment is the bridge between "information" and "action." This is a natural Pro-tier differentiator: "Veld tells you when to raise rent and by how much."

**Schema:** `leaseStartDate`, `leaseEndDate`, `leaseTermType` (enum: `month_to_month`, `fixed`) per property or per unit (for multi-family). Optional: `leaseRenewalNotes`.

**Connection to existing features:**
- **Property Performance Table** (dashboard, 6+ properties): "Next renewal" becomes a sortable column — "sort by soonest renewal" is a one-click workflow
- **Retention / lifecycle hooks** (near-term § digest + email crons): Renewal reminders would be a natural follow-on nudge
- **Portfolio insights** (§1a): Lease-aware alerts are more actionable than static benchmark alerts; connects to the acknowledge/snooze mechanism
- **Benchmarking** (shipped): Market rent data already exists; this feature adds the *timing* dimension

**Distinct from:** Tenant management (rent collection, lease document storage, maintenance) — this stays in the **investor intelligence** lane, not property management.

---

### Deal-to-portfolio continuity

**Priority:** 9

**Purpose:** “If I buy this, how do portfolio aggregates change?”, deal vs **portfolio averages**, **convert deal → property** with minimal re-entry.

**Distinct from:** **Analyze deal** (workspace), **Modeling** (owned-only projections), **Tools** (no portfolio context). Replaces the loose “property evaluation tool” notion — any Evaluate flow should serve **this**, not a second deal analyzer.

**Shipped (v1):** `GET /api/deals/[id]` includes `portfolioContext` (snapshot: weighted cap, portfolio cash-on-cash, DSCR, total monthly cash flow, property counts). **Analyze deal** shows a **Compared to your portfolio** panel when a saved deal is loaded (empty portfolio → add-property CTA).

---

### Hold vs. sell analysis

**Priority:** 10

**Purpose:** Models the opportunity cost of holding a property versus liquidating and redeploying freed equity. The user inputs an assumed alternative return rate; the tool compares projected 5/10/20-year outcomes between the hold scenario and the sell scenario using existing cash flow, equity, and appreciation data. Answers the question every investor eventually faces with actual numbers rather than intuition.

**Inputs:**
- Hold scenario: existing cash flow, equity, appreciation assumptions from property data + Modeling presets
- Sell scenario: current estimated value, selling costs (configurable), net proceeds reinvested at user-specified alternative return rate
- Time horizons: 5 / 10 / 20 years (or user-configurable)

**Outputs:** Side-by-side projected equity, cumulative cash flow, and total return for hold vs. sell. Crossover point — the year at which one scenario overtakes the other.

**Connection to existing features:**
- **Modeling** (`/modeling`) provides the hold-scenario projection engine — this adds the sell scenario and comparison layer on top of it
- **Scenario & deal comparison** (§1a) — if side-by-side comparison UI ships first, hold vs. sell reuses it
- **Investor outputs** (§1a) — hold vs. sell summary is a natural export for advisor/partner conversations

**Distinct from:** **Modeling** (hold-only, single-property projections), **Deal analyzer** (new acquisitions). Explicitly for the sell-or-hold decision on **owned** properties.

---

### Equity deployment modeling

**Priority:** 10

**Purpose:** Surfaces idle or underleveraged equity across the portfolio and models what deploying it into a new acquisition would do to overall portfolio returns. Creates a direct workflow connection between the portfolio view and the deal analyzer — "you have $X in deployable equity, here's what a deal at current market rates does to your portfolio-level cash-on-cash and NOI." Turns existing portfolio data into a forward-looking acquisition decision engine, completing the loop between what you own and what you could own.

**Core workflow:**
1. **Identify deployable equity:** portfolio view surfaces total equity and estimated cash-out available per property at configurable LTV limits (e.g. 75% LTV cash-out refi)
2. **Model deployment:** user selects equity amount and target acquisition assumptions, or links to a saved deal in **Analyze deal**
3. **Output:** new deal metrics (cash-on-cash, NOI, DSCR) plus updated portfolio-level aggregates with the hypothetical acquisition included

**Connection to existing features:**
- **Deal-to-portfolio continuity** (§1a, shipped v1) — inverse flow: portfolio → new deal vs. deal → portfolio. These two features close the loop.
- **Analyze deal** (`/analyze`) — equity deployment flows into the deal analyzer as a prefilled starting point ("using $X from Oak Street cash-out")
- **Portfolio insights** (§1a) — "underleveraged equity" is a natural insight trigger ("You have ~$80K in idle equity — here's what deploying it does to your returns")

**Distinct from:** **Deal-to-portfolio continuity** (answers "how does this deal change my portfolio?") — equity deployment answers "what can my portfolio fund, and what does that look like?"

---

### Scenario & deal comparison (side-by-side)

**Priority:** 10

**Purpose:** **Two** scenarios or **two** deals on one screen (base vs conservative, Deal A vs Deal B).

**Distinct from:** **Modeling** presets, which tune **one** projection path. Optional link to **Simulation** remainder (hypothetical property) if shipped later.

---

### Investor outputs & sharing (PDF, lender summary, read-only link)

**Priority:** 11–12

**Purpose:** Credible **PDF/summary** for lender/partner/CPA; assumptions visible. Optional **read-only snapshot link** (time-boxed).

**Distinct from:** CSV export; **full Schedule E / bank sync** (deferred, §6). **Consolidates** the former standalone “Report section” bullet — one initiative.

**Shipped (v1):** **Print-friendly portfolio summary** at `/export/portfolio-summary` (browser print / save as PDF), backed by rate-limited `GET /api/export/portfolio-summary` with an assumptions footer. Read-only links and server-generated PDF remain backlog.

---

### CPA-friendly export (lightweight)

**Priority:** 14 — *Optional*

**Purpose:** Totals + assumptions for a CPA **without** Plaid or full bookkeeping. **Not** Baselane-class tax automation unless strategy changes.

---

### Tools hub — calculators (authenticated + **public for SEO**)

**Priority:** 10–11 (incremental)

**Purpose:** Fast BRRR, flip, wholesale, STR vs LTR, etc. **Acquisition:** selected tools ship as **public, indexable** routes (same pattern as **`/investment-property-calculator`**): canonical URLs, title/description, internal links, CTA to sign up or open **Analyze**. Avoid duplicating the whole app — **thin** public layer, richer optional when signed in.

**Public vs signed-in:** Public = limited fields + core math + CTA; signed-in users use **`/calculators`** inside the app shell (sidebar), parallel to public **`/tools`** (same calculator components; SEO/canonical stay on **`/tools`** and **`/investment-property-calculator`** for ads).

**Distinct from:** **Analyze deal**, **Modeling**, standalone marketing calculator (sibling; link from hub).

*Calculator shortlist and nav: see **§2 Tools hub** below (single detailed table).*

**Shipped (v1):** **`/tools`** hub, **`/tools/brrr`**, canonical **`/investment-property-calculator`**, **`/calculators`** in-app hub + **`/calculators/brrr`** + **`/calculators/investment-property-calculator`**; **Calculators** app nav → `/calculators`; **proxy** allowlist for public `/tools` routes.

**Shipped (v2):** **`/tools/str-vs-ltr`** and **`/calculators/str-vs-ltr`** — STR vs LTR comparison calculator (see §2 Tools hub shortlist).

**Shipped (v3):** **`/tools/fix-and-flip`** and **`/calculators/fix-and-flip`** — fix-and-flip profit / ROI calculator (IO hold, sale at ARV).

**Shipped (v4+):** Matching **`/tools/*`** + **`/calculators/*`** pairs for **`wholesale`**, **`rent-vs-buy`**, **`cap-rate`**, **`cash-on-cash`**, **`dscr`** (see `app/app/tools/` and `(app)/calculators/`).

**Future — calculator ↔ workspace continuity (backlog, not scheduled):** Public calculators do **not** persist inputs or push assumptions into **Analyze deal** today; CTAs are aligned to that fact. Later options to promote when ready: (1) **Query-string (or hash) prefill** to `/analyze` for overlapping fields (e.g. purchase, mortgage, LTR rent)—honest per calculator; (2) **Named saved calculator sessions** (per user, per tool); (3) **STR / multi-mode fields** inside the deal analyzer only if ICP justifies the scope. Promote to `docs/tasks.md` when prioritizing.

---

## 2. Near-term (Prioritized Value-Add) — detailed tracks

Post-MVP features in suggested order. Promote to `docs/tasks.md` when ready to build.

### Reverse trial pricing model — **shipped**

**Priority:** ~~Very near-term~~ — **live** (reverse trial behavior in code + pricing UX).

**Implemented behavior:** First-time app user provisioning sets **`trialEndsAt`** ≈ signup + **14 days** and fires `trial_started` analytics (`app/lib/auth.ts`; constants in `app/lib/plans.ts`). **`getEffectiveTier`** maps active trial on an otherwise **free** paid tier to **Investor-equivalent limits** (`app/lib/plans.ts`). Public **`/pricing`** states full Investor access for 14 days with no credit card until post-trial downshift.

**Historical intent / experiments:** Bench research and funnel math live in [`docs/research/growth-pricing-research-2026-04.md` §Pricing Model Research](../research/growth-pricing-research-2026-04.md#pricing-model-research).

**Operational:** Tune copy, reminders (`/api/cron/trial-emails`), conversion — measure in analytics; do **not** restate signup conversion percentages here unless sourced from dashboards.

---

### Retention data hooks (monthly digest, AVM refresh, alerts)

**Priority:** **In progress** — core **cron + lifecycle email** scaffolding **shipped**; still room vs “full Stessa-grade pull loops.”

**Purpose:** Reasons to return that do **not** require bank transactions — digest, refreshes, milestones, win-back.

**Code vs phased vision (snapshot 2026-04-30):**

| Phase | Objective | Ships in repo today | Still open |
|-------|-----------|---------------------|------------|
| 1 | Monthly portfolio digest | `GET /api/cron/monthly-digest` | Template/ops polish |
| 2 | Scheduled AVM/rent refresh | `GET /api/cron/monthly-refresh` | Cost gates, eligibility (see route + `lib/refresh`) |
| 3 | Equity/value change nudges | Overlaps digest/refresh — **confirm product spec** | Dedicated “big move” email if missing |
| 4 | Rent vs market alert | Benchmark infra exists; **standalone alert TBD** | Threshold + copy |
| 5 | Mortgage milestones | `GET /api/cron/milestone-emails` | Trigger tuning |

**Also live:** `onboarding-emails`, `winback-emails`, `trial-emails`, `rate-limit-cleanup` — keep **`app/proxy.ts` (or successor)** allowlists aligned with `vercel.json` schedules.

**Research:** [`docs/research/growth-pricing-research-2026-04.md` §Retention & Data Hooks](../research/growth-pricing-research-2026-04.md#retention--data-hooks).

---

### Interactive demo (no-signup required) — Deferred

**Priority:** ~~Very near-term~~ — *Deferred.* Moved to **§6 Deferred**. Full brief preserved in [`docs/research/interactive-demo-brief-2026-04.md`](../research/interactive-demo-brief-2026-04.md). Revisit after reverse trial and data hooks ship.

---

### Completed (reference)

| Feature | Status |
|---------|--------|
| Rent estimate integration (RentCast) | Done |
| Vacancy assumption | Done |
| Scenario modeling | Done |
| Data staleness nudges | Done |
| Property value estimate (RentCast AVM) | Done |
| CSV import | Done |
| Deal analyzer / scratchpad | Done |
| Benchmarking (rent vs market) | Done |
| Add-property experience overhaul (Epics A–G) | Done — see `docs/tasks.md` |
| Admin membership override | Done |
| Error tracking (Sentry) | Done |
| Mortgage balance advancement (Phase 1 — effective balance, balance as of) | Done |
| Dashboard — single-property improvements | Done — see `docs/archive/proposals/dashboard-single-property-proposal.md` (archived as implemented) |
| Benchmarking v2 (rental-status-aware) | Done — see §Benchmarking v2 below |
| Projections / cashflow timeline (single property) | Done — `ProjectionsTabContent` on property + `/modeling` workspace; rent/expense/value growth, hold period, charts, sale option |
| Refinance workspace (v1 — scenario modeling) | Done — `/refinance` workspace; property/mortgage selector, projection engine, amortization comparison charts, break-even, savings metrics |
| Automated testing (ongoing) | Done (ongoing) — Vitest; **re-verify** with `npm run test` from `RealEstatePortfolio/app/` instead of pinning counts in prose. Snapshot 2026-04-30: **85 test files**, **618 tests**, all passing. |

### Mortgage balance advancement (Phase 1 — amortization projection + manual override) — **Shipped**

**Canonical status:** Listed as **Done** in `docs/tasks.md` (roadmap priority table: mortgage balance advancement — balance advancement, escrow, amortization fix, loan type import, chart tooltip).

**What shipped:**

- **Schema:** `Mortgage.balanceAsOfDate` (`DateTime?` @db.Date) in Prisma.
- **Lib:** `getProjectedBalanceAsOf`, `getEffectiveBalance`, `getBalanceSource` in `app/lib/amortization.ts` (stored balance when `balanceAsOfDate` is within six months of today; otherwise projected balance as of today).
- **Metrics & APIs:** Portfolio/property metrics, dashboard, properties list, property detail, export/import, and mortgage APIs use effective balance for equity/LTV/debt where applicable.
- **UI:** Mortgage forms include balance-as-of; property/mortgage surfaces show stored vs projected context; amortization/payoff flows use effective balance; chart schedule remains tied to original loan terms.

**Remaining / deferred (not Phase 1 blockers):**

- **Bank-led automation:** Plaid or similar — explicitly **out of scope** for Phase 1; see `docs/plaid-considerations.md`.
- **Roadmap follow-ups** elsewhere in this doc (e.g. property detail polish) are separate initiatives.

---

### Rent gap email notifications — superseded by §2 Retention data hooks

**Priority:** ~~6~~ — *Superseded.* Rolled into **§2 Retention data hooks** (Phase 4: rent vs market alerts) as part of the broader retention strategy. See [`docs/research/growth-pricing-research-2026-04.md` §Retention & Data Hooks](../research/growth-pricing-research-2026-04.md#retention--data-hooks).

---

### Benchmarking — ✓ Done

**Scope:** "Your rent is X% above/below market" (RentCast). Surfacing on properties list, dashboard, inline refresh. See `docs/archive/proposals/benchmarking-surfacing-proposal.md`.

---

### Benchmarking v2: rental-status-aware comparison — ✓ Done

**Priority:** 9 (complete)

**Scope:** Refine benchmark semantics so rent-vs-market comparisons only show when the property is actively rented and rent is present. Avoid treating missing/non-rental states as meaningful benchmark percentages.

**Acceptance criteria:**

- [x] Add explicit rental-status input (initially boolean) to property create/edit flows and APIs.
- [x] Define one shared benchmark-eligibility contract used by dashboard, properties list, and property detail surfaces (`app/lib/benchmark-utils.ts`: `getBenchmarkEligibility`, `isBenchmarkComparable`, `shouldOfferBenchmarkRefresh`).
- [x] When property is not rented or effective rent is 0, hide percent comparison and show non-comparison status copy.
- [x] Treat `marketRent <= 0` consistently as benchmark missing across all surfaces (never "at market" from invalid market data).
- [x] Add/adjust tests for `not_rented`, rent missing/zero, benchmark stale, benchmark missing, and fresh benchmark states (`benchmark-utils.test.ts`).

---

### Dashboard — single-property improvements — ✓ Done

**Scope (original):** Improve dashboard for single-property users so they see charts and discover tools (equity, cash flow, value breakdown, property detail). See `docs/archive/proposals/dashboard-single-property-proposal.md` — proposal is **archived as implemented**.

**Verification:** `app/app/(app)/dashboard/page.tsx` implements single-property paths (e.g. `propertyHref`, `modelingHref`, `mortgageHref`, `WorkspaceNavMobile` with `singlePropertyId`, hero / at-a-glance behavior for one property).

---

### Refinance / payoff insights — v1 shipped, expand with recommendations

**Priority:** 10

**Shipped (v1):** `/refinance` workspace (`refinance-workspace.tsx`, 715 lines) — property/mortgage selector, refinance projection engine (`getRefinanceProjection` in `amortization.ts`), amortization comparison charts (Recharts), break-even analysis, monthly/total savings metrics. Full refinance scenario modeling for existing mortgages.

**Next — insights & recommendations layer:**
Expand from "user runs a what-if" to "Veld proactively surfaces refi opportunities." When interest rates drop or a property crosses an LTV threshold, generate a recommendation: "Consider refinancing Oak Street Duplex — estimated $180/mo savings at current rates."

**Connection to data hooks:** Refinance recommendations are a natural Phase 6 addition to **§2 Retention data hooks** — "You have a new recommendation for [property]" email drives a return visit with a specific, actionable reason. Zero API cost if using stored mortgage data + a rates feed (Freddie Mac PMMS is free).

See `docs/proposals/refinance-payoff-proposal.md` for original phased approach.

---

### Simulation page (vs current Modeling)

**Priority:** 11 — **partially delivered** as **Modeling** + **Projections**

**What shipped today:**

- **`/modeling`** — Global workspace; `ProjectionsTabContent` (`app/app/(app)/properties/[id]/projections-tab-content.tsx`) for scenario inputs: rent / expense / value growth, vacancy, hold years, optional sale analysis, presets (conservative/base/upside), cash-flow and equity charts over time, mortgage amortization in the projection loop.
- **Property detail** — Overview/Details tabs; `tab=projections` redirects to Modeling (see `property-detail-tabs.tsx`).

**What the original “simulation page” scope still implied (not the same as Modeling alone):**

- **Hypothetical property** — Add a *what-if* property not in the DB and see metrics (not built as a first-class flow).
- **Portfolio-level impact** — “See impact on **totals**” across the whole portfolio when assumptions change (Modeling is **per selected property**, not a combined portfolio simulation).

**Conclusion:** **Modeling covers the core “adjust inputs + time horizon + cashflow/equity over time”** intent for **one property at a time**. Keep this roadmap item open only if you still want **hypothetical deals** and/or **portfolio-aggregated** simulation; otherwise treat as **done** and close the item in `tasks.md` when PM confirms. **Side-by-side scenario comparison** is scoped under **§1a** (not duplicate UI in Modeling alone).

---

### Tools hub — detail (see §1a for strategy & SEO)

**Priority:** 10–11

**Summary:** Dedicated **Tools** nav → hub; calculators listed below. **Public routes** for selected tools = **SEO + acquisition** (indexable, canonical, CTAs); see **§1a Tools hub**. **Signed-in** hub may add richer saves later.

**Calculator shortlist (pick 2–3 first):**

| Tool | Purpose |
|------|--------|
| **BRRRR** | Purchase + rehab + ARV → refi, cash in deal, post-refi CoC. |
| **Fix-and-flip** | Purchase, rehab, hold, ARV, sell → net profit / ROI. — **Shipped** (`/tools/fix-and-flip`, `/calculators/fix-and-flip`). |
| **Wholesale / assignment** | ARV, MAO, fee → spread. — **Shipped** (`/tools/wholesale`, `/calculators/wholesale`). |
| **STR vs LTR** | Bookings, occupancy, fees → vs long-term rent. — **Shipped** (`/tools/str-vs-ltr`, `/calculators/str-vs-ltr`). |
| **Rent vs buy** | Horizon + appreciation sanity check. — **Shipped** (`/tools/rent-vs-buy`, `/calculators/rent-vs-buy`). |
| **Cap rate** | Quick cap calc. — **Shipped** (`/tools/cap-rate`, `/calculators/cap-rate`). |
| **Cash-on-cash** | Cash-on-cash from income and cash in. — **Shipped** (`/tools/cash-on-cash`, `/calculators/cash-on-cash`). |
| **DSCR** | Debt service coverage. — **Shipped** (`/tools/dscr`, `/calculators/dscr`). |
| **Mortgage comparison** | Only if clearly different from **Mortgage** workspace. |

**Navigation:** `/tools` hub; deep links per tool; link **Investment property calculator** as sibling entry. **PDF / lender / read-only sharing:** **§1a Investor outputs** (not duplicated here).

---

### Referral system

**Priority:** 13

**Scope:** Growth lever. Defer until realtor validation positive.

---

### Admin membership override — ✓ Done

**Scope:** Admins can manually set a user's tier (e.g. free Pro for realtors/demo accounts). Bypasses Stripe; useful for partner accounts, demos, and goodwill. See `docs/archive/proposals/admin-membership-override-proposal.md`.

---

### Automated testing — ongoing

**Priority:** ~~15~~ — *Ongoing, no longer a discrete roadmap item.*

**Current state:** Vitest (`npm run test` in `RealEstatePortfolio/app/`). **Do not treat historical “N tests” in old audits as current** — re-run the command after meaningful suite changes. Last doc refresh: **2026-04-30** — **85** test files, **618** tests, all passing. Coverage targets: metrics, amortization, billing/cron routes, validation, calculators, benchmark utilities, import/csv, selected UI (e.g. mobile shell, address autocomplete, wizard).

**E2E:** Playwright/Cypress smoke path remains **optional / Phase 4** per `docs/tasks.md` + `docs/qa/testing-hardening-proposal.md` — not a substitute for the unit/route depth above.

---

### Error tracking (Sentry) — ✓ Done

**Scope:** Production error monitoring via Sentry. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel for production.

---

## 3. Medium-term (Larger Initiatives)

Not yet scheduled; captured as backlog. Promote to `docs/tasks.md` when ready.

### Property detail page overhaul — **largely shipped** (verify against original vision)

**Original scope:** User-centric home base; card-based layout; mortgage/scenarios not buried.

**What shipped:** Tabbed **Overview** vs **Details** (`property-detail-tabs.tsx`); **Mortgage** and **Projections** moved to dedicated **Mortgage** and **Modeling** workspaces (deep links via `?tab=`). Reduces vertical stacking on the property page.

**Possible remaining gap:** Roadmap “card-based” layout and extra discoverability polish — if the product still feels tool-heavy, treat as **visual polish** (see below) rather than a second overhaul.

---

### Property evaluation — superseded by §1a

**Do not plan a separate “evaluation” product** parallel to **Analyze deal**. Any quick-eval or pre-add flow should roll into **Deal-to-portfolio continuity** (**§1a**): same metrics story, emphasis on **compare to portfolio** and **promote to property**.

### Visual refresh & unified aesthetic

**Status:** Ongoing via **Design spec v2** (`docs/policies/design-spec.md`, last updated 2026-03-19) — not a single “done” milestone. **Major face-lift** (full-site redesign) remains backlog if you want a discrete relaunch; incremental polish has shipped with dashboard/property/modeling work.

### Cashflow / profitability timeline simulator — ✓ **Core v1 done** (single property)

**Delivered in:** `ProjectionsTabContent` — used on property projections path and **`/modeling`** (`modeling-workspace.tsx`). Rent/expense/value growth, configurable hold period, equity and cash-flow series, cash-flow-positive year, optional sale at hold, presets (conservative / base / upside / custom), assumption transparency in UI.

**Still backlog (from original “Future expansion”):** **Portfolio-aggregated** timeline (all properties) — aligns with **§1a Simulation** remainder and **insights** layer; richer refinance/sale presets may overlap **Refinance / payoff insights**.

### Mortgage payment history / snapshots

Monthly mortgage payments can change over time (e.g. annual escrow adjustments for taxes and insurance). Extend the snapshot model (PropertySnapshot or a new MortgageSnapshot) to store historical monthly payment values by date. Enables: accurate cash flow timelines, historical charts, and projections that account for payment changes. Complements the cashflow simulator and any future "payment as of date" feature.

---

## 4. External API Integration Opportunities

Ways to enhance UX by pulling data from third-party APIs. MLS excluded (expensive, legal barriers).

| Priority | API type | Purpose | Cost / complexity | UX impact |
|----------|----------|---------|------------------|-----------|
| High | Address validation | Normalize and validate addresses as users type | Low (USPS free) | Fewer bad addresses, better data |
| High | Rental estimates | Suggest rent when adding a property | Medium | Strong for property evaluation |
| Medium | Geocoding / maps | Map view of portfolio, distance/area context | Medium | Map view, clearer context |
| Medium | Market trends | Market-level context for portfolio | Low (Census/FHFA) | Portfolio-level context |
| Lower | AVM valuation | Suggest estimated value | High | Nice-to-have; manual value works |
| Lower | Walk Score | Walkability, transit, neighborhood context | Low–medium | Extra context for evaluation |
| Lower | Mortgage rates | Current rate context for refinance scenarios | Low | "Current 30-year rate: 6.5%" in evaluation flows |

**APIs:** USPS Address Validation (free for US), Smarty, Google Places Autocomplete, Mapbox Geocoding; RentCast, Rentometer, HouseCanary; Mapbox, Google Maps; Census, FHFA House Price Index; Walk Score API; Freddie Mac PMMS, Federal Reserve.

---

## 5. Long-term Vision

Future product direction (from mvp-spec). Overlaps **§1a** where noted.

- ~~Automated property value updates~~ — promoted to **§2 Retention data hooks** (Phase 2: monthly AVM re-fetch)
- ~~Rent estimate tracking~~ — promoted to **§2 Retention data hooks** (Phase 4: rent vs market alerts)
- Refinance recommendations (see **§1a** + **Refinance / payoff insights**)
- Portfolio optimization insights (**§1a** alerts / portfolio simulation if built)
- Deal analysis tools for new acquisitions (**Tools hub**, **Analyze deal**)

**Ultimate goal:** Create a **portfolio intelligence platform for real estate investors**.

---

## 6. White-label / PM portal (Property Management Channel)

**Priority:** Backlog — validate demand before building

**Origin:** Property management software (AppFolio, Buildium, etc.) is built for the manager's workflow, not the property owner's visibility. Owners get rent statements but no performance intelligence — no equity tracking, no cash flow trends, no market benchmarking. A white-labeled Veld portal gives a PM firm a branded owner-facing dashboard they can hand to clients, making the PM look more professional while Veld runs invisibly underneath.

**Why this is a strong angle:**
- B2B sale to the PM firm (one contract, recurring per-property pricing) is a better unit economics model than D2C at low traffic volumes
- PM firms have direct motivation to differentiate: owner satisfaction drives referrals and contract renewals
- AppFolio and similar tools have no incentive to build owner intelligence — that would require exposing data the PM may not want exposed
- Warm intro potential: a PM managing 100+ properties is a meaningful first customer

**The product gap it fills:**
The owner-facing portal already exists — it's Veld with the direct-to-consumer tools (deal analyzer, calculators, BRRRR) removed and a PM's branding applied. The monthly equity trends, portfolio dashboard, rent vs market benchmarks, and trend charts we already built are exactly what an owner wants to see about their managed property. The net-new work is the PM management layer, not the owner experience.

**Minimum to approach a PM firm:**

1. `Company` model in schema — one row per PM firm with branding config (logo URL, primary color, display name, slug)
2. Subdomain routing — `[slug].veldportfolio.com` injects their branding; owner sees their PM's logo
3. PM admin page — invite clients by email, each client gets a pre-configured account linked to their company, see who is active
4. Owner view scoping — owners see their managed properties only; deal analyzer and calculators are hidden; read-only mode optional

**What does NOT change for owners:** The dashboard, trend charts, equity tracking, rent benchmarks, and property metrics are identical — they just render under the PM's brand.

**Key risk — feature parity treadmill:** Every new feature shipped to direct users needs a decision: does it go to white-label owner views? The mitigation is architecture: a feature-flag layer per `Company` that explicitly opts each white-label org into new surfaces. Direct-to-consumer features default on; PM client views default off until the PM opts in. This prevents the white-label product from becoming a maintenance fork.

**Pricing model:** Per property per month charged to the PM firm (e.g. $3–5/property/month). At 100 properties that is $300–500/month from a single PM firm. PM does not pay per owner account.

**Validation step before building:** Show the current product to 2-3 PM firms. If multiple express willingness to pay and articulate the owner-visibility gap, the build is justified. The technical lift (Company model, subdomain routing, PM admin page) is a focused scope — the owner-facing UI is already done.

**Distinct from:** Tenant management, rent collection, maintenance tracking, full GL accounting. This stays in investor intelligence — the owner's financial view of their asset, not the operational PM workflow.

---

## 7. Deferred (Validate First)

Defer until validated or user base justifies:

- **Interactive demo (no-signup required)** — Arcade.so or seeded demo account. Full brief in [`docs/research/interactive-demo-brief-2026-04.md`](../research/interactive-demo-brief-2026-04.md). Revisit when analytics show enough top-of-funnel volume to justify Arcade-style spend (reverse trial + cron lifecycle emails are **already** in production).
- **Plaid (bank integration)** — Cost scales with connected accounts (~$0.30–$1+/account/month). Legal/compliance for storing financial data. Development: 4–8 weeks for Liabilities-only. See `docs/plaid-considerations.md`.
- **Referral incentives** — Growth lever; validate with realtor feedback.
- **Advanced analytics** — Defer until core analytics proven.
- **Mobile app** — Defer until web usage justifies.
- **OAuth login, two-factor authentication** — Auth enhancements (mvp-spec).

**Shipped (reference):** Add-property / edit / property detail (Overview + Details) overhaul — Epics A–G complete; design and history in `docs/archive/proposals/add-property-experience-overhaul.md`. **Business & quality (Batch 8)** — PostHog, changelog, uptime — also complete; see `docs/tasks-archived.md` § **Tasks.md archive (2026-03-20)** and `docs/launch/launch-plan.md` §6. **Ongoing audits** follow cadence in `docs/audits/README.md` (not gated on the above).

---

## Workflow

1. **New idea** → Add to **§1a** if strategic, §6 if it needs a PM channel or partner model, or §7 if deferring; avoid duplicating the same scope in two places.
2. **Ready to build** → PM promotes item to `docs/tasks.md` with concrete tasks and acceptance criteria.
3. **Builder** → Works from `docs/tasks.md`; references this doc for full scope when a task references a roadmap item.
4. **When done** → Mark item done in this doc (e.g. add to Completed table) and check off in `docs/tasks.md`.
