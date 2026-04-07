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
| **Tools hub** (planned) | Fast calculators; **some routes public** for SEO/acquisition | Full Analyze workspace |
| **§1a Strategic backlog** | Alerts, deal↔portfolio, exports, comparison UI | Benchmarking v2 (done) or staleness nudges alone |

---

## 1a. Strategic backlog (market-informed) — decision intelligence & growth

Prioritized initiatives (2026). Each has **one** primary purpose; older sections below **point here** instead of re-scoping the same work.

### Portfolio insights & prioritized alerts

**Priority:** 9

**Purpose:** From **metrics + nudges** to **what to do next** — ranked, plain-language guidance (e.g. weak DSCR, rent opportunity, refi worth a look, stale assumptions).

**Distinct from:** **Benchmarking** and **data staleness nudges** (shipped) — this layer **interprets** and **prioritizes**. Complements **Refinance / payoff insights**.

---

### Deal-to-portfolio continuity

**Priority:** 9

**Purpose:** “If I buy this, how do portfolio aggregates change?”, deal vs **portfolio averages**, **convert deal → property** with minimal re-entry.

**Distinct from:** **Analyze deal** (workspace), **Modeling** (owned-only projections), **Tools** (no portfolio context). Replaces the loose “property evaluation tool” notion — any Evaluate flow should serve **this**, not a second deal analyzer.

**Shipped (v1):** `GET /api/deals/[id]` includes `portfolioContext` (snapshot: weighted cap, portfolio cash-on-cash, DSCR, total monthly cash flow, property counts). **Analyze deal** shows a **Compared to your portfolio** panel when a saved deal is loaded (empty portfolio → add-property CTA).

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

**Future — calculator ↔ workspace continuity (backlog, not scheduled):** Public calculators do **not** persist inputs or push assumptions into **Analyze deal** today; CTAs are aligned to that fact. Later options to promote when ready: (1) **Query-string (or hash) prefill** to `/analyze` for overlapping fields (e.g. purchase, mortgage, LTR rent)—honest per calculator; (2) **Named saved calculator sessions** (per user, per tool); (3) **STR / multi-mode fields** inside the deal analyzer only if ICP justifies the scope. Promote to `docs/tasks.md` when prioritizing.

---

## 2. Near-term (Prioritized Value-Add) — detailed tracks

Post-MVP features in suggested order. Promote to `docs/tasks.md` when ready to build.

### Reverse trial pricing model

**Priority:** Very near-term — highest-leverage change for conversion

**Purpose:** Switch from pure freemium to a **reverse trial**: new signups get full Investor-tier access for 14 days (no CC required), then auto-downgrade to a feature-limited free tier. Users keep their data but lose multi-property access, scenario modeling, and full benchmarking. Leverages loss aversion (2–2.5x stronger than gain motivation) to convert at 3–6x the rate of freemium alone.

**Why now:** Current freemium converts at 2–5%. Reverse trial benchmarks at 8–15%. At low traffic volumes, every signup matters — this is the single highest-leverage change for getting to $1K MRR. No CC requirement means signup friction stays identical to today.

**Key design decisions:**
- Free tier after downgrade: 1 property visible (others locked, data preserved), limited deal saves, no scenario modeling, no/limited rent vs market benchmarks
- Trial countdown visible in UI (subtle, not aggressive)
- "Your trial ends in X days" email at day 10 and day 13
- Downgrade is soft — data preserved, upgrade unlocks everything instantly

**Research:** Full analysis, conversion math, benchmarks, and case studies (Databox 10%→25%, Toggl doubled) in [`docs/research/growth-pricing-research-2026-04.md` §Pricing Model Research](../research/growth-pricing-research-2026-04.md#pricing-model-research).

---

### Retention data hooks (monthly digest, AVM refresh, alerts)

**Priority:** Very near-term — biggest structural retention gap

**Purpose:** Create automated reasons for users to return. Currently, once a user sets up properties, Veld has **zero outbound touchpoints** — no scheduled data refreshes, no email digests, no value change alerts. Stessa/Baselane pull users back via daily bank transaction sync; Veld needs an equivalent pull mechanism built on the data it already has.

**Phased rollout:**

| Phase | Hook | Effort | API cost |
|-------|------|--------|----------|
| 1 | **Monthly portfolio digest email** — equity, cash flow, cap rate, rent vs market summary per property. Resend already set up. | Low (cron + email template) | $0 — uses stored data |
| 2 | **Monthly property value re-fetch** — cron calls RentCast AVM for each paid user's properties, updates `currentEstimatedValue`, equity recalculates automatically. | Medium (cron + RentCast calls) | ~$44/mo at $1K MRR scale |
| 3 | **Value/equity change notification** — after monthly re-fetch, email if equity changed significantly. "Your portfolio equity grew $12,400 this month." | Low (diff + conditional email) | $0 — piggybacks on Phase 2 |
| 4 | **Rent vs market alert** — if property rent drops >5% below market, email actionable nudge. Infrastructure exists from dashboard benchmarking. | Low–Medium | Included in Phase 2 calls |
| 5 | **Mortgage milestone notifications** — "You crossed 50% LTV on Pine Cottage." Zero API cost, computed from existing amortization data. | Low | $0 |

**Research:** Full audit of current state, hook recommendations, RentCast cost analysis, and competitor comparison in [`docs/research/growth-pricing-research-2026-04.md` §Retention & Data Hooks](../research/growth-pricing-research-2026-04.md#retention--data-hooks).

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
| Automated testing (ongoing) | Done (ongoing) — Vitest, 50 test files, 374 tests across metrics, APIs, validators, calculators, components |

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
| **Wholesale / assignment** | ARV, MAO, fee → spread. |
| **STR vs LTR** | Bookings, occupancy, fees → vs long-term rent. — **Shipped** (`/tools/str-vs-ltr`, `/calculators/str-vs-ltr`). |
| **Rent vs buy** | Horizon + appreciation sanity check. |
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

**Current state (April 2026):** Vitest configured and running. **50 test files, 374 tests, all passing.** Coverage across metric calculations, amortization logic, API routes (auth, billing, CRUD, cron, import/export), validation schemas, calculator engines (BRRR, STR vs LTR, fix-and-flip), benchmark utilities, CSV parsing, and component tests (mobile shell, address autocomplete, add-property wizard).

**Ongoing:** Tests are added alongside new features. No separate "testing initiative" needed — treat as standard engineering practice.

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

## 6. Deferred (Validate First)

Defer until validated or user base justifies:

- **Interactive demo (no-signup required)** — Arcade.so or seeded demo account. Full brief in [`docs/research/interactive-demo-brief-2026-04.md`](../research/interactive-demo-brief-2026-04.md). Revisit after reverse trial and data hooks ship and there's enough traffic to justify the conversion optimization.
- **Plaid (bank integration)** — Cost scales with connected accounts (~$0.30–$1+/account/month). Legal/compliance for storing financial data. Development: 4–8 weeks for Liabilities-only. See `docs/plaid-considerations.md`.
- **Referral incentives** — Growth lever; validate with realtor feedback.
- **Advanced analytics** — Defer until core analytics proven.
- **Mobile app** — Defer until web usage justifies.
- **OAuth login, two-factor authentication** — Auth enhancements (mvp-spec).

**Shipped (reference):** Add-property / edit / property detail (Overview + Details) overhaul — Epics A–G complete; design and history in `docs/archive/proposals/add-property-experience-overhaul.md`. **Business & quality (Batch 8)** — PostHog, changelog, uptime — also complete; see `docs/tasks-archived.md` § **Tasks.md archive (2026-03-20)** and `docs/launch/launch-plan.md` §6. **Ongoing audits** follow cadence in `docs/audits/README.md` (not gated on the above).

---

## Workflow

1. **New idea** → Add to **§1a** if strategic, or the appropriate detailed section; avoid duplicating the same scope in two places.
2. **Ready to build** → PM promotes item to `docs/tasks.md` with concrete tasks and acceptance criteria.
3. **Builder** → Works from `docs/tasks.md`; references this doc for full scope when a task references a roadmap item.
4. **When done** → Mark item done in this doc (e.g. add to Completed table) and check off in `docs/tasks.md`.
