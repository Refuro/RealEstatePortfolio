# Business & Valuation Audit — 2026-04-01 (run suffix **-2**)

## Executive summary

- **Strategic posture is unchanged and well documented:** Veld Portfolio remains a credible **investor-intelligence** niche SaaS with Stripe-backed tiers, documented billing matrix, PostHog funnel definitions, and a roadmap that avoids property-management scope creep (`docs/reference/roadmap.md`, `docs/launch/investor-style-one-pager.md`). **Traction and repeatable distribution** are still the binding business risks, not core feature absence.
- **Full-audit synthesis (2026-04-01) closed multiple Ship-tier engineering items** (SEO FAQ/JSON-LD alignment, canonical parity, destructive-route rate limits, account-delete Stripe handling, CSV multi-mortgage disclosure, doc link sweep per `docs/audits/synthesis/2026-04-01-audit-synthesis.md`). That improves **diligence comfort** but does not substitute for **verified MRR, churn, or cohorts** stored outside the repo.
- **Owner-operational gaps remain visible in docs:** `docs/launch/launch-plan.md` §9 still lists five unchecked production sign-offs (envs, health, support, pricing parity, golden-path demo). `docs/launch/posthog-growth-funnel.md` quick verification checkboxes remain open—buyers cannot treat funnel KPIs as **closed-loop** from markdown alone.
- **Overall recommendation:** Classify the asset as **strong pre-traction software + process maturity**; next value creation is **production verification, commercial truth in Stripe/analytics, and GTM execution**—consistent with `docs/launch/investor-style-one-pager.md` §10.

---

## Severity-ranked findings

### Critical

- *(None identified on this pass.)*

### High

- **No in-repository evidence of paying subscribers, MRR, ARPA, or retention** — Billing architecture and internal matrices are documented (`docs/internal/billing-matrix.md`, `docs/launch/investor-style-one-pager.md` §5), but financial and cohort **actuals** are not in-repo. Acquirers default to **replacement-cost / asset** framing until Stripe Dashboard or dataroom evidence exists.

- **Distribution and PMF at scale remain unproven** — Roadmap §1a and the one-pager state the largest risk is **distribution**, not code; spreadsheets remain the free default competitor (`docs/reference/roadmap.md`, `docs/launch/investor-style-one-pager.md` §7). Without repeatable acquisition and activation proof, **revenue-multiple** valuation does not apply.

### Medium

- **Launch checklist §9 incomplete for “broad launch” posture** — Five rows remain unchecked pending owner verification: production envs, `/api/health`, support path, pricing vs Stripe alignment, golden-path demo (`docs/launch/launch-plan.md` §226–236). Honest documentation is good; **unresolved sign-offs** raise operational risk if paid spend scales first.

- **PostHog funnel not verified as closed-loop in documentation** — `docs/launch/posthog-growth-funnel.md` §Quick verification checklist remains unchecked (env, test user path, saved insight name, high-intent CTA, limit-hit upgrade). Cross-lane synthesis lists completion in PostHog UI as **Human-only** (`docs/audits/synthesis/2026-04-01-audit-synthesis.md`). Until checked, stakeholders cannot rely on a single **named** dashboard insight as institutionalized.

- **Subscription legal copy not through counsel (cross-lane)** — Synthesis Human-only: recurring-billing / auto-renew wording for target jurisdictions. Relevant for fundraising or strategic sale legal diligence (`docs/audits/synthesis/2026-04-01-audit-synthesis.md` §Human-only).

- **`invoice.payment_failed` not emphasized in webhook playbooks** — `customer.subscription.updated` and documented `past_due` UX cover much of the lifecycle (`docs/internal/past-due-user-path.md`). Teams expecting an explicit `invoice.payment_failed` handler in runbooks should confirm Stripe event coverage against `docs/setup/manual-steps.md` / internal webhook notes—**medium** for ops consistency, not necessarily product correctness.

### Low

- **Growth funnel friction items remain Schedule-tier polish** — Onboarding PATCH error UX, `PlanIntentUrlSync` on sign-in, plain `Link` to `/plans` on deals at-limit, empty-dashboard discoverability (`docs/audits/synthesis/2026-04-01-audit-synthesis.md` §Schedule; `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md`). These affect **conversion efficiency**, not core billing existence.

- **Moat is workflow, niche focus, and execution—not structural lock-in** — No network effects or exclusive data; differentiation is credible but copyable (`docs/internal/differentiator-value-add-analysis.md`; `docs/launch/investor-style-one-pager.md` §8).

- **Single-founder / owner dependence** — Support, marketing, and vendor relationships remain concentrated; typical at this stage but relevant for buyer **key-person** discount (`docs/business-launch-checklist.md`).

- **Entity / Terms alignment is documented as a future step** — `docs/business-launch-checklist.md` notes Terms may still describe an individual operator until an LLC is formed; **low** urgency until revenue or contracts demand entity upgrade.

---

## Evidence reviewed

- **Process:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/full-audit-synthesis.md` §3.5 (PM triage)
- **Product & strategy:** `README.md`, `docs/reference/roadmap.md` (§1a strategic backlog, completed table, deferred §6), `docs/internal/differentiator-value-add-analysis.md`
- **Launch & commercial:** `docs/business-launch-checklist.md`, `docs/launch/launch-plan.md` (§6–11, §9 checklist), `docs/launch/investor-style-one-pager.md`, `docs/launch/posthog-growth-funnel.md`, `docs/internal/billing-matrix.md`
- **Cross-audit / synthesis:** `docs/audits/synthesis/2026-04-01-audit-synthesis.md`, `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md`, `docs/audits/README.md`
- **Prior same-day business audit (continuity):** `docs/audits/business/2026-04-01-business-valuation-audit.md`

**Limits:** No Stripe Dashboard, Clerk, PostHog project UI, or production Vercel environment was queried. No live traffic, conversion, or revenue exports. Valuation bands below are **illustrative**, not fairness opinions or tax advice. **No files under `app/` were modified** for this pass.

---

## Risk & impact assessment

| Theme | Likelihood | Impact if ignored |
|--------|------------|-------------------|
| No verified ARR in diligence materials | — | Valuation stays in **asset / rebuild** band; strategic multiples unsupported |
| Weak or unproven distribution | High until proven | Caps strategic premium; “feature-complete” without GTM proof discounts heavily |
| Open launch §9 sign-offs | Rises with ad spend | Health/support/pricing drift directly hurts trust and conversion |
| PostHog checklist / named insight not evidenced in docs | Medium | PM and investors lack a single written confirmation that the funnel insight is live and pinned |
| Counsel gap on subscription Terms | Low–medium pre-fundraise | Legal diligence findings on consumer subscription disclosures |
| Growth Schedule items (onboarding errors, intent sync) | Medium | Incremental conversion loss; not existential |

**Likelihood / exposure (summary):** Technical and documentation maturity are **above average** for a pre-launch niche SaaS; **commercial exposure** is dominated by **unverified traction** and **operational sign-offs**, not missing core product narrative.

### Valuation framing (illustrative)

**Assumptions:** Value the **in-repo** software, docs, and described ops—not audited financial statements. “No users” means **no material recurring revenue evidenced** in reviewed artifacts. “With traction” assumes **verified** subscription economics and clean history.

| Scenario | What is priced in | Indicative USD range | Confidence |
|----------|-------------------|----------------------|------------|
| **A — Codebase / no paying users** | Replacement cost, billing + analytics wiring, roadmap depth, audit/process maturity | **~$12K–$35K** (overlaps `docs/launch/investor-style-one-pager.md` **~$8K–$50K** “codebase-only” spread) | Low–medium |
| **B — Early revenue** | Tens of paying subs, early churn read, rough CAC | **~$40K–$95K** | Low until verified |
| **C — PMF signal** | ~100+ paying, meaningful MRR, improving net retention | **~$110K–$320K+** | Low until verified |

**Needle-movers (typically outside the repo):** MRR and ARPA by tier; gross/net churn; activation (e.g. first property in 7 days); support load per 100 MAU; API COGS per active user (RentCast, Stripe).

---

## Recommendations (prioritized)

1. **Complete owner production sign-off for `docs/launch/launch-plan.md` §9** — Check each item or record an explicit waiver with date; include golden-path demo for investor conversations.
2. **Execute and document PostHog quick verification** — Complete `docs/launch/posthog-growth-funnel.md` §Quick verification checklist; pin **`Growth funnel — signup to subscribed`** in the PostHog project; optionally add a pointer in `docs/launch/analytics.md`.
3. **Maintain commercial truth outside the repo** — Stripe Dashboard + spreadsheet or BI for MRR/churn; the repository should not pretend to be the ledger.
4. **Route subscription Terms through counsel** when fundraising, scaling paid acquisition, or entering a sale process (per synthesis Legal / Human-only).
5. **Promote high-ROI GTM fixes from synthesis Schedule** (onboarding error UX, `PlanIntentUrlSync` on sign-in, `UpgradePlanLink` on deals at-limit) when engineering capacity allows—after §9 and analytics verification.

---

## Task candidates (optional)

- [ ] Owner: complete and date `docs/launch/launch-plan.md` §9 production checklist items (or document explicit waiver).
- [ ] Owner: complete PostHog funnel verification in **PostHog UI**; pin insight; update `docs/launch/posthog-growth-funnel.md` checkboxes.
- [ ] Legal: route recurring-billing / auto-renew Terms clauses through **counsel** for target jurisdictions.
- [ ] PM: promote approved Schedule items from `docs/audits/synthesis/2026-04-01-audit-synthesis.md` to `docs/tasks.md` per triage rubric.

---

## Re-test checklist

- [ ] Spot-check `/pricing` and `/plans` against Stripe prices and `NEXT_PUBLIC_PRICE_*` after any price change (`docs/internal/billing-matrix.md` checklist).
- [ ] Staging or prod: simulate `past_due` per `docs/internal/past-due-user-path.md`.
- [ ] PostHog: test user path `user_signed_up` → `property_created` → `checkout_started` → `subscription_activated` (consent noted).
- [ ] After any future billing code change: `npm run check` in `app/` (not required for this audit-only pass).

---

## Next trigger and cadence

- **Trigger:** Pricing/packaging change, paid acquisition scale-up, first verified MRR milestone, fundraising, acquisition process, material billing/webhook change, or quarterly business review.
- **Recommended next run:** Quarterly per `docs/audits/README.md` for Business & Valuation; **monthly** during active fundraising or heavy paid spend.

---

**PM triage (full audits):** Per [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) §3.5, items above map primarily to **Human-only** (owner PostHog/launch verification, counsel) and **Schedule** (growth polish from synthesis)—promote **Ship** / **Schedule** to [`docs/tasks.md`](../../tasks.md) only when PM-approved.
