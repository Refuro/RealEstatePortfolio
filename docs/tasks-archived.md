# Archived tasks (completed)

**Purpose:** Historical record of completed tasks. Kept for reference; see `docs/tasks.md` for current tasks and roadmap.

**Archived:** 2025-03-15 — Moved from tasks.md to reduce file size and improve readability.

---

## Website performance optimization ✓

**Scope:** Improve load times and reduce bundle size without breaking any functionality.

**Phase 1 — Remove or narrow `force-dynamic`:**
- [x] Investigate, remove from root layout, verify build
- [x] Auth intact; public page content correct; `npm run check` passes

**Phase 2 — Lazy-load Recharts:** ✓ Done (dashboard-charts, amortization-chart-dynamic)

**Phase 3 — Additional optimizations:** ✓ Done (optimizePackageImports, preconnect, static assets audit)

---

## App layout performance ✓

- [x] getAppUser wrapped in React `cache()`
- [x] Layout counts and subscription cached with `unstable_cache` (30s)

---

## Settings — defer Stripe sync ✓

- [x] Stripe moved to client; `GET /api/billing/subscription-details`; `SubscriptionBillingDisplay` with loading state

---

## Code audit follow-ups ✓

- [x] Task A: Mobile nav shadow (verified compliant)
- [x] Task B: force-dynamic comment in `(app)/layout.tsx`
- [x] Task C: Zod validation for create-checkout-session

---

## Landing page overhaul + branding + SEO ✓

**Phases 1–4:** Stripe compliance, Veld branding, landing overhaul, SEO, public mobile optimization, contact page — all done.

---

## Builder tasks (all completed)

- [x] Next.js middleware → proxy
- [x] Fix lint errors
- [x] Standardize state field
- [x] Property type and units
- [x] Mortgage section input text color
- [x] Interest rate as percent
- [x] Loan type enum
- [x] Partial ownership support
- [x] Dark/light mode toggle
- [x] Mortgage payment effective date
- [x] Annual billing option
- [x] Readability and space pass
- [x] Sidebar uplift
- [x] Pricing page: show prices and incentivize annual
- [x] Dashboard: single-property view
- [x] Responsive layout for wide screens
- [x] Properties page overhaul
- [x] Add Property guided flow (wizard)
- [x] Property detail page readability
- [x] Mobile responsive layout (hamburger + slide-out drawer)
- [x] Mobile-friendly input attributes
- [x] Onboarding (welcome + first property prompt + metric help)
- [x] Data export (CSV)
- [x] Delete account (soft delete + restore)
- [x] Permanent account deletion (GDPR/CCPA)
- [x] Rent estimate integration (RentCast)
- [x] Add Property wizard: tabbing and Enter-key UX
- [x] Per-unit rent + optional property details
- [x] RentCast unit mix fix
- [x] Additional property types (Condo, Townhouse, Manufactured, Apartment)
- [x] Admin dashboard
- [x] Add Property draft save / unsaved changes guard
- [x] Security: headers + rate limiting

---

## New tasks (completed)

- [x] Dashboard enhancements (diverging bar, cash-on-cash, NOI, metric help)
- [x] Ownership % audit + display options
- [x] Ownership display mode toggle (Phase 2)
- [x] Vacancy assumption
- [x] Scenario modeling
- [x] Data staleness nudges
- [x] CSV import
- [x] Property value estimate (RentCast AVM)
- [x] Deal analyzer / scratchpad
- [x] Save potential deals
- [x] Import CSV: selection when over limit
- [x] Deal limits visibility + Pro limit bump
- [x] View deal → Analyze with prefill

---

## Membership lapse handling ✓

- [x] Full hardening (over-limit restriction, banner, re-sync, past_due banner, block messaging)
- [x] Cancel-at-period-end confirmation
- [x] Permanent delete server-side confirmText
- [x] Extract formatCurrency to lib
- [x] Move import parsing to lib
- [x] Reduce modal shadows
- [x] Resolve Prisma `any` in settings
- [x] Zod for account delete routes
- [x] Extract MetricCard to shared component
- [x] Block API access for deleted users
- [x] Env validation at startup
- [x] Accessibility pass

---

*Full implementation details available in git history. This archive summarizes completed work for reference.*
