/**
 * Refi-readiness check + shared refi math.
 *
 * Single source of truth for:
 * - Properties task center "Refi-ready" card (decision #2)
 * - Insights `refi_gap` generator (which wraps the inverse-DSCR math here)
 * - Future surfaces that need to ask "can this property refi today?"
 *
 * Qualifying rule (per claudeCode/PropertyRedesign decision #2, 2026-04-29 revision):
 *   equity ≥ 40% AND DSCR ≥ 1.25 AND has active mortgage
 *
 * All three conditions are required:
 *   - Equity-only would over-fire on high-leverage early-tenure properties.
 *   - DSCR-only would over-fire on properties without enough equity to cash out.
 *   - Active-mortgage requirement keeps the framing honest: refi means
 *     refinancing an existing loan, not originating a new one against a
 *     paid-off property. Cash-out on paid-off properties is a distinct signal
 *     that, if needed, deserves its own card.
 */

/** DSCR threshold lenders use for competitive refi terms. */
export const REFI_TARGET_DSCR = 1.25;

/** Fraction of estimated value that must be equity to qualify for refi-ready. */
export const REFI_EQUITY_THRESHOLD = 0.4;

/**
 * Vacancy gate for the inverse-DSCR rent-needed calculation. At very high
 * vacancy the math becomes unreliable (small denominator, big swings).
 * Refi-gap reuses this gate; refi-ready does NOT use it (qualifying check
 * doesn't depend on rent math).
 */
export const REFI_MAX_VACANCY_PCT = 50;

export type RefiReadyInput = {
  /** True when the property has an active mortgage (loan rows exist). */
  hasActiveMortgage: boolean;
  /** Current estimated value (full, not ownership-scaled). */
  estimatedValue: number;
  /** Total balance across all active mortgages (full, not ownership-scaled). */
  totalMortgageBalance: number;
  /**
   * Property DSCR per the metrics layer. Null when no active mortgage.
   * Caller is expected to pass the same value displayed elsewhere — don't
   * recompute here.
   */
  dscr: number | null;
};

export type RefiReadyStatus = {
  qualifies: boolean;
  /** 0–1 fraction. Computed as (estimatedValue − totalMortgageBalance) / estimatedValue. */
  equityPct: number;
  /** Pass-through of the input DSCR. Null when no active mortgage. */
  dscr: number | null;
  /** Dollar equity = estimatedValue − totalMortgageBalance (full, not ownership-scaled). */
  currentEquity: number;
  /** Pass-through of `hasActiveMortgage` for callers rendering "no mortgage" tags. */
  hasMortgage: boolean;
};

/**
 * Returns refi-readiness for a single property.
 *
 * Qualification:
 *   equity ≥ 40% AND DSCR ≥ 1.25 AND has active mortgage
 */
export function getRefiReadyStatus(input: RefiReadyInput): RefiReadyStatus {
  const equityPct =
    input.estimatedValue > 0
      ? (input.estimatedValue - input.totalMortgageBalance) / input.estimatedValue
      : 0;
  const currentEquity = input.estimatedValue - input.totalMortgageBalance;

  const hasEquity = equityPct >= REFI_EQUITY_THRESHOLD;
  const dscrPasses =
    input.hasActiveMortgage && input.dscr != null && input.dscr >= REFI_TARGET_DSCR;

  return {
    qualifies: hasEquity && dscrPasses,
    equityPct,
    dscr: input.dscr,
    currentEquity,
    hasMortgage: input.hasActiveMortgage,
  };
}

export type RentForTargetDscrInput = {
  /** Annual debt service in full (P&I + escrow if applicable). */
  annualDebtService: number;
  /** Monthly operating expenses (full, not ownership-scaled). */
  monthlyExpenses: number;
  /** Vacancy as 0–100 percent. */
  vacancyPercent: number;
};

/**
 * Inverse-DSCR math: monthly rent required to hit `REFI_TARGET_DSCR` at the
 * given debt service / expenses / vacancy. Returns null when the inputs are
 * outside the supported range (vacancy at/above {@link REFI_MAX_VACANCY_PCT},
 * non-positive debt service, etc.).
 *
 *   target_NOI                  = TARGET_DSCR × annualDebtService
 *   target_grossAnnualRent      = target_NOI + annualExpenses
 *   target_effectiveMonthlyRent = target_grossAnnualRent / 12
 *   target_monthlyRent          = target_effectiveMonthlyRent / (1 − vacancy)
 */
export function computeRentForTargetDscr(input: RentForTargetDscrInput): number | null {
  if (input.annualDebtService <= 0) return null;
  if (input.vacancyPercent >= REFI_MAX_VACANCY_PCT) return null;
  const vacancyFraction = 1 - input.vacancyPercent / 100;
  if (vacancyFraction <= 0) return null;

  const annualExpenses = input.monthlyExpenses * 12;
  const targetNoi = REFI_TARGET_DSCR * input.annualDebtService;
  const targetGrossAnnualRent = targetNoi + annualExpenses;
  const targetEffectiveMonthly = targetGrossAnnualRent / 12;
  return targetEffectiveMonthly / vacancyFraction;
}
