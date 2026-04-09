import { getEffectiveBalance, type MortgageRecord } from "@/lib/amortization";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { getPropertyTotalRent } from "@/lib/property-utils";

const VALUE_PERCENT_THRESHOLD = 0.03;
const VALUE_ABS_THRESHOLD = 10_000;
const RENT_PERCENT_THRESHOLD = 0.05;
const RENT_ABS_THRESHOLD = 50;

type DecimalLike = number | { toString(): string };

type SnapshotPropertyInput = {
  id: string;
  currentEstimatedValue: DecimalLike;
  currentMonthlyExpenses: DecimalLike;
  currentMonthlyRent: DecimalLike;
  unitRents?: unknown;
  cashInvested?: DecimalLike | null;
  ownershipPercent?: number | null;
  vacancyPercent?: number | null;
  marketRent?: DecimalLike | null;
};

type SnapshotAvmResult = {
  valueEstimate?: number | null;
  rentEstimate?: number | null;
  avmValueApplied: boolean;
  avmRentApplied: boolean;
};

export type SnapshotData = {
  propertyId: string;
  snapshotMonth: Date;
  estimatedValue: number;
  effectiveMortgageBalance: number;
  equity: number;
  marketRent: number | null;
  monthlyRent: number;
  monthlyCashFlow: number;
  capRate: number | null;
  ltv: number | null;
  avmValueRaw: number | null;
  avmRentRaw: number | null;
  avmValueApplied: boolean;
  avmRentApplied: boolean;
};

export type SnapshotDelta = {
  estimatedValueDelta: number;
  effectiveMortgageBalanceDelta: number;
  equityDelta: number;
  marketRentDelta: number | null;
  monthlyRentDelta: number;
  monthlyCashFlowDelta: number;
  capRateDelta: number | null;
  ltvDelta: number | null;
};

function toNumber(value: DecimalLike | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function toNullableNumber(value: DecimalLike | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : Number(value.toString());
}

function getSnapshotMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function deltaNullable(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null) return null;
  return current - previous;
}

export function shouldApplyAvmValue(currentValue: number, newValue: number): boolean {
  const absDiff = Math.abs(newValue - currentValue);
  if (absDiff >= VALUE_ABS_THRESHOLD) return true;
  if (currentValue <= 0) return false;
  return absDiff / currentValue >= VALUE_PERCENT_THRESHOLD;
}

export function shouldApplyAvmRent(currentRent: number, newRent: number): boolean {
  const absDiff = Math.abs(newRent - currentRent);
  if (absDiff >= RENT_ABS_THRESHOLD) return true;
  if (currentRent <= 0) return false;
  return absDiff / currentRent >= RENT_PERCENT_THRESHOLD;
}

export function buildSnapshotData(
  property: SnapshotPropertyInput,
  mortgages: MortgageRecord[],
  avmResult: SnapshotAvmResult,
  now: Date = new Date()
): SnapshotData {
  const totalEffectiveBalance = mortgages.reduce((sum, m) => sum + getEffectiveBalance(m), 0);
  const totalMonthlyPayment = mortgages.reduce((sum, m) => sum + Number(m.monthlyPayment), 0);
  const monthlyRent = getPropertyTotalRent(property);

  const estimatedValue = avmResult.avmValueApplied
    ? (avmResult.valueEstimate ?? toNumber(property.currentEstimatedValue))
    : toNumber(property.currentEstimatedValue);
  const marketRent = avmResult.avmRentApplied
    ? (avmResult.rentEstimate ?? toNullableNumber(property.marketRent))
    : toNullableNumber(property.marketRent);

  const metrics = computePropertyMetrics({
    monthlyRent,
    monthlyExpenses: toNumber(property.currentMonthlyExpenses),
    estimatedValue,
    cashInvested: property.cashInvested != null ? toNumber(property.cashInvested) : null,
    totalMortgageBalance: totalEffectiveBalance,
    totalMonthlyPayment,
    ownershipPercent: property.ownershipPercent ?? 100,
    vacancyPercent: property.vacancyPercent ?? 5,
  });

  return {
    propertyId: property.id,
    snapshotMonth: getSnapshotMonth(now),
    estimatedValue,
    effectiveMortgageBalance: totalEffectiveBalance,
    equity: metrics.equity,
    marketRent,
    monthlyRent,
    monthlyCashFlow: metrics.monthlyCashFlow,
    capRate: metrics.capRate,
    ltv: metrics.ltv,
    avmValueRaw: avmResult.valueEstimate ?? null,
    avmRentRaw: avmResult.rentEstimate ?? null,
    avmValueApplied: avmResult.avmValueApplied,
    avmRentApplied: avmResult.avmRentApplied,
  };
}

export function computeSnapshotDelta(
  current: SnapshotData,
  previous: SnapshotData | null
): SnapshotDelta {
  if (!previous) {
    return {
      estimatedValueDelta: 0,
      effectiveMortgageBalanceDelta: 0,
      equityDelta: 0,
      marketRentDelta: null,
      monthlyRentDelta: 0,
      monthlyCashFlowDelta: 0,
      capRateDelta: null,
      ltvDelta: null,
    };
  }

  return {
    estimatedValueDelta: current.estimatedValue - previous.estimatedValue,
    effectiveMortgageBalanceDelta:
      current.effectiveMortgageBalance - previous.effectiveMortgageBalance,
    equityDelta: current.equity - previous.equity,
    marketRentDelta: deltaNullable(current.marketRent, previous.marketRent),
    monthlyRentDelta: current.monthlyRent - previous.monthlyRent,
    monthlyCashFlowDelta: current.monthlyCashFlow - previous.monthlyCashFlow,
    capRateDelta: deltaNullable(current.capRate, previous.capRate),
    ltvDelta: deltaNullable(current.ltv, previous.ltv),
  };
}
