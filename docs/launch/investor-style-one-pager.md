# Veld Portfolio — Investor-Style One-Pager

**Date:** 2026-03-20  
**Status:** Pre-launch; product-complete for core investor workflows, not yet market-validated.

---

## 1. Snapshot

**Veld Portfolio** is a SaaS web app for **rental real estate investors** who want portfolio analytics, deal analysis, and mortgage modeling without relying on spreadsheets.

It is positioned between:

- generic landlord/property-management tools that are weak on investor analytics
- single-purpose calculators that are useful but fragmented
- spreadsheets that are flexible but error-prone and hard to maintain as a portfolio grows

**Core value proposition:** one place to track portfolio health, analyze new deals, model payoff scenarios, and compare rent/value benchmarks with a cleaner workflow than spreadsheets.

---

## 2. Problem

Small and mid-size rental investors often manage their portfolio using:

- spreadsheets
- calculator sites
- notes
- lightweight PM software not designed for portfolio-level investing decisions

That creates predictable pain:

- inconsistent formulas and stale assumptions
- weak portfolio rollups across multiple properties
- no clear bridge from acquisition analysis to ongoing portfolio management
- friction when modeling debt payoff, cash flow, equity, and benchmarks

---

## 3. Product

Veld Portfolio currently includes:

- **Portfolio dashboard** — equity, debt, cash flow, NOI, cap rate, LTV-style rollups
- **Property management for investors** — property records, mortgages, ownership mode, vacancy assumptions
- **Mortgage modeling** — amortization, balance logic, extra-payment/payoff scenarios
- **Deal analysis** — acquisition underwriting and scenario modeling
- **Benchmarks** — rent/value estimate integrations and rent-vs-market context
- **Import/export** — CSV import from spreadsheet-style data and export with derived metrics
- **Plans and billing** — Free / Investor / Pro tiers with Stripe-backed upgrade flow

---

## 4. Why It Can Win

This is not a generic CRUD app. Its strength is the combination of:

- domain-specific investor math
- coherent portfolio + property + deal workflow
- modeling depth beyond simple calculators
- enough polish to plausibly replace spreadsheets for a narrow niche

The likely wedge is:

**“Portfolio analytics and decision support for landlords/investors who have outgrown spreadsheets, but do not want bloated property-management software.”**

That is a real market position.

---

## 5. Current State

### What is strong now

- **Clear niche and messaging**
- **Core flows built**: sign up, add property, see metrics, analyze deals, model mortgages
- **Serious engineering foundation**: CI, lint, tests, Husky hooks, docs, audits
- **Trust-oriented safeguards**: rate limits, auth boundary, Sentry, CSP report-only, `/api/health`
- **Math rigor**: centralized metrics and amortization logic with meaningful test coverage

### What is still missing

- launch analytics / funnel instrumentation
- stronger production monitoring and broad-launch ops
- full CI build parity with production
- more proof that onboarding converts cold users quickly
- market validation: no live user base yet

---

## 6. Launch Readiness

**Assessment:** ready for a **controlled soft launch**, not yet ready for an aggressive broad launch.

### Ready now for

- founder-led demos
- trusted early users
- local investor groups
- community soft launch
- feedback and onboarding iteration

### Should be tightened before a full robust launch

- product analytics events (`sign_up`, `property_created`, `deal_created`, `checkout_started`)
- pricing and plans reconciliation across UI, Stripe, and docs
- uptime monitoring on production
- final metadata / Open Graph / launch surfaces polish
- a clean golden-path demo and support workflow

---

## 7. Risks

### Product / business risks

- biggest risk is **distribution**, not code quality
- no-user products are difficult to value as businesses without activation or retention proof
- spreadsheets remain the default competitor and are free

### Technical risks

- some chart-heavy property-detail views still need lazy loading
- a few large files should be split as the codebase matures
- CI does not yet fully mirror production build conditions

None of these are current red-alert issues; they are pre-scale hardening items.

---

## 8. Competitive Position

Veld Portfolio appears competitive in its niche because it is not trying to beat full property-management suites on every dimension. Instead, it is stronger where a self-directed investor cares most:

- portfolio-level insight
- equity / cash flow / debt visibility
- mortgage payoff modeling
- deal underwriting
- spreadsheet replacement

That positioning is credible if the product stays focused and onboarding is tightened.

---

## 9. Codebase-Only Valuation View

With **no users and no revenue**, the asset should be valued primarily as a **high-quality niche SaaS codebase**, not as a proven business.

### Rough value range

- **Low case:** **$8k-$20k**
- **Base case:** **$20k-$50k**
- **Strong strategic fit case:** **$50k-$100k+**

What supports the upper end:

- clear niche
- polished core flows
- non-trivial investor math and modeling
- billing/auth/import/export already present
- better docs and process maturity than most pre-launch projects

What limits valuation today:

- no user traction
- no proven conversion or retention
- launch and instrumentation still in progress

---

## 10. Investment / Founder View

If the goal is to build a durable SaaS rather than flip code, the next value-creation step is not more random feature work. It is:

1. finish full-launch readiness items
2. instrument the funnel
3. get the first cohort of real investors using it
4. learn where trust, onboarding, and pricing break

The codebase is already strong enough that **execution on launch and user learning** will matter more than raw engineering output.

---

## 11. Bottom Line

**Veld Portfolio is a credible, useful niche SaaS with real launch potential.** It does not read like a toy project. It reads like a serious pre-launch product with strong product thinking and better-than-average engineering discipline.

The honest conclusion is:

- **good enough to justify continued investment**
- **good enough for controlled launch soon**
- **not yet validated enough for a true business valuation**
- **worth more than a template, but not yet worth revenue multiples**

If launch readiness is completed and early users activate successfully, the value of the product should increase materially faster from **traction** than from more code alone.
