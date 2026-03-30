# Full Audit Synthesis — 2026-03-20

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
- [ ] Add `STRIPE_WEBHOOK_SECRET` to startup env validation in `app/lib/env.ts` (or document equivalent deploy gate). *(Security: Medium)*
- [ ] Align RentCast estimate error handling in `app/app/api/estimates/rent/route.ts` and `app/app/api/estimates/value/route.ts`: use non-2xx on failures and avoid exposing raw provider error messages. *(Security/Data: Medium)*

### UX / Feature
- [ ] Update property Overview copy in `app/app/(app)/properties/[id]/overview-tab-content.tsx` so Details description matches actual behavior (Details includes editable mortgage section). *(Feature: High)*
- [ ] Add explicit analyze-mode helper for users with `ownershipDisplayMode === "full_liability"` to clarify Deal Analyzer currently uses proportional assumptions. *(Feature/Data: High)*
- [ ] Add `propertyId` query sync in `app/app/(app)/modeling/modeling-workspace.tsx` to match mortgage workspace deep-link behavior. *(Feature: Medium)*
- [ ] Adjust signed-in pricing navigation path (`landing-nav.tsx` and/or `/pricing`) so authenticated users have a direct, clear route to `/plans` billing context. *(Feature/Growth: Medium)*

### Performance
- [ ] Dynamic-import heavy chart sections in `app/app/(app)/properties/[id]/projections-tab-content.tsx` and `.../mortgage-tab-content.tsx` with client-side loading placeholders. *(Code/Performance: Medium)*
- [ ] Replace marketing `<img>` usage in `app/app/page.tsx` and `app/app/pricing/page.tsx` with `next/image` (or explicitly document exceptions). *(Code/Performance: Medium)*
- [ ] Implement static/ISR strategy for marketing/legal/pricing surfaces where possible; confirm route table intent after build. *(Performance: High)*
- [ ] Rework `RentVsMarketSection` stale refresh strategy to avoid automatic POST bursts against RentCast quotas; prefer explicit batch/per-row refresh UX with limits messaging. *(Performance/Growth: High)*
- [ ] Replace load-all-then-slice plan-limit query pattern with limited Prisma queries for over-limit users. *(Performance: High)*
- [ ] Add/verify Prisma indexes for hot paths (`Property.userId`, `SavedDeal.userId`, `RentCastApiCall(userId, createdAt)`) and validate estimate count query plans. *(Performance/Data: Medium)*
- [ ] Replace pathname-driven `/api/me` sync for PostHog person properties with server-fed props or debounced strategy. *(Performance: Medium)*

### Reliability
- [ ] Align local gate semantics: update `app/package.json` `check` or docs so pre-merge expectations match CI (lint + tests, not lint/build only). *(Reliability: High)*
- [ ] In `app/app/(app)/app-layout-client.tsx`, handle non-OK `/api/me` responses and fetch failures with telemetry and safe fallback behavior. *(Reliability: Medium)*
- [ ] Report contact-route delivery failures to Sentry in `app/app/api/contact/route.ts` when DSN is configured. *(Reliability: Medium)*

### Data Integrity
- [ ] Export full property type values in `app/app/api/export/portfolio/route.ts` to preserve import round-trip parity with parser/schema enums. *(Data: High)*
- [ ] Add optional `unit rents` export column when `unitRents` exists; keep backward compatibility for older imports. *(Data: Medium)*
- [ ] Document or align `GET /api/properties` ordering/subset semantics with dashboard/export plan-limit behavior. *(Data: Medium)*
- [ ] Add shared runtime guard for `unitRents` when reading from DB-backed surfaces (if not centrally enforced already). *(Data: Medium)*
- [ ] Consider extending `/api/properties/[id]/metrics` with DSCR/debt-service basis fields to match UI reconciliation expectations. *(Data: Low)*

### Growth
- [ ] Update home pricing preview copy to include Free-tier deal limits (not property-only), with link to full `/pricing`. *(Growth: High)*
- [ ] Decide and implement a single primary first-session CTA on empty dashboard, with secondary actions collapsed or clearly deprioritized. *(Growth: Medium)*
- [ ] Add pricing-intent handoff from public plan CTAs (querystring/session) so post-signup users land with billing context. *(Growth: Medium)*
- [ ] Align `/sign-in` footer/legal links with `/sign-up` trust affordances. *(Growth: Medium)*
- [ ] Evaluate post-checkout CTA priority on billing success page toward activation flow (`/dashboard`) and test impact. *(Growth: Low)*

### Governance
- [ ] Update `.cursor/hooks.json` beforeShellExecution prompt so ASK guidance matches `docs/policies/shell-risk-policy.md` for network-heavy and side-effect external commands. *(Governance: High)*
- [ ] After hook update, align `docs/process/pm-agent-workflow.md` to the exact ASK/ALLOW behavior. *(Governance: High)*
- [ ] Update `.cursor/rules/full-audit-agent.mdc` to enforce exact lane report filenames or defer explicitly to lane rules/`docs/audits/README.md`. *(Governance: Medium)*
- [ ] Clarify `docs/process/full-audit-synthesis.md` section on whether Code can be skipped in a "full audit" and synthesis behavior when a lane is skipped. *(Governance: Medium)*

### Math
- [ ] Refactor duplicated monthly payoff/projection loop logic in `projections-tab-content.tsx` to consume shared `app/lib/amortization.ts` helpers. *(Math/Code: Medium)*

### Business
- [ ] Create an internal commercial matrix doc mapping tier limits (`lib/plans.ts`) to Stripe IDs and public pricing env/display fields. *(Business: Medium)*
- [ ] Add an investor-demo reconciliation checklist for one golden property: dashboard vs detail vs CSV export using `ownership-metrics` policy assumptions. *(Business: Medium)*

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.
