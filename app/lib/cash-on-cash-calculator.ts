/**
 * Cash-on-cash educational calculator — pure functions.
 * Model: annual cash flow divided by upfront cash invested.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type CashOnCashInput = {
  monthlyRent: number;
  vacancyPercent: number;
  monthlyOperatingExpenses: number;
  monthlyMortgagePayment: number;
  downPayment: number;
  closingCosts: number;
  rehabCapex: number;
  otherUpfrontCosts: number;
};

export type CashOnCashResult = {
  cocReturnPercent: number | null;
  monthlyCashFlow: number;
  annualCashFlow: number;
  totalCashInvested: number;
  grossYieldPercent: number | null;
  breakEvenMonths: number | null;
  annualCashDollar: number;
};

export function computeCashOnCashResult(input: CashOnCashInput): CashOnCashResult {
  const monthlyRent = Math.max(0, input.monthlyRent);
  const vacancyPercent = clamp(input.vacancyPercent, 0, 100);
  const monthlyOperatingExpenses = Math.max(0, input.monthlyOperatingExpenses);
  const monthlyMortgagePayment = Math.max(0, input.monthlyMortgagePayment);
  const downPayment = Math.max(0, input.downPayment);
  const closingCosts = Math.max(0, input.closingCosts);
  const rehabCapex = Math.max(0, input.rehabCapex);
  const otherUpfrontCosts = Math.max(0, input.otherUpfrontCosts);

  const effectiveMonthlyRent = monthlyRent * (1 - vacancyPercent / 100);
  const monthlyCashFlow =
    effectiveMonthlyRent - monthlyOperatingExpenses - monthlyMortgagePayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const totalCashInvested = downPayment + closingCosts + rehabCapex + otherUpfrontCosts;

  const cocReturnPercent =
    totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : null;
  const grossYieldPercent =
    totalCashInvested > 0 ? ((monthlyRent * 12) / totalCashInvested) * 100 : null;
  const breakEvenMonths = monthlyCashFlow > 0 ? totalCashInvested / monthlyCashFlow : null;

  return {
    cocReturnPercent,
    monthlyCashFlow,
    annualCashFlow,
    totalCashInvested,
    grossYieldPercent,
    breakEvenMonths,
    annualCashDollar: annualCashFlow,
  };
}
