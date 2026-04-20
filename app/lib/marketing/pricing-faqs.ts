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
      "You can view all your existing properties but cannot add new ones until you upgrade or remove a property.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel anytime from Settings or the billing portal. Your plan reverts to Free at the end of the billing period and your data stays intact.",
  },
];
