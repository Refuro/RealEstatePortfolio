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
- Meta portfolio ad:
  - `utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=meta_portfolio_v2`
- Retargeting ad:
  - `utm_source=meta&utm_medium=paid&utm_campaign=paid_test_2026q1&utm_content=retarget_nocard_v1`

---

## 3) Google Search build

## 3.1 Campaigns

Create three campaigns:

1. `Search | Spreadsheet Replacement`
2. `Search | Portfolio Analytics`
3. `Search | Deal Analyzer`

## 3.2 Ad groups + keyword starters

### Ad group A: Spreadsheet alternative
- rental portfolio spreadsheet alternative
- rental property spreadsheet alternative
- landlord spreadsheet alternative
- rental tracking software for investors

### Ad group B: Portfolio tracking
- rental portfolio tracker
- real estate portfolio dashboard
- track rental property cash flow
- rental property analytics software

### Ad group C: Deal underwriting
- rental deal analyzer
- rental property underwriting tool
- analyze rental property deal
- real estate deal analysis software

## 3.3 Negative keywords (starter pack)

- property management jobs
- rental application form
- tenant screening service
- free lease template
- wholesaling course
- realtor leads
- zillow jobs

## 3.4 RSA copy seeds

Headlines (mix and match):
- Track Your Rental Portfolio
- Replace Rental Spreadsheets
- Real Estate Portfolio Analytics
- Analyze Rental Deals Faster
- See Equity And Cash Flow
- Free Plan, No Credit Card
- Built For Small Investors

Descriptions:
- Track equity, debt, and cash flow across properties in one dashboard.
- Underwrite new deals before you buy and compare assumptions quickly.
- Replace spreadsheets with one portfolio analytics workspace.
- Start free. No credit card required.

Landing:
- `/` default
- `/pricing` only for pricing-intent variants

---

## 4) Meta prospecting build

## 4.1 Campaign and ad sets

Campaign:
- `Meta | Prospecting | Paid Test 2026Q1`

Ad sets:
- `Landlord_Investing_Interests`
- `BRRR_HouseHack_Interests`
- `Lookalike_WebVisitors` (if seed size is sufficient)

## 4.2 Creative pack

Minimum launch pack:
- 2 static images (dashboard + deal analyzer)
- 1 short product walkthrough (if available)
- 3 primary texts (angles below)

Angle 1 (spreadsheet replacement):
- "Still tracking your rentals in a spreadsheet? Veld helps you see equity, debt, and cash flow in one place."

Angle 2 (portfolio clarity):
- "Know where your portfolio stands today. Track property-level and portfolio-level metrics without spreadsheet sprawl."

Angle 3 (deal underwriting):
- "Before buying your next property, run the deal math in one workflow and compare scenarios."

CTA:
- `Start free`

Landing:
- `/`

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
  - e.g., `meta_spreadsheet_v1`
  - e.g., `search_dealanalyzer_v2`

---

## 7) Launch checklist

- [ ] UTM links validated in browser
- [ ] Conversion events mapped in platforms where possible
- [ ] Daily spend caps match selected tier
- [ ] Negative keyword list added
- [ ] Retargeting exclusions configured
- [ ] Two creatives minimum per angle
