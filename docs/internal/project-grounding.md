# Project Grounding — Veld Portfolio

**Audience:** Owner/operator  
**Purpose:** A grounded, internal overview of what the product is, how it works today, how the repo is organized, how AI fits into delivery, and where the product is likely headed next.

---

## 1. What Veld Portfolio is

Veld Portfolio is a lightweight real estate portfolio intelligence app for individual investors and small operators. Its job is to help a user answer practical questions like:

- What is my portfolio worth today?
- How much equity, debt, and cash flow do I actually have?
- How does a property perform once ownership share, vacancy, and mortgage burden are considered?
- What happens if I model future assumptions or test a new deal before buying it?

The product is intentionally closer to **decision support** than to a full property-management suite. It is not trying to be a tenant portal, maintenance platform, or accounting ERP. The current product focuses on clarity, math trust, and investor-facing understanding.

---

## 2. Who it is for

The primary user is a small real estate investor, especially someone managing roughly 1 to 20 properties and trying to understand portfolio performance without wrestling with spreadsheets.

The ideal user likely wants:

- fast setup
- plain-English metrics
- portfolio and property-level visibility
- lightweight modeling before or after buying
- enough rigor to trust the numbers without needing enterprise software

The app is less focused on large-team property operations, tenant workflows, or institutional asset management.

---

## 3. What the product does today

Core shipped capabilities:

- Portfolio dashboard with headline metrics, charts, and benchmark surfacing
- Property tracking with ownership-aware metrics and mortgage-aware calculations
- Property detail pages with overview, details, and benchmark status
- Deal analyzer workspace for pre-acquisition evaluation
- Modeling workspace for future scenario exploration
- Mortgage workspace for payoff and amortization-style analysis
- CSV import/export for portfolio data
- Plan/billing system with Clerk auth and Stripe subscriptions
- Benchmarking and estimate support through RentCast
- Error monitoring, consent-gated analytics, and audit/process documentation

In practical terms, the app already supports the core investor loop:

1. Create an account.
2. Add or import properties.
3. Review performance and debt position.
4. Explore a new deal.
5. Model future outcomes.
6. Use the results to decide what to buy, keep, improve, or pay down.

---

## 4. Current architecture and stack

### Product stack

- **Frontend:** Next.js app router, React, TypeScript, Tailwind
- **Backend:** Next.js route handlers
- **Database:** PostgreSQL via Prisma
- **Auth:** Clerk
- **Billing:** Stripe
- **Analytics:** PostHog, gated by consent
- **Error monitoring:** Sentry
- **External market data:** RentCast for rent/value estimate workflows

### Repo structure

- `app/`: the application
- `docs/`: product, process, policy, launch, audit, and internal context
- `.cursor/`: AI workflow rules and hooks

### Architectural shape

The intended architecture is simple and layered:

1. UI surfaces gather/display inputs and outputs.
2. API routes handle auth, validation, and orchestration.
3. Shared `lib/` modules own business logic and reusable calculations.
4. Prisma handles persistence.

This matters because the product's credibility depends on having one source of truth for metrics rather than formulas drifting across pages.

Primary references:

- `docs/architecture-and-build-practices.md`
- `docs/policies/ownership-metrics.md`
- `docs/policies/analytics-math-policy.md`

---

## 5. Integrations and what they mean

### Clerk

Clerk handles sign-up, sign-in, and session management. It removes a major amount of custom auth surface area from the app.

### Stripe

Stripe powers paid tiers and subscription state. The repo is designed so billing logic is app-aware but pricing configuration still requires manual dashboard setup.

### RentCast

RentCast adds market context and estimate workflows. That makes the app more useful than a static spreadsheet because it can compare user-entered rent against outside market context.

### PostHog

PostHog is used for product analytics, but only after optional analytics consent. This supports launch learning without hard-wiring invasive tracking into the product.

### Sentry

Sentry captures production issues so the owner can catch failures that would otherwise be invisible.

### Other operational services

- Uptime monitoring exists outside the app
- Resend/contact support is documented for launch
- Google Ads is optional and consent-gated

---

## 6. How the AI workflow fits the project

This repo is not just "code plus docs." It also contains an explicit AI operating system:

- a **PM agent** for orchestration and review
- a **builder agent** for scoped implementation
- repo-level **rules** for always-on behavior
- **hooks** for command-risk gating
- **process docs** for PM review, audits, and manual boundaries
- a growing **audit lane** system to catch drift the owner cannot manually re-check every time

At a high level:

1. Work is promoted into `docs/tasks.md`.
2. The PM launches the builder with strict scope.
3. The builder implements only assigned work.
4. The builder updates docs and runs `npm run check`.
5. The PM reviews and either approves or sends it back.
6. Separate audits periodically scan for drift, quality, and governance gaps.

This is one of the project's real strengths. The repo is increasingly designed to be **auditable by process**, not just editable by AI.

Primary references:

- `docs/process/pm-agent-workflow.md`
- `docs/process/pm-review-checklist.md`
- `docs/setup/ai-process-workflow-setup.md`
- `docs/audits/README.md`

---

## 7. Coding and product principles

The repo has a few strong recurring principles:

- **Thoughtful:** anticipate edge cases and ambiguity
- **Robust:** validate inputs, handle failures, keep contracts explicit
- **Modern:** use current Next.js/React patterns, avoid stale abstractions
- **Frictionless:** reduce unnecessary steps and explain decisions clearly

In practice, that becomes:

- single source of truth for metrics
- reuse instead of duplication
- doc-backed policies for tricky domains
- clear manual boundaries for external setup
- auditable rules and workflows for AI-assisted delivery

This is important because Veld Portfolio's trust depends on two things:

1. the numbers must be believable
2. the product must remain understandable as AI touches more of the codebase

---

## 8. Current state of the product

The product is well beyond bare MVP. It already includes:

- core account system
- pricing/billing flow
- property and mortgage tracking
- portfolio metrics and charts
- benchmarking and estimate flows
- modeling and deal-analysis workspaces
- import/export
- changelog, analytics, uptime, and governance docs

The current state feels best described as:

- **functionally rich**
- **owner-operated**
- **pre-launch or early-launch hardening stage**

That means the main challenge is no longer "can the app do anything useful?" The challenge is now:

- sharpening trust
- improving polish
- keeping docs/workflow coherent
- deciding what the strongest differentiators should be

That is why recent work has shifted toward audits, governance, compliance posture, and owner-facing documentation.

---

## 9. Likely future direction

Based on the roadmap and the shape of the current product, likely next directions are:

- deeper portfolio intelligence and action-oriented insights
- stronger pre-acquisition to owned-property workflow continuity
- more polished reporting and decision support
- better guided onboarding and demo/readiness material
- more disciplined audit coverage as the repo grows

The biggest strategic question is whether Veld Portfolio becomes:

- a broad landlord operating system, or
- a focused investor intelligence product

Right now the product is naturally stronger in the second category. The app already has math, ownership nuance, modeling, benchmarks, and decision support. Leaning further into that identity may be more defensible than trying to out-feature full property-management platforms on rent collection, tenant workflows, and operations.

---

## 10. How to re-center quickly

If you want to get grounded fast after time away from the repo, read these in order:

1. `docs/internal/project-grounding.md`
2. `docs/tasks.md`
3. `docs/reference/roadmap.md`
4. `docs/architecture-and-build-practices.md`
5. `docs/process/pm-agent-workflow.md`
6. `docs/audits/README.md`

That sequence gives you:

- what the product is
- what is actively being worked
- where it may go next
- how the code should be shaped
- how AI work is managed
- how drift is audited

---

## 11. Key source docs

- Product/architecture: `docs/architecture-and-build-practices.md`
- Roadmap: `docs/reference/roadmap.md`
- Active work: `docs/tasks.md`
- Design: `docs/policies/design-spec.md`
- Ownership semantics: `docs/policies/ownership-metrics.md`
- Analytics contracts: `docs/policies/analytics-math-policy.md`
- AI workflow: `docs/process/pm-agent-workflow.md`
- AI setup: `docs/setup/ai-process-workflow-setup.md`
- Audits: `docs/audits/README.md`
