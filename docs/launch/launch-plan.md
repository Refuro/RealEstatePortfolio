# Veld Portfolio — Launch plan

**Status:** Living document — update as messaging and channels prove out.  
**Last reviewed:** 2026-03-28  
**Related:** Fulfills **Batch 8** item *Launch plan* (checklist archived in [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-30)**).

---

## 1. Executive summary

**Veld Portfolio** is a web app for **rental real estate investors** who want portfolio-level analytics without maintaining spreadsheets: equity, cash flow, NOI, rent/value **benchmarks (RentCast)**, **deal analysis**, **mortgage modeling** (amortization, extra payments), **CSV import**, and **Stripe**-backed plans (Free / Investor / Pro).

**Launch goal:** Move from "product-complete for core flows" to repeatable acquisition in defined communities, with consistent messaging and a phased rollout that matches current ops capacity.

---

## 2. Comprehensive product review (launch readiness snapshot)

*Review scope: marketing surfaces, core app shell, data flows, and known gaps.*

### 2.1 Strengths (lead with these in messaging)

| Area | Notes |
|------|--------|
| **Positioning** | Clear niche: portfolio analytics for investors, not generic property management software. |
| **Onboarding path** | Auth (Clerk), post-auth redirect to dashboard, Getting started / Add property, Analyze a deal CTA. |
| **Core loop** | Add property -> dashboard metrics -> property details/modeling/mortgage workspace. |
| **Trust & robustness** | Rate limits on sensitive APIs, CSP report-only, Sentry in error boundary, `/api/health`, incident runbook, billing logs. |
| **Data integrity** | Centralized metrics in `lib/metrics/`, documented ownership + analytics policies, Zod validation. |
| **UX maturity** | Add-property overhaul complete with QA regression matrix. |
| **Growth assets** | Landing + pricing screenshots and clear plan ladder. |

### 2.2 Remaining risks before broad marketing

| Item | Status | Notes |
|------|--------|--------|
| **Product analytics funnel** | ✅ Shipped | PostHog when `NEXT_PUBLIC_POSTHOG_KEY` is set — see [`docs/launch/analytics.md`](analytics.md). |
| **Automated tests (core math + APIs)** | ✅ Shipped | Vitest coverage exists for metrics, amortization, validations, selected route handlers. |
| **Public changelog** | ✅ Shipped | `/changelog` + `lib/changelog-data.ts`. |
| **RentCast dependency** | Ongoing ops | Keep messaging as "estimates," monitor quotas/errors per plan. |

**Paid ads:** PostHog and core funnel events are live (`docs/launch/analytics.md`). **As of 2026-03-30:** paid acquisition may run alongside documented runbooks and readouts (`docs/launch/paid-ads-*`); keep spend and creative changes aligned with telemetry QA. *(Earlier “keep ads off until baseline” guidance applied before telemetry was shipped; see [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-30)**, Batch 14 / Business, if you need to tighten this language further.)*

**Operational links (paid acquisition + telemetry):**

| Doc | Use |
|-----|-----|
| [`pre-live-telemetry-qa-2026-03-30.md`](pre-live-telemetry-qa-2026-03-30.md) | Env checklist + browser QA before scaling paid spend |
| [`paid-ads-monitoring-runbook.md`](paid-ads-monitoring-runbook.md) | Day-4 / day-7 / day-14 kill / iterate / scale |
| [`paid-ads-campaign-build-sheet.md`](paid-ads-campaign-build-sheet.md) | Campaign structure, copy seeds, keywords |
| [Archived 2026-03-30 readouts](../archive/launch/paid-ads-readouts/README.md) | Historical readouts; use [`paid-ads-test-readout-template.md`](paid-ads-test-readout-template.md) for new runs |

### 2.3 Technical snapshot (for launch comms / due diligence)

- **Stack:** Next.js 16, React 19, Prisma/PostgreSQL, Clerk, Stripe, Sentry, RentCast.  
- **Hosting:** Production URL + Vercel env checklist (Clerk, Stripe, DB, Sentry DSN, PostHog).  
- **Support:** `SUPPORT_EMAIL` on public surfaces.

---

## 3. Target audiences & communities

Prioritize high intent and low support burden first.

| Priority | Audience | Why | Where to reach |
|----------|----------|-----|----------------|
| **P1** | Small landlords (1-5 doors) outgrowing spreadsheets | Core ICP; Free/Investor tiers fit | Reddit, local REIA groups, landlord communities |
| **P2** | "Analyzers" underwriting before buy | Deal workspace is differentiated | BiggerPockets forums, YouTube RE discussions, X threads |
| **P3** | Part-time investors with W-2 jobs | Need async and simple UI | Indie Hackers (feedback), product-led communities |
| **P4** | Coaches / educators | Referral potential | Partnerships after initial proof |

**Defer for v1:** enterprise PMs, institutional buyers.

---

## 4. Messaging

### 4.1 Core promise

**"Track your rental portfolio in one place — equity, cash flow, and benchmarks without spreadsheets."**

### 4.2 Pillars

1. **Replace spreadsheets** — single source of truth for properties and deals.  
2. **Know where you stand** — rent/value estimates and portfolio metrics.  
3. **Decide faster** — dedicated deal analyzer for underwriting.  
4. **Model the future** — scenarios + amortization/payoff visibility.

### 4.3 Proof points

- No credit card for Free tier (1 property).  
- CSV import for migration from spreadsheets.  
- Screenshots on landing: dashboard, mortgage simulator, deal analyzer.  
- Plans: Free / Investor / Pro.

### 4.4 Words to avoid / clarify

- Do not imply bank sync or guaranteed appraisals. Use "estimates" and "benchmarks."  
- Do not imply tax/legal advice.

---

## 5. Phased timeline

| Phase | Timeframe | Goals | Activities |
|-------|-----------|-------|------------|
| **0 — Instrument** | Done in product | Measure funnel | PostHog + `/changelog` shipped; keep production key enabled; verify Sentry/health. |
| **1 — Soft launch** | 2-4 weeks | Learn and gather testimonials | Network outreach + 1-2 communities, feedback loops, fix top friction. |
| **2 — Community launch** | Ongoing | Repeatable distribution | Helpful participation first, selective product mentions where allowed. |
| **3 — Content & partnerships** | Month 2+ | SEO + trust | Educational posts, changelog cadence, partner experiments. |
| **4 — Paid (optional)** | After baseline funnel | Scale | Small paid tests only after conversion data is stable. |

---

## 6. Distribution game plan (rule-safe)

This section is the operating system for launch posting. Use it before every post.

### 6.1 Channel constraints (what is allowed)

- **Indie Hackers**
  - Best use: founder narrative + specific feedback requests.
  - Norms: discussion-first titles, concise posts, useful insight for other founders.
  - Do not spam repeated launch posts; follow up with progress updates and lessons.

- **Reddit (global norms / Reddiquette)**
  - Treat self-promo as limited activity (rough 9:1 value-to-promo ratio).
  - Participate as a human in threads before dropping links.
  - Avoid vote-baiting, copy-paste blasts, and link-only posts.

- **r/realestateinvesting**
  - High enforcement: no self-promotion/apps in normal threads.
  - Use the monthly self-promo thread for explicit app promotion.
  - Respect minimum account-age/karma requirements before attempting posts.

- **r/Landlord**
  - Check current sidebar rules before each post (rules can change).
  - Default safe behavior: comment-first, value-first, no direct promo unless rules explicitly allow it.

- **BiggerPockets forums**
  - No advertising/solicitation in normal forum discussions.
  - Promotion belongs only in approved promotional areas (e.g., classifieds) and only if compliant.

### 6.2 Account strategy (new account vs existing)

- Use a real founder account with authentic history whenever possible.
- Do not create a brand-new account only to post product links.
- If account is new, warm it up first:
  1. 5-10 meaningful comments in relevant threads over several days.
  2. 1-2 non-promotional posts/questions.
  3. Then attempt one constrained promo action where rules allow it.
- Use one identity per platform; do not run multiple sock-puppet accounts.

### 6.3 Posting sequence

1. **Research rules and recent mod behavior** for each target community before posting.
2. **Contribute first** (answer questions, share useful numbers/process).
3. **Soft mention** only when directly relevant to the thread.
4. **Explicit promo post** only in channels/threads that allow it.
5. **Follow-up comments** in first 60 minutes after posting.
6. **Capture outcomes** (views, comments quality, signups, property_created rate).

### 6.4 Tone guardrails (avoid backlash)

- Lead with your problem story, not "I built an app, go buy."
- Be transparent: state that you are the founder.
- Ask for specific feedback ("What is confusing/missing?"), not generic praise.
- Keep claims grounded and concrete; avoid hype words ("revolutionary," "best ever").
- Do not mass cross-post identical copy. Adapt each post to the community context.
- Never argue with mods. If moderated, acknowledge and adjust.

### 6.5 14-day execution cadence

- **Day 1**
  - Review rules for each channel and save links/screenshots.
  - Prepare two post versions: short and long.
  - Prepare one screenshot set (dashboard, deal analyzer, mortgage/payoff).

- **Days 2-3**
  - 5-8 valuable comments across target communities.
  - No direct link drops unless explicitly requested in-thread.

- **Day 4**
  - Post/update on Indie Hackers with founder story + clear feedback ask.
  - Reply to every comment the same day.

- **Days 5-7**
  - Reddit/BiggerPockets comment-first participation.
  - If monthly self-promo thread is open in `r/realestateinvesting`, post there only.

- **Days 8-10**
  - Publish one educational post (spreadsheet workflow, underwriting checklist, or lessons learned).
  - Mention Veld only where context supports it.

- **Days 11-14**
  - Review PostHog funnel (`user_signed_up` -> `property_created`; `checkout_started` -> `subscription_activated`).
  - Keep top-performing channel/copy, pause weak channels.
  - Ship one product or onboarding fix from feedback.

### 6.6 Go / no-go checklist before each post

- [ ] Channel rules reviewed in the last 24 hours.
- [ ] Post provides standalone value without requiring click-through.
- [ ] Founder affiliation disclosed clearly.
- [ ] Link use complies with channel rules.
- [ ] CTA is feedback-oriented, not "buy now."
- [ ] Response plan ready for comments and moderation.

---

## 7. Channel posting assets

Use [`docs/launch/channel-posting-playbook.md`](channel-posting-playbook.md) for templates, safe phrasing, moderation-response scripts, and UTM conventions.

---

## 8. Paid ads execution assets

- [`docs/launch/paid-ads-test-plan.md`](paid-ads-test-plan.md) — first 14-day paid test strategy, budget tiers, channel mix.
- [`docs/launch/paid-ads-campaign-build-sheet.md`](paid-ads-campaign-build-sheet.md) — campaign naming, keyword starters, negative lists, copy seeds.
- [`docs/launch/paid-ads-monitoring-runbook.md`](paid-ads-monitoring-runbook.md) — day-4/day-7/day-14 kill/iterate/scale operations.
- [`docs/launch/paid-ads-test-readout-template.md`](paid-ads-test-readout-template.md) — end-of-test readout and week-3 decision.

---

## 9. Launch checklist (operational)

- [ ] Production env vars verified (Clerk URLs, Stripe webhooks, DB, Sentry, RentCast, PostHog).  
- [ ] `/api/health` green in prod; incident runbook reviewed.  
- [ ] Support path tested (support email/contact flow).  
- [ ] Pricing page copy aligned with Stripe products and display pricing.  
- [x] Analytics events defined in [`docs/launch/analytics.md`](analytics.md).  
- [x] External uptime monitor configured (`/api/health`).  
- [ ] Golden path demo recorded (signup -> add property -> dashboard -> deal analyzer).

*Documentation pass (2026-04-01):* Billing/refund/cancellation deep links to Terms (`/terms#subscriptions-and-payments`, `#refunds`, `#cancellation`) added on public `/pricing` and in-app `/plans`. `past_due` path documented in [`docs/internal/past-due-user-path.md`](../internal/past-due-user-path.md). SEO spot-check list: [`docs/qa/seo-release-checklist.md`](../qa/seo-release-checklist.md). Remaining unchecked items require **owner verification in production** (env, health, support, demo).

---

## 10. Success metrics

| Metric | Target |
|--------|--------|
| Activation | % of signups adding >=1 property in 7 days |
| Engagement | Weekly returning users with >=1 property |
| Monetization | Free -> paid conversion; churn on Investor/Pro |
| Channel quality | Comment quality, moderation incidents, signup-to-property conversion by source |
| Quality | Sentry error rate; support tickets per 100 users |

---

## 11. Risks & dependencies

- **API costs / limits:** RentCast hourly limits per tier.  
- **Stripe/Clerk outages:** rare but user-visible.  
- **Channel moderation risk:** violations can trigger bans; always run the go/no-go checklist.  
- **Instrumentation drift:** if event names change, update `docs/launch/analytics.md` and dashboards immediately.

---

## 12. Document control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-19 | Initial plan from app review + Batch 8 scope |
| 1.1 | 2026-03-27 | Batch 8 gaps marked shipped (PostHog, Vitest, changelog) |
| 1.2 | 2026-03-28 | Added rule-safe distribution game plan, account strategy, posting sequence, tone guardrails, and 14-day channel execution plan |
| 1.3 | 2026-03-28 | Added paid ads execution assets (test plan, campaign build sheet, monitoring runbook, readout template) |

When launch assumptions change, update this file and `docs/launch/channel-posting-playbook.md` together.
