# Full Audit Synthesis — 2026-04-01 (run **-2**)

Second full-audit pass same day; **does not modify** lane reports from run **1** (unsuffixed `2026-04-01-*-audit.md`). All lane outputs use suffix **`-2`**.

## Audits included

- Code — `docs/audits/code/2026-04-01-code-audit-2.md`
- Math & Logic — `docs/audits/math/2026-04-01-math-logic-audit-2.md`
- Feature / UX / IA — `docs/audits/feature/2026-04-01-feature-ux-audit-2.md`
- Mobile experience — `docs/audits/feature/2026-04-01-mobile-experience-audit-2.md`
- Security & Privacy — `docs/audits/security/2026-04-01-security-audit-2.md`
- Performance & Cost — `docs/audits/performance-cost/2026-04-01-performance-cost-audit-2.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-04-01-reliability-ops-audit-2.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-04-01-data-integrity-audit-2.md`
- Business & Valuation — `docs/audits/business/2026-04-01-business-valuation-audit-2.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit-2.md`
- SEO (search & discovery) — `docs/audits/seo/2026-04-01-seo-audit-2.md`
- Documentation — `docs/audits/documentation/2026-04-01-documentation-audit-2.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-04-01-legal-compliance-audit-2.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-04-01-agent-governance-audit-2.md`

*14 lanes, two batches (7 + 7 parallel subagents).*

---

## How to read this synthesis

**Triage rubric:** [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) §**3.5**. Compare with **[run 1](2026-04-01-audit-synthesis.md)** — Ship items there were implemented; this run surfaces **new or remaining** work, including regressions/risks introduced by context shift (e.g. post-Ship code review).

---

## PM triage (this run **-2**)

### Ship (next window)

*Items that are user-visible defects, guideline risk, or defense-in-depth gaps not already closed in run 1.*

- [x] **Mobile (High):** Fix marketing calculator layout for **768px ≤ width &lt; 1024px** — desktop grid now **`md:grid`** / **`md:col-span-*`** aligned with `md:hidden` mobile shell (`public-calculator`, `brrr`, `str-ltr`, `fix-and-flip`; covers `/tools/*`, `/investment-property-calculator`, `/calculators/*`). **Done 2026-04-01.**
- [x] **Security (Medium):** Add `ApiRateLimitEntry` coverage for **mortgage `POST` / `PATCH`** under `/api/properties/[id]/mortgage/` (DELETE already limited in run 1). *Done 2026-04-01: `properties:mortgage-post` / `properties:mortgage-patch` (60/hr) in `lib/rate-limit.ts`; POST/PATCH routes.*

### Schedule (next batch)

- [ ] **Feature/UX:** Welcome overlay dialog semantics (`OnboardingPanel`); empty-search affordances on deals list; `OverLimitBanner` semantic tokens; Analyze vs Deals nav.
- [ ] **Growth:** Onboarding PATCH error UX; elevate analyze/import on empty dashboard; copy alignment (60s vs 2 min); `PlanIntentUrlSync` on sign-in; `UpgradePlanLink` on deals at-limit.
- [ ] **SEO:** Canonical `alternates` from authenticated `/calculators/*` to public `/tools/*` (soft priority while `noindex`).
- [ ] **Performance:** Lazy-load `deal-analyzer-form` sections; optional `property.count` / loader DRY.
- [ ] **Reliability:** Incident runbook health scope (DB-only) + Clerk/Stripe pointers; root `app/error.tsx` or ADR; optional Sentry on high-traffic routes.
- [ ] **Data integrity:** Doc note CSV rent vs NOI effective rent; optional metrics API self-description.
- [ ] **Legal:** Cookie settings + Vercel Web Analytics mention; `security-notes.md` gtag consent wording.
- [ ] **Governance:** Mobile report path exception in `agent-governance-audit-process.md` §1 and `full-audit-synthesis.md` §6.
- [ ] **Documentation:** Reconcile **[run 1](2026-04-01-audit-synthesis.md)** Appendix checkboxes with completed Ship items; expand `docs/README.md` hub.
- [ ] **Code (maintainability):** Split `deal-analyzer-form.tsx` / `pricing-cards.tsx`; prototype slim `GET /api/deals/[id]` portfolio payload after metrics; Sentry on `delete-permanent` failure paths.

### Optional / backlog

- [ ] CSP enforcement staging + doc tables; SCA cadence in process docs.
- [ ] Math: optional DRY `isNegativeAmortizingPayment` in schedule generator.
- [ ] Prisma major: adapter alignment.
- [ ] Business moat / roadmap items; changelog hub link.

### Human-only / deferred

- [ ] Owner: launch plan §9, PostHog UI verification, counsel on Terms.
- [ ] Manual viewport/device matrix per `mobile-experience-audit.md` §5.
- [ ] Production SEO spot-checks (Search Console, URL inspection).

### Delta vs synthesis run **1** (notable)

- **Reliability:** `POST /api/account/delete` **fail-closed** on Stripe cancel (503 + Sentry) — prior “continue after log” issue **resolved**.
- **Mobile:** Run **-2** raises **tablet-width blank calculator** as **High** — worth prioritizing alongside Schedule UX items.
- **Security:** New gap: **mortgage POST/PATCH** rate limits (DELETE covered in run 1).
- **Code audit -2:** Task candidate “add userId to property PATCH where” is **stale** — `app/app/api/properties/[id]/route.ts` already uses `where: { id, userId: user.id }`.

---

## Deduplication notes

- **Deal analyzer size / lazy-load:** Code + Performance → one Performance-scheduled row.
- **Onboarding a11y + PATCH errors:** Feature + Growth → related; can ship in one milestone.
- **UpgradePlanLink on deals:** Growth (unchanged from run 1).

---

## PM review

Promote **Ship** and **Schedule** to [`docs/tasks.md`](../../tasks.md) as needed. Run **1** Ship work is tracked there under “Audit synthesis — Ship phase”; add a **run -2** subsection or new phase if PM wants separation.

---

## Re-test (cross-cutting)

- [ ] After tablet calculator fix: 768px and 1024px on all four marketing calculators.
- [ ] After mortgage rate limits: PATCH/POST mortgage happy path + 429.
- [ ] Account delete: Stripe cancel fail → 503 + no soft-delete (regression).
- [ ] `npm run check` after code changes.

---

## Appendix: consolidated task index (by domain, run **-2** lanes)

*See each `*-audit-2.md` for full evidence and re-test checklists. Implementation verification items (`npm run check`, manual QA) omitted here.*

**Code:** Split large modules; slim deal GET; PATCH where; Sentry delete-permanent.

**Math:** Optional DRY negative-amort in schedule.

**Feature/UX:** Dialog semantics; deals empty search; OverLimit tokens; nav labels.

**Mobile:** **Tablet breakpoint calculator visibility (High).**

**Security:** Mortgage POST/PATCH rate limits; CSP staging; SCA cadence.

**Performance:** Lazy-load analyzer; property.count DRY; export loader DRY; Prisma future.

**Reliability:** Runbook health; root error boundary; billing/sync semantics doc; optional Sentry.

**Data integrity:** CSV rent vs NOI doc; metrics API context.

**Business:** Launch §9; PostHog; counsel.

**Growth:** Onboarding errors; empty state; copy; PlanIntent sign-in; UpgradePlanLink.

**SEO:** In-app calculator canonicals; Search Console ops doc.

**Documentation:** Synthesis appendix consistency; README hub; process naming `-N`; optional pointer from audit-1 to audit-2.

**Legal:** Cookie copy; security-notes gtag; last-updated alignment.

**Governance:** Mobile path in process docs; optional `-N` in governance README.
