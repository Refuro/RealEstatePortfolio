# Veld Portfolio — Launch plan

**Status:** Living document — update as messaging and channels prove out.  
**Last reviewed:** 2026-03-20  
**Related:** Batch 8 *Launch plan* deliverable (complete) — see [`../tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-20)** (*Batch 8*). *(Epic G in the add-property overhaul is QA & cleanup — complete.)*

---

## 1. Executive summary

**Veld Portfolio** is a web app for **rental real estate investors** who want portfolio-level analytics without maintaining spreadsheets: equity, cash flow, NOI, rent/value **benchmarks (RentCast)**, **deal analysis**, **mortgage modeling** (amortization, extra payments), **CSV import**, and **Stripe**-backed plans (Free / Investor / Pro).

**Launch goal:** Move from “product-complete for core flows” to **repeatable acquisition** in defined communities, with consistent messaging and a phased rollout that matches current ops capacity (support, monitoring, content).

---

## 2. Comprehensive product review (launch readiness snapshot)

*Review scope: marketing surfaces, core app shell, data flows, and known gaps.*

### 2.1 Strengths (lead with these in messaging)

| Area | Notes |
|------|--------|
| **Positioning** | Clear niche: *portfolio analytics for investors* — not generic PM software. Landing hero + metadata align. |
| **Onboarding path** | Auth (Clerk), post-auth redirect to dashboard, Getting started / Add property, What’s next card, Analyze a deal CTA — activation-oriented. |
| **Core loop** | Add property → dashboard metrics → property Overview/Details → modeling & mortgage workspaces; deals for pre-purchase analysis. |
| **Trust & robustness** | Rate limits on sensitive APIs, CSP report-only, Sentry in error boundary, `/api/health`, incident runbook, structured billing logs. |
| **Data integrity** | Centralized metrics in `lib/metrics/`, ownership/analytics policies documented, import/export with NOI/cash flow columns, Zod validation. |
| **UX maturity** | Add-property overhaul (Epics A–G) complete: unified add/edit/detail IA, regression matrix in `qa/`. |
| **Growth assets** | Landing + pricing include product screenshots; Plans & billing naming consistent. |

### 2.2 Gaps before “big bang” marketing

| Gap | Impact | Mitigation |
|-----|--------|------------|
| ~~**No product analytics funnel**~~ | *(Addressed: PostHog in production; see [`analytics.md`](analytics.md).)* | Use funnel insights before scaling paid ads. |
| ~~**Limited core test coverage**~~ | *(Addressed: Vitest baseline + CI; expand per roadmap.)* | Keep tests green on metrics/amortization changes. |
| ~~**No public changelog**~~ | *(Addressed: `/changelog` + process doc.)* | Keep [`changelog-process.md`](changelog-process.md) on releases. |
| **RentCast dependency** | Estimates/benchmarks need API + user quotas | Communicate “estimates”; monitor errors and hourly limits per plan. |

### 2.3 Technical snapshot (for launch comms / due diligence)

- **Stack:** Next.js 16, React 19, Prisma/PostgreSQL, Clerk, Stripe, Sentry, RentCast.  
- **Hosting:** Document production URL (`NEXT_PUBLIC_APP_URL`, e.g. veldportfolio.com) and Vercel env checklist (Clerk, Stripe, DB, Sentry DSN).  
- **Support:** `SUPPORT_EMAIL` on landing/footer; `/contact` with **24 business hour** first-response target (see §6.1).

---

## 3. Target audiences & communities

Prioritize **high intent, low support burden** first.

| Priority | Audience | Why | Where to reach |
|----------|----------|-----|----------------|
| **P1** | Small landlords (1–5 doors) outgrowing spreadsheets | Core ICP; Free/Investor tiers fit | Reddit (r/realestateinvesting, r/landlord), Facebook landlord groups, local REIA meetups (talk or sponsor) |
| **P2** | “Analyzers” — people underwriting before buy | Deal workspace is a differentiator | BiggerPockets forums, YouTube RE channels (comment/tool mentions), Twitter/X RE threads |
| **P3** | Part-time investors with W-2 jobs | Need async, simple UX | Indie Hackers, product-led communities, newsletter swaps |
| **P4** | Coaches / educators | Referral potential | Affiliate or “tool stack” partnerships (later; validate product first) |

**Defer for launch v1:** Enterprise PMs, institutional funds (different workflow and expectations).

---

## 4. Messaging

### 4.1 Core promise (one line)

**“Track your rental portfolio in one place — equity, cash flow, and benchmarks without spreadsheets.”**

### 4.2 Pillars (aligned with `app/page.tsx` and product)

1. **Replace spreadsheets** — Single source of truth for properties and deals.  
2. **Know where you stand** — Rent & value estimates (RentCast), rent vs market on dashboard/list.  
3. **Decide faster** — Deal analyzer with investment metrics.  
4. **Model the future** — Scenarios, mortgage payoff / amortization views.

### 4.3 Proof points (use in ads, posts, demos)

- No credit card for Free (1 property).  
- CSV import for migrating from spreadsheets.  
- Screenshots on landing: dashboard, mortgage simulator, deal analyzer.  
- Plans: Free / Investor (5 properties) / Pro (20 properties) — simple ladder.

### 4.4 Words to avoid / clarify

- Don’t imply **bank sync** or **guaranteed** appraisals — say “estimates” and “benchmarks.”  
- Don’t promise **tax or legal advice** — analytics only.

---

## 5. Phased timeline

| Phase | Timeframe (suggested) | Goals | Activities |
|-------|----------------------|-------|--------------|
| **0 — Instrument** | 1–2 weeks | Measure funnel | Ship analytics (Batch 8) + minimal changelog page; verify Sentry/production health. |
| **1 — Soft launch** | 2–4 weeks | Learn + testimonials | Friends/network, 1–2 communities, collect feedback; fix top friction; gather 2–3 quotes or Looms. |
| **2 — Community launch** | Ongoing | Repeatable posts | 2–3 Reddit/forum posts per week (helpful, not spammy), answer “spreadsheet” and “how do I track equity” threads with tool mention when relevant. |
| **3 — Content & partnerships** | Month 2+ | SEO + trust | Short posts: “How I track LTV across properties,” changelog cadence, optional guest post or podcast. |
| **4 — Paid (optional)** | After funnel data | Scale what works | Small Google/Meta tests only once conversion events exist; cap spend. |

*Phase 0 (instrumentation, changelog, uptime, core tests) is **shipped**; current focus for new work is phases **1–4** above and roadmap items promoted in `docs/tasks.md`.*

### 5.1 Immediate execution plan (today -> next week)

Use this when launch energy is high and time is constrained.

| Window | Primary objective | Concrete actions | Exit criteria |
|-------|--------------------|------------------|---------------|
| **Today (testing session)** | De-risk launch blockers | Run golden-path smoke: sign up -> add first property -> dashboard metrics -> deal save -> plans/checkout start. Submit test contact form. Confirm PostHog events appear for `user_signed_up`, `property_created`, `deal_created`, `checkout_started`. | No blocking defects in core flow; support form delivers; analytics events visible. |
| **This weekend / early week** | Improve trust surfaces before traffic | Update legal page freshness dates and privacy wording for PostHog analytics usage. Define support SLA (target: first response within 24 business hours) and owner workflow. | Legal/privacy copy deployed; SLA documented; support owner confirmed. |
| **Next week (organic + paid test start)** | Acquire first qualified users | Post 2-3 high-value threads/comments in Reddit/forums; include screenshot + practical workflow tip, then soft CTA. Launch small Google Search test only (lean budget, high-intent keywords). | First paid + organic traffic cohort arrives; activation baseline established. |

### 5.2 30/60/90 launch and marketing plan (lean budget)

| Period | Focus | Channel plan | Budget guardrail | KPI gate to proceed |
|--------|-------|--------------|------------------|---------------------|
| **Days 0-30** | Activation + message fit | Founder-led community posts, direct user feedback, one short Loom demo, basic testimonials. | **$0-$300 total** (organic first, optional tiny ad test). | Baseline funnel measured: `user_signed_up` -> `property_created` (7 days). |
| **Days 31-60** | Repeatable acquisition | Continue Reddit/forums cadence; refine landing/pricing copy from objections; run narrow Google Search ad groups. | **$300-$600/month max** until conversion stabilizes. | Early monetization signal: `checkout_started` -> `subscription_activated` trend is stable or improving. |
| **Days 61-90** | Scale only what works | Double down on top 1-2 channels; publish lightweight educational content; optional micro-partnership tests. | Increase spend only with clear CAC confidence. | Activation and paid conversion are repeatable for at least 2-3 consecutive weeks. |

**Posting cadence (minimum):**

- 2-3 community contributions per week (help-first, non-spam).
- 1 product artifact per week (mini case, screenshot walkthrough, or changelog highlight).
- 1 weekly KPI review (activation, paid conversion, support load).

**Google Ads starter constraints (to avoid wasted spend):**

- Start with Search only (no broad display/video at first).
- Keep daily cap small (`$10-$20/day`) and run for 10-14 days before major changes.
- Pause keywords that do not produce downstream activation (`property_created`), not just clicks.

---

## 6. Launch checklist (operational)

- [x] Production env vars verified (Clerk URLs, Stripe webhooks, DB, Sentry, RentCast).  
- [x] `/api/health` green in prod; incident runbook reviewed.  
- [x] Support path tested (email or contact).  
- [x] Pricing page matches `lib/pricing-display.ts` / Stripe products.  
- [x] Analytics events defined (PostHog): see [`docs/launch/analytics.md`](analytics.md) — `user_signed_up`, `property_created`, `deal_created`, `checkout_started`, `subscription_activated`.  
- [x] External uptime monitor configured — UptimeRobot → `GET https://veldportfolio.com/api/health`; alerts to support email; [public status](https://stats.uptimerobot.com/Z6ScA8Ip37). Details: [`docs/runbooks/incident-response.md`](../runbooks/incident-response.md) § *External uptime monitor*.  
- [x] One “golden path” demo: sign up → add property → see dashboard → open deal analyzer (for video/screenshots).

*Production verification completed 2026-03-20 (PM).*

### 6.1 Support SLA (launch)

**First response target:** **24 business hours** (Monday–Friday, US business days, excluding common holidays) from when we receive a message via the **contact form** (`/contact`) or **support email** (`SUPPORT_EMAIL`, also shown in the footer).

**Scope:** Product and account support (access, billing questions, bugs). **Not** tax, legal, or investment advice—the app provides analytics and **estimates/benchmarks** only; see Terms and Privacy.

**Operational note:** This is a **goal**, not a contractual warranty. Actual response times may vary during incidents or high volume.

**Inbox verification:** Follow the checklist in [`docs/runbooks/incident-response.md`](../runbooks/incident-response.md) § *Support SLA and inbox verification* after deploy or when changing `SUPPORT_EMAIL`.

---

## 7. Success metrics (initial)

| Metric | Target (adjust after baseline) |
|--------|--------------------------------|
| Activation | % of signups adding ≥1 property in 7 days |
| Engagement | Weekly returning users with ≥1 property |
| Monetization | Free → paid conversion; churn on Investor/Pro |
| Quality | Sentry error rate; support tickets per 100 users |

---

## 8. Risks & dependencies

- **API costs / limits:** RentCast hourly limits per tier — monitor usage and messaging if users hit limits.  
- **Stripe/Clerk outages:** Rare but visible — status page links in runbook.  
- **OneDrive / Windows dev paths:** Team-only; no impact on users.  
- **Batch 8 (complete):** PostHog, changelog, test baseline, and uptime are in place; monitor and extend tests as domains grow.

---

## 9. Document control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-19 | Initial plan from app review + Batch 8 scope |
| 1.1 | 2026-03-20 | §6 launch checklist verified in production; §2.2 gaps updated for shipped Batch 8 items |
| 1.2 | 2026-03-20 | §5 note: Phase 0 complete; primary ongoing work is growth phases 1–4 |
| 1.3 | 2026-03-20 | Added §5.1 immediate execution timeline and §5.2 lean 30/60/90 plan with budget and KPI gates |
| 1.4 | 2026-03-20 | §6.1 Support SLA; aligns with `/contact`, privacy (PostHog), and runbook verification |

When the PM updates `docs/tasks.md`, keep this file in sync if audiences or phases change.
