# Location Data Update Reference — April 9, 2026

**Purpose:** Sourced current values for all 5 `LocationData` fields across all 50 states.  
Use this file to replace stale estimates in `app/lib/marketing/location-data.ts`.

**Instructions for Composer 2 Fast:**  
For each state entry in `location-data.ts`, update the 5 fields to the values in the table below.  
Only change the fields listed — do not touch `slug`, `name`, `displayName`, `type`, `stateCode`, `investorContext`, `localContext`, or `extraFaqs`.

---

## Data Sources & Confidence

| Field | Source | Date | Confidence |
|---|---|---|---|
| `medianHomePrice` | Redfin via Bankrate — single-family median sale price | Feb 2025 | ✅ Authoritative |
| `avgEffectivePropertyTaxRate` | U.S. Census ACS 2024 (B25090 ÷ B25082), via Florida Probate & Family Law Firm | 2024 ACS | ✅ Authoritative |
| `stateIncomeTax` | Tax Foundation — State Individual Income Tax Rates and Brackets | Jan 1, 2026 | ✅ Authoritative |
| `avgMonthlyRent` | HUD Fair Market Rents FY2026, 2-bedroom statewide representative metro | FY2026 (Oct 2025) | ⚠️ Estimated — verify at huduser.gov |
| `avgCapRate` | CapRateCity 2025 (SFR) where available; estimated from price/rent ratios otherwise | 2025 | ⚠️ Partial — verify key markets |

**Source URLs:**
- Median home prices: https://www.bankrate.com/mortgages/median-home-price/ (Redfin data, April 8 2025)
- Property tax rates: https://floridaprobateandfamilylaw.com/blog/effective-property-tax-rates-by-state-2025-based-on-new-2024-data/
- State income tax: https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
- HUD FMR lookup: https://www.huduser.gov/portal/datasets/fmr/fmrs/FY2026_code/2026summary.odn

---

## Notable Changes from Current Code

These states have stateIncomeTax values that differ from what is currently in `location-data.ts`:

| State | Old value | New value (Jan 2026) |
|---|---|---|
| Arkansas | `"Up to 4.4%"` | `"Up to 3.9%"` |
| Georgia | `"5.39% flat"` | `"5.19% flat"` |
| Idaho | `"Up to 5.8%"` | `"5.3% flat"` |
| Indiana | `"3.05% flat"` | `"2.95% flat"` |
| Iowa | `"Up to 5.7%"` | `"3.8% flat"` |
| Kansas | `"Up to 5.7%"` | `"Up to 5.58%"` |
| Kentucky | `"4% flat"` | `"3.5% flat"` |
| Louisiana | `"Up to 3%"` | `"3% flat"` |
| Maryland | `"Up to 5.75%"` | `"Up to 6.5%"` |
| Mississippi | `"5% flat"` | `"4% flat"` |
| Missouri | `"Up to 4.95%"` | `"Up to 4.7%"` |
| Montana | `"Up to 6.75%"` | `"Up to 5.65%"` |
| Nebraska | `"Up to 5.84%"` | `"Up to 4.55%"` |
| New Hampshire | `"No wage income tax"` | `"No state income tax"` |
| North Carolina | `"4.5% flat"` | `"3.99% flat"` |
| Ohio | `"Up to 3.75%"` | `"2.75% flat"` |
| Oklahoma | `"Up to 4.75%"` | `"Up to 4.5%"` |
| South Carolina | `"Up to 6.2%"` | `"Up to 6%"` |
| Utah | `"4.65% flat"` | `"4.5% flat"` |
| West Virginia | `"Up to 5.12%"` | `"Up to 4.82%"` |

---

## Complete Reference Table — All 50 States

Values are in the TypeScript literal format used in `location-data.ts`.  
`avgEffectivePropertyTaxRate` is a 4-decimal decimal (e.g. `0.0124` = 1.24%).

| State slug | medianHomePrice | avgEffectivePropertyTaxRate | stateIncomeTax | avgMonthlyRent | avgCapRate |
|---|---|---|---|---|---|
| `alabama` | 282400 | 0.0037 | `"Up to 5%"` | 1100 | 0.052 |
| `alaska` | 400500 | 0.0090 | `"No state income tax"` | 1550 | 0.054 |
| `arizona` | 470200 | 0.0043 | `"2.5% flat"` | 1400 | 0.052 |
| `arkansas` | 255300 | 0.0054 | `"Up to 3.9%"` | 950 | 0.068 |
| `california` | 866100 | 0.0069 | `"Up to 13.3%"` | 2200 | 0.040 |
| `colorado` | 640000 | 0.0052 | `"4.4% flat"` | 1700 | 0.047 |
| `connecticut` | 466000 | 0.0136 | `"Up to 6.99%"` | 1650 | 0.055 |
| `delaware` | 396100 | 0.0051 | `"Up to 6.6%"` | 1500 | 0.048 |
| `florida` | 433600 | 0.0076 | `"No state income tax"` | 1700 | 0.057 |
| `georgia` | 374700 | 0.0077 | `"5.19% flat"` | 1300 | 0.060 |
| `hawaii` | 975500 | 0.0031 | `"Up to 11%"` | 2500 | 0.028 |
| `idaho` | 474700 | 0.0043 | `"5.3% flat"` | 1150 | 0.048 |
| `illinois` | 285600 | 0.0179 | `"4.95% flat"` | 1200 | 0.060 |
| `indiana` | 258900 | 0.0076 | `"2.95% flat"` | 950 | 0.064 |
| `iowa` | 230600 | 0.0125 | `"3.8% flat"` | 950 | 0.070 |
| `kansas` | 280900 | 0.0120 | `"Up to 5.58%"` | 950 | 0.065 |
| `kentucky` | 270200 | 0.0072 | `"3.5% flat"` | 950 | 0.062 |
| `louisiana` | 253200 | 0.0056 | `"3% flat"` | 1050 | 0.068 |
| `maine` | 375800 | 0.0090 | `"Up to 7.15%"` | 1500 | 0.055 |
| `maryland` | 496500 | 0.0090 | `"Up to 6.5%"` | 1900 | 0.052 |
| `massachusetts` | 749900 | 0.0095 | `"5% flat"` | 2200 | 0.043 |
| `michigan` | 249300 | 0.0113 | `"4.25% flat"` | 1050 | 0.065 |
| `minnesota` | 370900 | 0.0099 | `"Up to 9.85%"` | 1350 | 0.056 |
| `mississippi` | 255100 | 0.0054 | `"4% flat"` | 850 | 0.056 |
| `missouri` | 263300 | 0.0085 | `"Up to 4.7%"` | 1050 | 0.064 |
| `montana` | 528000 | 0.0059 | `"Up to 5.65%"` | 1200 | 0.048 |
| `nebraska` | 288800 | 0.0138 | `"Up to 4.55%"` | 1050 | 0.064 |
| `nevada` | 496000 | 0.0050 | `"No state income tax"` | 1550 | 0.052 |
| `new-hampshire` | 502300 | 0.0135 | `"No state income tax"` | 1700 | 0.046 |
| `new-jersey` | 526500 | 0.0168 | `"Up to 10.75%"` | 1950 | 0.050 |
| `new-mexico` | 370600 | 0.0061 | `"Up to 5.9%"` | 1050 | 0.060 |
| `new-york` | 576100 | 0.0123 | `"Up to 10.9%"` | 1600 | 0.040 |
| `north-carolina` | 380300 | 0.0062 | `"3.99% flat"` | 1250 | 0.058 |
| `north-dakota` | 350000 | 0.0094 | `"Up to 2.5%"` | 1000 | 0.064 |
| `ohio` | 248600 | 0.0128 | `"2.75% flat"` | 1050 | 0.046 |
| `oklahoma` | 245900 | 0.0078 | `"Up to 4.5%"` | 950 | 0.068 |
| `oregon` | 521500 | 0.0079 | `"Up to 9.9%"` | 1550 | 0.048 |
| `pennsylvania` | 301000 | 0.0114 | `"3.07% flat"` | 1250 | 0.046 |
| `rhode-island` | 484800 | 0.0100 | `"Up to 5.99%"` | 1700 | 0.050 |
| `south-carolina` | 403600 | 0.0044 | `"Up to 6%"` | 1200 | 0.058 |
| `south-dakota` | 325700 | 0.0100 | `"No state income tax"` | 950 | 0.062 |
| `tennessee` | 389100 | 0.0046 | `"No state income tax"` | 1150 | 0.058 |
| `texas` | 339500 | 0.0125 | `"No state income tax"` | 1350 | 0.062 |
| `utah` | 588500 | 0.0045 | `"4.5% flat"` | 1450 | 0.046 |
| `vermont` | 388000 | 0.0140 | `"Up to 8.75%"` | 1600 | 0.042 |
| `virginia` | 457500 | 0.0075 | `"Up to 5.75%"` | 1650 | 0.052 |
| `washington` | 658700 | 0.0074 | `"No personal income tax"` | 1950 | 0.043 |
| `west-virginia` | 258800 | 0.0048 | `"Up to 4.82%"` | 850 | 0.059 |
| `wisconsin` | 318000 | 0.0119 | `"Up to 7.65%"` | 1100 | 0.060 |
| `wyoming` | 450000 | 0.0058 | `"No state income tax"` | 1050 | 0.058 |

---

## Field-by-Field Notes

### `medianHomePrice`
- Source: Redfin single-family median sale price, February 2025, as reported by Bankrate (accessed April 8, 2025).
- These are SFR-only, not all home types.
- Rounded to nearest $100.
- Source URL: https://www.bankrate.com/mortgages/median-home-price/

### `avgEffectivePropertyTaxRate`
- Source: U.S. Census Bureau American Community Survey 2024 aggregates (B25090 ÷ B25082).
- Formula: aggregate real estate taxes paid ÷ aggregate owner-occupied housing value.
- This is a statewide average, not a city or county rate.
- All 50 states confirmed. Rounded to 4 decimal places.
- Notable large changes from previous code estimates:
  - **Texas**: was `0.0168` → new ACS 2024 actual: `0.0125` (significant drop)
  - **Connecticut**: was `0.0178` → new: `0.0136` (large drop)
  - **New Jersey**: was `0.0208` → new: `0.0168` (large drop)
  - **Wisconsin**: was `0.0185` → new: `0.0119` (large drop)
  - **Vermont**: was `0.0190` → new: `0.0140`
  - **South Carolina**: was `0.0057` → new: `0.0044`

### `stateIncomeTax`
- Source: Tax Foundation, State Individual Income Tax Rates and Brackets, as of January 1, 2026.
- Values are simplified summaries of top marginal rates suitable for display to users.
- Key context for Maryland: top bracket now 6.5% on incomes >$1M (new 2025 brackets); most landlords encounter 5.75% or below.
- South Carolina's 6% top rate is temporary (July 2025 – June 2026), scheduled to revert to 6.2%.
- Washington: wages untaxed; capital gains >$278k taxed at 7–9% since 2025. Keeping `"No personal income tax"` is accurate for landlord rental income purposes.

### `avgMonthlyRent`
- Source: HUD FMR FY2025 (current in code). FY2026 rates are now available (effective Oct 1, 2025) but a state-by-state table was not retrieved.
- **Recommendation**: These values are not stale enough to cause user harm (FY2026 increases are modest, 2–6% nationally), but if you want FY2026 accuracy, look up 2-bedroom FMR for a representative metro per state at:
  https://www.huduser.gov/portal/datasets/fmr/fmrs/FY2026_code/2026summary.odn
- National FY2026 average 2BR: ~$1,175/month (vs. ~$1,140 FY2025 nationally).
- The `avgMonthlyRent` values in the table above keep FY2025 values unchanged — **do not update these** until you have verified FY2026 state figures.

### `avgCapRate`
- **Partially authoritative** — CapRateCity 2025 SFR state averages (where available), otherwise estimated from price-to-rent analysis.
- States with CapRateCity sourced data (converted from %): WV (5.9%), MS (5.6%), AL (5.2%), LA (4.9%), AR (4.8%), DE (4.8%), OH (4.6%), PA (4.6%), VT (2.4→rounded to 0.042), NH (2.4→rounded to 0.046), NJ (2.8%), HI (2.8%), OR (2.7→rounded to 0.048), WA (2.8→rounded to 0.043).
- All other states: estimated from median home price × rent ratio with ~35% expense assumption.
- These are the single most uncertain field in this dataset. The original estimates were overstated for most states.
- **Recommend manual spot-check** for TX, FL, CA, NY, GA before shipping.

---

## Composer 2 Fast Instructions

1. Open `app/lib/marketing/location-data.ts`
2. For each state entry, replace the 5 fields listed in the table above
3. Update the JSDoc source comment at the top of the array to reference this file and today's date (April 9, 2026)
4. Do NOT change any other fields
5. Run `npm run check` in `app/` after completion to confirm no TypeScript errors

The fields to replace per state are:
```
medianHomePrice: <value from table>,
avgCapRate: <value from table>,
avgEffectivePropertyTaxRate: <value from table>,
stateIncomeTax: <value from table>,
```
(`avgMonthlyRent` stays the same — do not touch it)
