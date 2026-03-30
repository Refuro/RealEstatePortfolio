# Full Audit Synthesis — 2026-03-28

## Audits included

- Code
- Math & Logic
- Feature / UX / IA
- Security & Privacy
- Performance & Cost
- Reliability & Operations
- Data Integrity & Reconciliation
- Business & Valuation
- Growth Funnel & Activation
- AI Agent Governance

## Consolidated task list

### Security

- [ ] Add `STRIPE_WEBHOOK_SECRET` to production `validateEnv()` or a documented deploy gate (align with `docs/setup/manual-steps.md`). *Sources: Security (High).*
- [ ] CSP: Implement violation reporting (`report-to` / Sentry / dedicated endpoint) and a staged **enforcement** plan for `Content-Security-Policy` (graduate from report-only). *Sources: Security (High).*
- [ ] Add rate limiting (or equivalent abuse control) for `GET /api/export/portfolio` and optionally admin user CSV export. *Sources: Security (Medium).*
- [ ] RentCast hourly quota: **separate** counters for rent vs value estimate endpoints **or** document shared-pool behavior in code and product copy; optionally surface limits on `/pricing` (see Business). *Sources: Security (Medium), Performance & Cost (Medium), Business (Medium).*
- [ ] Contact route: use `getActiveAppUser()` **or** explicitly document that soft-deleted users may submit contact. *Sources: Security (Low).*

### UX / Feature

- [ ] Single-property dashboard: align benchmark UI with `getBenchmarkEligibility` — for `not_rented` / `rent_missing`, do not surface `BenchmarkRefreshButton` inappropriately; add explicit vacant copy consistent with property detail and multi-property rent section (`dashboard/page.tsx`, `dashboard-charts.tsx`). *Sources: Feature / UX (High).*
- [ ] Replace or cap automatic sequential benchmark refresh in `RentVsMarketSection` (e.g. max one per visit, explicit “Refresh all”, or server-side queue with user-visible progress). *Sources: Code (High), Feature / UX (Medium), Performance & Cost (High).*
- [ ] Add Properties list filter for “Not rented” / “Vacant” (copy aligned with existing “Currently rented” strings). *Sources: Feature / UX (Medium).*
- [ ] Simplify `OnboardingPanel` styling per design spec (reduce decorative blur / heavy shadow). *Sources: Feature / UX (Medium).*(OWNER IS DECLINING THIS, I LIKE THIS EFFECT)
- [ ] Split `add-property-wizard.tsx` into step components or hooks under `app/(app)/properties/` (or shared `components/properties/`). *Sources: Code (High).*(DEFER THIS, UNNECCESARRY RN)
- [ ] Split `property-form.tsx` into section components; share validation wiring once. *Sources: Code (High).*
- [ ] Extract non-UI projection logic from `projections-tab-content.tsx` into `lib/` and lazy-load Recharts with `next/dynamic` + placeholder (pattern from `dashboard-charts.tsx`). *Sources: Code (High).*
- [ ] Audit `shadow-sm` on dashboard rent-vs-market card against `docs/policies/design-spec.md` and align with flat card pattern if desired. *Sources: Code (Low).*
- [ ] Optional: nav micro-copy or tooltip for “Analyze deal” vs “Deals”; optional cross-link between `/plans` and `/pricing` for confused users. *Sources: Feature / UX (Low).* (OWNER DOES NOT WANT)

### Performance

- [ ] Add Prisma migration: `@@index([userId, createdAt])` on `RentCastApiCall` for hourly `count` queries. *Sources: Performance & Cost (High).*
- [ ] Replace raw `<img>` on `app/page.tsx` and `app/pricing/page.tsx` with `next/image` (explicit dimensions). *Sources: Code (Medium), Performance & Cost (Medium).*
- [ ] Add `export const revalidate` (or document why not) on stable marketing/legal routes (`/`, `/privacy`, `/terms`, `/changelog`, `/pricing`) per architecture §2.5, evaluating Clerk/auth tradeoffs. *Sources: Code (Medium), Performance & Cost (Medium).*
- [ ] Optional: run `@next/bundle-analyzer` on `app/` and attach baseline to a future audit. *Sources: Performance & Cost (optional).*

### Reliability

- [ ] Normalize `GET /api/estimates/rent`, `GET /api/estimates/value`, and benchmark refresh: return **non-2xx** on upstream/hard failures (e.g. 502/503) while keeping JSON `{ error }` for clients; **record** `rentCastApiCall` only after successful upstream responses (or split attempt vs success metrics); verify property form and add-property wizard still handle errors. *Sources: Security (Low finding), Performance & Cost (High), Reliability & Ops (High).*
- [ ] Stripe webhook: on `syncSubscriptionToDb` user-resolution failure, report to Sentry (or equivalent) with subscription/customer IDs; keep HTTP 200 to Stripe. *Sources: Reliability & Ops (Medium).*
- [ ] Redesign `app/app/global-error.tsx` with accessible, on-brand fallback UI and recovery links (support path optional). *Sources: Reliability & Ops (Medium).*
- [ ] Document API error logging + Sentry expectations (when to `captureException` / `captureMessage` vs `console.error`) in `docs/architecture-and-build-practices.md`. *Sources: Reliability & Ops (Medium).*
- [ ] Optionally align Sentry DSN gating / capture behavior between `global-error.tsx` and `(app)/error.tsx`. *Sources: Reliability & Ops (Low).*
- [ ] Add integration or E2E coverage for “many stale benchmarks” (hourly RentCast limit, latency, UX). *Sources: Code (High).*
- [ ] Optional: CI step or documented script to hit `/api/health` in a test environment; optional runbook note that DB outage affects rate limits and estimate quotas. *Sources: Reliability & Ops (Low).*

### Data Integrity

- [ ] Export CSV: emit canonical property type labels / enum (not collapsing condo/townhouse/etc. to “Single family”); add regression test vs `PROPERTY_TYPE_LABELS` / `PROPERTY_TYPE_MAP`. *Sources: Data Integrity (High).*
- [ ] Import: after parsing a row, set `currentMonthlyRent` from `sum(unitRents)` when per-unit rents are present; validate or pick a single source of truth vs `rent` column; add optional `isRented` column or infer vacant when total rent is 0 — document behavior. *Sources: Data Integrity (High).*
- [ ] POST `/api/properties`: return `unitRents` normalized with `parseUnitRentsFromDb` (parity with GET). *Sources: Data Integrity (Medium).*
- [ ] PATCH `/api/properties/[id]`: when splitting `currentMonthlyRent` into `unitRents`, use effective `propertyType` (`data.propertyType ?? existing.propertyType`); add API test for combined update. *Sources: Data Integrity (Medium).*
- [ ] Export multi-mortgage: add per-lien columns, repeated rows per property, or explicit “primary mortgage only” labeling **and** user-facing docs for row semantics. *Sources: Data Integrity (Medium), Math & Logic (Medium).*
- [ ] Optional: `getPropertyTotalRent` returns 0 when `isRented === false` for defensive metrics consistency. *Sources: Data Integrity (Low).*

### Growth(BATCH THIS SEPARATELY)

- [ ] PostHog: expand funnel instrumentation — e.g. `cta_click` (or similar) on landing/pricing primary actions; `welcome_modal_shown` / `dismissed` / `start_property` in `onboarding-panel.tsx`; optional wizard milestone or `add_property_wizard_started`. *Sources: Growth Funnel (High).*
- [ ] Pass plan intent from logged-out pricing to sign-up (e.g. `?intent=investor|pro` or `plan`) for analytics and post-auth messaging. *Sources: Growth Funnel (High).*
- [ ] Optional: `billing_success_viewed` client event on `/billing/success` (dedupe with webhook `subscription_activated`). *Sources: Growth Funnel (Medium).*
- [ ] Optional: align “Choose Investor/Pro” copy with actual post-sign-up path, or soften CTAs if plan preservation is deferred; optional Clerk sign-in logo/home link. *Sources: Growth Funnel (Low).*
- [ ] Document `user_signed_up` 7-day eligibility rule in an internal analytics runbook. *Sources: Growth Funnel (Medium).*

### Governance

- [ ] Sync `beforeShellExecution` prompt in `.cursor/hooks.json` with `docs/policies/shell-risk-policy.md` ASK list (e.g. network-heavy / external API side effects). *Sources: Agent Governance (Medium).*
- [ ] Update `docs/process/pm-agent-workflow.md` §3 command-risk bullets to match the chosen ASK set. *Sources: Agent Governance (Medium).*
- [ ] When adding/renaming audit lanes: edit `full-audit-agent.mdc`, `docs/process/full-audit-synthesis.md`, `docs/audits/README.md`, and `docs/process/command-integrity-check.md` in one pass. *Sources: Agent Governance (Medium).*
- [ ] Optional: add `AGENTS.md` at repo root linking to `docs/cursor-agent-setup.md` and `docs/audits/README.md`. *Sources: Agent Governance (Low).*
- [ ] Optional: extend thin audit rules (`agent-governance-audit-agent.mdc`, `security-audit-agent.mdc`) with explicit subagent scope bullets for parity with code/math rules. *Sources: Agent Governance (Low).*

### Math

- [ ] Fix or relabel portfolio `totalAnnualRent` so dashboard/API “Annual rent” matches the effective gross basis used for NOI (or document contract-only basis in UI and API schema). *Sources: Math & Logic (High).*
- [ ] Decide strict vs tolerance-aware payoff for `getExtraPaymentForYearsEarlier` / `getPayoffYearsWithExtra`; update `app/lib/amortization.ts` and/or `docs/process/math-logic-audit.md`; surface `toleranceApplied` in UI/API if tolerance is retained. *Sources: Math & Logic (High).*(I'm not certain what is meant here, but I don't want to take the ability of a user to estimate their mortgage stuff away if their numbers are slightly off, you may need to confer what you mean here to me before we add it)
- [ ] Use `getBenchmarkPct` (or a single exported helper from `lib/benchmark-utils.ts`) in `benchmark/refresh/route.ts` for `pctAboveBelow`. *Sources: Code (Medium), Math & Logic (implied consistency).*
- [ ] Document or adjust `isBenchmarkFresh` 60-day boundary semantics (strict `<` vs inclusive). *Sources: Math & Logic (Medium).*
- [ ] Optional: guard or document negative-amortization behavior in `generateAmortizationSchedule` when payment &lt; interest. *Sources: Math & Logic (Low).*
- [ ] Update `docs/process/math-logic-audit.md` §1–2 for tolerance helpers and extra-payment behavior. *Sources: Math & Logic (Low).*
- [ ] Refactor `serializeProperty` / mortgage typing in `api/properties/[id]/route.ts` to remove `[key: string]: unknown` where possible. *Sources: Code (Low).*

### Business(Separate batch, we'll need to discuss these items before implementation)

- [ ] Create internal **billing matrix**: tier → property/deal limits → RentCast hourly → Stripe price IDs → `NEXT_PUBLIC_PRICE_*` keys; add release checklist to verify live Stripe prices match display env (`docs/setup/manual-steps.md` pattern). *Sources: Business & Valuation (High).*
- [ ] Reconcile `docs/reference/roadmap.md` mortgage balance section with shipped state in `docs/tasks.md` (check off, split “remaining” vs “done”, or mark deferred). *Sources: Business & Valuation (Medium).*
- [ ] Align Terms “Last updated” date (and entity name when applicable) with Privacy and `docs/business-launch-checklist.md`. *Sources: Business & Valuation (Medium).*
- [ ] Add FAQ line or footnote on `/pricing` for third-party estimate **hourly** limits by tier (from `RENTCAST_HOURLY_LIMITS`). *Sources: Business & Valuation (Medium); ties to Security/Performance RentCast transparency.*
- [ ] When traction exists, add a lightweight trust strip (quote, metric, or logo) to landing — coordinate with Growth. *Sources: Business & Valuation (Low).*

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.
