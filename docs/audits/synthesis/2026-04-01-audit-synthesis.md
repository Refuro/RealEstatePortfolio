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

*Status below is mirrored from phased implementation in [`docs/tasks.md`](../../tasks.md) (Phases 10–21). **Last updated:** 2026-04-01.*

### Security *(Phase 10 — complete)*

- [x] Add targeted rate limits for high-risk mutating routes: `PATCH /api/properties/[id]`, `PATCH /api/deals/[id]`, and `PATCH /api/admin/users/[id]/tier`.
- [x] Add lightweight abuse guard for `POST /api/csp-report` (request body-size cap and/or minimal spam throttle).
- [x] Decide and document production stance for `GET /api/health` exposure (public vs restricted) in threat model docs.
- [x] Refresh security docs (`docs/security/security-audit.md`, `docs/security/security-notes.md`) to match current CSP sources and rollout behavior in `app/next.config.ts`.

### UX / Feature *(Phase 14 — complete except device matrix)*

- [x] Add mobile-accessible page-level `<h1>` landmarks for Modeling and Mortgage workspaces (currently missing at narrow breakpoints).
- [x] Add visible error feedback in `PastDueBanner` when billing portal launch fails.
- [x] Rewrite in-app calculators hub copy to remove SEO implementation language and keep user-facing intent only.
- [x] Reduce CTA overload: simplify Properties header action stack and promote one clear post-first-property next-step CTA.
- [x] Align workspace selector labels to user language (for example "Property" instead of "Modeling context"/"Mortgage context").

### Mobile experience *(Phase 14 — one item open)*

- [x] Increase landing-nav hamburger touch target from `size-10` to at least 44x44 (`size-11`) for parity with app shell controls.
- [ ] Run a device-backed narrow viewport matrix pass (320/375/390/430 and 767/768 boundary) and log evidence for currently unverified criteria. *(Phase 21 / manual QA.)*

### Performance *(Phase 13 — one item open)*

- [x] Reduce `PostHogPersonProperties` `/api/me` fan-out from every pathname change to mount/event-driven sync.
- [x] Unify dashboard data loading with `buildPortfolioSummaryPayload` (or shared server loader) to remove duplicated query and metric logic.
- [x] Split heavy client bundles in analyze/marketing paths (`deal-analyzer-form` subregions, homepage `PublicCalculator`) with staged dynamic loading where practical. *Homepage `PublicCalculator` dynamic; deal-analyzer subregions still deferred.*
- [ ] Evaluate whether app-shell `force-dynamic` can be narrowed or isolated as traffic scales.
- [x] Optional: add Clerk preconnect/dns-prefetch in layout if RUM shows auth-origin connection delay.

### Reliability

- [x] Add missing browser Sentry initialization (`app/sentry.client.config.ts`) and align client error boundary capture behavior (DSN-safe `app/(app)/error.tsx`). *(Phase 9 — 2026-04-01)*
- [x] Add `Sentry.captureException` in `create-checkout-session` catch; `billing/portal` already captured. *(Phase 9; Stripe cancel / Clerk delete paths unchanged.)*
- [x] Add startup/deploy assertion for `NEXT_PUBLIC_APP_URL` on Vercel (`instrumentation` + `getPublicAppBaseUrlForBilling`). *(Phase 9; `NEXT_PUBLIC_SENTRY_DSN` remains manual in Vercel — no code assertion.)*
- [x] Wrap high-traffic CRUD routes in structured try/catch + Sentry context capture (`userId`, route metadata). *(Phase 13 — properties + deals.)*
- [x] Implement Stripe webhook `event.id` dedup for PostHog server captures to avoid duplicate analytics on retries.

### Data Integrity *(Phases 11–12 — complete)*

- [x] Enforce mortgage validation in CSV import before `tx.mortgage.create` (escrow check + negative-amortization/P&I guard) with row-level error reporting. *(Phase 9 — `lib/import/validate-import-mortgage.ts`, `api/import/portfolio`.)*
- [x] Add `validateEscrowAmount` parity to embedded mortgage creation in `POST /api/properties`. *(Phase 11.)*
- [x] Harden write-path ownership defense-in-depth by adding user-scoped `where` constraints for property/mortgage delete/update calls currently id-only. *(Phase 11.)*
- [x] Add explicit mortgage start-date import support (instead of implicit `purchaseDate` proxy) and document fallback behavior. *(Phase 12.)*
- [x] Fix export zero-vs-empty handling for mortgage balance columns to distinguish paid-off (`0`) from no-mortgage (blank). *(Phase 12.)*
- [x] Update `docs/reference/portfolio-csv-export.md` with round-trip/export-only/lossy matrix and explicit percent basis notes. *(Phase 12.)*

### Growth *(Phase 15 — complete)*

- [x] Track missing funnel events on high-intent paths: landing pricing-preview CTA and `PLAN_LIMIT_HIT` upgrade CTAs.
- [x] Add plan-intent reinforcement content on sign-up page for `investor`/`pro` intent users. *URL `?intent=`; `PlanIntentUrlSync` still syncs storage.*
- [x] Improve activation discovery by surfacing alternative first actions without hidden disclosure friction.
- [x] Upgrade billing success content to include activated plan and new limits, not only generic success copy.
- [x] Reduce repeated paid-intent banner fatigue (move dismiss behavior to bounded local persistence).

### SEO *(Phase 16 — complete except live verification in Phase 21)*

- [x] Add explicit `noindex` metadata for authenticated app shell/pages (do not rely only on disallow + auth redirects). *(Phase 9 — `app/(app)/layout.tsx` `metadata.robots`.)*
- [x] Normalize root canonical/sitemap URL formatting to one convention. *`app/lib/app-url.ts` `getAppOrigin()`.*
- [x] Add lightweight release SEO regression check to keep `sitemap.ts`, `robots.ts`, and route intent aligned. *[`docs/qa/seo-release-checklist.md`](../../qa/seo-release-checklist.md).*

### Governance *(Phase 19 — complete)*

- [x] Fix stale lane count in `docs/cursor-agent-setup.md` summary ("12" -> "14").
- [x] Add explicit 14-lane statement (including SEO + Mobile experience) in `docs/process/agent-governance-audit-process.md`.
- [x] Optionally add `docs/policies/calculator-metric-tones.md` to `builder-agent.mdc` references for calculator-surface tasks.

### Math *(Phase 16 — complete)*

- [x] Guard `annualizedRoiPercent` in `fix-and-flip-calculator` against `NaN` in >100% loss edge cases; add targeted unit test.

### Business *(Phase 17 — one item owner-only)*

- [x] Verify and document `past_due` user-facing path end-to-end (status route -> shell -> visible banner/state). *[`docs/internal/past-due-user-path.md`](../../internal/past-due-user-path.md).*
- [x] Extend `docs/internal/billing-matrix.md` with auxiliary billing route behavior (`/sync`, `/status`, `/subscription-details`).
- [x] Complete and evidence the PostHog named funnel verification checklist in `docs/launch/posthog-growth-funnel.md`.
- [ ] Close unchecked operational items in `docs/launch/launch-plan.md` section 9 against production reality. *Doc note added; production sign-off remains on owner.*
- [x] Document currently undefined analytics events (beyond core funnel) in launch analytics docs.

### Documentation *(Phase 18 — partial)*

- [x] Archive completed proposals from `docs/proposals/` into `docs/archive/proposals/` (keep active proposals only in root proposals folder). *2026-04-01; active: refinance, test-hardening, testing-implementation.*
- [x] Expand `docs/README.md` indexing for `docs/internal/` and missing policy/process/launch docs.
- [x] Archive dated paid-ads readout artifacts from `docs/launch/` into an archive location. *`docs/archive/launch/paid-ads-readouts/`.*
- [ ] Clean up superseded same-day documentation audit reruns once canonical copy is confirmed. *Owner decision: keep.*

### Legal / Compliance *(Phase 20 — partial)*

- [x] Add concise billing/refund/cancellation disclosure near pricing and upgrade CTAs, linking to exact Terms sections. *Anchors on `/terms`.*
- [ ] Route Terms recurring-billing/auto-renew wording through counsel for target jurisdictions.
- [ ] Standardize legal-page metadata hygiene (exact "Last updated" date format; optionally consistent processor policy links).

---

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.

**Phased plan (2026-04-01):** Open synthesis work is tracked as **Phases 10–21** in [`docs/tasks.md`](../../tasks.md) (after Phase 9). Each synthesis bullet appears in exactly one phase there; phase *Boundary* notes prevent overlap (e.g. API escrow vs CSV/export, PostHog transport vs funnel events).

## Deduplication notes

- **Mobile `<h1>` issue** was reported in both Feature and Mobile lanes and is merged into one UX/Mobile implementation item.
- **Landing nav touch target** appeared in both Feature and Mobile lanes and is merged into one Mobile item.
- **`/api/me` PostHog fan-out** appeared in Performance and Growth lanes and is merged into one Performance item.
- **Mutation `userId` defense-in-depth** appeared in Code and Data Integrity lanes and is merged into one Data Integrity item.
- **Billing observability gaps** across Code, Reliability, and Business lanes are grouped under Reliability to avoid duplicate remediation tickets.

---

## Re-test (cross-cutting)

- [x] `npm run check` in `app/` after Phase 9 implementation (2026-04-01).
- [x] `npm run check` in `app/` after Phases 10–20 implementation waves (2026-04-01).
- [ ] Re-run impacted lane audits after fixes (minimum: Reliability, Data Integrity, Growth, and Mobile if those domains are touched). *(Phase 21.)*
- [ ] For billing/auth changes: smoke sign-up/sign-in, checkout, webhook sync, portal launch, and `past_due` recovery flow. *(Phase 21.)*
- [ ] For CSV/mortgage fixes: run export -> import round-trip with escrow, stored balance, and negative-amortization edge rows. *(Phase 21.)*
- [ ] For SEO/indexing fixes: verify live `robots.txt`, `sitemap.xml`, and app-route `noindex` behavior on production/staging. *(Phase 21 — see [`docs/qa/seo-release-checklist.md`](../../qa/seo-release-checklist.md).)*
