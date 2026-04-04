# Archived tasks (completed)

**Purpose:** Historical record of completed tasks. Kept for reference; see [`docs/tasks.md`](tasks.md) for the **active backlog** and roadmap table. Full checked-off snapshots: **Tasks.md archive (2026-03-20)** through **Tasks.md archive (2026-04-04)** and **2026-04-05 cleanup** sections below (batches 1–15, test infra, add-property epics, branding, Husky, completed mobile Phase A, 2026-04-03/04 audit batches, calculators/metric tones, full-audit remediation completed phases, testing hardening Phases 1–3, etc.).

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

## Tasks.md archive (2026-04-04)

*Source:* [`docs/audits/synthesis/2026-04-04-audit-synthesis.md`](../audits/synthesis/2026-04-04-audit-synthesis.md) **Ship** and **Schedule** triage. *Completed 2026-04-04.*

**Already noted at promotion time (not tasks):** Refinance What-If disclaimer in `refinance-workspace.tsx`; mobile pricing accordion omitting "Hourly estimate pool" row (intentional per `design-spec-2026.md` §15.5).

### Ship (2026-04-04 full audit)

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| 1 | **SEO: Fix homepage calculator links** | `CALCULATOR_LINKS` in `app/app/page.tsx` → `/tools/brrr`, `/tools/fix-and-flip`, `/tools/str-vs-ltr`; `app/.agents/product-marketing-context.md` aligned. |
| 2 | **Design: Permit `border-border/70` and `bg-card/95` opacity variants** | `docs/design/design-spec-2026.md` updated (opacity-variant rule + related sections). |
| 3 | **Reliability: Sentry capture for PostHog server failures** | `app/lib/posthog-server.ts` — `Sentry.captureException` in catch after `console.error`. |

- [x] **Ship 4-04 #1** — SEO: Fix homepage calculator links *(done 2026-04-04)*
- [x] **Ship 4-04 #2** — Design: Permit `border-border/70` / `bg-card/95` *(done 2026-04-04)*
- [x] **Ship 4-04 #3** — Reliability: Sentry for PostHog server failures *(done 2026-04-04)*

### Schedule (2026-04-04 full audit)

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S1 | **Mobile: `inputMode` on `PublicCalculator` inputs** | All 14 inputs in `app/components/marketing/public-calculator.tsx` with `inputMode` (`decimal` vs `numeric`). |
| S2 | **SEO: `operatingSystem: "Web Browser"` in JSON-LD** | `app/app/layout.tsx` `WebApplication` JSON-LD. |
| S3 | **Math spec: `getEffectiveBalance` 3-tier description** | `docs/process/math-logic-audit.md` §2.1. |
| S4 | **Governance: `product-marketing-context.md` in `builder-agent.mdc`** | `.cursor/rules/builder-agent.mdc` References. |
| S5 | **Mobile touch targets: deal analyzer presets + workspace nav chips** | `deal-analyzer-form.tsx` stress presets; `workspace-nav-mobile.tsx` chips — `min-h-[44px]`. |

- [x] **Sched 4-04 #S1** — Mobile: `inputMode` on `PublicCalculator` *(done 2026-04-04)*
- [x] **Sched 4-04 #S2** — SEO: `operatingSystem: "Web Browser"` *(done 2026-04-04)*
- [x] **Sched 4-04 #S3** — Math spec: `getEffectiveBalance` 3-tier description *(done 2026-04-04)*
- [x] **Sched 4-04 #S4** — Governance: `product-marketing-context.md` in `builder-agent.mdc` *(done 2026-04-04)*
- [x] **Sched 4-04 #S5** — Mobile touch targets: presets + nav chips *(done 2026-04-04)*

---

## Tasks.md archive (2026-04-03 run 2)

*Moved from* [docs/tasks.md](tasks.md) *2026-04-05 cleanup.*

### Audit synthesis — Ship phase (2026-04-03 full audit, run 2)

*Source:* [`docs/audits/synthesis/2026-04-03-audit-synthesis-2.md`](audits/synthesis/2026-04-03-audit-synthesis-2.md) **Ship** triage. *Promoted 2026-04-03.*

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| 1 | **Performance: MockupFrame CLS fix** | Add a minimum-height placeholder to `MockupFrame` (`app/components/mockups/mockup-frame.tsx`) so the outer container reserves space during the `scale === 0` phase before `ResizeObserver` fires. Affected placements: hero desktop, hero mobile, and pricing dashboard (non-`fitToHeight` frames). The `fitToHeight` pricing placements (mortgage, deal analyzer) have explicit `h-[340px]` and are not affected. The mockup content already fades in via `opacity: 0 → 1` — only the container height needs to be reserved. Verify: at 375px and 1440px, loading the landing and pricing pages shows no layout jump in the hero or mockup sections on a throttled (Slow 3G) connection in DevTools. |
| 2 | **Code: Deprecated tokens in new mockup components** | Replace `border-border/70` and `bg-card/95` with `border-border` and `bg-card` (full values) in `app/components/mockups/deal-analyzer-mockup.tsx` (9 instances) and `app/components/mockups/mortgage-mockup.tsx` (1 instance), per `design-spec-2026.md` §15.2 deprecation rule. The mockups should look visually identical after the change. Also remove any `uppercase tracking-wide` instances in the mockup files not within a sidebar nav group label or table column header context. `npm run lint` clean on touched files. |
| 3 | **Reliability: Sentry environment tagging** | Replace `process.env.NODE_ENV` with `process.env.VERCEL_ENV ?? process.env.NODE_ENV` in all four Sentry init files: `app/sentry.client.config.ts`, `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`, and `app/instrumentation-client.ts` (or equivalent files that set the Sentry `environment` option). `VERCEL_ENV` is injected automatically by Vercel (`"production"` / `"preview"` / `"development"`); the `NODE_ENV` fallback covers local dev. After the change, a Vercel preview deployment should appear as `environment: preview` in Sentry, not `production`. `npm run check` green. |

- [x] **Ship 4-03-2 #1** — MockupFrame CLS fix *(done 2026-04-03)*
- [x] **Ship 4-03-2 #2** — Deprecated tokens in new mockup components *(done 2026-04-03)*
- [x] **Ship 4-03-2 #3** — Sentry environment tagging *(done 2026-04-03)*

---

### Audit synthesis — Schedule phase (2026-04-03 full audit, run 2)

*Source:* [`docs/audits/synthesis/2026-04-03-audit-synthesis-2.md`](audits/synthesis/2026-04-03-audit-synthesis-2.md) **Schedule** triage. *Promoted 2026-04-03.*

**Intentional design decisions (not tasks):**
- Mobile pricing comparison accordion omits the "Hourly estimate pool" row — **intentional**. The row doesn't fit the mobile accordion layout cleanly. Desktop comparison table is the canonical reference for full feature detail.

#### UX / Feature

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S1 | **Timing copy consistency** | Change the two "2 minutes" instances to "60 seconds": (1) `app/app/page.tsx` line ~106 — How it works "Add a property" step description: change `"Takes about 2 minutes per property."` to `"Takes about 60 seconds per property."` (2) `app/app/(app)/onboarding-panel.tsx` line ~128 — change `"Typical setup time: about 2 minutes."` to `"Typical setup time: about 60 seconds."` The two "60 seconds" hero/bottom CTA instances are already correct and unchanged. No other copy changes. |
| S2 | **640–767px hero breakpoint overlap** | At widths 640px–767px, both the `md:hidden` mobile mockup and `sm:grid` HERO_STEPS cards are simultaneously visible in the hero. Clarify the intended visibility boundary: the mobile mockup should be `md:hidden` (hidden ≥768px) and the HERO_STEPS should be `hidden sm:grid` (visible ≥640px) — either extend the HERO_STEPS breakpoint to `md:grid` or the mobile mockup hide to `sm:hidden` so the two don't overlap. Verify at 640px exactly: only one version is visible. |
| S3 | **Pricing FAQ deduplication** | "Do I need a credit card?" appears in both the FAQ accordion and the bottom CTA card in `app/app/pricing/page.tsx`. Remove the duplicate from the bottom CTA card (keep it in the FAQ). Layout and all other content unchanged. |
| S4 | **Welcome modal a11y** | Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (pointing to the modal heading), focus trap (Tab stays within modal while open), and Escape key handler to the onboarding modal card in `app/components/onboarding/onboarding-panel.tsx`. Visual appearance unchanged. Keyboard smoke: Tab cycles within modal, Escape closes it, focus returns to the trigger. |

#### Math / Content

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S5 | **DashboardMockup — Annual Rent ≠ NOI** | In `app/components/mockups/dashboard-mockup.tsx`, Annual Rent and NOI are both hardcoded as `$55,290`, implying zero operating expenses. Update one of the values so the mockup shows a realistic NOI/rent split (e.g. Annual Rent ~$66,000, NOI ~$55,290, implying ~16% expense ratio). No other mockup data changes. |

#### Performance / Code

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S6 | **Remove `images.localPatterns` wildcard** | Delete the `localPatterns: [{ pathname: "**", search: "" }]` entry from `images` config in `app/next.config.ts`. The screenshot PNGs it referenced are deleted. `npm run build` clean; no `next/image` warnings. |
| S7 | **Billing portal Zod validation** | Add a Zod schema for the `POST /api/billing/portal` request body (`app/app/api/billing/portal/route.ts`), matching the pattern used on other billing routes. Return 400 with a stable error shape on invalid body. `npm run check` green. |
| S8 | **RentCast quota single fetch** | `RentCastQuotaHint` is mounted 3 times per page in `property-form.tsx` and `benchmark-display.tsx`, each firing a separate `/api/rentcast-quota` fetch. Deduplicate so only one fetch occurs per page render (e.g. lift the fetch to a parent or use React context/SWR dedup). Existing quota display behavior unchanged. |

#### Security

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S9 | **Billing route rate limits** | Add `billing:sync` and `billing:portal` entries to `RATE_LIMITS` in `app/lib/rate-limit.ts` and wire `checkRateLimit` / `recordRateLimit` into `POST /api/billing/sync` and `POST /api/billing/portal` (matching the pattern on other billing routes). If intentionally omitted, add a one-line rationale comment in `rate-limit.ts` and document in `docs/security/security-audit.md` §6. |
| S10 | **Admin layout soft-delete guard** | Replace `getAppUser()` with `getActiveAppUser()` in `app/app/admin/layout.tsx` and add a null redirect (matching the pattern used on other protected layouts). A soft-deleted admin account should not pass the layout gate. |
| S11 | **CSP docs refresh** | Update `docs/security/security-audit.md` §5 CSP directive table to include the domains now present in `app/next.config.ts` but not yet documented: Google Ads domains, PostHog, Facebook Pixel, Clerk custom domain (`clerk.veldportfolio.com`), and Google Fonts. Doc-only change; no code changes. |

#### Reliability

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S12 | **`(app)/error.tsx` Sentry capture pattern** | Move `Sentry.captureException(error)` from the render body into `useEffect([error])` in `app/app/(app)/error.tsx` to avoid double-capture on re-renders (align with `global-error.tsx` pattern). Only fires when `NEXT_PUBLIC_SENTRY_DSN` is set. `npm run check` green. |
| S13 | **Webhook fully-unresolved user test** | Add a test case in `app/app/api/billing/webhook/route.test.ts` for the path where both `stripeCustomerId` DB lookup and metadata `appUserId` return null — pin the expected behavior (currently a silent 200 with no DB write). |

#### Data Integrity

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S14 | **Export truncation UX** | In `app/components/settings/download-csv-button.tsx` (or equivalent), read the `X-Veld-Slice-Truncated`, `X-Veld-Property-Count-Total`, and `X-Veld-Property-Count-Included` headers from the `GET /api/export/portfolio` response. When `X-Veld-Slice-Truncated` is `"true"`, show a non-blocking warning (toast or inline message) telling the user the download contains N of M properties and they can upgrade for the full export. Normal (non-truncated) downloads are unaffected. |
| S15 | **Import `loanType` normalization** | In `app/lib/import/csv-parser.ts`, normalize the `loan type` column value to uppercase and trim before storing, then validate it against `LOAN_TYPE_OPTIONS`. Invalid values should produce a row-level error in the import response (not a silent bad write). Also surface Papa Parse structural errors alongside row-level errors in `app/app/api/import/portfolio/route.ts` so they appear in the response `errors` array. Existing valid import behavior unchanged; `npm run test` green. |
| S16 | **CSV download silent error** | In `download-csv-button.tsx`, replace the empty catch block with a user-visible error message (toast or inline) for failed download requests (429 rate limit, 5xx, network error). The success path is unchanged. |

#### Growth / Analytics

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S17 | **Deals at-limit CTA** | Replace the plain `<Link>` on the deals at-limit state with `UpgradePlanLink` (matching the over-limit state styling). The at-limit and over-limit states should have visual and functional parity for the upgrade prompt. |
| S18 | **`PlanIntentUrlSync` on `/sign-in`** | Add `<PlanIntentUrlSync />` in a `<Suspense>` boundary near the top of `app/app/sign-in/page.tsx` (matching the pattern on the sign-up page). Verify that visiting `/sign-in?intent=investor` preserves intent through the auth flow. |
| S19 | **Funnel instrumentation gaps** | (a) Add `FunnelCtaLink` + `planIntent` to the body CTA on `app/app/investment-property-calculator/page.tsx`. (b) Add `planIntent` to the primary CTAs on competitor/alternative pages where plain `<Link>` is used. (c) Wrap the `PaidIntentCheckoutBanner` upgrade link in `FunnelCtaLink` with an appropriate `placement`. Each fix produces a `funnel_cta_clicked` PostHog event for that placement. |
| S20 | **PostHog `landingVariant` on sign-up** | Pass `landingVariant` (from cookie or URL param, same source used by `FunnelCtaLink`) as a property on the `user_signed_up` PostHog event fired in `app/components/auth/posthog-signup-once.tsx` (or equivalent). This enables direct breakdown of signups by landing variant in PostHog without a separate insight join. |

#### SEO

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S21 | **JSON-LD `WebApplication` fields** | Add `operatingSystem: "Web"` and an `offers` block (free tier, Investor tier, Pro tier with their prices) to the `WebApplication` structured data in `app/app/layout.tsx`. Validate with Rich Results Test after deploy; no other metadata changes. |
| S22 | **BRRRR cross-link on investment-property-calculator** | Add a link to `/tools/brrr` in the cross-link footer of `app/app/investment-property-calculator/page.tsx`. STR vs LTR and Fix-and-Flip are already linked; BRRRR is the missing sibling. |

#### Legal

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S23 | **Cookie preferences — Vercel Web Analytics** | Add Vercel Web Analytics to the list of named analytics providers in `app/components/consent/cookie-preferences-section.tsx` (or equivalent cookie consent UI), alongside PostHog and Google Ads. Wording should match the Privacy page processor list. |
| S24 | **`security-notes.md` gtag consent wording** | Update `docs/security/security-notes.md` to accurately reflect that `gtag.js` / Google Ads tracking is consent-gated (only loads after user consent via `GoogleAdsGtagClient`). The current wording implies it loads unconditionally when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set. Doc-only change. |

#### Documentation / Governance

| # | Deliverable | Acceptance criteria |
|---|-------------|----------------------|
| S25 | **`cursor-agent-setup.md` Step 1** | Add `seo-audit-agent.mdc` to the Step 1 clone list in `docs/cursor-agent-setup.md`. Doc-only change. |
| S26 | **`visual-assets-guide.md` broken links** | Fix the broken relative link at footer L237 (`[design-spec.md](design-spec.md)` → correct path to `design-spec-2026.md`). Also fix the broken benchmarking archive link at L148 (`docs/roadmap.md` → correct archive path). Doc-only changes. |
| S27 | **Design-brief reconciliation** | `docs/design/design-brief-2026.md` has a SUPERSEDED banner but still shows "Status: Active"; `docs/policies/design-spec.md` still says "consult brief first". Update both to clearly defer to `docs/design/design-spec-2026.md` as the single canonical reference. Doc-only changes. |
| S28 | **Post-ship PNG reference cleanup** | Remove or update references to the deleted screenshot PNGs (`/ScreenDashboard.png`, `/ScreenMortgage.png`, `/ScreenDeal.png`) in `design-brief-2026.md` and implementation guide docs where they appear as placement examples. Replace with a note pointing to the new mockup components. Doc-only changes. |

- [x] **Sched 4-03-2 #S1** — Timing copy consistency *(done 2026-04-04 — Phase E)*
- [x] **Sched 4-03-2 #S2** — 640–767px hero breakpoint overlap *(done 2026-04-04 — Phase E)*
- [x] **Sched 4-03-2 #S3** — Pricing FAQ deduplication *(done 2026-04-04 — Phase E)*
- [x] **Sched 4-03-2 #S4** — Welcome modal a11y *(done 2026-04-04 — Phase E)*
- [x] **Sched 4-03-2 #S5** — DashboardMockup Annual Rent ≠ NOI *(done 2026-04-03 — Phase A)*
- [x] **Sched 4-03-2 #S6** — Remove `images.localPatterns` wildcard *(done 2026-04-03 — Phase A)*
- [x] **Sched 4-03-2 #S7** — Billing portal Zod validation *(done 2026-04-04 — Phase B)*
- [x] **Sched 4-03-2 #S8** — RentCast quota single fetch *(done 2026-04-04 — Phase D)*
- [x] **Sched 4-03-2 #S9** — Billing route rate limits *(done 2026-04-04 — Phase B; `docs/security/security-audit.md` §6 updated)*
- [x] **Sched 4-03-2 #S10** — Admin layout soft-delete guard *(done 2026-04-04 — Phase B)*
- [x] **Sched 4-03-2 #S11** — CSP docs refresh *(done 2026-04-04 — Phase G)*
- [x] **Sched 4-03-2 #S12** — `(app)/error.tsx` Sentry capture pattern *(done 2026-04-04 — Phase B)*
- [x] **Sched 4-03-2 #S13** — Webhook fully-unresolved user test *(done 2026-04-04 — Phase B)*
- [x] **Sched 4-03-2 #S14** — Export truncation UX *(done 2026-04-04 — Phase C)*
- [x] **Sched 4-03-2 #S15** — Import `loanType` normalization *(done 2026-04-04 — Phase C)*
- [x] **Sched 4-03-2 #S16** — CSV download silent error *(done 2026-04-04 — Phase C)*
- [x] **Sched 4-03-2 #S17** — Deals at-limit CTA *(done 2026-04-04 — Phase D)*
- [x] **Sched 4-03-2 #S18** — `PlanIntentUrlSync` on `/sign-in` *(done 2026-04-04 — Phase D)*
- [x] **Sched 4-03-2 #S19** — Funnel instrumentation gaps *(done 2026-04-04 — Phase D)*
- [x] **Sched 4-03-2 #S20** — PostHog `landingVariant` on sign-up *(done 2026-04-04 — Phase D)*
- [x] **Sched 4-03-2 #S21** — JSON-LD `WebApplication` fields *(done 2026-04-04 — Phase F)*
- [x] **Sched 4-03-2 #S22** — BRRRR cross-link on investment-property-calculator *(done 2026-04-04 — Phase F)*
- [x] **Sched 4-03-2 #S23** — Cookie preferences — Vercel Web Analytics *(done 2026-04-04 — Phase F)*
- [x] **Sched 4-03-2 #S24** — `security-notes.md` gtag consent wording *(done 2026-04-04 — Phase F)*
- [x] **Sched 4-03-2 #S25** — `cursor-agent-setup.md` Step 1 *(done 2026-04-04 — Phase G)*
- [x] **Sched 4-03-2 #S26** — `visual-assets-guide.md` broken links *(done 2026-04-04 — Phase G)*
- [x] **Sched 4-03-2 #S27** — Design-brief reconciliation *(done 2026-04-04 — Phase G)*
- [x] **Sched 4-03-2 #S28** — Post-ship PNG reference cleanup *(done 2026-04-04 — Phase G)*

---

### Execution phases — 2026-04-03 audit run 2

*Sequencing rationale: Phase A resolves anything live in production now. Phases B–C harden the safety layer before growth work. Phase D is the highest business-value batch. Phases E–G are polish and hygiene with no blocking dependencies.*

**Exit gate (all phases):** `npm run check` green on touched files before marking a phase complete.

---

#### Phase A — Production stability *(do first — 5 items)* — **complete 2026-04-03**

Fixes that are already live or affect the LCP element on the landing page. No dependencies; can be done in a single pass.

| Item | Deliverable | Why first |
|------|-------------|-----------|
| Ship #1 | MockupFrame CLS fix | Above-the-fold layout jump on hero — live in production now |
| Ship #2 | Deprecated tokens in mockups | Freshly committed; cheapest to clean up now |
| Ship #3 | Sentry environment tagging | Preview deploys mistagged as production — affects all observability |
| S5 | DashboardMockup Annual Rent ≠ NOI | Demo data visible to every landing page visitor |
| S6 | Remove `images.localPatterns` wildcard | One-line config cleanup; zero risk |

---

#### Phase B — Security & reliability hardening *(5 items)* — **complete 2026-04-04**

Closes known attack surface gaps and pins critical billing behavior with tests. No UX dependencies.

| Item | Deliverable |
|------|-------------|
| S7 | Billing portal Zod validation |
| S9 | Billing route rate limits (`sync` + `portal`) |
| S10 | Admin layout soft-delete guard |
| S12 | `(app)/error.tsx` Sentry capture pattern |
| S13 | Webhook fully-unresolved user test |

---

#### Phase C — Data integrity *(3 items)* — **complete 2026-04-04**

Import/export reliability. Builds on Phase B patterns (error handling, validation parity). Can run concurrently with B if resourced.

| Item | Deliverable |
|------|-------------|
| S14 | Export truncation UX (surface count headers in download button) |
| S15 | Import `loanType` normalization + Papa Parse error surfacing |
| S16 | CSV download silent error feedback |

---

#### Phase D — Growth & analytics *(5 items)* — **complete 2026-04-04**

Highest business-value batch. Closes funnel tracking blind spots and intent-passing gaps before any paid acquisition. Depends on nothing from B/C.

| Item | Deliverable |
|------|-------------|
| S8 | RentCast quota single fetch (also reduces API cost at scale) |
| S17 | Deals at-limit CTA (`UpgradePlanLink` parity) |
| S18 | `PlanIntentUrlSync` on `/sign-in` |
| S19 | Funnel instrumentation gaps (calculator, competitor pages, banner) |
| S20 | PostHog `landingVariant` on sign-up event |

---

#### Phase E — UX & visual polish *(4 items)* — **complete 2026-04-04**

All visible changes. Timing copy requires a PM decision on the number before builder starts.

| Item | Deliverable |
|------|-------------|
| S1 | Timing copy consistency — update 2× "2 minutes" instances to "60 seconds" (decision: 2026-04-03) |
| S2 | 640–767px hero breakpoint overlap |
| S3 | Pricing FAQ deduplication |
| S4 | Welcome modal a11y (focus trap, Escape, `role="dialog"`) |

---

#### Phase F — SEO & legal *(4 items)* — **complete 2026-04-04**

No code dependencies. SEO items take effect on next crawl after deploy; legal items are copy/doc changes.

| Item | Deliverable |
|------|-------------|
| S21 | JSON-LD `WebApplication` — `operatingSystem` + `offers` |
| S22 | BRRRR cross-link on investment-property-calculator |
| S23 | Cookie preferences — add Vercel Web Analytics |
| S24 | `security-notes.md` gtag consent wording |

---

#### Phase G — Documentation & governance *(5 items)* — **complete 2026-04-04**

All doc-only changes. No code touched; can be batched in one pass or deferred until a quiet moment.

| Item | Deliverable |
|------|-------------|
| S11 | CSP docs refresh (add new domains to security-audit.md §5) |
| S25 | `cursor-agent-setup.md` Step 1 — add `seo-audit-agent.mdc` |
| S26 | `visual-assets-guide.md` broken links (L237 + L148) |
| S27 | Design-brief reconciliation (`design-spec-2026.md` as single canonical) |
| S28 | Post-ship PNG reference cleanup in docs |

---

---
## Tasks.md archive (2026-04-03 + 2026-04-01 — prior Ship batches)

*Moved from* [docs/tasks.md](tasks.md) *2026-04-05 cleanup.*

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
## Tasks.md archive (2026-03-31 — calculators and metric tones)

*Moved from* [docs/tasks.md](tasks.md) *2026-04-05 cleanup.*

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

## Tasks.md archive (2026-03-31 — full audit remediation completed phases)

*Moved from* [docs/tasks.md](tasks.md) *2026-04-05 cleanup. Open items remain in active tasks.*

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

##### Phase 13 — Reliability & performance (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Observability on hot paths + client/server cost — not new funnel product events (Phase 15) or SEO (Phase 16).

- [x] Wrap high-traffic CRUD routes in structured try/catch + `Sentry.captureException` with `userId` and route metadata. *Properties + deals POST/PATCH/DELETE.*
- [x] Implement Stripe webhook `event.id` deduplication for PostHog server captures (avoid duplicate analytics on retries). Align with [`docs/internal/stripe-webhook-posthog-idempotency.md`](internal/stripe-webhook-posthog-idempotency.md) if applicable. *`StripePosthogDedup` + `lib/stripe-webhook-posthog.ts`.*
- [x] Reduce `PostHogPersonProperties` `/api/me` fan-out from every pathname change to mount/event-driven sync.
- [x] Unify dashboard data loading with `buildPortfolioSummaryPayload` (or shared server loader) to remove duplicated query and metric logic. *`buildDashboardPortfolioPayload`.*
- [x] Split heavy client bundles in analyze/marketing paths (`deal-analyzer-form` subregions, homepage `PublicCalculator`) with staged dynamic loading where practical. *Homepage `PublicCalculator` dynamic; deal-analyzer subregions still deferred.*

##### Phase 14 — UX, accessibility & mobile (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* In-app UX and marketing shell polish — not analytics instrumentation (Phase 15) or SEO mechanics (Phase 16).

- [x] Add mobile-accessible page-level `<h1>` landmarks for Modeling and Mortgage workspaces (narrow breakpoints). *(Synthesis merges a duplicate Mobile-lane note into this UX item.)*
- [x] Visible error feedback in `PastDueBanner` when billing portal launch fails.
- [x] Rewrite in-app calculators hub copy to remove SEO implementation language; keep user-facing intent only.
- [x] Reduce CTA overload: simplify Properties header action stack and promote one clear post-first-property next-step CTA. *Short “Modeling” / “Mortgage” links; primary remains Add property.*
- [x] Align workspace selector labels to user language (e.g. “Property” vs “Modeling context” / “Mortgage context”).
- [x] Increase landing-nav hamburger touch target from `size-10` to at least 44×44 (`size-11`) for parity with app shell controls. *`components/landing-nav.tsx` — `size-11` + `min-h/w-11`.*
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
##### Phase 17 — Business, launch & internal analytics docs (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Operational documentation and evidence — not repo-wide README indexing (Phase 18).

- [x] Verify and document `past_due` user-facing path end-to-end (status route → shell → visible banner/state). *[`docs/internal/past-due-user-path.md`](internal/past-due-user-path.md).*
- [x] Extend [`docs/internal/billing-matrix.md`](internal/billing-matrix.md) with auxiliary billing route behavior (`/sync`, `/status`, `/subscription-details`).
- [x] Complete and evidence the PostHog named funnel verification checklist in [`docs/launch/posthog-growth-funnel.md`](launch/posthog-growth-funnel.md).
- [x] Document currently undefined analytics events (beyond core funnel) in launch analytics docs. *[`docs/launch/analytics.md`](launch/analytics.md), posthog-growth-funnel supplement.*
##### Phase 18 — Repository documentation housekeeping (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Doc moves and indexing — not legal copy (Phase 20).

- [x] Archive completed proposals from `docs/proposals/` into `docs/archive/proposals/` (active proposals only in root). *Archived 2026-04-01; kept `refinance-payoff-proposal.md`, `test-hardening-phase-1-2-plan.md`, `testing-implementation-plan.md`.*
- [x] Expand `docs/README.md` indexing for `docs/internal/` and missing policy/process/launch docs.
- [x] Archive dated paid-ads readout artifacts from `docs/launch/` into an archive location. *[`docs/archive/launch/paid-ads-readouts/`](archive/launch/paid-ads-readouts/README.md).*
##### Phase 19 — Governance (`[Synth 4-01]`) — **✓ complete (2026-04-01)**

*Boundary:* Agent/process docs only — not calculator product code.

- [x] Fix stale lane count in `docs/cursor-agent-setup.md` summary (“12” → “14”).
- [x] Add explicit 14-lane statement (including SEO + Mobile experience) in `docs/process/agent-governance-audit-process.md`.
- [x] Optionally add [`docs/policies/calculator-metric-tones.md`](policies/calculator-metric-tones.md) to `.cursor/rules/builder-agent.mdc` references for calculator-surface tasks.
##### Phase 20 — Legal & compliance (`[Synth 4-01]`) — **partial (2026-04-01)**

*Boundary:* Customer-facing legal and pricing disclosure — builder implements copy/links; counsel review is an owner step.

- [x] Add concise billing/refund/cancellation disclosure near pricing and upgrade CTAs, linking to exact Terms sections. *Anchors `#subscriptions-and-payments`, `#refunds`, `#cancellation` on `/terms`.*

*Remaining optional Phase 2 item, partial Phases 13–14 / 17–18 / 20–21, Phase 21 gate, and **Deferred from synthesis** are in active [docs/tasks.md](tasks.md).*
## Tasks.md archive (2026-03-30 — testing hardening Phases 1–3)

*Moved from* [docs/tasks.md](tasks.md) *2026-04-05 cleanup.*

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

*Full analysis, problems, principles, and **epics with acceptance criteria**: `docs/archive/proposals/add-property-experience-overhaul.md`.*

Scope: **Add property** (wizard), **`/properties/[id]/edit`** (`property-form`), **property Detail** (**Overview** + **Details** tabs)—unify on shared primitives and consistent wayfinding; remove redundant edit patterns for the same data.

**Status:** Epics **A–G** complete (2026-03). Ongoing regression: [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md).

### Epic A — IA & design freeze
*Deliverables: [`docs/archive/proposals/epic-a-discovery.md`](archive/proposals/epic-a-discovery.md) — **A2 & A3 signed** (hybrid first-save; Details → `/edit`).*
- [x] **A1** Field inventory (wizard + edit + detail inline) → API mapping
- [x] **A2** First-save vs enrich-later decision (written)
- [x] **A3** Edit surface + what replaces Details triple inline (written)
- [x] **A4** Visual references (moodboard/Figma) aligned with team

### Epic B — Shared property UI layer
*Include optional **sqft** on the property record + RentCast **`squareFootage`** on estimates (see [`docs/archive/proposals/epic-a-discovery.md`](archive/proposals/epic-a-discovery.md) § Estimate fidelity).*
- [x] **B1** Shared tokens (`components/property/property-form-field-classes.ts`) + **`PropertySquareFeetField`**; used on add wizard, `/edit`, Details facts. *Full Location/Economics/Notes section extraction → epics C–D.*
- [x] **B2** **`squareFeet`** on `Property` + Zod + `POST`/`PATCH`/`GET` property APIs
- [x] **B3** RentCast **`squareFootage`** in `lib/integrations/rentcast.ts` + `/api/estimates/rent` & `value`; clients pass sqft when set

### Epic C — Add property (replace wizard)
- [x] **C1** Sectioned single-page add flow (sticky jump nav + anchors); **`?from=`** deal prefill unchanged; **draft** restore scrolls to Review — implementation: `app/app/(app)/properties/add-property-wizard.tsx`
- [x] **C2** Mortgage: explicit optional copy; **No, skip** remains non-blocking for create
- [x] **C3** Entry-point QA checklist — [`epic-c-entry-qa.md`](archive/proposals/epic-c-entry-qa.md) *(manual smoke when touching this flow)*

### Epic D — Edit property page
- [x] **D1** Rebuild `/edit` on shared components — sectioned layout + sticky jump nav + `PROPERTY_EDIT_SECTION_NAV` in `lib/property-form-section-nav.ts`; `property-form.tsx` mirrors add flow sections (Location, Purchase & value, Income, Notes)
- [x] **D2** PATCH parity + plan errors — `unitMix` + `squareFeet` in PATCH payload; Zod `details` surfaced on validation failure; `PLAN_LIMIT_REACHED` unchanged
- [x] **D3** Wayfinding / hierarchy — edit page copy + link to property detail for mortgages/modeling; QA — [`epic-d-entry-qa.md`](archive/proposals/epic-d-entry-qa.md)

### Epic E — Property detail (Details tab)
- [x] **E1** Replace/merge triple inline edit pattern (per A3) — Details is **read-only** summary + primary **Edit property** → `/edit`; no per-section Facts / Financial / Notes editors
- [x] **E2** Unsaved changes UX — inline PATCH + discard flows removed from Details (no `window.confirm` for facts/financial/notes)
- [x] **E3** Mortgage block styling parity — `MortgageSection` uses **`embedded`** inside the same `p-4` card as other blocks; typography/padding aligned; QA — [`epic-e-entry-qa.md`](archive/proposals/epic-e-entry-qa.md)

### Epic F — Property Overview tab (`/properties/[id]` default tab)
- [x] **F1** De-duplicate headline KPIs — `PropertyHero` is identity-only; **Performance at a glance** is the single KPI grid (`overview-tab-content.tsx`, `property-hero.tsx`)
- [x] **F2** Visual parity with Details — cards `rounded-lg border border-border bg-card p-4`; primary **Edit property** (accent); shared **`PropertyHealthStrip`** with Details
- [x] **F3** Cross-tab wayfinding — **View full property data (Details tab)** + **Inputs at a glance** links to `?tab=details`
- [x] **F4** **Inputs at a glance** (replaces “Verification”) — includes **rent** + mortgage snapshot + copy pointing to Details / Edit
- [x] **F5** Data/benchmark **health strip** on Overview (same chips as Details via `property-health-strip.tsx`)
- [x] **F6** QA checklist — [`epic-f-overview-qa.md`](archive/proposals/epic-f-overview-qa.md)

### Epic G — QA & cleanup
- [x] **G1** Regression matrix — [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) (see also [`qa/README.md`](qa/README.md))
- [x] **G2** Remove dead code paths after cutover — removed unused `app/app/(app)/properties/[id]/section-nav.tsx` (never imported)
- [x] **G3** Docs update — property add/edit/detail surfaces in [`architecture-and-build-practices.md`](architecture-and-build-practices.md) § Current Architecture

---

## Tasks.md archive (2026-03-30)

*Snapshot of completed work moved here on 2026-03-30. For the current backlog (open + deferred items), see [`tasks.md`](tasks.md).*

### Mobile shell verification (functionality, logic, math)

*Process:* PM promotes here → **builder** implements per `.cursor/rules/builder-agent.mdc`. **Canonical math:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`. **Playwright/E2E:** out of scope for this batch.

*Plan & checklist:* [`docs/qa/mobile-shell-verification.md`](qa/mobile-shell-verification.md). **Broader mobile audit criteria** (full app): [`docs/qa/mobile-experience-audit.md`](qa/mobile-experience-audit.md).

#### Phase 0 — Manual QA (PM or owner)

- [ ] **Run manual matrix** — At 320 / 375 / 430px and desktop ≥768px: verify all four `MobileToolShell` surfaces (Deal Analyzer, Modeling, Mortgage, Public calculator per landing/calc routes). Confirm functionality (shell chrome, inputs, collapsibles, charts), and spot-check logic/math against policies (see verification doc § Phase 0).
  - *Acceptance:* Checklist in `docs/qa/mobile-shell-verification.md` completed or issues filed; no blocking regressions.

#### Phase A — Vitest jsdom + `MobileToolShell` tests (builder)

- [x] **Test infrastructure for React components** — Add `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`. Extend `app/vitest.config.ts` so `components/**/*.test.tsx` uses `jsdom` without moving existing `lib/` / `app/api` tests off Node. Add Vitest setup for jest-dom matchers if needed.
  - *Acceptance:* `npm run test` from `app/` passes; CI unchanged in intent (still `npm run test`).

- [x] **`MobileToolShell` unit tests** — New file e.g. `app/components/mobile-tool-shell.test.tsx`: cover children vs `modes`, footer, summary rail content, optional eyebrow/title/description, and `md:hidden` on root.
  - *Acceptance:* Tests are stable in CI; no snapshot churn on unrelated edits.

#### Phase B — Optional integration smoke (builder, after A)

- [ ] **Optional: `matchMedia` + public calculator smoke** — Mock `(max-width: 767px)` and render `PublicCalculator` (or minimal wrapper) to assert mobile shell path renders — only if low flake.
  - *Acceptance:* Documented in `docs/qa/mobile-shell-verification.md`; skip with rationale if not worth maintenance.

---

### Branding / metadata follow-up

- [x] **Replace default favicon with Veld icon set** — Generate and install a full favicon/app icon set from final Veld brand artwork (not Vercel default) and wire metadata links in the app head.
  - *Acceptance:*
    - [x] Public assets exist and are served from root: `favicon-96x96.png`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`.
    - [x] Head metadata includes:
      - [x] `<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />`
      - [x] `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
      - [x] `<link rel="shortcut icon" href="/favicon.ico" />`
      - [x] `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`
      - [x] `<meta name="apple-mobile-web-app-title" content="Veld" />`
      - [x] `<link rel="manifest" href="/site.webmanifest" />`
    - [x] Production tab/app icons no longer show Vercel branding.

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

## Batch 8: Business & quality — **active (pre-launch)**

*Add-property experience overhaul (Epics A–G) is complete. Remaining Batch 8 work: instrumentation, changelog, uptime.*

*Purpose: Product analytics (PostHog), public changelog, external uptime monitoring.*

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
    - [ ] Vercel production env has PostHog keys; **production** loads the snippet and events appear in PostHog (verify in PostHog “Live events”). *— PM: set keys in Vercel and verify.*
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
    - [x] Process note in [`docs/launch/launch-plan.md`](launch/launch-plan.md) or `docs/launch/analytics.md`: how to add a new entry each release (edit file vs component data structure).

### 8.3 External uptime monitor

- [x] **Uptime monitoring for production `/api/health`** — Use an **external** service (UptimeRobot, Better Stack, Pingdom, etc.); do not build this into the app.
  - *Acceptance:*
    - [x] Monitor **GET** `https://veldportfolio.com/api/health` in **production**; expect **HTTP 200** and JSON indicating DB ok (match current [`api/health`](../app/app/api/health/route.ts) contract). *— UptimeRobot.*
    - [x] **Alert channel** — email to support inbox (see runbook).
    - [x] Documented in [`docs/runbooks/incident-response.md`](runbooks/incident-response.md) § *External uptime monitor*: provider, URL, alerts, [public status page](https://stats.uptimerobot.com/Z6ScA8Ip37).
    - [x] Public status page: [stats.uptimerobot.com/Z6ScA8Ip37](https://stats.uptimerobot.com/Z6ScA8Ip37).

---

## Active: Add-property experience overhaul *(complete — regression only)*

*Full analysis, problems, principles, and **epics with acceptance criteria**: `docs/archive/proposals/add-property-experience-overhaul.md`.*

Scope: **Add property** (wizard), **`/properties/[id]/edit`** (`property-form`), **property Detail** (**Overview** + **Details** tabs)—unify on shared primitives and consistent wayfinding; remove redundant edit patterns for the same data.

**Status:** Epics **A–G** complete (2026-03). Ongoing regression: [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md).

### Epic A — IA & design freeze
*Deliverables: [`docs/archive/proposals/epic-a-discovery.md`](archive/proposals/epic-a-discovery.md) — **A2 & A3 signed** (hybrid first-save; Details → `/edit`).*
- [x] **A1** Field inventory (wizard + edit + detail inline) → API mapping
- [x] **A2** First-save vs enrich-later decision (written)
- [x] **A3** Edit surface + what replaces Details triple inline (written)
- [x] **A4** Visual references (moodboard/Figma) aligned with team

### Epic B — Shared property UI layer
*Include optional **sqft** on the property record + RentCast **`squareFootage`** on estimates (see [`docs/archive/proposals/epic-a-discovery.md`](archive/proposals/epic-a-discovery.md) § Estimate fidelity).*
- [x] **B1** Shared tokens (`components/property/property-form-field-classes.ts`) + **`PropertySquareFeetField`**; used on add wizard, `/edit`, Details facts. *Full Location/Economics/Notes section extraction → epics C–D.*
- [x] **B2** **`squareFeet`** on `Property` + Zod + `POST`/`PATCH`/`GET` property APIs
- [x] **B3** RentCast **`squareFootage`** in `lib/integrations/rentcast.ts` + `/api/estimates/rent` & `value`; clients pass sqft when set

### Epic C — Add property (replace wizard)
- [x] **C1** Sectioned single-page add flow (sticky jump nav + anchors); **`?from=`** deal prefill unchanged; **draft** restore scrolls to Review — implementation: `app/app/(app)/properties/add-property-wizard.tsx`
- [x] **C2** Mortgage: explicit optional copy; **No, skip** remains non-blocking for create
- [x] **C3** Entry-point QA checklist — [`epic-c-entry-qa.md`](archive/proposals/epic-c-entry-qa.md) *(manual smoke when touching this flow)*

### Epic D — Edit property page
- [x] **D1** Rebuild `/edit` on shared components — sectioned layout + sticky jump nav + `PROPERTY_EDIT_SECTION_NAV` in `lib/property-form-section-nav.ts`; `property-form.tsx` mirrors add flow sections (Location, Purchase & value, Income, Notes)
- [x] **D2** PATCH parity + plan errors — `unitMix` + `squareFeet` in PATCH payload; Zod `details` surfaced on validation failure; `PLAN_LIMIT_REACHED` unchanged
- [x] **D3** Wayfinding / hierarchy — edit page copy + link to property detail for mortgages/modeling; QA — [`epic-d-entry-qa.md`](archive/proposals/epic-d-entry-qa.md)

### Epic E — Property detail (Details tab)
- [x] **E1** Replace/merge triple inline edit pattern (per A3) — Details is **read-only** summary + primary **Edit property** → `/edit`; no per-section Facts / Financial / Notes editors
- [x] **E2** Unsaved changes UX — inline PATCH + discard flows removed from Details (no `window.confirm` for facts/financial/notes)
- [x] **E3** Mortgage block styling parity — `MortgageSection` uses **`embedded`** inside the same `p-4` card as other blocks; typography/padding aligned; QA — [`epic-e-entry-qa.md`](archive/proposals/epic-e-entry-qa.md)

### Epic F — Property Overview tab (`/properties/[id]` default tab)
- [x] **F1** De-duplicate headline KPIs — `PropertyHero` is identity-only; **Performance at a glance** is the single KPI grid (`overview-tab-content.tsx`, `property-hero.tsx`)
- [x] **F2** Visual parity with Details — cards `rounded-lg border border-border bg-card p-4`; primary **Edit property** (accent); shared **`PropertyHealthStrip`** with Details
- [x] **F3** Cross-tab wayfinding — **View full property data (Details tab)** + **Inputs at a glance** links to `?tab=details`
- [x] **F4** **Inputs at a glance** (replaces “Verification”) — includes **rent** + mortgage snapshot + copy pointing to Details / Edit
- [x] **F5** Data/benchmark **health strip** on Overview (same chips as Details via `property-health-strip.tsx`)
- [x] **F6** QA checklist — [`epic-f-overview-qa.md`](archive/proposals/epic-f-overview-qa.md)

### Epic G — QA & cleanup
- [x] **G1** Regression matrix — [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) (see also [`qa/README.md`](qa/README.md))
- [x] **G2** Remove dead code paths after cutover — removed unused `app/app/(app)/properties/[id]/section-nav.tsx` (never imported)
- [x] **G3** Docs update — property add/edit/detail surfaces in [`architecture-and-build-practices.md`](architecture-and-build-practices.md) § Current Architecture

---

## UX contract note (vacant rent)

- [x] **Vacant-state rent semantics** — In add/edit property flows, when `isRented = false`, rent inputs are not required and should not imply required status; market-rent estimate actions are hidden; copy states that income is saved as `$0` until marked rented; review summary explicitly shows `Rented: No` and vacant rent semantics. Persistence remains canonical in API (`currentMonthlyRent = 0`, `unitRents` cleared).

---

## Batch 9: Audit hardening follow-ups — **active**

*Purpose: Implement accepted 2026-03-28 synthesis follow-ups in phased order so we reduce production risk first, then compliance/contract drift, then reliability/performance polish.*

### Phase 9A (P0): Safety + correctness first

- [x] **Enforce Stripe webhook secret deploy guard** — Add `STRIPE_WEBHOOK_SECRET` to env validation/deploy guard flow.
  - *Acceptance:* Build/start fails fast with clear message when missing in required environments; `app/.env.example` and `docs/setup/manual-steps.md` reflect requirement.
- [x] **Normalize estimate/benchmark failure semantics** — Standardize API status/error/usage accounting for estimate and benchmark routes.
  - *Acceptance:* Upstream/provider failures return non-2xx consistently (e.g. 502/503); success remains 200; quota accounting rules are explicit and consistently applied; frontend error handling remains functional.
- [x] **Index RentCast hourly usage counts** — Add DB index for quota queries.
  - *Acceptance:* Prisma migration adds index on `RentCastApiCall(userId, createdAt)`; query plan/perf for hourly count improves; migration applied successfully.
- [x] **Single-property benchmark UX parity** — Respect `not_rented` / `rent_missing` states on single-property dashboard benchmark surfaces.
  - *Acceptance:* Single-property dashboard does not show misleading refresh/comparison actions when not rented or rent missing; copy matches property detail/list semantics.
- [x] **Cap dashboard benchmark refresh burst** — Replace unbounded stale-benchmark auto-refresh behavior.
  - *Acceptance:* Dashboard no longer triggers sequential refresh for all stale/missing properties on load by default; refresh strategy is explicit (capped, queued, or user-triggered) and UI communicates state clearly.

### Phase 9B (P1): Data + compliance alignment

- [x] **Fix import/export rental data integrity** — Resolve round-trip mismatches for `propertyType`, `isRented`, and rent source of truth.
  - *Acceptance:* Export preserves canonical property types; import/export support `isRented`; import defines deterministic precedence between `rent` and `unitRents` (with tests); round-trip no longer mutates semantics unexpectedly.
- [x] **Property API normalization parity** — Align POST/PATCH property serialization and rent split behavior with canonical helpers.
  - *Acceptance:* POST returns `unitRents` normalized like GET; PATCH uses effective `propertyType` (`data.propertyType ?? existing.propertyType`) when recomputing `unitRents`; regression tests cover both paths.
- [x] **Multi-mortgage export semantics** — Make export behavior explicit and trustworthy for properties with multiple mortgages.
  - *Acceptance:* Export either includes per-lien detail (columns or row strategy) or clearly labels “primary mortgage only”; docs and tests match chosen contract.
- [x] **Cookie consent + tracking gate (analytics/ads)** — Implement a consent system that keeps essential auth cookies always-on while gating PostHog and Google Ads until user opt-in.
  - *Implementation plan (concrete):*
    - Add a small consent model (`essential`, `analytics_ads`) with persisted choice in first-party storage (cookie or localStorage) and helper utilities in `app/lib/`.
    - Create a reusable consent banner component (accept/reject/manage) with design-spec-compliant styling and no intrusive modal behavior.
    - Gate PostHog initialization (`components/analytics/posthog-provider.tsx`, pageview/identify/signup emitters) behind `analytics_ads` consent.
    - Gate Google Ads script injection in `app/app/layout.tsx` behind the same consent check (and existing env checks).
    - Add a persistent “Manage cookies” entry point in footer/settings to reopen/update consent.
    - Update `app/app/privacy/page.tsx` with explicit consent language (essential vs optional categories, what loads only after opt-in).
  - *Acceptance:*
    - First visit with analytics envs set shows consent UI.
    - Before consent: no PostHog init/capture and no Google Ads script load.
    - After accept: tracking initializes and events fire as expected.
    - After reject: tracking remains disabled and choice persists across reloads.
    - User can change choice later via “Manage cookies”.
    - Privacy policy copy matches actual runtime behavior.
- [x] **CSP staged enforcement with reporting** — Move from report-only toward enforced CSP with an explicit rollout plan.
  - *Acceptance:* Reporting endpoint/mechanism is configured; policy is deployed in report-only first with documented review window; enforcement mode is enabled after violations are triaged; no critical route breakage in smoke checks.

### Phase 9C (P1): Metric contract + governance

- [x] **Resolve annual-rent vs NOI basis mismatch** — Align math/display contract for annual rent relative to vacancy-adjusted NOI.
  - *Acceptance:* Metric definitions are explicitly aligned or clearly labeled as different bases; dashboard/API/export use the same contract; policy/docs updated to match.
- [x] **Benchmark math helper consistency** — Centralize benchmark delta math usage across API and UI.
  - *Acceptance:* `benchmark/refresh` delta calculation uses shared benchmark helper(s) from `lib/benchmark-utils.ts`; no duplicated formula drift.
- [x] **Benchmark freshness boundary contract** — Decide and document strict vs inclusive 60-day freshness behavior.
  - *Acceptance:* `isBenchmarkFresh` boundary behavior is explicit in code/tests/docs; UI copy/tooltips do not conflict with implementation.
- [x] **Align governance hook policy enforcement** — Make `.cursor/hooks.json` ASK-risk behavior match documented shell-risk policy.
  - *Acceptance:* Hook prompt and `docs/policies/shell-risk-policy.md` define the same ASK-risk categories; `docs/process/pm-agent-workflow.md` reflects the same rules; command-integrity check docs updated if needed.
- [x] **Clarify RentCast quota model** — Resolve shared-pool ambiguity between rent and value estimate quota accounting.
  - *Acceptance:* Either split counters by endpoint type or document shared-pool behavior in code/docs and surface user-facing limits where appropriate.(no surfacing to user)

### Phase 9D (P2): Reliability + perf hardening

- [x] **Reliability hardening follow-up** — Improve production failure visibility and fallback UX for key error paths.
  - *Acceptance:* Stripe subscription-sync user-resolution failures are sent to Sentry with actionable metadata; `app/app/global-error.tsx` has accessible on-brand fallback UX; API logging/Sentry expectations are documented in architecture practices.
- [x] **Public route rendering performance cleanup** — Address known medium-priority performance drift on public routes.
  - *Acceptance:* Landing/pricing images use `next/image`; stable marketing/legal pages either use `revalidate` or have explicit documented rationale for dynamic rendering.
- [x] **Add export abuse controls** — Add rate limiting (or equivalent abuse controls) for portfolio CSV export endpoints.
  - *Acceptance:* `GET /api/export/portfolio` is protected by explicit abuse control; admin export path decision is documented (also protected or intentionally exempt with rationale).
- [x] **Contact route auth/scoping decision** — Align contact endpoint auth helper behavior with security policy.
  - *Acceptance:* Route is updated to `getActiveAppUser()` or policy/docs explicitly state and justify allowing soft-deleted users to submit contact forms.
- [x] **Audit regression coverage for benchmark load spikes** — Add integration/e2e coverage for many stale benchmarks.
  - *Acceptance:* Automated coverage verifies capped/queued refresh behavior, quota handling, and user-visible state on large stale sets.

### Deferred / declined from synthesis (owner decisions)

- [ ] **Deferred:** Split `add-property-wizard.tsx` into smaller step modules/hooks.
  - *Acceptance:* Keep deferred until complexity/velocity signals justify refactor.
- [ ] **Declined:** Onboarding panel decorative style simplification.
  - *Acceptance:* No action unless design direction changes.
- [ ] **Declined:** Optional nav micro-copy / tooltip changes for Analyze vs Deals and Plans/Pricing cross-link.
  - *Acceptance:* No action.

### Needs clarification before implementation (IF PM Gets here, stop here after clarifying)

- [x] **Clarify tolerance-aware payoff task scope** — Confirm desired strict vs tolerance behavior for extra-payment payoff helpers before implementation.
  - *Decision (PM/owner):* **Hybrid contract**. Keep payoff math strict in core contracts (API/export/core helpers), and allow tolerance-aware interpretation only in UI with explicit disclosure copy.
  - *Acceptance:* Decision recorded; implementation task added below.
- [x] **Implement hybrid payoff contract (strict core + tolerance-aware UI disclosure)** — Apply strict payoff semantics to core data contracts while preserving user-friendly tolerance handling in UX.
  - *Acceptance:*
    - Core helper/API/export contract uses strict payoff semantics only (no implicit tolerance-based payoff in canonical data outputs).
    - UI surfaces may show tolerance-aware payoff states, but must include clear disclosure text and tooltip/help copy describing tolerance behavior.
    - Tests cover strict-vs-tolerance divergence cases and ensure API/export remain strict.
    - Policy/docs are updated so math contract and UI wording stay aligned.

---

## Batch 10: Growth follow-ups (separate)

*Owner requested this lane be batched separately from Batch 9.*

- [x] **Funnel instrumentation expansion** — Add high-signal events for CTA clicks, onboarding modal actions, and add-property flow milestones.
  - *Acceptance:* New events are documented in `docs/launch/analytics.md`, emitted once per intended action, and visible in PostHog.
- [x] **Pricing intent propagation** — Pass plan intent from logged-out pricing to sign-up and post-auth flows.
  - *Acceptance:* Sign-up receives deterministic plan intent (`?intent=` or equivalent), and downstream copy/event properties reflect it.
- [x] **Growth analytics documentation polish** — Document signup event eligibility/window and optional billing success view event behavior.
  - *Acceptance:* Internal analytics docs clearly define event windows/dedup rules and any optional event usage.

---

## Batch 11: Business follow-ups (approved subset — 2026-03-28)

- [x] **Internal billing matrix** — `docs/internal/billing-matrix.md`: tier → property/deal limits → RentCast hourly caps → Stripe `STRIPE_PRICE_ID_*` → `NEXT_PUBLIC_PRICE_*`; includes release verification checklist.
- [x] **Roadmap mortgage-balance reconciliation** — `docs/reference/roadmap.md` mortgage section aligned with shipped state and `docs/tasks.md` (done vs deferred).
- [x] **Terms last updated** — Matches Privacy review recency (`March 2026`); source `TODO(legal)` for operating entity alignment with `docs/business-launch-checklist.md` (no forced entity rename).
- [x] **Pricing footnote** — Single line on `/pricing` for third-party estimate hourly limits by tier.
- [ ] **Trust strip / testimonials / logos** — *Deferred* (explicitly out of approved Batch 11 scope).

---

## Batch 12: Audit follow-ups (2026-03-28 run 2)

*Source: `docs/audits/synthesis/2026-03-28-audit-synthesis-2.md`. Ordered by PM priority after review.*

### High priority

- [x] **Make CSP reporting endpoint public** — Ensure anonymous browsers can submit CSP violation reports from public pages.
  - *Acceptance:* `/api/csp-report` is explicitly allowed through `app/proxy.ts` (or equivalent public-route mechanism); anonymous POST requests succeed; report-only/enforced CSP on public routes can reach the endpoint without auth redirects or 401/403 behavior; docs remain accurate.
- [x] **Ship benchmarking v2 consistency contract** — Apply one shared benchmark-comparability contract across dashboard, properties list, and property detail.
  - *Acceptance:* A single helper (for example `isBenchmarkComparable(...)` or equivalent) governs benchmark eligibility using the agreed rented/rent/market-data rules; dashboard/list/detail surfaces do not drift in whether they show comparison, refresh, or hidden-state copy; regression tests cover not-rented, rent-missing, stale, and eligible states.
- [x] **Surface RentCast quota visibility near estimate actions** — Reduce surprise quota exhaustion by showing remaining quota context near estimate/refresh flows.
  - *Acceptance:* User-facing estimate/refresh surfaces show clear quota context (remaining uses or equivalent shared-pool hint) before hard failure; copy matches the documented shared-pool quota model; behavior is consistent across relevant estimate/benchmark entry points.

### Medium priority

- [x] **Forward CSP violation reports to Sentry** — Improve production visibility for CSP rollout monitoring.
  - *Acceptance:* `POST /api/csp-report` forwards violation reports to Sentry in production with sane grouping/sampling to avoid noise; local/dev behavior remains lightweight; docs for CSP rollout and monitoring mention where reports are reviewed.
- [ ] **Prepare business metrics snapshot for next valuation pass** — *Deferred by owner (2026-03-30): no in-repo MRR/subscriber snapshot until live metrics are available; valuation can use Stripe/PostHog exports ad hoc when needed.*
  - *Acceptance (when re-enabled):* A documented template or checklist exists for tracking core business metrics (at minimum MRR, churn, and active users), with clear note that the data may live outside the repo if preferred; next valuation audit can reference this source directly.

### Low priority

- [x] **Keep audit lane docs/rules synchronized** — Add a lightweight governance reminder so lane naming and paths stay aligned when audit structure changes.
  - *Acceptance:* Relevant process/docs clearly state that lane-name or folder changes must update `docs/audits/README.md` and matching `.cursor/rules/*` references in the same pass; no stale lane references remain in current docs.
- [x] **Add benchmark-display regression coverage when benchmarking v2 lands** — Extend tests once the shared benchmark contract is implemented.
  - *Acceptance:* Automated coverage verifies benchmark display behavior for the shared comparability contract, including hidden/refreshable/eligible states, and guards against future UI drift.

---

## Batch 13: Owner notes follow-ups (2026-03-29)

*Source: `docs/owner_notes/notes.md` items O7-O11 that are not yet tracked elsewhere in `docs/tasks.md`.*

### Product / UX

- [x] **Fix Analyze Deal stress-mode popup contrast (O7)** — Improve readability and contrast for the rent-sensitivity and expense-sensitivity stress-mode popup in Analyze Deal.
  - *Acceptance:* Popup text and interactive states meet the app's normal readability standard in the relevant app theme(s); no low-contrast text remains; styling stays aligned with `docs/policies/design-spec.md`.

### Audit / governance process

- [x] **Add documentation audit lane and process (O8)** — Create a lightweight documentation audit process for stale docs, archive candidates, broken references, and folder hygiene.
  - *Acceptance:* A process doc exists under `docs/process/`; any required `.cursor/rules/` audit rule exists if this lane should be runnable via agent command; `docs/audits/README.md` is updated if the new lane is adopted; scope clearly distinguishes cleanup recommendations from implementation tasks.

- [x] **Add legal/compliance audit lane with clear disclaimer (O8)** — Define a practical AI-assisted legal/compliance review process for obvious app-facing issues without presenting it as a substitute for counsel.
  - *Acceptance:* A process doc exists describing scope, exclusions, and disclaimer language; it covers obvious privacy/terms/cookie/comms checks relevant to this app; if adopted as an audit lane, matching docs/rules/output location are wired consistently.

- [x] **Expand agent-governance audit scope for workflow consistency (O8)** — Update the AI governance audit/process so it explicitly reviews drift between hooks, rules, docs, and actual day-to-day usage.
  - *Acceptance:* `docs/process/agent-governance-audit-process.md` and any matching rule prompt explicitly include: hook-vs-doc drift, where guidance should live (hook vs rule vs doc), and AI workflow consistency recommendations; docs remain aligned per `docs/process/command-integrity-check.md`.

### Documentation / enablement

- [x] **Create project grounding write-up (O9)** — Write a multi-section overview of the application covering what it is, current architecture, integrations, AI workflow, coding principles, current state, and likely future direction.
  - *Acceptance:* A doc exists in `docs/` with clear sections for product overview, stack/integrations, AI process, coding principles, current state, and future direction; it is written for the owner rather than external marketing copy; references key source docs where useful.

- [x] **Create demo preparation guide (O10)** — Write a demo-prep document that explains app concepts, metrics, and major pages progressively enough for a non-expert owner to speak confidently about the product.
  - *Acceptance:* A doc exists in `docs/` with plain-English explanations of key terms (including NOI and related metrics), explanation of how metrics are calculated at a high level, and walkthrough sections for dashboard, modeling, property detail, mortgage, and other relevant pages.

### Strategic analysis

- [x] **Produce differentiator / value-add analysis (O11a)** — Research and document the highest-value feature, positioning, UX, and product differentiators for Veld Portfolio.
  - *Acceptance:* A doc exists with at least 10 ranked suggestions, each with rationale and an importance score; recommendations may include feature, UX, positioning, or visual-differentiation ideas, but should stay grounded in the current product and target user.

- [x] **Produce AI operations efficiency analysis (O11b)** — Review the current AI workflow and recommend process, tooling, model-usage, and operating improvements for the owner.
  - *Acceptance:* A doc exists with concrete recommendations covering current workflow strengths/weaknesses, model/task fit, when to use hooks vs docs vs rules, and practical operational ideas (for example remote access / on-the-go workflows where relevant); recommendations are specific enough to change how the project is run.

---

## Archived references (2026-03)

Detailed completed QA/history sections were moved to `docs/tasks-archived.md` to keep this file focused on active work:

- Property detail overhaul test checklist (verified complete; moved to archive).
- Property detail tabs UX refinements test checklist (verified complete; moved to archive).
- Recently completed implementation notes and summaries.
- Details tab Phase B inline editing completion checklist.

---

## Batch 14: Full audit synthesis follow-ups (2026-03-30 Run 4)

*Source: `docs/audits/synthesis/2026-03-30-audit-synthesis-4.md`. **Excluded from this batch:** (1) **MRR/subscriber snapshot** — owner preference: no placeholder until real numbers exist (see Batch 12 note). (2) **CSP work** — deferred to **Batch 14 — Deferred: CSP** below; owner will review CSP implications with PM before implementation.*

### Paid ads & paid acquisition (operational)

*Aligns launch narrative with runbooks and QA so paid Search/social work is discoverable from docs.*

- [x] **Launch plan operational links** — In `docs/launch/launch-plan.md`, ensure §2.2 (or adjacent) includes a short **Operational links** list: pre-live telemetry QA, paid-ads monitoring runbook, campaign build sheet, and at least one readout or variant doc under `docs/launch/`.
  - *Acceptance:* From `launch-plan.md`, PM can open telemetry QA + runbook + campaign doc in ≤3 link hops; paths are valid.
- [x] **Index paid acquisition docs** — `docs/README.md` Launch & growth lists `pre-live-telemetry-qa-2026-03-30.md` (or a stable “latest” pointer if renamed later).
  - *Acceptance:* `docs/README.md` includes the pre-live QA doc alongside existing paid-ads entries.
- [x] **Env prerequisites for ads + PostHog (owner checklist)** — `docs/setup/manual-steps.md` § Hosting (or a dedicated bullet) lists **all** of: `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL`, `NEXT_PUBLIC_GOOGLE_ADS_PROPERTY_CREATED_CONVERSION_LABEL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, with pointer to `docs/launch/analytics.md` and `docs/launch/pre-live-telemetry-qa-2026-03-30.md`.
  - *Acceptance:* New deploy checklist matches `pre-live-telemetry` §2; no contradictory “ads blocked” language without an “as of” date.

### UX / Feature

- [x] Add logged-in CTA or copy on `/pricing` pointing to `/plans`; align FAQ “account settings” wording with actual surfaces (`/plans`, Settings).
- [x] Unify empty-state classes across `modeling-workspace.tsx`, `mortgage-workspace.tsx`, and `deals/page.tsx`.
- [x] Mobile drawer: focus management and modal semantics (`app-layout-client.tsx`).
- [x] Deal Analyzer: unsaved-changes warning (`beforeunload` when dirty; baseline after load/save) (`deal-analyzer-form.tsx`).
- [x] Safe-area padding for fixed chrome and `prefers-reduced-motion` audit for animated UI.
- [x] Footer: align `©` year with current year / policy refresh (coordinate with privacy/legal copy).

### Performance

- [x] Refactor tier-limited list/export/summary queries to use `orderBy` + `take` at the database (including deals).
- [x] Add Prisma migration for `Property.userId`, `SavedDeal.userId`, and `Mortgage.propertyId` indexes; verify query plans.
- [x] Admin: paginate or aggregate RentCast by-user stats; cap user scan for per-plan property averages.
- [x] Spike: reduce `getAppUser` upsert to conditional updates after profile diff.

### Reliability

- [x] `Sentry.captureException` on Resend error in `app/app/api/contact/route.ts` when DSN present.
- [x] Evaluate Stripe webhook idempotency for `captureServerEvent` paths (store `event.id` or document acceptance of duplicate analytics). — *Documented:* `docs/internal/stripe-webhook-posthog-idempotency.md` + comment on webhook route.
- [x] Optional: CI smoke or documented script calling `/api/health` against staging. — *Doc:* `docs/runbooks/health-check-smoke.md`.
- [x] Add `loading` fallback to dynamic imports in `mortgage-workspace.tsx` (and modeling workspace if applicable).

### Data integrity

- [x] Decide and implement API parity for plan limits on `GET /api/properties` and `GET /api/deals`, or publish a non-code contract for integrators. — *Contract:* `docs/internal/api-list-contract.md` (full GET lists vs UI caps).
- [x] Clarify saved-deals vs `ownershipDisplayMode` in product copy or align deal metrics with user display mode.
- [x] Optional: extend CSV import to support a distinct `address line 2` column when present.
- [x] Document or query **effective tier** consistently for ops/analytics (override + Stripe). — *Doc:* `docs/internal/effective-tier-analytics.md` (+ links from `billing-matrix.md`).

### Growth

- [x] Add `FunnelCtaLink` (with `placement` / `cta_id` / `planIntent`) for pricing page footer “Create free account” and public calculator page inline “create a free account”. — *Calculator:* already used `FunnelCtaLink` on primary CTAs; pricing footer updated.
- [x] Optionally add `FunnelCtaLink` for home “Simple pricing” → “View pricing” for consistent session-level CTA coverage. — *Already:* `See pricing` uses `FunnelCtaLink` (`landing_hero` / `view_pricing`).
- [x] Fix `user_signed_up` dedup key documentation in `docs/launch/analytics.md` to match `posthog-signup-once.tsx`.

### Governance

- [x] Update `docs/cursor-agent-setup.md` for **12 lanes** and Documentation + Legal audit rules, process docs, folders, and clone checklist.
- [x] Reconcile full-audit lane count / Code-skip wording between `docs/process/full-audit-synthesis.md` §6 and `.cursor/rules/full-audit-agent.mdc`.

### Math

- [x] Align `docs/reference/engineering-spec.md` §6 with current metrics policy or mark it superseded.
- [x] Refresh `docs/process/math-logic-audit.md` module inventory and benchmark freshness phrasing.
- [x] Add golden coverage for partial-ownership portfolio aggregation (if product priority). — *Test:* `app/lib/metrics/portfolio-metrics.test.ts`.

### Business

- [x] **Reconcile `docs/launch/launch-plan.md` §2.2 paid-ads vs telemetry** — Updated 2026-03-30: paid ads may run with PostHog + runbooks; superseded “keep ads off until baseline” language folded into dated note.
- [x] Add Vitest coverage for `planTierFromPriceId` + webhook branches using Stripe fixtures (no live keys). — *Done:* `app/lib/stripe-config.test.ts` for `planTierFromPriceId`; webhook PostHog behavior documented (`docs/internal/stripe-webhook-posthog-idempotency.md`). *Deferred:* full route handler Vitest for webhook (heavy Stripe mocks).

### Documentation

- [x] Extend `docs/README.md` Process section with `documentation-audit-process.md` and `legal-compliance-audit-process.md`.
- [x] Link `posthog-views-setup.md` from Launch & growth and/or `analytics.md`.
- [x] Update `docs/audits/documentation/README.md` and `.cursor/rules/documentation-audit-agent.mdc` for optional `…-audit-N` same-day report naming.
- [x] Add a latest-synthesis pointer to `docs/audits/synthesis/README.md` (or top-level `docs/README.md`).
- [x] Refresh `docs/tasks.md` roadmap-priority table date label (or retitle to “last reviewed”) when next edited.
- [x] Bump “Last updated” on `docs/visual-assets-guide.md` when content is next reviewed.

### Legal / Compliance

- [x] Privacy Policy: add explicit **server-side PostHog** (Stripe webhook) disclosure and relationship to cookie consent.

### Code quality / hygiene

- [x] Remove or consolidate duplicate Prisma seed entry in `app/package.json` after CLI verification. — *Removed redundant `package.json#prisma.seed`; canonical seed is `prisma.config.ts` → `migrations.seed`.*

### Deferred: CSP (owner review with PM — keep for later)

*Owner wants to collaborate on CSP before changes: what enforcement means, reporting vs blocking, and production implications.*

- [ ] **(Deferred)** Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` values match `docs/policies/csp-rollout.md` expectations.
- [ ] **(Deferred)** Optionally add a request body size guard for `POST /api/csp-report` if monitoring shows abuse.

---

## Batch 15: Data integrity & API clarity (2026-03-30 Run 5 synthesis)

*Source: `docs/audits/synthesis/2026-03-30-audit-synthesis-5.md` and `docs/audits/data-integrity/2026-03-30-data-integrity-audit-5.md`. **Intent:** Remove ambiguity when plan caps, “latest N” slices, and full-list GETs coexist so totals and list counts cannot be confused.*

### Data integrity & API contracts

- [x] **Portfolio summary / export — explicit denominator** — `GET /api/portfolio/summary` returns `slice: { propertyCountTotal, propertyCountIncluded, propertyLimit, truncated }`. `GET /api/export/portfolio` sets `X-Veld-Property-Count-Total`, `X-Veld-Property-Count-Included`, `X-Veld-Property-Limit`, `X-Veld-Property-Slice-Truncated`. [`docs/internal/api-list-contract.md`](internal/api-list-contract.md) documents both.
  - *Acceptance:* Summary JSON includes `slice` with correct counts when total properties &gt; plan limit and when under limit; CSV download response exposes the same counts via headers; contract doc matches implementation.
- [x] **`GET /api/deals` vs capped deals UI** — API remains a **full** JSON array; response headers `X-Veld-Deal-Count-Total`, `X-Veld-Plan-Deal-Limit`, `X-Veld-Deals-Exceeds-Plan-Ui-Cap` document relationship to the Deals page cap. See [`docs/internal/api-list-contract.md`](internal/api-list-contract.md).
  - *Acceptance:* Headers present on successful GET; when `dealCountTotal &gt; dealLimit`, `X-Veld-Deals-Exceeds-Plan-Ui-Cap` is `true`; integrators can read contract without breaking existing array clients.
- [x] **Saved deals vs `ownershipDisplayMode`** — [`docs/policies/ownership-metrics.md`](policies/ownership-metrics.md) §5 states saved-deal/API metrics use **proportional** math only; the Deals page already explains proportional math vs portfolio full-liability mode (`app/app/(app)/deals/page.tsx`).
  - *Acceptance:* Policy doc names saved deals + API; deals page copy remains consistent (no implication of full-liability parity for deal metrics).

### Optional documentation

- [x] **Multi-lien CSV round-trip** — [`docs/reference/portfolio-csv-export.md`](reference/portfolio-csv-export.md) § Import compatibility documents lossy re-import for multi-lien exports.
  - *Acceptance:* One clear paragraph on round-trip limits; points operators to property detail for extra liens.

---
