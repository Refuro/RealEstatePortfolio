# Test infrastructure — comprehensive review

**Purpose:** Single place to understand how tests are set up, what they actually prove, how they align with product math and intent, and what to do next. Intended as the baseline before relying on CI on every push.

**Related:** [Testing implementation plan](../proposals/testing-implementation-plan.md), [Ownership metrics policy](../policies/ownership-metrics.md), [Analytics math policy](../policies/analytics-math-policy.md), [Property flow regression matrix](property-flow-regression-matrix.md).

**Last reviewed:** 2026-03-18 (aligned to repo state at that time).

---

## 1. Executive summary

| Area | Assessment |
|------|------------|
| **Runner & layout** | Vitest in `app/`, Node environment, `@` → app root — appropriate for pure `lib/` and route-handler tests. |
| **Math / domain** | Strong coverage of **canonical** property + portfolio metrics and amortization **pure functions**; benchmarks and dates tested with **fake timers** where needed. |
| **Contracts** | Zod schemas for property, deal, mortgage, checkout exercised with representative valid/invalid cases; CSV import parser covered for core paths. |
| **API layer** | Properties and deals routes tested with **mocked auth + Prisma + rate limit** — validates handler wiring, status codes, and validation paths; **does not** prove DB SQL, RLS, or real Clerk behavior. |
| **CI** | GitHub Actions runs **`npm run lint`** then **`npm run test`** in `app/` on push (main/master/develop) and all PRs. **Production `npm run build`** is intentionally not duplicated in CI — see §3.5. |
| **Gaps** | ~~No `lint` in CI~~ **resolved** (Phase 1); **build** still on Vercel / local `check` (§3.5); coverage thresholds not enforced; UI flows manual + regression matrix; Docker/Playwright in §6–8. |

**Bottom line:** The suite is a **solid foundation** for **numeric correctness** in shared `lib/` code and **request/response behavior** of selected API routes under mocks. It is **not** a substitute for manual smoke on critical UX or for eventual E2E on auth + navigation if you want that automated.

---

## 2. Inventory (what exists today)

### 2.1 Configuration

| File | Role |
|------|------|
| `app/vitest.config.ts` | `vitest run`, `include`: `lib/**/*.test.ts`, `app/**/*.test.ts`; coverage scoped to listed `lib/` modules + three `route.ts` files. |
| `app/package.json` | `test`, `test:watch`, `test:coverage`; `check` = **build + lint only** (tests not part of `check`). |
| `.github/workflows/ci.yml` | `npm ci` + `npm run lint` + `npm run test` in `app/`; Node 20; concurrency cancel. See [§3.5](#35-ci-lint-test-and-build-strategy). |

### 2.2 Test files (13)

**`lib/` — unit / contract**

- `lib/metrics/property-metrics.test.ts` — scaling, debt service, `computePropertyMetrics` (proportional vs `full_liability`, vacancy).
- `lib/metrics/portfolio-metrics.test.ts` — `computePortfolioMetrics` (empty, multi-property, ownership, DSCR / weighted cap).
- `lib/amortization.test.ts` — schedule, P&I, projected/effective balance, payoff helpers, tolerance helpers.
- `lib/benchmark-utils.test.ts` — freshness, days ago, benchmark % / labels (mocked time).
- `lib/date-utils.test.ts` — `formatTimeAgo`, `isDataStale` (mocked time).
- `lib/import/csv-parser.test.ts` — dates, numbers, columns, combined address, `parseRow` success/errors.
- `lib/validations/property.test.ts`, `deal.test.ts`, `mortgage.test.ts`, `checkout.test.ts` — schema behavior.

**`app/api/` — integration-style (mocked I/O)**

- `app/api/properties/route.test.ts` — GET/POST.
- `app/api/properties/[id]/route.test.ts` — GET/PATCH/DELETE.
- `app/api/deals/route.test.ts` — GET/POST.

**Fixtures**

- `lib/test/api-route-mocks.ts` — `mockActiveUser` for route tests.

### 2.3 Approximate scale

On the order of **~90 tests** (exact count may drift). Full run is **fast** (seconds), suitable for pre-push.

---

## 3. Infrastructure correctness

### 3.1 Vitest + Node

- **Correct:** Pure functions and Zod do not need `jsdom` or React; Node is faster and simpler.
- **Correct:** `@` alias matches Next/app usage so imports resolve like production.
- **Watch out:** Route tests use **dynamic `import("./route")`** after `vi.mock` so handlers bind to mocks — pattern is correct; duplicating this in new files is important.

### 3.2 API route mocks

Production routes use **`getActiveAppUser()`** (not `getAppUser`) for protected APIs. Tests mock **`@/lib/auth`** accordingly — **aligned with app code.**

Mocks:

- **`prisma`** — per-method `vi.fn()`; return values shaped to satisfy serializers (strings/numbers/dates as the route expects).
- **`rate-limit`** — always allow + no-op record — avoids Redis/DB side tables in tests.

**What this proves**

- Auth gate returns **401** when user is null.
- Validation failures return **400** with expected error shape where asserted.
- Happy paths call **create/update/find** with plausible payloads and return **200** JSON.

**What this does *not* prove**

- Real Prisma queries, migrations, indexes, or **data integrity** in Postgres.
- **Clerk** session behavior, cookies, or middleware.
- **Rate limiting** behavior under load or DB-backed counters.
- **403 plan limits** unless you add tests that fix `subscriptionTier` + `count` or mock `@/lib/plans`.

### 3.3 Time-dependent tests

- `benchmark-utils`, `date-utils`, and parts of `amortization` use **`vi.useFakeTimers` / `setSystemTime`** with **local `Date` constructors** where UTC ISO strings caused flakiness — appropriate fix; keep that discipline when adding more time-based tests.

### 3.4 Coverage reports

- `npm run test:coverage` instruments **listed** files only (not the entire `app/` tree), which keeps reports **actionable** rather than flooding with untested routes at 0%.
- **No enforced thresholds** yet — CI does not fail on coverage %; intentional early-stage, but worth revisiting once `lib/metrics` and `amortization` are stable.

### 3.5 CI: lint, test, and build strategy

| Step | Where | Notes |
|------|--------|--------|
| **ESLint** | GitHub Actions (`npm run lint`) | Fails CI on **errors**; warnings (e.g. `@next/next/no-img-element` on marketing pages) may still print but exit 0 — align with local `npm run lint`. |
| **Vitest** | GitHub Actions (`npm run test`) | No DB or Clerk required. |
| **Production build** | **Not** in GitHub Actions (by design as of Phase 1) | `app` script is `prisma migrate deploy && next build`. That needs a reachable **Postgres** (`DATABASE_URL`) plus app secrets (Clerk, Stripe, etc.). Vercel injects these on deploy; reproducing in CI would require secrets + a migration-capable DB or a separate `build:ci` script. **Release gate:** PM/builder still runs `npm run check` (build + lint) locally or relies on **Vercel preview build** before merge when secrets are only on Vercel. |

**Optional later:** Add a CI job `next build` with placeholder env vars and `SKIP_ENV_VALIDATION`-style flags only if we introduce a dedicated CI build path that skips `migrate deploy` or uses a service-container Postgres.

---

## 4. Alignment with app math and product intent

### 4.1 Canonical policies

- **Ownership / liability modes:** Tests follow the same vocabulary as [`ownership-metrics.md`](../policies/ownership-metrics.md) (proportional vs full liability, scaling).
- **Portfolio rollups:** `computePortfolioMetrics` tests check totals, debt treatment by mode, and derived ratios (e.g. DSCR, weighted cap) consistent with how the dashboard aggregates property-level outputs.

**Recommendation:** When formulas change in code or policy docs, **update tests in the same PR** and reference the policy section in test comments or PR description.

### 4.2 Amortization / mortgage UX

- Unit tests cover schedule generation, P&I extraction, projected vs stored balance, payoff/tolerance helpers, and **Phase 2** edge tests for **`getPayoffYearsWithExtra`** / **`getExtraPaymentForYearsEarlier`** (null guards + one accelerated-payoff smoke) — same helpers used by **`payoff-card.tsx`** and **`mortgage-tab-content.tsx`**.
- **Deferred (low priority):** exhaustive golden cases for the binary-search path in `getExtraPaymentForYearsEarlier` (add when payoff UI copy or sliders change materially).

### 4.3 Import / deals / checkout

- CSV and Zod tests align with **data entry and billing** contracts; they do not replace **manual** import of a real CSV on staging.

### 4.4 API vs UI intent

- Route tests confirm **server** validation and serialization; they do **not** confirm that the **wizard** or **forms** send the same payloads. **Regression matrix** remains the backstop for UI ↔ API alignment until you add component or E2E tests.

---

## 5. Gaps and risks (before “every push” reliance)

| Gap | Risk | Mitigation |
|-----|------|------------|
| **Build not in CI** | Type/bundle errors might only show on Vercel or local `npm run build`. | Rely on Vercel preview + local `npm run check` before release; or add CI build when GitHub secrets + DB are available (§3.5). **Lint is now in CI** (Phase 1). |
| **`npm run check` excludes tests** | Local habit might skip tests. | Document: run `npm run test` before push; or add `test` to `check` when ready. |
| **Pre-existing lint error** | `add-property-wizard` had a `react-hooks` error historically — `check` may fail locally even if tests pass. | Fix or narrow rule; don’t let it block confidence in test suite. |
| **Mock drift** | If a route stops using `getActiveAppUser` or changes response shape, tests might still pass if mocks are wrong. | Prefer asserting **status + minimal JSON shape**; add a test when changing serializers. |
| **No E2E** | Auth and multi-step flows can break without unit/API tests failing. | Keep regression matrix; add Playwright smoke later (§8). |

---

## 6. Docker / real database integration tests

**Your instinct (avoid Docker for now)** is reasonable for a small team: less moving parts, faster CI, fewer flakes.

### Upsides of Docker + test DB (Postgres)

- Exercises **real Prisma queries**, constraints, and migrations.
- Catches bugs mocks never see (wrong `where`, wrong `include`, transaction boundaries).
- Good for **regression** on complex writes (e.g. property + mortgage in one transaction, if you consolidate later).

### Downsides

- **CI time and complexity:** compose up, wait for health, migrate, seed, teardown.
- **Flakes:** timing, connection pooling, parallel job isolation.
- **Secrets:** need a disposable `DATABASE_URL` in CI (GitHub Actions service container or ephemeral DB).
- **Maintenance:** schema changes require migration discipline in test pipeline.

### Recommendation

- **Stay on mocks** for the bulk of API tests (current approach).
- **Optional later:** one small **“integration”** job (nightly or `main` only) that runs **3–5** critical flows against Postgres **if** you start seeing production-only bugs. Not required for a strong foundation today.

---

## 7. Playwright (and other E2E)

### What Playwright adds

- Real **browser**, **cookies**, **redirects**, **Clerk** (if configured with test users).
- Catches **hydration**, **layout**, and **client-only** bugs Vitest will not see.

### Costs

- Slower, flakier, needs stable **selectors** and **test account** strategy.
- Often run on **schedule** or **main** rather than every PR at first.

### Recommendation

- Keep **manual regression matrix** as the broad net.
- Add **2–3** Playwright smokes (e.g. landing, health, optional signed-in path) when you’re willing to maintain them; align scenarios with [`property-flow-regression-matrix.md`](property-flow-regression-matrix.md).

---

## 8. Recommended coverage — next steps (prioritized)

**Execution:** Actionable tasks for **Phase 1 (P0)** and **Phase 2 (P1)** live in [`docs/tasks.md`](../tasks.md) under **Active tasks → Test infrastructure follow-up**. Complete Phase 1 before Phase 2. Later items (P2/P3 below) remain backlog until promoted to `tasks.md`.

### P0 — Trust and CI hardening *(Phase 1 in tasks.md)*

1. **Add `lint` to CI** (and fix blocking issues) so “green” means style + hooks, not only tests.
2. **Optionally add `build` in CI** (with required env vars as GitHub secrets or stubbed for compile-only if feasible) **or** document why build stays manual.
3. **Document the pre-push command** in [`run-and-smoke-test.md`](../setup/run-and-smoke-test.md): e.g. `npm run test && npm run lint` from `app/`.

### P1 — Math and domain *(Phase 2 in tasks.md)*

1. **Golden fixtures** tied to policy docs: a small table of inputs → NOI / cap / cash flow / LTV in comments or shared `fixtures/` for property + portfolio.
2. **Expand amortization** coverage for any helper exposed in UI that isn’t yet fully asserted.
3. **`403` plan-limit** API tests via tier + count or `vi.mock("@/lib/plans")`.

### P2 — API surface (same mock pattern) — *backlog*

1. **`/api/deals/[id]`** if it’s user-critical.
2. **Mortgage sub-routes** under properties if refactor risk is high.
3. **Import portfolio** route with **mocked** file/stream — heavier; defer until import logic stabilizes.

### P3 — Optional E2E — *backlog*

1. Playwright against **Vercel preview** or local: logged-out home + **health** API or **one** auth flow when stable.

---

## 9. Summary table

| Layer | Confidence | Notes |
|-------|------------|--------|
| **Property + portfolio metrics (`lib/metrics`)** | High | Matches ownership policy; extend golden cases as product evolves. |
| **Amortization (`lib/amortization`)** | Medium–high | Core paths covered; deep payoff edge cases optional. |
| **Validations + CSV** | Medium–high | Representative; add rows when schemas change. |
| **API routes (mocked)** | Medium | Great for handler + validation; not DB/Clerk truth. |
| **UI / Clerk / full stack** | Manual + Vercel | Regression matrix + preview; E2E optional. |

---

## 10. Change log

| Date | Change |
|------|--------|
| 2026-03-18 | Initial review document (Vitest, CI, lib + API tests, Docker/Playwright, next steps). |
| 2026-03-18 | Linked §8 execution to `docs/tasks.md` (Test infrastructure follow-up Phase 1 & 2). |
| 2026-03-18 | **Phase 1:** CI runs `npm run lint`; ESLint fix in `add-property-wizard` (deferred setState via `queueMicrotask`); §3.5 documents why `npm run build` stays off CI; executive summary updated. |
| 2026-03-18 | **Phase 2:** `lib/test/fixtures/metrics-golden.ts` + `metrics-golden.test.ts`; amortization extra-payoff edge tests; `POST` 403 `PLAN_LIMIT_REACHED` tests for properties + deals (`mockFreeTierUser`). |
| 2026-03-19 | **Phase 3 (optional):** Husky **pre-commit** + **pre-push** at repo root run `npm run lint` + `npm run test` from `app/`; see `docs/setup/run-and-smoke-test.md` (Git hooks). |

---

*This document should be updated when CI jobs change, when coverage thresholds are introduced, or when you add Docker/Playwright.*
