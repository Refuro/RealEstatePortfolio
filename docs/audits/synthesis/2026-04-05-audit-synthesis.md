# Full Audit Synthesis — 2026-04-05

> **Run:** 14 lanes, 7+7 parallel agents. All reports written and verified before synthesis.  
> **Synthesis method:** `docs/process/full-audit-synthesis.md`

---

## Audits included

- Code (`docs/audits/code/2026-04-05-code-audit.md`)
- Math & Logic (`docs/audits/math/2026-04-05-math-logic-audit.md`)
- Feature / UX / IA (`docs/audits/feature/2026-04-05-feature-ux-audit.md`)
- Mobile experience (`docs/audits/feature/2026-04-05-mobile-experience-audit.md`)
- Security & Privacy (`docs/audits/security/2026-04-05-security-audit.md`)
- Performance & Cost (`docs/audits/performance-cost/2026-04-05-performance-cost-audit.md`)
- Reliability & Operations (`docs/audits/reliability-ops/2026-04-05-reliability-ops-audit.md`)
- Data Integrity & Reconciliation (`docs/audits/data-integrity/2026-04-05-data-integrity-audit.md`)
- Business & Valuation (`docs/audits/business/2026-04-05-business-valuation-audit.md`)
- Growth Funnel & Activation (`docs/audits/growth-funnel/2026-04-05-growth-funnel-audit.md`)
- SEO (search & discovery) (`docs/audits/seo/2026-04-05-seo-audit.md`)
- Documentation (`docs/audits/documentation/2026-04-05-documentation-audit.md`)
- Legal & Compliance (`docs/audits/legal-compliance/2026-04-05-legal-compliance-audit.md`)
- AI Agent Governance (`docs/audits/agent-governance/2026-04-05-agent-governance-audit.md`)

---

## Consolidated task list

Tasks are deduplicated across lanes. Source lane shown in `[brackets]`.

### Security

- [ ] **SEC-SHIP-1:** Add `/api/unsubscribe` AND `/api/cron/onboarding-emails` to `isPublicRoute` in `app/proxy.ts` — both are auth-free by design and currently silently 401 for unauthenticated callers, breaking email unsubscribes and Vercel Cron entirely `[Code, Security]`
- [ ] **SEC-SHIP-2:** Wrap Stripe billing webhook switch block in outer try/catch + `Sentry.captureException` — unhandled DB errors during subscription events produce silent 500s; Stripe retries for up to 72h with no operator signal `[Reliability]`
- [ ] **SEC-SHIP-3:** Add try/catch + Sentry capture to all unguarded GET read routes: `/api/properties`, `/api/properties/[id]`, `/api/deals`, `/api/portfolio/summary`, `/api/onboarding` (GET + PATCH), `/api/export/portfolio`, `/api/export/portfolio-summary` `[Reliability]`
- [ ] **SEC-SCHED-1:** Use rightmost (or `X-Real-IP`) trusted hop instead of leftmost `X-Forwarded-For` for IP-based rate limiting in `lib/rate-limit.ts` and `api/contact/route.ts` — leftmost value is client-spoofable `[Security]`
- [ ] **SEC-SCHED-2:** Add `Strict-Transport-Security` header to `next.config.ts` `securityHeaders` array — start `max-age=300` in staging, promote to 2-year value `[Security]`
- [ ] **SEC-SCHED-3:** Add `CRON_SECRET` to startup env validation in `lib/env.ts` (alongside `STRIPE_SECRET_KEY` etc.) — currently only caught at first cron execution as a 500 with no Sentry `[Security, Reliability]`
- [ ] **SEC-SCHED-4:** Reject CSV import files above ~512 KB in `api/import/portfolio/route.ts` before `file.text()` — no per-request bound; rate-limited but not per-upload bounded `[Security, Performance, Reliability]`
- [ ] **SEC-SCHED-5:** Add rate limits (`places:autocomplete`, `places:details`) to `RATE_LIMITS` in `lib/rate-limit.ts` and wire `checkRateLimit`/`recordRateLimit` in both routes — currently unbounded Google Places API calls per authenticated user `[Code]`
- [ ] **SEC-SCHED-6:** Enable CSP enforcement — set `CSP_ENFORCEMENT=true` in Vercel Production after triaging Report-Only violations in Sentry `[Security]`
- [ ] **SEC-OPT-1:** Add structured audit log line to `api/account/restore/route.ts` — all other sensitive account actions log; restore does not `[Security]`
- [ ] **SEC-OPT-2:** Replace hardcoded `https://veldportfolio.com` in `api/unsubscribe/route.ts` (line 67) with `getAppOrigin()` `[Code]`

### UX / Feature

- [ ] **UX-SHIP-1:** Replace permanent onboarding "Maybe later" dismissal with time-based cooldown — `onboardingDismissedAt` currently makes the modal disappear forever; re-show after N days if `propertyCount === 0`. Affects `onboarding-panel.tsx` + `/api/onboarding` + `dashboard/page.tsx` `[Feature, Growth]`
- [ ] **UX-SHIP-2:** Import and render `quick-actions.tsx` on property detail overview — component fully implemented (Edit, Add mortgage, Refresh benchmark) but not imported anywhere; post-quick-add users see "—" metrics with no nudge to complete `[Feature]`
- [ ] **UX-SHIP-3:** Widen `getPropertyCompleteness` heuristic to flag missing bedrooms/bathrooms/sqft — current logic fires banner only when all three conditions are true simultaneously; add "Not set" placeholders for null fields rather than hiding the row `[Feature, Data-Integrity]`
- [ ] **UX-SCHED-1:** Add ARIA tab semantics to `property-detail-tabs.tsx` — `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`; WCAG 2.1 §4.1.2; ~10-line fix `[Feature]`
- [ ] **UX-SCHED-2:** Add `aria-label="Sort deals"` to `<select>` in `deals-list.tsx` line 92 — unlabeled form control; WCAG §1.3.1 `[Feature]`
- [ ] **UX-SCHED-3:** Replace "CoC return" with "Cash-on-cash return" in `deals-list.tsx` line 170 — terminology drift vs. portfolio and analyzer surfaces `[Feature]`
- [ ] **UX-SCHED-4:** Add copy context explaining Quick Add vs. full form on `properties/page.tsx` (lines 281–293) — users choose blindly between modes `[Feature]`
- [ ] **UX-SCHED-5:** Extend dashboard empty-state copy timeline beyond Day 6 — add Day 14+ variation that mentions quick-add and CSV import as low-friction paths `[Feature, Growth]`
- [ ] **UX-OPT-1:** Standardize "Print summary" / "Print portfolio summary" label — `dashboard/page.tsx` line 246 vs. `workspace-nav-mobile.tsx` line 42 `[Feature]`
- [ ] **UX-OPT-2:** Add `min-h-[44px]` to deal card "Add to portfolio" and "Delete" buttons (`deals-list.tsx` lines 190, 215) `[Feature]`
- [ ] **UX-OPT-3:** Resolve `border-border/70` / `bg-card/95` token policy — read `design-spec-2026.md §15.2`, confirm accept or deprecate, then migrate dashboard activation banner and `new/page.tsx` deal-conversion banner if deprecated `[Feature]`
- [ ] **UX-OPT-4:** MockupFrame CLS — add `min-height`/`aspect-ratio` for SSR-stable container in `components/mockups/mockup-frame.tsx` `[Feature, Mobile]`

### Mobile experience

- [ ] **MOB-SHIP-1:** Add `aria-expanded={open}` + `aria-controls` to `MobileCollapsible` toggle button (`mobile-collapsible.tsx` lines 26–35) — affects all tool surfaces app-wide; WCAG 4.1.2 `[Mobile]`
- [ ] **MOB-SCHED-1:** Return focus to hamburger trigger on drawer close in `app-layout-client.tsx` — `closeDrawer` does not call `focus()` on the hamburger button; WCAG 2.4.3; mirrors `LandingNav` pattern `[Mobile]`
- [ ] **MOB-SCHED-2:** Add `max-w-[180px]` mobile variant to Refinance Workspace chart tooltip in `refinance-workspace.tsx` lines 500–515 — can overflow viewport at 320–375px `[Mobile]`
- [ ] **MOB-SCHED-3:** Raise "Open Modeling" and "Open Mortgage" links on `properties/page.tsx` (lines 503, 601) and dashboard quick-action links to `min-h-[44px]` — currently ~32px `[Mobile]`
- [ ] **MOB-OPT-1:** Add `min-h-[44px]` to `MobileModeSwitcher` and `MobileSegmentedView` buttons proactively before those components are used in production `[Mobile]`
- [ ] **MOB-HUMAN-1:** Execute full viewport matrix (320, 375, 390, 430, 767/768px) + real iOS/Android device (safe-area, native `<select>`, keyboard, VoiceOver) `[Mobile]`

### Performance

- [ ] **PERF-SHIP-1:** Add scheduled cleanup of `ApiRateLimitEntry` rows older than 1 hour — table grows unboundedly; 2 extra DB round-trips per write path (7 total on property create) `[Performance]`
- [ ] **PERF-SHIP-2:** Remove wasted `<link rel="preconnect" href="https://api.rentcast.io" />` from `app/app/layout.tsx` — RentCast is server-side only; browser never connects; costs 30–100ms TLS overhead per page load `[Performance]`
- [ ] **PERF-SCHED-1:** Split `add-property-wizard.tsx` step sections into lazy-loaded chunks — 2,865-line monolithic client component; steps 2–4 parsed eagerly on `/properties/new`; target <40% bundle for step 1 `[Performance, Code]`
- [ ] **PERF-SCHED-2:** Consolidate duplicate mortgage/rent calculations in `properties/page.tsx` — `totalMortgageBalance`, `totalMonthlyPayment`, `getPropertyTotalRent` computed 2–3× per property in separate map passes `[Performance, Code]`
- [ ] **PERF-SCHED-3:** Consolidate `computePropertyMetrics` from 2 separate map loops to 1 per property in `dashboard/page.tsx` `[Performance, Code]`
- [ ] **PERF-SCHED-4:** Evaluate skipping `/api/billing/sync` Stripe live call when local DB `subscriptionTier === "free"` and no active `Subscription` row — fires on every cold start for partially-converted users `[Performance]`
- [ ] **PERF-OPT-1:** Move `parseCurrencyNum` from `add-property-wizard.tsx` and `property-form.tsx` to `lib/format-currency.ts` `[Code]`
- [ ] **PERF-OPT-2:** Remove duplicate `WizardData` type from `add-property-wizard.tsx`; import from `draft-context.tsx` `[Code]`
- [ ] **PERF-OPT-3:** Add `Cache-Control: private, max-age=30, stale-while-revalidate=60` to read-only API responses (`/api/properties`, `/api/portfolio/summary`, etc.) `[Performance]`

### Reliability

- [ ] **REL-SHIP-1:** Add try/catch + Sentry capture to CSV import `prisma.$transaction` in `api/import/portfolio/route.ts` `[Reliability]`
- [ ] **REL-SHIP-2:** Add try/catch around final `prisma.$transaction` in `api/account/delete/route.ts` — currently unguarded; Stripe cancel already has guard but the DB step does not `[Reliability, Data-Integrity]`
- [ ] **REL-SCHED-1:** Add `npx tsc --noEmit` (or `npm run build`) step to `.github/workflows/ci.yml` — TypeScript errors and build-time env assertions currently only caught at Vercel deploy `[Reliability]`
- [ ] **REL-SCHED-2:** Add `connection_limit` to Prisma `DATABASE_URL` / `PrismaPg` adapter config in `lib/db.ts` — no limit set; free-tier DB (10–25 max connections) can be exhausted under burst traffic `[Reliability]`
- [ ] **REL-SCHED-3:** Add migration rollback procedure to `docs/runbooks/incident-response.md` — `20260406120000_completeness_overhaul` drops `unitMix` with no documented rollback; Vercel-level rollback + missing column = error until manual patch `[Reliability]`
- [ ] **REL-SCHED-4:** Add RentCast, Resend, and Google Places degradation runbook entries to `incident-response.md` — graceful-degradation code exists but no operator procedure for detection or recovery `[Reliability]`
- [ ] **REL-OPT-1:** Batch the `prisma.user.update` sentinel-field writes in `api/cron/onboarding-emails/route.ts` — serial per-user DB writes could be batched with `updateMany` `[Code]`
- [ ] **REL-OPT-2:** Map motion tokens (`--duration-*`, `--ease-*`) in `globals.css` `@theme inline` block — defined as CSS vars but not exposed as Tailwind utilities `[Code]`

### Data Integrity

- [ ] **DI-SHIP-1:** CSV import: after mortgage creation in transaction, set `property.hasMortgage = true` via `tx.property.update` in `api/import/portfolio/route.ts` — imported properties with mortgage data show `hasMortgage = null` in completeness scoring `[Data-Integrity]`
- [ ] **DI-SHIP-2:** Mortgage DELETE: after deleting mortgage, count remaining mortgages and update `Property.hasMortgage` to `true` (any remain) or `false` (none remain) in `api/properties/[id]/mortgage/[mortgageId]/route.ts` `[Data-Integrity]`
- [ ] **DI-SHIP-3:** `api/account/delete-permanent/route.ts` — return HTTP 503 on Stripe subscription cancel failure instead of swallowing the error (active Stripe subscription left billing with no associated user) `[Data-Integrity, Security]`
- [ ] **DI-SCHED-1:** Schema migration — add `@unique` to `User.email`; add `onDelete: SetNull` relation on `RentCastApiCall.propertyId`; consider `Subscription.status` enum `[Data-Integrity]`
- [ ] **DI-SCHED-2:** `20260406` migration backfill — add step to set `hasMortgage = false` for properties with no mortgage rows (current backfill only sets `true`) `[Data-Integrity]`
- [ ] **DI-SCHED-3:** Export CSV — append truncation comment/metadata row when `truncated = true` so users opening in Excel see the warning inline `[Data-Integrity]`
- [ ] **DI-SCHED-4:** Deal PATCH validation — add cross-field Zod check: if `totalMortgageBalance > 0`, then `totalMonthlyPayment > 0` `[Data-Integrity]`
- [ ] **DI-SCHED-5:** Add inline comment at `capRate` line in `property-metrics.ts` explaining formula equivalence to ownership-metrics policy — prevents future refactor breaking partial-ownership cap rate silently `[Data-Integrity, Math]`
- [ ] **DI-OPT-1:** Update `seed.ts` `currentPeriodEnd` to future date (e.g. 1 year from seed run) — currently set to 2025-04-01 and 2025-06-01; dev accounts appear expired `[Data-Integrity]`
- [ ] **DI-OPT-2:** Import mortgage validation — add check `originalLoanAmount >= mortgageBalance` when both are provided in CSV row `[Data-Integrity]`

### Growth

- [ ] **GRW-SHIP-1:** Add real social proof to landing page social-proof strip (`app/page.tsx` lines 314–352) — replace product-feature bullets with user count, testimonial, or community evidence; highest-ROI single change for cold-traffic conversion `[Growth]`
- [ ] **GRW-SHIP-2:** Correct "60 seconds" setup claim on landing page and pricing cards — replace with accurate quick-add framing ("takes about 2 minutes with just address, rent, and value") `[Growth]`
- [ ] **GRW-SCHED-1:** Add `FunnelCtaLink` or `captureClientEvent` to dashboard empty-state CTA and secondary action cards (`dashboard/page.tsx` lines 126–155) — highest-visibility activation touch point currently produces no analytics signal `[Growth]`
- [ ] **GRW-SCHED-2:** Add current step number to `WIZARD_ABANDONED` event in `draft-context.tsx` — one property addition to existing event; enables step-level drop-off analysis `[Growth]`
- [ ] **GRW-SCHED-3:** Append UTM params (`utm_source=email&utm_medium=onboarding&utm_campaign=day3`) to re-engagement email CTAs in `lib/emails/onboarding-reengagement.ts` `[Growth, Business]`
- [ ] **GRW-SCHED-4 (GRW-1):** Add "Estimate pool (per hour)" row to pricing mobile `<details>` accordion (`pricing/page.tsx` ~line 188) — desktop table has 8 rows; mobile has 7; per-hour pool is a paid-tier differentiator `[Growth, Business, Legal]`
- [ ] **GRW-SCHED-5 (GRW-2):** Add `planIntent="free"` and `?intent=free` to competitor/alternative page CTAs in `competitor-alternative-page.tsx` — hero, table, and footer placements all missing `[Growth, Business]`
- [ ] **GRW-SCHED-6 (GRW-3):** Add `landing_variant` to `user_signed_up` event in `posthog-signup-once.tsx` — attribution worsens as rollout adds more entry surfaces (email, quick-add, dashboard CTA) `[Growth, Business]`
- [ ] **GRW-SCHED-7:** Upgrade billing success page to activation nudge — replace flat confirmation with celebration + plan-specific "Add your first property now" CTA in `app/(app)/billing/success/page.tsx` `[Growth]`
- [ ] **GRW-SCHED-8:** Wrap sign-up page Clerk form in split-panel layout — left: 3 feature bullets + dashboard mockup; right: form — one component change to `sign-up-view.tsx` `[Growth]`
- [ ] **GRW-OPT-1:** Add HTML email template with branded layout to re-engagement emails (`lib/emails/onboarding-reengagement.ts`) — currently plain-text only `[Growth]`
- [ ] **GRW-OPT-2:** Add sign-up CTA above the fold on mobile pricing page — currently CTA section is below FAQ and comparison table `[Growth]`
- [ ] **GRW-OPT-3:** Add cron monitoring spec before Phase 2 ships — Sentry alert on cron handler errors; PostHog check on `onboarding_email_sent` volume in 24h window `[Business, Growth]`

### SEO

- [ ] **SEO-SHIP-1:** Add page-level `openGraph.images` and `twitter.images` to `/pricing`, `/tools`, `/investment-property-calculator`, `/tools/brrr`, `/tools/str-vs-ltr`, `/tools/fix-and-flip` — all public pages currently inherit one shared generic OG image `[SEO]`
- [ ] **SEO-SCHED-1:** Make `sitemap.ts` alternatives and vs blocks dynamic — replace hardcoded slug arrays with `Object.keys(COMPETITOR_ALTERNATIVES/VS).map(...)` mirroring the resources pattern `[SEO]`
- [ ] **SEO-SCHED-2:** Add `FAQPage` JSON-LD to `pricing/page.tsx` covering the 4 Q&A items (lines 222–249) — highest-commercial-intent page with no structured data `[SEO]`
- [ ] **SEO-SCHED-3:** Fix `/vs` hub `metadata.title` from "Compare" to a keyword-targeted string (e.g. "Veld vs Spreadsheets — Rental Portfolio Tracker Comparison") — H1 and title currently inconsistent `[SEO]`
- [ ] **SEO-SCHED-4:** Add `BreadcrumbList` JSON-LD component to `/tools/brrr`, `/tools/str-vs-ltr`, `/tools/fix-and-flip` — visible breadcrumb nav has no machine-readable schema `[SEO]`
- [ ] **SEO-SCHED-5:** Add `/lp/` to `disallow` in `robots.ts` — LP variant correctly noindexes but wastes crawl budget without a robots-level block `[SEO]`
- [ ] **SEO-SCHED-6:** Replace `new Date()` `lastModified` values in `sitemap.ts` with stable static date constants per content type — dynamic timestamps mislead crawl prioritization `[SEO]`
- [ ] **SEO-OPT-1:** Improve `/resources` meta title to include keyword phrase (e.g. "Real Estate Investing Resources — Calculators & Guides") `[SEO]`
- [ ] **SEO-OPT-2:** Improve `/pricing` meta title to include product differentiator (e.g. "Pricing — Rental Portfolio Analytics") `[SEO]`
- [ ] **SEO-OPT-3:** Shorten `/alternatives/page.tsx` title to avoid ~67-char truncation and brand duplication `[SEO]`
- [ ] **SEO-OPT-4:** Standardize trailing-slash policy for canonicals — home uses `APP_URL + "/"`, all others do not `[SEO]`
- [ ] **SEO-HUMAN-1:** Confirm Google Search Console property claimed and sitemap submitted at `{APP_URL}/sitemap.xml`; document in `docs/ops/search-console.md` `[SEO]`

### Governance

- [ ] **GOV-SCHED-1:** Update `builder-agent.mdc` and `pm-agent.mdc` to cite `docs/design/design-spec-2026.md` (v3.1) as primary UI authority — current rules point to `docs/policies/design-spec.md` (v2.0, self-described as secondary) `[Agent-Governance]`
- [ ] **GOV-SCHED-2:** Update `.cursor/hooks.json` `subagentStop.command` to `.cursor/hooks/on-subagent-stop.ps1` for this Windows workspace — bash `.sh` hook may fail silently, breaking PM review loop `[Agent-Governance]`
- [ ] **GOV-SCHED-3:** Align audit execution model docs — update `docs/audits/README.md` § Running audits and `docs/process/agent-governance-audit-process.md` §4 to confirm Task-subagent with read-only off is the per-lane default `[Agent-Governance]`
- [ ] **GOV-OPT-1:** Document `app/.agents/skills/` (7 domain skill directories) in `docs/cursor-agent-setup.md` — none referenced in builder rule or setup docs; unclear governance contract `[Agent-Governance]`
- [ ] **GOV-OPT-2:** Add freeform/discovery audit category to `docs/audits/README.md` — 3 root-level analysis files (`polish-gap-audit`, `quick-add-completion-gap-audit`, `onboarding-friction-analysis`) exist outside lane subfolders with no placement policy `[Agent-Governance, Documentation]`
- [ ] **GOV-OPT-3:** Reconcile `command-integrity-check.md` lane rename list (5 items) with `docs/audits/README.md` (6 items) — lane-level READMEs are omitted from the checklist `[Agent-Governance]`

### Math

- [ ] **MATH-SCHED-1:** Document or fix DSCR NOI-scaling asymmetry in `computePortfolioMetrics` — in `full_liability` mode, NOI is ownership-scaled but debt service is not; add clarifying comment or fix before partial-ownership properties are surfaced in production `[Math]`
- [ ] **MATH-OPT-1:** Add JSDoc to `PropertyMetrics.capRate`: "Full-property metric; uses unscaled NOI / full estimatedValue; not proportional to ownershipPercent" `[Math]`
- [ ] **MATH-OPT-2:** Add JSDoc to `getPayoffYearsWithExtra`: "Returns 0 for payoffs < 6 months away (Math.round); callers should render as '< 1 year'" `[Math]`

### Business

- [ ] **BIZ-SHIP-1:** Write completeness policy doc (`docs/policies/property-completeness.md`) before "Complete your property" prompt (R16) ships — no policy governs which fields are required vs optional; same class of spec/code drift the math policy docs prevent `[Business]`
- [ ] **BIZ-SCHED-1:** Plan investor PDF output (Gap #1) — scope and add to `docs/tasks.md`; extends `/export/portfolio-summary`; gate to Investor/Pro; highest switching-cost addition available `[Business]`
- [ ] **BIZ-HUMAN-1:** LLC formation, Stripe entity alignment, Terms/Privacy entity copy update — deadline: before first paying subscriber `[Business]`
- [ ] **BIZ-HUMAN-2:** Confirm re-engagement emails qualify as transactional under GDPR/CAN-SPAM with counsel before cron goes live `[Business, Legal]`

### Documentation

- [ ] **DOC-SCHED-1:** Relocate 3 root-level audit files into correct lane subfolders — `2026-04-04-polish-gap-audit.md` → `docs/audits/feature/`; `2026-04-05-quick-add-completion-gap-audit.md` → `docs/audits/feature/`; `2026-04-05-onboarding-friction-analysis.md` → `docs/audits/feature/` or `growth-funnel/`; update plan frontmatter `audit:` keys `[Documentation]`
- [ ] **DOC-SCHED-2:** Resolve dangling `research:` reference in `docs/plans/2026-04-05-edit-page-completion-guidance.md` — `docs/research/2026-04-05-edit-page-completion-ux.md` does not exist; create, rename, or remove `[Documentation]`
- [ ] **DOC-SCHED-3 (DOC-1):** Update `docs/README.md` Reference block — elevate `design/design-spec-2026.md` as primary design source; adjust `policies/design-spec.md` line *(carried from 2026-04-04 Ship tier)* `[Documentation]`
- [ ] **DOC-SCHED-4 (DOC-2):** Fix broken `docs/...` relative links in `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` and `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` *(carried from 2026-04-04 Ship tier)* `[Documentation]`
- [ ] **DOC-SCHED-5 (DOC-3):** Fix `tasks.md` link depth in `docs/process/full-audit-synthesis.md §4` embedded template: `[docs/tasks.md](../../tasks.md)` → `[docs/tasks.md](../tasks.md)` *(carried from 2026-04-04 Ship tier)* `[Documentation]`
- [ ] **DOC-OPT-1:** Update `docs/README.md` "Latest audit synthesis" quick link to point to `2026-04-04-audit-synthesis.md` `[Documentation]`
- [ ] **DOC-OPT-2:** Add hub entries for new directories: `docs/research/`, `docs/test-plans/`, `docs/decisions/`, `docs/prompts/` `[Documentation]`
- [ ] **DOC-OPT-3:** Create `docs/plans/README.md` — 6 active plan files with no index `[Documentation]`
- [ ] **DOC-OPT-4:** Add unlisted files to `docs/README.md` — `api-list-contract.md` (Internal), `calculator-metric-tones.md` (Policies), `portfolio-csv-export.md` + `rentcast-quota.md` (Reference), 7 unlisted `docs/design/` phase guides `[Documentation]`
- [ ] **DOC-OPT-5:** Add note to `docs/process/documentation-audit-process.md` clarifying that ad-hoc targeted audits must use lane subfolders, not `docs/audits/` root `[Documentation]`
- [ ] **DOC-OPT-6:** Add `docs/tasks-archived.md` link to `docs/README.md` Tasks section `[Documentation]`

### Legal / Compliance

- [ ] **LEG-SHIP-1:** Add "Numbers are educational — confirm with your lender" disclaimer to refinance What-If output block in `app/(app)/properties/[id]/payoff-card.tsx` — live authenticated feature computing financial projections with no caveat; BRRRR and fix-and-flip already apply this pattern `[Legal]`
- [ ] **LEG-SCHED-1:** Add inline educational disclaimer to STR vs LTR (`tools/str-vs-ltr/page.tsx`) and investment property calculator (`investment-property-calculator/page.tsx`) — only BRRRR and fix-and-flip currently covered `[Legal]`
- [ ] **LEG-OPT-1:** Align "Last updated" format between Privacy ("March 31, 2026") and Terms ("March 2026") on next policy revision `[Legal]`
- [ ] **LEG-HUMAN-1:** Engage counsel to draft governing law, venue, and dispute resolution clauses for `terms/page.tsx` — carried 5 consecutive audits; risk grows with each paying subscriber `[Legal]`
- [ ] **LEG-HUMAN-2:** Validate auto-renewal and cancellation disclosures against applicable US state laws before multi-state paid scale `[Legal]`
- [ ] **LEG-HUMAN-3:** Reassess Privacy "US-focused" positioning and onboarding email consent mechanics before any EU/EEA/UK paid acquisition `[Legal]`

---

## PM triage (2026-04-05 run)

### Ship (next window)

_Unresolved Critical/High across lanes + Medium with clear security, data-integrity, or activation risk. Address before next deployment or implementation batch._

**Security (fix immediately):**
- [ ] SEC-SHIP-1 — Add `/api/unsubscribe` + `/api/cron/onboarding-emails` to `proxy.ts` isPublicRoute *(one-liner; unsubscribes broken, cron silent; CAN-SPAM risk)*
- [ ] SEC-SHIP-2 — Wrap Stripe webhook in try/catch + Sentry *(subscription state can be stale for 72h with no signal)*
- [ ] SEC-SHIP-3 — try/catch + Sentry on all unguarded read routes *(dashboard/properties 500s during DB hiccup are invisible to operators)*

**Activation (blocking funnel):**
- [ ] UX-SHIP-1 — Replace "Maybe later" permanent dismissal with time-based cooldown *(0/6 users activated; this is the primary exit path)*
- [ ] UX-SHIP-2 — Import and render `quick-actions.tsx` on property detail *(finished component, zero imports; post-quick-add has no completion nudge)*
- [ ] UX-SHIP-3 — Widen completeness heuristic + add field placeholders *(quick-add users see "—" metrics with no path to fix them)*
- [ ] GRW-SHIP-1 — Add real social proof to landing page *(no testimonials, counts, or third-party credibility; cold-traffic primary blocker)*
- [ ] GRW-SHIP-2 — Correct "60 seconds" copy *(wizard takes 5–15 minutes; trust damage at highest-engagement moment)*

**Data integrity (silent bugs):**
- [ ] DI-SHIP-1 — CSV import: set `hasMortgage = true` after mortgage creation *(imported properties show false completeness gaps)*
- [ ] DI-SHIP-2 — Mortgage DELETE: update `hasMortgage` *(last-mortgage delete leaves `hasMortgage = true` permanently)*
- [ ] DI-SHIP-3 — `delete-permanent`: return 503 on Stripe cancel failure *(active subscription left billing user with no associated account)*

**Performance (high-impact, cheap fix):**
- [ ] PERF-SHIP-1 — Cleanup `ApiRateLimitEntry` rows older than 1 hour *(unbounded table growth; extra DB calls on every write path)*
- [ ] PERF-SHIP-2 — Remove RentCast preconnect from root layout *(30–100ms wasted TLS per page load; one-line removal)*

**Legal (live feature, no disclaimer):**
- [ ] LEG-SHIP-1 — Add refinance What-If disclaimer to `payoff-card.tsx` *(live financial projections, no "educational only" caveat; one sentence)*

**Business (write policy before feature ships):**
- [ ] BIZ-SHIP-1 — Write completeness policy doc in `docs/policies/` *(R16 "Complete your property" ships in rollout Phase 1)*

---

### Schedule (next batch)

_Medium improvements with meaningful downside if deferred._

**Security:** SEC-SCHED-1 (XFF spoofing), SEC-SCHED-2 (HSTS), SEC-SCHED-3 (CRON_SECRET validation), SEC-SCHED-4 (CSV upload size limit), SEC-SCHED-5 (Places API rate limits), SEC-SCHED-6 (CSP enforcement)

**UX:** UX-SCHED-1 (tab ARIA), UX-SCHED-2 (sort select label), UX-SCHED-3 (CoC return label), UX-SCHED-4 (quick-add copy context), UX-SCHED-5 (empty-state Day 14+ copy)

**Mobile:** MOB-SHIP-1 (MobileCollapsible aria-expanded), MOB-SCHED-1 (drawer focus on close), MOB-SCHED-2 (refinance chart tooltip overflow), MOB-SCHED-3 (touch targets on properties/dashboard action links)

**Performance:** PERF-SCHED-1 (wizard lazy-split), PERF-SCHED-2 (duplicate property/dashboard computations), PERF-SCHED-3 (billing sync skip for free users), PERF-SCHED-4 (CSV size guard)

**Reliability:** REL-SHIP-1 (CSV import try/catch), REL-SHIP-2 (account delete try/catch), REL-SCHED-1 (`tsc` in CI), REL-SCHED-2 (connection_limit), REL-SCHED-3 (migration rollback runbook), REL-SCHED-4 (RentCast/Resend/Places runbook entries)

**Data:** DI-SCHED-1 (schema constraints), DI-SCHED-2 (migration backfill false), DI-SCHED-3 (export truncation CSV row), DI-SCHED-4 (deal cross-field validation), DI-SCHED-5 (capRate comment)

**Growth:** GRW-SCHED-1–8 (analytics instrumentation, pricing accordion, competitor CTAs, landing_variant, billing success nudge, sign-up split layout, UTM params, cron monitoring)

**SEO:** SEO-SHIP-1 (OG images), SEO-SCHED-1–6 (dynamic sitemap, FAQ JSON-LD, /vs title, BreadcrumbList, robots /lp/, lastModified fix)

**Governance:** GOV-SCHED-1 (design spec rule pointer), GOV-SCHED-2 (Windows hook fix), GOV-SCHED-3 (execution model docs)

**Math:** MATH-SCHED-1 (DSCR asymmetry comment/fix)

**Documentation:** DOC-SCHED-1–5 (non-lane audit files, dangling research ref, DOC-1/2/3 carried)

**Legal:** LEG-SCHED-1 (STR vs LTR + investment calculator disclaimers)

---

### Optional / backlog

_Low-impact, narrow scope, or tech-debt refactors. Leave unless there is capacity._

- Code: PERF-OPT-1/2 (parseCurrencyNum, WizardData dedup), ARCH-2 (deal-analyzer split), ARCH-6 (getActiveAppUser admin), ARCH-7 (DB aggregation admin stats), DEBT-1 (batch cron DB writes), DEBT-2 (motion token utilities), DESIGN-1 (hover:shadow-md cards), SEC-OPT-1/2 (restore audit log, hardcoded URL)
- UX: UX-OPT-1/2/3/4 (print label, deal card touch targets, token policy decision, MockupFrame CLS)
- Mobile: MOB-OPT-1 (unused component touch targets preemptive)
- Performance: PERF-OPT-3 (Cache-Control headers)
- Reliability: REL-OPT-1/2 (cron batching, motion tokens)
- Data: DI-OPT-1/2 (seed dates, import mortgage validation)
- Growth: GRW-OPT-1/2/3 (HTML email template, mobile pricing CTA, cron monitoring spec)
- SEO: SEO-OPT-1/2/3/4 (meta titles, trailing-slash standardization)
- Governance: GOV-OPT-1/2/3 (app/.agents/skills/ docs, discovery-audit category, rename checklist)
- Math: MATH-OPT-1/2 (JSDoc capRate, getPayoffYearsWithExtra)
- Business: BIZ-SCHED-1 (PDF output plan)
- Documentation: DOC-OPT-1–6 (README link updates, hub entries, plans index)
- Legal: LEG-OPT-1 (Last updated format)

---

### Human-only / deferred

_Requires legal counsel, real-device QA, or owner sign-off. AI cannot complete alone._

- **Legal:** LEG-HUMAN-1 (governing law / venue / dispute resolution — counsel), LEG-HUMAN-2 (auto-renewal disclosure review), LEG-HUMAN-3 (pre-EU GDPR/PECR assessment), BIZ-HUMAN-2 (re-engagement email transactional classification with counsel)
- **Business:** BIZ-HUMAN-1 (LLC formation, Stripe entity alignment, Terms/Privacy update — before first paying subscriber)
- **Mobile:** MOB-HUMAN-1 (full viewport matrix 320–768px + real iOS/Android device: safe-area, native select, keyboard, VoiceOver/TalkBack)
- **SEO:** SEO-HUMAN-1 (Google Search Console property claim + sitemap submission)
- **Analytics:** Verify PostHog funnel data in vendor UI after GRW-SCHED-6 lands

---

## PM review

Review triage above. Promote **Ship** and **Schedule** items to [`docs/tasks.md`](../../tasks.md) unless explicitly deferred.

**Top 5 by cross-lane impact:**

1. **SEC-SHIP-1 (proxy.ts public routes)** — Email unsubscribes broken + Vercel Cron silent failure = CAN-SPAM risk + zero onboarding emails delivered. One-line fix each. No excuse to defer.
2. **UX-SHIP-1 (onboarding dismiss)** — 6 sign-ups, 0 activations. "Maybe later" permanently ends the re-engagement path. This is the funnel bottleneck.
3. **DI-SHIP-1/2 (hasMortgage sync)** — CSV import and mortgage DELETE both silently corrupt the `hasMortgage` completeness signal, undermining the entire activation rollout's "Complete your property" feature.
4. **SEC-SHIP-2/3 (error handling)** — Stripe webhook + 7+ read routes unguarded; DB errors produce 500s with no Sentry capture. Production is operating blind on failure paths.
5. **LEG-SHIP-1 (refinance disclaimer)** — A live authenticated feature computing financial projections has no "educational only" caveat. Every other calculator in the product does. One sentence.

---

*Generated: 2026-04-05 | 14 lanes | 7+7 parallel agents | See individual reports for file citations and re-test checklists*
