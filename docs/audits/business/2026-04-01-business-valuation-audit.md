# Business & Valuation Audit — 2026-04-01

## Executive summary

- **Commercial and billing documentation matured since the prior in-repo business snapshot.** `docs/internal/billing-matrix.md` now includes an auxiliary billing API table (`/status`, `/sync`, `/subscription-details`), and `docs/internal/past-due-user-path.md` documents the full Stripe `past_due` → layout → `PastDueBanner` → portal path. `docs/launch/analytics.md` carries expanded event reference and dedup rules; `docs/launch/posthog-growth-funnel.md` documents supplementary limit-hit and funnel CTA events aligned with code paths (e.g. `landing_pricing_preview` in `app/app/page.tsx`).
- **Core investor math posture improved on paper for diligence.** The 2026-04-01 Math & Logic audit reports **no Critical/High/Medium** findings for in-scope amortization and metrics modules (`docs/audits/math/2026-04-01-math-logic-audit.md`). Residual items are Low (helper unification, future-dated `balanceAsOfDate` edge). This supersedes the earlier business-lane concern that negative-amortization schedule iteration was an open High severity item.
- **Valuation remains traction-limited.** No MRR, paying subscriber counts, or cohort retention evidence lives in the repository. From an acquirer lens, the asset is still primarily **replacement-cost / documentation-quality** value plus optional strategic premium for niche fit—consistent with `docs/launch/investor-style-one-pager.md` §9–10. **Distribution and proof of repeatable activation** stay the dominant business risk.
- **Launch readiness:** `docs/launch/launch-plan.md` §9 leaves five operational items unchecked pending **owner verification in production** (envs, `/api/health`, support path, pricing/Stripe alignment, golden-path demo). Analytics definition and uptime monitor items are checked; a 2026-04-01 documentation note records billing/Terms link work and `past_due` documentation.

---

## Severity-ranked findings

### Critical

- *(None identified on this pass.)*

### High

- **Revenue and retention remain unevidenced in-repo** — Stripe-backed plans, webhooks, and PostHog instrumentation are described and partially traceable in docs/code references, but there is no export, dashboard screenshot, or spreadsheet of paying subscribers, MRR, churn, or LTV in reviewed artifacts. Investor or acquirer conversations remain in **asset / replacement-cost** territory until metrics are verified outside the repo. — `README.md`; `docs/launch/investor-style-one-pager.md` §5, §9–10; limits: Stripe Dashboard / production not queried.

- **Distribution and proof of PMF at scale are still the core business gap** — Roadmap and launch plan describe a phased, founder-led go-to-market; the one-pager explicitly states the largest risk is distribution, not code quality. Without repeatable acquisition and retention evidence, strategic multiples do not apply. — `docs/reference/roadmap.md` §1a, §6; `docs/launch/launch-plan.md` §3–6; `docs/launch/investor-style-one-pager.md` §7.

### Medium

- **Production launch checklist (§9) partially open** — Five checklist rows still require owner sign-off against live production: production env vars, `/api/health`, support path, pricing vs Stripe spot-check, golden-path demo recording. The doc itself notes that remaining items need **owner verification**; unchecked boxes are appropriate documentation honesty but leave operational risk if paid spend scales before completion. — `docs/launch/launch-plan.md` §9 (lines ~228–236).

- **PostHog “quick verification” checklist not marked complete in documentation** — `docs/launch/posthog-growth-funnel.md` §Quick verification checklist still shows open checkboxes. Cross-lane synthesis (`docs/audits/synthesis/2026-04-01-audit-synthesis.md`) treats several growth/business tasks as complete; **in-repo evidence** of a saved insight named `Growth funnel — signup to subscribed` and checked boxes is still absent from the funnel doc. Until the checklist is completed and evidenced, diligence cannot assume the named dashboard insight exists in PostHog. — `docs/launch/posthog-growth-funnel.md` §Quick verification checklist.

- **`invoice.payment_failed` is not a named webhook handler** — `customer.subscription.updated` and related events propagate subscription status; `past_due` UX is documented end-to-end. An explicit `invoice.payment_failed` handler is still not required for correctness if Stripe emits `customer.subscription.updated`, but incident playbooks that expect a dedicated event may differ. — `docs/setup/manual-steps.md` (webhook events; not re-listed here); `docs/internal/past-due-user-path.md`; `app/app/api/billing/webhook/route.ts` (referenced in prior audits; not modified this pass).

- **Terms / recurring billing copy not through counsel (cross-lane)** — Synthesis notes open legal tasks: recurring-billing and auto-renew wording for target jurisdictions. For a buyer doing legal diligence, unresolved counsel review on subscription terms is a standard medium-risk item. — `docs/audits/synthesis/2026-04-01-audit-synthesis.md` §Legal / Compliance.

### Low

- **Growth funnel audit file may lag shipped instrumentation** — `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md` still lists high-severity gaps (e.g. untracked landing pricing preview); `app/app/page.tsx` includes `FunnelCtaLink` with `placement="landing_pricing_preview"`. Stale audit text can mislead roadmap prioritization; PM should reconcile audit markdown with synthesis and code or re-run the growth lane. — `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md`; `app/app/page.tsx` (grep evidence).

- **Changelog latest public entry is 2026-03-31** — `app/lib/changelog-data.ts` leads with `2026-03-31`. No same-day product release was required for this audit; future deploys should follow `docs/launch/changelog-process.md`. — `app/lib/changelog-data.ts`; `docs/launch/changelog-process.md`.

- **Moat is workflow, niche focus, and execution—not structural lock-in** — No network effects or exclusive data; spreadsheets remain the default competitor. Credible differentiation and polish are real but copyable. — `docs/launch/investor-style-one-pager.md` §7–8; `docs/internal/differentiator-value-add-analysis.md` (referenced in `docs/reference/roadmap.md`).

- **Owner dependence** — Operational maturity in docs does not remove single-founder execution risk for support, marketing, and vendor relationships—typical at this stage but relevant for valuation confidence. — `docs/business-launch-checklist.md`; `docs/launch/investor-style-one-pager.md`.

---

## Evidence reviewed

- **Process:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Product & strategy:** `README.md`, `docs/reference/roadmap.md`, `docs/business-launch-checklist.md`
- **Launch & investor framing:** `docs/launch/launch-plan.md`, `docs/launch/investor-style-one-pager.md`, `docs/launch/analytics.md`, `docs/launch/posthog-growth-funnel.md`
- **Commercial / billing docs:** `docs/internal/billing-matrix.md`, `docs/internal/past-due-user-path.md`
- **Cross-audit context:** `docs/audits/synthesis/2026-04-01-audit-synthesis.md`, `docs/audits/math/2026-04-01-math-logic-audit.md`, `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md`, `docs/audits/README.md`
- **Product signals (read-only):** `app/lib/changelog-data.ts`; grep confirmation for `landing_pricing_preview` in `app/app/page.tsx`
- **Prior business audit (continuity):** `docs/audits/business/2026-03-31-business-valuation-audit.md`

**Audit limits:** No Stripe Dashboard, Clerk, PostHog UI, or Vercel production environment was queried. No live MRR, traffic, or conversion data. Valuation ranges are **illustrative bands**, not fairness opinions or investment advice. App source was reviewed only as cited paths; **no changes were made under `app/`.**

---

## Risk & impact assessment

| Area | Likelihood | Business / valuation impact if ignored |
|------|------------|------------------------------------------|
| No verified revenue in-repo | — | No revenue-multiple valuation; stays in asset/rebuild band |
| Weak or unproven distribution | High until proven | Caps strategic premium; acquirer discounts “feature-complete” without GTM proof |
| Open launch §9 production sign-offs | Rises with spend | Env drift or broken health/support paths directly hurt conversion and trust |
| PostHog checklist / named insight not evidenced in docs | Medium | PM and investors cannot rely on a single source of truth for funnel KPIs |
| Counsel review on subscription Terms | Low–medium until fundraising | Legal diligence findings on consumer subscription disclosures |
| Stale growth-funnel audit vs code | Low | Internal mis-prioritization only |

---

## Valuation posture

**Shared assumptions (explicit):**

- Asset valued: SaaS codebase, documentation, and operational artifacts in-repo—not audited corporate financials.
- “Codebase-only / no users” means **no material recurring revenue evidenced** in reviewed materials.
- “With traction” assumes **verified** MRR, defensible churn, and clean subscription history; multiples are not automatic.

**Indicative ranges (USD, wide bands; not a fairness opinion):**

| Scenario | What is priced in | Indicative range | Confidence |
|----------|-------------------|------------------|------------|
| **A — Codebase / no paying users** | Replacement cost, billing + analytics + doc maturity, shipped investor workflows (deals, calculators, export, modeling) | **~$12K–$35K** | Low–medium (overlaps `investor-style-one-pager.md` **~$8K–$50K** “codebase-only” spread) |
| **B — Early revenue** | ~10–50 paying subs, visible retention, early unit economics | **~$40K–$95K** | Low until verified |
| **C — PMF signal** | ~100+ paying, meaningful MRR, improving net retention | **~$110K–$320K+** | Low until verified |

**What moves the needle (typically outside the repo):** MRR and ARPA by tier; gross/net churn; CAC by channel; activation (e.g. first property in 7 days); support load per 100 MAU; API COGS (RentCast, Stripe) per active user.

---

## Recommendations (prioritized)

1. **Complete owner production sign-off for `docs/launch/launch-plan.md` §9** — Check off or explicitly waive each remaining item with date/owner after verifying envs, health, support, pricing parity, and demo recording.
2. **Evidence the PostHog funnel in documentation** — Execute and tick `docs/launch/posthog-growth-funnel.md` quick verification; confirm the saved insight `Growth funnel — signup to subscribed` exists and is pinned; optionally add one line in `analytics.md` pointing to the dashboard URL or project name.
3. **Reconcile or refresh the growth-funnel audit file** — Align `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md` with current code and synthesis so business/growth stakeholders are not misled by superseded High findings.
4. **Maintain a single external source for commercial truth** — Continue using Stripe Dashboard + spreadsheet or BI for MRR; the repo will not substitute for financial actuals.
5. **Schedule legal counsel pass** on recurring-billing and auto-renew copy when fundraising or scaling paid acquisition (per synthesis Legal section).

---

## Task candidates

- [ ] Owner: complete and date `docs/launch/launch-plan.md` §9 production checklist items (or document explicit waiver).
- [ ] Owner: complete `docs/launch/posthog-growth-funnel.md` quick verification checklist and save/pin the named funnel insight in PostHog; update markdown checkboxes.
- [ ] PM: reconcile `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md` with shipped instrumentation or re-run growth lane.
- [ ] Legal: route subscription/Terms recurring-billing clauses through counsel for target jurisdictions (from synthesis).

---

## Re-test checklist

- [ ] Spot-check `/pricing` and `/plans` amounts against Stripe live/test prices and `NEXT_PUBLIC_PRICE_*` after any price change.
- [ ] Staging: simulate `past_due` and confirm banner + portal per `docs/internal/past-due-user-path.md`.
- [ ] Confirm PostHog shows `user_signed_up` → `subscription_activated` path for a test checkout (consent on).
- [ ] After any billing code change: `npm run check` in `app/` (not required for this audit-only pass).

---

## Next trigger and cadence

- **Trigger:** Pricing/packaging change, paid acquisition scale-up, first verified MRR milestone, fundraising, acquisition process, or material billing/webhook change.
- **Recommended next run:** Quarterly per `docs/audits/README.md` for Business & Valuation; monthly while in active fundraising or heavy paid spend.
