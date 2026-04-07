# Veld Portfolio — Growth, Pricing & Market Research

> Living document. Last updated: April 6, 2026.

---

## Table of Contents

1. [SEO & Indexing Status](#seo--indexing-status)
2. [Market Size & Target Audience](#market-size--target-audience)
3. [Competitive Landscape](#competitive-landscape)
4. [Valuation (Pre-Revenue)](#valuation-pre-revenue)
5. [Niche Assessment](#niche-assessment)
6. [Product Positioning Assessment](#product-positioning-assessment)
7. [Pricing Model Research](#pricing-model-research)
8. [Conversion Math](#conversion-math)
9. [Retention & Data Hooks](#retention--data-hooks)
10. [Ad Creative & Distribution](#ad-creative--distribution)
11. [Sources](#sources)

---

## SEO & Indexing Status

**Audited: April 6, 2026**

Google Search Console for veldportfolio.com shows:

| Issue | Pages | Status | Intentional? |
|---|---|---|---|
| Page with redirect | 2 | Validation started 4/6/26 | Yes — `http://` and `http://www` → `https://` |
| Excluded by 'noindex' tag | 1 | Not started | Yes — contact page, sign-in/up, LP, app routes |
| Blocked by robots.txt | 1 | Not started | Yes — app/auth routes blocked in `robots.ts` |
| Discovered - currently not indexed | 206 | Not started | Mostly expected — location pages + app routes |

**Configuration verified:**
- `NEXT_PUBLIC_APP_URL` = `https://veldportfolio.com` (correct, no www, no trailing slash)
- `robots.ts` allows `/` and blocks `/dashboard`, `/properties`, `/settings`, `/sign-in`, `/sign-up`, `/api/`, etc.
- `sitemap.ts` includes all public marketing pages, tool pages, location pages, alternatives, vs pages, resources
- Root `layout.tsx` has Open Graph, Twitter cards, JSON-LD (Organization, WebSite, WebApplication)
- All public pages have canonical URLs via `getAppOrigin()`
- App shell `(app)/layout.tsx` has `robots: { index: false, follow: false }` — correct
- Additional `noindex` on: `/contact`, `/sign-in`, `/sign-up`, `/lp/investment-property-calculator`, `/billing/success`, in-app calculator routes

**Action items:**
- Monitor the 206 "Discovered - currently not indexed" pages — confirm they're location calc pages + app routes, not marketing pages we want indexed.

---

## Market Size & Target Audience

### US Landlord Population

| Segment | Count | % of total |
|---|---|---|
| Total US landlords (2024) | 9.72 million | 100% |
| Own 1 unit | ~4.08M | 42% |
| Own 2–4 units | ~3.21M | 33% |
| Own 5–10 units | ~1.56M | 16% |
| **Total 1–10 units (Veld's target)** | **~8.85M** | **91%** |
| Own 11+ units | ~0.87M | 9% |

Sources: [iPropertyManagement 2026](https://ipropertymanagement.com/research/landlord-statistics), [DoorLoop 2026](https://doorloop.com/blog/landlord-statistics)

### Behavioral Signals

- 47% of landlords have managed properties for 3 years or less — newer investors still forming tool habits ([Avail 2026 Survey](https://www.avail.com/education/articles/2026-independent-landlord-survey), n=4,055)
- 54% are "intentional investors" (up from 49% in 2021) — growing segment that cares about analytics
- 33% plan to acquire more property in next 24 months — deal analysis audience
- 58% plan to buy more rentals or do 1031 exchange in 2026 ([Hemlane 2026 Report](https://www.hemlane.com/resources/2026-rental-owner-report/), n=2,870)
- 52% of Redditors own property; 14% more likely to buy another in 3–6 months ([Reddit Business](https://www.business.reddit.com/learning-hub/articles/boost-your-real-estate-marketing-roi-with-reddit))

### Addressable Market Estimate

If 1% of 8.85M landlords are "analytics-minded" (care about portfolio metrics beyond basic bookkeeping): **~88,500 potential users**. Veld needs 67 paying at $15/mo for $1K MRR = 0.076% capture rate.

---

## Competitive Landscape

### Direct Competitors (Operations-First)

| Product | Users | Free tier | Pricing | Core focus |
|---|---|---|---|---|
| **Stessa** (Roofstock) | 350K+ | Yes (1 portfolio) | $12–$35/mo | Bookkeeping, tax reporting, bank sync, rent collection |
| **Baselane** | 50K+ | Yes (core features) | $20/mo premium | Banking, bookkeeping, rent collection, accounting |
| **Landlord Studio** | — | Yes | $12/mo+ | Mobile expense tracking |
| **DoorLoop** | — | No | $69/mo+ | Full PM, automation |
| **TenantCloud** | — | 14-day trial | $18/mo+ | Budget PM |

### Veld's Differentiation

Veld is **analytics-first, operations-free**. Does not do rent collection, bank sync, or accounting.

**What Veld does that competitors don't center on:**
- Portfolio-level metrics as primary view (equity, cash flow, cap rate, LTV, DSCR, CoC)
- Deal underwriting with save/compare/promote workflow
- Scenario modeling (5/10/20-year projections)
- Rent vs. market benchmarking (RentCast)
- Mortgage amortization and payoff tracking

**Gaps / risks:**
- Stessa and Baselane are adding analytics features (rental comps, performance dashboards)
- No bank sync = no recurring data hook pulling users back
- "Complement, not replace" positioning = Veld is the second tool, not the first
- Manual data entry creates retention headwind

---

## Valuation (Pre-Revenue)

**Current state:** 6 users, 0 paying, mature codebase.

### Asset Sale Range: $5,000–$25,000

| Factor | Impact |
|---|---|
| Zero revenue | Valued at "cost of code" — $1K–$5K baseline |
| Modern tech stack (Next.js 16, Prisma, Clerk, Stripe) | +0.3x multiple premium per [Exit Street](https://blog.exit.st/micro-saas-valuation-multiples-2026/) |
| Extensive feature set (amortization engines, RentCast API, CSV import/export, full billing, PostHog, cookie consent, mobile-responsive design system) | Pushes toward $15K–$25K |
| Comprehensive documentation + SEO infrastructure | Reduces buyer risk |
| No paying users | Caps at "code acqui-hire" pricing |

### Comparable Listings on Acquire.com

- AI email outreach engine (Rails, production-ready, 0 users): [$18K](https://app.acquire.com/startup/fegpeu44v2-pre-revenue-turnkey-ai-native-email-outreach-engine-skip-80k-in-r-d-launch-your-saas-today)
- Full e-commerce/CRM stack (web + mobile, $200K+ invested): [$79K](https://app.acquire.com/startup/n1rhobzugh-asset-sale-full-e-commerce-crm-tech-stack-web-ios-android-global-english-ready)
- Pre-revenue products on Acquire.com typically sell $600–$5K ([Acquire.com FAQ](https://help.acquire.com/seller-faqs-1))

### Revenue Inflection Point

At $1K MRR ($12K ARR), valuation jumps to $36K–$60K (3–5x SDE). Getting to even minimal revenue is the single highest-leverage thing for valuation.

References: [Micro-SaaS Valuation Guide](https://www.saasvaluation.app/resources/micro-saas-valuation), [Flippa SaaS M&A Guide](https://flippa.com/blog/the-ultimate-guide-to-saas-mergers-and-acquisitions/)

---

## Niche Assessment

**Verdict: Real niche, narrow but viable.**

### Strengths
- The "investor mindset" landlord (cares about portfolio performance, not just rent deposits) is a real persona visible across r/realestateinvesting, r/Landlord, BiggerPockets
- Deal underwriting is Veld's strongest differentiator — Stessa/Baselane are weakest here
- 91% of landlords own 1–10 units; 58% plan to acquire more in 2026
- "Spreadsheet replacement" messaging has proven product-market fit signal (every competitor leads with it)

### Weaknesses
- Addressable market is a subset of a subset (analytics-minded landlords who don't need full PM)
- No bank sync = no daily data hook = retention risk
- Incumbents are encroaching (Stessa adding analytics features)
- "Second tool" positioning harder to monetize than "primary tool"

### Recommended Focus
1. Lean into deal underwriting — clearest competitive gap
2. Consider lightweight data hook (email digest, value estimate refresh) to drive return visits
3. Get to $1K MRR fast — proves the niche, changes valuation math, enables iteration

---

## Product Positioning Assessment

**Updated: April 6, 2026**

### Target Customer Profile

> A landlord with 2–5 rental properties who tracks their numbers in a spreadsheet (or doesn't track at all), who periodically wonders "am I actually doing well?", and who is actively evaluating whether to buy another property. They don't want or need rent collection, tenant screening, or accounting software. They want to know their cap rate, cash-on-cash return, equity position, and whether their rent is above or below market.

This person is visible across r/realestateinvesting, r/Landlord, and BiggerPockets. They post things like "How do I track my rental portfolio metrics?" and "What's a good cap rate?" and "Should I buy another property or pay down my mortgage?"

### Positioning: Analytics-First, Operations-Free

Stessa and Baselane are **operations tools that happen to have dashboards**. Veld is an **analytics tool with no operations**. This is a weakness at enterprise scale but an advantage for a specific buyer:

1. **The landlord who already has a PM tool or property manager** — doesn't need another rent collection system. Needs to understand their returns. Veld slots in alongside whatever they already use.
2. **The landlord evaluating their next deal** — Stessa's "deal finding" is Roofstock listings. Veld lets you underwrite *any* deal with your own assumptions, save it, compare it, and promote it to your portfolio. That workflow doesn't exist in Stessa or Baselane.
3. **The landlord who just wants the investor math** — cap rate, CoC, DSCR, equity, LTV, scenario modeling. Not looking for software. Looking for the answer to "how am I doing?"

### Why $1K–$5K MRR Is Achievable

- At $15/month, need 67–333 paying users = **0.00076%–0.0038%** of 8.85M addressable market
- Every competitor leads with "replace your spreadsheet" because it works — the pain is real and widespread
- 47% of landlords are new (3 years or less, still forming tool habits)
- $15/month is impulse-level for someone collecting $2,000+/month in rent
- Public calculators are a real acquisition channel targeting people actively evaluating deals
- At $5K MRR, Veld is invisible to Stessa/Baselane — they're fighting each other for the all-in-one market

### Honest Risks

1. **Distribution is the only real bottleneck.** Product works. Positioning is sound. Price point is right. But if nobody sees it, none of that matters. Reddit ads + SEO need sustained effort over months, not weeks. Don't judge results in 2 weeks.
2. **Retention without a data hook.** Biggest structural weakness. Stessa/Baselane users open the app because new bank transactions appeared. Veld users have to choose to come back. See [Retention & Data Hooks](#retention--data-hooks) section for mitigation plan.
3. **The "good enough free" trap.** If free tier is too generous after reverse trial downgrade, people won't upgrade. Locking 2nd+ properties (with data preserved) is the right move — real loss, not theoretical.
4. **Time.** Median micro-SaaS with a trial model takes 4 months to hit $1K MRR. With lower traffic, expect 6–9 months. That's the honest timeline.

### What NOT to Worry About

- **Stessa/Baselane "eating your lunch"** — at $5K MRR, you're invisible to them.
- **Market too small** — 67–333 people out of 8.85 million is a rounding error.
- **Product quality** — codebase is mature, UI is clean, math engines work, SEO infrastructure is in place.

### Verdict

Product positioning — "portfolio analytics and deal underwriting for small landlords, not a PM platform" — is legitimate, defensible at this scale, and targets a real buyer who exists in large numbers. $1K MRR requires finding 67 of them. $5K MRR requires 333. Given 8.85 million potential customers and active distribution, that's a distribution execution challenge, not a product-market fit question.

---

## Pricing Model Research

### Current Model: Freemium

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 1 property, 5 saved deals |
| Investor | $15/mo ($150/yr) | 5 properties, 20 saved deals |
| Pro | $29/mo ($290/yr) | 20 properties, 50 saved deals |

### Problems with Current Freemium

1. A landlord with 1 property gets enough value on free to never upgrade
2. No viral loop — free users don't expose Veld to other users
3. No data hook pulling users back (unlike Stessa/Baselane bank sync)
4. Freemium micro-SaaS conversion: 0.3–1.2% per [MicroNicheBrowser](https://micronichebrowser.com/blog/freemium-vs-paid-only-micro-saas-revenue-data) (412 products analyzed)
5. Median time to $1K MRR with freemium: **9.4 months**

### Recommended Model: Reverse Trial

New users sign up (no CC) → get full Investor-tier access for 14 days → auto-downgrade to free tier → can upgrade anytime.

**Why reverse trial fits Veld:**

| Factor | How reverse trial addresses it |
|---|---|
| Low traffic / few signups | Every signup converts at 3–6x higher rate. Each Reddit ad click counts more. |
| Fear of scaring people off | No CC required. Same friction as current signup. Free tier still exists forever. |
| Free tier is "good enough" | Users taste 5-property experience first. Losing it triggers loss aversion (2–2.5x stronger than gain motivation). |
| No viral loop | Doesn't need one — conversion happens via individual product experience, not network effects. |

### Conversion Rate Benchmarks (2026)

| Model | Conversion rate | Time to convert | Source |
|---|---|---|---|
| Freemium | 2–5% | 3–12 months | [IdeaPlan](https://www.ideaplan.io/compare/freemium-vs-free-trial), [ChartMogul](https://chartmogul.com/reports/saas-conversion-report/) |
| Free trial (no CC) | 10–25% | During trial (14 days) | [IdeaPlan](https://www.ideaplan.io/compare/freemium-vs-free-trial), [Monolit](https://monolit.sh/blog/freemium-vs-free-trial-which-pricing-model-is-better-for-saas-2026) |
| **Reverse trial** | **8–15% (up to 30%)** | **During trial or post-downgrade** | [IdeaPlan](https://www.ideaplan.io/compare/reverse-trial-vs-freemium), [PLG Handbook](https://plghandbook.com/reverse-trial/) |

### Post-Trial Drop-Off Data

- Average SaaS trial churn: **60–75%** (i.e., 25–40% convert) — [TrialMoments](https://www.trialmoments.com/reduce-trial-churn-rate), 40K+ trials analyzed
- With reverse trial, non-converters stay on free tier (not lost entirely)
- Free trial products get ~45 signups per 1,000 visitors vs freemium's ~90 — roughly half the signup rate ([ChartMogul](https://chartmogul.com/reports/saas-conversion-report/))
- But 2–5x higher conversion means net paying customers are equal or better
- **Databox case study**: switching to reverse trial doubled free-to-paid from 10% to 25%. Downgraded users retained higher engagement than pure freemium users. ([GTM Strategist](https://knowledge.gtmstrategist.com/p/reverse-trials-best-practices-for-saas-companies))
- **Toggl case study**: switched from freemium to reverse trial, doubled conversion ([Orb](https://www.withorb.com/blog/reverse-trial-saas))

### Companies Using Reverse Trials

Airtable (14-day Pro trial → free), Loom (Business trial → Starter), Canva (Pro trial → free), Calendly (14-day premium → downgrade), Toggl (30-day → free), Notion (team trial → free). Landager (landlord software, direct competitor) uses [this exact model](https://landager.com/en/pricing).

### What Users Lose on Downgrade (Proposed)

Must create "dependency-creating" features during trial:
- Only 1 property visible (others locked but data preserved)
- Limited deal saves
- No scenario modeling projections
- No/limited rent vs. market benchmarks
- Data is preserved — upgrade to unlock

### Median Time to $1K MRR by Pricing Model

| Model | Median months | Source |
|---|---|---|
| Paid-only (CC required) | 3.2 | [MicroNicheBrowser](https://micronichebrowser.com/blog/freemium-vs-paid-only-micro-saas-revenue-data) |
| Paid-only (14-day trial, no CC) | 4.1 | MicroNicheBrowser |
| Freemium (usage-limited) | 7.8 | MicroNicheBrowser |
| Freemium (feature-limited) | 9.4 | MicroNicheBrowser |

---

## Conversion Math

### Path to $1K MRR ($15/mo Investor plan)

Need: **67 paying users**

| Model | Conversion rate | Signups needed | Visitor-to-signup | Visitors needed |
|---|---|---|---|---|
| Current freemium | 2–5% | 1,340–3,350 | 9% | 14,900–37,200 |
| Reverse trial (conservative 10%) | 10% | 670 | 4.5% | 14,900 |
| Reverse trial (median 15%) | 15% | 447 | 4.5% | 9,900 |
| Free trial hard cutoff (20%) | 20% | 335 | 4.5% | 7,400 |

**Key insight:** Reverse trial needs similar total visitors as freemium, but converts them faster (weeks vs months) and provides revenue signal immediately.

### What 100 Signups Produces

| Model | Paid users | MRR |
|---|---|---|
| Current freemium (3%) | 3 | $45 |
| Reverse trial (10%) | 10 | $150 |
| Reverse trial (15%) | 15 | $225 |

### Drop-Off Reality Check

Of 100 reverse trial signups:
- ~4.5% of site visitors sign up (vs 9% for freemium) — so you need 2x the traffic for equal signups
- 10–15 convert to paid within 30 days
- 60–75 don't convert but **stay on free tier** (data preserved, can convert later)
- 15–25 leave entirely (never activated, didn't reach aha moment)
- Long-tail conversions from free tier continue for months

---

## Retention & Data Hooks

**Audited: April 6, 2026**

### Current State: No Automated Data Refresh

| System | Current behavior |
|---|---|
| **Equity calculation** | `estimatedValue - totalMortgageBalance`. Both from user-entered data. Mortgage balance is amortization-derived from loan fields. Estimated value is static after initial entry. |
| **RentCast (value/AVM)** | On-demand only — fetched during property creation/editing forms. **Never re-fetched** after initial entry. |
| **RentCast (rent benchmark)** | On-demand + dashboard auto-refresh for up to 3 stale properties **on page load only**. No cron. |
| **Emails** | Onboarding re-engagement (day 3, day 7) for users with zero properties. No portfolio digests. No value alerts. |
| **Cron jobs** | 2 total: onboarding emails (daily) + rate limit cleanup (hourly). Neither touches property data. |

**This is the biggest retention gap.** Once a user sets up their properties, the app has no mechanism to reach out again. Data sits static until they manually return.

### Recommended Data Hooks (Ranked by Impact-to-Effort)

#### Tier 1 — High Impact, Low Effort

**1. Monthly Portfolio Digest Email**
A cron-driven email: "Your portfolio this month: Total equity $X, Cash flow $Y/mo, Cap rate Z%. [Property name] rent is X% below market."

- Doesn't require new data — just compute from existing stored metrics
- Resend is already set up for email delivery
- [Sequenzy 2026 guide](https://www.sequenzy.com/for/increase-product-usage): "Instead of asking users to come back, deliver value directly to their inbox. The Weekly Digest."
- Even with static numbers, framing as "monthly snapshot" creates a recurring touchpoint
- Implementation: 1 cron route + 1 email template + metrics aggregation query

**2. Automated Monthly Property Value Re-Fetch**
Monthly cron calls RentCast AVM for each user's properties, updates `currentEstimatedValue`, recalculates equity.

- [Smart Rental Investor](https://smartrentalinvestor.com/features/portfolio-tracking) uses this as primary retention pitch: "Get monthly updates on rent estimates and property values automatically"
- Transforms Veld from "enter data once, see static numbers" → "your numbers update every month"
- Cost: ~5 RentCast API calls per user per month. Gate behind paid tiers to control cost.
- Implementation: 1 cron route, iterate paid users' properties, call `fetchValueEstimate`, update `currentEstimatedValue`

**3. Value/Equity Change Notification**
After monthly re-fetch, email if equity changed > $X or Y%: "Your portfolio equity increased $12,400 this month."

- This is the "new data appeared" hook that Stessa/Baselane get from bank sync — achieved without bank sync
- Combines hooks 1 + 2 into a compelling pull mechanism
- Implementation: diff old vs new value, conditional email send

#### Tier 2 — Medium Impact, Medium Effort

**4. Rent vs. Market Alert**
Monthly re-fetch rent estimates. If property rent < market by >5%, email: "Oak Street Duplex rent is 8% below market — consider a rent adjustment."

- Actionable insight, not just a number — user has a reason to log in
- Rent benchmark infrastructure already exists (dashboard auto-refresh), just needs cron wrapper

**5. Mortgage Milestone Notifications**
"You crossed 50% LTV on Pine Cottage" or "Oak Street Duplex balance is now under $200K."

- Zero API cost — computed from existing amortization data
- Creates emotional progress milestones that drive engagement

**6. Deal Alert Digest**
For users with saved deals: "Your saved deal on [address] — numbers updated with today's rates."

- Targets the "evaluating next purchase" persona specifically
- Re-runs deal analysis with current interest rate data

#### Tier 3 — Higher Effort, Strategic Value

**7. Local Market Trend Digest**
"Cap rates in [zip code] averaged X% this quarter. Your portfolio is above/below average."

- Requires external data aggregation
- Positions Veld as intelligence tool, not just a tracker

#### Why RentCast Is the Right API Choice

Zillow Zestimate API is [effectively closed to indie developers as of 2026](https://dev.to/agenthustler/zillow-scraping-in-2026-anti-bot-defenses-api-alternatives-and-benchmark-results-17ll) — reserved for MLS members and licensed brokers, prohibits storing data, and requires linking back to Zillow. Redfin has no official public API. RentCast is the only option that (a) is available to indie devs, (b) allows storing values in your database, (c) has transparent pricing, and (d) is affordable at scale.

**RentCast cost for monthly AVM re-fetch:**

| Paying users | Properties | Monthly calls | Best plan | Cost | % of MRR |
|---|---|---|---|---|---|
| 10 | 40 | 40 | Developer ($0) | $0 | 0% |
| 20 | 80 | 80 | Developer ($0) | ~$6 | 2% |
| 67 ($1K MRR) | 268 | 268 | Developer ($0) | ~$44 | 4.4% |
| 67 ($1K MRR) | 268 | 268 | Foundation ($74) | $74 | 7.4% |
| 333 ($5K MRR) | 1,332 | 1,332 | Foundation ($74) | ~$94 | 1.9% |

### Priority Implementation Order

1. **Monthly digest email** — lowest effort, immediate retention impact, no new API calls
2. **Monthly AVM re-fetch** (paid users only) — creates the "new data" pull mechanism
3. **Value change notification** — combine with #1 and #2
4. **Rent vs. market alert** — extend existing benchmark infrastructure
5. **Mortgage milestones** — zero-cost engagement hook
6. **Local market trends** — positions Veld as intelligence, not just a tracker

### Competitor Comparison: Data Hooks

| Feature | Stessa | Baselane | Veld (current) | Veld (proposed) |
|---|---|---|---|---|
| Auto-updated property values | Via bank sync | Via bank sync | None | Monthly RentCast AVM |
| Transaction sync | Daily (Plaid) | Daily (Plaid) | None | N/A (not our space) |
| Email digest | Monthly report | Weekly summary | Day 3/7 onboarding only | Monthly portfolio digest |
| Market rent alerts | No | No | No | Rent vs. market notifications |
| Equity tracking | Auto from bank data | Auto from bank data | Static from user entry | Monthly recalculated |

---

## Ad Creative & Distribution

### Ad Creatives Produced (April 6, 2026)

**Running:**
1. **Ideogram ad** — "Finally know if your rental is actually performing" + metric widget + logo
   - Headline: "I built a tool to track if my rentals are actually performing"
   - A/B headlines: "Still tracking your rentals in a spreadsheet?" / "Free portfolio tracker for landlords with 1–10 properties"

2. **Blumpo ad** — "Still using spreadsheets?" + before/after with UI screenshots
   - Headline: "Still tracking your rentals in a spreadsheet?"
   - A/B headlines: "My rental spreadsheet finally broke — here's what I switched to" / "Spreadsheets break when you add your 3rd property"

### Tools Used

- [Blumpo](https://www.blumpo.com/) — AI ad generator using Reddit/social insights, $17/mo for 100 ads, free tier available
- [Ideogram](https://ideogram.ai/) — AI image gen, best for legible text in images, free tier at 85% quality (sufficient for Reddit)
- [AdShot](https://adshot.co/) — paste URL → get ads for 13 platforms, free 5 credits

### Reddit Ad Best Practices (2026)

- Headlines under 150 characters ([Reddit internal data](https://www.theredditmarketingagency.com/post/write-high-performing-reddit-posts))
- First-person, sounds like organic post (not marketer voice)
- Lead with value/numbers, not promotion
- Questions or story framing outperform imperatives
- Ads that look like content, not ads, get highest CTR
- Message match between ad image → headline → landing page
- Give 7+ days before judging performance
- Target subreddits: r/realestateinvesting (600K), r/Landlord (200K), r/RealEstate (700K)
- Budget: $50–$150/day per campaign for learning phase ([SubredditSignals](https://subredditsignals.com/blog/reddit-ads-best-settings-2026-the-complete-data-driven-playbook-for-saas-founders-max-campaigns-bidding-targeting-creative-and-roi-benchmarks))

### Distribution Channels

| Channel | Status | Notes |
|---|---|---|
| Reddit Ads | Running (2 creatives) | Targeting RE investing subreddits |
| SEO (location pages) | 200+ pages in sitemap, awaiting indexing | "investment property calculator [state]" queries |
| Landing page (veldportfolio.com) | Live | Strong message match for both ads |
| TikTok | Guide exists (`docs/tiktok-ad-guide.html`) | Not yet running |

---

## Sources

### Market Data
- [iPropertyManagement — Landlord Statistics 2026](https://ipropertymanagement.com/research/landlord-statistics)
- [DoorLoop — Landlord Stats & Trends](https://doorloop.com/blog/landlord-statistics)
- [Avail — 2026 Independent Landlord Survey (n=4,055)](https://www.avail.com/education/articles/2026-independent-landlord-survey)
- [Hemlane — 2026 Rental Owner Report (n=2,870)](https://www.hemlane.com/resources/2026-rental-owner-report/)
- [Reddit Business — Real Estate Marketing ROI](https://www.business.reddit.com/learning-hub/articles/boost-your-real-estate-marketing-roi-with-reddit)

### Valuation
- [SaaS Valuation App — Pre-Revenue SaaS Valuation](https://www.saasvaluation.app/resources/valuation-for-pre-revenue-saas)
- [Exit Street — Micro-SaaS Valuation Multiples 2026 (247 deals)](https://blog.exit.st/micro-saas-valuation-multiples-2026/)
- [Flippa — SaaS M&A 2026](https://flippa.com/blog/the-ultimate-guide-to-saas-mergers-and-acquisitions/)
- [Acquire.com — Seller FAQ](https://help.acquire.com/seller-faqs-1)
- [SaaS Valuation App — Micro-SaaS Valuation Guide](https://www.saasvaluation.app/resources/micro-saas-valuation)

### Pricing Model
- [MicroNicheBrowser — Freemium vs Paid-Only (412 products)](https://micronichebrowser.com/blog/freemium-vs-paid-only-micro-saas-revenue-data)
- [Mewayz — Free Tier Conversion Rates (138K+ users)](https://mewayz.cloud/en/blog/free-tier-conversion-rates-across-saas-what-the-data-actually-shows)
- [IdeaPlan — Freemium vs Free Trial](https://www.ideaplan.io/compare/freemium-vs-free-trial)
- [IdeaPlan — Reverse Trial vs Freemium](https://www.ideaplan.io/compare/reverse-trial-vs-freemium)
- [PLG Handbook — Reverse Trial](https://plghandbook.com/reverse-trial/)
- [Monolit — Freemium vs Free Trial 2026](https://monolit.sh/blog/freemium-vs-free-trial-which-pricing-model-is-better-for-saas-2026)
- [SaaS Factor — Freemium vs Trial Conversions](https://www.saasfactor.co/blogs/freemium-vs-trial-models-in-saas-what-really-boosts-conversions)
- [ChartMogul — SaaS Conversion Report](https://chartmogul.com/reports/saas-conversion-report/)

### Trial Churn / Retention
- [TrialMoments — Reduce Trial Churn Rate (40K+ trials)](https://www.trialmoments.com/reduce-trial-churn-rate)
- [GTM Strategist — Reverse Trials Best Practices (Databox case study)](https://knowledge.gtmstrategist.com/p/reverse-trials-best-practices-for-saas-companies)
- [Orb — Reverse Trial for SaaS (Toggl, Calendly examples)](https://www.withorb.com/blog/reverse-trial-saas)
- [Thoughtlytics — Reverse Trial Guide](https://www.thoughtlytics.com/blog/reverse-trial-model-saas)

### Reddit Ads
- [SubredditSignals — Reddit Ads Settings for SaaS 2026](https://subredditsignals.com/blog/reddit-ads-best-settings-2026-the-complete-data-driven-playbook-for-saas-founders-max-campaigns-bidding-targeting-creative-and-roi-benchmarks)
- [GrowReddit — Reddit Advertising Guide 2026](https://www.growreddit.com/blog/reddit-advertising-guide)
- [The Reddit Marketing Agency — High Performing Posts](https://www.theredditmarketingagency.com/post/write-high-performing-reddit-posts)
- [MarketerHire — Reddit Ads Strategy 2026](https://marketerhire.com/blog/reddit-ads-strategy)
- [Reddit Business — PPC Strategy for Real Estate](https://www.business.reddit.com/learning-hub/articles/ppc-strategy-for-real-estate-professionals)

### Retention & Data Hooks
- [Sequenzy — Increase SaaS Product Usage With Email (2026)](https://www.sequenzy.com/for/increase-product-usage)
- [SaaS Retention Tools 2026 — Best Tools Guide](https://www.saasretentiontools.com/)
- [Custify — 14 SaaS Retention Strategies 2026](https://www.custify.com/blog/14-customer-retention-strategies-for-saas-you-can-implement-today/)
- [SmashSend — 10 SaaS Customer Retention Strategies](https://smashsend.com/blog/saas-customer-retention-strategies)
- [Smart Rental Investor — Auto-Updated Portfolio Tracking](https://smartrentalinvestor.com/features/portfolio-tracking)
- [PropertyTools — AI-Powered Rental Property Tracker](https://www.propertytools.ai/)
- [Zillow Zestimate API — Closed to Indie Devs, MLS/Broker Only](https://www.zillowgroup.com/developers/api/zestimate/zestimates-api/)
- [DEV Community — Zillow API Status 2026 (effectively closed)](https://dev.to/agenthustler/zillow-scraping-in-2026-anti-bot-defenses-api-alternatives-and-benchmark-results-17ll)

### Competitive
- [Stessa](https://www.stessa.com/)
- [Baselane](https://www.baselane.com/)
- [Baselane — Best RE Portfolio Management Software 2026](https://www.baselane.com/resources/best-real-estate-portfolio-management-software)
- [Baselane — 15 Best Landlord Software 2026](https://www.baselane.com/resources/15-best-landlord-software-platforms)
- [RealEstateBees — Baselane vs Stessa 2026](https://realestatebees.com/compare/software/baselane-vs-stessa/)
- [Landager — Pricing (reverse trial example)](https://landager.com/en/pricing)
