export type PropertyCompletenessInput = {
  purchasePrice: number;
  currentEstimatedValue: number;
  cashInvested: number | null;
  mortgageCount: number;
  hasMortgage: boolean | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
};

export type CompletenessResult = {
  /** 0–100. Quick-add with no enrichment scores 10. */
  score: number;
  /** Human-readable labels for metric-ready fields that are still missing. */
  missingFields: string[];
  /** true when score >= COMPLETENESS_THRESHOLD (60). */
  isComplete: boolean;
};

/**
 * Minimum score for a property to be considered "complete".
 * Purchase price differentiated + mortgage status confirmed + profile details = 80 (threshold exceeded).
 */
export const COMPLETENESS_THRESHOLD = 60;

/**
 * Scores a property's data completeness against metric-ready fields only.
 *
 * Weights:
 *   Base (address + type + value + rent + expenses — always set):  10
 *   Purchase price differs from estimated value:                   25
 *   Mortgage confirmed (has one, OR explicitly "no mortgage"):     25
 *   Cash invested set:                                             20
 *   Bedroom/bathroom/sqft profile set:                             20
 *   Max total:                                                    100
 *
 * Bed/bath/sqft do not affect financial formulas directly, but they are still
 * required for profile completeness and should trigger the completion banner
 * when missing.
 *
 * @see docs/policies/property-completeness.md — canonical field classification,
 *   scoring rationale, threshold definition, and banner behavior rules.
 */
export function getPropertyCompleteness(
  input: PropertyCompletenessInput
): CompletenessResult {
  const missing: string[] = [];
  let score = 10;

  if (Math.round(input.purchasePrice) !== Math.round(input.currentEstimatedValue)) {
    score += 25;
  } else {
    missing.push("actual purchase price");
  }

  const mortgageConfirmed =
    input.mortgageCount > 0 || input.hasMortgage === false;
  if (mortgageConfirmed) {
    score += 25;
  } else if (input.hasMortgage === true && input.mortgageCount === 0) {
    missing.push("mortgage details");
  } else {
    missing.push("mortgage status");
  }

  if (input.cashInvested != null) {
    score += 20;
  } else {
    missing.push("cash invested");
  }

  if (input.bedrooms != null && input.bathrooms != null && input.squareFeet != null) {
    score += 20;
  } else {
    if (input.bedrooms == null) missing.push("bedrooms");
    if (input.bathrooms == null) missing.push("bathrooms");
    if (input.squareFeet == null) missing.push("square feet");
  }

  return {
    score,
    missingFields: missing,
    isComplete: score >= COMPLETENESS_THRESHOLD,
  };
}
