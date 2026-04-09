/** Single source of truth for calculator FAQ JSON-LD and visible FAQ copy (must match verbatim). */

export type CalculatorFaqItem = { question: string; answer: string };

export const INVESTMENT_PROPERTY_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "How do you calculate rental property cash flow?",
    answer:
      "Cash flow is monthly rent minus monthly expenses and debt service, adjusted for vacancy assumptions.",
  },
  {
    question: "What is a good DSCR for rental property?",
    answer:
      "A DSCR above 1.0 generally means NOI covers debt service. Many investors target 1.20 or higher for safety.",
  },
  {
    question: "Can I save calculator results?",
    answer:
      "This calculator does not store your session. A free account lets you save deals in the deal analyzer and track properties in your portfolio—you enter assumptions there.",
  },
];

export const BRRR_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "What is BRRRR in real estate investing?",
    answer:
      "BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat: acquire a property, improve it, lease it, refinance into a new loan often sized to after-repair value, and redeploy capital. This calculator models interest-only rehab financing and a cash-out refinance at your stated ARV and LTV.",
  },
  {
    question: "How is refinance cash-out estimated here?",
    answer:
      "The model applies your refinance LTV to ARV to estimate a new loan amount, then pays off the acquisition loan balance. Proceeds are before closing costs and reserves—add those in your own underwriting.",
  },
  {
    question: "Will my lender approve these numbers?",
    answer:
      "No. Outputs are educational; lenders use their own appraisal, DSCR, and underwriting rules. Confirm terms, reserves, taxes, and insurance with your lender before relying on any scenario.",
  },
];

export const STR_VS_LTR_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "How do STR platform fees affect returns?",
    answer:
      "Platform fees reduce gross booking revenue before operating expenses. This calculator applies your fee percentage to gross nightly revenue after occupancy.",
  },
  {
    question: "What occupancy makes short-term rental worth it vs long-term?",
    answer:
      "It depends on nightly rate, fees, and expenses. Raise occupancy or nightly rate until STR cash flow and NOI beat your long-term rent scenario on the same financing.",
  },
];

export const FIX_AND_FLIP_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "How do you calculate fix and flip profit?",
    answer:
      "Net profit is sale proceeds after selling costs and loan payoff, minus cash invested (down payment, rehab, interest-only payments during hold, and monthly carrying costs).",
  },
  {
    question: "What is a good ROI for house flipping?",
    answer:
      "Targets vary by market and risk. Many investors compare return on cash to alternative uses of capital and minimum hurdle rates after accounting for taxes and contingencies.",
  },
];

export const CAP_RATE_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "How do you calculate cap rate on a rental property?",
    answer:
      "Cap rate is annual NOI divided by purchase price. NOI is effective gross income after vacancy minus operating expenses like taxes, insurance, and recurring costs.",
  },
  {
    question: "What is a good cap rate?",
    answer:
      "A good cap rate depends on market risk, asset quality, and growth expectations. Many investors compare cap rate against local comps, financing terms, and target return hurdles.",
  },
  {
    question: "Can I save cap rate calculator results?",
    answer:
      "This calculator does not save your session. Use a free Veld account to save deals in the deal analyzer and track portfolio assumptions over time.",
  },
];

export const CASH_ON_CASH_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "How do you calculate cash-on-cash return?",
    answer:
      "Cash-on-cash return is annual pre-tax cash flow divided by total upfront cash invested. This includes down payment, closing costs, rehab, and other initial costs.",
  },
  {
    question: "What is a good cash-on-cash return for rental property?",
    answer:
      "Targets vary by market and risk profile. Many investors compare cash-on-cash return against financing risk, vacancy assumptions, and alternative uses of capital.",
  },
  {
    question: "Can I save cash-on-cash calculator results?",
    answer:
      "This calculator does not save your session. Use a free Veld account to save deal assumptions, compare scenarios, and track portfolio performance over time.",
  },
];

export const WHOLESALE_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "How do you calculate MAO in wholesale real estate?",
    answer:
      "A common baseline is the 70% rule: MAO starts with ARV multiplied by your target percentage, then subtracts repairs, closing costs, holding costs, and assignment fee.",
  },
  {
    question: "Can MAO be negative?",
    answer:
      "Yes. A negative MAO means the deal does not support your target margin at those assumptions and likely needs a lower purchase price or different terms.",
  },
  {
    question: "Can I save wholesale calculator results?",
    answer:
      "This calculator does not save your session. Use a free Veld account to save deal assumptions, compare scenarios, and track properties over time.",
  },
];

export const DSCR_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "What is DSCR for rental property?",
    answer:
      "Debt Service Coverage Ratio (DSCR) is annual NOI divided by annual debt service. A DSCR above 1.0 means NOI covers debt payments before tax.",
  },
  {
    question: "Is 1.25 DSCR required by lenders?",
    answer:
      "Many DSCR lenders target around 1.20 to 1.25, but requirements vary by product, market, and borrower profile. Always confirm current underwriting with your lender.",
  },
  {
    question: "Can I save DSCR calculator results?",
    answer:
      "This calculator does not save your session. Use a free Veld account to save assumptions, compare scenarios, and track deal performance over time.",
  },
];

export const RENT_VS_BUY_CALCULATOR_FAQ: CalculatorFaqItem[] = [
  {
    question: "How does this rent vs buy calculator find break-even?",
    answer:
      "It compares cumulative renting cost to cumulative owning cost net of equity (principal paydown plus appreciation). Break-even is the first year owning costs less than renting.",
  },
  {
    question: "Does this include opportunity cost of the down payment?",
    answer:
      "Yes. The rent path includes foregone investment returns by compounding the down payment at your chosen investment return assumption.",
  },
  {
    question: "Can I save rent vs buy scenarios?",
    answer:
      "This calculator does not save your session. Use a free Veld account to save assumptions, compare scenarios, and track your property decisions over time.",
  },
];
