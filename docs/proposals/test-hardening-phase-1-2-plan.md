# Test hardening — Phase 1 & 2 implementation plan

**Shipped note (2026-04-30):** Phase **1.1** (ESLint in CI) is live — see `RealEstatePortfolio/.github/workflows/ci.yml` (`npm run lint` alongside tests). Further items below are backlog / process follow-up unless checked off.

**Purpose:** Executable plan for the **P0** and **P1** recommendations in [`docs/qa/test-infrastructure-review.md`](../qa/test-infrastructure-review.md) — CI trust, local/remote alignment, and stronger math/domain coverage before treating tests as the gate on every push.

**Relationship to other docs**

| Doc | Role |
|-----|------|
| [`test-infrastructure-review.md`](../qa/test-infrastructure-review.md) | Why these phases exist, risks, Docker/Playwright context |
| [`testing-implementation-plan.md`](testing-implementation-plan.md) | Historical Vitest phases (lib → API); what’s already shipped |
| [`pm-review-checklist.md`](../process/pm-review-checklist.md) | PM must verify tests + (after Phase 1) CI parity |
| [`run-and-smoke-test.md`](../setup/run-and-smoke-test.md) | Pre-push / pre-release commands |

**Suggested order:** Complete **Phase 1** first (so green CI ≈ green local for lint + tests). Then **Phase 2** in parallel with feature work or as a focused batch.

---

## Phase 1 — Trust & CI hardening (P0)

**Goal:** Every push/PR that passes GitHub Actions should mean **tests + lint** pass (and optionally **build**), aligned with what PM and builders already run locally.

### 1.1 Add ESLint to CI

| Item | Detail |
|------|--------|
| **Action** | In `.github/workflows/ci.yml`, after `npm ci`, add a step: `npm run lint` (from `app/`). Keep existing `npm run test`. |
| **Blocker** | Resolve any **errors** (not only warnings) so lint exits 0. Historically a `react-hooks` rule may fail in a large client file — fix the pattern, narrow the rule for that file, or refactor per React docs. |
| **Acceptance** | PR to `develop` shows green check; local `npm run lint` matches CI. |

### 1.2 Optional: Add `next build` to CI

| Item | Detail |
|------|--------|
| **Why** | Catches type errors and Next compile issues tests don’t hit. |
| **Caveat** | `npm run build` in this repo runs `prisma migrate deploy` — CI needs **`DATABASE_URL`** (GitHub secret) **or** a separate script `build:ci` that runs `next build` only. Prefer **`next build` without DB** for PR CI unless you already provision a disposable DB. |
| **Acceptance** | Document chosen approach in this file + [`run-and-smoke-test.md`](../setup/run-and-smoke-test.md). CI job either builds successfully or “build skipped” is explicit and justified. |

### 1.3 Document the pre-push contract

| Item | Detail |
|------|--------|
| **Action** | Update [`run-and-smoke-test.md`](../setup/run-and-smoke-test.md) with a **“Before every push (developers)”** subsection: minimum `npm run test` + `npm run lint` from `app/`; note that CI runs the same after Phase 1. |
| **Optional** | Add `npm run test` to a documented “full local gate” alongside `npm run check` when team agrees (changes `package.json` `check` script). |
| **Acceptance** | [`pm-review-checklist.md`](../process/pm-review-checklist.md) can reference one canonical command block (already partially there). |

### 1.4 Process integration (when Phase 1 is done)

- [ ] Update [`test-infrastructure-review.md`](../qa/test-infrastructure-review.md) §5 (gaps) to mark “lint not in CI” as addressed.
- [ ] PM checklist: confirm “CI matches local lint” in review notes when touching workflows.

---

## Phase 2 — Math & domain depth (P1)

**Goal:** Tests remain **aligned with canonical policy** as the source of truth; add **golden cases** and close obvious API gaps for **plan limits**.

### 2.1 Golden fixtures (property + portfolio)

| Item | Detail |
|------|--------|
| **Action** | Add `app/lib/metrics/__fixtures__/` (or `app/lib/test/fixtures/metrics-golden.ts`) with **named scenarios**: inputs + expected NOI, cap rate, cash flow, equity, LTV, debt scaling for **proportional** and **full_liability** where applicable. |
| **Tie-in** | Each scenario references a subsection of [`ownership-metrics.md`](../policies/ownership-metrics.md) (comment or table in the fixture file). |
| **Tests** | `property-metrics.test.ts` and `portfolio-metrics.test.ts` import fixtures and assert within float tolerance. |
| **Acceptance** | New contributor can see one table mapping policy → numbers; changing policy without updating tests should fail CI. |

### 2.2 Amortization — targeted coverage

| Item | Detail |
|------|--------|
| **Action** | Identify helpers **directly shown or implied in UI** (property mortgage tab, modeling, payoff copy). For each, add 1–2 tests with **fixed dates** (fake timers) or deterministic inputs. |
| **Priority** | `getExtraPaymentForYearsEarlier` / `getPayoffYearsWithExtra` if still thin; edge cases already partially covered stay as-is. |
| **Acceptance** | [`testing-implementation-plan.md`](testing-implementation-plan.md) “optional later” bullets for amortization are either done or explicitly deferred with reason. |

### 2.3 API tests — `403` plan limits

| Item | Detail |
|------|--------|
| **Action** | Extend mocked route tests for **`POST /api/properties`** and **`POST /api/deals`**: user on **free** tier at **property/deal limit** → expect **403** and `PLAN_LIMIT_REACHED`-style body. |
| **Technique** | Either `mockActiveUser` with `subscriptionTier: "free"` + `prisma.*.count` returning limit, or `vi.mock("@/lib/plans")` forcing `canAddProperty` / `canAddDeal` false. |
| **Acceptance** | At least one test per route proves the **upgrade path** isn’t accidentally always 200. |

### 2.4 Process integration (when Phase 2 is done)

- [ ] Short note in [`test-infrastructure-review.md`](../qa/test-infrastructure-review.md) §4 (alignment) pointing to fixture location.
- [ ] Builder §6.2 in [`architecture-and-build-practices.md`](../architecture-and-build-practices.md): if touching metrics, run tests and update golden fixtures when formulas change.

---

## Rollout checklist (for PM)

| Step | Owner | Done when |
|------|--------|-----------|
| Phase 1.1 | Builder | CI runs lint; main/develop green |
| Phase 1.2 | Builder/PM | Build strategy decided + documented |
| Phase 1.3 | Builder | `run-and-smoke-test.md` updated |
| Phase 2.1 | Builder | Fixtures + tests merged |
| Phase 2.2 | Builder | Amortization gaps closed or deferred in doc |
| Phase 2.3 | Builder | 403 tests merged |
| Closeout | PM | `tasks.md` batch item or note; review doc changelog |

---

## Change log

| Date | Change |
|------|--------|
| 2026-03-19 | Initial plan (Phase 1 = CI trust, Phase 2 = math/domain depth). |

---

*When Phase 1 and 2 are complete, fold remaining P2/P3 items from the test infrastructure review into `docs/tasks.md` or a future proposal.*
