# Testing implementation plan

**Status:** Phases 1–3 implemented (`lib/` units + mocked API route tests). **Phase 2 follow-up** (golden metrics fixtures, amortization UI-helper edges, 403 plan-limit API tests) done — see `docs/tasks.md` *Test infrastructure follow-up*. Phase 4 (E2E) is backlog.  
**Related:** Batch 8 in [`docs/tasks.md`](../tasks.md); **test follow-up (Phase 1 & 2)** in [`docs/tasks.md`](../tasks.md) (*Active tasks → Test infrastructure follow-up*); policies [`ownership-metrics.md`](../policies/ownership-metrics.md), [`analytics-math-policy.md`](../policies/analytics-math-policy.md); full review [`qa/test-infrastructure-review.md`](../qa/test-infrastructure-review.md).

---

## 1. Current state

| Area | Finding |
|------|---------|
| **Test runner** | Vitest (`app/vitest.config.ts`), scripts: `npm run test`, `test:watch`, `test:coverage` |
| **Unit tests** | `lib/**/*.test.ts` — metrics, amortization, utils, validations, CSV |
| **API route tests** | `app/**/*.test.ts` — `vi.mock` of `getActiveAppUser`, `prisma`, `rate-limit` — see `app/api/properties/route.test.ts`, `app/api/properties/[id]/route.test.ts`, `app/api/deals/route.test.ts` |

---

## 2. Application map (coverage over time)

### 2.1 Core product surfaces

| Domain | Routes | Risk if wrong |
|--------|--------|---------------|
| **Auth** | Clerk, middleware | Access control |
| **Dashboard** | `/dashboard` | Portfolio summary |
| **Properties** | `/properties`, `/properties/new`, `/properties/[id]`, `/edit` | CRUD, metrics |
| **Deals** | `/deals`, `/deals/[id]` | Deal → portfolio |
| **Modeling / mortgage** | `/modeling`, `/mortgage?propertyId=` | Projections |
| **Billing** | `/plans`, Stripe | Entitlements |
| **Settings** | `/settings`, account delete | Data safety |
| **Public** | `/`, `/contact`, legal pages | SEO, forms |
| **Admin** | `/admin` | Privileged ops |

### 2.2 API routes (~30 handlers)

**Integration (mocked):** properties list/create, property by id (GET/PATCH/DELETE), deals list/create. **Backlog:** mortgage, estimates, billing, import/export, account, admin, etc.

### 2.3 `lib/` priority

| Module | Phase |
|--------|--------|
| `metrics/property-metrics`, `amortization` (schedule), `validations/property` | **P0 — done (Phase 1)** |
| `metrics/portfolio-metrics`, amortization helpers, benchmark/date utils, deal/mortgage/checkout Zod, CSV import | **P1 — done (Phase 2)** |
| API routes (mocked `getActiveAppUser` + Prisma) | **P2 — done (Phase 3)** for properties + deals |
| Playwright E2E (smoke) | P3 |

---

## 3. Stack

| Layer | Tool |
|-------|------|
| Unit / integration | **Vitest** + **@vitest/coverage-v8** |
| React (later) | @testing-library/react + jsdom |
| E2E (later) | Playwright |

---

## 4. Phases

### Phase 1 — Foundation (Batch 8 minimum) ✅

- Vitest config with `@/` alias
- Unit tests: `computePropertyMetrics`, `scaleLiabilityAmount`, `getAnnualDebtService`, `generateAmortizationSchedule`, `createPropertySchema` / `updatePropertySchema`

### Phase 2 — Expand units ✅

- `computePortfolioMetrics` (empty, multi-property, proportional vs `full_liability`, DSCR / weighted cap)
- Amortization: `getPiForAmortization`, `getProjectedBalanceAsOf`, `getEffectiveBalance`, `getBalanceSource`, `getPaymentStartLagMonths`, `getPayoffProjection`, `getToleranceAwarePayoffProjection`, `isWithinTermEndTolerance`
- `benchmark-utils`, `date-utils` (with fake timers where needed)
- Zod: `createDealSchema` / `updateDealSchema`, `createMortgageSchema` + `validateEscrowAmount`, `createCheckoutSessionSchema`
- `csv-parser`: `parseDate` / `parseNum` / `getCol` / `parseAddressFromCombined` / `parseRow`

*Phase 2b (tasks follow-up):* [`app/lib/test/fixtures/metrics-golden.ts`](../../app/lib/test/fixtures/metrics-golden.ts) + `metrics-golden.test.ts`; extra-payoff edge tests; **403** `PLAN_LIMIT_REACHED` on `POST` properties/deals (free tier + at-limit count).

### Phase 3 — API integration ✅

- **`getActiveAppUser`** (not `getAppUser`) + **`prisma`** + **`rate-limit`** mocked via `vi.mock`; no real DB or Clerk
- **`app/api/properties/route`:** GET 401/200, POST 401/400/200/**403** (plan limit)
- **`app/api/properties/[id]/route`:** GET/PATCH/DELETE — 401, 404, validation 400, success paths
- **`app/api/deals/route`:** GET/POST — 401, 400, 200 with `metrics` on create, **403** (deal limit)

*Later:* optional Docker/test-DB integration tests; Stripe webhooks with signed fixtures; more routes using the same pattern.

### Phase 4 — E2E (optional)

- Playwright; align with [`qa/property-flow-regression-matrix.md`](../qa/property-flow-regression-matrix.md)

---

## 5. Anti-patterns

- Don’t cover every API before `lib/` math is tested
- Don’t rely on Stripe webhook tests without fixtures/mocks
- Don’t replace manual regression matrix with E2E only

---

## 6. How to run

From `app/`:

```bash
npm run test          # CI mode
npm run test:watch    # local TDD
npm run test:coverage # coverage report
```

Optional: add `npm run test` to CI (see `.github/workflows/ci.yml`).

---

## 7. Summary

| Priority | Scope |
|----------|--------|
| **P0** | Vitest + property-metrics + amortization schedule + property Zod |
| **P1** | portfolio-metrics, validations, utils *(Phase 2 done)* |
| **P2** | Mocked API tests *(Phase 3: properties + deals)* |
| **P3** | Playwright smoke |

*Last updated: testing proposal implementation.*
