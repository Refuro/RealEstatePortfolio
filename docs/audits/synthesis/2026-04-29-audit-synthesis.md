# Full Audit Synthesis — 2026-04-29

## Audits included

Fourteen lanes (Composer 2 subagents, two batches of seven). Reports:

- Code — `docs/audits/code/2026-04-29-code-audit.md`
- Math & Logic — `docs/audits/math/2026-04-29-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-04-29-feature-ux-audit.md`
- Mobile experience — `docs/audits/feature/2026-04-29-mobile-experience-audit.md`
- Security & Privacy — `docs/audits/security/2026-04-29-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-04-29-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-04-29-reliability-ops-audit.md`
- Data Integrity — `docs/audits/data-integrity/2026-04-29-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-04-29-business-valuation-audit.md`
- Growth Funnel — `docs/audits/growth-funnel/2026-04-29-growth-funnel-audit.md`
- SEO — `docs/audits/seo/2026-04-29-seo-audit.md`
- Documentation — `docs/audits/documentation/2026-04-29-documentation-audit.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-04-29-legal-compliance-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-04-29-agent-governance-audit.md`

## Consolidated task list

*Implementation-oriented items; verification-only bullets live in lane reports.*

### Security

- [ ] Add `RATE_LIMITS` for `admin:trial-patch`, `admin:trial-email-send`, `admin:billing-sync`. *(Security)*
- [ ] Reconcile CSP report rate-limit docs / engineering reference with `checkCspRateLimit` + `POST /api/csp-report` (vs `RATE_LIMITS` / `ApiRateLimitEntry`). *(Security)*
- [ ] Align `docs/security/security-audit.md` §7 health wording with liveness-only `GET /api/health`. *(Security + Reliability)*
- [ ] Optional: assert `CRON_SECRET` on Vercel in `instrumentation.ts` when appropriate. *(Security)*

### Legal / compliance / disclosure

- [ ] Fix **`PRICING_FAQ`** copy that implies users can “view all” properties when over limit; align with UI (“Showing X of Y” / locked excess). *(Legal + Product)*
- [ ] Align root layout **JSON-LD** (`WebApplication` / `Offer`) with live pricing (monthly + annual, caps, trial) after FAQ fix — same source of truth as `/pricing`. *(Legal + SEO)*
- [ ] California / US state privacy sections (counsel). *(Legal)*
- [ ] Contact page **24 business hours** — soften in Terms/Privacy or revise copy. *(Legal)*
- [ ] Mobile **`/pricing`** accordion: **RentCast hourly pool** row parity with desktop. *(Legal + Growth GRW-1 scope)*

### SEO

- [ ] Rich-results / schema validation after JSON-LD alignment; **homepage title vs H1** alignment if desired. *(SEO)*
- [ ] Optional: per-route `lastModified` for resources (not only changelog-derived `SITE_LAST_MODIFIED`). *(SEO)*
- [ ] Production: Search Console, `robots.txt` / `sitemap.xml`, preview `noindex`. *(SEO)*

### Growth

- [ ] **`PaidIntentCheckoutBanner`** on **`/plans`** and/or layout with coexistence rules vs trial/over-limit banners. *(Growth)*
- [ ] Calculator → app **field handoff** for investment-property calculator traffic. *(Growth)*
- [ ] **`showCta`** on homepage **`PublicCalculator`** + analytics. *(Growth)*
- [ ] First-property **`?mode=quick`** in Modeling/Mortgage/Refinance empty states (shared constant). *(Growth + Feature)*

### UX / Feature

- [ ] Mobile bottom nav **Analyze** icon matches sidebar (`ClipboardList` or approved). *(Feature)*
- [ ] Optional: **Open in Mortgage** from property detail (product decision). *(Feature)*

### Mobile

- [ ] Hamburger **focus return** when app nav drawer closes. *(Mobile)*
- [ ] Sub-44px targets: `MobileModeSwitcher`, overflow menu, drawer rows. *(Mobile)*
- [ ] Stabilize **`npm run test`** (API route 401 timeout flakes per lane). *(Mobile / CI)*

### Performance

- [ ] Cap **`MAX_PROPERTIES_PER_USER_PER_RUN`**; SQL-side / paged **`getRefreshEligibleUsers`**. *(Performance)*
- [ ] Reuse / batch **PostHog** server client in **`captureServerEvent`**. *(Performance)*
- [ ] ISR / static shells for legal/marketing where possible. *(Performance — backlog)*
- [ ] `GET /api/properties` pagination or slimmer selects for large portfolios. *(Performance — backlog)*

### Reliability

- [ ] **`docs/runbooks/incident-response.md` §3** vs liveness-only `/api/health`; readiness monitoring if needed. *(Reliability)*
- [ ] **`Sentry.captureException`** (or narrow logging) on **`admin/.../billing-sync`** `catch`. *(Reliability)*
- [ ] **`CRON_SECRET`** documented / deploy observability for missing secret. *(Reliability)*

### Data integrity

- [ ] CSV export/import: **`marketRent`**, **`marketRentAsOf`**, **`estimatedValueAsOf`**. *(Data)*
- [ ] **Payoff semantics**: milestone/tolerance vs strict API (`getPayoffProjection` vs tolerance-aware) per policy §3.7. *(Data + Math)*
- [ ] **`PATCH /api/deals/[id]`** returns **`portfolioContext`** or documented refetch contract. *(Data)*
- [ ] Monthly **digest** cash flow vs **`ownershipDisplayMode`** (or explicit disclaimer). *(Data)*

### Math

- [ ] Milestone **email** copy: disclose tolerance or align with strict payoff. *(Math)*
- [ ] **`docs/process/math-logic-audit.md`**: `getBalanceSource` three-tier doc. *(Math)*

### Code (maintainability)

- [ ] Dynamic **Recharts** for signed-in `/calculators/rent-vs-buy`. *(Code)*
- [ ] Env-based URL in **unsubscribe** HTML. *(Code)*
- [ ] Mega-module extractions (wizard, deal analyzer); import route review at scale. *(Code)*
- [ ] Comment fix **`build-insights-payload.ts`** unitRents doc. *(Code)*

### Business / docs

- [ ] **`valuation-brief.md`**, **`roadmap.md`** (reverse trial, retention, **Vitest 82 / 601** or current counts). *(Business)*
- [ ] **`docs/launch/launch-plan.md` §9** closure (human). *(Business)*

### Governance / documentation

- [ ] **`docs/cursor-agent-setup.md`**: full fourteen-lane audit list or pointer to **`docs/audits/README.md`**. *(Governance)*
- [ ] **`docs/process/agent-governance-audit-process.md`**: add **`app/.agents/`** scope note. *(Governance)*
- [ ] Hub + **`docs/audits/synthesis/README.md`**: latest synthesis → **`2026-04-29-audit-synthesis.md`** (repeat when superseded). *(Documentation)*
- [ ] Index or relocate **`docs/audits/2026-04-05-*.md`**; fix **`full-audit-synthesis.md`** `tasks.md` link; **`AVAILABLE_AGENTS.md`**; edit-page plan **`research:`** target. *(Documentation)*

## PM triage (this run)

### Ship (next window)

- [ ] **Pricing FAQ + JSON-LD accuracy** — FAQ contradicts tier list UX; schema on `/` may misstate offers. *(Legal + SEO)*
- [ ] **Admin rate limits** — missing keys for admin trial/billing-sync routes. *(Security)*
- [ ] **Calculator handoff + paid-intent surfacing** — growth leaks unchanged from prior synthesis. *(Growth)*
- [ ] **Monthly refresh unbounded cost** — RentCast cron without row accounting + infinite cap per user. *(Performance)*
- [ ] **PostHog per-event client** — `captureServerEvent` overhead on webhooks/crons. *(Performance)*
- [ ] **Data: CSV, digest, deals PATCH, payoff messaging split** — user-visible inconsistency and API contract. *(Data integrity)*

### Schedule (next batch)

- [ ] CSP report limit **docs ↔ code** reconciliation; security-audit §7 health text. *(Security + Docs)*
- [ ] Runbook §3 + **billing-sync Sentry** + CRON_SECRET ops notes. *(Reliability)*
- [ ] Mobile focus return, touch targets, **test suite stability**. *(Mobile)*
- [ ] Nav icon + first-property `mode=quick` unification (including Refinance empty state). *(Feature)*
- [ ] Homepage title/H1; sitemap `lastModified` optional. *(SEO)*
- [ ] Math email tolerance + process doc; business doc Vitest/roadmap/brief. *(Math + Business)*
- [ ] Documentation hub, synthesis pointers, audit root files, governance scope for `.agents`. *(Documentation + Governance)*
- [ ] Code: dynamic rent-vs-buy charts, unsubscribe env URL, insights comment. *(Code)*

### Optional / backlog

- [ ] CSP enforce + tighten `connect-src` with vendor smoke tests. *(Security)*
- [ ] ISR marketing/legal; properties API pagination. *(Performance)*
- [ ] Wizard / deal-analyzer extractions; CSV import scale review. *(Code)*

### Human-only / deferred

- [ ] Counsel: privacy, FAQ/subprocessor review after copy changes. *(Legal)*
- [ ] BIZ entity checklist; launch §9 verifier. *(Business)*
- [ ] Manual device / viewport matrix; Search Console production checks. *(Mobile + SEO)*

## PM review

Promote **Ship** and **Schedule** to [docs/tasks.md](../../tasks.md) when approved. Builder implements approved items.
