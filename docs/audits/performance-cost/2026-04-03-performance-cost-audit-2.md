# Performance & Cost Audit — 2026-04-03 (Run 2)

## Executive summary

- **Embedded mockups shipped:** The three product screenshots (`ScreenDashboard.png`, `ScreenMortgage.png`, `ScreenDeal.png`) have been deleted and replaced with React mockup components (`DashboardMockup`, `MortgageMockup`, `DealAnalyzerMockup`). This eliminates 1.5 MB+ of PNG payload from marketing pages — a significant network win. No hydration errors; components are fully deterministic.
- **New CLS risk introduced:** `MockupFrame` initialises `scale` at 0 and sets the inner wrapper's height to `undefined` until `ResizeObserver` fires after mount. The outer container collapses to 0 px on the first paint (SSR and pre-hydration), then jumps to the computed height — a layout shift visible on the hero desktop, hero mobile, and pricing Dashboard mockup placements. The two `fitToHeight` pricing placements (mortgage, deal analyzer) are protected by explicit CSS height classes.
- **Morning's open Schedule items are unchanged:** Duplicate `/api/rentcast-quota` fetches from multiple `RentCastQuotaHint` mounts remain unresolved. `property-form.tsx` and `benchmark-display.tsx` each have 3 independent `RentCastQuotaHint` usages. Optional mortgage GET consolidation is also still open.
- **Recommendation:** Address the `MockupFrame` CLS risk before launch (reserve a placeholder height on the outer wrapper, or SSR a static height approximation); carry the RentCast dedup and mortgage query consolidation forward from morning's Schedule.

---

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **MockupFrame CLS on non-`fitToHeight` placements** — `MockupFrame` (`app/components/mockups/mockup-frame.tsx` line 32) initialises `scale` at `0`. The inner wrapper's height style is `undefined` when `scale === 0` (line 78–83), so the `relative bg-background` div collapses. The absolutely-positioned content div is invisible (`opacity: 0`) and contributes no natural height. On first paint (SSR output + pre-hydration), every `MockupFrame` without an explicit outer height renders as a 0 px block, then jumps to `contentHeight * scale` after `ResizeObserver` fires. **Affected placements:** hero mobile (`md:hidden`, no explicit height — `app/app/page.tsx` line 265–275), hero desktop (`hidden md:block`, no explicit height — line 301–309), and the pricing Dashboard mockup (`md:col-span-2`, no explicit height — `app/app/pricing/page.tsx` line 264–269). The hero section is above-the-fold content; CLS here directly impacts Core Web Vitals CLS score.

- **Duplicate `/api/rentcast-quota` traffic per page (carried from morning)** — `property-form.tsx` renders `RentCastQuotaHint` 3 times; `benchmark-display.tsx` renders it 3 times. Each mount fires an independent `useEffect` fetch. Confirmed still open; no deduplication has been applied since the morning audit. Evidence: grep count on each file = 3. See morning audit for full detail.

### Low

- **Mockup components are statically imported on marketing pages** — `DashboardMockup`, `MortgageMockup`, `DealAnalyzerMockup`, and `MockupFrame` are imported at the module level in `app/app/page.tsx` (lines 3–4) and `app/app/pricing/page.tsx` (lines 3–6) — not via `next/dynamic`. These are `"use client"` components. Static imports include them in the initial JS bundle delivered to every marketing visitor. For above-the-fold content (hero mockup), static import is acceptable and avoids a loading flash. The pricing-page mortgage and deal analyzer mockups (`fitToHeight`) are below the FAQ and could be deferred. Impact is small — the four component files are pure Tailwind JSX (no runtime data, no Recharts) — but flagged for awareness.

- **`next.config.ts` `localPatterns` can be removed** — `app/next.config.ts` line 55 keeps `images.localPatterns: [{ pathname: "**", search: "" }]`. All three screenshot PNGs have now been deleted from `public/`. The broad wildcard was added for local image optimisation of those assets. No other local `<Image>` sources require this override (the only `next/image` usages on marketing pages are for icons and the Clerk avatar in the app shell). The key can be removed to match the plan's cleanup step (`docs/plans/2026-04-03-embedded-mockups-plan.md` §Cleanup).

- **Pricing plan motion: prefer CSS to avoid Framer Motion bundle cost** — `docs/plans/2026-04-03-pricing-page-premium-plan.md` is open-ended on animation library choice. If the implementing agent selects Framer Motion, the pricing page bundle grows by approximately 20–30 KB (gzip) for all visitors, including signed-out marketing visitors. The plan's §C explicitly says "prefer CSS and existing patterns over heavy JS unless justified." Tailwind `transition-*`/`duration-*` and `@keyframes` in `globals.css` are already in the bundle; CSS-only animation adds zero incremental JS. No CSP concerns with either approach (the existing policy includes `'unsafe-inline'` and `'unsafe-eval'` under `script-src` and `style-src`).

- **Landing mobile CTA plan: no new performance risk** — `docs/plans/2026-04-03-landing-mobile-cta-plan.md` items are layout, visibility, and CTA changes. All use existing Tailwind responsive classes, `FunnelCtaLink` (already in the bundle), and `AnimatedSection` (already in the bundle). No new dependencies, no new network requests. Net performance impact: zero.

- **Mortgage list API: two DB round-trips (carried from morning)** — `app/app/api/properties/[id]/mortgage/route.ts` still performs two sequential Prisma queries (property lookup then `mortgage.findMany`). Optional consolidation into one `include` query. Still open.

---

## Evidence reviewed

- **Process / template:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`.
- **Morning audit:** `docs/audits/performance-cost/2026-04-03-performance-cost-audit.md` — Schedule items reviewed for carry-forward status.
- **Plans reviewed:** `docs/plans/2026-04-03-embedded-mockups-plan.md`, `docs/plans/2026-04-03-pricing-page-premium-plan.md`, `docs/plans/2026-04-03-landing-mobile-cta-plan.md`.
- **Mockup implementation:**
  - `app/components/mockups/mockup-frame.tsx` — full file; CLS mechanism confirmed in `useState(0)` init and `height: scale > 0 ? ... : undefined` pattern.
  - `app/components/mockups/dashboard-mockup.tsx` (lines 1–30 reviewed) — pure hardcoded JSX, no external deps.
  - `app/components/mockups/mortgage-mockup.tsx`, `app/components/mockups/deal-analyzer-mockup.tsx` — confirmed present via Glob.
- **Marketing page imports:**
  - `app/app/page.tsx` (lines 1–35, 250–360) — static imports of `MockupFrame` and `DashboardMockup`; no `next/dynamic` wrapper on mockups.
  - `app/app/pricing/page.tsx` (lines 1–30, 253–286) — static imports of all three mockups; `fitToHeight` usage confirmed on mortgage and deal analyzer.
- **Config:** `app/next.config.ts` — `localPatterns` wildcard confirmed still present; `optimizePackageImports` unchanged.
- **RentCast quota hints:** `app/components/rentcast-quota-hint.tsx` — fetch-per-mount pattern confirmed unchanged. Grep count: `property-form.tsx` = 3, `benchmark-display.tsx` = 3.
- **Public directory:** Glob for `app/public/*.png` = 0 results. Screenshot deletion confirmed.
- **Assumptions:** No production Web Vitals, bundle analyzer output, or browser CLS traces were run; CLS risk is assessed from static code analysis of the `scale = 0` initialisation pattern and the absence of explicit placeholder heights.

---

## Risk & impact assessment

- **MockupFrame CLS (Medium):** The hero section is above-the-fold and directly determines the LCP and CLS scores reported by Google CrUX and Vercel Speed Insights. A 0 → measured-height jump on a column that is visible immediately on desktop will register as a CLS event. Severity is moderate: the shift happens early (ResizeObserver fires within milliseconds of mount), but it is measurable and may push the page's CLS score above the "Good" threshold (< 0.1) if the hero column is large. Pre-launch hardening should address this.
- **Duplicate quota fetches (Medium, carried):** Each additional `RentCastQuotaHint` mount adds one Prisma read and one auth check on every page open. Three mounts per page = 3× the load for a feature that is often not even displayed. No user-visible consequence unless quotas are near exhaustion; cost and DB load are the real concerns.
- **Mockup bundle (Low):** Net bundle impact is positive relative to the PNG baseline (3× 500 KB+ images removed; 4 component files added, estimated < 30 KB minified+gzip). The only concern is that these components are always in the initial bundle even for visitors who never scroll to the pricing "See it in action" section.
- **Pricing motion library (Low):** Risk is conditional on library choice. CSS-only keeps the pricing bundle unchanged; Framer Motion adds a non-trivial cost for what is a low-traffic page relative to the landing page.

---

## Recommendations (prioritized)

1. **Fix MockupFrame CLS: add a minimum placeholder height** — For non-`fitToHeight` frames, add an `aspect-video` or explicit `min-h-[X]` class to the outer wrapper (or pass a `placeholderHeight` prop) so the container reserves space before `ResizeObserver` fires. Alternatively, compute and hard-code an approximate height derived from `internalWidth` and the mockup's known aspect ratio, applying it as a CSS variable via SSR-safe inline style. The `fitToHeight` path (pricing mortgage/deal analyzer) is already protected by explicit `h-[340px]` classes and does not need changes.
2. **Complete RentCast quota dedup (Schedule item from morning)** — Lift the quota fetch to a React context provider or a single parent component per form surface, so `property-form.tsx` and `benchmark-display.tsx` each produce one fetch regardless of how many `RentCastQuotaHint` nodes are rendered. See morning audit recommendation §1 for detail.
3. **Remove `localPatterns` from `next.config.ts`** — Now that all screenshot PNGs are deleted, the broad `{ pathname: "**", search: "" }` wildcard has no remaining purpose. Remove it per the embedded mockups plan cleanup step.
4. **Enforce CSS-only animation for pricing polish** — When executing `docs/plans/2026-04-03-pricing-page-premium-plan.md`, document in the implementation that Framer Motion is out of scope and that all entrance/scroll reveals must use Tailwind `transition-*`, `@keyframes` in `globals.css`, or the existing `AnimatedSection` pattern already in the bundle.
5. **Optional: consolidate mortgage GET query (Schedule item from morning)** — Merge `getPropertyForUser` + `prisma.mortgage.findMany` into one `prisma.property.findFirst({ include: { mortgages: true } })` in `app/app/api/properties/[id]/mortgage/route.ts`.

---

## Task candidates

- [ ] `MockupFrame`: add SSR-safe placeholder height for non-`fitToHeight` frames to eliminate above-the-fold CLS (priority: pre-launch).
- [ ] Remove `images.localPatterns` wildcard from `app/next.config.ts` (cleanup from embedded mockups plan).
- [ ] Consolidate `RentCastQuotaHint` fetches on property form and benchmark display to one fetch per page (carried from morning audit).
- [ ] Document animation-library constraint in pricing polish plan or implementation notes: CSS-only, no Framer Motion.
- [ ] Merge mortgage `GET` into a single Prisma `include` query (optional, carried from morning audit).

---

## Re-test checklist

- [ ] After MockupFrame placeholder fix: verify CLS ≈ 0 in Chrome DevTools Performance panel for hero section on desktop and mobile viewports.
- [ ] After `localPatterns` removal: `next build` completes without `next/image` warnings about unoptimised local paths.
- [ ] After quota dedup: one `GET /api/rentcast-quota` per property edit session (network tab verification).
- [ ] Pricing page after motion implementation: no Framer Motion import in `app/app/pricing/page.tsx` or its component tree; no new `framer-motion` entry in `package.json`.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Pre-launch hardening, or after embedded mockup CLS fix is merged (re-verify CLS baseline); after any new dependency added to marketing pages.
- **Recommended next run:** 2026-07 quarterly pass, or sooner if Framer Motion or another heavy animation library is added to the marketing bundle.
