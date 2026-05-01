# Veld Portfolio — Codebase & Product Valuation Brief

**Purpose:** Single-document summary for external evaluation of product maturity, codebase quality, and strategic position.  
**Audience:** External AI evaluator, advisor, or technical due-diligence reviewer.  
**Last updated:** 2026-04-30  
**Prepared by:** Owner / operator

---

## 1. Executive Summary

**Veld Portfolio** is a production-deployed SaaS application for small real estate investors (1–20 properties). It is an investor intelligence platform — not a property management tool. Its core job is to help a landlord understand what their properties are doing: equity, cash flow, debt burden, deal potential, and forward-looking projections.

**Current stage:** Early-launch / pre-revenue (see **§8 honest gaps** — **subscriber counts change** — verify Stripe + dashboards before quoting externally).

**Operational note:** Figures in §§1, 8, and **10 below** describing user counts, funnel completion, outreach, activation, revenue, etc. reflect **historical snapshots from owner records** dated **April 2026**. **Treat as diligence prompts, not authoritative analytics.** **As of 2026-04-30 — verify source** (`PostHog`, Clerk, Stripe, DB) before any external valuation use.

**Positioning:** The product occupies a genuine gap in the market: combining full pre-acquisition deal analysis with ongoing portfolio tracking in a single product, without requiring bank sync or accounting setup. No direct competitor does this cleanly at the same price point.

---

## 2. Business Model

### Pricing

| Plan | Properties | Saved Deals | Monthly | Annual |
|------|------------|-------------|---------|--------|
| Free | 1 | 5 | $0 | $0 |
| Investor | 5 | 20 | $15/mo | $150/yr |
| Pro | 20 | 50 | $29/mo | $290/yr |

Annual plans include approximately 2 months free. No credit card required for the Free tier. **Displayed dollar amounts on `/pricing`** follow **`NEXT_PUBLIC_PRICE_*`** env vars (`app/lib/pricing-display.ts`); Stripe price IDs must match marketing (`docs/setup/manual-steps.md`).

### Target ICP

Individual landlords and small passive real estate investors managing 1–20 properties. Specifically: people currently using Excel or Google Sheets for portfolio tracking who want consistent, trustworthy metrics without switching to an accounting platform or connecting a bank account.

### Revenue mechanics

Stripe subscriptions with monthly and annual billing cycles. Plan-gated limits enforced at the API layer (property count, saved deal count). Billing portal for self-service upgrades, downgrades, and cancellations. Webhook-synced subscription state with idempotency guards. Admin membership override for partner/demo accounts.

### Market context

Adjacent competitors include Stessa ($12–$40/mo), Baselane (free banking-first), Rentastic ($12–$20/mo), DealCheck ($10–$20/mo), and Landlord Studio ($12–$24/unit/mo). Veld is priced comparably to the mid-tier, with stronger deal analysis and portfolio intelligence than most, at a lower price point than Mashvisor ($99+/mo).

---

## 3. Shipped Feature Inventory

### Portfolio intelligence

- Dashboard with headline metrics: total value, debt, equity, monthly cash flow, portfolio cap rate, portfolio LTV, cash-on-cash return, NOI
- Per-property metrics: equity, cash flow, cap rate, LTV, cash-on-cash, DSCR
- Charts: equity by property, cash flow by property, debt vs. value
- Rent vs. market benchmarking (RentCast-powered, rental-status-aware)
- Benchmark status surfaced on properties list and dashboard
- Partial ownership support: metrics scale to user's ownership percentage
- Ownership display modes: "My share" vs. "Full liability" toggle in Settings
- Vacancy assumption: configurable vacancy % (default 5%) applied to effective rent

### Property management

- Property CRUD with full wizard: address, purchase details, rent, expenses, property type, units, cash invested, ownership %, rental status
- Property types: single family, condo, townhouse, manufactured, multi-family, apartment
- Property detail with tabbed Overview / Details layout
- Scenario what-if sliders on property detail: adjust rent %, value %, mortgage payment %; real-time metric recalculation (ephemeral)
- Rent estimate (RentCast): one-click populate rent field
- Value estimate (AVM, RentCast): one-click populate value field

### Mortgage and debt

- Mortgage CRUD per property: balance, rate, term, monthly payment, lender, loan type, escrow
- Balance-as-of-date with 6-month recency window; falls back to amortization projection
- Effective balance logic: uses stored balance when recent, otherwise projected
- Amortization page per property: full payment schedule, payoff date, principal vs. interest split
- Mortgage workspace (`/mortgage`): portfolio-wide debt view, payoff trajectory, extra-payment modeling

### Analysis workspaces

- Deal analyzer (`/analyze`): full pre-acquisition workspace — enter address, rent, price, expenses, mortgage; instant metrics without adding to portfolio; portfolio context panel (weighted cap rate, portfolio cash-on-cash, portfolio DSCR) when a saved deal is loaded
- Saved deals: up to 5 (Free) / 20 (Investor) / 50 (Pro); promote deal to property with one click
- Modeling workspace (`/modeling`): forward-looking projection workspace — rent/expense/value growth, vacancy, hold years, optional sale analysis, presets (conservative / base / upside / custom), equity and cash-flow series over time, mortgage amortization in projection loop
- Refinance workspace (`/refinance`): model a refinance on any owned property — new rate, new term, cash-out amount; side-by-side impact on monthly payment, cash flow, DSCR

### Investment calculators

Available publicly at `/tools/` (shareable, SEO-indexed) and inside the app at `/calculators/` (with portfolio context nearby).

- BRRRR calculator: purchase + rehab + ARV + refi → equity recaptured, cash-on-cash
- Fix & Flip calculator: purchase + rehab + ARV + hold costs → net profit, ROI
- STR vs LTR calculator: short-term rental vs. long-term lease income/expense comparison
- Investment property calculator: general-purpose rental property screening
- Location-specific calculator landing pages for SEO (`/tools/[calculator]/[location]`)

### Data and export

- CSV import: properties from CSV (matches export format); plan-aware import-over-limit flow
- CSV export: full portfolio data from Settings
- Print-friendly portfolio summary at `/export/portfolio-summary` with assumptions footer

### Public marketing pages

- Landing page with hero, value props, pricing preview; mobile-responsive with hamburger nav
- Pricing page (public, monthly/annual toggle)
- Competitor comparison pages (`/vs/[slug]`)
- Alternative product pages (`/alternatives/[slug]`)
- Resources hub with individual resource articles
- Changelog
- Privacy policy, Terms of service, Contact form (rate-limited, honeypot, Resend delivery)

### Account and billing

- **Reverse trial:** New app users receive **14 days** of Investor-equivalent entitlement before post-trial downshift (**no card** until they choose paid) — aligns with **`/pricing`** copy and **`app/lib/plans`** / **`auth` provisioning**.
- Auth: email/password and Google OAuth via Clerk
- Soft delete (deactivate) and permanent delete
- Account restore from deactivated state
- Billing portal (Stripe-managed)
- Plan display in Settings with upgrade prompts

### Admin

- Admin dashboard: user count, property count, plan breakdown, RentCast API usage
- User list: email, plan, property count, last active
- Admin membership override: set any user's tier manually (bypass Stripe; for partner/demo accounts)
- Access restricted by env-configured admin email list

---

## 4. Technical Architecture and Stack

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js App Router, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js route handlers (serverless) |
| Database | PostgreSQL via Prisma ORM (hosted on Neon) |
| Auth | Clerk (email + Google OAuth) |
| Payments | Stripe (subscriptions, checkout, billing portal, webhooks) |
| Email | Resend (contact form delivery) |
| Market data | RentCast (rent estimates, AVM) |
| Analytics | PostHog (consent-gated) |
| Error monitoring | Sentry |
| Hosting | Vercel |
| Charts | Recharts |

### Architectural shape

The application follows a clean layered architecture:

1. **UI surfaces** gather inputs and display outputs.
2. **API route handlers** handle auth, input validation (Zod), and orchestration.
3. **`app/lib/`** modules own all business logic: metric calculation, amortization math, plan limits, benchmark eligibility, projection logic.
4. **Prisma** handles persistence with typed models.

All user-facing metric calculations flow through two canonical entry points: `computePropertyMetrics` and `computePortfolioMetrics`, both governed by written policy documents (see §5). This single-source-of-truth design prevents metric drift across pages.

### Key library modules

- `app/lib/metrics/property-metrics.ts` — property-level metric computation
- `app/lib/metrics/portfolio-metrics.ts` — portfolio aggregation
- `app/lib/amortization.ts` — amortization schedule, effective balance, payoff projection, refinance modeling
- `app/lib/benchmark-utils.ts` — benchmark eligibility contract (shared by dashboard, properties list, and property detail)
- `app/lib/plans.ts` — plan limits and effective tier resolution

---

## 5. Codebase Maturity Signals

This section lists concrete quality and governance indicators. For a codebase at this stage and team size (solo operator with AI-assisted development), several of these are meaningfully above baseline.

### Security posture

- All non-public routes protected by Clerk session middleware
- All database queries scoped by authenticated user ID; no IDOR vulnerabilities by design
- Zod schemas on all API inputs; no raw user input reaches the database
- Stripe webhook signature verification on all webhook handlers
- Idempotency guards on billing state sync (PostHog + Stripe idempotency)
- Content Security Policy in rollout (`docs/policies/csp-rollout.md`)
- Secrets in environment variables only; never in client bundles
- Rate limiting and honeypot on public contact form

### Policy-backed math contracts

Two written policy documents govern all metric and analytics definitions:

- `docs/policies/ownership-metrics.md` — canonical formulas for equity, cash flow, cap rate, LTV, DSCR, and NOI; how partial ownership and vacancy interact; what "My share" vs. "Full liability" means
- `docs/policies/analytics-math-policy.md` — debt-service basis, time-window labels, UI/API/export reconciliation rules

These exist because metric trust is the product's primary credibility claim. Having explicit contracts means any implementation divergence is a detectable bug, not just a judgment call. This level of documentation is uncommon for a pre-revenue SaaS.

### Testing — Vitest (depth) vs E2E (breadth)

- **Vitest:** Run **`npm run test`** from **`RealEstatePortfolio/app/`** to re-verify totals; **counts drift** whenever new tests land — do not cite stale numbers from old audits alone. Snapshot from doc pass **2026-04-30:** **618** passing tests across **85** files (metrics, amortization, benchmark utilities, billing, cron routes, validation, calculators, import/CSV, key UI shells).
- **E2E / Playwright:** **Not** wired as an always-green PR gate; optional smoke path tracked in **`docs/tasks.md`** (Testing hardening Phase 4) and **`docs/qa/testing-hardening-proposal.md`**.

**Historical:** Older docs calling out “374 tests” or “50 files” are **obsolete** versus the command above — **prefer the command over prose counts**.

### Audit infrastructure

The repository contains a structured audit lane system (`docs/audits/`) with 15+ dedicated lanes:

- Code quality, security, legal/compliance, math/logic, data integrity, feature/UX, mobile experience, performance/cost, SEO, reliability/ops, business/valuation, growth/funnel, agent governance, documentation

Each lane produces dated audit reports and synthesis documents. Multiple audit cycles have been completed (2026-03-20, 2026-03-31, 2026-04-01, 2026-04-03, 2026-04-04). This is a quality assurance system, not ceremonial documentation.

### AI governance layer

The product is developed with an AI-assisted workflow that includes:

- Separate PM (orchestration/review) and builder (scoped implementation) agent roles with written responsibility boundaries
- Shell-command risk gating hooks that prevent dangerous operations without explicit approval
- Work queue (`docs/tasks.md`) as the single source of scoped, acceptance-criteria-backed work
- PM review checklist before any batch is treated as complete
- Builder cannot exceed assigned scope without PM override

This is relevant to maturity because it means the codebase evolves under a governance model, not through unconstrained AI edits. Feature drift, undocumented changes, and policy violations are structurally harder to introduce than in a typical solo project.

### Documentation coverage

- `docs/policies/` — 6 active policy documents covering metrics, design, calculators, CSP, and ownership semantics
- `docs/internal/` — 12 internal reference documents including grounding, billing matrix, demo preparation, API contracts, and differentiator analysis
- `docs/reference/` — 6 documents covering product overview, roadmap, engineering spec, MVP spec, and export contract
- `docs/plans/` and `docs/archive/plans/` — active and archived implementation plans
- `docs/qa/` — testing hardening proposal, mobile verification matrix, property flow regression matrix
- `docs/launch/` — launch plan with production verification checklist

---

## 6. Competitive Position

### The gap Veld occupies

No competitor in this price tier cleanly combines:
- Full pre-acquisition underwriting (deal analyzer with DSCR, GRM, vacancy, cash-on-cash)
- Ongoing portfolio tracking for owned properties (ownership-aware, mortgage-aware)
- Forward-looking modeling (projections, scenario presets, hold-period analysis)
- Mortgage amortization simulation and refinance what-if modeling
- Live rent/value estimates (RentCast)
- Without requiring bank sync, accounting setup, or a banking product

### Competitor summary

| Competitor | Their lane | Veld's edge |
|---|---|---|
| Stessa | Accounting / portfolio tracking (bank sync, Schedule E) | Full deal workspace, scenario modeling, mortgage payoff sim, no bank sync required |
| Baselane | Banking + free rent collection | Deal analysis + portfolio analytics without mandatory banking product |
| Rentastic | Portfolio tracking + basic deals | Deeper underwriting (DSCR, GRM, vacancy depth), scenario modeling, mortgage payoff |
| DealCheck | Pre-purchase deal analysis only (no portfolio tracking) | Portfolio tracking + live market data alongside deal analysis; deal-to-portfolio promotion |
| Landlord Studio | Landlord operations (tenant, maintenance, lease) | Investor lens vs. operator lens; deal + portfolio in one product |
| BiggerPockets Pro | Education + deal calculators (no portfolio tracking) | Free public calculators + authenticated portfolio tracking in one product |
| Mashvisor | Market intelligence + deal sourcing ($99+/mo) | Cheaper, focused on owned portfolio; no prospecting overhang |
| Spreadsheets | Free, infinite flexibility | Single source of truth, consistent metric definitions, live estimates, no formula drift |

### Differentiator that is difficult to replicate

The metric trust layer — policy-backed formulas, ownership nuance, vacancy-aware calculations, and mortgage-effective-balance logic — is not a feature list item. It is accumulated specification work. A competing product built quickly would likely ship with simpler, less defensible math. This is a moat that scales with trust and user sophistication.

---

## 7. Roadmap and Trajectory

### Near-term backlog (prioritized, unbuilt)

| Item | Why it matters | Effort |
|---|---|---|
| Interactive demo (no sign-up) | Removes largest conversion objection for skeptical investors | S–M |
| Investor-ready PDF report | **Partially mitigated:** print-friendly **`/export/portfolio-summary`** + **`GET /api/export/portfolio-summary`** (browser print / save-as-PDF with assumptions footer). **Backlog:** server-generated branded PDFs, richer lender packages | M |
| Side-by-side deal comparison | No competitor does this; high premium conversion signal | M |
| Portfolio alerts & insights | **Interpretive insights** backlog (beyond raw metrics + cron emails); complements shipped digest/refresh/milestone flows | M–L |
| Read-only share link | Viral mechanism; shareable deals/portfolio to CPA, partner, lender | M |
| Address autocomplete | Reduces friction at add-property; activation metric improvement | S |

### Strategic direction

The product's clearest long-term path is to deepen the "investor intelligence without bank sync" lane rather than expand into property management (rent collection, tenant management, maintenance). That lane is open: Stessa and Baselane are moving toward full financial OS; Rentastic is trending accounting-first; DealCheck is analysis-only. The combination of deal analysis + portfolio intelligence + projections + mortgage modeling at $15–$29/mo is not cleanly owned by any competitor.

### What would accelerate growth

1. Interactive demo — **still** high leverage (`roadmap.md` §Deferred until traffic/ROI justify Arcade-style work)
2. Server-generated **branded** PDF exports + templated lender packages — print **`/export/portfolio-summary`** already covers lightweight share/print scenarios
3. **Interpretive alerts** — richer “what changed / what to do” layer on top of metrics; **lifecycle email + refresh crons already ship** (`roadmap.md` retention table + `tasks.md` proxy/cron hygiene)
4. Side-by-side deal comparison — the highest-differentiation premium feature in the near-term backlog

---

## 8. Honest Gaps and Limitations

The following are real gaps and should be weighed accurately in any evaluation:

**User and revenue traction:** **As of April 2026 — verify source** (Stripe, DB, analytics). The snapshot in prior versions described **6 signups / 0 paying**; **do not cite these as current** without confirming. If still pre-revenue, the market hypothesis remains unvalidated from a paid-conversion standpoint.

**No native mobile app:** All competitors except DealCheck have native iOS/Android apps. The web app is mobile-responsive, but not native. This will become a more meaningful churn driver as the user base scales.

**Automated test breadth vs. depth:** Deep **Vitest** coverage for metrics, amortization, benchmarks, billing, cron routes, validation, import, and key UI shells — see **§5** and re-verify with **`npm run test`** from **`RealEstatePortfolio/app/`**. **Playwright / E2E** is **not** a required PR gate yet (`docs/tasks.md` Testing hardening Phase 4).

**Interactive demo / top-of-funnel:** Most value still sits behind sign-up; deferred interactive demo remains the largest *documented* conversion gap (`roadmap.md` §7).

**Branded vs print reports:** Print/save-as-PDF portfolio summary exists (`/export/portfolio-summary`); **server-generated** branded PDFs and **read-only share links** remain backlog vs incumbents.

**Single-operator development:** The codebase has been built by one owner with AI-assisted tooling. While the governance layer mitigates many risks of this model, bus factor is 1.

**RentCast API dependency:** Rent estimates and AVM values depend on a third-party API with quota constraints. Quota usage is monitored via the admin dashboard. If RentCast pricing changes or API access is disrupted, market data features require an alternative source.

---

## 9. Summary Assessment

**What this codebase is:** A production-grade, full-stack SaaS with a working billing system, meaningful feature depth, real users, and an unusual level of code governance for its stage.

**What it is not:** A high-traction product. **As of the last owner snapshot (verify Stripe)**, there was **no recurring revenue**; revisit before investor conversations.

**Maturity vs. stage:** The codebase's maturity signals are meaningfully ahead of its user/revenue stage. The policy-backed math contracts, structured audit system, AI governance layer, and documentation depth are the kind of infrastructure that appears in products 2–3x larger by user count. This represents significant work that would need to be rebuilt by any acquirer starting fresh.

**Codebase reproduction cost (rough estimate):** A qualified team building this product from scratch — same feature depth, architecture, governance, documentation, and audit infrastructure — would require an estimated 2,000–3,000 engineering hours. At market rates, that represents $200,000–$450,000 in development cost depending on team seniority. This is a baseline floor for codebase asset value, independent of user/revenue traction.

**Primary risk for valuation:** Pre-revenue. The product has not yet demonstrated that users will pay for it. The risk is not technical — the product works and is well-built. The risk is market: does the ICP (small passive landlords) convert from free to paid, and at what rate?

**Primary upside case:** If trial-to-paid conversion is established, the product's differentiated positioning, low churn risk (once users have their portfolio data in the app), and above-average technical quality make it a scalable SaaS at a price point that requires very few paid subscribers to become profitable given its infrastructure cost base (Vercel, Neon, Clerk, Stripe, RentCast are all consumption-priced or free at low scale).

---

## 10. Due Diligence Q&A

Answers to the standard questions an external evaluator would ask at this stage.

---

### Activation funnel

**Q: What does the activation funnel actually look like? How many signups completed the add-property flow?**

**Internal docs conflict on this point** (dated owner narrative here vs. later **owner QA** notes in `docs/tasks.md` referencing users with multiple properties on trial). **Do not treat the paragraph below as current truth** — reconcile `property_created` / onboarding events in **PostHog** (or the database) before external sharing.

*Historical snapshot preserved for continuity:* At the time this section was first drafted, the owner described **zero** of **six** signups as having added a property, implying the funnel ended at sign-up for that cohort. If analytics now show otherwise, **replace this answer wholesale** from dashboard exports rather than layering edits in prose.

---

### Conversion and user outreach

**Q: Paid conversion outreach — what's been attempted? Price vs features signal?**

**Verify cohort size and Stripe status externally** — the anecdote below references a **six-user**-era snapshot.

*Historical anecdote:* The owner described outreach to **2** registered users **without responses** while **four** users had **not** been contacted; no qualitative feedback cycle on pricing or roadmap.

**Interpretation:** With **tiny** denominators this is barely diagnostic — revise from CRM + analytics whenever sharing with investors.

---

### Organic discovery and SEO

**Q: What does search traffic look like? Is there any organic signal at all?**

Google Search Console is set up and connected. The site has been live for approximately one month. Aggressive, structured SEO work — including state-level location-specific calculator landing pages and on-page optimization across public tools — was completed within the last week of this writing (April 2026). SEO results from this kind of effort typically take 3–6 months to materialize in organic rankings and traffic.

**Current state:** Early-stage. No meaningful organic traffic data yet. The SEO infrastructure is in place and well-structured (canonical URLs, location-specific pages, sitemap, robots.txt, structured data) — but it has not had time to index and rank.

**Near-term expectation:** The calculator pages (`/tools/brrr`, `/tools/fix-and-flip`, `/tools/str-vs-ltr`, state-level variants) are the primary SEO acquisition surface. These target high-intent, low-competition long-tail keywords ("BRRRR calculator Texas," "fix and flip calculator Florida," etc.) that BiggerPockets ranks on nationally but does not own at the state level. If the strategy works, organic traffic from this channel is 3–9 months away.

---

### RentCast API costs and projection

**Q: What is the RentCast contract structure and what does it cost per user at scale?**

**Current plan:** Free tier — 50 calls/month included. Overage: $0.20/call.

**Upgrade tiers:**

| Tier | Included calls | Monthly cost | Overage rate |
|------|----------------|-------------|--------------|
| Free | 50/mo | $0 | $0.20/call |
| Starter | 1,000/mo | $74/mo | $0.06/call |
| Growth | 5,000/mo | $200/mo | $0.03/call |
| Scale | 25,000/mo | $449/mo | $0.015/call |

**How RentCast calls are consumed per user:**

Each call is triggered by a user action — they are never automatic. The two actions are "Estimate rent" and "Estimate value" on the property add/edit forms, and manual benchmark refreshes. Based on typical usage patterns:

| User type | Properties | Calls at setup | Monthly recurring | Est. monthly total |
|---|---|---|---|---|
| Free user | 1 | 2 (rent + value estimate) | 1–2 (benchmark refresh) | ~2–4 |
| Investor user | 5 | 10 | 5–10 | ~8–15 |
| Pro user | 20 | 40 | 10–20 | ~15–30 |

Setup calls are front-loaded (when the user first adds their properties). Ongoing monthly usage is lower and driven by how often users refresh benchmarks.

**Projected call volume by user count (steady-state monthly, after initial setup):**

| Total users | Assumed mix | Est. monthly calls | RentCast tier needed |
|---|---|---|---|
| 50 | 40 free, 8 Investor, 2 Pro | ~200–350 | Free → approaching Starter |
| 100 | 70 free, 22 Investor, 8 Pro | ~500–750 | Starter ($74/mo) |
| 250 | 170 free, 60 Investor, 20 Pro | ~1,200–2,000 | Starter → Growth |
| 500 | 340 free, 120 Investor, 40 Pro | ~2,500–4,000 | Growth ($200/mo) |
| 1,000+ | Mixed | 5,000–10,000+ | Growth → Scale |

**Cost efficiency note:** RentCast is one of the cheapest line items relative to the value it delivers. At 100 paying users, the $74/month Starter tier represents less than $0.75/user/month — a small fraction of the $15–$29 ARPU. The unit economics remain favorable through the Growth tier. Scale tier ($449/mo) is only relevant when the product has 500+ active users and $7,500+/mo in subscription revenue.

---

### Monthly infrastructure cost

**Q: What is the actual monthly infrastructure cost today?**

| Service | Cost | Notes |
|---|---|---|
| Google Workspace | $25/mo | Business email |
| Vercel | $20/mo | Pro plan; hosting + deployments |
| Domain (veldportfolio.com) | ~$0.94/mo | $11.25/year |
| Neon (PostgreSQL) | $0 | Free tier |
| Clerk (auth) | $0 | Free tier |
| Stripe | $0 | Pay-per-transaction only when revenue exists |
| RentCast | $0 | Free tier (50 calls/mo) |
| PostHog | $0 | Free tier |
| Sentry | $0 | Free tier |
| Resend | $0 | Free tier |
| **Total** | **~$45.94/mo** | |

At 6 users and $0 revenue, the product is operating at approximately **$46/month in hard costs**, all of which are fixed regardless of user count at current scale. The cost base does not meaningfully increase until paying users and API call volume justify tier upgrades. The first meaningful cost inflection point is RentCast Starter ($74/mo) which is appropriate at roughly 75–100 active users.

---

### Transferability and deployment

**Q: Can someone else run this codebase locally in a day? Are secrets documented? Is there a deployment runbook?**

Yes. The product is designed to be straightforward to transfer and operate.

- **Local setup:** The codebase runs locally with a standard `npm install` + environment variable configuration. Prisma handles database migrations via a single command. A `.env.example` file documents all required variables. No proprietary tooling or non-standard infrastructure.
- **Environment variables:** All secrets are environment variables only — nothing hardcoded. The complete list is documented in `docs/setup/manual-steps.md` and reflected in `.env.example`. Required variables cover: database URL (Neon), Clerk publishable/secret keys, Stripe secret/publishable keys + webhook secret, RentCast API key, Resend API key, PostHog key, Sentry DSN, admin email list, and app URL.
- **Deployment:** Fully hosted on Vercel. Deployment is a `git push` — Vercel handles build and deploy automatically. No server management, Docker, or custom CI infrastructure required. The production environment is configured via the Vercel dashboard with the same environment variables.
- **Runbook:** `docs/setup/run-and-smoke-test.md` covers local setup, smoke testing, and key manual verification steps. `docs/setup/manual-steps.md` documents every external service configuration step (Stripe products, Clerk settings, Resend domain verification, RentCast key, Vercel env vars).
- **Database:** PostgreSQL hosted on Neon (serverless). Schema managed by Prisma with migration history in the repo. A new operator could point to a new Neon database and run `prisma migrate deploy` to replicate the schema in minutes.

**Single largest operational dependency:** Vercel. The product is not portable to non-Vercel hosting without Next.js App Router adaptation work — but this is standard for the stack and not a material risk given Vercel's stability.

---

## 11. Key Reference Documents

For deeper evaluation on specific dimensions:

| Topic | Document |
|---|---|
| Product features and routes | `docs/reference/product-overview.md` |
| What the product is and internal context | `docs/internal/project-grounding.md` |
| Competitive landscape and gap analysis | `docs/plans/2026-04-04-product-gap-discovery.md` |
| Strategic differentiator analysis | `docs/internal/differentiator-value-add-analysis.md` |
| Roadmap and shipped feature history | `docs/reference/roadmap.md` |
| Metric math contracts | `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md` |
| AI governance and workflow | `docs/internal/ai-operations-efficiency-analysis.md`, `docs/process/pm-agent-workflow.md` |
| Testing infrastructure | `docs/qa/testing-hardening-proposal.md` |
| Latest audit synthesis | `docs/audits/synthesis/2026-04-04-audit-synthesis.md` |
| Demo preparation (product walkthrough) | `docs/internal/demo-preparation-guide.md` |
