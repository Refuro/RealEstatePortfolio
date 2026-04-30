# Full Audit Synthesis — 2026-04-27

## Audits included

All fourteen lanes from the 2026-04-27 full audit run (Composer 2 subagents, two batches of seven):

- Code — `docs/audits/code/2026-04-27-code-audit.md`
- Math & Logic — `docs/audits/math/2026-04-27-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-04-27-feature-ux-audit.md`
- Mobile experience — `docs/audits/feature/2026-04-27-mobile-experience-audit.md`
- Security & Privacy — `docs/audits/security/2026-04-27-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-04-27-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-04-27-reliability-ops-audit.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-04-27-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-04-27-business-valuation-audit.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-04-27-growth-funnel-audit.md`
- SEO (search & discovery) — `docs/audits/seo/2026-04-27-seo-audit.md`
- Documentation — `docs/audits/documentation/2026-04-27-documentation-audit.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-04-27-legal-compliance-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-04-27-agent-governance-audit.md`

## Consolidated task list

*Deduplicated across lanes. Verification-only and `npm run check` lines from individual reports are omitted here; they remain in lane reports.*

### Security

- [ ] Add `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync`; verify 429 behavior and `ApiRateLimitEntry` in staging. *(Security)*
- [ ] Sync `docs/security/security-audit.md` §6–§7 with `app/lib/rate-limit.ts` and `app/app/api/health/route.ts`. *(Security + Reliability alignment)*
- [ ] Optional: Vercel-only assert for `CRON_SECRET` in `instrumentation.ts` (or `validateEnv`) if all cron routes are always deployed. *(Security)*

### UX / Feature

- [ ] Unify first-property CTAs: use `/properties/new?mode=quick` (or shared `FIRST_PROPERTY_HREF`) in Modeling and Mortgage empty states — same as dashboard/onboarding. *(Feature + Growth + Data integrity cross-reference)*
- [ ] Mobile bottom nav: change Analyze icon from `Calculator` to match Deal Analyzer (`ClipboardList` or approved alternative); verify active state for `/analyze`. *(Feature)*
- [ ] Add a11y/UX review of **More** drawer (scannability on typical phone heights). *(Feature)*
- [ ] Add inline helper on Deal Analyzer or Deals when `user.ownershipDisplayMode === "full_liability"` (or link to help). *(Feature)*
- [ ] Growth: surface **`PaidIntentCheckoutBanner`** earlier in the funnel (e.g. `/plans` or layout) without duplicating trial messaging; coordinate copy/stacking. *(Growth)*
- [ ] Growth: address calculator → app handoff (investment property calculator states inputs are not transferred after signup). *(Growth — high time-to-value risk)*

### Mobile experience

- [ ] Focus trap + focus return for `#app-mobile-nav-drawer` in `app-layout-client.tsx`. *(Mobile)*
- [ ] Touch targets: `min-h-[44px]` (or padding) for `ExpandButton` in `dashboard-charts.tsx`; review `MobileModeSwitcher`. *(Mobile)*
- [ ] Apply `app-respect-reduced-motion` to `MobileCollapsible` chevron animation. *(Mobile)*
- [ ] Re-evaluate `useIsMobile()` vs CSS-only shells on `/analyze` (and similar) to reduce hydration/first-paint swap. *(Mobile)*

### Performance

- [ ] `getRefreshEligibleUsers`: SQL-side filtering + pagination; cap properties per user per cron run (`MAX_PROPERTIES_PER_USER_PER_RUN` or equivalent). *(Performance)*
- [ ] Refactor `captureServerEvent` to reuse a PostHog server client and batch flush per request/cron. *(Performance)*
- [ ] Review legal/marketing pages for ISR (`revalidate`) where session-aware nav can move to a client island. *(Performance)*
- [ ] Consider pagination or field projection for `GET /api/properties` for large portfolios. *(Performance)*

### Reliability

- [ ] Edit `docs/runbooks/incident-response.md` §3 so DB recovery steps match liveness-only `/api/health` (and/or add a separate readiness probe if product requires it). *(Reliability)*
- [ ] Add monitoring that catches DB-only failures if `/api/health` is liveness-only (uptime strategy). *(Reliability)*
- [ ] Add Sentry or deploy-time signal for missing `CRON_SECRET` on Vercel production. *(Reliability + Security)*
- [ ] Resolve **SEC-SHIP-3** in `docs/tasks.md` with route list and verification plan (per Reliability lane). *(Reliability)*

### Data integrity

- [ ] Extend portfolio CSV export/import with `marketRent`, `marketRentAsOf`, `estimatedValueAsOf` for round-trip parity. *(Data integrity)*
- [ ] Return `portfolioContext` from `PATCH /api/deals/[id]` or document breaking change and update clients to refetch. *(Data integrity)*
- [ ] Reconcile monthly digest cash flow with `ownershipDisplayMode` (or explicit disclaimer). *(Data integrity)*

### Growth

- [ ] Add **`showCta`** (or equivalent) to homepage **`PublicCalculator`** and verify analytics. *(Growth)*
- [ ] Refresh **`plan-intent.ts`** header comments to match **`forceRedirectUrl`** signup behavior. *(Growth)*

### SEO

- [ ] Production + preview: verify `NEXT_PUBLIC_APP_URL` and preview `noindex` policy; submit sitemap in Search Console. *(SEO)*
- [ ] After next calculator content push: monitor Search Console for national vs state investment-property differentiation (4–8 weeks). *(SEO)*
- [ ] Backlog: remove or relocate `app/app/learn/react-labs/07-timer/page.tsx` if unused. *(SEO)*

### Governance / Documentation

- [ ] Update `docs/cursor-agent-setup.md` audit summary to include SEO, mobile, documentation, legal — or point to `docs/audits/README.md` only. *(Agent governance)*
- [ ] Windows hook note: Bash vs PowerShell `subagentStop` / `on-subagent-stop.ps1` in setup docs. *(Agent governance)*
- [ ] Refresh `docs/README.md` and `docs/audits/synthesis/README.md` “latest synthesis” pointers after this file exists. *(Documentation)*
- [ ] Relocate or index `docs/audits/2026-04-05-*.md` root reports per lane contract. *(Documentation)*
- [ ] Fix `docs/process/full-audit-synthesis.md` embedded `tasks.md` link (path to `docs/tasks.md`). *(Documentation)*
- [ ] Add or replace `AVAILABLE_AGENTS.md` references; fix stale plan frontmatter / archive link roots per documentation audit. *(Documentation)*

### Math

- [ ] Disclose amortization tolerance (or align copy) for mortgage milestone email content tied to `getToleranceAwarePayoffProjection`. *(Math)*
- [ ] Align `docs/process/math-logic-audit.md` `getBalanceSource` description with three-tier code. *(Math — doc)*

### Business

- [ ] Valuation brief accuracy pass — `docs/reference/valuation-brief.md` (§7, §8, traction placeholders when owner has dated numbers). *(Business)*
- [ ] Roadmap refresh — reverse trial, retention, Vitest counts — `docs/reference/roadmap.md`. *(Business)*
- [ ] `docs/launch/analytics.md` server/cron appendix. *(Business)*

### Code maintainability (non-blocking)

- [ ] Dynamic chart loading for signed-in `/calculators/rent-vs-buy` (match public `next/dynamic` + `ssr: false` pattern). *(Code)*
- [ ] Env-based home URL in `app/app/api/unsubscribe/route.ts` HTML (avoid hard-coded production domain). *(Code)*
- [ ] Milestone extraction PRs for `deal-analyzer-form.tsx` and `add-property-wizard.tsx`. *(Code — tech debt)*
- [ ] Design pass: reduce heavy `shadow-xl` / `shadow-2xl` on homepage, pricing, onboarding modal. *(Code + Design)*

### Legal / Compliance

- [ ] Counsel-approved **California / US state privacy** section(s) in Privacy. *(Legal)*
- [ ] Revise **Contact** copy (and optionally Terms) for support response expectations (24 business hours commitment). *(Legal)*
- [ ] **`/pricing` mobile** feature accordion: add **RentCast hourly pool** row for parity with desktop. *(Legal + Growth GRW-1 deferral note respected for unrelated items)*

## PM triage (this run)

Classify per `docs/process/full-audit-synthesis.md` §3.5. Promote **Ship** and **Schedule** to `docs/tasks.md` when ready.

### Ship (next window)

- [ ] **Admin API rate limits** — `admin:trial-patch`, `admin:trial-email-send`, `admin:billing-sync` must not be unlimited. *(Security)*
- [ ] **Calculator → signup value** — Investment property calculator does not transfer inputs; major activation leak. *(Growth)*
- [ ] **Paid intent surfacing** — Ensure upgrade path is visible without waiting for dashboard-only banner. *(Growth)*
- [ ] **Monthly refresh cost scaling** — Cap/query hardening for `getRefreshEligibleUsers` and cron property fan-out. *(Performance — cost + reliability)*
- [ ] **PostHog server client churn** — Batch/reuse client in `captureServerEvent`. *(Performance)*
- [ ] **CSV / digest / deals API consistency** — Export columns, digest vs `ownershipDisplayMode`, PATCH response shape. *(Data integrity)*

### Schedule (next batch)

- [ ] First-property href unification (`?mode=quick`) across Modeling/Mortgage. *(Feature + Growth)*
- [ ] Mobile nav icon consistency (Analyze). *(Feature)*
- [ ] Mobile drawer focus trap + touch targets + reduced-motion on collapsible. *(Mobile)*
- [ ] Runbook §3 vs `/api/health` reality; optional readiness monitoring strategy. *(Reliability)*
- [ ] `CRON_SECRET` observability (Sentry or deploy assert). *(Reliability)*
- [ ] Env-based unsubscribe URL; dynamic Recharts for signed-in rent-vs-buy. *(Code)*
- [ ] Documentation hub + synthesis pointers + `full-audit-synthesis.md` link fix + audit root file indexing. *(Documentation)*
- [ ] `docs/cursor-agent-setup.md` lane list + Windows hook note. *(Governance)*
- [ ] Milestone email tolerance disclosure + math process doc alignment. *(Math)*
- [ ] Valuation brief / roadmap / analytics.md business doc refresh. *(Business)*
- [ ] SEO monitoring and production URL verification checklist items. *(SEO)*

### Optional / backlog

- [ ] CSP enforcement hardening and `connect-src` tightening (with Clerk/Stripe/PostHog smoke tests). *(Security)*
- [ ] ISR pass on marketing/legal pages. *(Performance)*
- [ ] `GET /api/properties` pagination / field projection. *(Performance)*
- [ ] Mega-module extractions (wizard, deal analyzer). *(Code)*
- [ ] Shadow / marketing design polish. *(Code)*
- [ ] Twitter metadata on calculator pages. *(SEO)*
- [ ] `react-labs` cleanup. *(SEO)*
- [ ] Agent governance: optional `agent-governance-audit-agent.mdc` wording tweak. *(Governance)*

### Human-only / deferred

- [ ] **Legal counsel** — California/US privacy disclosures; server-side analytics disclosure review. *(Legal)*
- [ ] **Contact SLA** — Owner decision on tightening or qualifying “24 business hours.” *(Legal)*
- [ ] **Mobile pricing legal parity** — May pair with counsel/comms review after accordion change. *(Legal)*
- [ ] **BIZ entity** — LLC + Stripe + Terms alignment (`docs/business-launch-checklist.md`). *(Business)*
- [ ] **Launch §9 verification** — `docs/launch/launch-plan.md`. *(Business)*
- [ ] **Manual viewport matrix + real device** pass for mobile audit Pending rows. *(Mobile)*
- [ ] **Search Console / production URL** checks (owner or ops). *(SEO)*

## PM review

Review triage above. Promote **Ship** and **Schedule** items to [docs/tasks.md](../../tasks.md) unless explicitly deferred. The builder implements approved items.
