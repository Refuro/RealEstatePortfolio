# Veld Portfolio — SEO Growth Plan Extension

**Owner:** PM
**Drafted:** 2026-04-19
**Status:** Proposal — promote tiers/items to `docs/tasks.md` when approved
**Source:** Extends [`docs/launch/seo-growth-plan.md`](seo-growth-plan.md) (Phases 0–6 mostly shipped). Informed by [`docs/audits/seo/2026-04-09-seo-audit.md`](../audits/seo/2026-04-09-seo-audit.md) and current-world SEO practice as of April 2026.

---

## Strategy summary

Phases 0–6 of the existing plan shipped: technical foundation, competitor/alternative pages (5), programmatic calculator × state pages (459), internal cross-linking, resources hub (5 articles), community distribution runbook, monthly monitoring. The remaining growth levers are **authority signals** (backlinks, reviews, editorial placements), **content depth** (long-tail + pillar/cluster), and **the small set of technical items still open from the 2026-04-09 audit**.

This extension is organized by **Tier 1 / 2 / 3 priority**, not by sequential phase number, so the solo founder's bandwidth lands on the highest-leverage items first. Each item cites its gate (if any), realistic effort, and acceptance criteria so PM can promote to `docs/tasks.md` one at a time.

**What this plan is not:** a blog program, a paid link campaign, a social-media growth program. Every item ties to authority, discovery, or content quality that directly affects search rankings for Veld's actual audience (small passive landlords).

**Conversion context (informs link targets throughout this plan):** As of April 2026, the **homepage (`/`)** is the proven converter — 5% signup conversion on paid search traffic. All directory, editorial, and outreach link targets should default to home unless there's a specific reason to deep-link (e.g. organic SEO matching where the user explicitly searched for a calculator). `/investment-property-calculator` remains indexable and retained for organic calculator-intent queries but is no longer the cold-traffic landing page.

### Cross-cutting requirements

All requirements in [`seo-growth-plan.md` §Cross-cutting requirements](seo-growth-plan.md#cross-cutting-requirements-all-phases) (design, mobile, security, performance, SEO) apply unchanged. Do not re-litigate token usage, canonical construction, `getAppOrigin()`, `proxy.ts` allowlist, or sitemap priorities — they are already established patterns.

---

## Tier 1 — Do first (highest ROI, ~40 hours total)

Parallel owner tracks + one engineering batch. Nothing in Tier 1 blocks anything else in Tier 1. Start all five in the same week.

### 1.1 G2 + Capterra + GetApp listings

**Owner-led. ~6 hours.**

**Status (2026-04-19):** Capterra submitted; awaiting approval. GetApp + Software Advice will auto-populate from Capterra within a week of approval. G2 flagged the homepage as B2C via their automated classifier — support ticket submitted to request manual review citing Stessa / Baselane / Rentastic category precedents; awaiting response.

Single highest-ROI item in the plan. Real estate investment management is an active category on both G2 and Capterra; direct audience match (people searching "best rental property tracker"); DR 91 do-follow backlinks; prerequisite for the `aggregateRating` unlock in Tier 3.

**Submissions:**

- **G2** — category: Real Estate Investment Management Software (*blocked by B2C classifier; support ticket pending*)
- **Capterra** — category: Real Estate Property Management (*✓ submitted 2026-04-19, awaiting approval*)
- **GetApp + Software Advice** — Gartner-owned; auto-populate after Capterra approval

**Required assets (prepare once, reuse):**

- Logo 512×512 PNG
- 3–5 product screenshots (dashboard, property detail, deal analyzer, calculator, pricing)
- Short description (200 char)
- Long description (500+ words) — lift from [`app/.agents/product-marketing-context.md`](../../app/.agents/product-marketing-context.md)
- Feature list (deal analyzer, scenario modeling, mortgage simulator, portfolio charts, rent & value estimates, calculators)
- Pricing tiers (Free, Investor $15/mo, Pro $29/mo)
- Integration list (RentCast, Clerk, Stripe)
- Support contact

**Link targets and UTMs:**

Homepage is the proven converter (5% signup conversion from paid search as of April 2026) — all directory traffic should default to home. Do not send listings to `/investment-property-calculator` — it's retained as the canonical indexable URL for organic calculator queries but does not convert cold traffic as well as the homepage.

- **Primary (all listings):** `https://veldportfolio.com/?utm_source=<capterra|g2|getapp>&utm_medium=directory&utm_campaign=listing`
- **Secondary (only where the directory asks for a "calculators" URL):** `https://veldportfolio.com/tools?utm_source=<capterra|g2|getapp>&utm_medium=directory&utm_campaign=listing_tools`

**Acceptance criteria:**

- [x] Capterra submitted (2026-04-19)
- [ ] Capterra listing approved (1–2 week turnaround typical)
- [ ] GetApp + Software Advice auto-populated from Capterra
- [ ] G2 classifier dispute resolved and listing submitted
- [ ] G2 listing approved
- [ ] UTM-tagged referral traffic appearing in PostHog within 30 days of approval
- [ ] Profiles document internal screenshot and description filenames in a single location (for quick re-use on other platforms)

---

### 1.2 Bing Webmaster Tools verification

**Owner-led. ~10 minutes.**

Free. Doubles search surface: Bing represents ~6–10% of US search and feeds ChatGPT search, DuckDuckGo, Ecosia, partial Yahoo. Bing indexing also influences some LLM-powered search experiences.

**Steps:**

1. Verify `veldportfolio.com` at [bing.com/webmasters](https://www.bing.com/webmasters) via DNS TXT or meta tag
2. Submit `https://veldportfolio.com/sitemap.xml`
3. Baseline impressions/clicks noted (may be 0 initially)

**Dropped from Tier 1:** IndexNow — return too low at Veld's content velocity (~1 article every 2 weeks). Revisit if velocity 3x+.

**Acceptance criteria:**

- [ ] Bing WMT property verified and returning data (may take 48–72h)
- [ ] Sitemap submitted; "Success" status in Bing WMT
- [ ] Baseline impressions/clicks documented (even if 0)

---

### 1.3 Audit closures (one coordinated engineering PR)

**Engineering. ~6 hours in one batch.**

**Status (2026-04-19):** Shipped (five of six items). Breadcrumb JSON-LD, pricing FAQ JSON-LD, sitemap freshness, data-driven alternatives/vs sitemap, and header nav additions all live. Per-page OG images deferred — requires static PNG design work (15+ images) rather than code changes. Homepage OG continues to use the shared `/og-image.png` via root layout; follow-up task to diversify per-page OG images tracked separately.

All items from the [2026-04-09 audit](../audits/seo/2026-04-09-seo-audit.md). Ship as one coordinated PR.

| Item | Scope | Files |
|------|-------|-------|
| **Breadcrumb JSON-LD** (`BreadcrumbList`) | Emit alongside existing visual breadcrumbs on `/alternatives/[slug]`, `/vs/[slug]`, `/tools/[calculator]`, `/tools/[calculator]/[location]`, `/resources/[slug]` | New `BreadcrumbJsonLd` component in `app/components/marketing/`; usage added to existing page components |
| **Per-page OG images** | Override `openGraph.images` on high-priority pages with static PNGs. **Home is top priority** — it's the primary ads landing page (5% conversion) and the URL most often shared on social/directory/editorial links. Also add overrides to alternatives, tools, and investment-property-calculator. | New images under `app/public/og/`; homepage OG either lives in root `layout.tsx` (review quality of existing `/og-image.png`) or add explicit override on `app/app/page.tsx`; metadata edits on `investment-property-calculator/page.tsx`, `alternatives/[slug]/page.tsx`, `tools/[calculator]/page.tsx` |
| **Pricing FAQ JSON-LD** | Reuse `CalculatorFaqSection` + `CalculatorFaqJsonLd` pattern on `/pricing` | `app/app/pricing/page.tsx`, `app/lib/marketing/pricing-faqs.ts` (new or extend existing FAQ data file) |
| **Sitemap freshness** | Replace fixed `LAST_MODIFIED` with per-section dates (changelog-derived for `/changelog`, data-file mtime for resources and competitors) | `app/app/sitemap.ts` |
| **Data-driven sitemap alternatives/vs** | Derive slugs from `COMPETITOR_ALTERNATIVES` and `COMPETITOR_VS` instead of hardcoding | `app/app/sitemap.ts`, read from `app/lib/marketing/competitor-data.ts` |
| **Header nav additions** | Add `/alternatives`, `/vs`, `/resources` to landing nav | `app/components/landing-nav.tsx` |

**Mobile UX constraint on header nav:** If adding three links makes the mobile nav feel crowded, collapse into a "Compare" or "Resources" dropdown rather than inline links. Do not ship if mobile nav breaks at 375px.

**SEO requirements:** Follow [`seo-growth-plan.md` §Cross-cutting requirements → SEO](seo-growth-plan.md#cross-cutting-requirements-all-phases). Canonicals untouched; these items add structured data and nav, not new indexable routes.

**Acceptance criteria:**

- [x] BreadcrumbList JSON-LD emits on all 5 page patterns (new `BreadcrumbJsonLd` component at `app/components/marketing/breadcrumb-jsonld.tsx`, wired on alternatives/vs/tools/tools-location/resources pages)
- [ ] OG images — **deferred**; requires static PNG design work. Homepage OG still works via root layout `/og-image.png`. Follow-up task to diversify per-page OG images.
- [x] FAQ JSON-LD present on `/pricing`; FAQ visible content verbatim-matches JSON-LD items (shared `PRICING_FAQ` in `app/lib/marketing/pricing-faqs.ts`)
- [x] Sitemap emits per-section `lastModified` dates (site surfaces derive from latest `CHANGELOG_ENTRIES` date; legal pages keep stable date)
- [x] Sitemap alternatives/vs entries auto-generate from `competitor-data.ts` via `Object.keys(COMPETITOR_ALTERNATIVES)` and `Object.keys(COMPETITOR_VS)`
- [x] Header nav includes `/resources` (as "Guides") in both desktop and mobile; `/alternatives` and `/vs` added to mobile drawer only to avoid desktop nav bloat (both remain crawlable from footer)
- [x] ESLint green on all modified files; pre-existing test-file TypeScript errors unrelated to this change left in place per policy

---

### 1.4 Author bio page + Article + Person schema on /resources

**Engineering. ~5 hours.**

E-E-A-T wins for YMYL/investment content. Single-author simplifies scope.

**New route:** `/about/author/[slug]` with founder bio (photo, credentials, experience, links to LinkedIn/X/verified profiles). One page initially.

**New components:**

- `AuthorByline` — visible byline block on resource articles
- `ArticleJsonLd` — Article schema emitter
- `PersonJsonLd` — Person schema emitter

**Person JSON-LD** on author page: `name`, `url`, `image`, `sameAs[]` (array of verified profile URLs), `jobTitle`, `worksFor` (Organization = Veld).

**Article JSON-LD** on every `/resources/*` page: `author` (references Person by URL), `datePublished`, `dateModified`, `image`, `headline`, `publisher` (Organization = Veld), `mainEntityOfPage`.

**Visible byline** on each resource article:

> "By [Founder Name] — Published [date], last updated [date]" → links to `/about/author/[slug]`

**Data model change:** `app/lib/marketing/resource-data.ts` gains `author: string` (author slug), `publishedAt: string` (ISO date), `updatedAt: string` (ISO date) fields on each article. Back-fill for all 5 existing articles.

**Authors data file:** `app/lib/marketing/authors-data.ts` — one entry per author with `slug`, `name`, `title`, `bio`, `photoUrl`, `sameAs[]`.

**Security requirements:**

- Author photo hosted as static asset under `app/public/authors/` — no external image URLs
- `sameAs[]` entries validated as HTTPS external profile URLs only
- Author bio data static, no PII beyond publicly shared founder profile

**Acceptance criteria:**

- [ ] `/about/author/[slug]` route live for founder
- [ ] Visible byline on all 5 existing resource articles linking to author page
- [ ] Article JSON-LD on each resource page (Rich Results Test: Article valid)
- [ ] Person JSON-LD on author page (Rich Results Test: Person valid)
- [ ] `resource-data.ts` and `authors-data.ts` populated; no TypeScript errors
- [ ] `npm run check` green
- [ ] Author page added to `sitemap.ts` (priority 0.6) and `proxy.ts` allowlist

---

### 1.5 Digital PR setup + daily pitching

**Owner-led. Setup ~2 hours. Ongoing ~15 min/day.**

Highest-leverage use of founder time in the whole plan. Solo founder with a real product and niche expertise (rental portfolio analytics) is exactly the target profile for these platforms.

**Platforms to set up (all have free tiers in 2026):**

- **Qwoted** — strong for finance/real estate; active US journalist base
- **Featured.com** — free with paid upgrades; primarily US
- **Connectively** — Cision's successor to HARO (HARO shut down June 2024)

**Pitch topics aligned to Veld expertise (stay in lane):**

- DSCR lending trends and what lenders accept
- Cap rate analysis, good cap rate by market type, cap rate compression
- BRRRR method math and common mistakes
- Cash flow realities for small landlords
- When spreadsheets break for real estate investors
- State-specific rental market trends (tied to RentCast + HUD data)
- First-time investor deal analysis
- Small-landlord (1–10 properties) workflow questions

**Daily workflow (~15 min):**

1. Scan new requests tagged "real estate," "rental property," "landlord," "property investment"
2. Filter: is this a question the founder can genuinely answer from direct experience?
3. Respond within 2 hours if possible (journalists work on tight deadlines)
4. Use the template

**Response template:**

```
[Name], here's my answer on [topic]:

[100–150 words of specific, numeric, non-promotional answer. Lead with the
concrete takeaway. Use numbers where honest. No "I think," no "in my humble
opinion," no fluff.]

Please attribute as: [Founder name], Founder of Veld Portfolio
(veldportfolio.com), a rental portfolio analytics platform for small investors.

Happy to elaborate or provide a short follow-up quote if useful.
```

**Tracking (CSV or Airtable):**

- Columns: date, platform, journalist, outlet, topic, pitch copy, status (sent/used/declined), resulting URL
- When a placement lands: add URL to Organization JSON-LD `sameAs` array in [`app/app/layout.tsx`](../../app/app/layout.tsx) (one-line addition per placement)

**Realistic expectations:**

- First 30 days: 20–40 pitches sent, 0–2 placements; early pitches calibrate voice
- 60–90 days: 60+ pitches, 3–8 placements, at least one on DR 75+
- Ongoing: 1–3 placements/month becomes typical once calibrated

**Acceptance criteria:**

- [ ] Profiles set up on Qwoted, Featured.com, Connectively
- [ ] Response template + pitch tracker (CSV or Airtable) in place
- [ ] 20 pitches sent in first 4 weeks
- [ ] First placement landed within 90 days
- [ ] When first placement lands, URL added to Organization JSON-LD `sameAs`

---

## Tier 2 — Next wave (~60 hours over 2–3 months)

Start once Tier 1 is shipped or near-done. Content cadence deliberately modest.

### 2.1 Remaining general SaaS directories

**Owner-led. ~4 hours total.**

| Directory | DR | Notes |
|-----------|----|----|
| Fazier | 81 | freemium, do-follow |
| BetaList | 75 | free |
| Indie Hackers | 80 | community signal as much as backlink |
| AlternativeTo | high | list Veld as Stessa / Rentastic / Cozy alternative |
| PeerPush | 72 | freemium |
| Product Hunt | — | timed launch; requires prepared assets, maker comment, launch-day support |

**Excluded with rationale:** Uneed, Slant.co, LaunchDirectories, SaaSHub. Diminishing returns plus audience mismatch (general SaaS, not landlords). Only submit if each takes under 5 minutes.

**Product Hunt launch prep (subset):**

- Gallery: 6 images (hero shot, dashboard, calculator, deal analyzer, pricing, mobile)
- Maker comment: 200-word first-person intro
- Launch day: founder responds to every comment within 2 hours
- Link target: home with `?utm_source=producthunt&utm_medium=launch&utm_campaign=initial_launch`

**Acceptance criteria:**

- [ ] 6 listings live; UTMs tracked
- [ ] Product Hunt launch day scheduled with prepared assets

---

### 2.2 Broken link building — Track A only

**Owner-led. ~8 hours across 3 weeks.**

Skip the custom scanner proposed in earlier drafts. Outreach quality is the bottleneck, not target discovery.

**Source targets in priority order:**

1. **Ahrefs Webmaster Tools → Broken Backlinks** on `stessa.com`, `baselane.com`, `rentastic.com`, `cozy.co`, `dealcheck.io` — highest-conversion targets because the linking page already wanted to link to a similar tool
2. **Check My Links Chrome extension** on 20–30 curated "best real estate investor tools" roundups (Forbes, NerdWallet, Investopedia, Bankrate, SmartAsset, BiggerPockets, Rocket Mortgage, SoFi)
3. **Archive.org Wayback** for historical Cozy linkers (narrower window by 2026 — most updated — but long-tail stragglers remain)

**Outreach cadence:** 60 emails over 3 weeks. Realistic conversion ~2–3% = 1–2 backlinks. Higher conversion possible on Tier 1 competitor broken-backlinks (Stessa etc.) because relevance is exact.

**Template:**

```
Subject: Broken link on [page title]

Hi [name], noticed the link to [broken URL] on [page URL] 404s —
[brief reason, e.g. Cozy shut down in 2022]. If you're open to a
replacement, [Veld resource URL] covers the same ground and is
maintained. Either way, thought you'd want to know.

— [Founder name]
```

**Mapping Veld replacements:**

- Broken "Cozy" links → `/alternatives/cozy`
- Broken "rental property calculator" links → `/investment-property-calculator` (organic-SEO-appropriate target even though home is the primary ads landing)
- Broken "rental property tracker" or generic "portfolio tracker" links → **home** (proven converter)
- Broken "BRRRR calculator" links → `/tools/brrr`
- Broken "DSCR" explainers → `/resources/dscr-explained`
- Broken "Stessa alternative" or "rental tracker" roundups → `/alternatives/stessa` or `/vs/spreadsheets`

**Tracking:** Simple CSV — target URL, broken URL, contact, date sent, response, outcome, backlink URL.

**Acceptance criteria:**

- [ ] 60 emails sent across 3 weeks
- [ ] 1+ backlink earned (floor, not stretch)
- [ ] All new backlinks logged; Ahrefs WMT referring-domain count before/after documented

---

### 2.3 Long-tail content program — first 6 articles

**Hybrid (owner authors, builder ships). ~30 hours across 3 months.**

Scaled down from the earlier draft's 25-in-12-weeks to **6 articles in 3 months** (1 every 2 weeks). Each must clear the "best answer in SERP" bar post-HCU — no quota-filler.

**Structure:** 4 existing pillars (DSCR, cap rate, BRRRR, metrics) + 1–2 supporting articles each that actually differentiate.

**Keyword research process (owner runs before each article):**

1. **Google Search Console → Queries report** — filter position 8–20 for easy "almost ranking" wins
2. **Ahrefs Webmaster Tools free tier** — Top Pages / Keywords for `veldportfolio.com`, filter KD ≤ 20, volume 50–500
3. **People Also Ask + autocomplete** per pillar — harvest 10–20 long-tail variations from live SERPs
4. **Competitor gap analysis** — Stessa / Baselane keyword lists in Ahrefs free tier, filter KD ≤ 20 they rank for and Veld doesn't
5. **Reddit + BiggerPockets question mining** — real user phrasings, often near-zero competition

**Differentiation bar — each article must do one of:**

- Include a genuinely useful calculator embed Veld already has
- Cite specific numeric benchmarks from data Veld already uses (HUD FMR, Tax Foundation, Freddie Mac PMMS, RentCast)
- Answer a specific sub-question that BiggerPockets / Stessa / DealCheck don't cover with a dedicated page
- Combine two topics that nobody combines (e.g. "DSCR requirements by lender type 2026" — specific, researchable, uncommon)

**Format:**

- Direct-answer first 40–60 words per H2 (AI Overview extraction)
- 1,200–2,000 words
- FAQ JSON-LD verbatim-matched to visible `CalculatorFaqSection`
- Article + Person JSON-LD (from Tier 1.4) with real byline
- Embedded calculator at end (reuse existing `PublicCalculator`, `BrrrCalculator`, etc. in `compact` mode)
- Internal links: pillar + 2 siblings + related calculator tool

**Honest note:** Article writing quality is the owner's responsibility — AI-drafted articles get penalized by Google's helpful-content signals. Builder's role is limited to adding the article object to `resource-data.ts`, wiring the FAQ JSON-LD, and verifying schema validity.

**Acceptance criteria (per article):**

- [ ] Documented long-tail target query and source (GSC / Ahrefs / PAA / Reddit)
- [ ] Differentiation bar met (one of the four above)
- [ ] FAQ JSON-LD verbatim-matched to visible FAQ
- [ ] Article + Person JSON-LD
- [ ] Embedded calculator functional
- [ ] Internal links to pillar + 2 siblings + calculator
- [ ] `npm run check` green
- [ ] Rich Results Test: Article + FAQPage valid

---

### 2.4 llms.txt + DefinedTerm schema

**Engineering. ~3 hours.**

**Status (2026-04-19):** Shipped. `/llms.txt` returns a curated content index derived from the same data files the sitemap uses (self-maintaining). `DefinedTerm` JSON-LD emits on the 4 metric explainer articles via a new optional `definedTerm` field on `ResourceArticle`. New resource articles can opt in by setting the field; existing articles without it emit no DefinedTerm silently.

**Maintenance guards (shipped same session):** Sitemap now derives all 9 calculator base pages from `CALCULATOR_LOCATION_DEFS` (was hardcoded). New calculators added to that data file automatically appear in both sitemap and `/llms.txt`. The "New page" checklist in [`docs/architecture-and-build-practices.md`](../architecture-and-build-practices.md) §6.3 updated with BreadcrumbJsonLd, FAQ JSON-LD, DefinedTerm, and changelog-entry requirements. [`docs/qa/seo-release-checklist.md`](../qa/seo-release-checklist.md) updated to verify `/llms.txt` and structured data via Rich Results Test.

Kept per owner request. Honest caveat: llms.txt adoption still uncertain (Anthropic partial interest, OpenAI/Google non-committal). Cheap to ship so low-cost bet on emerging standard. The DefinedTerm half delivers value regardless.

**llms.txt:**

- **New route:** `app/app/llms.txt/route.ts` — serves plain-text index per [llmstxt.org](https://llmstxt.org) format
- Curates highest-quality content paths: `/resources/*`, `/tools/*`, `/investment-property-calculator`, `/alternatives/*`, `/vs/*`
- Excludes auth, app shell, legal
- Add `/llms.txt` to `proxy.ts` public allowlist

**DefinedTerm schema:**

- Add on metric explainer articles: `/resources/dscr-explained`, `/resources/cap-rate-explained`, `/resources/cash-on-cash-return`, `/resources/rental-property-metrics`
- New `DefinedTermJsonLd` component
- Each metric gets `DefinedTerm` with `name`, `description`, `inDefinedTermSet` (pointing at a `DefinedTermSet` representing Veld's glossary)

**Acceptance criteria:**

- [ ] `GET /llms.txt` returns valid plain-text response (HTTP 200, correct MIME)
- [ ] DefinedTerm JSON-LD on 4 resource pages
- [ ] Rich Results Test shows no schema errors on those pages
- [ ] `/llms.txt` in `proxy.ts` public allowlist

---

## Tier 3 — Gated or deferred

Each item has an explicit gate. Do not start until the gate fires.

### 3.1 Core Web Vitals audit on calculator pages

**Gate:** Run [PageSpeed Insights](https://pagespeed.web.dev) on `/tools/brrr/texas`, `/investment-property-calculator`, `/resources/dscr-explained`. **Owner should run this now** — the result determines whether this item elevates.

**Elevation rule:** If INP p75 > 200ms OR LCP > 2.5s on mobile → **this item jumps to Tier 1, above everything else**. 459 programmatic state pages share the calculator template, so CWV regression affects the largest URL cluster in the sitemap. INP became a ranking signal in 2024.

**If it fails — likely causes and fixes:**

- Heavy Recharts rendering on mobile → lazy-load, consider alternative chart lib
- Hydration delay from calculator client bundle → code-split, defer non-critical hydration
- Large LCP image → optimize OG images, use Next.js `<Image>` for hero content
- Long tasks on main thread during input → debounce, move heavy computation to `useDeferredValue`

**If it passes:** No work required. Re-run quarterly.

**Acceptance criteria (only if elevated):**

- [ ] PageSpeed Insights mobile INP p75 ≤ 200ms on all three sampled pages
- [ ] PageSpeed Insights mobile LCP ≤ 2.5s on all three sampled pages
- [ ] No new blocking issues introduced on desktop

---

### 3.2 Remaining 6 long-tail articles

**Gate:** First 6 articles from Tier 2.3 have 60 days in production, and at least 2 articles show meaningful Search Console impressions (>100/mo for the query cluster, not just the article itself).

**If all 6 show near-zero impressions:** Don't publish more. Audit the articles first — topic selection, differentiation, keyword match. Fix the approach before scaling volume.

---

### 3.3 Public-data synthesis report

**Gate:** Tier 1 + 2 shipped. Owner has bandwidth for a 2–3 week project.

**Replaces** the internal-data annual report from earlier drafts. Much lighter build, no privacy constraints, same linkable-asset value.

**Example report:** "50-State Rental Market Index 2026"

**Data sources (all public or already licensed):**

- HUD FMR 2025 — already in `location-data.ts`
- Tax Foundation effective property tax — already in `location-data.ts`
- Freddie Mac PMMS weekly mortgage rates — free public feed
- RentCast aggregated market trends — Veld already licenses
- Optional: aggregated Veld calculator expectations if user volume ≥ 30 per state cohort

**Output:**

- Long-form `/resources/state-of-rental-investing-2026` (or similar slug)
- Downloadable PDF (generated or hand-designed)
- Shareable infographic (single large PNG summary)
- 10–20 charts using existing Recharts setup

**Distribution:**

- Pitch to journalists via Tier 1.5 Qwoted / Featured.com / Connectively with "data available for your next piece" angle
- Direct email to 20–40 RE journalists with PDF + one-paragraph hook
- Reddit r/realestateinvesting, BiggerPockets (per existing Phase 5 rules)
- LinkedIn post from founder; X thread with 5 most surprising findings

**Privacy rules if using Veld aggregates:**

- Minimum cohort size 30 users per metric
- No property-level or ZIP-level granularity below that threshold
- No user identifiers at any level
- Methodology + data extraction code reviewed before publication

**Acceptance criteria:**

- [ ] Report page + PDF shipped at `/resources/[report-slug]`
- [ ] Article + Person JSON-LD on report page
- [ ] Distribution pitch list (20+ journalists) sent within 2 weeks of publication
- [ ] 10 backlinks earned within 6 months of publication (tracked in Ahrefs WMT)

---

### 3.4 aggregateRating JSON-LD

**Gate:** ≥5 honest reviews land on G2 or Capterra (Tier 1.1 is the prerequisite).

**Realistic timeline:** 3–6 months after listings go live for organic review accumulation. Do not fabricate, incentivize, or backdate reviews — Google manual penalty risk.

**Scope:**

- Add `aggregateRating` to `WebApplication` JSON-LD in [`app/app/layout.tsx`](../../app/app/layout.tsx)
- Include `sameAs` pointing to the review source (G2 or Capterra profile URL)
- Re-run Rich Results Test to confirm `WebApplication` remains valid

**Acceptance criteria:**

- [ ] ≥5 honest reviews on one canonical source
- [ ] `aggregateRating` JSON-LD shipped; Rich Results Test valid
- [ ] Review source URL in `WebApplication.sameAs`

---

### 3.5 Thin-content sweep on programmatic state pages

**Gate:** 60 days after Tier 1 shipped. Check Search Console Coverage report. If large portion of `/tools/[calculator]/[state]` pages are "Crawled — currently not indexed" or "Discovered — currently not indexed" → Google is soft-suppressing them as thin.

**Do not start without GSC data.** The 2026-04-09 audit flagged this as a risk, not a confirmed problem.

**Remediation options (pick one based on GSC pattern):**

- **Enrich:** Add genuine state-specific content to weakest pages (additional data points, local investor context)
- **Prune by noindex:** Keep top N calculators × top N states = ~30–60 pages, noindex the rest. Preserves the URLs, removes them from index budget.
- **Consolidate canonical:** Point weakest variants at strongest or at base `/tools/[calculator]`

**Acceptance criteria (scope dependent on remediation chosen):**

- [ ] GSC Coverage report reviewed and pattern documented
- [ ] Remediation option chosen with PM approval
- [ ] Changes shipped; 30-day follow-up to confirm index health improves

---

## Deliberately dropped (with rationale)

| Item | Rationale |
|------|-----------|
| Internal-data annual report | At Veld's current volume, aggregates aren't statistically interesting enough. 40+ hours effort. Replaced by Tier 3.3 public-data synthesis. Revisit 12+ months once volume supports it. |
| Broken link scanner Track B | Outreach quality is the bottleneck, not target discovery. Ahrefs WMT + Check My Links covers 95% of value. Not a business priority. |
| IndexNow integration | Matters at high content velocity (daily+). Veld publishes ~1 article every 2 weeks. Bing crawls regularly anyway. Revisit if velocity 3x+. |
| Methodology page | Nice-to-have. Defer until a specific journalist or partner asks "how do you calculate this?" — then ship on demand. |
| HowTo schema | Google deprecated the HowTo rich result in September 2023. JSON-LD still valid but no SERP surface. Implementation cost > return. |
| Lesser SaaS directories (Uneed, Slant.co, LaunchDirectories, SaaSHub) | Diminishing DR value + audience mismatch (general SaaS, not landlords). Submit only if each takes <5 minutes. |
| Separate `/blog` | Reinforces existing Phase 4 decision: `/resources` pattern is the content engine. No separate blog. |
| YouTube channel | High production cost, uncertain SEO payoff. Defer. |
| Dedicated Twitter/X growth program | Valuable for brand, weak for SEO directly. Keep as personal founder activity, not a planned program. |
| Paid link-building / PBNs / link exchanges | Manual penalty risk. Never. |
| AI-generated content at scale | Google's HCU specifically targets this. Veld's hand-written approach is correct; preserve it. |

---

## Promotion to tasks.md

**Order. Promote one at a time.**

**Tier 1 — owner tracks (can run in parallel):**

1. G2 + Capterra + GetApp listings (1.1)
2. Bing WMT verification (1.2)
3. Qwoted + Featured + Connectively setup and daily pitching (1.5)

**Tier 1 — engineering batch (one coordinated PR each):**

4. Audit closures (1.3)
5. Author bio + Article/Person schema (1.4)

**Tier 2 — in order:**

6. Remaining directories (2.1)
7. Broken link outreach Track A (2.2) — 3-week batch
8. First 6 long-tail articles (2.3) — 1 every 2 weeks
9. llms.txt + DefinedTerm (2.4)

**Tier 3 — gated. Do not promote until gate fires:**

10. CWV audit (3.1) — **run PageSpeed Insights now to know if this elevates**
11. Thin-content sweep (3.5) — gated on GSC Coverage data
12. Next 6 articles (3.2) — gated on first 6 showing impressions
13. Public-data synthesis report (3.3)
14. aggregateRating (3.4) — gated on review volume

---

## Implementation notes for the builder

When a Tier 1.3, 1.4, 2.4, 3.1, 3.3, 3.4, or 3.5 item is promoted:

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
| Resource page pattern | `app/app/resources/[slug]/page.tsx` + `app/lib/marketing/resource-data.ts` |
| Competitor page pattern | `app/app/alternatives/[slug]/page.tsx` + `app/lib/marketing/competitor-data.ts` |

Never bypass `getAppOrigin()` for canonical URL construction. Never introduce new heavy dependencies without adding to `experimental.optimizePackageImports`. Always run `npm run check` before marking an item done.
