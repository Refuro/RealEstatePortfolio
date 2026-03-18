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
| Admin membership override | Done |
| Error tracking (Sentry) | Done |

### Mortgage balance advancement (Phase 1 — amortization projection + manual override)

**Priority:** High — metrics drift without balance advancement.

**Scope:** Keep app focused on portfolio analytics (not property management). Mortgage balance drives equity, LTV, and debt metrics. Without advancement, these metrics drift over time as principal is paid down. Competitors either connect to banks (Plaid) or rely on manual updates. We implement a hybrid: amortization projection as default, with optional manual override when user has a statement.

**Approach:** Use existing amortization logic to project remaining balance from original loan, rate, term, start date. When user provides an actual balance + date, use that when recent; otherwise use projected. No bank connection in Phase 1.

**Acceptance criteria:**

- [ ] **Schema:** Add optional `balanceAsOfDate DateTime? @db.Date` to Mortgage model. Migration.
- [ ] **Lib:** Add `getProjectedBalanceAsOf(input: AmortizationInput, asOfDate: Date): number` in `lib/amortization.ts`. Returns balance at given date from schedule; returns 0 if asOfDate is before startDate.
- [ ] **Lib:** Add `getEffectiveBalance(mortgage)` in `lib/metrics/` or `lib/amortization.ts`: if `balanceAsOfDate` exists and is within 6 months of today, return `currentBalance`; else return projected balance as of today.
- [ ] **Metrics:** Update `lib/metrics/property-metrics.ts`, `portfolio-metrics.ts`, and all consumers (API routes, dashboard, properties list, property detail) to use `getEffectiveBalance` instead of raw `currentBalance` when computing totalMortgageBalance for equity/LTV/debt.
- [ ] **Mortgage form:** Add optional "Balance as of" date picker. When user updates current balance, encourage setting this date (or auto-set to today).
- [ ] **Mortgage display:** Show which source is used: "Balance: $X (as of [date])" when using stored; "Estimated balance: $X (from amortization — update from your statement for accuracy)" when using projected. Add subtle nudge to update when projected and balanceAsOfDate is missing or >6 months old.
- [ ] **Import/export:** Include `balanceAsOfDate` in export; support optional column in import. Existing mortgages: balanceAsOfDate null → use projected.
- [ ] **Amortization chart:** Continue using original loan for schedule (unchanged). Chart shows projected path; effective balance for metrics may differ if user overrode.
- [ ] Run `npm run check` when done.

**Out of scope (Phase 1):** Plaid/bank connection, transaction sync, automatic balance refresh. See `docs/plaid-considerations.md`.

---

### Rent gap email notifications

**Priority:** 6 — *Deferred.* Cost scales with users; revisit when user base justifies.

**Scope:** Periodically compare stored rent to RentCast. If gap exceeds threshold (e.g. 10–15%), email user. Drives retention.

---

### Benchmarking — ✓ Done

**Scope:** "Your rent is X% above/below market" (RentCast). Surfacing on properties list, dashboard, inline refresh. See `docs/benchmarking-surfacing-proposal.md`.

---

### Refinance / payoff insights

**Priority:** 10

**Scope:** "When to refinance" or "Payoff timeline".

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

**Scope:** Admins can manually set a user's tier (e.g. free Pro for realtors/demo accounts). Bypasses Stripe; useful for partner accounts, demos, and goodwill. See `docs/admin-membership-override-proposal.md`.

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

---

## Workflow

1. **New idea** → Add to this doc (appropriate section).
2. **Ready to build** → PM promotes item to `docs/tasks.md` with concrete tasks and acceptance criteria.
3. **Builder** → Works from `tasks.md`; references this doc for full scope when a task references a roadmap item.
4. **When done** → Mark item done in this doc (e.g. add to Completed table) and check off in `tasks.md`.
