# Business & Valuation Audit — 2026-03-19

## Executive summary

- Veld is a feature-complete, modern real estate portfolio analytics SaaS with a clear niche: small real estate investors who want to replace spreadsheets with a purpose-built tool.
- The codebase is production-quality (Next.js 16, React 19, TypeScript, Prisma, Stripe billing, Clerk auth) with strong documentation and process maturity that exceeds typical early-stage projects.
- **Valuation estimate (code-only, no users): $8K–$18K.** The app has real differentiation and a working billing system, but zero traction means it sells primarily on replacement cost and buyer time savings.
- **Valuation estimate (with early traction, 10–50 paying users): $30K–$75K.** Revenue signal plus the existing foundation justifies a higher multiple.
- **Valuation estimate (with product-market fit, 100+ paying users, $2K+ MRR): $100K–$300K.** At this stage the app sells on revenue multiples with a code-quality premium.
- Highest-ROI value uplift opportunities: automated tests, first 10 paying users, and public launch assets.

---

## Severity-ranked findings

### Critical

- None found.

### High

**H1 — Zero automated test coverage**

- No `*.test.*` or `*.spec.*` files exist anywhere in the codebase.
- No testing framework is installed (`package.json` has no jest, vitest, playwright, or cypress).
- This is the single largest deduction in any buyer's technical assessment.
- **Impact:** Reduces buyer confidence in refactoring safety and regression prevention. A buyer would discount the purchase price by the estimated cost of adding test coverage ($3K–$8K in contractor time).

### Medium

**M1 — No public launch or user-facing marketing presence**

- Landing page exists (`app/page.tsx`) but no evidence of SEO content, blog, changelog, or social proof.
- Public pricing page exists and is well-designed but has no product screenshots or demo.
- No evidence of Product Hunt launch, directory submissions, or paid acquisition.
- **Impact:** Without any distribution signal, a buyer must build the entire go-to-market from scratch.

**M2 — Revenue model is unvalidated**

- Stripe integration is complete with 3 tiers (Free, Investor $15/mo, Pro $29/mo).
- No evidence of any paying customers (no subscription records beyond dev/test).
- Pricing is reasonable for the market but has not been tested against real willingness-to-pay.

### Low

**L1 — Solo operator dependency**

- `ADMIN_EMAILS` env var suggests a single admin.
- No team collaboration features, no multi-tenant architecture.
- Documentation and process maturity reduce this risk, but the product is fully owner-dependent.

---

## Product and asset inventory

### Tech stack

| Technology | Version | Maturity signal |
|------------|---------|-----------------|
| Next.js | 16.1.6 | Latest stable; modern App Router |
| React | 19.2.3 | Latest stable |
| TypeScript | ^5 | Strict typing throughout |
| Prisma | ^6.19.2 | Current; PostgreSQL adapter |
| PostgreSQL | Neon (serverless) | Production-ready |
| Tailwind CSS | ^4 | Current |
| Node.js | ^20 | LTS |

### Feature inventory (22 pages)

**Authenticated (15 pages):**

| Route | Feature | Depth |
|-------|---------|-------|
| `/dashboard` | Portfolio overview, charts, rent-vs-market | Rich |
| `/properties` | Property list with filters/sort | Rich |
| `/properties/new` | 5-step add property wizard | Rich |
| `/properties/[id]` | Property detail (Overview + Details tabs) | Rich |
| `/properties/[id]/edit` | Edit property form | Medium |
| `/properties/[id]/amortization` | Amortization schedule + chart | Medium |
| `/modeling` | Scenario modeling workspace | Rich |
| `/mortgage` | Mortgage payoff workspace | Rich |
| `/analyze` | Deal analyzer form + live metrics | Rich |
| `/deals` | Saved deals list | Medium |
| `/deals/[id]` | Deal detail/edit | Medium |
| `/plans` | Subscription management | Medium |
| `/settings` | Account, billing, import/export, delete | Medium |
| `/admin` | User management, MRR, usage stats | Medium |
| `/billing/success` | Post-checkout confirmation | Light |

**Public (7 pages):**

| Route | Feature |
|-------|---------|
| `/` | Landing page |
| `/pricing` | Public pricing with tiers |
| `/sign-in`, `/sign-up` | Clerk auth |
| `/contact` | Contact form |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

### Third-party integrations (6)

| Service | Purpose | Depth | Switching cost |
|---------|---------|-------|----------------|
| **Clerk** | Authentication, session management | Deep (middleware, user sync) | High |
| **Stripe** | Subscriptions, checkout, webhooks, billing portal | Deep (full billing lifecycle) | High |
| **RentCast** | Rent estimates, value estimates, benchmarking | Medium (3 API endpoints) | Medium |
| **Sentry** | Error tracking (server, client, edge) | Medium | Low |
| **Resend** | Contact form email delivery | Light | Low |
| **Neon** | PostgreSQL hosting | Medium (Prisma adapter) | Low (standard Postgres) |

### Database complexity

**7 Prisma models:**

| Model | Fields | Relations | Complexity |
|-------|--------|-----------|------------|
| `User` | 18 | → Property, Mortgage, SavedDeal, RentCastApiCall, Subscription | High |
| `Property` | 22 | → User, Mortgage | High |
| `Mortgage` | 15 | → User, Property | Medium |
| `SavedDeal` | 20 | → User | Medium |
| `RentCastApiCall` | 8 | → User | Low |
| `ContactFormSubmission` | 6 | None | Low |
| `Subscription` | 10 | → User | Medium |

Total: ~99 fields across 7 models with clear referential integrity.

### Code quality metrics

| Metric | Count | Assessment |
|--------|-------|------------|
| `lib/` modules | 24 files | Strong shared logic layer |
| Shared components (`components/`) | 14 | Good reuse |
| App components (`app/(app)/`) | 61 TSX files | Comprehensive |
| API routes | 29 | Full CRUD + billing + admin |
| Zod validation schemas | 12+ | Strong input validation |
| TypeScript strict mode | Yes | No `any` types found |
| Test files | **0** | Critical gap |

### Revenue model

| Plan | Monthly | Yearly | Property limit | Deal limit | RentCast/hr |
|------|---------|--------|---------------|------------|-------------|
| Free | $0 | $0 | 1 | 5 | 5 |
| Investor | $15 | $150 | 5 | 20 | 10 |
| Pro | $29 | $290 | 20 | 50 | 20 |

**Potential MRR at scale:**

| Scenario | Users | Mix | Estimated MRR |
|----------|-------|-----|---------------|
| Early traction | 50 | 70% free, 20% Investor, 10% Pro | $295 |
| Growth | 200 | 60% free, 25% Investor, 15% Pro | $1,620 |
| Mature | 500 | 50% free, 30% Investor, 20% Pro | $5,150 |

### Documentation maturity

| Category | Count | Quality |
|----------|-------|---------|
| Total docs | 71 files | Above average |
| Process docs | 11 | Strong (PM workflow, audit processes) |
| Audit framework | 10 lanes + reports | Comprehensive |
| Policy docs | 4 (design, math, ownership, shell risk) | Clear and enforced |
| Reference docs | 4 (product overview, MVP spec, engineering spec, roadmap) | Solid |
| Setup docs | 2 (run & smoke test, manual steps) | Adequate |

This documentation maturity is a **buyer confidence signal** — it demonstrates maintainability and reduces onboarding cost for a new owner.

### Admin capabilities

- User count and growth metrics (new this month)
- Plan distribution breakdown
- MRR estimate
- Average properties per plan
- Subscription status breakdown
- RentCast API usage tracking (monthly, all-time, per-user)
- Recent signups list
- Full user table with tier override dropdown
- CSV user export

Admin is functional for a solo operator and provides the metrics a buyer would want to see.

---

## Valuation analysis

### Methodology

Micro-SaaS valuation uses several frameworks depending on stage:

1. **Pre-revenue (code-only):** Replacement cost basis — what would it cost to build this from scratch?
2. **Early revenue:** Revenue multiple (typically 2–5x ARR for micro-SaaS) plus code quality premium/discount.
3. **Established:** Profit multiple (typically 3–6x annual profit for bootstrapped SaaS).

### Scenario 1: Code-only (no users)

**Replacement cost estimate:**

| Component | Estimated build cost | Notes |
|-----------|---------------------|-------|
| Core app (auth, properties, deals, settings) | $8K–$12K | 2–3 months solo developer |
| Billing integration (Stripe, plans, webhooks) | $2K–$3K | 2–3 weeks |
| Analytics engine (metrics, projections, amortization) | $3K–$5K | Complex math logic |
| RentCast integration | $1K–$2K | API integration + rate limiting |
| Admin panel | $1K–$2K | 1–2 weeks |
| Documentation and process framework | $2K–$3K | Rare for early-stage; premium signal |
| **Total replacement cost** | **$17K–$27K** | |

**Market reality discount:** Pre-revenue SaaS code typically sells at 30–60% of replacement cost on marketplaces like Acquire.com or MicroAcquire.

**Estimated sale price: $8K–$18K**

**Factors supporting higher end:**
- Modern stack (Next 16, React 19) — buyer gets current tech, not legacy code.
- Working Stripe billing — buyer can start monetizing immediately.
- Strong documentation — buyer onboarding time is significantly reduced.
- Clear niche — real estate investors are an identifiable, reachable market.

**Factors pulling toward lower end:**
- Zero test coverage — buyer assumes testing debt.
- No users — no signal of product-market fit.
- No SEO, no content, no distribution channel.

### Scenario 2: Early traction (10–50 paying users)

**Assumptions:** 10–50 paying users, mix of Investor/Pro, $200–$800 MRR.

| Factor | Value |
|--------|-------|
| ARR | $2,400–$9,600 |
| Revenue multiple (micro-SaaS, early) | 2–4x |
| Code quality premium | +20–30% |
| **Estimated sale price** | **$30K–$75K** |

**What changes at this stage:**
- Pricing validated (users are paying, retention data emerging).
- Buyer can project growth from real data, not assumptions.
- Code quality and documentation now justify a premium over "average" micro-SaaS.

### Scenario 3: Product-market fit (100+ paying users, $2K+ MRR)

**Assumptions:** 100+ paying users, $2,000–$5,000 MRR, demonstrated retention.

| Factor | Value |
|--------|-------|
| ARR | $24,000–$60,000 |
| Revenue multiple | 3–5x |
| Code quality premium | +15–25% |
| **Estimated sale price** | **$100K–$300K** |

At this stage the app sells primarily on revenue and growth metrics. Code quality and documentation become differentiators within the multiple range.

---

## Value uplift opportunity ranking

Ordered by estimated valuation impact relative to effort:

| Rank | Action | Effort | Est. value uplift | Notes |
|------|--------|--------|-------------------|-------|
| 1 | **Get first 10 paying users** | High (marketing/outreach) | +$20K–$50K | Transforms valuation basis from code-only to revenue |
| 2 | **Add automated test suite** | Medium (2–3 weeks) | +$3K–$8K | Removes largest buyer objection |
| 3 | **Public launch (Product Hunt, directories)** | Low–Medium | +$5K–$15K | Creates distribution signal and initial traction |
| 4 | **Add product screenshots/demo to landing** | Low | +$2K–$5K | Reduces time-to-trust for visitors |
| 5 | **Add changelog/blog** | Low | +$1K–$3K | Shows active development; SEO value |
| 6 | **Add one unique feature competitors lack** | Medium | +$5K–$15K | Moat/defensibility signal |
| 7 | **Reach $2K MRR milestone** | High | +$50K–$150K | Crosses into "real business" territory |

### Competitive positioning

**Direct competitors:** Stessa (free, acquired by Roofstock), DoorLoop, Baselane, RentRedi.

**Veld's differentiation:**
- Scenario modeling (what-if projections) — not common in competitors.
- Mortgage payoff simulation with tolerance handling — unique depth.
- RentCast integration for automated market benchmarking.
- Modern tech stack (most competitors are older Rails/PHP apps).

**Veld's disadvantage:**
- No users, no reviews, no social proof.
- Smaller feature set than mature competitors (no tenant management, maintenance tracking, accounting).
- Positioning as "analytics only" limits TAM vs full property management.

---

## Evidence reviewed

- `app/package.json` (tech stack versions, dependencies)
- `app/(app)/` directory (all authenticated routes and components)
- `app/pricing/page.tsx`, `app/(app)/plans/page.tsx` (pricing model)
- `app/lib/plans.ts`, `app/lib/pricing-display.ts` (plan definitions, pricing)
- `app/lib/stripe-config.ts` (Stripe configuration)
- `prisma/schema.prisma` (database models)
- `app/lib/` directory (all shared modules)
- `app/components/` directory (shared components)
- `app/app/api/` directory (all API routes)
- `app/(app)/admin/page.tsx` (admin capabilities)
- `docs/` directory (all documentation)
- `docs/reference/roadmap.md` (roadmap)
- `docs/business-launch-checklist.md` (launch readiness)
- `.cursor/rules/` (agent configuration)

---

## Risk & impact assessment

- **Zero users is the single largest risk** — the product has not been validated by real users paying real money. Until this changes, valuation is constrained to code-only estimates.
- **No tests** is the second largest risk — a buyer will discount the price by the estimated cost of adding test coverage, or walk away if they perceive the codebase as untestable.
- **Solo operator dependency** is manageable given documentation quality, but any team expansion requires knowledge transfer that hasn't been tested.

---

## Recommendations (prioritized)

1. **Launch publicly and acquire first paying users** — This single action has the highest valuation impact. Target real estate investor communities (BiggerPockets, Reddit r/realestateinvesting).
2. **Add automated tests** — Start with critical paths: property creation, metric calculations, billing flow. Even 50% coverage removes the buyer's biggest objection.
3. **Add product screenshots and a demo video to landing page** — Reduces visitor drop-off and builds trust before sign-up.
4. **Track and publish metrics** — Monthly user count, MRR, churn. Buyers want to see trends, not just a snapshot.
5. **Consider a unique feature moat** — The modeling/projection tools are already differentiated. Lean into this as the primary value proposition.

---

## Task candidates

- [ ] Set up analytics tracking (PostHog, Mixpanel, or similar) for funnel metrics.
- [ ] Add Vitest or Jest with initial test coverage for `lib/metrics/`, `lib/amortization.ts`.
- [ ] Add product screenshots to landing page and public pricing page.
- [ ] Create a launch plan (target communities, messaging, timeline).
- [ ] Add a public changelog page.

---

## Re-test checklist

- [ ] Verify pricing page renders correctly with current plan data.
- [ ] Verify admin dashboard shows accurate metrics.
- [ ] Verify Stripe checkout flow completes end-to-end.

---

## Next trigger and cadence

- Trigger: pricing changes, fundraising/sale readiness reviews, major feature additions
- Recommended next run: quarterly
