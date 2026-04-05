# Veld Portfolio — Product Overview

**A shareable overview of the application.**  
**Last updated:** April 2026

---

## 1. What It Is

**Veld Portfolio** is a SaaS platform for **small real estate investors (1–20 properties)** to track portfolio performance, analyze returns, and understand their investment position in real time.

**Value proposition:** Replace investor spreadsheets with a centralized analytics dashboard that automatically calculates key real estate investment metrics.

**Positioning:** Portfolio analytics and investment intelligence — *not* property management. No tenant management, rent collection, or maintenance tracking.

---

## 2. Target Users

- Individual landlords
- Small rental investors (1–20 properties)
- BRRR investors
- House hackers
- Early-stage portfolio builders

**Core need:** Users currently track properties in Excel or Google Sheets and want a single place to see equity, cash flow, and key metrics across their portfolio.

---

## 3. Core Features (Built)

### Portfolio Management

- **Properties** — Add, edit, delete properties. Address, purchase details, rent, expenses, property type, units.
- **Property types** — Single family, condo, townhouse, manufactured, multi-family, apartment.
- **Mortgages** — Track loans per property: balance, rate, term, monthly payment, lender, loan type.
- **Partial ownership** — Record ownership % (e.g. 50% of a property); metrics scale accordingly.
- **Vacancy assumption** — Configurable vacancy % (default 5%) for more realistic cash flow.

### Analytics & Metrics

- **Portfolio dashboard** — Total value, total debt, total equity, monthly cash flow, portfolio cap rate, portfolio LTV, cash-on-cash return, NOI.
- **Per-property metrics** — Equity, cash flow, cap rate, LTV, cash-on-cash.
- **Charts** — Equity by property, cash flow by property, debt vs value.
- **Amortization timeline** — Visual payoff schedule for each mortgage.
- **Ownership display mode** — Toggle between "My share" (proportional) and "Full liability" view in Settings.

### Rent & Value Estimates

- **Rent estimate** — One-click "Estimate rent" using RentCast API; populates rent field.
- **Value estimate** — One-click "Estimate value" using RentCast AVM; populates value field.
- Available when adding or editing properties.

### Deal Analyzer

- **Analyze a deal** — Enter address, rent, price, expenses, mortgage; see instant metrics without adding to portfolio.
- **Save deals** — Save analyzed deals for later comparison. Free: 5 deals; Investor: 20; Pro: 50.
- **Add to portfolio** — Promote a saved deal to a full property with one click.

### Scenario Modeling

- **Modeling workspace** (`/modeling`) — Forward-looking projection workspace. Model rent growth, expense growth, value appreciation, and debt paydown over a custom time horizon. Select any property in the portfolio.
- **What-if sliders** — On property detail: adjust rent %, value %, mortgage payment %; see recalculated metrics in real time.
- No persistence; ephemeral analysis.

### Mortgage & Refinance

- **Mortgage workspace** (`/mortgage`) — Dedicated debt-focused view: loan balance trajectory, payoff date, amortization schedule, extra-payment modeling. Works across all properties.
- **Amortization page** (`/properties/[id]/amortization`) — Per-property amortization schedule with payoff projection.
- **Refinance workspace** (`/refinance`) — Model a refinance scenario on any owned property: new rate, new term, cash-out amount; see impact on monthly payment, cash flow, and DSCR.

### Investment Calculators

Available publicly at `/tools/` and inside the app at `/calculators/`. The in-app version keeps portfolio context nearby; the public version is shareable with anyone.

- **BRRRR calculator** — Models the Buy-Rehab-Rent-Refinance-Repeat strategy. Inputs: purchase price, rehab cost, ARV, new loan terms. Outputs: equity recaptured, cash-on-cash return.
- **Fix & Flip calculator** — Models a renovation-and-resell deal. Inputs: purchase, rehab, ARV, holding costs. Outputs: projected profit and return.
- **STR vs LTR calculator** — Compares short-term rental vs. long-term rental income and expenses for the same property.
- **Investment property calculator** — General-purpose rental property analysis for quick screening.

### Data & Export

- **CSV import** — Import properties from CSV (matches export format).
- **CSV export** — Download portfolio data from Settings.
- **Import over limit** — When importing more than plan allows, choose which properties to add.

### Account & Billing

- **Auth** — Email/password and Google sign-in (Clerk).
- **Plans** — Free (1 property, 5 deals), Investor (5 properties, 20 deals), Pro (20 properties, 50 deals).
- **Billing** — Stripe; monthly and annual options. Billing portal for managing subscription.
- **Account** — Soft delete (deactivate) or permanent delete. Restore from deactivated state.

### Admin

- **Admin dashboard** — User count, property count, plan breakdown, RentCast API usage.
- **User list** — Email, plan, property count, last active.
- Access restricted by env-configured admin emails.

### Public Pages

- **Landing** — Hero, value props, pricing preview. Mobile-responsive with hamburger nav.
- **Pricing** — Plan cards, monthly/annual toggle. Public (no sign-in required).
- **Privacy** — Privacy policy.
- **Terms** — Terms of service.
- **Contact** — Contact form with rate limiting and honeypot. Sends via Resend.

---

## 4. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API routes, Prisma ORM |
| **Database** | PostgreSQL (Neon) |
| **Auth** | Clerk (email + Google OAuth) |
| **Payments** | Stripe |
| **Email** | Resend (contact form) |
| **Hosting** | Vercel |
| **Charts** | Recharts |

---

## 5. Integrations

| Service | Purpose |
|---------|---------|
| **Clerk** | Authentication, session management |
| **Stripe** | Subscriptions, checkout, billing portal |
| **RentCast** | Rent estimates, property value (AVM) |
| **Resend** | Contact form email delivery |
| **Neon** | PostgreSQL database |
| **Vercel** | Hosting, deployment |
| **PostHog** | Consent-gated product analytics |
| **Sentry** | Production error monitoring |

---

## 6. Pricing

| Plan | Properties | Saved Deals | Price |
|------|------------|-------------|-------|
| **Free** | 1 | 5 | $0 |
| **Investor** | 5 | 20 | $15/mo or $150/yr |
| **Pro** | 20 | 50 | $29/mo or $290/yr |

Annual plans include 2 months free. No credit card required for Free.

---

## 7. Key Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/pricing` | Public pricing |
| `/tools` | Public calculators hub (BRRRR, Fix & Flip, STR vs LTR) |
| `/tools/brrr` | Public BRRRR calculator |
| `/tools/fix-and-flip` | Public Fix & Flip calculator |
| `/tools/str-vs-ltr` | Public STR vs LTR calculator |
| `/tools/[calculator]/[location]` | Location-specific calculator landing pages (SEO) |
| `/investment-property-calculator` | Public investment property calculator landing |
| `/resources` | Resources hub |
| `/resources/[slug]` | Individual resource articles |
| `/vs/[slug]` | Competitor comparison pages |
| `/alternatives/[slug]` | Alternative product pages |
| `/changelog` | Product changelog |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/contact` | Contact form |
| `/sign-in`, `/sign-up` | Auth (Clerk) |
| `/dashboard` | Portfolio summary, charts |
| `/properties` | Property list |
| `/properties/new` | Add property (wizard) |
| `/properties/[id]` | Property detail, metrics, scenario |
| `/properties/[id]/amortization` | Per-property amortization schedule |
| `/deals` | Saved deals list |
| `/deals/[id]` | Saved deal detail |
| `/analyze` | Deal analyzer (scratchpad) |
| `/modeling` | Modeling workspace (forward projections) |
| `/mortgage` | Mortgage workspace (debt/payoff view) |
| `/refinance` | Refinance scenario modeler |
| `/calculators` | In-app calculators hub |
| `/calculators/brrr` | In-app BRRRR calculator |
| `/calculators/fix-and-flip` | In-app Fix & Flip calculator |
| `/calculators/str-vs-ltr` | In-app STR vs LTR calculator |
| `/calculators/investment-property-calculator` | In-app investment property calculator |
| `/plans` | In-app pricing (upgrade) |
| `/settings` | Account, plan, export, delete |
| `/export/portfolio-summary` | Portfolio summary export view |
| `/admin` | Admin dashboard (admin only) |

---

## 8. Design & UX

- **Theme** — Light and dark mode.
- **Mobile** — Responsive; hamburger nav on public pages; slide-out drawer in app.
- **Design philosophy** — Robinhood-inspired minimal: numbers first, clarity over decoration, progressive disclosure.
- **Accessibility** — Semantic tokens, keyboard navigation, aria labels on modals.

---

## 9. Security & Compliance

- **Auth** — All non-public routes protected by Clerk.
- **Data** — All queries scoped by user ID; no IDOR.
- **Validation** — Zod schemas on all API inputs.
- **Secrets** — Env vars only; never in client.
- **Stripe** — Webhook signature verification.
- **GDPR/CCPA** — Soft delete, permanent delete, data export.

---

## 10. Current State

- **Status** — Production-ready. Auth, billing, core features, and public pages complete.
- **Domain** — veldportfolio.com
- **Deployment** — Vercel
- **Email** — Resend with verified domain (mail.veldportfolio.com)

---

*For technical implementation details, see `docs/architecture-and-build-practices.md`, `docs/reference/engineering-spec.md`, and `docs/reference/mvp-spec.md`.*
