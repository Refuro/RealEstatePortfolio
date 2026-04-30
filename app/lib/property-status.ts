import {
  getBenchmarkEligibility,
  getBenchmarkTone,
  type BenchmarkEligibility,
} from "./benchmark-utils";
import {
  getPropertyCompleteness,
  type PropertyCompletenessInput,
} from "./property-completeness";

/**
 * Status dot semantics, per claudeCode/PropertyRedesign decision #1.
 *
 * `negative` = `monthlyCashFlow < 0` OR `ltv > 0.90`
 * `warning`  = profile incomplete (score < 100) OR rent below market when benchmark fresh
 * `positive` = otherwise
 *
 * One source of truth for: directory rows, detail hero status dot, task center cards.
 * Don't fork this math into surface-specific code.
 */
export type PropertyStatus = "negative" | "warning" | "positive";

/** LTV at or above this is considered negative. Threshold (>) is strict. */
export const PROPERTY_STATUS_LTV_NEGATIVE_THRESHOLD = 0.9;

export type PropertyStatusMetrics = {
  monthlyCashFlow: number;
  /** Null when no active mortgage. */
  ltv: number | null;
};

export type PropertyStatusBenchmarkInputs = {
  isRented: boolean;
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
};

export function getPropertyStatus(
  property: PropertyCompletenessInput,
  metrics: PropertyStatusMetrics,
  benchmarkInputs: PropertyStatusBenchmarkInputs
): PropertyStatus {
  if (metrics.monthlyCashFlow < 0) return "negative";
  if (metrics.ltv != null && metrics.ltv > PROPERTY_STATUS_LTV_NEGATIVE_THRESHOLD) {
    return "negative";
  }

  const completeness = getPropertyCompleteness(property);
  if (completeness.score < 100) return "warning";

  if (isBenchmarkRentBelowMarket(benchmarkInputs)) return "warning";

  return "positive";
}

function isBenchmarkRentBelowMarket(input: PropertyStatusBenchmarkInputs): boolean {
  const eligibility: BenchmarkEligibility = getBenchmarkEligibility(input);
  if (eligibility !== "eligible_fresh") return false;
  if (input.marketRent == null) return false;
  return getBenchmarkTone(input.userRent, input.marketRent) === "negative";
}
