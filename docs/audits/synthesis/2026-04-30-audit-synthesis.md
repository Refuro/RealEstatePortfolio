# Full Audit Synthesis — 2026-04-30

## Audits included

Fourteen lanes (Composer 2 subagents, two batches of seven). Reports:

- Code — `docs/audits/code/2026-04-30-code-audit.md`
- Math & Logic — `docs/audits/math/2026-04-30-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-04-30-feature-ux-audit.md`
- Mobile experience — `docs/audits/feature/2026-04-30-mobile-experience-audit.md`
- Security & Privacy — `docs/audits/security/2026-04-30-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-04-30-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-04-30-reliability-ops-audit.md`
- Data Integrity — `docs/audits/data-integrity/2026-04-30-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-04-30-business-valuation-audit.md`
- Growth Funnel — `docs/audits/growth-funnel/2026-04-30-growth-funnel-audit.md`
- SEO — `docs/audits/seo/2026-04-30-seo-audit.md`
- Documentation — `docs/audits/documentation/2026-04-30-documentation-audit.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-04-30-legal-compliance-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-04-30-agent-governance-audit.md`

### Continuity vs 2026-04-29

Per **Data integrity** and **Legal** lanes this run: **`PATCH /api/deals/[id]`** now returns **`portfolioContext`** like **`GET`**; digest vs dashboard liability display mismatch closed with removal of display modes; **pricing FAQ** and **mobile `/pricing` compare** (including **Estimate pool**) align with shipped behavior. Those items drop off **Ship** relative to the prior synthesis.

---

## Consolidated task list

*Implementation-oriented items only; verification steps and “after change” checklists stay in lane reports.*

### Security

- [ ] Add **`RATE_LIMITS`** for **`admin:trial-patch`**, **`admin:trial-email-send`**, **`admin:billing-sync`**; verify **429** and **`ApiRateLimitEntry`** in staging. *(Security + Reliability testing)*
- [ ] Update security docs: **CSP report** limiting (implementation + §6 table), **§7 health** wording vs **`GET /api/health`**, and **Last reviewed** metadata. *(Security + Documentation)*
- [ ] Optional: deploy-time **`CRON_SECRET`** assert in **`instrumentation.ts`** when all environments use cron. *(Security)*

### Legal / compliance

- [ ] **California / US state privacy** sections or links per **counsel-approved** template. *(Legal — content)*
- [ ] **Contact** response expectations (24 business hours) — align **Terms** / **Privacy** or revise **contact** copy. *(Legal — content)*
- [ ] Align **“Last updated”** convention across **Privacy** and **Terms** when substantive edits ship. *(Legal)*

### SEO

- [ ] Keep root **`WebApplication` / `Offer`** JSON-LD in **`app/app/layout.tsx`** aligned with live **`/pricing`**, **`PRICING_DISPLAY`**, and **Stripe** after each pricing release; **Rich Results Test** on **`/`** and **`/pricing`**. *(SEO + Legal disclosure)*
- [ ] Optional: **per-resource `lastModified`** in **`sitemap.ts`** when pages materially change (not only changelog-derived dates). *(SEO)*
- [ ] **Homepage** metadata title vs **H1** emphasis — align if desired. *(SEO)*

### Growth

- [ ] Add **`PaidIntentCheckoutBanner`** to **`/plans`** (and/or app shell) with **coexistence** rules vs other trial/over-limit surfaces. *(Growth)*
- [ ] **Calculator → app** field handoff for **`/investment-property-calculator`** (and priority tool pages). *(Growth)*
- [ ] Enable **`showCta`** (or equivalent) on homepage **`PublicCalculator`** with **analytics**. *(Growth)*

### UX / Feature

- [ ] **Single policy** for **quick vs full** “Add property”: shared **hrefs** across dashboard (empty vs populated), **Properties** zero-state and header, **Modeling** / **Mortgage** empty states, **deal analyzer**, and **`AppNav`** footer. *(Feature + Growth)*
- [ ] **Properties** zero-state: **Quick add** (or primary quick path) consistent with dashboard onboarding. *(Feature)*
- [ ] Update **`MobileBottomNav`** **`/analyze`** item (**icon + label**) so it matches **Analyze deal** semantics (same intent as Growth funnel note). *(Feature + Growth + Mobile)*

### Mobile experience

- [ ] **Hamburger `ref` + focus restore** when app mobile nav **drawer closes** (all close paths). *(Mobile)*
- [ ] Audit **≥44px** touch targets: **`MobileModeSwitcher`**, property detail **overflow** menu, drawer **`AppNav`** rows. *(Mobile)*
- [ ] Optional: document **`useIsMobile`** SSR tradeoff or explore CSS-first narrowing. *(Mobile)*

### Performance & cost

- [ ] Cap **`MAX_PROPERTIES_PER_USER_PER_RUN`** and add **SQL-side eligibility** / user paging in **`getRefreshEligibleUsers`**. *(Performance + Reliability at scale)*
- [ ] **Record or bound** **RentCast** calls from **`refreshProperty`** per quota / cost docs. *(Performance)*
- [ ] Refactor **billing webhook** and **trial-emails** paths to **batch or reuse** PostHog server client (vs per-call client churn). *(Performance)*
- [ ] Evaluate **ISR** or static shells for legal/marketing once session checks are isolated. *(Performance — backlog)*

### Reliability & operations

- [ ] Align **`docs/runbooks/incident-response.md` §3** with **liveness-only** **`GET /api/health`** (and readiness story if any). *(Reliability)*
- [ ] **`Sentry.captureException`** (or narrower error handling) for **`app/app/api/admin/users/[id]/billing-sync/route.ts`** failures. *(Reliability)*
- [ ] Document **`CRON_SECRET`** in **`docs/setup/manual-steps.md`** and/or **observability** when the secret is missing at runtime. *(Reliability + Security ops)*
- [ ] Close **SEC-SHIP-3** in **`docs/tasks.md`** via the listed read/export routes. *(Security + Reliability)*

### Data integrity

- [ ] **Portfolio CSV export + import**: **`marketRent`**, **`marketRentAsOf`**, **`estimatedValueAsOf`** (and related contract) with **round-trip** tests. *(Data)*
- [ ] **Mortgage milestones**: **strict payoff** vs **tolerance-aware** behavior **documented and consistent** with mortgage API **§3.7** (implementation + tests). *(Data + Math)*
- [ ] Docs / comments sweep: **`analytics-math-policy.md` §8** (**full_liability** / removed display mode); **`snapshots.ts`**, **`cash-flow-improvement.ts`**, Prisma snapshot comments; refresh **`portfolio-csv-export.md`** **last updated** / gaps. *(Data + Math + Documentation)*

### Math

- [ ] **Milestone email** body: disclose **tolerance** or align copy with **strict** **`getPayoffProjection`**. *(Math — merged with milestone task above for implementation)*
- [ ] Align **`docs/process/math-logic-audit.md`** metric / balance-source wording with **`ownership-metrics.md`** and **`app/lib/amortization.ts`**. *(Math)*

### Code (maintainability)

- [ ] **Dynamic import** path for authenticated **`/calculators/rent-vs-buy`** **Recharts** bundle. *(Code + Performance)*
- [ ] Split **`projections-tab-content.tsx`** (sections + chart config hooks). *(Code)*
- [ ] Fix stale **`any`** reference comment in **`build-insights-payload.ts`**. *(Code)*
- [ ] Use **app origin** for **unsubscribe** HTML footer link (staging-safe). *(Code)*

### Business / valuation docs

- [x] **`docs/reference/roadmap.md`**: **Vitest** counts (**85 / 618** this run), **reverse-trial** / retention wording vs shipped product. *(Business — addressed in 2026 doc cleanup Phase D; re-verify with `npm run test` when updating.)*
- [x] **`docs/reference/valuation-brief.md`**: **§7** backlog vs roadmap (e.g. autocomplete); **§293** vs depth of **Vitest** coverage. *(Business — addressed in 2026 doc cleanup Phase D; sensitive numbers remain PM-owned.)*
- [x] **`docs/launch/launch-plan.md` §9** — env, health, support, Stripe/pricing parity, golden-path demo (**owner verification**). *(Business — addressed in 2026 doc cleanup Phase D; owner verification still outstanding as applicable.)*

### Governance / documentation

- [x] **`docs/README.md`** and **`docs/audits/synthesis/README.md`**: point “latest full synthesis” to **`2026-04-30-audit-synthesis.md`** (update again when superseded). *(Documentation — 2026 doc cleanup Phases C/K.)*
- [x] **2026-04-05 root audits:** Moved into `docs/audits/feature/` and `docs/audits/growth-funnel/`; dependents / plan `audit:` updated (Phase G). *(Polish-gap / other root strays may remain.)*
- [x] **`docs/process/full-audit-synthesis.md`** `tasks.md` link depth — verified **`../tasks.md`** from `docs/process/` (Phase K). *(Documentation)*
- [x] **`AVAILABLE_AGENTS.md`**: add file or retarget references in tooling / plans. *(Documentation — Phase I.)*
- [x] **`docs/plans/2026-04-05-edit-page-completion-guidance.md`**: fix **`research:`** target or remove with rationale. *(Documentation — Phase H; research stub added.)*
- [x] **`docs/audits/synthesis/README.md`**: one-line index for **`2026-04-29-user-clarifications-and-technical-notes.md`**. *(Documentation — Phase C.)*
- [x] **`docs/README.md`** process list: include **mobile-experience-audit-process** if still missing. *(Documentation — Phase C.)*
- [x] **`docs/cursor-agent-setup.md`**: “Other focused audits” lists **all fourteen lanes** or **only** points at **`docs/audits/README.md`**. *(Governance — defers to audits README, Phase I.)*
- [ ] **`.cursor/rules/agent-governance-audit-agent.mdc`**: step 1 allows **Agent-mode** execution without subagent where **`docs/audits/README.md`** allows writes. *(Governance)*
- [x] **`docs/process/agent-governance-audit-process.md` §4**: cross-link **`docs/process/command-integrity-check.md`**. *(Governance — Phase I.)*

---

## PM triage (this run)

### Ship (next window)

- [ ] **Admin rate limits** — `admin:trial-patch`, `admin:trial-email-send`, `admin:billing-sync` still missing from **`RATE_LIMITS`**. *(Security)*
- [ ] **JSON-LD / pricing / Stripe truth** — process + code so **`layout`** offers do not drift from **`/pricing`** and billing after releases. *(SEO + Legal disclosure)*
- [ ] **Paid intent on `/plans`** — **`PaidIntentCheckoutBanner`** (or equivalent) so checkout nudge is not dashboard-only. *(Growth)*
- [ ] **RentCast / refresh scale** — cap per-run property volume + **`getRefreshEligibleUsers`** paging / SQL eligibility. *(Performance + Cost)*
- [ ] **PostHog server client churn** — batch or reuse client on webhook / cron paths. *(Performance + Cost)*

### Schedule (next batch)

- [ ] **Quick vs full Add property** — shared policy + **hrefs** (dashboard, Properties, Modeling, Mortgage, analyzer, nav). *(Feature + Growth)*
- [ ] **`MobileBottomNav` `/analyze`** + **mobile** drawer **focus** + **44px** targets. *(Feature + Mobile)*
- [ ] **CSV import/export** benchmark **as-of** columns + tests; **milestone payoff** strict vs tolerance + **email** copy. *(Data + Math)*
- [ ] **Analytics §8 / full_liability** comment and doc sweep; **portfolio-csv-export** doc refresh. *(Data + Documentation)*
- [ ] **Runbook §3** vs **`/api/health`**; **billing-sync Sentry**; **CRON_SECRET** ops doc. *(Reliability)*
- [ ] **Security-audit doc** CSP §6 / §7 refresh after any code changes. *(Security + Documentation)*
- [ ] **SEC-SHIP-3** closure in **`tasks.md`**. *(Security)*
- [ ] **Dynamic Recharts** on signed-in rent-vs-buy; smaller code nits (insights comment, unsubscribe URL). *(Code)*
- [ ] **Homepage `PublicCalculator` `showCta`**; **calculator → app** field carry. *(Growth)*
- [x] **Roadmap / valuation brief / launch §9** doc accuracy (counts, §7 table, owner checklist). *(Business — 2026 doc cleanup Phase D; ongoing owner verification as noted in launch doc.)*
- [x] **Documentation hubs**, **synthesis README**, **full-audit-synthesis** link, **04-05** audit root hygiene, **edit-page** plan, **AVAILABLE_AGENTS**, process hub **mobile** lane. *(Documentation — 2026 doc cleanup Phases C–K; see [`docs/process/_maintenance/2026-doc-cleanup-plan.md`](../../process/_maintenance/2026-doc-cleanup-plan.md).)*
- [ ] **Agent governance** setup + rule alignment with **`docs/audits/README.md`**. *(Governance — outstanding: `.cursor/rules/agent-governance-audit-agent.mdc` step 1 vs synthesis note on subagents.)*

### Optional / backlog

- [ ] Split **`projections-tab-content.tsx`** mega-module. *(Code)*
- [ ] **ISR** / static shells for marketing/legal. *(Performance)*
- [ ] **Per-route sitemap `lastModified`**. *(SEO)*
- [ ] **`instrumentation` `CRON_SECRET` assert** when policy allows. *(Security)*
- [ ] **`useIsMobile`** SSR documentation / alternative. *(Mobile)*

### Human-only / deferred

- [ ] **Counsel**: California / US state **privacy** copy; **Contact** / **Terms** SLA alignment; sign-off after material legal changes. *(Legal)*
- [ ] **BIZ-entity**: LLC + Stripe + Terms — **`docs/business-launch-checklist.md`**. *(Business)*
- [ ] **Launch plan §9**: verifier + date recorded. *(Business)*
- [ ] **Search Console**, preview **`noindex`**, production **`robots`/`sitemap`** checks — operator / manual QA. *(SEO)*
- [ ] **Table-top**: Neon / incident signals vs runbook. *(Reliability)*

**GRW-1** (mobile pricing accordion **Estimate pool** row): still **not** a task per permanent deferral in **`docs/process/growth-funnel-audit-process.md`**.

---

## PM review

Promote **Ship** and **Schedule** to [docs/tasks.md](../../tasks.md) when approved. Builder implements approved items.

After promotion, update **`docs/README.md`** and **`docs/audits/synthesis/README.md`** “latest synthesis” pointers to this file (also listed in **Schedule** for doc hygiene).
