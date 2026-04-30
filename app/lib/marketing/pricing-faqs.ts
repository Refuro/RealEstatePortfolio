import type { CalculatorFaqItem } from "@/lib/marketing/calculator-faqs";

/**
 * Canonical FAQ for /pricing. Used by both visible `CalculatorFaqSection` and
 * `CalculatorFaqJsonLd` (verbatim match required).
 */
export const PRICING_FAQ: CalculatorFaqItem[] = [
  {
    question: "Does the Free plan require a credit card?",
    answer:
      "No. The Free plan is completely free with no card required. You only need a card when upgrading to Investor or Pro.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. All your data — properties, deals, and settings — carries over automatically when you upgrade or downgrade.",
  },
  {
    question: "What happens when I reach my property limit?",
    answer:
      "You can't add new properties until you upgrade or remove one. If you already have more on file than your current plan allows—for example after downgrading or when a trial ends—the Properties list shows up to your plan cap and the rest stay locked until you upgrade.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel anytime from Settings or the billing portal. Your plan reverts to Free at the end of the billing period and your data stays intact.",
  },
  {
    question: "What are portfolio insights, and which plans include them?",
    answer:
      "Portfolio insights highlight what's working, what's at risk, and where to focus. Insights like rent below market, cash flow drag, or refinance opportunities. Investor and Pro include them. During the 14-day trial on a free subscription you get Investor-level access, including insights. If you stay on Free after the trial ends, portfolio insights are not included.",
  },
];
