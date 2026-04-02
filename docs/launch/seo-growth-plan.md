# Veld Portfolio — SEO Growth Plan

**Owner:** PM  
**Drafted:** 2026-04-01  
**Status:** Proposal — promote phases to `docs/tasks.md` when approved  
**Source:** [`docs/launch/seo-strategy-2026.html`](seo-strategy-2026.html) research synthesis + repo audit

---

## Strategy summary

Your acquisition engine is your calculator stack — not a blog. This plan scales what already works:
free, indexed, working calculators → programmatic location pages → competitor comparison pages →
structured resources hub. Each phase is independently shippable and validates before the next phase
is built.

**What this plan is not:** generic real estate education content. Every surface built here ties
directly to the product and drives users to sign up or use the tool.

---

## Cross-cutting requirements (all phases)

These apply to every new public page or route regardless of phase.

### Design
- All typography, color, and spacing follows `docs/policies/design-spec.md`. Semantic tokens only —
  no raw zinc/slate/hex in component code.
- New marketing pages reuse `LandingNav` + `Footer` shell exactly as in `app/tools/brrr/page.tsx`.
- Page titles: `text-2xl font-semibold` on desktop, step down at `md:text-3xl` per existing pattern.
- Section eyebrow: `text-sm font-medium uppercase tracking-wide text-muted`.
- CTAs: primary solid (`bg-accent`), secondary outline — no ad-hoc colors. Use `FunnelCtaLink` for
  tracked conversion clicks.

### Mobile
- All new public pages must be fully usable at 375px and 768px widths (no horizontal scroll).
- Calculator surfaces reuse `MobileToolShell` + `MobileCollapsible` patterns identical to
  existing tools. Do not create new mobile layout primitives.
- Touch targets ≥ 44×44px on all interactive elements (`size-11` minimum for icon buttons).
- `md` is the primary breakpoint. Desktop columns use `hidden md:grid` / `md:hidden` pattern.
- If comparison tables are added, they must horizontally scroll on mobile with `overflow-x-auto` —
  no table overflow clipping.

### Security
- Every new public route added to `app/proxy.ts` `isPublicRoute` allowlist.
- Public calculator/marketing pages are auth-optional: call `auth()` from `@clerk/nextjs/server`
  for `userId` only (nav state + CTAs). No user data is read or written on public pages.
- No secrets, env vars, or user IDs exposed to client bundles. All data files are static TS/JSON
  with no PII.
- If any new API route is introduced (e.g. for data lookups), it follows `docs/architecture-and-build-practices.md`
  §3 security checklist: Zod validation, `getActiveAppUser()`, rate limiting.

### Performance
- No `export const dynamic = "force-dynamic"` on new public pages. These pages call `auth()` for
  session state (makes them dynamic per-request) — do not additionally force dynamic on static
  content pages.
- Static reference/resource pages with no session dependency: add `export const revalidate = 3600`.
- Heavy calculator components already use `next/dynamic` — preserve this pattern; do not top-level
  import Recharts or large chart libs on new pages.
- New `next/image` for any images added. No raw `<img>` tags.
- Large new packages: add to `experimental.optimizePackageImports` in `next.config.ts`.

### SEO (every new public page)
- `metadata.alternates.canonical` using `getAppOrigin()` from `app/lib/app-url.ts`. Never use
  raw `process.env.NEXT_PUBLIC_APP_URL` directly in canonical construction.
- Add to `app/app/sitemap.ts` with appropriate `priority` and `changeFrequency`.
- Confirm `app/app/robots.ts` does not accidentally disallow the new route.
- `metadata.title` follows `"%s | Veld Portfolio"` template (use string title, not `absolute`
  except homepage).
- `metadata.description` ≤ 160 characters.
- OG title + description on every new route.
- Run `npm run check` before marking any phase done.

---

## Phase 0 — Technical foundation (owner, no code)

**Goal:** Ensure your existing SEO surfaces are actually being indexed and measured before building
anything new. Without Search Console data you're flying blind.

**Effort:** 1–2 hours. No engineering required.

### Tasks

| # | Task | How |
|---|------|-----|
| 0.1 | Verify Google Search Console property | Add property at search.google.com/search-console. DNS TXT record or HTML file on Veld domain. |
| 0.2 | Submit sitemap | In Search Console → Sitemaps → submit `https://veldportfolio.com/sitemap.xml`. |
| 0.3 | Confirm `NEXT_PUBLIC_APP_URL` in Vercel | Must have **no trailing slash**. Check Vercel → Project → Settings → Env Vars (Production). Redeploy after any change. |
| 0.4 | Run Rich Results Test | Test `/investment-property-calculator` and `/tools/brrr` at search.google.com/test/rich-results. Both should show FAQPage eligible. |
| 0.5 | Inspect one URL in Search Console | Use URL Inspection on `/tools/brrr`. Confirm "URL is on Google" or request indexing. |
| 0.6 | Baseline snapshot | Note current impressions and clicks in Search Console. Screenshot or note. This is your before-state. |
| 0.7 | Fix `WebApplication` JSON-LD in root layout | Add `operatingSystem: "Web Browser"` and `offers: { "@type": "Offer", "price": 0, "priceCurrency": "USD" }` to the `WebApplication` block in `app/app/layout.tsx`. Clears the "invalid item" error in Rich Results Test. **Small engineering change — 3 lines.** |

**Deferred (no reviews yet):** `aggregateRating` on the `WebApplication` block requires real, verified user reviews (Capterra, G2, Product Hunt, etc.) — cannot be fabricated without risking a Google manual penalty. Revisit once a review source with ≥5 honest ratings exists. When added, link to the source URL in `sameAs` or note where ratings are sourced. Add `aggregateRating` to Phase 6 monitoring checklist at that time.

### Acceptance criteria
- [ ] Search Console property verified and returning data (may take 48–72h after setup).
- [ ] Sitemap submitted; Search Console shows sitemap as "Success" with correct URL count.
- [ ] `NEXT_PUBLIC_APP_URL` confirmed no trailing slash in Vercel Production env.
- [ ] Rich Results Test shows `FAQPage` structured data detected on at least 2 calculator pages.
- [ ] Baseline impressions/clicks documented (even if 0).
- [ ] Rich Results Test shows `WebApplication` as **valid** (no critical errors) after 0.7 is deployed.

---

## Phase 1 — Competitor and alternative pages

**Implementation (2026-04-01):** Shipped — `app/lib/marketing/competitor-data.ts`, `app/components/marketing/competitor-alternative-page.tsx`, `app/app/alternatives/` (hub + `[slug]`), `app/app/vs/` (hub + `[slug]`), `proxy.ts` + `sitemap.ts` updated; footer + `/tools` + `/investment-property-calculator` internal links added.

**Goal:** Capture the highest-converting SEO intent: people actively choosing between tools.
"Stessa alternative", "spreadsheet replacement for rental properties", "Rentastic vs Veld".
These pages convert at 2–5% vs 0.1–0.3% for blog posts. Minimal engineering, maximum ROI.

**Effort:** 2–3 days engineering. 1 sprint.

### Routes to build

| Route | Target query | Primary audience |
|-------|-------------|-----------------|
| `/alternatives/stessa` | "stessa alternative", "stessa vs veld" | Users evaluating leaving Stessa |
| `/alternatives/rentastic` | "rentastic alternative" | Users evaluating Rentastic |
| `/vs/spreadsheets` | "rental property spreadsheet alternative", "replace spreadsheets landlord" | Spreadsheet users ready to upgrade |
| `/alternatives/cozy` | "cozy alternative", "cozy app landlord" | Displaced Cozy users (acquired, pivoted) |
| `/vs/excel-rental-property` | "excel rental property tracker alternative" | Excel-specific searchers |

*Start with `/alternatives/stessa` and `/vs/spreadsheets` first — highest search volume in niche.*

### Page structure (each page)

```
LandingNav
  ├── Breadcrumb: Home / Alternatives / [Competitor]
  ├── H1: "[Competitor] Alternative for Rental Property Investors"
  ├── Lede paragraph (2–3 sentences, honest)
  ├── Feature comparison table (scrollable on mobile)
  ├── Key differentiators section (3 cards, Veld-specific strengths)
  ├── Embedded PublicCalculator (compact=true) — "Try it right now"
  ├── Pricing CTA → /pricing
  ├── FAQ section (CalculatorFaqSection pattern, 3–5 Q&As)
  ├── Cross-links footer (All calculators · Investment property calculator)
Footer
```

### Data requirements

- `lib/marketing/competitor-data.ts` — static TS file, one object per competitor:
  - `name`, `slug`, `headline`, `lede`, `faqs[]`, `features[]` (with `veld: true/false`, `competitor: true/false`, `label`).
- No API calls. No external data. Fully static.
- Comparison table data is honest and accurate — do not claim features Veld doesn't have.

### SEO requirements

- `metadata.title`: `"[Competitor] Alternative | Veld Portfolio"`
- `metadata.description`: ≤ 160 chars, includes competitor name and primary Veld differentiator.
- `alternates.canonical`: `getAppOrigin() + "/alternatives/[slug]"` or `"/vs/[slug]"`.
- `FAQPage` JSON-LD via `CalculatorFaqJsonLd` + visible `CalculatorFaqSection` (verbatim match).
- Add all 5 routes to `sitemap.ts` at `priority: 0.85`.
- All 5 routes added to `proxy.ts` `isPublicRoute`.
- Routes do **not** appear in `robots.ts` disallow list.

### Design requirements

- Comparison table: `rounded-lg border border-default bg-card` table container. Column headers
  `text-sm font-semibold uppercase tracking-wide text-muted`. Check/cross icons use semantic colors
  (`text-positive` for ✓, `text-negative` for ✗) — never raw green/red hex.
- Differentiator cards: 3-column `grid-cols-1 md:grid-cols-3` with `rounded-lg border` cards —
  same card pattern as existing marketing sections.
- Embedded calculator: use `compact={true}` prop on `PublicCalculator` exactly as on homepage.
- CTA button: primary style (`bg-accent` solid) for sign-up; secondary outline for pricing.

### Mobile requirements

- Comparison table wraps in `overflow-x-auto` container so it scrolls horizontally at 375px
  rather than overflowing or squishing.
- 3-column card grid collapses to 1-column below `md`.
- FAQ section uses `MobileCollapsible` or `<details>` for each Q&A on mobile — not expanded by default.

### Performance requirements

- `PublicCalculator` loaded via `next/dynamic` (already done in existing usage — maintain this).
- Page has no `force-dynamic` — `auth()` call makes it session-dynamic, that's sufficient.
- No new heavy dependencies. Comparison table is pure HTML/Tailwind, no library.

### Security requirements

- All 5 routes in `proxy.ts` public allowlist.
- `auth()` called only for `userId` (nav state). No user data read.
- No new API routes needed for this phase.
- `competitor-data.ts` contains no secrets, no user data, no env vars.

### Acceptance criteria

- [ ] 5 competitor/alternative pages render at correct routes with no 404/500.
- [ ] Each page has `metadata.title`, `metadata.description` (≤160 chars), `alternates.canonical`
      via `getAppOrigin()`, and OG fields.
- [ ] `FAQPage` JSON-LD present and verbatim-matched by visible `CalculatorFaqSection` on each page.
- [ ] All 5 routes in `sitemap.ts` at `priority: 0.85`.
- [ ] All 5 routes in `proxy.ts` `isPublicRoute` allowlist.
- [ ] Comparison table scrolls horizontally at 375px — no horizontal page overflow.
- [ ] All comparison table check/cross icons use `text-positive` / `text-negative` semantic tokens.
- [ ] `PublicCalculator` renders in compact mode on each page.
- [ ] `FunnelCtaLink` used for primary CTA clicks (tracked events).
- [ ] `npm run check` green on all new/touched files.
- [ ] Rich Results Test passes FAQPage on at least 2 of the 5 pages.

---

## Phase 2 — Location-based calculator pages (programmatic)

**Implementation (2026-04-01):** Phase **2A** shipped — `app/lib/marketing/location-data.ts` (15 states), `app/lib/marketing/calculator-location-pages.ts`, `app/components/marketing/calculator-location-page.tsx`, `app/app/tools/[calculator]/[location]/page.tsx`; `sitemap.ts` includes 60 URLs at priority **0.75**; calculator base pages + `/investment-property-calculator` link to featured state variants (Phase 3 cross-links partially done).

**Phase 2B (2026-04-01):** Shipped — `LOCATION_DATA_US_STATES` now lists **all 50** US states (alphabetical by name in source); `generateStaticParams` / sitemap emit **200** URLs (`4 calculators × 50 states`). Renamed export: use `LOCATION_DATA_US_STATES` / `LOCATION_SLUGS_US` (removed `LOCATION_DATA_PHASE_2A` alias).

**Goal:** Multiply the existing calculator surface across high-investor-density US states and metros.
One template, one data file, many pages. Target: "investment property calculator Texas",
"BRRRR calculator Florida", etc.

**Effort:** 3–4 days engineering (template + data file). Scales to 200+ pages with no additional work.

### Approach: dynamic routing

```
app/app/tools/[calculator]/[location]/page.tsx
```

`[calculator]` = `brrr` | `investment-property` | `str-vs-ltr` | `fix-and-flip`
`[location]` = state slug (e.g. `texas`, `florida`) or metro slug (e.g. `atlanta`)

Use Next.js `generateStaticParams()` to pre-define all valid slug combinations from the data file.
Unknown slugs → `notFound()`. No wild-card fallback.

### Data file: `lib/marketing/location-data.ts`

Static TS file. No external API calls. No database. Structure:

```ts
export type LocationData = {
  slug: string;           // "texas"
  name: string;           // "Texas"
  displayName: string;    // "Texas" or "Atlanta, GA" for metros
  type: "state" | "metro";
  stateCode?: string;     // "TX"
  investorContext: string; // 1–2 sentence local context paragraph
  avgMonthlyRent?: number; // Optional: pre-fill calculator default if available
  notes?: string;          // Optional: market-specific footnote
};
```

**Phase 2A — Start with 15 high-investor states:**
Texas, Florida, California, Georgia, North Carolina, Tennessee, Arizona, Ohio, Colorado,
Washington, Nevada, South Carolina, Virginia, Pennsylvania, Illinois.

**Phase 2B — Expand to all 50 states** (once Phase 2A pages are indexed and showing impressions).

**Phase 2C — Top 20 metro areas** (only if state pages show meaningful traffic after 60 days).

### Page structure

```
LandingNav
  ├── Breadcrumb: Calculators / [Calculator Name] / [State]
  ├── H1: "[Calculator Name] — [State]"
  ├── Eyebrow: "Calculator · [State]"
  ├── Lede: Local investor context paragraph (from location-data.ts investorContext)
  ├── [Calculator Component] (full, showCta, landingVariant with location slug)
  ├── CalculatorFaqSection (shared FAQ + 1–2 location-specific Q&As)
  ├── Local context section: "Real estate investing in [State]" (2–3 sentences, honest)
  ├── Cross-links: sibling calculator for same location + back to /tools
Footer
```

### Canonical strategy

Each location page has its own canonical — it is NOT a canonical duplicate of the base tool page.

```ts
alternates: { canonical: `${APP_URL}/tools/brrr/texas` }
```

The base `/tools/brrr` page is **not** a canonical for location variants — they are distinct pages
targeting distinct queries.

### Sitemap generation

`sitemap.ts` must be updated to dynamically generate location entries:

```ts
import { LOCATION_DATA } from "@/lib/marketing/location-data";
const CALCULATOR_SLUGS = ["brrr", "str-vs-ltr", "fix-and-flip", "investment-property"];

// In sitemap():
...LOCATION_DATA.flatMap(loc =>
  CALCULATOR_SLUGS.map(calc => ({
    url: `${APP_URL}/tools/${calc}/${loc.slug}`,
    changeFrequency: "monthly",
    priority: 0.75,
  }))
)
```

### SEO requirements

- `metadata.title`: `"[Calculator Name] — [State] | Veld Portfolio"` (e.g. `"BRRRR Calculator — Texas | Veld Portfolio"`).
- `metadata.description`: ≤ 160 chars. Includes calculator name, state name, and primary output metric.
- `alternates.canonical`: location-specific, via `getAppOrigin()`.
- `FAQPage` JSON-LD: reuse existing calculator FAQ + optionally inject 1 location-specific Q&A from data file.
- All generated routes in `proxy.ts` via wildcard: confirm `/tools/(.*)` already covers sub-routes
  (it does per existing `isPublicRoute` implementation) — verify, don't assume.
- All generated routes in sitemap at `priority: 0.75`.
- `generateStaticParams()` returns only slugs in `location-data.ts` — no dynamic catch-all that
  could generate unlimited routes.

### Design requirements

- Location pages use identical layout to base calculator pages (`/tools/brrr` pattern exactly).
- `investorContext` paragraph: `text-sm text-muted` below the H1 lede — same style as existing
  calculator disclaimer copy.
- "Local context" section at bottom: `rounded-lg border border-default bg-card p-6` card with
  `text-sm font-semibold uppercase tracking-wide text-muted` section header. No decorative color.
- Do **not** add maps, external embeds, or third-party widgets — performance and CSP risk.

### Mobile requirements

- Identical to base calculator pages — `MobileToolShell` and `MobileCollapsible` patterns
  propagate automatically since the same component is reused.
- Breadcrumb nav on mobile: `overflow-x-auto whitespace-nowrap` strip — same as existing pages.
- Location context card collapses under `MobileCollapsible` on mobile (it's supplementary content).

### Performance requirements

- `generateStaticParams()` pre-renders all pages at build time — these are static, not dynamic.
  **Do not** call `auth()` on location pages if it can be avoided. If nav state is needed, use
  client-side session detection or accept that the page is dynamically rendered.
- If `auth()` is kept: no `force-dynamic`, let Next.js handle per-request rendering normally.
- Location data file is pure static TS — zero runtime cost.
- Calculator components already lazy-loaded via `next/dynamic` — maintain.

### Security requirements

- `/tools/(.*)` wildcard in `proxy.ts` already covers sub-routes — verify this is confirmed,
  not assumed. Add explicit entries if the wildcard does not cover `/tools/[calc]/[loc]`.
- No API routes introduced in this phase.
- `location-data.ts` contains no PII, no secrets, no env vars.
- `generateStaticParams()` returns a finite, explicitly defined list — prevents arbitrary route
  generation from URL manipulation.
- `notFound()` returned for any slug not in the static list — no empty page renders.

### Acceptance criteria

**Phase 2A (15 states):**
- [ ] Dynamic route renders correctly for all 15 state slugs across all 4 calculator types (60 pages).
- [ ] Unknown slugs (e.g. `/tools/brrr/fakeslug`) return Next.js 404, not a broken page.
- [ ] Each page has correct `metadata.title` (includes calculator name + state), `metadata.description`
      (≤160 chars), `alternates.canonical` via `getAppOrigin()`, OG fields.
- [ ] `generateStaticParams()` is implemented — pages are statically generated at build time.
- [ ] `sitemap.ts` generates location entries for all 60 Phase 2A pages at `priority: 0.75`.
- [ ] Breadcrumb nav is present and correct (Calculators → [Calculator] → [State]).
- [ ] `investorContext` paragraph renders for all locations (no blank/undefined states).
- [ ] Calculator component is functional on location pages — inputs work, results update.
- [ ] Location context section renders in a `border bg-card` card with semantic typography.
- [ ] Mobile: no horizontal scroll at 375px. Location context card is collapsed under `MobileCollapsible`.
- [ ] `/tools/(.*)` in `proxy.ts` covers all location routes — verified by testing 2 routes without auth.
- [ ] `npm run check` green.

**Phase 2B (50 states):** Same criteria as 2A, verified for remaining 35 states.

**Phase 2C (top metros):** Same criteria + confirm metro slugs don't conflict with state slugs.

**Phase 2D (data enrichment):** See below.

---

## Phase 2D — Location page data enrichment

**Implementation (2026-04-01):** Shipped — `location-data.ts` type extended with 3 new fields, all
50 states populated; `investorContext` and `localContext` copy updated to remove false "does not
auto-fill" claims; `PublicCalculator`, `BrrrCalculator`, `StrLtrCalculator` each gained one
optional initial-value prop; `CalculatorLocationPage` wires pre-fills per calculator type and
renders a state data card with cited numbers.

**Goal:** Make the 200 state location pages earn their titles. Every page now uses state-typical
calculator defaults and shows a cited data card — "BRRRR Calculator — Texas" opens with Texas
rents and shows Texas property tax and income tax context.

**Data sources (all static, no runtime API calls):**

| Field | Type | Source |
|-------|------|--------|
| `avgMonthlyRent` | `number` (USD) | HUD FMR FY2025, 2BR, representative metro or statewide |
| `avgEffectivePropertyTaxRate` | `number` (decimal) | Tax Foundation, effective rate on owner-occupied housing, CY2022 |
| `stateIncomeTax` | `string` | State tax authorities, 2025 rates |

### Calculator pre-fill by type

| Calculator | Input pre-filled | Why |
|---|---|---|
| `investment-property` (`PublicCalculator`) | `initialMonthlyRent` → monthly rent | Direct primary income input |
| `brrr` (`BrrrCalculator`) | `initialMonthlyRent` → monthly rent | Hold-phase rental income |
| `str-vs-ltr` (`StrLtrCalculator`) | `initialLtrRent` → LTR monthly rent only | LTR side maps to HUD FMR; STR nightly rate is too city-specific to generalize by state |
| `fix-and-flip` (`FixAndFlipCalculator`) | None | Purchase/rehab/sale math — no ongoing rent input |

### What changed vs original spec

- `localContext` and `investorContext` copy **was updated** (not just supplemented): false "does not
  auto-fill" claims were removed; `investorContext` now acknowledges pre-filled state data.
- STR nightly rate is explicitly left at default — only LTR rent is pre-filled on `str-vs-ltr` pages.
- Data card uses a `<dl>` grid with `sm:grid-cols-3` layout inside the existing `MobileCollapsible`
  local context section — no new layout primitives.

### Acceptance criteria

- [x] `LocationData` type has `avgMonthlyRent?: number`, `avgEffectivePropertyTaxRate?: number`,
      `stateIncomeTax?: string`.
- [x] All 50 states populated with all 3 fields.
- [x] `investorContext` updated to acknowledge pre-filled data; no false "does not auto-fill" claims.
- [x] `PublicCalculator` and `BrrrCalculator` accept `initialMonthlyRent?: number`.
- [x] `StrLtrCalculator` accepts `initialLtrRent?: number` (LTR side only).
- [x] `CalculatorLocationPage` passes `location.avgMonthlyRent` to the correct prop per calculator type.
- [x] State data card renders with typical 2BR rent, effective property tax, and state income tax.
- [x] Citation line: `"Rent: HUD FMR 2025 · Property tax: Tax Foundation 2022"`.
- [x] No new color tokens, no ad-hoc styling, no external links in data card.
- [x] `npm run check` green.

---

## Phase 3 — Internal linking and cross-link audit

**Goal:** Ensure Google can discover all the new pages via internal links, and that existing
calculator pages pass authority to the new surfaces. Google can only index what it can crawl.

**Effort:** 1 day. No new routes — only link additions to existing files.

### Links to add

| Source page | Add link to | Link text |
|------------|------------|-----------|
| `/tools/brrr` footer | `/tools/brrr/texas`, `/tools/brrr/florida` (2–3 featured states) | "BRRRR Calculator — Texas", etc. |
| `/tools/str-vs-ltr` footer | `/tools/str-vs-ltr/florida`, `/tools/str-vs-ltr/arizona` | State variants |
| `/tools/fix-and-flip` footer | `/tools/fix-and-flip/georgia`, `/tools/fix-and-flip/ohio` | State variants |
| `/investment-property-calculator` footer | `/alternatives/stessa`, `/vs/spreadsheets` | "Comparing tools?" |
| `/tools` hub page | `/alternatives/stessa`, `/vs/spreadsheets` | "Evaluating alternatives?" |
| Footer component | `/alternatives/stessa`, `/vs/spreadsheets` | Under a "Compare" or "Resources" group |
| Competitor pages | Back to `/tools` and `/investment-property-calculator` | "Back to calculators" |
| Location pages | Back to base calculator + 2 sibling states | Cross-linking between locations |

### SEO requirements

- All new `<Link>` elements use descriptive anchor text (not "click here", not "learn more").
- No `rel="nofollow"` on internal links.
- Footer component update goes through design review — do not change footer layout, only add a
  logically grouped link section.

### Acceptance criteria

- [ ] Base calculator pages each link to ≥ 2 location variants in their footer area.
- [ ] `/investment-property-calculator` and `/tools` hub link to at least 2 competitor pages.
- [ ] Footer component updated to include competitor/alternative links under a new group.
- [ ] All new `<Link>` hrefs resolve to valid routes (no 404s).
- [ ] No `rel="nofollow"` on any new internal links.
- [ ] `npm run check` green on all modified files.
- [ ] Visual spot-check: footer links do not visually break layout at 375px or 1280px.

---

## Phase 4 — Resources hub (`/resources`)

**Implementation (2026-04-01):** Shipped — `app/lib/marketing/resource-data.ts` (5 articles), `app/components/marketing/resource-article-page.tsx`, `app/app/resources/page.tsx`, `app/app/resources/[slug]/page.tsx`; `proxy.ts` + `sitemap.ts` + footer **Resources** link. Pages use `auth()` for nav (dynamic); no `revalidate` (same as other marketing shells). Hub + article URLs at sitemap priority **0.8**.

**Goal:** A structured data reference section — not a blog. Citation-ready pages for AI Overviews
(ChatGPT, Perplexity, Google AIO). These are informational reference pages that link back to your
tools and establish Veld as an authoritative source on investor math.

**Effort:** 3–4 days. 4–6 initial resource pages, then add incrementally.

### Routes to build

| Route | Target query | Content type |
|-------|-------------|-------------|
| `/resources` | Hub page | Index of all resource pages |
| `/resources/dscr-explained` | "what is DSCR", "DSCR mortgage requirements" | Definition + calculator embed |
| `/resources/cap-rate-explained` | "what is cap rate", "how to calculate cap rate" | Definition + formula + calculator embed |
| `/resources/cash-on-cash-return` | "cash on cash return calculator", "what is cash on cash return" | Definition + calculator embed |
| `/resources/brrrr-method-explained` | "BRRRR method explained", "how does BRRRR work" | Strategy explainer + BRRRR calculator embed |
| `/resources/rental-property-metrics` | "rental property metrics", "how to analyze a rental property" | Metric glossary page |

### Page structure (each resource)

```
LandingNav
  ├── Breadcrumb: Resources / [Topic]
  ├── H1: "[Topic Title]"
  ├── Eyebrow: "Reference · [Category]"
  ├── Definition / explanation (300–600 words, direct-answer format)
  │    ├── H2: "What is [metric]?" — 40–60 word direct answer (atomic answer format)
  │    ├── H2: "How to calculate [metric]" — formula block
  │    ├── H2: "What counts as a good [metric]?" — benchmark table (if applicable)
  │    └── H2: "Try the calculator" — embedded calculator (compact)
  ├── CalculatorFaqSection (4–6 Q&As, verbatim JSON-LD match)
  ├── Cross-links to related resources + back to /tools
Footer
```

### Content principles (enforce in PR review)

- **Direct answer first** — H2 sections open with the answer in 40–60 words before elaboration.
  No "Great question, let's explore..." preamble. AI AIO systems extract this first sentence.
- **No investment advice** — Use "educational" framing. Align with existing disclaimer copy
  pattern from calculator pages ("Numbers are educational — confirm with your lender").
- **No metric claims about Veld's data** — Do not claim Veld provides authoritative market data
  unless it actually does (RentCast estimates are labeled as estimates).
- **Formula blocks** — Use `<code>` or a styled formula element. Makes content machine-readable.
- **Benchmark tables** — Where industry benchmarks exist (e.g. "DSCR ≥ 1.25 for most lenders"),
  cite standard thresholds only. Do not make up numbers.

### `lib/marketing/resource-data.ts`

Static TS file. One object per resource page: `slug`, `title`, `description`, `category`,
`relatedCalculator` (optional), `faqs[]`. Content written inline (no CMS needed initially).

### SEO requirements

- `metadata.title`: `"[Topic] | Veld Portfolio"`.
- `metadata.description`: ≤ 160 chars. Includes primary metric name and a formula or number.
- `alternates.canonical`: `getAppOrigin() + "/resources/[slug]"`.
- `FAQPage` JSON-LD via `CalculatorFaqJsonLd` + visible `CalculatorFaqSection` (verbatim).
- Add all resource routes to `sitemap.ts` at `priority: 0.8`.
- Add to `proxy.ts` public allowlist: `/resources(.*)`.
- Add `export const revalidate = 86400` (24h) to purely static resource pages with no `auth()`.
- If `auth()` is needed for nav state: no `revalidate`, accept dynamic rendering.

### Design requirements

- `/resources` hub: grid of resource cards, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
  Same `rounded-lg border border-default bg-card` card pattern as tools hub.
- Formula display: use `font-mono text-sm bg-subtle rounded px-2 py-1` inline or a dedicated
  `<pre>` block for multi-line formulas — no external syntax highlighter library.
- Benchmark tables: same `border border-default` table pattern as competitor comparison tables.
  `overflow-x-auto` wrapper on mobile.
- Embedded calculator in resource pages: `compact={true}`, visually separated by a `border-t` or
  card wrapper.

### Mobile requirements

- All resource pages at 375px: no horizontal overflow. Formula/code blocks wrap or scroll.
- H2 section navigation: on mobile, consider a `MobileCollapsible` wrapper for the "Benchmark"
  section if it contains a large table.
- Calculator embed on resource pages: same mobile behavior as standalone calculator pages.

### Performance requirements

- `export const revalidate = 86400` on resource pages where no `auth()` call is made.
- No Recharts or chart library on resource pages unless a chart is genuinely necessary.
  Prefer HTML/Tailwind tables for benchmarks.
- New external data sources not permitted in this phase — all content is authored static copy.

### Security requirements

- `/resources(.*)` in `proxy.ts` public allowlist.
- No new API routes in this phase.
- No user data rendered on resource pages.

### Acceptance criteria

- [ ] `/resources` hub renders with all initial resource links.
- [ ] Each resource page (`/resources/dscr-explained`, etc.) renders at its route with no 404/500.
- [ ] Each page has `metadata.title`, `metadata.description` (≤160 chars), `alternates.canonical`
      via `getAppOrigin()`, OG fields.
- [ ] `FAQPage` JSON-LD present and verbatim-matched by visible `CalculatorFaqSection`.
- [ ] H2 sections follow direct-answer format (answer in first 40–60 words).
- [ ] No investment advice language. Disclaimer copy present.
- [ ] All resource routes in `sitemap.ts` at `priority: 0.8`.
- [ ] `/resources(.*)` in `proxy.ts` allowlist.
- [ ] `export const revalidate = 86400` on session-free resource pages.
- [ ] Formula/code blocks render in `font-mono bg-subtle` styling.
- [ ] Benchmark tables scroll horizontally on mobile — no overflow clip.
- [ ] Embedded calculators functional on each resource page.
- [ ] `npm run check` green.

---

## Phase 5 — Community distribution

**Operational runbook:** [seo-phase-5-6-runbook.md](seo-phase-5-6-runbook.md) — UTM templates, PostHog verification, monthly Phase 6 checklist.

**Goal:** Drive warm referral traffic and real backlinks by sharing tools authentically in the
communities your ICP lives in. Reddit posts now rank in Google — a well-placed link in
r/realestateinvesting is SEO value as well as direct traffic.

**Effort:** Ongoing, owner-led. No engineering required.

### Channels

| Channel | What to share | When |
|---------|--------------|------|
| `r/realestateinvesting` | BRRRR or deal calculator in threads asking deal math questions | When someone asks "does this deal work?" — answer with the tool |
| `r/landlord` | Investment property calculator in "should I buy this rental?" threads | Same — provide the tool as a resource, not an ad |
| `r/financialindependence` | STR vs LTR calculator in "Airbnb vs long term rental" discussions | Authentically |
| BiggerPockets forums | Deal Analyzer or fix-and-flip calculator | In "analyze my deal" threads |
| Local REIA groups | Calculator suite link as a free resource | In meetings or email newsletters |
| Facebook RE investor groups | Deal calculator | In deal analysis threads |

### Rules (enforce these)

- **No spam.** Share tools only in threads where the tool directly answers a question being asked.
- **No fake accounts, no astroturfing.** Personal account, genuine participation.
- **Disclose affiliation** when sharing Veld — "I built this tool."
- **Tool-first, product-second.** The post is about helping with the deal math, not selling Veld.
- **Track UTMs.** All community shared links include `?utm_source=[channel]&utm_medium=community&utm_campaign=organic`
  so PostHog captures community-driven signups separately from organic search.

### UTM structure for community links

```
/investment-property-calculator?utm_source=reddit&utm_medium=community&utm_campaign=organic_re_investing
/tools/brrr?utm_source=biggerpockets&utm_medium=community&utm_campaign=organic_brrr
/tools/fix-and-flip?utm_source=reddit&utm_medium=community&utm_campaign=organic_fix_flip
```

### Acceptance criteria

- [ ] UTM parameter tracking confirmed working in PostHog (community-sourced signups appear with
      correct `utm_*` on the `user_signed_up` event — see runbook).
- [ ] No UTM links added to sitemap (canonical URLs remain clean — UTMs are referral-only).
- [ ] Owner/PM has list of 5+ specific subreddits/communities actively monitored for posting opportunities.
- [ ] First 3 posts completed and tracked.

---

## Phase 6 — Monitoring and iteration

Use the same [seo-phase-5-6-runbook.md](seo-phase-5-6-runbook.md) for the condensed monthly table and links.

**Goal:** Let data drive what to build next. Without measurement, the previous phases are guesses.

**Effort:** Recurring. Owner-led. No engineering beyond any fixes surfaced.

### Monthly review checklist

- [ ] **Search Console:** Which new pages have impressions? Which have clicks? Which queries are
      driving traffic? Look for patterns — are location pages ranking for expected queries?
- [ ] **PostHog:** Which pages are converting to sign-up at the highest rate? Compare competitor
      pages vs location pages vs resource pages.
- [ ] **Indexing:** In Search Console URL Inspection, check 5–10 location pages and 2 competitor
      pages. Confirm "URL is on Google." If not indexed after 60 days, investigate.
- [ ] **Rich Results Test:** Re-run on any page that changes FAQ content. Confirm FAQPage still eligible.
- [ ] **`npm run check`:** Run on any SEO-related files touched in the month.

### Decision gates

| Signal | Action |
|--------|--------|
| Competitor pages getting >100 impressions/mo in 60 days | Expand from 5 to 10 competitor pages |
| Location pages getting impressions in 45 days | Proceed to Phase 2B (50 states) |
| Any location page getting clicks | Add 5 more pages in that calculator type first |
| Resource pages cited in AI Overviews (visible in SGE) | Write 3 more resource pages immediately |
| Community posts driving >20 signups total | Increase posting cadence |
| No impressions anywhere after 90 days | Audit technical indexing — likely a Search Console / `NEXT_PUBLIC_APP_URL` issue |

### Acceptance criteria (Phase 6 ongoing)

- [ ] Monthly Search Console review completed and outcomes noted (even "no change").
- [ ] PostHog conversion funnel checked for SEO-sourced users monthly.
- [ ] Next phase prioritization decision made with data, not assumption.

---

## Implementation notes for the builder

When implementing any phase, follow these references exactly:

| Concern | Canonical source |
|---------|-----------------|
| Design tokens + typography | `docs/policies/design-spec.md` |
| Mobile breakpoints + touch targets | `docs/policies/design-spec.md` §4.1 |
| Security checklist | `docs/architecture-and-build-practices.md` §3 |
| Performance patterns | `docs/architecture-and-build-practices.md` §2.5 |
| Canonical URL construction | `app/lib/app-url.ts` `getAppOrigin()` |
| Public route allowlist | `app/proxy.ts` `isPublicRoute` |
| Sitemap | `app/app/sitemap.ts` |
| FAQ pattern (JSON-LD + visible) | `app/components/marketing/calculator-faq.tsx` + `app/lib/marketing/calculator-faqs.ts` |
| Calculator page pattern | `app/app/tools/brrr/page.tsx` |
| `FunnelCtaLink` | `app/components/marketing/funnel-cta-link.tsx` |
| Mobile shell pattern | `app/components/calculators/mobile-tool-shell.tsx` |

---

## Promotion to tasks.md

When PM approves a phase, promote it to `docs/tasks.md` as a task block with these acceptance
criteria as the checkboxes. Do not promote multiple phases at once — complete and validate
Phase 0 before building Phase 1, validate Phase 1 before building Phase 2, etc.

**Suggested promotion order:** 0 → 1 → 3 (links) → 2A → 4 → 2B → 5 → 6

*Phase 3 (internal linking) is deliberately promoted before Phase 2 because newly built competitor
pages need links from existing pages to get crawled faster. Do not wait until Phase 2 is done.*
