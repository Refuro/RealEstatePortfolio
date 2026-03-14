# Real Estate Portfolio Intelligence — Engineering Backlog

## Purpose

This document expands the MVP specification into a concrete engineering backlog that can be used to guide implementation.

The product is a lightweight SaaS for **small real estate investors (1–20 properties)** to track portfolio performance, analyze returns, and understand their investment position.

---

# 1. Product Boundaries

## In Scope (MVP)

* User authentication
* Property CRUD
* Mortgage/loan data entry
* Portfolio dashboard
* Core investment metrics
* Basic charts/visualizations
* Subscription gating

## Out of Scope (MVP)

* Tenant management
* Rent collection
* Maintenance workflows
* MLS integration
* Automated valuation models
* Bookkeeping/accounting integrations
* Mobile app

---

# 2. Suggested Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Hook Form + Zod
* TanStack Query
* Recharts or Chart.js

## Backend

* Next.js Route Handlers or standalone Node API
* TypeScript
* Prisma ORM

## Database

* PostgreSQL

## Auth

* Clerk or Supabase Auth

## Payments

* Stripe

## Hosting

* Vercel
* Neon / Supabase / Railway for PostgreSQL

---

# 3. Core Domain Model

## User

Fields:

* id
* email
* created_at
* updated_at
* subscription_tier
* stripe_customer_id

## Property

Fields:

* id
* user_id
* nickname
* address_line_1
* address_line_2
* city
* state
* zip_code
* property_type
* units
* purchase_price
* purchase_date
* current_estimated_value
* current_monthly_rent
* current_monthly_expenses
* cash_invested (down payment + closing costs, for cash-on-cash return)
* notes
* created_at
* updated_at

## Mortgage

Fields:

* id
* property_id
* original_loan_amount
* current_balance
* interest_rate
* term_years
* start_date
* monthly_payment
* escrow_included
* lender_name
* loan_type
* created_at
* updated_at

## PropertySnapshot (optional but useful)

Fields:

* id
* property_id
* snapshot_date
* estimated_value
* monthly_rent
* monthly_expenses
* balance

## Subscription / Billing

Fields:

* id
* user_id
* stripe_subscription_id
* status
* plan_name
* current_period_end

---

# 4. Functional Modules

## Module A — Authentication

Goal: allow secure account creation and login.

### Tasks

1. Choose auth provider (Clerk or Supabase Auth).
2. Configure auth in app.
3. Add signup page.
4. Add login page.
5. Add logout functionality.
6. Add authenticated route protection.
7. Add user record sync to database on signup.
8. Add session-aware layout and nav.

### Acceptance Criteria

* User can sign up.
* User can log in and log out.
* Protected routes redirect unauthenticated users.

---

## Module B — App Shell / Layout

Goal: provide stable application structure.

### Tasks

1. Create root layout.
2. Build app navigation sidebar/topbar.
3. Add dashboard route.
4. Add properties route.
5. Add settings/billing route.
6. Add loading and empty states.
7. Add error boundary handling.

### Acceptance Criteria

* Logged-in users can navigate app routes.
* App has consistent layout and styling.

---

## Module C — Database Setup

Goal: create initial schema and migrations.

### Tasks

1. Initialize Prisma.
2. Create User model.
3. Create Property model.
4. Create Mortgage model.
5. Create Billing/Subscription model.
6. Add timestamps to all relevant models.
7. Run first migration.
8. Seed local dev data.

### Acceptance Criteria

* Database migrations run cleanly.
* Local seed data supports UI development.

---

## Module D — Property CRUD

Goal: allow users to create and manage properties.

### Tasks

1. Design property creation form.
2. Add form validation with Zod.
3. Create POST `/api/properties`.
4. Create GET `/api/properties`.
5. Create GET `/api/properties/:id`.
6. Create PATCH `/api/properties/:id`.
7. Create DELETE `/api/properties/:id`.
8. Build property list page.
9. Build property detail page.
10. Build property edit form.
11. Add optimistic refresh/query invalidation.

### Acceptance Criteria

* User can create, edit, view, and delete properties.
* Property data persists correctly per user.

---

## Module E — Mortgage CRUD

Goal: attach financing details to properties.

### Tasks

1. Design mortgage input form.
2. Add validation rules.
3. Create POST `/api/properties/:id/mortgage`.
4. Create GET mortgage endpoint.
5. Create PATCH mortgage endpoint.
6. Create DELETE mortgage endpoint.
7. Show mortgage details on property detail page.

### Acceptance Criteria

* Each property can have mortgage data attached and updated.

---

## Module F — Metrics Engine

Goal: compute investment and portfolio metrics.

### Property-Level Calculations

* Gross annual rent
* Annual expenses
* NOI
* Cap rate
* Monthly cash flow
* Annual cash flow
* Equity
* Loan-to-value
* Cash-on-cash return

### Portfolio-Level Calculations

* Total market value
* Total debt
* Total equity
* Total monthly rent
* Total monthly expenses
* Total monthly cash flow
* Weighted cap rate
* Portfolio LTV

### Tasks

1. Create pure utility functions for property metrics.
2. Create pure utility functions for mortgage metrics.
3. Create pure utility functions for portfolio aggregation.
4. Add unit tests for all calculations.
5. Create API endpoint for portfolio metrics.
6. Create API endpoint for single-property metrics.

### Acceptance Criteria

* Metrics are deterministic and tested.
* Portfolio summary updates correctly when property data changes.

---

## Module G — Mortgage Amortization Logic

Goal: provide loan timeline and remaining balance calculations.

### Tasks

1. Implement amortization schedule generator.
2. Compute principal vs interest split by month.
3. Compute projected remaining balance over time.
4. Add utility test coverage for schedule logic.
5. Add endpoint to fetch amortization schedule for a property.

### Acceptance Criteria

* Amortization schedule renders correctly for standard fixed-rate loans.

---

## Module H — Dashboard UI

Goal: display portfolio health at a glance.

### Components

* Summary metric cards
* Portfolio cash flow card
* Equity card
* LTV card
* Cap rate card
* Properties table/list
* Quick actions section

### Tasks

1. Build dashboard metric card components.
2. Build portfolio summary section.
3. Build property table/list widget.
4. Display aggregate metrics from API.
5. Build empty-state dashboard for new users.
6. Add loading skeletons.

### Acceptance Criteria

* Dashboard shows accurate summary values.
* Empty portfolios show guided onboarding state.

---

## Module I — Charts / Visualization

Goal: make portfolio trends understandable.

### Initial Charts

* Portfolio equity by property
* Portfolio debt vs value
* Monthly cash flow by property
* Mortgage amortization chart

### Tasks

1. Select chart library.
2. Build reusable chart wrapper.
3. Add equity breakdown chart.
4. Add debt vs value chart.
5. Add cash flow comparison chart.
6. Add amortization line chart.
7. Ensure charts handle empty/zero states.

### Acceptance Criteria

* Charts are readable and responsive.
* Data displayed matches metrics engine.

---

## Module J — Subscription / Billing

Goal: monetize the product and enforce usage limits.

### Suggested Plans

* Free: 1 property
* Investor: 5 properties
* Pro: 20 properties

### Tasks

1. Create Stripe products and prices.
2. Add pricing page.
3. Add checkout flow.
4. Add Stripe webhook handling.
5. Sync subscription status to database.
6. Enforce property count limits by plan.
7. Add upgrade/downgrade UI.
8. Add billing portal access.

### Acceptance Criteria

* Users can subscribe.
* Plan-based limits are enforced.
* Billing state persists correctly.

---

## Module K — Onboarding

Goal: help users reach value quickly.

### Tasks

1. Add welcome/onboarding screen.
2. Ask user how many properties they own.
3. Prompt user to add first property.
4. Add example metric explanations.
5. Add sample data mode or demo portfolio (optional).

### Acceptance Criteria

* New users can reach the first useful dashboard state quickly.

---

## Module L — Settings / Account

Goal: basic account management.

### Tasks

1. Create account settings page.
2. Add profile info display.
3. Add plan/billing section.
4. Add data export placeholder (future-friendly).
5. Add delete account flow placeholder.

### Acceptance Criteria

* User can view account and plan information.

---

## Module M — Testing

Goal: prevent metric and data bugs.

### Tasks

1. Configure test runner.
2. Add unit tests for metric calculations.
3. Add unit tests for amortization logic.
4. Add API route tests for auth-protected endpoints.
5. Add smoke tests for dashboard rendering.
6. Add form validation tests.

### Acceptance Criteria

* Calculation functions have strong test coverage.
* Core API routes are protected and stable.

---

## Module N — Developer Experience / Ops

Goal: make development sustainable.

### Tasks

1. Configure ESLint.
2. Configure Prettier.
3. Configure TypeScript strict mode.
4. Add `.env.example`.
5. Add README setup instructions.
6. Add database reset/seed scripts.
7. Add CI checks (lint/test/build).

### Acceptance Criteria

* Project can be set up cleanly by another developer.
* CI catches major errors before deploy.

---

# 5. API Backlog

## Auth-Adjacent

* `GET /api/me`

## Properties

* `GET /api/properties`
* `POST /api/properties`
* `GET /api/properties/:id`
* `PATCH /api/properties/:id`
* `DELETE /api/properties/:id`

## Mortgages

* `GET /api/properties/:id/mortgage`
* `POST /api/properties/:id/mortgage`
* `PATCH /api/properties/:id/mortgage`
* `DELETE /api/properties/:id/mortgage`

## Metrics

* `GET /api/portfolio/summary`
* `GET /api/properties/:id/metrics`
* `GET /api/properties/:id/amortization`

## Billing

* `POST /api/billing/create-checkout-session`
* `POST /api/billing/webhook`
* `GET /api/billing/status`

---

# 6. Calculation Backlog

## Property Metrics Formula List

### Gross Annual Rent

`monthly_rent * 12`

### Annual Expenses

`monthly_expenses * 12`

### NOI

`gross_annual_rent - annual_expenses`

### Cap Rate

`NOI / current_estimated_value`

### Monthly Cash Flow

`monthly_rent - monthly_expenses - monthly_payment`

### Annual Cash Flow

`monthly_cash_flow * 12`

### Equity

`current_estimated_value - current_balance`

### Loan-to-Value

`current_balance / current_estimated_value`

### Cash-on-Cash Return

`annual_cash_flow / cash_invested`

> Note: `cash_invested` may need to be added in a future schema update if you want accurate CoC return.

---

# 7. UX Backlog

## Key Screens

1. Landing page / marketing page
2. Login / signup
3. Onboarding
4. Dashboard
5. Properties list
6. Property detail
7. Add/edit property modal/page
8. Billing/pricing page
9. Settings page

## UX Priorities

* Minimal friction
* Spreadsheet replacement feel
* Simple investor language
* Useful defaults
* Clear metric explanations

---

# 8. Prioritized Build Order

## Phase 0 — Foundation

* Repo setup
* Auth setup
* Database schema
* App shell/layout

## Phase 1 — Core Data Entry

* Property CRUD
* Mortgage CRUD

## Phase 2 — Value Creation

* Metrics engine
* Dashboard summary
* Property detail calculations

## Phase 3 — Visualization

* Charts
* Amortization timeline

## Phase 4 — Monetization

* Stripe
* Property caps by plan

## Phase 5 — Polishing

* Onboarding
* Settings
* Error handling
* Better empty states

---

# 9. First 2-Week Sprint Suggestion

## Sprint Goal

Get to a working authenticated app where a user can add properties and see a basic portfolio summary.

### Sprint Tasks

1. Initialize Next.js + TypeScript + Tailwind.
2. Set up Prisma + PostgreSQL.
3. Set up authentication.
4. Build app shell/layout.
5. Create Property model and migration.
6. Build property create/edit form.
7. Build property list page.
8. Build GET/POST/PATCH/DELETE property endpoints.
9. Build summary calculation utilities.
10. Render dashboard cards using property data.

### Sprint Deliverable

A user can:

* sign up
* log in
* add properties
* see total portfolio value, debt, equity, and monthly cash flow

---

# 10. Second Sprint Suggestion

## Sprint Goal

Add mortgage details and meaningful investor analytics.

### Sprint Tasks

1. Create Mortgage model.
2. Add mortgage form and endpoints.
3. Implement amortization utilities.
4. Add cap rate / cash flow / LTV calculations.
5. Build property detail page.
6. Add at least 2 charts.
7. Add unit tests for calculations.

### Sprint Deliverable

User can analyze each property and understand financing impact.

---

# 11. Nice-to-Have Post-MVP Features

* Import from CSV
* Property snapshot history
* Manual transaction log
* Refinance scenario calculator
* Rent estimate API integration
* Property valuation integration
* Deal analyzer for new acquisitions
* “Next best action” investor insights
* Portfolio stress testing

---

# 12. Technical Risks

## Risk 1 — Overbuilding too early

Mitigation:

* Keep MVP focused on portfolio analytics only.

## Risk 2 — Complex financial edge cases

Mitigation:

* Support standard fixed-rate mortgages first.

## Risk 3 — Weak product differentiation

Mitigation:

* Focus on small-investor analytics, not property management.

## Risk 4 — Billing complexity

Mitigation:

* Keep plan logic simple and usage-based only on property count.

---

# 13. Product Principles

1. **Investor-first, not property-manager-first**
2. **Simple beats comprehensive for MVP**
3. **Manual input is acceptable early**
4. **Metrics must be correct and explainable**
5. **Every screen should answer: “How is my portfolio doing?”**

---

# 14. Definition of MVP Complete

The MVP is complete when a user can:

* create an account
* add at least one property
* attach mortgage data
* view property-level metrics
* view portfolio-level metrics
* view basic charts
* upgrade to a paid tier if they exceed free-tier limits

---

# 15. Immediate Next Actions

1. Finalize stack choices.
2. Create repository.
3. Create initial Prisma schema.
4. Set up auth.
5. Build property CRUD.
6. Build first dashboard summary cards.

---

# 16. Optional Future Repo Structure

```text
/apps/web
  /app
  /components
  /lib
  /api
  /types
  /hooks
/prisma
  schema.prisma
/docs
  mvp-spec.md
  backlog.md
```

---

# 17. Open Questions to Resolve Early

* Will the MVP support only single-family rentals at first, or multi-family too? 
  ANSWER: Single-Family to start, but leave it open-ended for multi-family.
* Do you want to track cash invested / down payment in v1 for better cash-on-cash returns?
  ANSWER: Yes
* Should property values be fully manual in v1?
  ANSWER: Yes
* Should expenses be a single monthly number at first, or broken into categories?
  ANSWER: Single for now, keep it expandable for later, don't code it into a corner
* Should one property support multiple loans in the future?
  FOLLOWUP: Is this common enough that we should support it right away?
  ANSWER: No for MVP. The schema already supports it (Mortgage has `property_id` → one property, many mortgages). Build the metrics engine to *aggregate* across all mortgages for a property (sum `current_balance`, sum `monthly_payment`) from day one. Ship the UI with one mortgage per property. Adding a second loan later is then schema-ready and only requires UI + validation.

---

# 17.1 Schema / Scope Decisions (from §17)

* **Property type:** Single-family at first; keep `property_type` / `units` so multi-family is additive later.
* **Cash invested:** Add to schema in v1 (e.g. `cash_invested` or `down_payment` on Property) for accurate cash-on-cash return.
* **Property values:** Manual only in v1.
* **Expenses:** Single `current_monthly_expenses` for now; avoid hardcoding categories so breakdown can be added later.
* **Multiple loans:** Supported in data model; metrics aggregate per property; MVP UI = one mortgage per property.

---

# 18. Suggested Short-Term Build Philosophy

Build the smallest version that would already be useful for your own rental property tracking.

If you would personally stop using your spreadsheet in favor of the app, the MVP is on the right path.

---

# 19. Scalability & Build Strategy

The plan is set up to build in a **smart, scalable** way:

**Data & schema**
* Normalized core models (User → Property → Mortgage) with clear ownership; no premature denormalization.
* Schema already allows multiple mortgages per property and optional PropertySnapshot; v1 uses a subset without painting into a corner.
* Additive fields (`property_type`, `units`, `cash_invested`, single expenses) keep the door open for multi-family, categories, and better CoC without rewrites.

**Application & API**
* Stateless, REST-style API and serverless-friendly stack (Next.js on Vercel, serverless DB) scale horizontally with traffic.
* Metrics as **pure functions** over property/mortgage data make logic testable and reusable (API, background jobs, or future edge/caching layers).
* Modular backlog (A–N) and phased build order reduce coupling and allow incremental delivery.

**Product & business**
* Clear MVP boundaries and plan-based limits (property count) give a simple growth lever and predictable usage.
* Subscription and user-scoped data from day one avoid a later “bolt-on” billing or multi-tenant migration.

**Risks to watch**
* Keep aggregation logic (portfolio sums, per-property metrics) in one place so multi-loan and future snapshot logic stay consistent.
* When adding features (e.g. expense categories), extend schema and APIs incrementally rather than big-bang rewrites.

Overall: the plan supports **incremental, scalable** building—ship a narrow v1, then extend schema, metrics, and UI without redoing the foundation.

---

# 20. Planned Features (Post-MVP)

Larger initiatives beyond the current phase. Not yet scheduled; captured here as a backlog of planned work.

## Property evaluation tool

Enter property specs (address, purchase price, estimated value, rent, expenses, mortgage terms, etc.) and get an evaluation of key statistics (cap rate, cash-on-cash, NOI, etc.) to help determine if it's a good investment. Useful for analyzing deals before adding them to the portfolio. May be a standalone "Evaluate" flow or a pre-add step.

## Visual refresh & unified aesthetic

Major face-lift to the site: improved visual fidelity, cohesive design system, and a unified aesthetic across all pages. Includes typography, color palette, spacing, component styling, and overall polish.

## Cashflow / profitability timeline simulator

Project cashflow and equity over time (5–30 years). Model rent escalation, expense inflation, and mortgage paydown to show how profitability evolves. Users can adjust inputs to explore scenarios and make decisions.

**Core (v1):** Single property; rent escalation, expense inflation, time horizon; monthly cashflow chart, equity chart, key milestones (e.g. year cashflow turns positive). **Always show the assumptions used** so users understand where numbers come from. Inputs editable so users can try different scenarios.

**Future expansion:** Portfolio view, refinance scenarios, sale scenarios, conservative vs. optimistic presets.

**UX:** Single view with essential inputs prominent; optional inputs (vacancy, appreciation, CapEx) in expandable "More assumptions" section. Avoid separate Simple/Advanced modes—one flexible view with clear organization and full transparency on assumptions.

## Mortgage payment history / snapshots

Monthly mortgage payments can change over time (e.g. annual escrow adjustments for taxes and insurance). Extend the snapshot model (PropertySnapshot or a new MortgageSnapshot) to store historical monthly payment values by date. Enables: accurate cash flow timelines, historical charts, and projections that account for payment changes. Complements the cashflow simulator and any future "payment as of date" feature.

---

# 21. External API Integration Opportunities

Ways to enhance UX by pulling data from third-party APIs. MLS excluded (expensive, legal barriers). Existing mentions: mvp-spec §Optional Post-MVP Integrations; engineering-spec §11 Nice-to-Have.

## 1. Address validation & confirmation

**Purpose:** Normalize and validate addresses as users type; reduce bad data.

**APIs:** USPS Address Validation (free for US), Smarty (SmartyStreets), Google Places Autocomplete, Mapbox Geocoding.

**UX:** Autocomplete, suggested corrections ("Did you mean…?"), lat/lng for future map use.

## 2. Rental estimates

**Purpose:** Suggest rent when adding a property or in the property evaluation tool.

**APIs:** RentCast, Rentometer, HouseCanary (often paid).

**UX:** "Estimated rent: $2,200/mo" as a hint; user can accept or override.

## 3. Property valuation (AVM)

**Purpose:** Suggest estimated value.

**APIs:** HouseCanary, Clear Capital, ATTOM (often paid). Zillow public API deprecated.

**UX:** "Estimated value: $280,000" as a starting point; user can override.

## 4. Geocoding / maps

**Purpose:** Map view of portfolio, distance/area context.

**APIs:** Mapbox, Google Maps.

**UX:** Map of properties, clustering, spatial context.

## 5. Market trends

**Purpose:** Market-level context for portfolio.

**APIs:** Census, FHFA House Price Index.

**UX:** "Market up 5% YoY" or similar context.

## 6. Walk Score / neighborhood

**Purpose:** Walkability, transit, neighborhood context.

**APIs:** Walk Score API.

**UX:** Extra context for property evaluation.

## 7. Mortgage rates (refinance / evaluation)

**Purpose:** Current rate context for refinance scenarios.

**APIs:** Freddie Mac PMMS, Federal Reserve.

**UX:** "Current 30-year rate: 6.5%" in evaluation or refinance flows.

---

## Suggested priority (cost vs. value)

| Priority | API type | Cost / complexity | UX impact |
|----------|----------|------------------|-----------|
| High | Address validation | Low (USPS free) | Fewer bad addresses, better data |
| High | Rental estimates | Medium | Strong for property evaluation |
| Medium | Geocoding / maps | Medium | Map view, clearer context |
| Medium | Market trends | Low (Census/FHFA) | Portfolio-level context |
| Lower | AVM valuation | High | Nice-to-have; manual value works |
| Lower | Walk Score | Low–medium | Extra context for evaluation |
