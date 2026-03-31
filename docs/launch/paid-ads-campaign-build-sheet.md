# Paid Ads Campaign Build Sheet

Use this to build campaigns in Google Ads and Meta without improvising.

Related:
- `docs/launch/paid-ads-test-plan.md`
- `docs/launch/analytics.md`

---

## 1) Budget presets

Choose one and mirror daily caps in ad platforms.

- Lean: $350-$500 total (14 days)
- Balanced: $900-$1,400 total (14 days)
- High-learning: $2,000-$3,000 total (14 days)

Daily budget formula:
- `total_budget / 14 = daily_budget`

Balanced example at $1,120 total:
- daily budget: $80/day
  - Google Search 60%: $48/day
  - Meta Prospecting 25%: $20/day
  - Retargeting 15%: $12/day

---

## 2) UTM standards for all ad links

Format:

`https://veldportfolio.com/?utm_source=<source>&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=<variant>`

Examples:
- Google search spreadsheet ad:
  - `utm_source=google&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=search_spreadsheet_v1`
- Meta prospecting (portfolio-first — use one `utm_content` per ad/creative):
  - `utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_landing_spreadsheet_v1`
  - `utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_landing_portfolio_v1`
  - `utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_landing_dealworkflow_v1`
- Retargeting ad:
  - `utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=retarget_nocard_v1`

---

## 3) Google Search build — step-by-step

### How Google Ads is structured (read this first)

```
Account
└── Campaign  ← sets budget, network (Search), bidding
    └── Ad Group  ← a themed cluster of keywords + the ads that show for them
        ├── Keywords  ← what searches trigger your ad
        └── Ad (RSA)  ← the actual headline/description shown
```

**You will create 3 campaigns. Inside those campaigns you will create 5 ad groups total.**
Each ad group = one themed keyword cluster + one RSA ad written for that theme.

---

### 3.1 Create Campaign 1: Portfolio Tracker Intent

In Google Ads: **Campaigns → + New Campaign**

Settings to enter:
- Goal: **Create a campaign without a goal's guidance**
- Campaign type: **Search**
- Name: `Search | Portfolio Tracker Intent`
- Networks: uncheck "Display Network", uncheck "Search Network partners" (Search only)
- Bidding: **Maximize clicks** (for now — switch to Target CPA later once you have conversion data)
- Budget: set your daily amount (use Section 1 budget presets to decide)
- Location: United States (or wherever your target audience is)
- Languages: English

**Save and continue — this takes you into creating your first ad group.**

---

#### Ad Group A — Spreadsheet Alternative (inside Campaign 1)

Ad group name: `Spreadsheet Alternative`

Keywords to add (use **phrase match** — wrap each in quotes):
```
"rental portfolio spreadsheet alternative"
"rental property spreadsheet alternative"
"landlord spreadsheet alternative"
"rental tracking software for investors"
"replace rental spreadsheet"
```

**Create the RSA ad for this ad group:**

Headlines (add all of these — Google will mix and match):
```
Replace Rental Spreadsheets
Track Your Rental Portfolio
One Dashboard, All Properties
See Equity And Cash Flow
Built For Small Landlords
Free Plan, No Credit Card
Start In Under 60 Seconds
Portfolio Analytics Tool
Stop Using Spreadsheets
```

Descriptions (add 2-4):
```
Track equity, debt, and cash flow across all your properties in one workspace.
Replace spreadsheets with one clear view of your rental portfolio. Start free.
See property value, rent estimates, and performance without building formulas.
No credit card required for the free plan. Set up in about 60 seconds.
```

Final URL:
```
https://veldportfolio.com/?utm_source=google&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=search_spreadsheet_v1
```

**Save → then click "+ New ad group" to create Ad Group B in the same campaign.**

---

#### Ad Group B — Portfolio Tracking (inside Campaign 1)

Ad group name: `Portfolio Tracking`

Keywords (phrase match):
```
"rental portfolio tracker"
"real estate portfolio dashboard"
"track rental property cash flow"
"rental property analytics software"
"landlord portfolio tracker"
```

**RSA ad for this ad group:**

Headlines:
```
Track Your Rental Portfolio
Rental Portfolio Dashboard
Cash Flow Across Properties
Rental Property Analytics Tool
Free Plan, No Credit Card
Built For Small Investors
Equity And Debt At A Glance
Portfolio Metrics In One Place
Replace Your Spreadsheet
```

Descriptions:
```
Track equity, debt, and cash flow across every rental property in one dashboard.
See portfolio-level and property-level metrics without spreadsheet sprawl. Start free.
Market rent estimates, mortgage tracking, and deal analysis in one workspace.
Free to start. No credit card required.
```

Final URL:
```
https://veldportfolio.com/?utm_source=google&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=search_portfolio_v1
```

**Campaign 1 is done. Now create Campaign 2.**

---

### 3.2 Create Campaign 2: Calculator Intent

**Campaigns → + New Campaign** — same settings as Campaign 1 except:
- Name: `Search | Calculator Intent`
- Budget: slightly lower than Campaign 1 (see Section 1 split)

---

#### Ad Group C — Investment Property Calculator (inside Campaign 2)

Ad group name: `Investment Property Calculator`

Keywords (phrase match):
```
"investment property calculator"
"real estate investment calculator"
"rental property calculator"
"investment calculator for rental property"
"rental property return calculator"
```

**RSA ad:**

Headlines:
```
Investment Property Calculator
Free Rental Calculator
Calculate Cash Flow Instantly
Cap Rate And DSCR Calculator
Analyze Deals Before You Buy
See Cash Flow In Seconds
Free Plan, No Credit Card
Save Your Analysis In Veld
For Real Estate Investors
```

Descriptions:
```
Free calculator for cash flow, cap rate, DSCR, and cash-on-cash return. No signup required.
Enter your assumptions and see rental property returns instantly. Save results free.
Quick rental deal math — then save your analysis and compare properties in Veld.
Start free. No credit card required. Results in seconds.
```

Final URL:
```
https://veldportfolio.com/investment-property-calculator?utm_source=google&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=calcu_control_v1
```

**Save → + New ad group for Ad Group D.**

---

#### Ad Group D — Rental Analysis Calculator (inside Campaign 2)

Ad group name: `Rental Analysis Calculator`

Keywords (phrase match):
```
"real estate analysis calculator"
"landlord calculator"
"property analysis calculator"
"calculate profit on rental property"
"rental income calculator"
```

**RSA ad:**

Headlines:
```
Rental Property Analysis Tool
Calculate Rental Profit Fast
Free Landlord Calculator
Analyze Rental Income Quickly
Cash Flow And Cap Rate Tool
Free Plan, No Credit Card
See Returns Before You Buy
Rental Analysis Made Simple
Investment Property Math Tool
```

Descriptions:
```
Calculate rental income, expenses, and returns before making an offer. Free to use.
Instant cash flow, cap rate, and DSCR estimates for any rental property deal.
Run the numbers on any rental property in seconds. Save your analysis free.
No credit card required. Start analyzing deals today.
```

Final URL:
```
https://veldportfolio.com/investment-property-calculator?utm_source=google&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=calcu_control_v1
```

**Campaign 2 is done. Now create Campaign 3.**

---

### 3.3 Create Campaign 3: Brand + High Intent Exact

**Campaigns → + New Campaign** — same settings except:
- Name: `Search | Brand + HighIntent Exact`
- Budget: smallest of the three (15% of total — see Section 1)

---

#### Ad Group E — Deal Analyzer High Intent (inside Campaign 3)

Ad group name: `Deal Analyzer High Intent`

Keywords — use **exact match** here (wrap in square brackets):
```
[real estate deal analyzer]
[analyze real estate deal]
[multifamily deal analyzer]
[multifamily analysis tool]
[rental deal analyzer]
```

**RSA ad:**

Headlines:
```
Real Estate Deal Analyzer
Analyze Deals Before You Buy
Multifamily Deal Analysis Tool
Cap Rate DSCR And Cash Flow
Free Deal Analyzer Tool
Save And Compare Deals
No Credit Card Required
Built For Small Investors
Full Portfolio Workspace
```

Descriptions:
```
Analyze rental and multifamily deals with cash flow, cap rate, DSCR, and more. Free to start.
Run deal math, save assumptions, and compare opportunities in one workspace.
Free investment property deal analyzer. Sign up in under 60 seconds.
No credit card required for the free plan. Start analyzing deals today.
```

Final URL:
```
https://veldportfolio.com/investment-property-calculator?utm_source=google&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=search_dealanalyzer_v1
```

---

### 3.4 Add negative keywords (do this for ALL THREE campaigns)

In each campaign: **Keywords → Negative keywords → + Add negative keywords**

Add these as **broad match negatives** (no quotes or brackets needed):
```
property management jobs
rental application form
tenant screening service
free lease template
wholesaling course
realtor leads
zillow jobs
free spreadsheet download
calculator excel template
real estate course
wholesaling training
biggerpockets
dealcheck
investor weekly
realty income stock
stock analysis
house buying analysis
jobs
excel
free download
template
```

---

### 3.5 Variant URL mapping summary

| Ad group | utm_content value | Landing page |
|---|---|---|
| Spreadsheet Alternative | `search_spreadsheet_v1` | `/` |
| Portfolio Tracking | `search_portfolio_v1` | `/` |
| Investment Property Calculator | `calcu_control_v1` | `/investment-property-calculator` |
| Rental Analysis Calculator | `calcu_control_v1` | `/investment-property-calculator` |
| Deal Analyzer High Intent | `search_dealanalyzer_v1` | `/investment-property-calculator` |

To run the paid variant test, duplicate Ad Group C and change `utm_content=calc_paid_v1` with landing `/lp/investment-property-calculator`.

---

## 4) Meta prospecting build — step-by-step

**Positioning for this channel:** Portfolio tracker / landlord workflow — **not** the standalone calculator. Early tests showed weak signup conversion on calculator-led traffic; keep Meta landing on **`/`** (or `/pricing` only for price-specific creative). Do **not** use `/investment-property-calculator` for this Meta round.

### How Meta Ads is structured (read this first)

```
Account
└── Campaign  ← objective, budget, special ad category (e.g. Housing in US)
    └── Ad set  ← audience, placements, optimization event
        └── Ad  ← creative + primary text + destination URL + UTM
```

**You will create 1 campaign with 3 ad sets.** Each ad set = one audience + a small set of ads that share the same theme. All prospecting ads land on the **marketing home** with distinct `utm_content` values so PostHog can attribute angles.

---

### 4.1 Create Campaign: Portfolio-first Prospecting

In Meta Ads Manager: **+ Create** → **Campaign**

Settings to enter:
- **Buying type:** Auction
- **Campaign objective:** **Sales** (preferred once Pixel can optimize) or **Traffic** (acceptable for a short learning phase if conversion volume is thin)
- **Campaign name:** `Meta | Prospecting | Paid Test 2026Q1`
- **Special ad categories:** **Housing** (United States) — required when advertising housing opportunities or related services; confirm with Meta’s current housing-ads policy for your exact copy/creative
- **Budget:** daily amount from Section 1 (or use Advantage+ campaign budget and set ad set budgets to $0 if you consolidate at campaign level)
- **A/B test:** off for v1 unless you are explicitly testing one variable

**Conversion / performance goal (website):**
- **Performance goal:** Maximize **conversions** (e.g. Complete registration or a Pixel custom event aligned with signup) when Events Manager has stable signal; otherwise Maximize **landing page views** or **link clicks** until the account has enough events
- **Attribution:** Use the same attribution window your finance reporting expects (e.g. 7-day click / 1-day view) and keep it stable for the test

**Save — then create ad sets inside this campaign.**

---

### 4.2 Ad Set A — Landlord & rental investing interests

**Ad set name:** `Landlord_Investing_Interests`

Suggested settings:
- **Geography:** match Google (e.g. United States)
- **Age:** 25–64 (adjust if your product skews older)
- **Detailed targeting:** stack interests such as rental property, real estate investing, landlord, passive income, property management (pick concrete interest nodes in the UI; avoid over-narrowing on day one)
- **Languages:** English
- **Placements:** **Advantage+ placements** (recommended for v1) — or manual: Facebook Feed, Instagram Feed, Reels, Stories if you need control
- **Optimization:** Align with campaign (conversions vs landing page views)
- **Frequency:** monitor; if frequency climbs above ~3–4 in week one with weak CTR, refresh creative before raising budget

**Ads to create (minimum 2 per ad set):** combine **static images** (dashboard, portfolio summary) with the copy blocks below. Use **one destination URL per primary angle** so reporting stays clean.

#### Ad A1 — Spreadsheet replacement (primary text + link)

**Primary text options (pick one per ad, or rotate):**
```
Still running your rentals from a spreadsheet? Veld pulls equity, debt, and cash flow into one dashboard so you stop reconciling tabs.
```
```
Replace rental spreadsheet chaos with one workspace. See every property’s performance and your portfolio rollups in minutes — free to start.
```

**Headline (link title):**
```
Replace Your Rental Spreadsheet
```

**Description (optional):**
```
Portfolio dashboard for landlords. Free plan.
```

**CTA button:** `Sign up` or `Learn more`

**Website URL:**
```
https://veldportfolio.com/?utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_landing_spreadsheet_v1
```

#### Ad A2 — Portfolio clarity

**Primary text:**
```
Know where your portfolio stands today — not after you rebuild the model. Property-level and portfolio-level metrics in one place.
```

**Headline:**
```
Your Rental Portfolio In One View
```

**Description:**
```
Track cash flow and equity across properties.
```

**Website URL:**
```
https://veldportfolio.com/?utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_landing_portfolio_v1
```

---

### 4.3 Ad Set B — BRRR / house hack interests

**Ad set name:** `BRRR_HouseHack_Interests`

Targeting: interests related to BRRR, house hacking, fix-and-hold, small multifamily (choose specific interest nodes in Ads Manager). Geography and age same as Ad Set A unless you split-test.

**Ad B1 — Stack & workflow (not a calculator pitch)**

**Primary text:**
```
Scaling from one house hack to a small portfolio? Keep assumptions, debt, and cash flow in one workflow so you compare the next deal without losing context.
```

**Headline:**
```
Built For Growing Investors
```

**Website URL:**
```
https://veldportfolio.com/?utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_landing_dealworkflow_v1
```

**Ad B2 — Optional second creative:** same URL and angle, different hook (e.g. stress “one workspace” vs “compare scenarios”) — keep landing on `/`.

---

### 4.4 Ad Set C — Lookalike (website visitors)

**Ad set name:** `Lookalike_WebVisitors`

**Only enable if** your seed audience (e.g. site visitors 180d or purchasers) meets Meta’s minimum size; otherwise fold budget back into Ad Set A per `paid-ads-test-plan.md`.

- **Source:** Custom audience from website (Pixel) or customer list if compliant
- **Lookalike %:** start 1–3% in US; expand only if CPA is healthy
- **Creatives:** reuse top-performing ads from Ad Set A or B; keep **`utm_content`** distinct for reporting, e.g. `meta_landing_lookalike_v1`:
```
https://veldportfolio.com/?utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_landing_lookalike_v1
```

---

### 4.5 Creative pack checklist (minimum)

- **2+ static images:** dashboard / portfolio view; avoid “calculator only” screenshots as the hero unless testing later
- **1 short video or GIF** (optional): 15s screen walkthrough of “add property → see portfolio”
- **3 angles mapped to UTMs:** spreadsheet replacement (`meta_landing_spreadsheet_v1`), portfolio clarity (`meta_landing_portfolio_v1`), deal workflow / growth (`meta_landing_dealworkflow_v1`)

---

### 4.6 Meta vs Google: cost and intent (directional)

Use as guardrails, not guarantees — **geo, match type, creative, and season** move numbers more than “Meta vs Google” in the abstract.

| Dimension | Google Search (this account’s setup) | Meta prospecting |
| --- | --- | --- |
| **Auction** | Keyword intent; pay per click | Interest/lookalike + placements; often CPM-heavy delivery |
| **Typical CPC** | Often **higher** on tight RE/investor queries | Often **lower** cold CPC than Search, but **quality varies** |
| **Intent at click** | Usually **higher** (active search) | Usually **lower** (interruption / discovery) |
| **What to compare** | **Cost per signup** and **cost per `property_created`** — not CPC alone | Same |

**Plain summary:** Meta often looks “cheaper per click” than Google Search for cold traffic, but **cheaper clicks do not mean cheaper customers** until your funnel proves it. Expect to buy **more impressions** to earn a conversion; judge the channel on **CPA to your north-star events**, not on CPC.

---

## 5) Retargeting build

Campaign:
- `Retargeting | NoActivation | 7-30D`

Audience criteria:
- visited `/pricing` or `/sign-up`
- exclude users who triggered `property_created`

Creative copy:
- "You are one property away from seeing your full portfolio metrics. Start free, no credit card needed."

Landing:
- `/sign-up` or `/`

---

## 6) Naming conventions (platform + analytics)

Google campaign naming:
- `Search|<Theme>|<Quarter>`

Meta campaign naming:
- `Meta|Prospecting|<Quarter>`
- `Meta|Retargeting|<Quarter>`

Ad creative naming:
- `<channel>_<angle>_v<version>`
  - e.g., `meta_landing_spreadsheet_v1` (matches `utm_content`)
  - e.g., `search_dealanalyzer_v2`

---

## 7) Launch checklist

- [ ] UTM links validated in browser
- [ ] Conversion events mapped in platforms where possible
- [ ] Daily spend caps match selected tier
- [ ] **Google:** Negative keyword list added
- [ ] **Meta:** Housing special ad category + destination URLs all point to `/` (or `/pricing` for price-led only) — no calculator URL for this Meta round
- [ ] **Meta:** Pixel / Events Manager aligned with optimization goal (or learning goal set to landing page views if signal is thin)
- [ ] Retargeting exclusions configured
- [ ] Two creatives minimum per angle
