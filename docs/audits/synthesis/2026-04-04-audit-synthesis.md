# Full Audit Synthesis — 2026-04-04

## Audits included

| # | Lane | Report | Notes |
|---|------|--------|-------|
| 1 | Code | `docs/audits/code/2026-04-04-code-audit.md` | |
| 2 | Math & Logic | `docs/audits/math/2026-04-04-math-logic-audit.md` | |
| 3 | Security & Privacy | `docs/audits/security/2026-04-04-security-audit-2.md` | Run 2 (afternoon pass) |
| 4 | Performance & Cost | `docs/audits/performance-cost/2026-04-04-performance-cost-audit.md` | |
| 5 | Reliability & Operations | `docs/audits/reliability-ops/2026-04-04-reliability-ops-audit.md` | |
| 6 | Data Integrity & Reconciliation | `docs/audits/data-integrity/2026-04-04-data-integrity-audit.md` | |
| 7 | Business & Valuation | `docs/audits/business/2026-04-04-business-valuation-audit.md` | Run 2 (afternoon pass) |
| 8 | Feature / UX / IA | `docs/audits/feature/2026-04-04-feature-ux-audit.md` | |
| 9 | Mobile Experience | `docs/audits/feature/2026-04-04-mobile-experience-audit.md` | |
| 10 | Growth Funnel & Activation | `docs/audits/growth-funnel/2026-04-04-growth-funnel-audit.md` | |
| 11 | SEO (Search & Discovery) | `docs/audits/seo/2026-04-04-seo-audit.md` | Run 2 (afternoon pass) |
| 12 | Documentation | `docs/audits/documentation/2026-04-04-documentation-audit.md` | |
| 13 | Legal & Compliance | `docs/audits/legal-compliance/2026-04-04-legal-compliance-audit.md` | |
| 14 | AI Agent Governance | `docs/audits/agent-governance/2026-04-04-agent-governance-audit.md` | |

**Context:** Today's implementation batch shipped Refinance & Payoff Insights Phase 3 (both `payoff-card.tsx` inline section and standalone `/refinance` workspace), the Property Detail & Edit revamp, Calculators Premium CTA Phase 1 (all public calculator surfaces now instrumented), and Changelog Polish. All prior audit open items from 2026-04-03 that were scheduled for this batch are confirmed resolved.

---

## Consolidated task list

### Security

- [ ] **SEC-1** — Document OAuth/passwordless account deletion path in `docs/security/security-notes.md`; align settings UI copy (`app/(app)/settings/` deletion section) — *Source: Security (Medium, carried)*
- [ ] **SEC-2** — Add `npm audit` / SCA step to CI or monthly ops calendar; document triage policy in `docs/security/security-audit.md` — *Source: Security (Medium)*
- [ ] **SEC-3** — Add secret/key rotation checklist subsection to `docs/runbooks/incident-response.md` (cross-link from `docs/setup/manual-steps.md`) — *Source: Security (Low), Reliability (Low)*
- [ ] **SEC-4** — (Optional) Register `billing:subscription-details` and `billing:status` in `RATE_LIMITS` (`app/lib/rate-limit.ts`) as forward-looking hygiene — *Source: Security (Informational)*

### UX / Feature

- [ ] **UX-1** — Add ARIA tab semantics to `property-detail-tabs.tsx`: `role="tablist"` on containers, `role="tab"` + `aria-selected` on buttons, `aria-controls` to panel divs — WCAG 2.1 §4.1.2 — *Source: Feature/UX (Medium)*
- [ ] **UX-2** — Add `aria-label="Sort deals"` (or visually-hidden `<label>`) to sort `<select>` in `deals-list.tsx` line 92 — WCAG §1.3.1 — *Source: Feature/UX (Medium)*
- [ ] **UX-3** — Align timing copy: standardize "60 seconds" vs "2 minutes" across `app/app/page.tsx` (lines 107, 261, 717) and `onboarding-panel.tsx` (line 196) — one value everywhere — *Source: Feature/UX (Medium), Growth (Medium)*
- [x] **UX-4** — Resolve `border-border/70` / `bg-card/95` policy — **Permitted** with guidance in `design-spec-2026.md` §7 (opacity-variant rule) and related sections — *closed 2026-04-04 — Source: Feature/UX (High)*
- [ ] **UX-5** — If deprecated (per UX-4): batch sweep `border-border/70` → `border-border`, `bg-card/95` → `bg-card` — *Deferred: UX-4 permit path chosen (2026-04-04); sweep only if policy later deprecates variants — Source: Code (Medium), Feature/UX (High)*
- [ ] **UX-6** — Replace `uppercase tracking-wide` section headings in `deal-analyzer-form.tsx` (18 occurrences) with `text-xs font-medium text-muted` per design-spec-2026 Pillar 6 — *Source: Code (Medium)*
- [ ] **UX-7** — Add deprecation notice to `docs/policies/design-spec.md §6`; point readers to `app-nav.tsx` as authoritative nav source — *Source: Feature/UX (Medium, carried × 2)*
- [ ] **UX-8** — Reconcile "Print summary" vs "Print portfolio summary" labels: same text in `dashboard/page.tsx` (line 225) and `workspace-nav-mobile.tsx` (line 43) — *Source: Feature/UX (Low)*
- [ ] **UX-9** — Replace "CoC return" abbreviation with "Cash-on-cash return" in `deals-list.tsx` line 172 — *Source: Feature/UX (Low)*
- [ ] **UX-10** — Consolidate the two duplicate FAQ sections on `pricing/page.tsx` (lines 212–251 and 299–328) — *Source: Feature/UX (Medium, carried × 2)*
- [ ] **UX-11** — Add `duration-150` to onboarding panel "Add first property" button transition — `onboarding-panel.tsx` line 218 — *Source: Feature/UX (Low, carried)*
- [ ] **UX-12** — Implement `.cta-glow` utility in `globals.css`; update `onboarding-panel.tsx` to use it instead of ad-hoc `shadow-lg shadow-accent/25` — *Source: Code (Low)*

### Mobile Experience

- [x] **MOB-1** — Add `inputMode="decimal"` / `inputMode="numeric"` to `PublicCalculator` (`public-calculator.tsx`) — all 14 inputs (desktop + mobile) — *closed 2026-04-04 — Source: Mobile (P2, new)*
- [ ] **MOB-2** — Return focus to hamburger button on drawer close in `app-layout-client.tsx`: add `menuButtonRef`, call `.focus()` in `closeDrawer`, Escape handler, and backdrop click handler — mirrors `LandingNav` pattern — WCAG 2.1 §2.4.3 — *Source: Mobile (P2, carried), Feature/UX (Medium)*
- [x] **MOB-3** — Raise stress test preset button touch targets in `deal-analyzer-form.tsx` to `min-h-[44px]` — mobile + desktop preset groups — *closed 2026-04-04 — Source: Mobile (P2, new)*
- [x] **MOB-4** — Add `min-h-[44px]` to `WorkspaceNavMobile` chip links (`workspace-nav-mobile.tsx`) — *closed 2026-04-04 — Source: Mobile (P2, carried)*
- [ ] **MOB-5** — Raise vertical padding on action links in `properties/page.tsx` and `dashboard/page.tsx` card CTAs to `py-2` or add `min-h-[44px]` — *Source: Mobile (P2, new)*
- [ ] **MOB-6** — Manual: Execute full viewport matrix (320, 375, 390, 430, 767/768px) + real iOS/Android device on all §5 routes — keyboard, safe-area, native `<select>`, scroll momentum — *Source: Mobile (Human-only)*

### Performance

- [ ] **PERF-1** — Add max file size check (e.g. 2 MB) and/or max row count to `POST /api/import/portfolio/route.ts` before parsing; reject early with 413/400 — *Source: Performance (Medium)*
- [ ] **PERF-2** — Run Lighthouse/CWV on `/` and `/pricing`; fix `MockupFrame` CLS if still failing — add `min-height`/`aspect-ratio` for SSR-stable container in `mockup-frame.tsx` — *Source: Performance (Medium), Feature/UX (Medium, carried), Mobile (P3)*
- [ ] **PERF-3** — Merge `property.findFirst` + `mortgage.findMany` into a single `findFirst({ include: { mortgages } })` in `GET /api/properties/[id]/mortgage/route.ts` — *Source: Performance (Low)*
- [ ] **PERF-4** — Before scheduling PDF export (Gap #1): write performance constraints into the task spec (library choice, `next/dynamic` + `ssr: false` requirement, timeout/memory budget) — *Source: Performance (Low)*

### Reliability

- [ ] **REL-1** — `app/lib/posthog-server.ts`: `Sentry.captureException` in `catch` — **done 2026-04-04.** PostHog analytics outage subsection in `docs/runbooks/incident-response.md` — *still open — Source: Reliability (Medium)*
- [ ] **REL-2** — `app/app/api/health/route.ts`: either add `Sentry.captureException` on DB failure, **or** document in `docs/runbooks/incident-response.md` that DB-down signals come from UptimeRobot/Vercel only — pick one and close the gap — *Source: Reliability (Medium)*
- [ ] **REL-3** — (Optional) Add lightweight `app/app/error.tsx` root error boundary or add a note in `incident-response.md` documenting that public routes rely on `global-error.tsx` — *Source: Reliability (Low)*
- [ ] **REL-4** — (Optional) Append `gitSha: process.env.VERCEL_GIT_COMMIT_SHA` to health endpoint JSON in non-dev environments — *Source: Reliability (Low)*

### Data Integrity

- [x] **DI-1** — ~~Surface multi-lien collapse warning in `import-csv-section.tsx`~~ — **Already implemented.** `import-csv-section.tsx` lines 212–216 show a persistent "Multiple mortgages:" note block above the import button explaining the one-lien-per-row limitation and directing users to add remaining loans in the property workspace. Audit agent false positive. *(2026-04-04)*
- [ ] **DI-2** — Add `original loan amount` and `loan type` (first-lien values) to export headers in `app/app/api/export/portfolio/route.ts` — closes single-lien round-trip gap — *Source: Data Integrity (Medium, carried)*
- [ ] **DI-3** — Add escrow-basis documentation note to `docs/reference/portfolio-csv-export.md` for `monthly payment (all liens sum)` column; optionally add `escrow included (first lien)` boolean column to export — *Source: Data Integrity (Medium, new)*
- [ ] **DI-4** — Change unknown `loanType` in `normalizeLoanTypeFromCsv` (`app/lib/import/csv-parser.ts`) to return `{ value: null, warning }` instead of `{ error }` — propagate as non-blocking import row warning — *Source: Data Integrity (Low, new)*
- [ ] **DI-5** — Add `displayMode` to `buildPortfolioSummaryPayload` return; display active ownership mode in `/export/portfolio-summary` print page footer — *Source: Data Integrity (Low, new)*
- [ ] **DI-6** — Update `app/lib/metrics/property-metrics.ts` line 3 comment to cite `docs/policies/ownership-metrics.md` instead of stale `engineering-spec.md §6` — *Source: Data Integrity (Low, carried from math series)*

### Growth

- [ ] **GRW-1** — Add `["Estimate pool (per hour)", "5/hr", "10/hr", "20/hr"]` row to mobile `<details>` accordion in `pricing/page.tsx` to match desktop `<table>` — *Source: Growth (High), Business (Medium), Legal (Low)*
- [ ] **GRW-2** — Set `href="/sign-up?intent=free"` and `planIntent="free"` on `competitor_alt_hero`, `competitor_alt_table`, and `competitor_alt_footer` `FunnelCtaLink` blocks in `competitor-alternative-page.tsx` — *Source: Growth (High)*
- [ ] **GRW-3** — Add `landing_variant` (last-touch) to `user_signed_up` PostHog event in `posthog-signup-once.tsx`; or document approved session-funnel workaround in `docs/launch/analytics.md` — *Source: Business (High), Growth (implicit)*
- [ ] **GRW-4** — Replace plain `<Link href="/pricing">` "See plans" on `investment-property-calculator/page.tsx` with `FunnelCtaLink` (e.g. `placement="investment_property_footer_pricing"`, `ctaId="see_plans"`) — *Source: Growth (Medium)*
- [ ] **GRW-5** — Ship Phase A interactive demo embed per roadmap; instrument `demo_session_started` event; measure signup CVR vs `home_v4` baseline — *Source: Growth (Medium), Business (Low)*
- [ ] **GRW-6** — (Optional) Add secondary "Analyze a deal →" action to `OnboardingPanel` for calculator-origin sessions — requires PM product decision on activation KPI — *Source: Growth (Medium), Business (Medium)*

### SEO

- [x] **SEO-1** — Fix `CALCULATOR_LINKS` in `app/app/page.tsx` + `app/.agents/product-marketing-context.md` — *closed 2026-04-04 — Source: SEO (High)*
- [x] **SEO-2** — Change `operatingSystem: "Web"` to `"Web Browser"` in `WebApplication` JSON-LD in `app/app/layout.tsx` — *closed 2026-04-04 — Source: SEO (Medium)*
- [ ] **SEO-3** — Add `"/lp/"` and `"/refinance"` to `disallow` list in `app/app/robots.ts` — consistency with existing authenticated sub-path pattern — *Source: SEO (Medium)*
- [ ] **SEO-4** — Verify `NEXT_PUBLIC_APP_URL` in Vercel production settings matches live canonical origin; add verification step to `docs/qa/seo-release-checklist.md` or deploy runbook — *Source: SEO (High — all 223 canonical tags depend on this)*
- [ ] **SEO-5** — Align `/vs` page (`vs/page.tsx`) metadata `title` with H1 intent (e.g. `"Veld vs Spreadsheets"`) — *Source: SEO (Medium)*
- [ ] **SEO-6** — Use accurate static dates in `sitemap.ts` for infrequently-changed pages (`/privacy`, `/terms`); avoid dynamic `new Date()` for all 223 entries — *Source: SEO (Medium)*
- [ ] **SEO-7** — (Optional) Upgrade `/pricing` page `title` from generic `"Pricing"` to a keyword-bearing variant — *Source: SEO (Low)*
- [ ] **SEO-8** — (Optional) Add `/pricing` link to `footer.tsx` — *Source: SEO (Low)*

### Governance

- [x] **GOV-1** — Add `app/.agents/product-marketing-context.md` reference to `builder-agent.mdc` § References — *closed 2026-04-04 — Source: Agent Governance (Medium, new)*
- [ ] **GOV-2** — Resolve audit execution model inconsistency: update `docs/audits/README.md` OR individual lane rules so "in-thread Agent vs Task subagent" default is stated once; update `agent-governance-audit-process.md §4` to match — *Source: Agent Governance (Medium, carried)*
- [ ] **GOV-3** — Reconcile `docs/process/command-integrity-check.md` lane rename list with `docs/audits/README.md § Lane structure contract` — one source of truth or explicit pointer — *Source: Agent Governance (Low)*

### Math

- [x] **MATH-1** — Update `docs/process/math-logic-audit.md §2.1` for 3-tier `getEffectiveBalance` model — *closed 2026-04-04 — Source: Math (Medium — spec/code divergence)*
- [ ] **MATH-2** — Add JSDoc to `PropertyMetrics.capRate` in `property-metrics.ts` clarifying it uses full-property (unscaled) NOI, not the scaled `noi` return field — *Source: Math (Medium)*
- [ ] **MATH-3** — Add `isFinite` NaN guard at top of `generateAmortizationSchedule` and `getPayoffProjection` in `lib/amortization.ts` — defensive hardening — *Source: Math (Low)*
- [ ] **MATH-4** — Guard `getPayoffYearsWithExtra` against returning `0` when months round to zero: add `if (months === 0) return null` before `Math.round` — *Source: Math (Low)*

### Business

- [ ] **BIZ-1** — Plan investor PDF output (Gap #1): define scope, confirm library constraints (see PERF-4), add to `docs/tasks.md`; extends existing `/export/portfolio-summary` pattern — *Source: Business (High)*
- [ ] **BIZ-2** — Extract `formatMoneySigned` helper to `lib/format-currency.ts`; import from both `payoff-card.tsx` and `refinance-workspace.tsx` — eliminates first-day duplication — *Source: Code (Medium)*
- [ ] **BIZ-3** — Extract `buildCurrentLoanBalances` and `buildRefiBalances` from `refinance-workspace.tsx` to `lib/amortization.ts`; add colocated unit tests alongside `lib/amortization.test.ts` — *Source: Code (Low)*
- [ ] **BIZ-4** — (Optional) Split `refinance-workspace.tsx` (744 lines) chart section into `<RefinanceBalanceChart>` sub-component — *Source: Code (Low)*
- [ ] **BIZ-5** — (Human-only) Confirm LLC formation timeline, Stripe entity alignment, and Terms/Privacy entity update — *Source: Business (Medium)*

### Documentation

- [ ] **DOC-1** — Update `docs/README.md`: add `design/design-spec-2026.md` as the primary design reference; adjust `policies/design-spec.md` and design-brief lines to match the canonical hierarchy already stated in the policy file — *Source: Documentation (High)*
- [ ] **DOC-2** — Fix broken `docs/...` relative link targets in `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` and `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` footer sections — use `../brainstorms/...`, `../design/...`, etc. — *Source: Documentation (High)*
- [ ] **DOC-3** — Fix `tasks.md` link in `docs/process/full-audit-synthesis.md §4` embedded template: change `[docs/tasks.md](../../tasks.md)` to `[docs/tasks.md](../tasks.md)` — *Source: Documentation (High)*
- [ ] **DOC-4** — Repair archive broken links: `benchmarking-proposal.md` L148 roadmap link; `paid-ads-readouts/README.md` depth to `docs/launch/`; `add-property-experience-overhaul.md` qa/ links to `../../qa/...` — *Source: Documentation (Medium)*
- [x] **DOC-5** — Refresh `docs/tasks.md` roadmap "last reviewed" date when PM confirms priorities — *closed 2026-04-04 — Source: Documentation (Medium)*
- [ ] **DOC-6** — Rewrite or archive `docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md` Item 4 to describe React mockup components, not PNG capture acceptance criteria — *Source: Documentation (Medium)*

### Legal / Compliance

- [ ] **LEG-1** — Add inline "Numbers are educational — confirm with your lender" disclaimer to `app/app/tools/str-vs-ltr/page.tsx` — match the existing BRRRR pattern — *Source: Legal (Low, new)*
- [ ] **LEG-2** — Audit `app/app/tools/fix-and-flip/page.tsx` and `app/app/investment-property-calculator/page.tsx`; add the same educational disclaimer if missing — *Source: Legal (Low)*
- [ ] **LEG-3** — Add "not financial advice / educational only — confirm with your lender" note near the monthly savings / break-even output in `payoff-card.tsx` (Refinance What-If Phase A is already shipped; this disclosure is a pre-live gate) — *Source: Legal (Low — pre-ship gate)*
- [ ] **LEG-4** — (Human-only / counsel) Draft governing law, venue, and dispute resolution clauses for `app/app/terms/page.tsx` — *Source: Legal (Medium)*
- [ ] **LEG-5** — (Human-only / counsel) Validate auto-renewal and cancellation disclosures against applicable US state laws before scaling paid subscriptions — *Source: Legal (Medium)*

---

## PM triage (this run)

### Ship (next window)

Critical/High unresolved + Medium items with clear user/security/SEO/data risk. Fix before or alongside the next implementation batch.

**Completed (2026-04-04 batch):** SEO-1 (homepage calculator links + `product-marketing-context.md`), UX-4 (opacity variants permitted in `design-spec-2026.md`), REL-1 code path (`Sentry.captureException` in `posthog-server.ts`; PostHog outage runbook subsection still open — see consolidated **REL-1**).

- [x] **SEO-1** — Fix broken homepage calculator links + update `.agents/product-marketing-context.md` — *(done 2026-04-04)*
- [x] **DI-1** — ~~Show multi-lien collapse warning in import UX~~ — **Already implemented** in `import-csv-section.tsx`. *(closed 2026-04-04)*
- [ ] **GRW-1** — Add "Estimate pool (per hour)" row to pricing page mobile accordion — *(Growth High — mobile evaluators missing key paid-tier differentiator; churn/support risk after upgrade)*
- [ ] **GRW-2** — Add `planIntent="free"` + `?intent=free` to competitor/alternative primary sign-up CTAs — *(Growth High — attribution gap + PaidIntentCheckoutBanner cannot fire for high-intent SEO traffic)*
- [x] **UX-4** — Resolve `border-border/70` / `bg-card/95` policy — *(done 2026-04-04 — permitted with guidance in design spec)*
- [ ] **MOB-2** — Return focus to hamburger button on drawer close (`app-layout-client.tsx`) — *(Mobile P2 / WCAG 2.1 §2.4.3 — core navigation a11y regression, carried from 2026-04-03)*
- [ ] **UX-1** — Add ARIA tab roles to `property-detail-tabs.tsx` — *(Feature Medium / WCAG 2.1 §4.1.2 — primary navigation on the most content-dense page in app)*
- [ ] **REL-1** — PostHog outage runbook subsection in `incident-response.md` *(Sentry capture in `posthog-server.ts` shipped 2026-04-04)* — *(Reliability Medium)*
- [ ] **LEG-3** — Add "not financial advice / confirm with lender" disclaimer to Refinance What-If output in `payoff-card.tsx` — *(Legal Low but pre-ship gate — Phase A is already live; disclosure should be concurrent)*
- [ ] **DOC-1** — Elevate `design-spec-2026.md` in `docs/README.md` hub — *(Documentation High — builders and agents read the hub first; wrong hierarchy causes spec violations)*
- [ ] **DOC-2** — Fix broken relative links in `docs/plans/2026-04-04-*-plan.md` footer sections — *(Documentation High — active planning docs have dead cross-links)*
- [ ] **DOC-3** — Fix `tasks.md` link in `full-audit-synthesis.md §4` template — *(Documentation High — PM workflow bug)*

### Schedule (next batch)

Bounded Medium/Low improvements — UX polish, perf refactors, growth instrumentation, doc hygiene.

**UX / Feature**
- [ ] **UX-2** — Deals sort select accessible label (`aria-label="Sort deals"`) — *(WCAG §1.3.1, one-liner)*
- [ ] **UX-3** — Align timing copy "60 seconds" vs "2 minutes" across landing + onboarding — *(trust erosion)*
- [ ] **UX-5** — Batch `border-border/70` / `bg-card/95` sweep — *Deferred: UX-4 permit path (2026-04-04); sweep only if policy later deprecates variants*
- [ ] **UX-6** — Replace `uppercase tracking-wide` in `deal-analyzer-form.tsx` (18 occurrences) — *(design-spec Pillar 6)*
- [ ] **UX-7** — Add deprecation notice to `docs/policies/design-spec.md §6` — *(stale nav model misleads contributors)*
- [ ] **UX-8** — Reconcile "Print summary" / "Print portfolio summary" labels — *(cross-viewport consistency)*
- [ ] **UX-9** — Replace "CoC return" with "Cash-on-cash return" in `deals-list.tsx` — *(cross-flow label consistency)*

**Mobile**
- [x] **MOB-1** — Add `inputMode="decimal"/"numeric"` to all `PublicCalculator` inputs — *(done 2026-04-04)*
- [x] **MOB-3** — Raise stress test preset button touch targets in `deal-analyzer-form.tsx` — *(done 2026-04-04)*
- [x] **MOB-4** — Add `min-h-[44px]` to `WorkspaceNavMobile` chip links — *(done 2026-04-04)*
- [ ] **MOB-5** — Raise action link touch targets in `dashboard/page.tsx` and `properties/page.tsx` — *(P2, new)*

**Performance**
- [ ] **PERF-1** — Add CSV import file size / row limit guard in `import/portfolio/route.ts` — *(server availability)*
- [ ] **PERF-2** — Run Lighthouse/CWV; fix MockupFrame CLS if still failing thresholds — *(conversion-critical hero)*
- [ ] **PERF-3** — Merge Prisma queries in `GET /api/properties/[id]/mortgage/route.ts` — *(small latency win)*

**Reliability**
- [ ] **REL-2** — Sentry capture on health DB failure OR runbook documentation of UptimeRobot signal path — *(ops ergonomics)*

**Data Integrity**
- [ ] **DI-2** — Add `original loan amount` + `loan type` to portfolio CSV export — *(single-lien round-trip fidelity)*
- [ ] **DI-3** — Add escrow-basis note to `portfolio-csv-export.md` — *(docs only; closes reconciliation ambiguity)*
- [ ] **DI-4** — Change unknown `loanType` to null fallback with warning in `normalizeLoanTypeFromCsv` — *(UX: import should not fail on display-metadata)*
- [ ] **DI-5** — Add `displayMode` to portfolio summary print page footer — *(printed docs need self-contained context)*
- [ ] **DI-6** — Fix stale `engineering-spec.md §6` reference in `property-metrics.ts` line 3 — *(1-line comment fix)*

**Growth**
- [ ] **GRW-3** — Add `landing_variant` to `user_signed_up` PostHog event, or document session-funnel workaround — *(High for GTM; blocks cohort attribution as more CTA surfaces ship)*
- [ ] **GRW-4** — Instrument investment-property-calculator "See plans" with `FunnelCtaLink` — *(closes last instrumentation gap on the calculator surface)*

**SEO**
- [x] **SEO-2** — Change `operatingSystem: "Web"` → `"Web Browser"` in `layout.tsx` JSON-LD — *(done 2026-04-04)*
- [ ] **SEO-3** — Add `/lp/` and `/refinance` to `robots.ts` disallow — *(consistency with existing pattern)*
- [ ] **SEO-5** — Align `/vs` page title with H1 intent — *(snippet quality on compare pages)*
- [ ] **SEO-6** — Use accurate static dates for infrequently-changed pages in `sitemap.ts` — *(crawl budget quality)*

**Security**
- [ ] **SEC-1** — Document OAuth/passwordless deletion path in `docs/security/security-notes.md` + align settings copy — *(user control clarity)*
- [ ] **SEC-2** — Add `npm audit` / SCA step to CI or ops calendar — *(supply chain hygiene)*
- [ ] **SEC-3** — Add secret/key rotation subsection to `docs/runbooks/incident-response.md` — *(runbook completeness)*

**Math**
- [x] **MATH-1** — Update `math-logic-audit.md §2.1` for 3-tier `getEffectiveBalance` model — *(done 2026-04-04)*
- [ ] **MATH-2** — Add JSDoc to `PropertyMetrics.capRate` re: unscaled NOI — *(consumer confusion prevention)*
- [ ] **MATH-3** — Add `isFinite` NaN guard in `generateAmortizationSchedule` / `getPayoffProjection` — *(defensive hardening)*
- [ ] **MATH-4** — Guard `getPayoffYearsWithExtra` against `0` return for near-zero months — *(edge case, 1-line fix)*

**Business / Code**
- [ ] **BIZ-1** — Plan investor PDF output (Gap #1): scope + constraints doc in `tasks.md` — *(strategic gap; no competitor has this)*
- [ ] **BIZ-2** — Extract `formatMoneySigned` to `lib/format-currency.ts`; import from both refinance files — *(first-day architecture debt on freshly shipped code)*
- [ ] **BIZ-3** — Extract `buildCurrentLoanBalances` / `buildRefiBalances` to `lib/amortization.ts` + unit tests — *(untested calculation logic in a component)*

**Documentation**
- [ ] **DOC-4** — Repair archive broken links (`benchmarking-proposal.md`, `paid-ads-readouts/README.md`, `add-property-experience-overhaul.md`) — *(doc hygiene)*
- [ ] **DOC-5** — Refresh `docs/tasks.md` roadmap "last reviewed" — *(PM signal*)*
- [ ] **DOC-6** — Rewrite/archive `2026-04-03-landing-mobile-cta-plan.md` Item 4 — *(stale acceptance criteria)*

**Governance**
- [x] **GOV-1** — Add `product-marketing-context.md` reference to `builder-agent.mdc` — *(done 2026-04-04)*
- [ ] **GOV-2** — Resolve audit execution model inconsistency (in-thread vs Task subagent) — *(process clarity)*
- [ ] **GOV-3** — Reconcile `command-integrity-check.md` lane rename list — *(single source of truth)*

**Legal**
- [ ] **LEG-1** — Add educational disclaimer to `tools/str-vs-ltr/page.tsx` — *(matches BRRRR pattern; brief copy addition)*
- [ ] **LEG-2** — Audit `fix-and-flip/page.tsx` + `investment-property-calculator/page.tsx` for disclaimer gap; add if missing — *(consistency across all public calculator surfaces)*

### Optional / backlog

- [ ] **UX-10** — Consolidate duplicate FAQ on `pricing/page.tsx` — *(carry-forward; medium effort, low urgency)*
- [ ] **UX-11** — Add `duration-150` to onboarding panel CTA transition — *(micro-polish, carry-forward)*
- [ ] **UX-12** — Implement `.cta-glow` utility in `globals.css` — *(spec/code divergence; low impact)*
- [ ] **BIZ-4** — Split `refinance-workspace.tsx` chart section into `<RefinanceBalanceChart>` — *(readability refactor; 744-line file)*
- [ ] **REL-3** — Add root `app/app/error.tsx` or document public-route boundary in runbook — *(minor UX on rare public-route errors)*
- [ ] **REL-4** — Append `gitSha` to health endpoint JSON — *(ops ergonomics only)*
- [ ] **SEC-4** — Register `billing:subscription-details` / `billing:status` in `RATE_LIMITS` — *(forward hygiene; routes are low-risk today)*
- [ ] **SEO-7** — Upgrade `/pricing` page title to keyword-rich variant — *(optional copy change)*
- [ ] **SEO-8** — Add `/pricing` to footer — *(minor discoverability)*
- [ ] **GRW-5** — Phase A interactive demo embed — *(roadmap item; requires experiment setup and PM commitment)*
- [ ] **GRW-6** — Add deal-analysis branch to `OnboardingPanel` — *(requires PM product decision on primary activation KPI)*

### Human-only / deferred

- [ ] **MOB-6** — Full viewport matrix (320–768px) + real iOS/Android device test on all §5 routes — *(requires browser + physical device; AI cannot substitute)*
- [ ] **SEO-4** — Verify `NEXT_PUBLIC_APP_URL` in Vercel production settings matches live canonical origin — *(production ops access required; add to deploy checklist if not already there)*
- [ ] **PERF-4** — Document PDF export performance constraints in task spec before implementation begins — *(prerequisite for scheduling BIZ-1 implementation)*
- [ ] **BIZ-5** — LLC formation, Stripe entity alignment, Terms/Privacy entity update — *(legal and business decisions; no code)*
- [ ] **LEG-4** — Governing law, venue, and dispute resolution clauses for `terms/page.tsx` — *(requires qualified legal counsel)*
- [ ] **LEG-5** — State auto-renewal / subscription disclosure validation before multi-state paid scale — *(requires qualified legal counsel)*

---

## PM review

### Summary counts

*After 2026-04-04 implementation batch: 11 consolidated items closed or partially closed (SEO-1/2, MOB-1/3/4, UX-4, GOV-1, MATH-1, DOC-5, plus REL-1 code path; DI-1 was already closed).*

| Bucket | Count |
|--------|-------|
| Ship (next window) — open items | 9 |
| Ship — completed this batch (see § Ship) | 4 |
| Schedule (next batch) — open items | 38 *(44 minus 6 marked done in § Schedule)* |
| Optional / backlog | 11 |
| Human-only / deferred | 6 |
| **Total consolidated task IDs** | **73** *(11 closed or partially addressed in consolidated list above)* |

### Deduplication log

| Merged sources | Consolidated task |
|----------------|-------------------|
| Performance (Medium) + Feature/UX (Medium, carried) + Mobile (P3) — MockupFrame CLS | **PERF-2** |
| Growth (High) + Business (Medium) + Legal (Low) — pricing mobile accordion | **GRW-1** |
| Feature/UX (Medium) + Growth (Medium) — "60 seconds vs 2 minutes" timing copy | **UX-3** |
| Security (Low) + Reliability (Low) — runbook secret rotation | **SEC-3** |
| Code (Medium) + Feature/UX (High) — `border-border/70`/`bg-card/95` sweep | **UX-4** (decision) + **UX-5** (sweep, blocked by UX-4) |
| Mobile (P2, carried) + Feature/UX (Medium) — drawer focus return | **MOB-2** |
| Business (High) + Code (Medium) — `formatMoneySigned` extraction | **BIZ-2** |
| Data Integrity (Low, carried from math series) + Math (implicit) — stale `engineering-spec.md §6` comment | **DI-6** |
| SEO (High H1) + Agent Governance (Low L2) — stale `.agents/product-marketing-context.md` URLs | **SEO-1** (fix + update in same PR) |
| Business (High) + Performance (Low) — PDF export planning | **BIZ-1** + **PERF-4** (separate: BIZ-1 is the planning task; PERF-4 is the constraints doc prerequisite) |

### Top 5 highest-leverage actions (before next implementation batch)

*Supersedes pre-batch list — SEO-1, UX-4, and REL-1 Sentry wiring shipped 2026-04-04.*

1. **GRW-1 + GRW-2** — Close the two Growth High gaps: pricing mobile accordion + competitor CTA `planIntent` / `?intent=free`. Straightforward markup with conversion and attribution impact.
2. **MOB-2** — Return focus to hamburger button on drawer close (`app-layout-client.tsx`) — WCAG §2.4.3 navigation a11y.
3. **UX-1** — ARIA tab semantics on `property-detail-tabs.tsx` — primary content navigation.
4. **REL-1** (remainder) — PostHog analytics outage subsection in `docs/runbooks/incident-response.md` (Sentry path already wired).
5. **DOC-1 / DOC-2 / DOC-3** — Documentation hub hierarchy, broken plan footers, and `full-audit-synthesis.md` tasks link — unblock PM and contributor workflows.

Review triage above. Promote **Ship** and **Schedule** items to [docs/tasks.md](../tasks.md) unless explicitly deferred. The builder implements approved items.
