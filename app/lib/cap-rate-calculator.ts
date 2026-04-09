/**
 * Cap rate educational calculator — pure functions.
 * Model: annual NOI from effective gross income minus operating expenses.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type CapRateInput = {
  purchasePrice: number;
  monthlyRent: number;
  vacancyPercent: number;
  monthlyOperatingExpenses: number;
  annualPropertyTaxes: number;
  annualInsurance: number;
  otherMonthlyCosts: number;
};

export type CapRateResult = {
  capRate: number | null;
  annualNoi: number;
  monthlyNoi: number;
  grossRentMultiplier: number | null;
  effectiveGrossIncome: number;
  totalAnnualExpenses: number;
};

export function computeCapRateResult(input: CapRateInput): CapRateResult {
  const purchasePrice = Math.max(0, input.purchasePrice);
  const monthlyRent = Math.max(0, input.monthlyRent);
  const vacancyPercent = clamp(input.vacancyPercent, 0, 100);
  const monthlyOperatingExpenses = Math.max(0, input.monthlyOperatingExpenses);
  const annualPropertyTaxes = Math.max(0, input.annualPropertyTaxes);
  const annualInsurance = Math.max(0, input.annualInsurance);
  const otherMonthlyCosts = Math.max(0, input.otherMonthlyCosts);

  const effectiveGrossIncome = monthlyRent * 12 * (1 - vacancyPercent / 100);
  const totalAnnualExpenses =
    (monthlyOperatingExpenses + otherMonthlyCosts) * 12 + annualPropertyTaxes + annualInsurance;
  const annualNoi = effectiveGrossIncome - totalAnnualExpenses;
  const monthlyNoi = annualNoi / 12;

  const capRate = purchasePrice > 0 ? annualNoi / purchasePrice : null;
  const grossRentMultiplier = monthlyRent > 0 ? purchasePrice / (monthlyRent * 12) : null;

  return {
    capRate,
    annualNoi,
    monthlyNoi,
    grossRentMultiplier,
    effectiveGrossIncome,
    totalAnnualExpenses,
  };
}
