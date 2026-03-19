# Archived tasks (completed)

**Purpose:** Historical record of completed tasks. Kept for reference; see `docs/tasks.md` for current tasks and roadmap.

**Archived:** 2025-03-15 — Moved from tasks.md to reduce file size and improve readability.

---

## Website performance optimization ✓

**Scope:** Improve load times and reduce bundle size without breaking any functionality.

**Phase 1 — Remove or narrow `force-dynamic`:**
- [x] Investigate, remove from root layout, verify build
- [x] Auth intact; public page content correct; `npm run check` passes

**Phase 2 — Lazy-load Recharts:** ✓ Done (dashboard-charts, amortization-chart-dynamic)

**Phase 3 — Additional optimizations:** ✓ Done (optimizePackageImports, preconnect, static assets audit)

---

## App layout performance ✓

- [x] getAppUser wrapped in React `cache()`
- [x] Layout counts and subscription cached with `unstable_cache` (30s)

---

## Settings — defer Stripe sync ✓

- [x] Stripe moved to client; `GET /api/billing/subscription-details`; `SubscriptionBillingDisplay` with loading state

---

## Code audit follow-ups ✓

- [x] Task A: Mobile nav shadow (verified compliant)
- [x] Task B: force-dynamic comment in `(app)/layout.tsx`
- [x] Task C: Zod validation for create-checkout-session

---

## Landing page overhaul + branding + SEO ✓

**Phases 1–4:** Stripe compliance, Veld branding, landing overhaul, SEO, public mobile optimization, contact page — all done.

---

## Builder tasks (all completed)

- [x] Next.js middleware → proxy
- [x] Fix lint errors
- [x] Standardize state field
- [x] Property type and units
- [x] Mortgage section input text color
- [x] Interest rate as percent
- [x] Loan type enum
- [x] Partial ownership support
- [x] Dark/light mode toggle
- [x] Mortgage payment effective date
- [x] Annual billing option
- [x] Readability and space pass
- [x] Sidebar uplift
- [x] Pricing page: show prices and incentivize annual
- [x] Dashboard: single-property view
- [x] Responsive layout for wide screens
- [x] Properties page overhaul
- [x] Add Property guided flow (wizard)
- [x] Property detail page readability
- [x] Mobile responsive layout (hamburger + slide-out drawer)
- [x] Mobile-friendly input attributes
- [x] Onboarding (welcome + first property prompt + metric help)
- [x] Data export (CSV)
- [x] Delete account (soft delete + restore)
- [x] Permanent account deletion (GDPR/CCPA)
- [x] Rent estimate integration (RentCast)
- [x] Add Property wizard: tabbing and Enter-key UX
- [x] Per-unit rent + optional property details
- [x] RentCast unit mix fix
- [x] Additional property types (Condo, Townhouse, Manufactured, Apartment)
- [x] Admin dashboard
- [x] Add Property draft save / unsaved changes guard
- [x] Security: headers + rate limiting

---

## New tasks (completed)

- [x] Dashboard enhancements (diverging bar, cash-on-cash, NOI, metric help)
- [x] Ownership % audit + display options
- [x] Ownership display mode toggle (Phase 2)
- [x] Vacancy assumption
- [x] Scenario modeling
- [x] Data staleness nudges
- [x] CSV import
- [x] Property value estimate (RentCast AVM)
- [x] Deal analyzer / scratchpad
- [x] Save potential deals
- [x] Import CSV: selection when over limit
- [x] Deal limits visibility + Pro limit bump
- [x] View deal → Analyze with prefill

---

## Membership lapse handling ✓

- [x] Full hardening (over-limit restriction, banner, re-sync, past_due banner, block messaging)
- [x] Cancel-at-period-end confirmation
- [x] Permanent delete server-side confirmText
- [x] Extract formatCurrency to lib
- [x] Move import parsing to lib
- [x] Reduce modal shadows
- [x] Resolve Prisma `any` in settings
- [x] Zod for account delete routes
- [x] Extract MetricCard to shared component
- [x] Block API access for deleted users
- [x] Env validation at startup
- [x] Accessibility pass

---

## Open tasks batch 2025-03-15 (verified complete)

All tasks in this batch were verified implemented and marked complete:

- [x] Mortgage balance advancement (Phase 1) — balanceAsOfDate, getEffectiveBalance, getBalanceSource, all consumers updated
- [x] Escrow amount for accurate balance projection — getPiForAmortization, P&I-only amortization when escrow set
- [x] Import template — add original loan amount
- [x] Monthly rent display — simplify for single-unit (property detail, add-property-wizard)
- [x] Import — add loan type
- [x] Amortization chart — tooltip month/year
- [x] Amortization schedule — fix steep dropoff at end of term
- [x] RentCast rate limits — plan-based per-hour (5/10/20)
- [x] RentCast rate limit — user-facing messaging (text-negative)
- [x] Benchmarking — rent vs market (schema, API, refresh, property detail)
- [x] Estimate buttons — disable when value matches last estimate
- [x] Benchmarking surfacing — Option A (benchmark line on cards), Option C (dashboard section)
- [x] Dashboard — integrate Rent vs. market into Property at a glance (single property)
- [x] Benchmark refresh — inline "Refresh estimate" button
- [x] Admin membership override — subscriptionTierOverride, getEffectiveTier, admin UI
- [x] Settings — show override status in Plan & billing
- [x] Sentry error tracking

---

## Payoff timeline Phase 1 (2026-03-13) ✓

**Proposal:** `docs/refinance-payoff-proposal.md`

- [x] `getPayoffProjection(mortgage)` in lib/amortization.ts — projects from effective balance, returns payoff date or remaining at term end
- [x] Mortgage section payoff insight per mortgage — "At your current payment, you'll pay off in X years (around Month Year)" or remaining at term end
- [x] Balance source copy — "Based on stored balance as of [date]" / "Using projected balance from amortization"
- [x] Section heading "Mortgages & payoff"
- [x] Edge cases — no mortgages, invalid data, paid off
- [x] Disclaimer — "Estimates for informational purposes only. Not financial advice."

---

## Payoff Accelerator Phase 2 (2026-03-13) ✓

**Proposal:** `docs/refinance-payoff-proposal.md` §3.2

- [x] `getExtraPaymentForYearsEarlier(mortgage, yearsEarlier)` — binary search for extra monthly payment
- [x] `getPayoffYearsWithExtra(mortgage, extraPayment)` — reverse: given extra, show payoff years
- [x] Years-earlier selector (5, 10, 15) — only options where yearsEarlier < current payoff years
- [x] Extra monthly payment input — user enters $, shows "Pay off in X years"
- [x] Edge cases — hidden when payment doesn't amortize, paid off, or invalid

---

## Dashboard single-property overhaul (2025-03-13) ✓

**Proposal:** `docs/dashboard-single-property-proposal.md`

- [x] Equity & Cash flow charts for single property (one bar each)
- [x] "View property" path in Property at a glance
- [x] Value breakdown (stacked bar: debt + equity) for single-property
- [x] Refined "Add another property" CTA with benefit copy
- [x] Contextual Quick actions (View property / View all; Analyze a deal)
- [x] "What's on property page" teaser

---

## Dashboard overhaul — single vs multi (2025-03-13) ✓

**Proposal:** `docs/dashboard-single-property-proposal.md` (revised)

- [x] Inline value bar in Property at a glance (debt + equity stacked bar)
- [x] Hide Portfolio charts section for single-property (no Equity, Debt vs. value, Cash flow)
- [x] Fix Cash flow chart for multi-property (formatCurrency, symmetric domain for negatives)
- [x] Consolidate add-property messaging (one card, no redundant text)

---

## Dashboard — restore metrics + Rent vs. Market auto-refresh (2026-03) ✓

**Single-property:**
- [x] Restore Cap rate, LTV, NOI, Cash-on-cash in Property at a glance (hidden metric row)
- [x] Add Annual rent, DSCR; DSCR color when < 1.0
- [x] Teaser link "See amortization, scenarios & more →" (differentiated from "View property")
- [x] Rent vs. market col-span-2 for wider display

**Multi-property:**
- [x] Rent vs. Market auto-refresh — show all properties; background refresh for stale/missing
- [x] "Unable to refresh" on API failure; parallel refreshes; rate limit applies
- [x] Serialize properties for client (Decimal → number) to fix Server/Client boundary error

---

*Full implementation details available in git history. This archive summarizes completed work for reference.*

---

## Archive sync (2026-03-19) ✓

Moved from `docs/tasks.md` to reduce noise in active task tracking.

### Recently completed notes (moved) ✓

- [x] Projections tab accuracy hardening summary + AC status notes.
- [x] Property detail overhaul phase summaries (Phase 1/2/3).
- [x] Multi-property Rent vs. Market auto-refresh summary.
- [x] Single-property dashboard restore-metrics summary.

### Property detail overhaul — test checklist (verified complete) ✓

- [x] Hero & layout checks complete.
- [x] Investment metrics checks complete.
- [x] Scenario controls/reset/help checks complete.
- [x] Payoff card + accelerator + balance-source checks complete.
- [x] Collapsible sections behavior checks complete.
- [x] Regression checks complete (edit/delete/add mortgage, amortization, benchmark refresh).
- [x] Mobile checks complete.
- [x] Edge-case checks complete (no mortgage, paid-off, multiple mortgages).
- [x] Phase 2 sticky-nav checks complete.
- [x] Phase 3 amortization sub-page + quick-actions checks complete.

### Property detail tabs & UX refinements — test checklist (verified complete) ✓

- [x] Refresh benchmark AC-1..AC-4 checks complete.
- [x] Duplicate metrics AC-5..AC-6 checks complete.
- [x] Tabs AC-7..AC-9 checks complete.
- [x] Overview tab AC-10..AC-13 checks complete.
- [x] Mortgage tab AC-14..AC-17 checks complete.
- [x] Projections tab AC-18..AC-22 checks complete.
- [x] Details tab AC-23..AC-25 checks complete.
- [x] No-regressions AC-26..AC-28 checks complete (`npm run check` passed).

### Details tab — Phase B inline editing (moved) ✓

- [x] Inline edit mode for Property facts.
- [x] Inline edit mode for Financial inputs.
- [x] Inline edit mode for Notes.
- [x] Section saves wired to `PATCH /api/properties/[id]` + refresh on success.
- [x] In-card validation/save error handling.
- [x] Existing full-page edit flow preserved.
- [x] `npm run check` passed.

### Completed batch ledger moved from `tasks.md` (2026-03-19) ✓

All batches below were fully checked off in `tasks.md` and moved to keep active tracking concise:

- [x] Onboarding + Dashboard polish split (Batch 1-3)
- [x] Modeling workspace revamp (Batch A-I)
- [x] Mortgage workspace revamp (Batch M1-M8)
- [x] Properties page overhaul (Batch P1, P2, P2.1)
- [x] Analyze deal overhaul (Batch A1-A5)
- [x] Plans page overhaul `/plans` (Batch PL1-PL4)
- [x] Public pricing overhaul `/pricing` (Batch PR1-PR4)
- [x] Owner notes follow-up (Batch ON1, ON2, ON3, ON3B, ON4)
- [x] Onboarding scope correction (activation-first)

### Legacy completed summary moved from `tasks.md` (2026-03-19) ✓

- [x] Completed (verified — smoke test passed 2025-03-15) summary block moved.
- [x] Mortgage estimate & polish summary moved.
- [x] Batch verified 2025-03-15 summary moved.
- [x] Code audit follow-ups (2026-03-17) summary moved.
- [x] Date fields (2026-03-17) summary moved.
- [x] Payoff timeline Phase 1 summary moved.
- [x] Payoff Accelerator Phase 2 summary moved.
- [x] Dashboard single-property overhaul summary moved.
- [x] Dashboard overhaul — single vs multi summary moved.
