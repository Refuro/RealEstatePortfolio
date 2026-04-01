# Full Audit Synthesis — 2026-04-01

## Audits included

- Code — `docs/audits/code/2026-04-01-code-audit.md`
- Math & Logic — `docs/audits/math/2026-04-01-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-04-01-feature-ux-audit.md`
- Mobile experience — `docs/audits/feature/2026-04-01-mobile-experience-audit.md`
- Security & Privacy — `docs/audits/security/2026-04-01-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-04-01-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-04-01-reliability-ops-audit.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-04-01-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-04-01-business-valuation-audit.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md`
- SEO (search & discovery) — `docs/audits/seo/2026-04-01-seo-audit.md`
- Documentation — `docs/audits/documentation/2026-04-01-documentation-audit.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-04-01-legal-compliance-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-04-01-agent-governance-audit.md`

---

## Consolidated task list

### Security

- [ ] Add targeted rate limits for high-risk mutating routes: `PATCH /api/properties/[id]`, `PATCH /api/deals/[id]`, and `PATCH /api/admin/users/[id]/tier`.
- [ ] Add lightweight abuse guard for `POST /api/csp-report` (request body-size cap and/or minimal spam throttle).
- [ ] Decide and document production stance for `GET /api/health` exposure (public vs restricted) in threat model docs.
- [ ] Refresh security docs (`docs/security/security-audit.md`, `docs/security/security-notes.md`) to match current CSP sources and rollout behavior in `app/next.config.ts`.

### UX / Feature

- [ ] Add mobile-accessible page-level `<h1>` landmarks for Modeling and Mortgage workspaces (currently missing at narrow breakpoints).
- [ ] Add visible error feedback in `PastDueBanner` when billing portal launch fails.
- [ ] Rewrite in-app calculators hub copy to remove SEO implementation language and keep user-facing intent only.
- [ ] Reduce CTA overload: simplify Properties header action stack and promote one clear post-first-property next-step CTA.
- [ ] Align workspace selector labels to user language (for example "Property" instead of "Modeling context"/"Mortgage context").

### Mobile experience

- [ ] Increase landing-nav hamburger touch target from `size-10` to at least 44x44 (`size-11`) for parity with app shell controls.
- [ ] Run a device-backed narrow viewport matrix pass (320/375/390/430 and 767/768 boundary) and log evidence for currently unverified criteria.

### Performance

- [ ] Reduce `PostHogPersonProperties` `/api/me` fan-out from every pathname change to mount/event-driven sync.
- [ ] Unify dashboard data loading with `buildPortfolioSummaryPayload` (or shared server loader) to remove duplicated query and metric logic.
- [ ] Split heavy client bundles in analyze/marketing paths (`deal-analyzer-form` subregions, homepage `PublicCalculator`) with staged dynamic loading where practical.
- [ ] Evaluate whether app-shell `force-dynamic` can be narrowed or isolated as traffic scales.
- [ ] Optional: add Clerk preconnect/dns-prefetch in layout if RUM shows auth-origin connection delay.

### Reliability

- [x] Add missing browser Sentry initialization (`app/sentry.client.config.ts`) and align client error boundary capture behavior (DSN-safe `app/(app)/error.tsx`). *(Phase 9 — 2026-04-01)*
- [x] Add `Sentry.captureException` in `create-checkout-session` catch; `billing/portal` already captured. *(Phase 9; Stripe cancel / Clerk delete paths unchanged.)*
- [x] Add startup/deploy assertion for `NEXT_PUBLIC_APP_URL` on Vercel (`instrumentation` + `getPublicAppBaseUrlForBilling`). *(Phase 9; `NEXT_PUBLIC_SENTRY_DSN` remains manual in Vercel — no code assertion.)*
- [ ] Wrap high-traffic CRUD routes in structured try/catch + Sentry context capture (`userId`, route metadata).
- [ ] Implement Stripe webhook `event.id` dedup for PostHog server captures to avoid duplicate analytics on retries.

### Data Integrity

- [x] Enforce mortgage validation in CSV import before `tx.mortgage.create` (escrow check + negative-amortization/P&I guard) with row-level error reporting. *(Phase 9 — `lib/import/validate-import-mortgage.ts`, `api/import/portfolio`.)*
- [ ] Add `validateEscrowAmount` parity to embedded mortgage creation in `POST /api/properties`.
- [ ] Harden write-path ownership defense-in-depth by adding user-scoped `where` constraints for property/mortgage delete/update calls currently id-only.
- [ ] Add explicit mortgage start-date import support (instead of implicit `purchaseDate` proxy) and document fallback behavior.
- [ ] Fix export zero-vs-empty handling for mortgage balance columns to distinguish paid-off (`0`) from no-mortgage (blank).
- [ ] Update `docs/reference/portfolio-csv-export.md` with round-trip/export-only/lossy matrix and explicit percent basis notes.

### Growth

- [ ] Track missing funnel events on high-intent paths: landing pricing-preview CTA and `PLAN_LIMIT_HIT` upgrade CTAs.
- [ ] Add plan-intent reinforcement content on sign-up page for `investor`/`pro` intent users.
- [ ] Improve activation discovery by surfacing alternative first actions without hidden disclosure friction.
- [ ] Upgrade billing success content to include activated plan and new limits, not only generic success copy.
- [ ] Reduce repeated paid-intent banner fatigue (move dismiss behavior to bounded local persistence).

### SEO

- [x] Add explicit `noindex` metadata for authenticated app shell/pages (do not rely only on disallow + auth redirects). *(Phase 9 — `app/(app)/layout.tsx` `metadata.robots`.)*
- [ ] Normalize root canonical/sitemap URL formatting to one convention.
- [ ] Add lightweight release SEO regression check to keep `sitemap.ts`, `robots.ts`, and route intent aligned.

### Governance

- [ ] Fix stale lane count in `docs/cursor-agent-setup.md` summary ("12" -> "14").
- [ ] Add explicit 14-lane statement (including SEO + Mobile experience) in `docs/process/agent-governance-audit-process.md`.
- [ ] Optionally add `docs/policies/calculator-metric-tones.md` to `builder-agent.mdc` references for calculator-surface tasks.

### Math

- [ ] Guard `annualizedRoiPercent` in `fix-and-flip-calculator` against `NaN` in >100% loss edge cases; add targeted unit test.

### Business

- [ ] Verify and document `past_due` user-facing path end-to-end (status route -> shell -> visible banner/state).
- [ ] Extend `docs/internal/billing-matrix.md` with auxiliary billing route behavior (`/sync`, `/status`, `/subscription-details`).
- [ ] Complete and evidence the PostHog named funnel verification checklist in `docs/launch/posthog-growth-funnel.md`.
- [ ] Close unchecked operational items in `docs/launch/launch-plan.md` section 9 against production reality.
- [ ] Document currently undefined analytics events (beyond core funnel) in launch analytics docs.

### Documentation

- [ ] Archive completed proposals from `docs/proposals/` into `docs/archive/proposals/` (keep active proposals only in root proposals folder).
- [ ] Expand `docs/README.md` indexing for `docs/internal/` and missing policy/process/launch docs.
- [ ] Archive dated paid-ads readout artifacts from `docs/launch/` into an archive location.
- [ ] Clean up superseded same-day documentation audit reruns once canonical copy is confirmed.

### Legal / Compliance

- [ ] Add concise billing/refund/cancellation disclosure near pricing and upgrade CTAs, linking to exact Terms sections.
- [ ] Route Terms recurring-billing/auto-renew wording through counsel for target jurisdictions.
- [ ] Standardize legal-page metadata hygiene (exact "Last updated" date format; optionally consistent processor policy links).

---

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.

## Deduplication notes

- **Mobile `<h1>` issue** was reported in both Feature and Mobile lanes and is merged into one UX/Mobile implementation item.
- **Landing nav touch target** appeared in both Feature and Mobile lanes and is merged into one Mobile item.
- **`/api/me` PostHog fan-out** appeared in Performance and Growth lanes and is merged into one Performance item.
- **Mutation `userId` defense-in-depth** appeared in Code and Data Integrity lanes and is merged into one Data Integrity item.
- **Billing observability gaps** across Code, Reliability, and Business lanes are grouped under Reliability to avoid duplicate remediation tickets.

---

## Re-test (cross-cutting)

- [x] `npm run check` in `app/` after Phase 9 implementation (2026-04-01).
- [ ] Re-run impacted lane audits after fixes (minimum: Reliability, Data Integrity, Growth, and Mobile if those domains are touched).
- [ ] For billing/auth changes: smoke sign-up/sign-in, checkout, webhook sync, portal launch, and `past_due` recovery flow.
- [ ] For CSV/mortgage fixes: run export -> import round-trip with escrow, stored balance, and negative-amortization edge rows.
- [ ] For SEO/indexing fixes: verify live `robots.txt`, `sitemap.xml`, and app-route `noindex` behavior on production/staging.
