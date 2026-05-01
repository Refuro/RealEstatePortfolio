# Full Audit Synthesis — 2026-05-01

## Audits included

All **14** lanes ran with reports dated **2026-05-01**:

- [Code](../code/2026-05-01-code-audit.md)
- [Math & Logic](../math/2026-05-01-math-logic-audit.md)
- [Feature / UX / IA](../feature/2026-05-01-feature-ux-audit.md)
- [Mobile experience](../feature/2026-05-01-mobile-experience-audit.md)
- [Security & Privacy](../security/2026-05-01-security-audit.md)
- [Performance & Cost](../performance-cost/2026-05-01-performance-cost-audit.md)
- [Reliability & Operations](../reliability-ops/2026-05-01-reliability-ops-audit.md)
- [Data Integrity & Reconciliation](../data-integrity/2026-05-01-data-integrity-audit.md)
- [Business & Valuation](../business/2026-05-01-business-valuation-audit.md)
- [Growth Funnel & Activation](../growth-funnel/2026-05-01-growth-funnel-audit.md)
- [SEO (search & discovery)](../seo/2026-05-01-seo-audit.md)
- [Documentation](../documentation/2026-05-01-documentation-audit.md)
- [Legal & Compliance](../legal-compliance/2026-05-01-legal-compliance-audit.md)
- [AI Agent Governance](../agent-governance/2026-05-01-agent-governance-audit.md)

---

## Consolidated task list (deduplicated)

Cross-lane merges:

- **Admin rate limits:** Code, Security, and Reliability all reference `checkRateLimit` actions missing from `RATE_LIMITS` (including `admin:milestone-sentinel-backfill`). → One implementation + optional CI guard.

- **RentCast / refresh cost & observability:** Performance & Cost and Data Integrity both cover cron `refresh.ts` (quota, wide eligibility fetch, missing `RentCastApiCall` parity). → One bounded implementation or doc contract update.

- **`GET /api/properties` vs plan slice:** Data Integrity and Performance both flag unbounded/large responses vs truncated dashboard/export semantics. → One API + documentation contract.

### Security

- [ ] Extend **SEC-2026-04-30-1:** add `RATE_LIMITS` (and `recordRateLimit` where appropriate) for `admin:trial-patch`, `admin:trial-email-send`, `admin:billing-sync`, `admin:milestone-sentinel-backfill`, and any other `checkRateLimit` actions that are not defined; verify **429** and `ApiRateLimitEntry` rows. *(Sources: Security, Code)*

- [ ] After rate-limit fix: add a **CI or script** check that every `checkRateLimit(` action string exists in `RATE_LIMITS`. *(Security)*

### UX / Feature

- [ ] Align **MobileBottomNav** `/analyze` icon/label with **Analyze deal** / sidebar convention. *(Feature)*

- [ ] **Single add-property URL strategy** (quick vs full `/properties/new`) across `app-nav` footer, dashboard, onboarding, Modeling/Mortgage empty states. *(Feature)*

- [ ] **Properties** zero-state: one dominant primary **Add property** (header vs empty-state accent duplication). *(Feature)*

- [ ] **Deals** zero-state: one primary path to `/analyze` (header vs empty-state duplicate). *(Feature)*

### Mobile experience

- [ ] **P1:** Drawer close (backdrop, Escape, swipe, route change) returns **focus** to hamburger in `app-layout-client.tsx`. *(Mobile)*

- [ ] **P2:** Touch targets ≥ **44px** — `mobile-mode-switcher`, `app-nav` `NavGroup` links, property detail overflow trigger. *(Mobile)*

- [ ] **P2:** Modeling workspace mobile `<select>` typography (`text-base` on mobile) to avoid iOS zoom. *(Mobile)*

- [ ] **P3:** Optional icon parity: Analyze tab **MobileBottomNav** vs **AppNav**. *(Mobile)*

### Performance

- [ ] **`/calculators/rent-vs-buy`:** dynamic-import **`RentVsBuyCalculator`** + Recharts with `ssr: false` and loading UI (authenticated route still static-imports). *(Code; overlaps Performance)*

- [ ] Cap **`MAX_PROPERTIES_PER_USER_PER_RUN`**; push eligibility filtering **SQL-side** / paging in `getRefreshEligibleUsers` + `processUserRefresh`. *(Performance)*

- [ ] Batch or reuse PostHog client for high-volume server paths (**billing webhook**, **trial-emails** cron). *(Performance)*

- [ ] Evaluate **ISR** / `revalidate` for session-stable marketing (privacy/terms) when feasible. *(Performance — Optional design)*

### Reliability

- [ ] Fix **`docs/runbooks/incident-response.md` §3** to match liveness-only **`/api/health`** (no false **503** expectation for DB). *(Reliability)*

- [ ] Add **`Sentry.captureException`** (+ context) to `api/admin/users/[id]/billing-sync` outer `catch`. *(Reliability)*

- [ ] Reconcile **`docs/tasks.md`** stale bullets (**SEC-SHIP-1**, **CRIT-0409-1**, etc.) vs current `proxy.ts` / cron reality. *(Reliability)*

### Data integrity

- [ ] **Document and implement** one contract for **plan slice** (`take` + ordering) vs **`GET /api/properties`** full list — architecture or API doc + optional API shape change so integrators cannot reconcile wrong totals. *(Data integrity)*

- [ ] **RentCast:** insert **`RentCastApiCall`** from `refresh.ts` on success **or** update `rentcast-quota.md` / admin copy so cron volume is not invisible. *(Data integrity; overlaps Performance)*

- [ ] **CSV:** optional columns for benchmark/freshness scalars **or** explicit non-export list in **`portfolio-csv-export.md`**. *(Data integrity)*

- [ ] **Import:** reject multi-lien + `monthly payment (all liens sum)` with clear error until multi-lien import exists; **import** when over-cap **without net-new** rows — design + implementation. *(Data integrity)*

### Growth

- [ ] Wrap **PricingCards** plan CTAs with **`FunnelCtaLink`** (or shared tracker) preserving **`setPlanIntent`**. *(Growth)*

- [ ] Add funnel tracking to homepage **`CALCULATOR_LINKS`**. *(Growth)*

- [ ] **Wizard abandoned:** instrument in-app navigation exits, not only `beforeunload`. *(Growth)*

- [ ] Document **consent vs server/memory** analytics behavior for operators. *(Growth)*

### SEO

- [ ] **`/llms.txt`:** derive pricing bullets from **`PRICING_DISPLAY`** / shared helper so env tier prices cannot drift. *(SEO)*

- [ ] Verify production **`NEXT_PUBLIC_APP_URL`** (no trailing slash); spot-check **`/sitemap.xml`**, **`/robots.txt`**. *(SEO — verification)*

### Governance

- [ ] Extend **`agent-governance-audit-process.md`** scope to **`app/.agents/`** (product context + `skills/`). *(Agent governance)*

- [ ] Document **`app/.agents/skills/`** vs workspace **`.cursor/skills/`** in `cursor-agent-setup.md` or `ai-process-workflow-setup.md`. *(Agent governance)*

- [ ] Optional: **`AVAILABLE_AGENTS.md`** pointer for non-`.cursor` agent assets. *(Agent governance)*

### Math

- [ ] Dashboard **property value / debt-vs-value / value MoM** vs **`ownership-metrics.md`** full **V** semantics (fix numbers **or** copy/labels). *(Math)*

- [ ] Add **`getPaymentStartLagMonths`** to mortgage-tab + projections **remaining-term** paths so simulations match amortization payoff horizon. *(Math)*

- [ ] Milestone / email copy when **`toleranceApplied`** from payoff projection — clarify or use strict payoff for eligibility. *(Math)*

- [ ] Refresh **`math-logic-audit.md`** §2.1–2.2 for balance-source tiers and proportional cash-flow contract. *(Math — doc)*

### Business

- [ ] Update **`roadmap.md`** Vitest count (**628**) or drop pinned counts. *(Business)*

- [ ] Close remaining **`launch-plan.md` §9** unchecked ops items (env, health, support, Stripe↔pricing, demo). *(Business)*

- [ ] Reconcile **`valuation-brief.md` §10** with one dated PostHog + Stripe export. *(Business)*

### Documentation

- [ ] Relocate root **`docs/audits/2026-04-04-polish-gap-audit.md`** into **`feature/`** or README exception. *(Documentation)*

- [ ] Fix brittle links in **`2026-doc-cleanup-plan.md`** and **`paid-ads-readouts/README.md`**. *(Documentation)*

- [ ] Close or narrow **`tasks.md` Phase 18** vs documentation audit suffix convention. *(Documentation)*

### Legal / Compliance

- [ ] **Human-only (counsel):** US state privacy stance vs marketing; EU non-targeting alignment in Privacy. *(Legal)*

- [ ] **Human-only (counsel):** Terms change mechanics (“continued use”) for **material** changes. *(Legal)*

- [ ] **`/contact`** response-time copy vs Terms alignment; counsel if binding SLA language. *(Legal)*

- [ ] Substantiate or soften homepage **“20+ states”**, **“live / always current”** claims. *(Legal / marketing)*

- [ ] Align **Last updated** convention across Privacy and Terms on next substantive legal edit. *(Legal)*

---

## PM triage (this run)

### Ship (next window)

- [ ] **Admin rate limits complete:** define all `RATE_LIMITS` keys used by `checkRateLimit` on admin routes; verify **429** + DB rows. *(Security — SEC-2026-04-30-1 expansion)*

- [ ] **Plan slice vs `GET /api/properties`:** document and align behavior so capped accounts cannot reconcile API list vs dashboard totals incorrectly. *(Data integrity)*

- [ ] **Dashboard value semantics:** fix value / MoM / debt-vs-value bars to match **`ownership-metrics.md`** **or** make ownership-scaled copy explicit everywhere. *(Math — user trust)*

### Schedule (next batch)

- [ ] Incident runbook **§3** accuracy for **`/api/health`**. *(Reliability)*

- [ ] **`Sentry.captureException`** on admin **billing-sync** route. *(Reliability)*

- [ ] **Mobile:** drawer **focus restore**; **44px** touch targets; modeling **select** font size. *(Mobile)*

- [ ] **Feature:** MobileBottomNav **/analyze** parity; duplicate primary CTAs on **Properties** and **Deals** zero states; unified **quick vs full** add-property entry points. *(Feature)*

- [ ] **Rent vs buy** authenticated route: **dynamic** chart import + loading state. *(Code / Performance)*

- [ ] **RentCast / refresh:** cap per-run properties; SQL-side eligibility; quota observability (`RentCastApiCall` or docs). *(Performance + Data integrity)*

- [ ] **SEO:** **`/llms.txt`** pricing from shared **`PRICING_DISPLAY`**. *(SEO)*

- [ ] **Growth:** **PricingCards** funnel tracking; homepage calculator links; wizard exit instrumentation beyond `beforeunload`. *(Growth)*

- [ ] **Math:** **payoff lag** alignment in mortgage tab + projections simulations. *(Math)*

- [ ] **CSV / import** medium items (multi-lien guard; over-cap import without net-new; export field matrix). *(Data integrity)*

- [ ] **Documentation hub hygiene:** polish-gap audit location, broken readout links, doc cleanup plan links, **`tasks.md` Phase 18**. *(Documentation)*

- [ ] **Business:** **`roadmap.md`** test count; **`launch-plan` §9** closure; **`valuation-brief`** snapshot refresh. *(Business)*

- [ ] **Governance:** **`app/.agents/`** scope in agent-governance process + setup docs. *(Agent governance)*

### Optional / backlog

- [ ] Incremental splits: **`add-property-wizard.tsx`**, **`deal-analyzer-form.tsx`**. *(Code)*

- [ ] **`build-insights-payload.ts`** comment vs **`unknown`** typing cleanup. *(Code)*

- [ ] **ISR** / static marketing shells; **`GET /api/properties`** pagination assessment. *(Performance)*

- [ ] PostHog **webhook/cron** batching follow-ups; optional **CRON_SECRET** deploy guard. *(Performance / Security optional)*

- [ ] **SEO:** optional sitemap `lastModified`; organic title/H1 experiments. *(SEO)*

- [ ] **Mobile:** Vitest API route **timeout** fixes (restore full suite green); **`mobile-shell-verification.md`** inventory expansion. *(Mobile)*

- [ ] **Math / Legal doc** refresh items; **documentation** optional rule/process wording. *(Mixed)*

### Human-only / deferred

- [ ] **Legal counsel** review: US privacy, Terms change mechanics, contact SLA language, marketing substantiation. *(Legal)*

- [ ] **Manual QA:** VoiceOver/TalkBack drawer focus; viewport matrix **320–768** on key mobile tools; device Safari **select** zoom. *(Mobile)*

- [ ] **Golden-path demo** recording for launch / investor conversations. *(Business)*

- [ ] Production **Search Console** / sitemap operator documentation (not fully inferable from repo). *(SEO)*

---

## PM review

Review triage above. Promote **Ship** and **Schedule** items to [`docs/tasks.md`](../../tasks.md) unless explicitly deferred. The builder implements approved items.

Lane reports remain the source of truth for severity tables, evidence, and re-test checklists.
