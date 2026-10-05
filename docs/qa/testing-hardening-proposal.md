# Testing hardening proposal — path to high confidence

**Purpose:** Define what **high-confidence** automated testing means for this product—not “startup smoke tests,” but a **quality-grade** bar appropriate for **serious money and user data**: predictable releases, regression safety, and traceability from policy to assertions. Staging, observability, and manual QA remain complementary; tests do not replace them.

**Related:** [`test-infrastructure-review.md`](test-infrastructure-review.md) (inventory, CI, coverage thresholds), `docs/tasks.md` (internal doc, not in public repo) § **Testing hardening** (execution checklist), [`mobile-shell-verification.md`](mobile-shell-verification.md), [`property-flow-regression-matrix.md`](property-flow-regression-matrix.md).

**Snapshot (2026-04-30 — re-verify with `npm run test` in `app/`):**

| Area | Count / state |
|------|----------------|
| **Vitest test files** | **~85** (`lib/**/*.test.ts`, `app/**/*.test.ts`, `components/**/*.test.tsx` per `vitest.config.ts`) |
| **Vitest tests** | **~600+** (exact count drifts; CI runs full suite) |
| **CI** | `npm run lint` + `npm run test` in `app/` (`.github/workflows/ci.yml`; Node 20; no coverage by default) |
| **Coverage gate** | `npm run test:coverage` — **v8** thresholds on an **explicit include list** (aggregate **~80%** statements/lines on that set; see §3.5) |
| **Route handlers** (`app/app/api/**/route.ts`) | Many routes; colocated tests for high-value paths (properties, deals, billing, import/export, account, cron, places, etc.) |
| **Stripe webhook** | **Tested** (success, bad signature, irrelevant event); **branch coverage inside the handler is still low** (~50% statements — more `switch` paths to add) |
| **UI / component** | **Multiple** RTL files (`MobileToolShell`, `MobileBottomNav`, wizard, inputs, cards) — still thin vs entire App Router UI |
| **E2E (Playwright/Cypress)** | **Not in CI** — primary gap for “quality” bar |

---

## 1. What “high confidence” means (quality-grade, not “small SaaS”)

**Small-SaaS testing** often means: a few happy-path tests, high coverage on trivial code, no E2E, coverage never enforced. **That is not the target.**

**Quality-grade** testing for this app means:

| Pillar | Meaning |
|--------|---------|
| **1. Domain truth** | Numbers, amortization, ownership modes, and CSV semantics **match policy docs** (`ownership-metrics`, `analytics-math-policy`, `api-list-contract`) — **goldens + tests**, not vibes. |
| **2. Contract safety** | Critical APIs **fail fast** with correct status codes and shapes under mocks; **integration or E2E** where mocks lie (auth, billing, DB). |
| **3. Money path** | Stripe webhook, checkout, tier sync, and **destructive account** paths are **wrong to fail silently** — **deep unit coverage** on webhook branches + **optional** Stripe test-mode replay. |
| **4. Regression gates** | **CI fails** on test or lint regressions; **coverage** fails on `test:coverage` when thresholds slip; **release** includes `test:coverage` or a dedicated coverage job. |
| **5. Journey proof** | At least **one** authenticated browser path (sign-in → app shell) **automated** before you claim “high confidence” for releases — not only Vitest mocks. |

The table below maps **confidence tiers** to maturity. **Today** we sit between **B+** (mocked routes) and **C** (billing partially), with **D** still open.

| Tier | Meaning | Target maturity |
|------|---------|------------------|
| **A — Domain & money** | Metrics, amortization, validations, CSV, `plans` — **policy-aligned**. | **Strong** — maintain goldens; extend when contracts change. |
| **B — API contracts** | Auth boundaries, status codes, plan limits, rate limits, response shapes. | **Strong on prioritized routes**; **expand** to remaining handlers + **branch** depth (webhook). |
| **C — Money & account safety** | Webhooks, checkout, deletes, exports. | **Good** on mocked paths; **raise** webhook `switch` coverage; consider **Stripe CLI / fixture** replays for one event type. |
| **D — End-to-end** | Real Clerk session + browser + **staging or test env**. | **Required** for quality bar — at least **one** stable smoke; **nightly** or **PR** optional until flake-free. |
| **E — CI discipline** | Lint + unit + **coverage** on release. | **Partial** — add **`test:coverage`** to CI or mandatory pre-release script. |

**High confidence** = **A solid**, **B broad on critical routes**, **C deep on money paths**, **D present (minimal E2E)**, **E consistent**. It still does **not** mean 100% line coverage of every file; it means **no blind spots** on the paths that could **lose money, corrupt data, or strand users**.

### 1.1 Correctness-first — tests lock in *intended* logic

Tests are not an exercise in matching whatever the app does today. **Expected values and status codes should come from** canonical docs and contracts — for example `policies/ownership-metrics.md` (internal doc, not in public repo), `policies/analytics-math-policy.md` (internal doc, not in public repo), `internal/api-list-contract.md` (internal doc, not in public repo), billing/runbook notes, and explicit PM acceptance — **not** from copying the current response into an assertion without checking it.

If a test would encode **wrong** behavior, **stop**: fix the implementation, or update the policy/spec first, **then** add or adjust tests so green means “matches the agreed contract,” not “matches yesterday’s bug.” Golden fixtures and route tests should use **traceable** inputs (and, for numbers, comments or links to the formula/policy section) so the next reader can verify intent, not just diff against main.

---

## 2. Current suite — strengths (after Phases 1–3)

- **`lib/metrics/*`, `amortization`, golden fixtures:** Core differentiator (correct numbers) is **well tested**; portfolio/property metrics align with policy.
- **`lib/plans.ts`:** Table-driven tests for tiers, limits, `getEffectiveTier`, `canAdd*` — **refactor-safe**.
- **`lib/auth`:** **`isAdmin`** unit-tested; **`getActiveAppUser`** behavior documented as covered via **mocked route tests** (see `test-infrastructure-review.md` §2.4).
- **Zod validations** (property, deal, mortgage, checkout): Representative valid/invalid cases.
- **CSV import parser** and rent-resolve helpers: **Real-world shape** risks covered.
- **Benchmark / date / CSP helpers:** Good unit coverage where files exist.
- **API pattern:** `vi.mock` for `@/lib/auth`, `@/lib/db`, `@/lib/rate-limit` — **repeatable**; **Phases 1–2** added tests for webhook, checkout, summary, export, import, account delete, `deals/[id]`, `properties/[id]/metrics`.
- **Coverage discipline:** `vitest.config.ts` **aggregate thresholds** on an explicit include set — `npm run test:coverage` **fails** on regressions (see §3.5).
- **CI:** Every PR gets **lint + test** — fast feedback.

---

## 3. Gaps — path from here to quality-grade

### 3.1 API routes still light or outside `coverage.include`

**Covered with colocated tests (Phases 1–2) + earlier:** `properties`, `properties/[id]`, `deals`, `deals/[id]`, `csp-report`, `billing/webhook`, `billing/create-checkout-session`, `portfolio/summary`, `export/portfolio`, `import/portfolio`, `account/delete`, `account/delete-permanent`, `properties/[id]/metrics`.

**Still high value for quality bar:**

| Area | Gap |
|------|-----|
| **`billing/webhook`** | **Statement coverage ~50%** — `customer.subscription.deleted`, `checkout.session.completed`, `syncSubscriptionToDb` edge cases (missing `appUserId`, Sentry paths) not fully exercised. |
| **`billing/sync`**, **`billing/status`**, **`billing/portal`**, **`subscription-details`** | Paid lifecycle — **mocked route tests** or **integration** with Stripe test mode. |
| **`contact`** | Resend + rate limit — **failure paths** and **429**. |
| **`account/restore`** | Deleted-user path — **explicit** test (policy-sensitive). |
| **`estimates/*`**, **`rentcast-quota`**, **`me`**, **`onboarding`**, **`admin/*`**, **`health`** | **Medium** — add as you touch features or in a **batch** sweep. |
| **`properties/[id]/mortgage/*`**, **`amortization` API** | Math surfaces — **cross-check** to `lib/` or golden. |

### 3.2 `lib/` depth

- **`amortization.ts`:** In coverage report, **~69%** statements — deep payoff / schedule tails **thinner**; acceptable only if **release** includes spot-check or targeted tests when those paths change.
- **`property-utils`**, **`stripe-config`** (partially via `stripe-config.test.ts`): extend when refactoring.

### 3.3 UI and apps router

- **Growing but incomplete** component coverage (`MobileToolShell`, `MobileBottomNav`, wizard, autocomplete, etc.) — **not** quality-grade for the whole UI. **Next:** critical **forms** (deal analyzer, checkout flows) with **RTL** + **validation** paths, **not** full page coverage.

### 3.4 E2E — mandatory for “high confidence” label

- **No** automated **logged-in navigation** in CI — **largest gap** vs a serious release bar.
- **Target:** **Playwright** (or Cypress): **one** sign-in → **dashboard** (or **add-property** minimal) on **staging** or **test Clerk**; **workflow_dispatch** or **nightly** first; **PR gate** when stable.

### 3.5 Coverage and CI

- **Coverage** is **instrumented** on a **subset** of files — **not** whole-repo `app/` tree (by design).
- **Thresholds** (aggregate on included files): **statements/lines ≥ 80%**, **branches ≥ 58%**, **functions ≥ 78%** — `vitest run --coverage` enforces.
- **Gap:** Default **GitHub Actions** runs **`test`**, not **`test:coverage`**. **Quality bar:** add **`test:coverage`** to CI or **require** it in release checklist / PM gate.

---

## 4. Phases — status and remaining work

### Phases 1–3 — **DONE (2026-03-30)**

| Phase | Delivered |
|-------|-----------|
| **P0** | Webhook, checkout, summary, export, account delete (mocked); webhook ≥3 cases; **correctness-first** aligned with `api-list-contract`. |
| **P1** | Import, `deals/[id]`, `properties/[id]/metrics`. |
| **P2** | `lib/plans.test.ts`, `lib/auth.test.ts` (`isAdmin`), `vitest` **coverage include** + **aggregate thresholds**; `test-infrastructure-review` §2.4 / §3.4 updated. |

**Track record:** `docs/tasks.md` (internal doc, not in public repo) § Testing hardening.

**Alignment with `docs/tasks.md`:** That file lists **Phase 4** (E2E) and **Phase 5** (ongoing process only). This proposal adds **Phase 5** (technical deepen: webhook branches, more routes, form tests) and **Phase 6** (culture — matches the **ongoing** bullets in `tasks.md`). On the next **`tasks.md` edit**, PM may renumber or add a **Phase 5 (deepen)** block so the checklist matches this doc.

---

### Phase 4 — E2E smoke (**next priority for quality bar**)

**Goal:** Prove **one real journey** in a browser against **test-mode Clerk** (or staging) + **stable** URL.

1. **Playwright:** one spec — **guest → sign-in (test user) → dashboard** (or **minimal add-property**), **≤ 5 min** CI budget.
2. **CI:** `workflow_dispatch` / **nightly** first; **PR required** when flake rate is acceptable.
3. **Docs:** secrets + URLs in [`manual-steps.md`](../setup/manual-steps.md).

**Exit:** Green runs on **schedule**; team agrees it is **release-blocking** when promoted.

---

### Phase 5 — Deepen money path & remaining routes (parallelizable after P4 started)

1. **Webhook:** Add tests for **`customer.subscription.deleted`**, **`checkout.session.completed`**, and **syncSubscriptionToDb** when `appUserId` missing (Sentry warning path) — **mocked** `stripe.subscriptions.retrieve` where needed.
2. **Batch route tests** for **`contact`**, **`billing/sync`**, **`me`**, **`restore`** — follow existing `vi.mock` patterns.
3. **Component tests** for **highest-risk forms** (validation + submit errors).

---

### Phase 6 — Ongoing (culture)

- **Same PR:** Touch **metrics, validations, CSV, billing** → extend tests in the same PR.
- **Manual:** [mobile-shell-verification.md](mobile-shell-verification.md), [property-flow-regression-matrix.md](property-flow-regression-matrix.md) on **pre-release** or **quarterly**.

---

## 5. Effort and sequencing (indicative)

| Phase | Effort | Notes |
|-------|--------|--------|
| **P4 E2E** | ~1–2 weeks (env + first green + flaky triage) | Unblocks “quality” narrative |
| **P5 deepen** | Ongoing | Webhook branches first, then route batch |
| **CI coverage** | &lt;1 day | Add job or document mandatory `test:coverage` before prod deploy |

**Rule:** Do **not** skip **E2E** indefinitely if the goal is **quality-grade** confidence — mocks alone are **necessary, not sufficient**.

---

## 6. What this proposal does *not* claim

- **100%** line coverage of every route and component — not required; **risk-based** coverage is.
- Replacement for **Sentry**, **uptime monitors**, **staging** deploys, or **manual** regression matrices.
- **Literal** “enterprise” (e.g. SOC 2, pen-test) — that is **process + tooling + org** beyond this doc; **this doc** sets the **engineering test bar** for **reliable releases** on **money** and **data**.

---

## 7. Recommended next steps

1. **PM / owner:** Treat **Phase 4 (E2E)** as the **next gate** toward the quality bar; keep **`docs/tasks.md` (internal doc, not in public repo)** updated.
2. **Builder:** Implement **Playwright** smoke + **docs** for test env; then **webhook branch** tests in **Phase 5**.
3. **CI:** Decide whether **`npm run test:coverage`** runs on **every PR** or **release branches only** — document in [`test-infrastructure-review.md`](test-infrastructure-review.md).

---

*Update [`test-infrastructure-review.md`](test-infrastructure-review.md) when CI, coverage scope, or E2E changes.*
