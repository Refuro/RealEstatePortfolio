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
