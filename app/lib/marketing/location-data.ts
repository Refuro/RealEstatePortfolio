import type { CalculatorFaqItem } from "@/lib/marketing/calculator-faqs";

export type LocationData = {
  slug: string;
  name: string;
  displayName: string;
  type: "state";
  stateCode: string;
  investorContext: string;
  localContext: string;
  extraFaqs?: CalculatorFaqItem[];
  /**
   * HUD FY2025 Fair Market Rent, 2-bedroom, representative metro or state median.
   * Used to pre-fill rent inputs on investment-property, BRRRR, and STR/LTR calculators.
   * Source: HUD FMR 2025 (huduser.gov). Leave undefined only if no defensible statewide figure exists.
   */
  avgMonthlyRent?: number;
  /**
   * Effective property tax rate on owner-occupied residential property.
   * Source: Tax Foundation, calendar year 2022 (most recent available).
   * Expressed as a decimal, e.g. 0.018 = 1.8%.
   */
  avgEffectivePropertyTaxRate?: number;
  /**
   * State individual income tax summary for 2025.
   * E.g. "No state income tax", "4.95% flat", "Up to 13.3%".
   * Source: State tax authorities.
   */
  stateIncomeTax?: string;
};

/**
 * All 50 US states — Phase 2B. Used for `/tools/[calculator]/[location]` and sitemap.
 *
 * Data sources:
 * - avgMonthlyRent: HUD Fair Market Rents FY2025, 2-bedroom (huduser.gov)
 * - avgEffectivePropertyTaxRate: Tax Foundation, effective rate on owner-occupied housing, CY2022
 * - stateIncomeTax: State tax authorities, 2025 rates
 */
export const LOCATION_DATA_US_STATES: LocationData[] = [
  {
    slug: "alabama",
    name: "Alabama",
    displayName: "Alabama",
    type: "state",
    stateCode: "AL",
    avgMonthlyRent: 1100,
    avgEffectivePropertyTaxRate: 0.0036,
    stateIncomeTax: "Up to 5%",
    investorContext:
      "Alabama investors often focus on yield and renovation scope across metros and smaller markets. Default inputs reflect typical Alabama rents from HUD Fair Market data—bracket your own numbers, then validate insurance and taxes for the specific county.",
    localContext:
      "Tornado and wind risk can affect insurance quotes meaningfully. Coastal exposure is limited but not zero—enter the carrier numbers you can actually bind, not a guess from another Gulf state.",
  },
  {
    slug: "alaska",
    name: "Alaska",
    displayName: "Alaska",
    type: "state",
    stateCode: "AK",
    avgMonthlyRent: 1550,
    avgEffectivePropertyTaxRate: 0.0098,
    stateIncomeTax: "No state income tax",
    investorContext:
      "Alaska's rental markets are thin in places and seasonal in others. Default rent inputs are drawn from HUD FMR data for urban Alaska—adjust vacancy and expense loads conservatively for rural or seasonal markets.",
    localContext:
      "Heating costs, remote maintenance, and seasonal demand can dominate operating expenses in ways that mainland defaults won't capture. Use your local quotes and actual lease rates.",
  },
  {
    slug: "arizona",
    name: "Arizona",
    displayName: "Arizona",
    type: "state",
    stateCode: "AZ",
    avgMonthlyRent: 1400,
    avgEffectivePropertyTaxRate: 0.0045,
    stateIncomeTax: "2.5% flat",
    investorContext:
      "Phoenix-area and other Arizona markets see active SFR and build-to-rent interest. Default rent inputs reflect statewide HUD FMR estimates—seasonal demand and utility costs can matter, so adjust to what you expect.",
    localContext:
      "HOA fees and short-term rental restrictions are common in many Arizona communities. If your deal has an HOA or STR limits, your real net will differ from a plain rent estimate.",
  },
  {
    slug: "arkansas",
    name: "Arkansas",
    displayName: "Arkansas",
    type: "state",
    stateCode: "AR",
    avgMonthlyRent: 950,
    avgEffectivePropertyTaxRate: 0.0062,
    stateIncomeTax: "Up to 4.4%",
    investorContext:
      "Arkansas investors often weigh cash flow against appreciation expectations in smaller metros. Default inputs reflect typical Arkansas rents from HUD data—stress-test expenses including insurance and turnover on older stock.",
    localContext:
      "Property tax rates and school millages vary by jurisdiction. Break out taxes explicitly rather than using a single rule-of-thumb expense ratio.",
  },
  {
    slug: "california",
    name: "California",
    displayName: "California",
    type: "state",
    stateCode: "CA",
    avgMonthlyRent: 2200,
    avgEffectivePropertyTaxRate: 0.0075,
    stateIncomeTax: "Up to 13.3%",
    investorContext:
      "California deals are often cap-rate tight but appreciation- and rent-growth sensitive. Default rent inputs are drawn from HUD FMR data—a statewide figure spans a wide range, so adjust to your specific market.",
    localContext:
      "Rent control and eviction rules vary by jurisdiction. Your pro forma should reflect the actual rent you can achieve legally on day one and over your hold period, not a headline market rate alone.",
  },
  {
    slug: "colorado",
    name: "Colorado",
    displayName: "Colorado",
    type: "state",
    stateCode: "CO",
    avgMonthlyRent: 1700,
    avgEffectivePropertyTaxRate: 0.0045,
    stateIncomeTax: "4.4% flat",
    investorContext:
      "Colorado investors balance appreciation history with cash-flow reality at today's prices. Default rent inputs reflect HUD FMR estimates—altitude markets can vary, so use local comps to refine.",
    localContext:
      "Altitude markets can have unique insurance and utility profiles. Use local quotes and comps—this statewide estimate is a starting point, not a substitute for market-specific diligence.",
  },
  {
    slug: "connecticut",
    name: "Connecticut",
    displayName: "Connecticut",
    type: "state",
    stateCode: "CT",
    avgMonthlyRent: 1650,
    avgEffectivePropertyTaxRate: 0.0178,
    stateIncomeTax: "Up to 6.99%",
    investorContext:
      "Connecticut investors often underwrite older housing and higher tax burdens carefully. Default rent inputs are based on HUD FMR data—compare scenarios here, then align assumptions with local mill rates and insurance quotes.",
    localContext:
      "High-tax towns can swamp cash flow if you under-model property taxes. Enter assessed-tax expectations for the specific municipality, not a statewide average.",
  },
  {
    slug: "delaware",
    name: "Delaware",
    displayName: "Delaware",
    type: "state",
    stateCode: "DE",
    avgMonthlyRent: 1500,
    avgEffectivePropertyTaxRate: 0.0057,
    stateIncomeTax: "Up to 6.6%",
    investorContext:
      "Delaware's small size still spans different rent and expense profiles by city. Default rent inputs reflect HUD FMR data—directional math belongs in the calculator, binding numbers belong in your diligence.",
    localContext:
      "Coastal wind and flood considerations can apply in some deals. Add insurance and reserves explicitly for any property near the coast.",
  },
  {
    slug: "florida",
    name: "Florida",
    displayName: "Florida",
    type: "state",
    stateCode: "FL",
    avgMonthlyRent: 1700,
    avgEffectivePropertyTaxRate: 0.0091,
    stateIncomeTax: "No state income tax",
    investorContext:
      "Florida investors often weigh insurance and storm risk alongside rent and tourism-driven demand. Default rent inputs reflect HUD FMR data—align assumptions with carrier quotes and local landlord rules before committing.",
    localContext:
      "Wind and flood coverage can move total housing cost more than in many inland markets. Short-term rental rules vary by city—confirm legality and fees separately from this tool.",
    extraFaqs: [
      {
        question: "Does this include hurricane or flood insurance?",
        answer:
          "No. Add expected insurance and reserves in your expense inputs. The calculator does not model hazard zones or carrier requirements for you.",
      },
    ],
  },
  {
    slug: "georgia",
    name: "Georgia",
    displayName: "Georgia",
    type: "state",
    stateCode: "GA",
    avgMonthlyRent: 1300,
    avgEffectivePropertyTaxRate: 0.0092,
    stateIncomeTax: "5.39% flat",
    investorContext:
      "Atlanta and other Georgia metros attract investors balancing cash flow with job growth. Default rent inputs are drawn from HUD FMR data—use conservative vacancy and maintenance when comparing scenarios across neighborhoods.",
    localContext:
      "Atlanta's submarkets differ sharply on rents and rehab costs. If you are new to the area, cross-check assumptions with a local agent or property manager before relying on a single set of numbers.",
  },
  {
    slug: "hawaii",
    name: "Hawaii",
    displayName: "Hawaii",
    type: "state",
    stateCode: "HI",
    avgMonthlyRent: 2500,
    avgEffectivePropertyTaxRate: 0.0026,
    stateIncomeTax: "Up to 11%",
    investorContext:
      "Hawaii investors face unique insurance, utility, and regulatory environments. Default rent inputs reflect HUD FMR data for Hawaii—use wide bands on expenses and confirm STR and landlord rules locally before acting on any estimate.",
    localContext:
      "Island maintenance timelines and costs often exceed mainland defaults. Underwrite reserves and vacancy conservatively; do not rely on a single rent comp from a different island.",
  },
  {
    slug: "idaho",
    name: "Idaho",
    displayName: "Idaho",
    type: "state",
    stateCode: "ID",
    avgMonthlyRent: 1150,
    avgEffectivePropertyTaxRate: 0.0060,
    stateIncomeTax: "Up to 5.8%",
    investorContext:
      "Idaho markets have seen migration-driven demand in several cycles. Default rent inputs are based on HUD FMR data—model downside as well as upside, since job and rent paths can move faster than in slower-growth regions.",
    localContext:
      "Property tax and insurance details vary by county. Enter expenses that match your quote package, not a neighbor state's rule of thumb.",
  },
  {
    slug: "illinois",
    name: "Illinois",
    displayName: "Illinois",
    type: "state",
    stateCode: "IL",
    avgMonthlyRent: 1200,
    avgEffectivePropertyTaxRate: 0.0195,
    stateIncomeTax: "4.95% flat",
    investorContext:
      "Illinois deals frequently hinge on property tax clarity and local economic trends. Default rent inputs reflect HUD FMR data—pair the calculator with counsel and local pros on legal and tax questions.",
    localContext:
      "Cook County and other jurisdictions have distinct assessment and appeal dynamics. Your modeled taxes should reflect what you expect after exemptions and appeals, not a single listing line item.",
  },
  {
    slug: "indiana",
    name: "Indiana",
    displayName: "Indiana",
    type: "state",
    stateCode: "IN",
    avgMonthlyRent: 950,
    avgEffectivePropertyTaxRate: 0.0085,
    stateIncomeTax: "3.05% flat",
    investorContext:
      "Indiana investors often chase yield in Midwest cash-flow markets. Default rent inputs are drawn from HUD FMR data—accuracy lives in rent comps and realistic rehab and capex lines, so test both best and stress cases.",
    localContext:
      "Older housing stock can hide deferred maintenance. Build a line item for turnover and capital repairs rather than assuming rent alone covers surprises.",
  },
  {
    slug: "iowa",
    name: "Iowa",
    displayName: "Iowa",
    type: "state",
    stateCode: "IA",
    avgMonthlyRent: 950,
    avgEffectivePropertyTaxRate: 0.0153,
    stateIncomeTax: "Up to 5.7%",
    investorContext:
      "Iowa rental performance varies widely by city size and employer base. Default rent inputs reflect HUD FMR data—compare financing and rent paths before locking assumptions.",
    localContext:
      "Weather and utility swings can hit older homes harder. Model insurance and maintenance with local quotes where possible.",
  },
  {
    slug: "kansas",
    name: "Kansas",
    displayName: "Kansas",
    type: "state",
    stateCode: "KS",
    avgMonthlyRent: 950,
    avgEffectivePropertyTaxRate: 0.0141,
    stateIncomeTax: "Up to 5.7%",
    investorContext:
      "Kansas investors often balance stable long-term tenants against tornado and hail insurance costs. Default rent inputs are based on HUD FMR data—expense accuracy matters as much as headline rent.",
    localContext:
      "Property taxes and school levies vary materially by district. Enter taxes for the specific parcel's assessment path when you can.",
  },
  {
    slug: "kentucky",
    name: "Kentucky",
    displayName: "Kentucky",
    type: "state",
    stateCode: "KY",
    avgMonthlyRent: 950,
    avgEffectivePropertyTaxRate: 0.0083,
    stateIncomeTax: "4% flat",
    investorContext:
      "Kentucky markets mix Appalachian smaller towns with larger regional hubs. Default rent inputs reflect HUD FMR data—underwrite to the submarket you are buying, not a statewide stereotype.",
    localContext:
      "Flood risk pockets exist away from the coasts. If your property is in a flood zone, add insurance and reserves explicitly.",
  },
  {
    slug: "louisiana",
    name: "Louisiana",
    displayName: "Louisiana",
    type: "state",
    stateCode: "LA",
    avgMonthlyRent: 1050,
    avgEffectivePropertyTaxRate: 0.0052,
    stateIncomeTax: "Up to 3%",
    investorContext:
      "Louisiana investors often navigate insurance complexity and climate risk alongside rent. Default rent inputs are drawn from HUD FMR data—keep outputs directional until carrier quotes and local landlord rules are in hand.",
    localContext:
      "Wind and flood coverage can dominate PITI near the Gulf. STR and local registration rules vary—confirm outside this calculator.",
  },
  {
    slug: "maine",
    name: "Maine",
    displayName: "Maine",
    type: "state",
    stateCode: "ME",
    avgMonthlyRent: 1500,
    avgEffectivePropertyTaxRate: 0.0136,
    stateIncomeTax: "Up to 7.15%",
    investorContext:
      "Maine's seasonal and year-round markets behave differently. Default rent inputs reflect HUD FMR data for Maine—model vacancy and expense seasonality honestly, since one annual rent figure can mislead.",
    localContext:
      "Heating oil and winter maintenance can matter more than in mild climates. Use expense lines that match the building envelope and tenant base you expect.",
  },
  {
    slug: "maryland",
    name: "Maryland",
    displayName: "Maryland",
    type: "state",
    stateCode: "MD",
    avgMonthlyRent: 1900,
    avgEffectivePropertyTaxRate: 0.0109,
    stateIncomeTax: "Up to 5.75%",
    investorContext:
      "Maryland spans expensive metro suburbs and very different small markets. Default rent inputs are drawn from HUD FMR data—match rent and tax assumptions to the municipality, not the whole state.",
    localContext:
      "County-level property taxes and fees vary. Investors near DC often face a different rent regulation context than western MD—underwrite locally.",
  },
  {
    slug: "massachusetts",
    name: "Massachusetts",
    displayName: "Massachusetts",
    type: "state",
    stateCode: "MA",
    avgMonthlyRent: 2200,
    avgEffectivePropertyTaxRate: 0.0123,
    stateIncomeTax: "5% flat",
    investorContext:
      "Massachusetts investors often underwrite older housing and strong tenant protections. Default rent inputs reflect HUD FMR data—use conservative rent growth and expense paths until local counsel confirms your strategy.",
    localContext:
      "Boston-area and gateway cities can have nuanced rent rules. This calculator does not model legal outcomes—only the math you supply.",
  },
  {
    slug: "michigan",
    name: "Michigan",
    displayName: "Michigan",
    type: "state",
    stateCode: "MI",
    avgMonthlyRent: 1050,
    avgEffectivePropertyTaxRate: 0.0154,
    stateIncomeTax: "4.25% flat",
    investorContext:
      "Michigan investors compare Rust Belt cash flow with metro job drivers. Default rent inputs are drawn from HUD FMR data—stress-test maintenance on pre-1980s stock and verify tax assessments for the specific city.",
    localContext:
      "Winter utilities and frozen-pipe risk can lift operating costs. Build realistic reserves rather than relying on optimistic rent alone.",
  },
  {
    slug: "minnesota",
    name: "Minnesota",
    displayName: "Minnesota",
    type: "state",
    stateCode: "MN",
    avgMonthlyRent: 1350,
    avgEffectivePropertyTaxRate: 0.0111,
    stateIncomeTax: "Up to 9.85%",
    investorContext:
      "Minnesota investors balance cold-climate operating costs with stable tenant demand in many metros. Default rent inputs reflect HUD FMR data—model utilities and maintenance with local specificity.",
    localContext:
      "Property tax classifications and special assessments vary. Enter taxes and insurance from sources you trust for that specific parcel.",
  },
  {
    slug: "mississippi",
    name: "Mississippi",
    displayName: "Mississippi",
    type: "state",
    stateCode: "MS",
    avgMonthlyRent: 850,
    avgEffectivePropertyTaxRate: 0.0065,
    stateIncomeTax: "5% flat",
    investorContext:
      "Mississippi investors often focus on yield and renovation risk. Default rent inputs are based on HUD FMR data—insurance and storm exposure can move totals, so quote before trusting a best-case pro forma.",
    localContext:
      "Flood zones and wind coverage matter along the Gulf and river corridors. This tool does not replace elevation certificates or NFIP logic.",
  },
  {
    slug: "missouri",
    name: "Missouri",
    displayName: "Missouri",
    type: "state",
    stateCode: "MO",
    avgMonthlyRent: 1050,
    avgEffectivePropertyTaxRate: 0.0101,
    stateIncomeTax: "Up to 4.95%",
    investorContext:
      "Missouri mixes major metros with smaller cash-flow towns. Default rent inputs reflect HUD FMR data—the same price can imply different risk, so use ranges on rent and capex rather than a single point estimate.",
    localContext:
      "Tornado and hail insurance can swing year to year. Refresh expense assumptions when carriers change deductibles or premiums.",
  },
  {
    slug: "montana",
    name: "Montana",
    displayName: "Montana",
    type: "state",
    stateCode: "MT",
    avgMonthlyRent: 1200,
    avgEffectivePropertyTaxRate: 0.0084,
    stateIncomeTax: "Up to 6.75%",
    investorContext:
      "Montana markets can be thin on comps in rural areas. Default rent inputs are drawn from HUD FMR data for Montana's larger markets—widen uncertainty bands when your comp count is low.",
    localContext:
      "Wildfire and winter access can affect insurance and maintenance. Enter costs that match the property's location and access, not a flat national default.",
  },
  {
    slug: "nebraska",
    name: "Nebraska",
    displayName: "Nebraska",
    type: "state",
    stateCode: "NE",
    avgMonthlyRent: 1050,
    avgEffectivePropertyTaxRate: 0.0173,
    stateIncomeTax: "Up to 5.84%",
    investorContext:
      "Nebraska investors often underwrite stable rents with weather and insurance variability. Default rent inputs reflect HUD FMR data—keep reserves visible in your scenario, not hidden in a low expense ratio.",
    localContext:
      "Hail and tornado risk can affect roof and insurance timelines. Model capex explicitly on older roofs.",
  },
  {
    slug: "nevada",
    name: "Nevada",
    displayName: "Nevada",
    type: "state",
    stateCode: "NV",
    avgMonthlyRent: 1550,
    avgEffectivePropertyTaxRate: 0.0044,
    stateIncomeTax: "No state income tax",
    investorContext:
      "Las Vegas and Reno attract investors focused on tourism, migration, and job growth. Default rent inputs are drawn from HUD FMR data—volatility in rents and expenses means ranges beat single-point optimism, so test multiple scenarios.",
    localContext:
      "HOAs and STR regulations are common discussion points in Nevada. If your strategy depends on nightly rentals, confirm legality and fees outside this calculator.",
  },
  {
    slug: "new-hampshire",
    name: "New Hampshire",
    displayName: "New Hampshire",
    type: "state",
    stateCode: "NH",
    avgMonthlyRent: 1700,
    avgEffectivePropertyTaxRate: 0.0186,
    stateIncomeTax: "No wage income tax",
    investorContext:
      "New Hampshire investors often compare high-tax-adjacent demand with rural cash flow. Default rent inputs reflect HUD FMR data—property tax bills can surprise, so model from actual assessments when possible.",
    localContext:
      "Heating and roof maintenance matter in northern winters. Use expense lines aligned with building age and fuel type.",
  },
  {
    slug: "new-jersey",
    name: "New Jersey",
    displayName: "New Jersey",
    type: "state",
    stateCode: "NJ",
    avgMonthlyRent: 1950,
    avgEffectivePropertyTaxRate: 0.0208,
    stateIncomeTax: "Up to 10.75%",
    investorContext:
      "New Jersey investors navigate high taxes and dense regulation in many markets. Default rent inputs are drawn from HUD FMR data—this calculator handles the math you enter, not legal or rent-control outcomes.",
    localContext:
      "Municipalities differ sharply on fees and landlord obligations. Pair numbers here with local counsel when rules affect achievable rent.",
  },
  {
    slug: "new-mexico",
    name: "New Mexico",
    displayName: "New Mexico",
    type: "state",
    stateCode: "NM",
    avgMonthlyRent: 1050,
    avgEffectivePropertyTaxRate: 0.0080,
    stateIncomeTax: "Up to 5.9%",
    investorContext:
      "New Mexico investors weigh climate, water, and insurance costs alongside rent. Default rent inputs are based on HUD FMR data—desert markets are not monolithic, so underwrite to the city and property type.",
    localContext:
      "Short-term rental rules vary. If STR is part of your plan, confirm compliance outside this tool.",
  },
  {
    slug: "new-york",
    name: "New York",
    displayName: "New York",
    type: "state",
    stateCode: "NY",
    avgMonthlyRent: 1600,
    avgEffectivePropertyTaxRate: 0.0173,
    stateIncomeTax: "Up to 10.9%",
    investorContext:
      "New York spans NYC-area complexity and very different upstate markets. Default rent inputs reflect statewide HUD FMR data, skewed toward non-NYC markets—narrow inputs to the submarket you are actually buying.",
    localContext:
      "Upstate snow and NYC regulation are different worlds. This page does not encode local rent rules; you supply achievable rent and expenses.",
  },
  {
    slug: "north-carolina",
    name: "North Carolina",
    displayName: "North Carolina",
    type: "state",
    stateCode: "NC",
    avgMonthlyRent: 1250,
    avgEffectivePropertyTaxRate: 0.0082,
    stateIncomeTax: "4.5% flat",
    investorContext:
      "North Carolina markets range from fast-growing metros to smaller landlord towns. Default rent inputs are drawn from HUD FMR data—the same purchase price can produce very different outcomes depending on taxes, rents, and financing.",
    localContext:
      "Property tax and insurance details should reflect the specific county and property type. Investors often model a small contingency for turnover and capex on older housing stock.",
  },
  {
    slug: "north-dakota",
    name: "North Dakota",
    displayName: "North Dakota",
    type: "state",
    stateCode: "ND",
    avgMonthlyRent: 1000,
    avgEffectivePropertyTaxRate: 0.0085,
    stateIncomeTax: "Up to 2.5%",
    investorContext:
      "North Dakota investors often face smaller comp sets and commodity-employment sensitivity. Default rent inputs reflect HUD FMR data—use conservative rent and vacancy when job concentration is high.",
    localContext:
      "Winter operating costs and vacancy in cold months can swing outcomes. Model seasonality if your market is seasonal.",
  },
  {
    slug: "ohio",
    name: "Ohio",
    displayName: "Ohio",
    type: "state",
    stateCode: "OH",
    avgMonthlyRent: 1050,
    avgEffectivePropertyTaxRate: 0.0159,
    stateIncomeTax: "Up to 3.75%",
    investorContext:
      "Midwest cash-flow markets like Ohio often hinge on purchase price discipline and accurate rent comps. Default rent inputs are drawn from HUD FMR data—stress-test maintenance and capex on older homes.",
    localContext:
      "Rust-belt cities can offer stronger yields but higher turnover or rehab risk. Build reserves into your model rather than relying on best-case rent alone.",
  },
  {
    slug: "oklahoma",
    name: "Oklahoma",
    displayName: "Oklahoma",
    type: "state",
    stateCode: "OK",
    avgMonthlyRent: 950,
    avgEffectivePropertyTaxRate: 0.0090,
    stateIncomeTax: "Up to 4.75%",
    investorContext:
      "Oklahoma investors often balance yield with severe weather insurance costs. Default rent inputs reflect HUD FMR data—hail and wind losses can dominate long-term expense, so quote coverage before celebrating cash flow.",
    localContext:
      "Tornado alley risk varies by county and roof age. Capex and insurance deserve explicit lines, not a blended low expense ratio.",
  },
  {
    slug: "oregon",
    name: "Oregon",
    displayName: "Oregon",
    type: "state",
    stateCode: "OR",
    avgMonthlyRent: 1550,
    avgEffectivePropertyTaxRate: 0.0101,
    stateIncomeTax: "Up to 9.9%",
    investorContext:
      "Oregon investors weigh West Coast regulation and rent-policy headlines against local fundamentals. Default rent inputs are drawn from HUD FMR data—enter the rent path you believe is achievable under real rules.",
    localContext:
      "Portland-area and smaller markets differ materially. Insurance and tax details should be local to the parcel.",
  },
  {
    slug: "pennsylvania",
    name: "Pennsylvania",
    displayName: "Pennsylvania",
    type: "state",
    stateCode: "PA",
    avgMonthlyRent: 1250,
    avgEffectivePropertyTaxRate: 0.0158,
    stateIncomeTax: "3.07% flat",
    investorContext:
      "Pennsylvania investors often weigh older housing stock and city-specific landlord rules. Default rent inputs reflect HUD FMR data—conservative maintenance and vacancy assumptions usually age better than aggressive rent growth.",
    localContext:
      "School taxes and municipality overlays can surprise new owners. Break out taxes and insurance explicitly rather than lumping them into a single low expense ratio.",
  },
  {
    slug: "rhode-island",
    name: "Rhode Island",
    displayName: "Rhode Island",
    type: "state",
    stateCode: "RI",
    avgMonthlyRent: 1700,
    avgEffectivePropertyTaxRate: 0.0163,
    stateIncomeTax: "Up to 5.99%",
    investorContext:
      "Rhode Island's small footprint still has distinct submarkets. Default rent inputs reflect HUD FMR data—tight inventory can make comps noisy, so use ranges and document your rent assumption.",
    localContext:
      "Coastal wind and flood considerations apply in some deals. Add insurance explicitly; this calculator does not infer flood zones.",
  },
  {
    slug: "south-carolina",
    name: "South Carolina",
    displayName: "South Carolina",
    type: "state",
    stateCode: "SC",
    avgMonthlyRent: 1200,
    avgEffectivePropertyTaxRate: 0.0057,
    stateIncomeTax: "Up to 6.2%",
    investorContext:
      "Coastal and inland South Carolina markets differ on insurance and seasonal demand. Default rent inputs are drawn from HUD FMR data—enter expenses that match the property's actual risk profile and age.",
    localContext:
      "Flood zones and wind coverage can dominate total cost near the coast. Investors often separate PITI from true landlord operating expenses when comparing deals.",
  },
  {
    slug: "south-dakota",
    name: "South Dakota",
    displayName: "South Dakota",
    type: "state",
    stateCode: "SD",
    avgMonthlyRent: 950,
    avgEffectivePropertyTaxRate: 0.0122,
    stateIncomeTax: "No state income tax",
    investorContext:
      "South Dakota investors often work with smaller tenant pools outside major hubs. Default rent inputs reflect HUD FMR data—conservative vacancy and expense assumptions usually hold up better than aggressive rent growth.",
    localContext:
      "Winter costs and weather risk can lift maintenance. Model reserves for roofs and mechanicals on older homes.",
  },
  {
    slug: "tennessee",
    name: "Tennessee",
    displayName: "Tennessee",
    type: "state",
    stateCode: "TN",
    avgMonthlyRent: 1150,
    avgEffectivePropertyTaxRate: 0.0071,
    stateIncomeTax: "No state income tax",
    investorContext:
      "Tennessee investors frequently compare urban core deals with suburban cash flow. Default rent inputs are drawn from HUD FMR data—keep expense lines realistic for your property age and local landlord norms.",
    localContext:
      "No state income tax does not remove property tax, insurance, or maintenance from your rental math. Enter those costs explicitly in your scenario.",
  },
  {
    slug: "texas",
    name: "Texas",
    displayName: "Texas",
    type: "state",
    stateCode: "TX",
    avgMonthlyRent: 1350,
    avgEffectivePropertyTaxRate: 0.0168,
    stateIncomeTax: "No state income tax",
    investorContext:
      "Texas remains one of the busiest states for buy-and-hold and value-add strategies. Default rent inputs reflect Texas-typical rents from HUD Fair Market data—always verify taxes, insurance, and rents for your specific submarket.",
    localContext:
      "Property tax rates and insurance costs vary widely by county and carrier. Investors often underwrite with conservative rent growth and exit assumptions. Pair these estimates with local rent comps and lender guidelines before you offer.",
    extraFaqs: [
      {
        question: "Do Texas property taxes affect cash flow in this calculator?",
        answer:
          "Yes—and they matter. Texas has no state income tax but property taxes are among the highest in the country. Default inputs start with HUD-based rent estimates; enter your expected annual property tax and insurance load in the expenses field to model real cash flow.",
      },
    ],
  },
  {
    slug: "utah",
    name: "Utah",
    displayName: "Utah",
    type: "state",
    stateCode: "UT",
    avgMonthlyRent: 1450,
    avgEffectivePropertyTaxRate: 0.0062,
    stateIncomeTax: "4.65% flat",
    investorContext:
      "Utah investors often balance fast population growth history with affordability constraints. Default rent inputs are drawn from HUD FMR data—test downside rent and vacancy paths, not only upside cases.",
    localContext:
      "HOA-heavy new construction differs from older infill on expenses. Match your model to the product type you are buying.",
  },
  {
    slug: "vermont",
    name: "Vermont",
    displayName: "Vermont",
    type: "state",
    stateCode: "VT",
    avgMonthlyRent: 1600,
    avgEffectivePropertyTaxRate: 0.0190,
    stateIncomeTax: "Up to 8.75%",
    investorContext:
      "Vermont markets can be small and seasonal. Default rent inputs reflect HUD FMR data—thin comps mean you should widen uncertainty on rent and expense, since this calculator is only as good as your inputs.",
    localContext:
      "Heating and snow removal can matter more than in mild climates. Use local utility and maintenance expectations.",
  },
  {
    slug: "virginia",
    name: "Virginia",
    displayName: "Virginia",
    type: "state",
    stateCode: "VA",
    avgMonthlyRent: 1650,
    avgEffectivePropertyTaxRate: 0.0093,
    stateIncomeTax: "Up to 5.75%",
    investorContext:
      "Virginia spans expensive Northern Virginia corridors and smaller cash-flow markets. Default rent inputs are drawn from HUD FMR data—use location-specific rent and tax inputs rather than one-size assumptions.",
    localContext:
      "Military presence and federal employment can stabilize rents in some pockets. Model what you can verify with leases and comps, not generic national averages.",
  },
  {
    slug: "washington",
    name: "Washington",
    displayName: "Washington",
    type: "state",
    stateCode: "WA",
    avgMonthlyRent: 1950,
    avgEffectivePropertyTaxRate: 0.0102,
    stateIncomeTax: "No personal income tax",
    investorContext:
      "Pacific Northwest investors often underwrite with tech-job-driven rent demand in mind. Default rent inputs reflect HUD FMR data—still model downside, as job mix shifts and regulation can change outcomes faster than a spreadsheet cell.",
    localContext:
      "Seattle-area and other markets have nuanced landlord-tenant rules. Your underwriting should reflect the rent path you are legally allowed to achieve, not a headline number from another state.",
  },
  {
    slug: "west-virginia",
    name: "West Virginia",
    displayName: "West Virginia",
    type: "state",
    stateCode: "WV",
    avgMonthlyRent: 850,
    avgEffectivePropertyTaxRate: 0.0059,
    stateIncomeTax: "Up to 5.12%",
    investorContext:
      "West Virginia investors often focus on yield and local employment drivers. Default rent inputs reflect HUD FMR data—underwrite maintenance and vacancy for older housing stock carefully.",
    localContext:
      "Mountain weather and access can affect costs in rural deals. Enter expenses that match road access and contractor availability.",
  },
  {
    slug: "wisconsin",
    name: "Wisconsin",
    displayName: "Wisconsin",
    type: "state",
    stateCode: "WI",
    avgMonthlyRent: 1100,
    avgEffectivePropertyTaxRate: 0.0185,
    stateIncomeTax: "Up to 7.65%",
    investorContext:
      "Wisconsin investors balance cold-climate operating costs with stable demand in many metros. Default rent inputs are drawn from HUD FMR data—model utilities and snow removal where they move the needle.",
    localContext:
      "Property tax timing and assessment cycles can confuse first-time buyers. Use tax figures aligned with the municipality's schedule when you can.",
  },
  {
    slug: "wyoming",
    name: "Wyoming",
    displayName: "Wyoming",
    type: "state",
    stateCode: "WY",
    avgMonthlyRent: 1050,
    avgEffectivePropertyTaxRate: 0.0061,
    stateIncomeTax: "No state income tax",
    investorContext:
      "Wyoming markets can be thinly traded with boom–bust commodity exposure in some areas. Default rent inputs reflect HUD FMR data—use conservative ranges when comps are few.",
    localContext:
      "Wind and winter access can affect insurance and maintenance. Enter what your diligence supports for the property's specific location and infrastructure.",
  },
];

const bySlug = new Map(LOCATION_DATA_US_STATES.map((l) => [l.slug, l]));

export function getLocationBySlug(slug: string): LocationData | undefined {
  return bySlug.get(slug);
}

/** All state URL slugs (50). */
export const LOCATION_SLUGS_US = LOCATION_DATA_US_STATES.map((l) => l.slug);
