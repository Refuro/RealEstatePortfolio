# Veld Portfolio — Roadmap

**Purpose:** Canonical backlog of value-add features, initiatives, and long-term vision. The PM promotes items from here to `docs/tasks.md` when ready to build. The builder references this doc for scope and acceptance criteria when a task references a roadmap item.

---

## 1. Near-term (Prioritized Value-Add)

Post-MVP features in suggested order. Promote to `tasks.md` when ready to build.

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

### Mortgage balance advancement (Phase 1 — amortization projection + manual override) — **Shipped**

**Canonical status:** Listed as **Done** in `docs/tasks.md` (roadmap priority table: mortgage balance advancement — balance advancement, escrow, amortization fix, loan type import, chart tooltip).

**What shipped:**

- **Schema:** `Mortgage.balanceAsOfDate` (`DateTime?` @db.Date) in Prisma.
- **Lib:** `getProjectedBalanceAsOf`, `getEffectiveBalance`, `getBalanceSource` in `app/lib/amortization.ts` (stored balance when `balanceAsOfDate` is within six months of today; otherwise projected balance as of today).
- **Metrics & APIs:** Portfolio/property metrics, dashboard, properties list, property detail, export/import, and mortgage APIs use effective balance for equity/LTV/debt where applicable.
- **UI:** Mortgage forms include balance-as-of; property/mortgage surfaces show stored vs projected context; amortization/payoff flows use effective balance; chart schedule remains tied to original loan terms.

**Remaining / deferred (not Phase 1 blockers):**

- **Bank-led automation:** Plaid or similar — explicitly **out of scope** for Phase 1; see `docs/plaid-considerations.md`.
- **Roadmap follow-ups** elsewhere in this doc (e.g. benchmarking v2, property detail overhaul) are separate initiatives.

---

### Rent gap email notifications

**Priority:** 6 — *Deferred.* Cost scales with users; revisit when user base justifies.

**Scope:** Periodically compare stored rent to RentCast. If gap exceeds threshold (e.g. 10–15%), email user. Drives retention.

---

### Benchmarking — ✓ Done

**Scope:** "Your rent is X% above/below market" (RentCast). Surfacing on properties list, dashboard, inline refresh. See `docs/archive/proposals/benchmarking-surfacing-proposal.md`.

---

### Benchmarking v2: rental-status-aware comparison

**Priority:** 9

**Scope:** Refine benchmark semantics so rent-vs-market comparisons only show when the property is actively rented and rent is present. Avoid treating missing/non-rental states as meaningful benchmark percentages.

**Acceptance criteria:**

- [x] Add explicit rental-status input (initially boolean) to property create/edit flows and APIs.
- [x] Define one shared benchmark-eligibility contract used by dashboard, properties list, and property detail surfaces (`app/lib/benchmark-utils.ts`: `getBenchmarkEligibility`, `isBenchmarkComparable`, `shouldOfferBenchmarkRefresh`).
- [x] When property is not rented or effective rent is 0, hide percent comparison and show non-comparison status copy.
- [x] Treat `marketRent <= 0` consistently as benchmark missing across all surfaces (never "at market" from invalid market data).
- [x] Add/adjust tests for `not_rented`, rent missing/zero, benchmark stale, benchmark missing, and fresh benchmark states (`benchmark-utils.test.ts`).

---

### Dashboard — single-property improvements

**Priority:** 9

**Scope:** Improve dashboard for single-property users so they see charts and discover tools (equity, cash flow, value breakdown, property detail). See `docs/archive/proposals/dashboard-single-property-proposal.md` for all six items: show Equity & Cash flow charts, add View property path, value breakdown for debt vs. value, refine Add property CTA, contextual Quick actions, property page teaser.

---

### Refinance / payoff insights

**Priority:** 10

**Scope:** "When to refinance" or "Payoff timeline". See `docs/proposals/refinance-payoff-proposal.md` for phased approach (payoff timeline first, then accelerator, then refinance what-if) and property detail page considerations.

---

### Simulation page

**Priority:** 11

**Scope:** Full modeling page: adjust all inputs (rent, value, expenses, mortgage), add hypothetical property to portfolio, see impact on totals. Dense but powerful. Extends scenario concept.

---

### Report section (PDF/print portfolio summary)

**Priority:** 12

**Scope:** Professional output; share with partners/lenders.

---

### Referral system

**Priority:** 13

**Scope:** Growth lever. Defer until realtor validation positive.

---

### Admin membership override — ✓ Done

**Scope:** Admins can manually set a user's tier (e.g. free Pro for realtors/demo accounts). Bypasses Stripe; useful for partner accounts, demos, and goodwill. See `docs/archive/proposals/admin-membership-override-proposal.md`.

---

### Automated testing

**Priority:** 15

**Scope:** Larger planned effort. Configure test runner (Jest/Vitest), add unit tests for metric calculations and amortization logic, API route tests for auth-protected endpoints. Plan thoughtfully per engineering spec Module M.

---

### Error tracking (Sentry) — ✓ Done

**Scope:** Production error monitoring via Sentry. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel for production.

---

## 2. Medium-term (Larger Initiatives)

Not yet scheduled; captured as backlog. Promote to `tasks.md` when ready.

### Property detail page overhaul

**Scope:** Redesign the property detail page as a user-centric home base. Current page stacks many sections (property details, mortgages, metrics, scenarios, amortization); tools are easy to miss. Target: card-based layout, clearer section headers, better discoverability. Consider collapsible sections or progressive disclosure. See `docs/proposals/refinance-payoff-proposal.md` §7 for options and rationale.

---

### Property evaluation tool

Enter property specs (address, purchase price, estimated value, rent, expenses, mortgage terms, etc.) and get an evaluation of key statistics (cap rate, cash-on-cash, NOI, etc.) to help determine if it's a good investment. Useful for analyzing deals before adding them to the portfolio. May be a standalone "Evaluate" flow or a pre-add step.

### Visual refresh & unified aesthetic

Major face-lift to the site: improved visual fidelity, cohesive design system, and a unified aesthetic across all pages. Includes typography, color palette, spacing, component styling, and overall polish.

### Cashflow / profitability timeline simulator

Project cashflow and equity over time (5–30 years). Model rent escalation, expense inflation, and mortgage paydown to show how profitability evolves. Users can adjust inputs to explore scenarios and make decisions.

**Core (v1):** Single property; rent escalation, expense inflation, time horizon; monthly cashflow chart, equity chart, key milestones (e.g. year cashflow turns positive). **Always show the assumptions used** so users understand where numbers come from. Inputs editable so users can try different scenarios.

**Future expansion:** Portfolio view, refinance scenarios, sale scenarios, conservative vs. optimistic presets.

**UX:** Single view with essential inputs prominent; optional inputs (vacancy, appreciation, CapEx) in expandable "More assumptions" section. Avoid separate Simple/Advanced modes—one flexible view with clear organization and full transparency on assumptions.

### Mortgage payment history / snapshots

Monthly mortgage payments can change over time (e.g. annual escrow adjustments for taxes and insurance). Extend the snapshot model (PropertySnapshot or a new MortgageSnapshot) to store historical monthly payment values by date. Enables: accurate cash flow timelines, historical charts, and projections that account for payment changes. Complements the cashflow simulator and any future "payment as of date" feature.

---

## 3. External API Integration Opportunities

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

## 4. Long-term Vision

Future product direction (from mvp-spec):

- Automated property value updates
- Rent estimate tracking
- Refinance recommendations
- Portfolio optimization insights
- Deal analysis tools for new acquisitions

**Ultimate goal:** Create a **portfolio intelligence platform for real estate investors**.

---

## 5. Deferred (Validate First)

Defer until validated or user base justifies:

- **Plaid (bank integration)** — Cost scales with connected accounts (~$0.30–$1+/account/month). Legal/compliance for storing financial data. Development: 4–8 weeks for Liabilities-only. See `docs/plaid-considerations.md`.
- **Referral incentives** — Growth lever; validate with realtor feedback.
- **Advanced analytics** — Defer until core analytics proven.
- **Mobile app** — Defer until web usage justifies.
- **OAuth login, two-factor authentication** — Auth enhancements (mvp-spec).

**Shipped (reference):** Add-property / edit / property detail (Overview + Details) overhaul — Epics A–G complete; design and history in `docs/proposals/add-property-experience-overhaul.md`. **Business & quality (Batch 8)** — PostHog, changelog, uptime — also complete; see `docs/tasks-archived.md` § **Tasks.md archive (2026-03-20)** and `docs/launch/launch-plan.md` §6. **Ongoing audits** follow cadence in `docs/audits/README.md` (not gated on the above).

---

## Workflow

1. **New idea** → Add to this doc (appropriate section).
2. **Ready to build** → PM promotes item to `docs/tasks.md` with concrete tasks and acceptance criteria.
3. **Builder** → Works from `tasks.md`; references this doc for full scope when a task references a roadmap item.
4. **When done** → Mark item done in this doc (e.g. add to Completed table) and check off in `tasks.md`.
