# Code Audit — 2026-04-01

## Executive summary

- Overall code health is solid on core guardrails: protected APIs consistently use `getActiveAppUser()` (with documented exceptions), write paths are Zod-validated, and chart-heavy surfaces use `next/dynamic` with `ssr: false` plus placeholders.
- Highest risk remains maintainability: several critical product flows are still concentrated in very large TSX files (1k-1.5k LOC), increasing change risk and review complexity.
- Medium risks remain in design/security consistency: a few UI surfaces still use undocumented `primary` token classes and decorative modal chrome, and some update/delete mutations rely on pre-check ownership but do not include `userId` in the Prisma `where` clause for defense-in-depth.
- Recommendation: prioritize scoped refactors on the largest modules and tighten ownership constraints in direct mutation calls when those routes are touched next.

---

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- **Oversized UI modules increase regression risk and slow iteration** — Architecture guidance targets focused files (~300 lines), but core workflow files remain several multiples larger, mixing rendering, state, and domain-specific UI behavior in single modules. This materially raises onboarding and change risk in high-traffic product areas.  
  **Evidence:**  
  - `app/app/(app)/properties/add-property-wizard.tsx` (~1591 lines)  
  - `app/app/(app)/properties/[id]/projections-tab-content.tsx` (~1361 lines)  
  - `app/app/(app)/analyze/deal-analyzer-form.tsx` (~1422 lines)  
  - `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (~1035 lines)  
  - `app/app/(app)/properties/property-form.tsx` (~1027 lines)  
  - `app/app/(app)/properties/page.tsx` (~613 lines)  
  - `app/components/marketing/str-ltr-calculator.tsx` (~741 lines), `app/components/marketing/brrr-calculator.tsx` (~640 lines)

### Medium

- **Authorization defense-in-depth is inconsistent on some mutations** — Ownership is checked with user-scoped pre-queries (`findFirst`), but several write operations still mutate by `id` only instead of `id + userId`. Current behavior is safe as written; risk is future regressions if pre-checks are modified or bypassed.  
  **Evidence:** `app/app/api/deals/[id]/route.ts` (`prisma.savedDeal.update({ where: { id } })`, `prisma.savedDeal.delete({ where: { id } })`), `app/app/api/properties/[id]/route.ts` (`prisma.property.delete({ where: { id } })`).

- **Design token/pattern drift in onboarding + legal page links** — UI still uses `bg-primary`/`text-primary` classes while `globals.css` `@theme inline` defines semantic tokens around `accent`, `muted`, `border`, etc., not `primary`. Onboarding modal also uses decorative blur/shadow treatments that conflict with the design spec's "clarity over decoration" posture.  
  **Evidence:** `app/app/(app)/onboarding-panel.tsx` (`bg-primary/15`, `blur-3xl`, `shadow-2xl`), `app/app/privacy/page.tsx` (`text-primary` links), `app/app/globals.css` (no `--color-primary` token mapping in `@theme inline`).

- **API observability is uneven on billing/account failure paths** — Some critical route failures are logged to console but not reported to Sentry, despite architecture guidance to capture unexpected API failures.  
  **Evidence:** `app/app/api/billing/create-checkout-session/route.ts` (catch block logs structured error only), `app/app/api/account/delete/route.ts` and `app/app/api/account/delete-permanent/route.ts` (Stripe/Clerk cancellation/delete errors logged via `console.error` without Sentry capture).

### Low

- **Extra client-side fetch on amortization chart adds latency and weakens failure UX** — Amortization data is fetched client-side after render, introducing an additional round-trip and no explicit error-state branch (only loading/empty). This is acceptable today but adds friction on slow networks.  
  **Evidence:** `app/components/charts/amortization-chart.tsx` (`useEffect` fetch to `/api/properties/${propertyId}/amortization` with no error UI), `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`.

- **Route handler concentration in deal route** — `app/app/api/deals/[id]/route.ts` bundles serialization + metrics orchestration + CRUD in one file. Functional today, but this drifts from the "thin route, lib-centric logic" target and increases cognitive load for edits.  
  **Evidence:** `app/app/api/deals/[id]/route.ts` (inline `serializeDeal` and metric composition logic).

---

## Evidence reviewed

- **Process/policy docs:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`, `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md`, `docs/security/security-notes.md`
- **Core app/config surfaces:** `app/app/layout.tsx`, `app/app/(app)/layout.tsx`, `app/next.config.ts`, `app/proxy.ts`, `app/app/globals.css`
- **API security/architecture sample:** `app/app/api/properties/[id]/route.ts`, `app/app/api/deals/[id]/route.ts`, `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/billing/portal/route.ts`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts`, `app/app/api/onboarding/route.ts`, `app/app/api/me/route.ts`, `app/app/api/properties/[id]/amortization/route.ts`
- **UI/performance sample:** `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/components/charts/{equity-chart.tsx,debt-vs-value-chart.tsx,cash-flow-chart.tsx,amortization-chart.tsx}`, `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/privacy/page.tsx`
- **Repo-wide sweeps run:** auth usage (`getActiveAppUser`/`getAppUser`) across API routes, Zod/validation usage, `next/dynamic` + `ssr: false` chart loading, raw `<img>` usage, semantic token drift (`text-primary`/`bg-primary`), and `any` usage
- **Limits of this pass:** No runtime load testing, dependency vulnerability scan, or full file-by-file manual review of every component. Findings are based on policy review + targeted deep reads + repo-wide pattern sweeps.

---

## Risk & impact assessment

- **Maintainability risk:** High likelihood / medium-to-high impact. Large modules in core flows are the biggest source of future regression cost.
- **Security posture:** Low current exposure due existing ownership pre-checks, but medium future-risk if code evolves without preserving those checks.
- **Design consistency:** Medium likelihood / medium product impact. Drift is localized but user-visible in onboarding/legal contexts.
- **Performance:** Low immediate impact; chart-loading patterns are generally good and compliant, with minor UX/network optimization opportunities.

---

## Recommendations (prioritized)

1. Split the largest property/deal-analyzer modules incrementally (when touched) into section components + hooks/lib utilities, starting with `add-property-wizard.tsx`, `projections-tab-content.tsx`, and `deal-analyzer-form.tsx`.
2. Add `userId` to direct mutation `where` clauses for deal/property delete/update operations that currently rely on pre-check ownership only.
3. Normalize `primary` usages to documented semantic tokens (or define `primary` explicitly in `globals.css` theme mapping) and simplify onboarding modal decorative effects to align with the design spec.
4. Add Sentry capture for unexpected failures in checkout/account destructive flows where only console logging exists today.
5. Consider moving amortization schedule fetching into a server-provided payload (or add explicit error state + retry) to reduce post-render latency and improve failure UX.

---

## Task candidates

- [ ] Refactor plan for oversized core files in property/deal analyzer flows (modular extraction with no behavior change).
- [ ] Harden `app/app/api/deals/[id]/route.ts` and `app/app/api/properties/[id]/route.ts` mutations with `userId`-scoped `where` constraints.
- [ ] Replace or define `primary` token usage in onboarding/privacy surfaces; align modal visual treatment with design-spec minimalism.
- [ ] Add `Sentry.captureException` to checkout/account failure paths that currently only log.
- [ ] Improve amortization chart error UX and/or server-data handoff to avoid extra client fetch latency.

---

## Re-test checklist

- [ ] Verify property/deal mutation routes still reject cross-user IDs after `where` hardening.
- [ ] Verify onboarding and privacy page link styles in light/dark mode after token cleanup.
- [ ] Simulate Stripe/Clerk failures and confirm Sentry events include safe context (no secrets/PII overexposure).
- [ ] Verify amortization chart behavior on network failure (error state or retry path) if UX hardening is implemented.
- [ ] Run `npm run check` from `app/` when remediation code changes are made.

---

## Next trigger and cadence

- **Trigger:** Monthly, pre-release, or after major changes to property/deal flows, billing APIs, or design tokens.
- **Recommended next window:** 2026-05-01 (or immediately after the next substantial property/deals refactor).
