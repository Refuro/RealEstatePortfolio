# Mobile shell verification (functionality, logic, math)

**Purpose:** Verify `MobileToolShell` surfaces behave correctly on narrow viewports, and extend automated tests so shell **structure** is guarded in CI. **Logic and math** for deal analyzer, modeling, mortgage, and public calculator remain validated primarily by existing **`lib/` Vitest suites** and policies — this doc ties UI shells to those guarantees.

**Process (PM Builder):** Tasks live in [`docs/tasks.md`](../tasks.md). The PM promotes work there; the **builder** implements per [`.cursor/rules/builder-agent.mdc`](../../.cursor/rules/builder-agent.mdc). Math/ownership semantics: [`docs/policies/ownership-metrics.md`](../policies/ownership-metrics.md). Projections/analytics: [`docs/policies/analytics-math-policy.md`](../policies/analytics-math-policy.md). Broader test process: [`docs/qa/test-infrastructure-review.md`](test-infrastructure-review.md).

**Inventory — where `MobileToolShell` is used**

| Surface | App file | Routes / context |
|---------|----------|------------------|
| Deal Analyzer | `app/(app)/analyze/deal-analyzer-form.tsx` | `/analyze` |
| Modeling | `app/(app)/properties/[id]/projections-tab-content.tsx` | `/modeling`, property projections tab |
| Mortgage | `app/(app)/properties/[id]/mortgage-tab-content.tsx` | `/mortgage`, property mortgage tab |
| Public calculator | `components/marketing/public-calculator.tsx` | `/`, `/investment-property-calculator`, `/lp/investment-property-calculator` |

Shell root uses `md:hidden` (see `components/mobile-tool-shell.tsx`). Mobile detection uses `useIsMobile()` → `(max-width: 767px)` in `lib/use-is-mobile.ts`.

---

## Phase 0 — Manual verification (functionality, logic, math)

Run at **320px, 375px, 430px** (devtools or device). Confirm **≥768px** still shows desktop layouts for the same pages.

**Functionality (per shell)**

- Shell chrome: eyebrow, title, summary rail, footer where applicable; no horizontal overflow of the shell card.
- Context blocks: property/deal selectors and links work; collapsibles open/close (`MobileCollapsible` is mobile-only).
- Primary actions: inputs update displayed KPIs; save/new deal on analyzer if applicable.

**Logic & math (spot-check against policies)**

- **Deal analyzer:** Changing rent, expenses, vacancy, ownership (in debt section), and optional mortgage fields updates cash flow, cap rate, DSCR, cash-on-cash consistently with [`ownership-metrics.md`](../policies/ownership-metrics.md) proportional semantics.
- **Modeling:** Presets and growth inputs change summary rail and chart; numbers align with projection logic already covered by `lib/` + `projections-tab-content` dependencies (see `analytics-math-policy.md` for windows/labels).
- **Mortgage:** Extra principal and payoff targets update payoff dates, interest saved, and chart; behavior consistent with `lib/amortization.ts` tests.
- **Public calculator:** Inputs → live result matches `lib/public-calculator.ts` / `computePublicCalculatorResult` (same math as unit-tested pure function path).

Document failures with route, viewport width, and expected vs actual.

**SSR note:** `useIsMobile` server snapshot is `false`; expect possible one-frame desktop layout until hydration — no console errors.

---

## Phase A — Automated: Vitest + jsdom + `MobileToolShell` unit tests

**Status: implemented** (see `app/components/mobile-tool-shell.test.tsx`, `app/vitest.setup.ts`, `app/vitest.config.ts`).

- Dependencies: `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.
- Component tests use `/** @vitest-environment jsdom */` at the top of each `components/*.test.tsx` file; `lib/` and `app/api` tests remain on Node.
- `MobileToolShell` tests cover: title, eyebrow, optional description, context, summary items, children vs `modes` branch, footer, `md:hidden` on root, and “children win when both modes and children are passed.”

**Does not replace** math tests in `lib/`; it guards **component contract** of the shell.

---

## Phase B — Optional integration smoke (no Playwright)

- Mock `window.matchMedia` for `(max-width: 767px)` → `matches: true`.
- Render a minimal consumer (e.g. `PublicCalculator` or thin wrapper) and assert shell content or stable selector — only if Phase A is stable.

**Explicitly out of scope:** Playwright/E2E (deferred).

---

## CI

Existing CI runs `npm run test` in `app/`. After Phase A, component tests run in the same job once `include` covers `components/**/*.test.tsx`.
