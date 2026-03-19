# Veld Portfolio — Launch plan

**Status:** Living document — update as messaging and channels prove out.  
**Last reviewed:** 2026-03-19  
**Related:** Fulfills **Batch 8** item *Launch plan* in `docs/tasks.md`. *(Epic G in the add-property overhaul is QA & cleanup — complete; launch planning is tracked under Batch 8.)*

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
| **No product analytics funnel** (Batch 8) | Cannot measure sign-up → property → deal → paid | Prioritize PostHog/Mixpanel or defer broad paid ads until instrumented. |
| **Limited automated test coverage** (Batch 8) | Regression risk on `lib/metrics`, amortization | Add Vitest/Jest smoke tests for core math before heavy traffic. |
| **No public changelog** (Batch 8) | Harder to nurture returning users / SEO | Ship simple `/changelog` + footer link. |
| **RentCast dependency** | Estimates/benchmarks need API + user quotas | Communicate “estimates”; monitor errors and hourly limits per plan. |

### 2.3 Technical snapshot (for launch comms / due diligence)

- **Stack:** Next.js 16, React 19, Prisma/PostgreSQL, Clerk, Stripe, Sentry, RentCast.  
- **Hosting:** Document production URL (`NEXT_PUBLIC_APP_URL`, e.g. veldportfolio.com) and Vercel env checklist (Clerk, Stripe, DB, Sentry DSN).  
- **Support:** `SUPPORT_EMAIL` on landing/footer; contact form where applicable.

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

---

## 6. Launch checklist (operational)

- [ ] Production env vars verified (Clerk URLs, Stripe webhooks, DB, Sentry, RentCast).  
- [ ] `/api/health` green in prod; incident runbook reviewed.  
- [ ] Support path tested (email or contact).  
- [ ] Pricing page matches `lib/pricing-display.ts` / Stripe products.  
- [ ] Analytics events defined: sign_up, property_created, deal_created, checkout_started (when implemented).  
- [ ] One “golden path” demo: sign up → add property → see dashboard → open deal analyzer (for video/screenshots).

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
- **Batch 8 backlog:** Analytics + tests + changelog reduce launch risk; this plan does not require them to *start* soft launch, but they should precede **paid** scale.

---

## 9. Document control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-19 | Initial plan from app review + Batch 8 scope |

When the PM updates `docs/tasks.md`, keep this file in sync if audiences or phases change.
