/**
 * Semantic tones for calculator metric values (DSCR, cash flow, etc.).
 * Thresholds are documented in docs/policies/calculator-metric-tones.md
 */

export type CalculatorMetricTone = "default" | "positive" | "warning" | "negative";

/** Tailwind classes for the metric value line (not color-only — label + number remain). */
export const calculatorToneValueClass: Record<CalculatorMetricTone, string> = {
  default: "text-foreground",
  positive: "text-positive",
  warning: "text-warning",
  negative: "text-negative",
};

/** Optional left accent on metric cards — empty string for default. */
export const calculatorToneCardClass: Record<CalculatorMetricTone, string> = {
  default: "",
  positive: "border-l-positive",
  warning: "border-l-warning",
  negative: "border-l-negative",
};

export function getDscrTone(dscr: number | null): CalculatorMetricTone {
  if (dscr == null || !Number.isFinite(dscr)) return "default";
  if (dscr >= 1) return "positive";
  if (dscr >= 0.9) return "warning";
  return "negative";
}

export function getMonthlyCashFlowTone(monthlyCashFlow: number): CalculatorMetricTone {
  if (!Number.isFinite(monthlyCashFlow)) return "default";
  return monthlyCashFlow >= 0 ? "positive" : "negative";
}

/** `cashOnCashReturn` is a decimal (e.g. 0.12 = 12%). */
export function getCashOnCashTone(cashOnCashReturn: number | null): CalculatorMetricTone {
  if (cashOnCashReturn == null || !Number.isFinite(cashOnCashReturn)) return "default";
  return cashOnCashReturn >= 0 ? "positive" : "negative";
}

/** Cap rate is informational only on calculators — no semantic good/bad color. */
export function getCapRateTone(): CalculatorMetricTone {
  return "default";
}
