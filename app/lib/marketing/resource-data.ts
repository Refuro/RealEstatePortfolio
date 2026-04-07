import type { CalculatorFaqItem } from "@/lib/marketing/calculator-faqs";

export type ResourceSection =
  | {
      kind: "h2";
      id: string;
      title: string;
      /** First paragraph is the direct answer (40–60 words target for first sentence). */
      paragraphs: string[];
    }
  | {
      kind: "formula";
      id: string;
      title: string;
      /** Lines shown in a monospace block */
      lines: string[];
      after?: string[];
    }
  | {
      kind: "benchmarkTable";
      id: string;
      title: string;
      headers: [string, string];
      rows: [string, string][];
      footnote?: string;
    };

export type ResourceCalculatorEmbed = "public" | "brrr" | "none";

export type ResourceArticle = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  h1: string;
  sections: ResourceSection[];
  faqs: CalculatorFaqItem[];
  calculatorEmbed: ResourceCalculatorEmbed;
  landingVariant: string;
  relatedSlugs: string[];
};

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    slug: "dscr-explained",
    metaTitle: "What Is DSCR for Rental Property?",
    metaDescription:
      "DSCR (debt service coverage ratio) measures whether net operating income covers mortgage payments on a rental. Learn the formula and how lenders use it.",
    category: "Financing",
    h1: "DSCR explained for real estate investors",
    sections: [
      {
        kind: "h2",
        id: "what",
        title: "What is DSCR?",
        paragraphs: [
          "DSCR—debt service coverage ratio—is the ratio of net operating income (NOI) to required debt service (loan payments) for a property over a defined period, usually a year. A DSCR above 1.0 means NOI exceeds scheduled debt payments; below 1.0 means NOI does not fully cover debt service on those inputs. Lenders use DSCR (along with other rules) to assess whether rental income can support a loan; investors use it to stress-test coverage before they borrow.",
          "NOI is rent and other income minus operating expenses—not mortgage principal and interest. Debt service is the P&I (and sometimes other required loan payments) the lender defines for the test. Always align the time period (monthly vs annual) across numerator and denominator so you are not mixing bases.",
        ],
      },
      {
        kind: "formula",
        id: "how",
        title: "How to calculate DSCR",
        lines: [
          "DSCR = Net Operating Income ÷ Debt Service",
          "",
          "Example (annual):",
          "NOI = $24,000",
          "Annual debt service = $20,000",
          "DSCR = 24,000 ÷ 20,000 = 1.20",
        ],
        after: [
          "If you use monthly figures, use monthly NOI and monthly debt service in the same step. Do not annualize one side and leave the other monthly.",
        ],
      },
      {
        kind: "benchmarkTable",
        id: "good",
        title: "What counts as a “good” DSCR?",
        headers: ["Context", "Typical expectation"],
        rows: [
          [
            "General investor sanity check",
            "Above 1.0 means NOI covers scheduled payments on your modeled inputs; many investors prefer cushion above 1.0.",
          ],
          [
            "Lender underwriting (illustrative)",
            "Commercial and DSCR loan programs often cite minimums such as 1.20x or 1.25x for qualifying—requirements vary by lender, product, and market.",
          ],
        ],
        footnote:
          "Thresholds are product-specific. Your lender’s test may use different income definitions, reserves, or stress rates than a simple spreadsheet.",
      },
      {
        kind: "h2",
        id: "veld",
        title: "How Veld uses DSCR",
        paragraphs: [
          "Veld’s calculators and property views show DSCR from your inputs so you can compare scenarios. These aren’t a lender’s underwriting model—use them to prepare questions for your loan officer.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is DSCR the same as cash flow?",
        answer:
          "No. Cash flow is dollars left after expenses and debt service. DSCR is a ratio that compares NOI to debt service before you interpret cash remaining for the owner.",
      },
      {
        question: "Should I use gross rent in DSCR?",
        answer:
          "Standard DSCR for income property uses NOI (after operating expenses), not gross rent. Using gross rent overstates coverage unless your lender defines an exception.",
      },
      {
        question: "Does a high DSCR guarantee loan approval?",
        answer:
          "No. Lenders also consider credit, reserves, appraisal, DTI, and program rules. DSCR is one piece of the picture.",
      },
      {
        question: "Where can I estimate DSCR quickly?",
        answer:
          "Use Veld’s free investment property calculator on this site. Create a free account to save work in Analyze.",
      },
    ],
    calculatorEmbed: "public",
    landingVariant: "resource_dscr_v1",
    relatedSlugs: ["cap-rate-explained", "cash-on-cash-return", "rental-property-metrics"],
  },
  {
    slug: "cap-rate-explained",
    metaTitle: "What Is Cap Rate? How to Calculate It",
    metaDescription:
      "Cap rate is annual NOI divided by price or value—an income-based snapshot for comparing rental properties. Learn the formula and limits of cap rate.",
    category: "Valuation",
    h1: "Cap rate explained for rental properties",
    sections: [
      {
        kind: "h2",
        id: "what",
        title: "What is cap rate?",
        paragraphs: [
          "Cap rate—capitalization rate—is the ratio of annual net operating income (NOI) to the property’s price or value, expressed as a percentage. It summarizes how much income the asset generates relative to its cost in one number, which helps compare deals on a similar basis. Cap rate is not a guarantee of return; it ignores financing, taxes, appreciation, and your specific leverage.",
          "Higher cap rates often imply higher expected income relative to price (sometimes with higher perceived risk); lower cap rates often imply lower yield relative to price in competitive markets. Always read cap rate alongside condition, location, and your own cost of capital.",
        ],
      },
      {
        kind: "formula",
        id: "how",
        title: "How to calculate cap rate",
        lines: [
          "Cap rate = Net Operating Income ÷ Value (or purchase price)",
          "",
          "Example:",
          "NOI = $12,000/year",
          "Purchase price = $200,000",
          "Cap rate = 12,000 ÷ 200,000 = 6.0%",
        ],
        after: [
          "Use the same basis for NOI and value (e.g., both annual). If you use a broker’s pro forma NOI, reconcile it to your own expense lines.",
        ],
      },
      {
        kind: "benchmarkTable",
        id: "good",
        title: "What is a “good” cap rate?",
        headers: ["Reality check", "Takeaway"],
        rows: [
          [
            "No universal good number",
            "Cap rate varies by market, asset class, and risk. A 8% cap in one city is not automatically better than 5% in another without context.",
          ],
          [
            "Compare apples to apples",
            "Match NOI definitions and inclusions when you compare listings or offering memos.",
          ],
        ],
      },
      {
        kind: "h2",
        id: "limits",
        title: "Limits of cap rate",
        paragraphs: [
          "Cap rate does not include mortgage payments, closing costs, or your tax situation. For levered returns, pair cap rate with cash-on-cash return and DSCR.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is cap rate the same as cash-on-cash return?",
        answer:
          "No. Cap rate uses NOI and value without your loan. Cash-on-cash compares cash flow to the cash you invested and depends on financing.",
      },
      {
        question: "Should I use list price or my offer for cap rate?",
        answer:
          "Use the price that reflects the deal you are analyzing—often your expected purchase price or appraised value depending on the question you are answering.",
      },
      {
        question: "Does Veld show cap rate?",
        answer:
          "Yes, where applicable, in calculators and property views based on inputs and policies documented in the product. Treat outputs as estimates.",
      },
    ],
    calculatorEmbed: "public",
    landingVariant: "resource_cap_v1",
    relatedSlugs: ["dscr-explained", "cash-on-cash-return", "rental-property-metrics"],
  },
  {
    slug: "cash-on-cash-return",
    metaTitle: "Cash-on-Cash Return Explained",
    metaDescription:
      "Cash-on-cash return compares annual pre-tax cash flow to cash invested in a rental. See the formula, examples, and how it differs from cap rate.",
    category: "Returns",
    h1: "Cash-on-cash return for real estate investors",
    sections: [
      {
        kind: "h2",
        id: "what",
        title: "What is cash-on-cash return?",
        paragraphs: [
          "Cash-on-cash return is the ratio of annual pre-tax cash flow from a property to the total cash equity you invested to acquire and stabilize it, expressed as a percentage. It answers how hard your out-of-pocket cash is working in a given year—not your total economic return (which can include principal paydown, tax effects, and appreciation). It is sensitive to loan terms, down payment, and one-time startup costs.",
          "Investors often use cash-on-cash alongside cap rate and DSCR: cap rate summarizes unlevered yield on the asset; cash-on-cash summarizes levered yield on your cash.",
        ],
      },
      {
        kind: "formula",
        id: "how",
        title: "How to calculate cash-on-cash return",
        lines: [
          "Cash-on-cash = Annual pre-tax cash flow ÷ Total cash invested",
          "",
          "Example:",
          "Annual cash flow after debt service = $6,000",
          "Cash invested (down payment + closing + rehab out-of-pocket) = $50,000",
          "Cash-on-cash = 6,000 ÷ 50,000 = 12%",
        ],
        after: [
          "Align what you count as “cash invested” with your actual checks—include reserves you truly allocate to the deal if that is part of your model.",
        ],
      },
      {
        kind: "h2",
        id: "compare",
        title: "Cash-on-cash vs cap rate",
        paragraphs: [
          "Cap rate divides NOI by value without your loan. Cash-on-cash divides levered cash flow by your invested cash. A property can have a moderate cap rate but attractive cash-on-cash if leverage improves the cash yield—or the reverse if expenses or vacancy are high.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is cash-on-cash the same as ROI?",
        answer:
          "People use “ROI” loosely. Cash-on-cash is one ROI measure focused on cash flow vs cash in. Total ROI can include appreciation, paydown, and taxes—different calculation.",
      },
      {
        question: "Should I include reserves in cash invested?",
        answer:
          "Be consistent. Some investors include acquisition reserves; others track reserves separately. Document your definition when you compare deals.",
      },
      {
        question: "Where can I estimate cash flow and cash-on-cash?",
        answer:
          "Veld’s public investment property calculator lets you test inputs quickly; a free account unlocks saving work in Analyze and portfolio tracking.",
      },
    ],
    calculatorEmbed: "public",
    landingVariant: "resource_coc_v1",
    relatedSlugs: ["cap-rate-explained", "dscr-explained", "rental-property-metrics"],
  },
  {
    slug: "brrrr-method-explained",
    metaTitle: "BRRRR Method Explained (Buy, Rehab, Rent, Refinance)",
    metaDescription:
      "BRRRR is a repeatable rental strategy: buy, rehab, rent, refinance, repeat. Learn the sequence, risks, and how to model cash-out and stabilized rent.",
    category: "Strategy",
    h1: "The BRRRR method explained",
    sections: [
      {
        kind: "h2",
        id: "what",
        title: "What is BRRRR?",
        paragraphs: [
          "BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat—a cycle many investors use to acquire undervalued or distressed rentals, force equity through renovation, lease the property, then refinance to recover capital for the next deal. The goal is to recycle cash while building a portfolio, but execution depends on accurate rehab budgets, rent comps, lender rules, and refinance timing.",
          "No strategy removes risk: overruns, appraisal gaps, interest-rate moves, or rent shortfalls can reduce or eliminate expected cash-out. Model ranges, not single-point optimism.",
        ],
      },
      {
        kind: "h2",
        id: "steps",
        title: "How the steps fit together",
        paragraphs: [
          "Buy: acquire with a financing structure that fits the rehab timeline (often short-term or private money). Rehab: complete scope on budget before you stabilize. Rent: lease at market-supported rent with a qualified tenant. Refinance: replace short-term financing with a long-term loan sized to value and underwriting—often after a seasoning period. Repeat: redeploy returned capital subject to lender limits and your risk tolerance.",
        ],
      },
      {
        kind: "h2",
        id: "model",
        title: "How to model BRRRR in Veld",
        paragraphs: [
          "Use Veld’s BRRRR calculator to stress rehab cost, ARV, refinance LTV, and stabilized rent against interest-only rehab assumptions. Outputs are educational—your lender’s appraisal, DSCR test, and reserves requirement govern what you can actually borrow.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does BRRRR always return all my cash?",
        answer:
          "No. Cash-out depends on ARV, LTV limits, closing costs, and underwriting. Many deals return part of the capital, not 100%.",
      },
      {
        question: "What is seasoning?",
        answer:
          "Lenders may require months of ownership or stable rent before a cash-out refinance. Rules vary by program.",
      },
      {
        question: "Is BRRRR only for single-family homes?",
        answer:
          "Investors apply the same idea to small multis and other asset types when the numbers and financing fit.",
      },
    ],
    calculatorEmbed: "brrr",
    landingVariant: "resource_brrrr_v1",
    relatedSlugs: ["dscr-explained", "cap-rate-explained", "cash-on-cash-return"],
  },
  {
    slug: "rental-property-metrics",
    metaTitle: "Key Rental Property Metrics (Glossary)",
    metaDescription:
      "A concise glossary of NOI, cap rate, DSCR, cash-on-cash, and related terms for analyzing rentals—plus where to try calculators on Veld.",
    category: "Glossary",
    h1: "Rental property metrics at a glance",
    sections: [
      {
        kind: "h2",
        id: "overview",
        title: "How investors use these metrics",
        paragraphs: [
          "Rental analysis stacks a few core metrics: income, operating expenses, debt service, and value. NOI measures operating income before financing. Cap rate relates NOI to value. DSCR tests whether NOI covers loan payments. Cash-on-cash compares cash flow to cash you invested. Together they answer different questions—no single number replaces a full pro forma.",
          "Use consistent definitions across properties when you compare deals. Small differences in how NOI or value is defined can move conclusions more than a rounding error.",
        ],
      },
      {
        kind: "benchmarkTable",
        id: "glossary",
        title: "Metric glossary",
        headers: ["Metric", "One-line meaning"],
        rows: [
          ["Gross rent", "Scheduled rent before vacancy and collection loss."],
          ["Vacancy / credit loss", "Reduction for uncollected or empty rent—often modeled as a percent of gross."],
          ["Effective gross income", "Gross rent minus vacancy/credit loss plus other income."],
          ["Operating expenses", "Costs to operate the property excluding mortgage principal/interest and owner income taxes."],
          ["NOI", "Effective gross income minus operating expenses (before debt service)."],
          ["Debt service", "Required loan payments (and any inclusions your lender defines)."],
          ["DSCR", "NOI ÷ debt service—coverage of debt from operations."],
          ["Cap rate", "NOI ÷ value or price—unlevered income yield snapshot."],
          ["Cash-on-cash", "Annual pre-tax cash flow ÷ cash invested—levered cash yield snapshot."],
        ],
        footnote: "See linked articles below for deeper dives on DSCR, cap rate, and cash-on-cash.",
      },
      {
        kind: "h2",
        id: "next",
        title: "Where to go next",
        paragraphs: [
          "Open the dedicated explainers for DSCR, cap rate, and cash-on-cash, then try the free calculators on Veld.",
        ],
      },
    ],
    faqs: [
      {
        question: "Which metric should I look at first?",
        answer:
          "Start with rent and expenses to build NOI, then add financing for DSCR and cash flow. Cap rate and cash-on-cash summarize different slices of the same story.",
      },
      {
        question: "Are RentCast estimates in Veld guarantees?",
        answer:
          "No. Rent and value estimates are labeled as estimates in the product and should be validated with comps and diligence.",
      },
      {
        question: "Can I save analyses in Veld?",
        answer:
          "Yes—with a free account you can use Analyze and portfolio features subject to plan limits on the Pricing page.",
      },
    ],
    calculatorEmbed: "public",
    landingVariant: "resource_glossary_v1",
    relatedSlugs: ["dscr-explained", "cap-rate-explained", "cash-on-cash-return"],
  },
];

const bySlug = new Map(RESOURCE_ARTICLES.map((a) => [a.slug, a]));

export function getResourceArticle(slug: string): ResourceArticle | undefined {
  return bySlug.get(slug);
}

export function getResourceSlugs(): string[] {
  return RESOURCE_ARTICLES.map((a) => a.slug);
}
