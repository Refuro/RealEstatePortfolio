# Archived tasks (completed)

**Purpose:** Historical record of completed tasks. Kept for reference; see [`docs/tasks.md`](tasks.md) for the **current backlog stub** and roadmap table. Full checked-off detail (batches 1–8, test infra, add-property epics) lives in **Tasks.md archive (2026-03-20)** below.

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

---

## Tasks.md archive (2026-03-20)

Moved from [`docs/tasks.md`](tasks.md) to keep the active agent task file short. Includes **Completed: test infrastructure & hooks**, **Audit synthesis** intro, **Batches 1–8** (numbered batches, not the older workspace batches), and add-property **Epics A–G** — all checked. **New work** is added only under **Current product backlog** in `tasks.md`.

## Completed: test infrastructure & hooks

### Test infrastructure follow-up (Phase 1 & 2)

*Source: [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §8. **Do Phase 1 first** (CI + docs), then Phase 2 (fixtures + deeper tests). PM assigns builder per phase or per bullet.*

#### Phase 1 — Trust and CI hardening (P0)

- [x] **CI: run ESLint** — In `.github/workflows/ci.yml`, add a step after `npm ci` (from `app/`): `npm run lint`. Fix all errors that fail the job (or narrow rules only with documented rationale).
  - *Acceptance:* CI runs lint on every trigger; green means tests **and** lint pass; update `qa/test-infrastructure-review.md` §10 change log when done.

- [x] **CI: build strategy** — Either (A) add `npm run build` in CI with required secrets in GitHub Actions, or (B) document in `qa/test-infrastructure-review.md` why build is not in CI (e.g. secrets only on Vercel) and keep build as a manual release gate via `pm-review-checklist.md`.
  - *Acceptance:* Chosen option is documented; no ambiguity for “green merge” vs deploy.

- [x] **Pre-push / smoke doc** — Update [`docs/setup/run-and-smoke-test.md`](setup/run-and-smoke-test.md) with a **Before push** subsection: recommended `npm run test` and `npm run lint` from `app/`; link to `qa/test-infrastructure-review.md` and `.github/workflows/ci.yml`.
  - *Acceptance:* Developers can follow one doc for local checks + understand CI parity.

#### Phase 2 — Math and domain depth (P1)

- [x] **Golden fixtures (metrics)** — Add shared fixtures (e.g. `app/lib/test/fixtures/metrics-golden.ts`) with inputs → expected NOI, cap rate, cash flow, LTV, and at least one **multi-property** portfolio aggregate; reference [`policies/ownership-metrics.md`](policies/ownership-metrics.md) in file or test comments.
  - *Acceptance:* Vitest uses fixtures; `npm run test` passes; PM can verify numbers against policy tables.

- [x] **Amortization coverage gap closure** — Audit `lib/amortization.ts` helpers used by mortgage/amortization UI; add tests for any high-risk gap called out in `qa/test-infrastructure-review.md` §4.2, or document deferral in the review doc.
  - *Acceptance:* Review doc §4.2 updated; new tests or explicit “deferred” list.

- [x] **API tests: plan limit (403)** — Add Vitest route tests (mocked `getActiveAppUser` + Prisma + `@/lib/plans` or tier/count) for `POST /api/properties` and `POST /api/deals` when limit reached (`PLAN_LIMIT_REACHED`).
  - *Acceptance:* At least one 403 case per route; pattern documented in `proposals/testing-implementation-plan.md` or review doc.

### Git hooks — Husky (optional Phase 3)

*Why:* CI runs on **push**; Husky runs **locally** so broken lint/tests don’t reach the remote. *Repo layout:* git root is **`RealEstatePortfolio/`** (contains `app/`, `docs/`); a **minimal root `package.json`** exists for Husky; app scripts run from **`app/`** via the hook.*

- [x] **Add Husky at git root with `app/` scripts** — Install Husky (current major version per npm), add `prepare` script so `npm install` enables hooks. Implemented **pre-commit** and **pre-push** (both run lint + test from `app/`; pre-commit blocks bad commits, pre-push catches anything skipped or broken before remote).
  - *Acceptance:*
    - [x] `.husky/` directory committed; hook runs `npm run lint` and `npm run test` from **`app/`** (paths work on Windows + Linux).
    - [x] Fresh clone: `npm install` at root (and/or `cd app && npm install` if documented) leaves hooks active.
    - [x] Intentionally failing lint or test **blocks** the hook action (commit or push).
    - [x] [`docs/setup/run-and-smoke-test.md`](setup/run-and-smoke-test.md) updated with a short **“Git hooks”** subsection: what runs, when, and how to skip in emergencies (`HUSKY=0` or `git commit --no-verify` — document responsibly).
    - [x] Optional: [`docs/qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §10 change log one-liner.

---

### Audit synthesis (2026-03-19)

Consolidated from 9 audit reports. Deduplicated. See `docs/audits/synthesis/2026-03-19-audit-synthesis.md` for full traceability.

Tasks are grouped into batches. **Batch 1** is first.

---

## Batch 1: Critical fixes & security foundation

*Purpose: Fix critical UX bug, harden security posture, and ensure error visibility. Do this batch first.*

- [x] **Fix signInUrl typo** — In `app/sign-up/[[...sign-up]]/page.tsx`, ensure `signInUrl="/sign-in"` (not `/sign-up`).
  - *Acceptance:* "Already have account?" link routes to `/sign-in`; no sign-up→sign-up loop.

- [x] **Add CSP header (report-only)** — Add Content-Security-Policy to `next.config.ts` security headers in report-only mode.
  - *Acceptance:* Response headers include `Content-Security-Policy-Report-Only`; no blocking; violations logged to report-uri or console.

- [x] **Add rate limiting** — Apply rate limits to: `api/properties` POST, `api/deals` POST, `api/import/portfolio` POST, `api/account/delete`, `api/billing/create-checkout-session`.
  - *Acceptance:* Each endpoint rejects with 429 when limit exceeded; limits documented (e.g. per-user or per-IP); existing rate-limited routes (contact, estimates) unchanged.

- [x] **Add Sentry.captureException in error boundary** — In `app/(app)/error.tsx`, call `Sentry.captureException(error)` before render.
  - *Acceptance:* Unhandled errors in app routes are reported to Sentry; error boundary still renders user-facing message.

- [x] **Verify middleware wiring** — Confirm `app/proxy.ts` is correctly loaded as Next.js middleware (re-export from `middleware.ts` or rename to `middleware.ts`).
  - *Acceptance:* Auth protection works for protected routes; public routes remain accessible; build succeeds; doc updated if renamed.

- [x] **Add structured logging for admin actions** — Log admin export and tier override actions with user, action, and timestamp.
  - *Acceptance:* Admin export and tier override emit structured logs (JSON or key-value); no PII in logs.

- [x] **Fix post-auth redirect to dashboard (O5)** — After sign-in or sign-up (including OAuth e.g. Google), user lands directly on `/dashboard` without an intermediate stop on the public landing page.
  - *Root cause:* Clerk's fallback redirect defaults to `/` when `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` are unset. OAuth and some flows use the fallback, not the component `afterSignInUrl`/`afterSignUpUrl`.
  - *Fix:* Set `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard` and `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard` in `.env` and `.env.example`. Optionally use `*_FORCE_REDIRECT_URL` if you want to always redirect to dashboard regardless of `redirect_url`.
  - *Acceptance:* No manual "Go to dashboard" click required; OAuth and email flows both redirect to `/dashboard`; no redirect to `/` or landing after successful auth.

---

## Batch 2: Governance & docs

*Purpose: Fix broken references, align conventions, and add release/audit gates.*

- [x] **Fix hooks.json shell-risk-policy path** — In `.cursor/hooks.json`, ensure beforeShellExecution prompt references `docs/policies/shell-risk-policy.md`.
  - *Acceptance:* Hooks resolve to correct policy file; no broken references.

- [x] **Fix design-spec internal links** — In `docs/policies/design-spec.md`, fix links to pm-review-checklist and engineering-spec.
  - *Acceptance:* All internal links resolve; no 404s in docs.

- [x] **Fix ai-development-process shell-risk references** — In `docs/ai-development-process-extraction.md`, correct shell-risk-policy references.
  - *Acceptance:* References point to `docs/policies/shell-risk-policy.md`.

- [x] **Standardize .env.example path** — In `cursor-agent-setup.md` and `pm-agent-workflow.md`, use consistent path to `.env.example` (e.g. `app/.env.example`).
  - *Acceptance:* Both docs use same path; path matches repo layout.

- [x] **Align math audit naming** — Align report naming convention between `docs/audits/math/README.md` and math audit agent/process.
  - *Acceptance:* README and agent produce same naming pattern (e.g. `YYYY-MM-DD-math-audit.md`).

- [x] **Remove pm-agent.mdc artifact** — Remove trailing markdown artifact in `.cursor/rules/pm-agent.mdc`.
  - *Acceptance:* File parses cleanly; no stray characters or broken structure.

- [x] **Add command-integrity check** — Document or automate a recurring check that audit rules reference correct process docs.
  - *Acceptance:* Process exists (manual or script); doc describes how to verify rules ↔ process alignment.

- [x] **Add PM release-gate audit item** — Add to `docs/process/pm-review-checklist.md` (or equivalent) an item for required audits per `docs/audits/README.md`.
  - *Acceptance:* Release checklist includes "Run required audits per cadence"; link to audits README.

---

## Batch 3: Reliability & observability

*Purpose: Health checks, error visibility, and incident runbook.*

- [x] **Add /api/health endpoint** — Create `/api/health` with DB connectivity check.
  - *Acceptance:* GET returns 200 when DB reachable, 503 when not; no auth required; response includes status.

- [x] **Add structured error logging to billing** — In `api/billing/create-checkout-session` and `api/billing/sync`, log errors with context (no card numbers).
  - *Acceptance:* Stripe/billing errors logged with error type and request context; no sensitive data.

- [x] **Create incident-response runbook** — Create `docs/runbooks/incident-response.md` covering rollback, monitoring, and recovery.
  - *Acceptance:* Doc covers: how to rollback, where to check logs/monitoring, recovery steps; linked from relevant docs.

- [x] **Add Suspense wrappers** — Wrap dashboard and properties page components in `Suspense` where appropriate.
  - *Acceptance:* Async data fetches show fallback during load; no layout shift or flash of empty state.

---

## Batch 4: Performance

*Purpose: Reduce client bundle, avoid hydration issues, and throttle heavy operations.*

- [x] **Dynamic-import ProjectionsTabContent chart** — Wrap `ProjectionsTabContent` or its chart in `next/dynamic` with `ssr: false`.
  - *Acceptance:* Chart loads client-side only; no hydration mismatch; tab remains functional.

- [x] **Dynamic-import MortgageTabContent chart** — Wrap `MortgageTabContent` or its chart in `next/dynamic` with `ssr: false`.
  - *Acceptance:* Same as above for mortgage tab.

- [x] **Throttle dashboard benchmark refresh** — Add sequential or throttled execution to dashboard benchmark refresh loop.
  - *Acceptance:* Benchmark refreshes do not fire in parallel burst; configurable delay or queue.

- [x] **Pass subscription as server props to Settings** — Fetch subscription details server-side and pass as props to Settings page.
  - *Acceptance:* Settings page receives subscription data from server; no client fetch for initial load.

---

## Batch 5: Data integrity & math

*Purpose: Import flexibility, validation, export completeness, and display correctness.*

- [x] **Import parser aliases** — Update import parser to accept `mortgage balance (effective)` or `mortgage balance (stored)` as column aliases.
  - *Acceptance:* CSV import succeeds when column header uses either alias; mapping documented.

- [x] **Zod validation for unitRents** — Add Zod runtime validation for `unitRents` JSON field on read.
  - *Acceptance:* Invalid `unitRents` shape rejected or sanitized; valid data passes; error message clear.

- [x] **NOI and annual cash flow in export** — Add NOI and annual cash flow columns to portfolio export.
  - *Acceptance:* Export includes columns; values match `docs/policies/ownership-metrics.md` formulas.

- [x] **Projection chart scaleLiabilityAmount** — Make projection chart loan balance use `scaleLiabilityAmount` for mode-aware display.
  - *Acceptance:* Chart shows scaled values when in scaled mode; matches other liability displays.

- [x] **Mortgage tab baseline note** — Update mortgage tab baseline note to clarify "no extra payment" scenario.
  - *Acceptance:* Note explicitly states baseline assumes no extra payments; no ambiguity.

- [x] **Evaluate ownershipPercent/vacancyPercent schema** — Evaluate Prisma schema change for `ownershipPercent`/`vacancyPercent` (Int → Decimal).
  - *Acceptance:* Decision documented (migrate or defer); if migrate, migration plan and backward compatibility considered.

---

## Batch 6: UX / Feature

*Purpose: Nav clarity, Deals UX, card consistency, and dashboard metrics.*

- [x] **Rename Pricing → Plans** — Rename nav label "Pricing" to "Plans" and page title to "Plans & billing".
  - *Acceptance:* Nav shows "Plans"; page title/heading shows "Plans & billing"; links updated.

- [x] **Remove duplicate Modeling/Mortgage links** — Remove duplicate links from bottom of property detail Overview.
  - *Acceptance:* Single set of Modeling/Mortgage links; no redundancy.

- [x] **Deals sort and search** — Add sort-by-date and search to Deals page.
  - *Acceptance:* User can sort deals by date; user can search/filter deals; UI clear.

- [x] **Standardize card styling** — Standardize card styling tokens across dashboard, properties, deals, and workspaces.
  - *Acceptance:* Shared tokens (border, padding, shadow) used consistently; no visual drift.

- [x] **Remove View action from deal cards** — Remove "View" action from deal cards (redundant with card click).
  - *Acceptance:* Deal cards navigate on click; no separate View button.

- [x] **Replace window.confirm in deals** — Replace `window.confirm()` with app-consistent delete confirmation (modal or inline).
  - *Acceptance:* Delete uses same pattern as other delete flows; accessible; no native confirm.

- [x] **Single-property metric cards** — Add single-property metric cards or inline metrics to dashboard.
  - *Acceptance:* When one property, dashboard shows key metrics (NOI, cash flow, etc.); matches design spec.

- [x] **Fix Analyze Deal Investment Metrics layout (O6)** — In Analyze Deal, Investment Metrics section: (1) Prevent "Monthly cash flow", "Annual cash flow", "Equity", "NOI" labels from wrapping to 3 lines; (2) Let Ownership % input span full width of card instead of clamping to column width.
  - *Acceptance:* Labels stay on 1–2 lines; layout looks professional at common viewport widths; Ownership % input spans full card width.

---

## Batch 7: Growth & activation

*Purpose: Screenshots, onboarding guidance, and re-entry paths.*

- [x] **Product screenshots** — Add product screenshots to landing page and public pricing page.
  - *Acceptance:* Screenshots visible; alt text; optimized size; no placeholder images.

- [x] **"What's next" guidance card** — Add "What's next" guidance card to post-first-property dashboard.
  - *Acceptance:* After first property added, user sees actionable next steps (e.g. add deal, run projections).

- [x] **"Analyze a deal" CTA** — Add "Analyze a deal" CTA to dashboard empty state.
  - *Acceptance:* Empty state includes clear CTA to deals; reduces drop-off.

- [x] **"Getting started" link** — Add "Getting started" link in sidebar or settings for re-entry to onboarding tips.
  - *Acceptance:* User can return to onboarding content from sidebar/settings; link prominent.

- [x] **Wizard Quick add / mortgage skip** — ~~Consider wizard "Quick add" mode or mortgage step skip.~~ **Deferred.** Full wizard overhaul planned as a separate roadmap item. See `docs/reference/roadmap.md`.
  - *Acceptance:* Decision documented.

- [x] **Sidebar: Getting started → Add property (Phase 1)** — When user has 0 properties, sidebar footer link label is "Getting started"; when ≥1 property, label is "Add property". Same destination `/properties/new`.
  - *Acceptance:* Copy matches portfolio state; link behavior unchanged.

---

## Batch 8: Business & quality — **complete**

*Add-property experience overhaul (Epics A–G) is complete. Batch 8 delivered: PostHog (prod-verified), public changelog, external uptime, operational launch checklist verified in production (see [`docs/launch/launch-plan.md`](launch/launch-plan.md) §6).*

*Purpose was: Product analytics (PostHog), public changelog, external uptime monitoring.*

**Builder handoff (PM → implementer):** [`launch/batch-8-builder-handoff.md`](launch/batch-8-builder-handoff.md) — execution order, review gate, pointers to acceptance criteria below.

- [x] **Initial test coverage** — Vitest + Phase 1 unit tests; full strategy in [`proposals/testing-implementation-plan.md`](proposals/testing-implementation-plan.md).
  - *Acceptance:* Core math and metrics have unit tests; `npm run test` passes; `npm run test:coverage` available.

- [x] **Launch plan** — Create launch plan (target communities, messaging, timeline).
  - *Acceptance:* Doc exists with audience, messaging, and phased timeline.
  - *Deliverable:* [`docs/launch/launch-plan.md`](launch/launch-plan.md) *(Batch 8; Epic G in add-property overhaul is QA-only — see doc §1).*

### 8.1 PostHog + product events (instrumentation)

- [x] **PostHog Cloud + SDK** — Integrate **PostHog** for product analytics (not a custom admin funnel).
  - *Acceptance:*
    - [x] `posthog-js` (and/or `posthog-node` where server-side capture is needed) added in `app/`; init runs only when `NEXT_PUBLIC_POSTHOG_KEY` is set (no errors in dev without keys).
    - [x] `app/.env.example` documents `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (default `https://us.i.posthog.com` or EU host if using EU project), with link to PostHog project settings.
    - [x] Vercel production env has PostHog keys; **production** loads the snippet and events appear in PostHog (verify in PostHog “Live events”). *— Verified in production.*
    - [x] **Identify:** After Clerk session is available, call `posthog.identify` with stable `userId` (Clerk user id) so funnels are per-user, not anonymous noise only.
    - [x] **Core funnel events** (names can be snake_case; keep consistent everywhere):
      - `user_signed_up` — first-time account creation (Clerk sign-up success path or one server event; avoid duplicate spam per user).
      - `property_created` — property successfully created (client after success or server after DB write; one event per create).
      - `deal_created` — deal successfully created.
      - `checkout_started` — user lands on Stripe Checkout or `create-checkout-session` succeeds (choose one canonical moment; document in code comment).
    - [x] Optional but recommended: `plan_upgraded` or `subscription_activated` when webhook confirms paid tier (server-side capture preferred for truth).
    - [x] **Privacy / compliance:** Document in [`docs/launch/launch-plan.md`](launch/launch-plan.md) or a short [`docs/launch/analytics.md`](launch/analytics.md): what PostHog collects, that keys are opt-in via env, and link to privacy policy; add cookie/consent note if required for your jurisdictions.
    - [x] At least one **PostHog insight** or saved funnel in the PostHog UI documented in `docs/launch/analytics.md` (e.g. sign-up → property_created within 7 days) so PM can reproduce the view.

### 8.2 Public changelog

- [x] **Public `/changelog` page** — Ship a changelog for users and SEO.
  - *Acceptance:*
    - [x] Route **`/changelog`** exists under `app/app/changelog/` (or equivalent); uses `Metadata` (title, description, canonical via `NEXT_PUBLIC_APP_URL`).
    - [x] **SEO (changelog-specific):** `title` and `description` target intent like “product updates” / “what’s new” for Veld Portfolio (not generic “Changelog” only); **`openGraph`** (and **Twitter** if consistent with `app/layout.tsx` patterns) includes title, description, and canonical URL for `/changelog`; optional **`keywords`** or richer first-paragraph copy if aligned with [`docs/launch/investor-style-one-pager.md`](launch/investor-style-one-pager.md) positioning (real estate portfolio software). H1 on page matches positioning.
    - [x] Lists **release entries** (date + title + short bullet list of user-visible changes); initial entry can be “Initial public changelog” + pointer to product areas.
    - [x] **Footer** (and optionally landing nav) includes a link to `/changelog` (“Changelog” or “What’s new”).
    - [x] **Robots:** page is allowed in `app/robots.ts` if you want it indexed; **sitemap:** add `/changelog` to `app/sitemap.ts` with appropriate `changeFrequency` / `priority`.
    - [x] Process: [`docs/launch/changelog-process.md`](launch/changelog-process.md) (same-day merges, dates, security); summary also in [`docs/launch/analytics.md`](launch/analytics.md) § Changelog process.

### 8.3 External uptime monitor

- [x] **Uptime monitoring for production `/api/health`** — Use an **external** service (UptimeRobot, Better Stack, Pingdom, etc.); do not build this into the app.
  - *Acceptance:*
    - [x] Monitor **GET** `https://veldportfolio.com/api/health` in **production**; expect **HTTP 200** and JSON indicating DB ok (match current [`api/health`](../app/app/api/health/route.ts) contract). *— UptimeRobot.*
    - [x] **Alert channel** — email to support inbox (see runbook).
    - [x] Documented in [`docs/runbooks/incident-response.md`](runbooks/incident-response.md) § *External uptime monitor*: provider, URL, alerts, [public status page](https://stats.uptimerobot.com/Z6ScA8Ip37).
    - [x] Public status page: [stats.uptimerobot.com/Z6ScA8Ip37](https://stats.uptimerobot.com/Z6ScA8Ip37).

### 8.4 PostHog analytics v2 (subscription, limits, import)

- [x] **Stripe webhook** — `subscription_updated` on `customer.subscription.updated`; `subscription_canceled` on `customer.subscription.deleted` (see [`app/app/api/billing/webhook/route.ts`](../app/app/api/billing/webhook/route.ts)).
- [x] **Person properties** — `GET /api/me` returns `propertyCount` / `dealCount`; client `PostHogPersonProperties` sets `plan_tier`, `property_count`, `deal_count` in PostHog.
- [x] **`plan_limit_hit`** — capture when `PLAN_LIMIT_REACHED` from add property wizard, property form (new only), deal analyzer (new only), CSV import.
- [x] **CSV import** — `import_completed` / `import_failed` in settings import flow ([`import-csv-section.tsx`](../app/app/(app)/settings/import-csv-section.tsx)).
- [x] Docs — [`docs/launch/analytics.md`](launch/analytics.md) event table updated.

---

## Active: Add-property experience overhaul *(complete — regression only)*

*Full analysis, problems, principles, and **epics with acceptance criteria**: `docs/proposals/add-property-experience-overhaul.md`.*

Scope: **Add property** (wizard), **`/properties/[id]/edit`** (`property-form`), **property Detail** (**Overview** + **Details** tabs)—unify on shared primitives and consistent wayfinding; remove redundant edit patterns for the same data.

**Status:** Epics **A–G** complete (2026-03). Ongoing regression: [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md).

### Epic A — IA & design freeze
*Deliverables: [`docs/proposals/epic-a-discovery.md`](proposals/epic-a-discovery.md) — **A2 & A3 signed** (hybrid first-save; Details → `/edit`).*
- [x] **A1** Field inventory (wizard + edit + detail inline) → API mapping
- [x] **A2** First-save vs enrich-later decision (written)
- [x] **A3** Edit surface + what replaces Details triple inline (written)
- [x] **A4** Visual references (moodboard/Figma) aligned with team

### Epic B — Shared property UI layer
*Include optional **sqft** on the property record + RentCast **`squareFootage`** on estimates (see [`docs/proposals/epic-a-discovery.md`](proposals/epic-a-discovery.md) § Estimate fidelity).*
- [x] **B1** Shared tokens (`components/property/property-form-field-classes.ts`) + **`PropertySquareFeetField`**; used on add wizard, `/edit`, Details facts. *Full Location/Economics/Notes section extraction → epics C–D.*
- [x] **B2** **`squareFeet`** on `Property` + Zod + `POST`/`PATCH`/`GET` property APIs
- [x] **B3** RentCast **`squareFootage`** in `lib/integrations/rentcast.ts` + `/api/estimates/rent` & `value`; clients pass sqft when set

### Epic C — Add property (replace wizard)
- [x] **C1** Sectioned single-page add flow (sticky jump nav + anchors); **`?from=`** deal prefill unchanged; **draft** restore scrolls to Review — implementation: `app/app/(app)/properties/add-property-wizard.tsx`
- [x] **C2** Mortgage: explicit optional copy; **No, skip** remains non-blocking for create
- [x] **C3** Entry-point QA checklist — [`epic-c-entry-qa.md`](proposals/epic-c-entry-qa.md) *(manual smoke when touching this flow)*

### Epic D — Edit property page
- [x] **D1** Rebuild `/edit` on shared components — sectioned layout + sticky jump nav + `PROPERTY_EDIT_SECTION_NAV` in `lib/property-form-section-nav.ts`; `property-form.tsx` mirrors add flow sections (Location, Purchase & value, Income, Notes)
- [x] **D2** PATCH parity + plan errors — `unitMix` + `squareFeet` in PATCH payload; Zod `details` surfaced on validation failure; `PLAN_LIMIT_REACHED` unchanged
- [x] **D3** Wayfinding / hierarchy — edit page copy + link to property detail for mortgages/modeling; QA — [`epic-d-entry-qa.md`](proposals/epic-d-entry-qa.md)

### Epic E — Property detail (Details tab)
- [x] **E1** Replace/merge triple inline edit pattern (per A3) — Details is **read-only** summary + primary **Edit property** → `/edit`; no per-section Facts / Financial / Notes editors
- [x] **E2** Unsaved changes UX — inline PATCH + discard flows removed from Details (no `window.confirm` for facts/financial/notes)
- [x] **E3** Mortgage block styling parity — `MortgageSection` uses **`embedded`** inside the same `p-4` card as other blocks; typography/padding aligned; QA — [`epic-e-entry-qa.md`](proposals/epic-e-entry-qa.md)

### Epic F — Property Overview tab (`/properties/[id]` default tab)
- [x] **F1** De-duplicate headline KPIs — `PropertyHero` is identity-only; **Performance at a glance** is the single KPI grid (`overview-tab-content.tsx`, `property-hero.tsx`)
- [x] **F2** Visual parity with Details — cards `rounded-lg border border-border bg-card p-4`; primary **Edit property** (accent); shared **`PropertyHealthStrip`** with Details
- [x] **F3** Cross-tab wayfinding — **View full property data (Details tab)** + **Inputs at a glance** links to `?tab=details`
- [x] **F4** **Inputs at a glance** (replaces “Verification”) — includes **rent** + mortgage snapshot + copy pointing to Details / Edit
- [x] **F5** Data/benchmark **health strip** on Overview (same chips as Details via `property-health-strip.tsx`)
- [x] **F6** QA checklist — [`epic-f-overview-qa.md`](proposals/epic-f-overview-qa.md)

### Epic G — QA & cleanup
- [x] **G1** Regression matrix — [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) (see also [`qa/README.md`](qa/README.md))
- [x] **G2** Remove dead code paths after cutover — removed unused `app/app/(app)/properties/[id]/section-nav.tsx` (never imported)
- [x] **G3** Docs update — property add/edit/detail surfaces in [`architecture-and-build-practices.md`](architecture-and-build-practices.md) § Current Architecture
