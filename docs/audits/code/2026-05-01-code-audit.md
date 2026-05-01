# Code Audit — 2026-05-01

## Executive summary

- **Overall health:** The `RealEstatePortfolio/app` package remains aligned with documented layering on sampled surfaces: protected APIs use `getActiveAppUser()` except the intentional **`getAppUser()`** restore flow (`app/app/api/account/restore/route.ts`), Prisma access is scoped by `userId` in reviewed handlers, Zod appears on sampled mutating admin/cron paths, and `next.config.ts` keeps security headers, CSP wiring, and `experimental.optimizePackageImports` for `lucide-react` and `recharts`.
- **Top gaps:** (1) Several **monolithic client modules** far exceed the ~300-line maintenance guideline—especially **`add-property-wizard.tsx`** (~**2794** non-blank lines by grep count). (2) Authenticated **`/calculators/rent-vs-buy`** still imports **`RentVsBuyCalculator`** statically, pulling **Recharts** into the initial route bundle—out of step with `docs/architecture-and-build-practices.md` §2.5. (3) **`checkRateLimit`** is invoked with action keys **missing** from `lib/rate-limit.ts` `RATE_LIMITS`, so those checks are **no-ops** (documented cluster around **SEC-2026-04-30-1** in `docs/security/security-notes.md`).
- **Security posture:** No new IDOR or “missing auth on protected JSON APIs” patterns surfaced in this grep-forward pass; cron handlers continue to gate on **`CRON_SECRET`** (e.g. `app/app/api/cron/monthly-digest/route.ts`). Admin routes remain **`getActiveAppUser()` + `isAdmin()`** on sampled files.
- **Recommendation:** Ship dynamic loading for in-app rent-vs-buy, add **`RATE_LIMITS`** entries (or remove dead checks) for admin actions currently passing unknown keys, and schedule decomposition passes on the largest property/analyze modules without mixing behavior changes.

## Severity-ranked findings

### Critical

- *(None identified on this pass.)*

### High

- *(None escalated.)* Remaining issues are primarily maintainability, bundle shape on one calculator route, and defense-in-depth rate limiting—not demonstrated exploit chains against tenant isolation on sampled APIs.

### Medium

- **Extreme file size concentration (architecture / technical debt)** — `docs/architecture-and-build-practices.md` §4.2 recommends reconsidering splits past ~**300** lines. Current standouts (non-blank line counts via workspace grep): **`app/app/(app)/properties/add-property-wizard.tsx`** (~**2794**), **`app/app/(app)/analyze/deal-analyzer-form.tsx`** (~**1592**), **`app/app/(app)/properties/[id]/projections-tab-content.tsx`** (~**1272**). Property editing has moved toward **`app/app/(app)/properties/[id]/edit-drawer.tsx`** (~**473**), which is healthier but still a dense orchestration surface. **Impact:** Higher regression risk, slower reviews, and harder testing on core landlord flows.
- **In-app Rent vs Buy bypasses deferred chart loading (performance / architecture)** — **`app/app/(app)/calculators/rent-vs-buy/page.tsx`** imports **`RentVsBuyCalculator`** directly from **`app/components/marketing/rent-vs-buy-calculator.tsx`**, which imports **`recharts`** at module top. Marketing surfaces use dynamic slots (**`app/components/marketing/calculator-page-slots.tsx`** pattern). **Impact:** Larger initial JS for authenticated users hitting that route; inconsistent with §2.5 guidance.
- **Portfolio CSV import holds a long single transaction (efficiency / scaling)** — **`app/app/api/import/portfolio/route.ts`** runs **`prisma.$transaction`** with a **`for`** loop of **`tx.property.create`** / conditional **`tx.mortgage.create`** (**~167–231**). **Impact:** Acceptable for typical CSV sizes; large imports extend lock duration—monitor if bulk import UX expands.
- **Rate-limit calls with undefined actions are ineffective (security / reliability)** — **`checkRateLimit`** returns **`{ allowed: true }`** when **`RATE_LIMITS[action]`** is absent (**`app/lib/rate-limit.ts`** **40–45**). Call sites use actions **not** present in **`RATE_LIMITS`**, including **`admin:trial-patch`** (**`app/app/api/admin/users/[id]/trial/route.ts`** **36**), **`admin:trial-email-send`** (**`trial-email/route.ts`** **37**), **`admin:billing-sync`** (**`billing-sync/route.ts`** **22**), **`admin:milestone-sentinel-backfill`** (**`backfill-milestone-sentinels/route.ts`** **32**—confirm exact string in file body below **line 25**). **`admin:tier-patch`** *is* defined and enforced (**`rate-limit.ts`** **15** vs **`tier/route.ts`** **25**). **Impact:** Documented gap class; weakens abuse throttling on privileged maintenance endpoints.

### Low

- **Marketing / overlay shadow depth vs legacy minimal-shadow language** — **`docs/policies/design-spec.md`** §9 historically discouraged heavy shadows; **`docs/design/design-spec-2026.md`** defines a Raised elevation model. Examples still worth harmonizing with designers: **`shadow-xl`** on **`app/app/page.tsx`** (marketing hero device mock **~312**) and **`app/app/(app)/properties/[id]/property-detail-content.tsx`** (**~433**); **`shadow-2xl`** on **`app/app/(app)/onboarding-panel.tsx`** (**~259**); drawer **`shadow-xl`** (**`app/components/ui/drawer.tsx`** **~126**).
- **Decorative gradient on homepage** — **`app/app/page.tsx`** **`bg-gradient-to-b from-accent/[0.04]`** (**~172**) — minor tension with “clarity over decoration” unless explicitly approved under **`design-spec-2026.md`** marketing rules.
- **Hardcoded hex in UI SVG inline styles** — e.g. **`color: "#0a0a0a"`** in **`app/components/properties/detail/completion-card.tsx`** (**~68**) and **`app/components/properties/task-center/incomplete-profiles-card.tsx`** (**~64**); chart gradient stops in **`app/components/dashboard/equity-trend-chart.tsx`** (**~216–217**) use literal greens for Recharts—often unavoidable but not token-driven.
- **Stale inline documentation** — **`app/app/(app)/dashboard/build-insights-payload.ts`** comments reference using **`any`** for **`unitRents`** (**~31–33**) while the field is typed **`unknown`** on **`DashboardPropertyRecord`** (**~52**). **Impact:** Misleading code review signal only.
- **Redundant `force-dynamic` on nested routes** — **`app/app/(app)/layout.tsx`** already exports **`dynamic = "force-dynamic"`** (**~23**); children **`app/app/(app)/analyze/page.tsx`**, **`admin/layout.tsx`**, **`admin/page.tsx`** repeat the export—noise only.

## Coverage by audit dimension (`docs/process/code-audit-process.md` §2)

| Dimension | Assessment (this pass) |
|-----------|-------------------------|
| **§2.1 Design compliance** | Semantic-token drift via raw **`zinc-*`** classes not prominent in TSX grep; isolated **hex** in SVG/chart stops and strong **shadow-xl/2xl** on marketing/onboarding surfaces (**Low**). |
| **§2.2 Architecture** | Layered flow holds on sampled APIs; concentration of UI + domain orchestration in mega-components (**Medium**) vs **`lib/`** extraction. |
| **§2.3 Efficiency** | Heavy chart routes mostly deferred (**modeling**, **mortgage**, **refinance** loaders use **`next/dynamic`** + **`ssr: false`**); in-app rent-vs-buy exception (**Medium**). CSV import transactional loop (**Medium** at scale). |
| **§2.4 Technical debt** | Very large TSX modules; misleading **`build-insights-payload`** comment (**Low**). |
| **§2.5 Security** | **`getActiveAppUser()`** prevalent under **`app/app/api`**; **`getAppUser()`** only on restore (**expected**). Missing **`RATE_LIMITS`** keys (**Medium** defense-in-depth). |
| **§2.6 Product mantra** | Core flows appear complete; maintainer friction from monolith components risks slower fixes (**indirect**). |
| **§2.7 Performance** | **`optimizePackageImports`** includes **`recharts`** (**`app/next.config.ts`** **63–65**); **`preconnect` / `dns-prefetch`** for Clerk, Stripe, conditional PostHog in **`app/app/layout.tsx`** (**~170–180**). Rent-vs-buy static chart import remains the clearest bundle regression. |

## Evidence reviewed

- **Process / template:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`
- **References:** `docs/architecture-and-build-practices.md` (§2.1–2.5, §4), `docs/policies/design-spec.md`, `docs/design/design-spec-2026.md` (pillars / tokens / anti-patterns cross-check), `docs/security/security-notes.md`
- **Config / shell:** `app/next.config.ts`, `app/app/layout.tsx`, `app/app/(app)/layout.tsx`
- **Rate limiting:** `app/lib/rate-limit.ts`; admin routes under `app/app/api/admin/**`; import route `app/app/api/import/portfolio/route.ts`
- **Auth sweep:** `grep` **`getAppUser(`** vs **`getActiveAppUser(`** across **`app/app/api/**/*.ts`**
- **Charts / code splitting:** `app/app/(app)/calculators/rent-vs-buy/page.tsx`, `app/components/marketing/rent-vs-buy-calculator.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/refinance/refinance-workspace-loader.tsx`
- **Cron sample:** `app/app/api/cron/monthly-digest/route.ts` (and sibling **`CRON_SECRET`** usages under **`app/app/api/cron/`**)
- **Limits:** Grep-led sampling; not every component or handler read line-by-line. Line counts are **non-blank** totals from ripgrep pattern `.` counts—close to physical lines but not identical to `wc -l`.

## Risk & impact assessment

- **Medium findings** primarily affect engineering velocity, authenticated calculator bundle weight, and **admin** abuse margins—not demonstrated cross-tenant data leaks on this pass.
- **`RATE_LIMITS`** gaps matter most if admin credentials or sessions are compromised; **`isAdmin`** still gates access.
- **Mega-files** increase the likelihood of subtle regressions whenever property or analyze flows change.

## Recommendations (prioritized)

1. **Dynamic-load `RentVsBuyCalculator`** on **`app/app/(app)/calculators/rent-vs-buy/page.tsx`** with **`next/dynamic`** **`ssr: false`** and a compact placeholder—mirror marketing **`calculator-page-slots.tsx`** patterns.
2. **Resolve rate-limit no-ops** — Add **`RATE_LIMITS`** entries for **`admin:trial-patch`**, **`admin:trial-email-send`**, **`admin:billing-sync`**, **`admin:milestone-sentinel-backfill`** (with sensible hourly caps), **or** remove **`checkRateLimit`** calls if intentional; update **`docs/security/security-notes.md`** / **`docs/tasks.md`** when closed (ties to **SEC-2026-04-30-1** narrative).
3. **Schedule decomposition passes** — Extract hooks and dumb subviews from **`add-property-wizard.tsx`**, **`deal-analyzer-form.tsx`**, and **`projections-tab-content.tsx`** as pure refactors (behavior-stable PRs).
4. **Correct documentation drift** — Update **`build-insights-payload.ts`** commentary to say **`unknown`** JSON / narrowing via **`getPropertyTotalRent`**, not **`any`**.
5. **Optional polish** — Trim redundant child **`force-dynamic`** exports; reconcile shadow depth with **`design-spec-2026.md`** Section 6 vs legacy §9 language.

## Task candidates

- [ ] Wrap authenticated **`RentVsBuyCalculator`** with **`next/dynamic`** + **`ssr: false`** + loading placeholder from **`/calculators/rent-vs-buy`**.
- [ ] Add **`RATE_LIMITS`** keys (and **`recordRateLimit`** where appropriate) for admin trial / trial-email / billing-sync / milestone backfill routes—or delete ineffective **`checkRateLimit`** blocks.
- [ ] Incremental split of **`add-property-wizard.tsx`** into step components + hooks (no behavior change).
- [ ] Incremental split of **`deal-analyzer-form.tsx`** into sections (inputs, results, save flow).
- [ ] Fix **`build-insights-payload.ts`** **`unitRents`** comment to match **`unknown`** typing.

## Re-test checklist

- [ ] After rent-vs-buy change: load **`/calculators/rent-vs-buy`** signed in—chart renders, no hydration issues, acceptable loading UX.
- [ ] After rate-limit changes: exercise each admin route with >cap requests—expect **429** when limits enforced; confirm **`ApiRateLimitEntry`** rows when **`recordRateLimit`** used.
- [ ] After refactors: smoke **`/properties/new`**, **`/analyze`**, modeling workspace projections tab.
- [ ] `npm run check` (once implementation tasks land).

## Next trigger and cadence

- **Trigger:** Monthly code audit or after major property/analyze/billing changes.
- **Suggested next window:** **2026-06-01** (or next full audit synthesis date per `docs/process/full-audit-synthesis.md`).
