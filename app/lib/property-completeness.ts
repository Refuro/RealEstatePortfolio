export type PropertyCompletenessInput = {
  purchasePrice: number;
  currentEstimatedValue: number;
  cashInvested: number | null;
  mortgageCount: number;
  hasMortgage: boolean | null;
  mortgagePaidOff: boolean;
};

export type CompletenessResult = {
  /** 0–100. Quick-add with no enrichment scores 10. */
  score: number;
  /** Human-readable labels for metric-ready fields that are still missing. */
  missingFields: string[];
};

/**
 * Scores a property's data completeness against metric-ready fields only.
 *
 * Weights (per claudeCode/PropertyRedesign decision #3):
 *   Base (address + type + value + rent + expenses — always set):  10
 *   Purchase price differs from estimated value:                   30
 *   Mortgage confirmed (active OR no-mortgage OR paid-off):        30
 *   Cash invested set:                                             30
 *   Max total:                                                    100
 *
 * Bed/bath/sqft and the rent benchmark are intentionally excluded — they don't
 * gate any computed metric, so they don't count against completeness.
 */
export function getPropertyCompleteness(
  input: PropertyCompletenessInput
): CompletenessResult {
  const missing: string[] = [];
  let score = 10;

  if (Math.round(input.purchasePrice) !== Math.round(input.currentEstimatedValue)) {
    score += 30;
  } else {
    missing.push("actual purchase price");
  }

  const mortgageConfirmed =
    input.mortgageCount > 0 ||
    input.hasMortgage === false ||
    input.mortgagePaidOff;
  if (mortgageConfirmed) {
    score += 30;
  } else if (input.hasMortgage === true && input.mortgageCount === 0) {
    missing.push("mortgage details");
  } else {
    missing.push("mortgage status");
  }

  if (input.cashInvested != null) {
    score += 30;
  } else {
    missing.push("cash invested");
  }

  return {
    score,
    missingFields: missing,
  };
}
