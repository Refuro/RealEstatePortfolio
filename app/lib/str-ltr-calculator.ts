/**
 * STR vs LTR comparison — pure functions.
 *
 * STR revenue: booked nights/year = 365 × (annual occupancy %); gross = nights × nightly rate;
 * net of platform fees = gross × (1 − platform fee %). Effective monthly rent = net annual ÷ 12.
 * Occupancy replaces vacancy for STR (do not double-count — vacancyPercent = 0 in metrics).
 *
 * LTR: contract monthly rent with vacancy % on top (same as rental calculator).
 *
 * Shared mortgage and loan balance: loan amount = purchase × (1 − down payment %); same payment both sides.
 */

import { computePropertyMetrics, getAnnualDebtService } from "@/lib/metrics/property-metrics";
import type { PropertyMetrics } from "@/lib/metrics/property-metrics";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type StrLtrCalculatorInput = {
  nightlyRate: number;
  annualOccupancyPercent: number;
  platformFeePercent: number;
  monthlyStrExpenses: number;
  monthlyLtrRent: number;
  monthlyLtrVacancyPercent: number;
  monthlyLtrExpenses: number;
  monthlySharedExpenses: number;
  monthlyMortgagePayment: number;
  /** Property value for cap rate / LTV; use 0 to skip cap rate. */
  purchasePrice: number;
  /** Shared; drives loan balance = purchase × (1 − down %). */
  downPaymentPercent: number;
  ownershipPercent: number;
};

export type StrLtrSideResult = {
  effectiveMonthlyIncome: number;
  /** STR: gross booking revenue before platform fees. LTR: effective annual rent after vacancy. */
  annualGrossIncome: number;
  noi: number;
  monthlyCashFlow: number;
  capRate: number | null;
  dscr: number | null;
  metrics: PropertyMetrics;
};

export type StrLtrCalculatorResult = {
  str: StrLtrSideResult;
  ltr: StrLtrSideResult;
  delta: { noi: number; monthlyCashFlow: number };
};

function sanitize(input: StrLtrCalculatorInput): StrLtrCalculatorInput {
  const down = clamp(input.downPaymentPercent, 0, 100);
  const occ = clamp(input.annualOccupancyPercent, 0, 100);
  const own = input.ownershipPercent;
  if (!Number.isFinite(own) || own <= 0) {
    return {
      ...input,
      nightlyRate: Math.max(0, input.nightlyRate),
      annualOccupancyPercent: occ,
      platformFeePercent: clamp(input.platformFeePercent, 0, 100),
      monthlyStrExpenses: Math.max(0, input.monthlyStrExpenses),
      monthlyLtrRent: Math.max(0, input.monthlyLtrRent),
      monthlyLtrVacancyPercent: clamp(input.monthlyLtrVacancyPercent, 0, 100),
      monthlyLtrExpenses: Math.max(0, input.monthlyLtrExpenses),
      monthlySharedExpenses: Math.max(0, input.monthlySharedExpenses),
      monthlyMortgagePayment: Math.max(0, input.monthlyMortgagePayment),
      purchasePrice: Math.max(0, input.purchasePrice),
      downPaymentPercent: down,
      ownershipPercent: 100,
    };
  }
  return {
    nightlyRate: Math.max(0, input.nightlyRate),
    annualOccupancyPercent: occ,
    platformFeePercent: clamp(input.platformFeePercent, 0, 100),
    monthlyStrExpenses: Math.max(0, input.monthlyStrExpenses),
    monthlyLtrRent: Math.max(0, input.monthlyLtrRent),
    monthlyLtrVacancyPercent: clamp(input.monthlyLtrVacancyPercent, 0, 100),
    monthlyLtrExpenses: Math.max(0, input.monthlyLtrExpenses),
    monthlySharedExpenses: Math.max(0, input.monthlySharedExpenses),
    monthlyMortgagePayment: Math.max(0, input.monthlyMortgagePayment),
    purchasePrice: Math.max(0, input.purchasePrice),
    downPaymentPercent: down,
    ownershipPercent: clamp(own, 1, 100),
  };
}

export function computeStrLtrResult(raw: StrLtrCalculatorInput): StrLtrCalculatorResult {
  const input = sanitize(raw);
  const purchasePrice = input.purchasePrice;
  const loanAmount = purchasePrice > 0 ? purchasePrice * (1 - input.downPaymentPercent / 100) : 0;
  const downPaymentAmount = purchasePrice > 0 ? purchasePrice * (input.downPaymentPercent / 100) : 0;

  const bookedNights = 365 * (input.annualOccupancyPercent / 100);
  const annualGrossStrBookings = bookedNights * input.nightlyRate;
  const strNetAnnual = annualGrossStrBookings * (1 - input.platformFeePercent / 100);
  const effectiveMonthlyStr = strNetAnnual / 12;

  const strMetrics = computePropertyMetrics({
    monthlyRent: effectiveMonthlyStr,
    monthlyExpenses: input.monthlyStrExpenses + input.monthlySharedExpenses,
    estimatedValue: purchasePrice,
    cashInvested: downPaymentAmount > 0 ? downPaymentAmount : null,
    totalMortgageBalance: loanAmount,
    totalMonthlyPayment: input.monthlyMortgagePayment,
    ownershipPercent: input.ownershipPercent,
    vacancyPercent: 0,
  });

  const annualDebtService = getAnnualDebtService(
    input.monthlyMortgagePayment,
    input.ownershipPercent
  );
  const strDscr = annualDebtService > 0 ? strMetrics.noi / annualDebtService : null;

  const ltrMetrics = computePropertyMetrics({
    monthlyRent: input.monthlyLtrRent,
    monthlyExpenses: input.monthlyLtrExpenses + input.monthlySharedExpenses,
    estimatedValue: purchasePrice,
    cashInvested: downPaymentAmount > 0 ? downPaymentAmount : null,
    totalMortgageBalance: loanAmount,
    totalMonthlyPayment: input.monthlyMortgagePayment,
    ownershipPercent: input.ownershipPercent,
    vacancyPercent: input.monthlyLtrVacancyPercent,
  });
  const ltrDscr = annualDebtService > 0 ? ltrMetrics.noi / annualDebtService : null;

  const ltrEffectiveMonthly =
    input.monthlyLtrRent * (1 - input.monthlyLtrVacancyPercent / 100);

  const strSide: StrLtrSideResult = {
    effectiveMonthlyIncome: effectiveMonthlyStr,
    annualGrossIncome: annualGrossStrBookings,
    noi: strMetrics.noi,
    monthlyCashFlow: strMetrics.monthlyCashFlow,
    capRate: strMetrics.capRate,
    dscr: strDscr,
    metrics: strMetrics,
  };

  const ltrSide: StrLtrSideResult = {
    effectiveMonthlyIncome: ltrEffectiveMonthly,
    annualGrossIncome: ltrMetrics.grossAnnualRent,
    noi: ltrMetrics.noi,
    monthlyCashFlow: ltrMetrics.monthlyCashFlow,
    capRate: ltrMetrics.capRate,
    dscr: ltrDscr,
    metrics: ltrMetrics,
  };

  return {
    str: strSide,
    ltr: ltrSide,
    delta: {
      noi: strMetrics.noi - ltrMetrics.noi,
      monthlyCashFlow: strMetrics.monthlyCashFlow - ltrMetrics.monthlyCashFlow,
    },
  };
}
