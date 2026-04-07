"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobileFormGroup } from "@/components/mobile-form-group";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { useIsMobile } from "@/lib/use-is-mobile";
import { getPiForAmortization } from "@/lib/amortization";
import {
  computeAnnualCashFlowFromAnnualInputs,
  scaleLiabilityAmount,
  type AnalyticsDebtServiceSource,
  type OwnershipDisplayMode,
} from "@/lib/metrics/property-metrics";
import { formatCurrency } from "@/lib/format-currency";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MortgageForTabs } from "./property-detail-tabs";

type ProjectionsTabContentProps = {
  propertyId?: string;
  workspaceVariant?: "default" | "modeling";
  mobileHeader?: ReactNode;
  contextBar?: ReactNode;
  monthlyRent: number;
  monthlyExpenses: number;
  estimatedValue: number;
  cashInvested: number | null;
  totalMortgageBalance: number;
  totalMonthlyPayment: number;
  ownershipPercent: number;
  vacancyPercent: number;
  displayMode: OwnershipDisplayMode | null;
  mortgageData: MortgageForTabs[];
};

type ProjectionRow = {
  year: number;
  label: string;
  cashFlowWindowLabel: string;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  annualCashFlow: number;
  cumulativeCashFlow: number;
  reinvestmentBalance: number;
};

type SimMortgage = {
  balance: number;
  monthlyRate: number;
  basePayment: number;
  remainingTermMonths: number;
};

type LoanSeries = {
  balanceByMonth: number[];
  debtServiceByMonth: number[];
};

type PresetId = "conservative" | "base" | "upside" | "custom";

const PRESETS: Record<
  Exclude<PresetId, "custom">,
  { label: string; rentGrowth: number; expenseGrowth: number; valueGrowth: number; vacancy: number }
> = {
  conservative: {
    label: "Conservative",
    rentGrowth: 1,
    expenseGrowth: 3,
    valueGrowth: 1.5,
    vacancy: 8,
  },
  base: {
    label: "Base",
    rentGrowth: 2,
    expenseGrowth: 2,
    valueGrowth: 3,
    vacancy: 5,
  },
  upside: {
    label: "Upside",
    rentGrowth: 3.5,
    expenseGrowth: 1.5,
    valueGrowth: 4.5,
    vacancy: 4,
  },
};

function getPctChange(current: number, baseline: number): number | null {
  if (baseline === 0) return null;
  return ((current - baseline) / Math.abs(baseline)) * 100;
}

function getCashFlowPositiveYear(rows: ProjectionRow[]): number | null {
  const row = rows.find((r) => r.annualCashFlow > 0);
  return row ? row.year : null;
}

function getRemainingTermMonths(startDateIso: string, termYears: number): number {
  const startDate = new Date(startDateIso);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const now = new Date();
  const nowNorm = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthsSinceStart = Math.max(
    0,
    (nowNorm.getFullYear() - startNorm.getFullYear()) * 12 +
      (nowNorm.getMonth() - startNorm.getMonth())
  );
  return Math.max(0, termYears * 12 - monthsSinceStart);
}

function buildSimMortgages(mortgageData: MortgageForTabs[]): SimMortgage[] {
  return mortgageData
    .map((m) => {
      const balance = m.effectiveBalance ?? Number(m.currentBalance);
      const basePayment = getPiForAmortization({
        originalLoanAmount: Number(m.originalLoanAmount),
        currentBalance: balance,
        interestRate: Number(m.interestRate),
        termYears: m.termYears,
        startDate: m.startDate,
        monthlyPayment: Number(m.monthlyPayment),
        balanceAsOfDate: new Date().toISOString(),
        escrowIncluded: Boolean(m.escrowIncluded),
        escrowAmount: m.escrowAmount != null ? Number(m.escrowAmount) : null,
      });
      return {
        balance,
        monthlyRate: Number(m.interestRate) / 12,
        basePayment,
        remainingTermMonths: getRemainingTermMonths(m.startDate, m.termYears),
      };
    })
    .filter((m) => m.balance > 0 && m.basePayment > 0 && m.remainingTermMonths > 0);
}

function projectLoanSeriesByMonth(
  mortgageData: MortgageForTabs[],
  extraMonthlyPayment: number,
  horizonMonths: number
): LoanSeries {
  const mortgages = buildSimMortgages(mortgageData);
  if (mortgages.length === 0) {
    return { balanceByMonth: [0], debtServiceByMonth: [0] };
  }

  const totalStartingBalance = mortgages.reduce((sum, m) => sum + m.balance, 0);
  const extraByMortgage = mortgages.map((m) =>
    totalStartingBalance > 0 ? (extraMonthlyPayment * m.balance) / totalStartingBalance : 0
  );
  const maxTermMonths = Math.max(...mortgages.map((m) => m.remainingTermMonths));
  const maxMonths = Math.max(0, Math.max(maxTermMonths, horizonMonths));
  const balanceByMonth: number[] = [];
  const debtServiceByMonth: number[] = [];

  for (let month = 0; month <= maxMonths; month++) {
    let aggregateBalance = 0;
    let monthDebtService = 0;
    for (let i = 0; i < mortgages.length; i++) {
      const m = mortgages[i];
      if (month === 0) {
        aggregateBalance += m.balance;
        continue;
      }
      if (m.balance <= 0) continue;

      const payment = Math.max(0, m.basePayment + extraByMortgage[i]);
      const interest = m.balance * m.monthlyRate;
      const rawPrincipal = payment - interest;
      let principal = rawPrincipal;
      let actualPayment = payment;

      if (rawPrincipal >= m.balance) {
        principal = m.balance;
        actualPayment = principal + interest;
      } else if (rawPrincipal <= 0) {
        // Allow negative amortization behavior if payment does not cover interest.
        principal = rawPrincipal;
        actualPayment = payment;
      }

      m.balance = Math.max(0, m.balance - principal);
      aggregateBalance += m.balance;
      monthDebtService += Math.max(0, actualPayment);
    }
    balanceByMonth.push(Math.max(0, aggregateBalance));
    debtServiceByMonth.push(Math.max(0, monthDebtService));
  }

  return { balanceByMonth, debtServiceByMonth };
}

function getAnnualDebtServiceFullForYear({
  source,
  year,
  debtServiceByMonth,
  balanceByMonth,
  allInMonthlyPayment,
}: {
  source: AnalyticsDebtServiceSource;
  year: number;
  debtServiceByMonth: number[];
  balanceByMonth: number[];
  allInMonthlyPayment: number;
}): number {
  if (source === "amortized_pi") {
    return Array.from({ length: 12 }, (_, idx) => {
      const monthIdx = year * 12 + idx + 1;
      return debtServiceByMonth[monthIdx] ?? 0;
    }).reduce((sum, v) => sum + v, 0);
  }

  let activeMonths = 0;
  for (let idx = 0; idx < 12; idx++) {
    const monthIdx = year * 12 + idx + 1;
    const priorBalance = balanceByMonth[Math.max(0, monthIdx - 1)] ?? 0;
    if (priorBalance > 0) activeMonths += 1;
  }

  return allInMonthlyPayment > 0 ? activeMonths * allInMonthlyPayment : 0;
}

export function ProjectionsTabContent({
  propertyId,
  workspaceVariant = "default",
  mobileHeader,
  contextBar,
  monthlyRent,
  monthlyExpenses,
  estimatedValue,
  cashInvested,
  totalMortgageBalance,
  totalMonthlyPayment,
  ownershipPercent,
  vacancyPercent,
  displayMode,
  mortgageData,
}: ProjectionsTabContentProps) {
  const isMobile = useIsMobile();
  const [activePreset, setActivePreset] = useState<PresetId>("base");
  const [holdYears, setHoldYears] = useState(10);
  const [rentGrowth, setRentGrowth] = useState(2);
  const [expenseGrowth, setExpenseGrowth] = useState(2);
  const [valueGrowth, setValueGrowth] = useState(3);
  const [projectionVacancy, setProjectionVacancy] = useState(vacancyPercent);
  const [extraMonthlyPrincipal, setExtraMonthlyPrincipal] = useState(0);
  const [includeSaleAnalysis, setIncludeSaleAnalysis] = useState(true);
  const [sellingCostPct, setSellingCostPct] = useState(6);
  const [reinvestCashFlow, setReinvestCashFlow] = useState(false);
  const [reinvestPct, setReinvestPct] = useState(50);
  const isModelingWorkspace = workspaceVariant === "modeling";
  const effectiveContextBar = contextBar ?? mobileHeader;
  const projectionHorizonMonths = holdYears * 12;

  const projectedLoanSeries = useMemo(
    () => projectLoanSeriesByMonth(mortgageData, extraMonthlyPrincipal, projectionHorizonMonths),
    [mortgageData, extraMonthlyPrincipal, projectionHorizonMonths]
  );

  const scale = ownershipPercent / 100;
  const cashFlowDebtServiceSource: AnalyticsDebtServiceSource = "all_in_payment";

  const projectionRows = useMemo<ProjectionRow[]>(() => {
    const rows: ProjectionRow[] = [];
    let runningCashFlow = 0;
    let reinvestmentBalance = 0;

    for (let year = 0; year <= holdYears; year++) {
      const rentForYear = monthlyRent * Math.pow(1 + rentGrowth / 100, year);
      const expenseForYear = monthlyExpenses * Math.pow(1 + expenseGrowth / 100, year);
      const effectiveRentMonthly = rentForYear * (1 - projectionVacancy / 100);
      const annualDebtServiceFull = getAnnualDebtServiceFullForYear({
        source: cashFlowDebtServiceSource,
        year,
        debtServiceByMonth: projectedLoanSeries.debtServiceByMonth,
        balanceByMonth: projectedLoanSeries.balanceByMonth,
        allInMonthlyPayment: totalMonthlyPayment,
      });

      const annualRentFull = effectiveRentMonthly * 12;
      const annualExpensesFull = expenseForYear * 12;
      const annualCashFlowRaw = computeAnnualCashFlowFromAnnualInputs({
        annualRentFull,
        annualExpensesFull,
        annualDebtServiceFull,
        ownershipPercent,
        displayMode,
      });

      const reinvestedContribution =
        reinvestCashFlow && annualCashFlowRaw > 0 ? annualCashFlowRaw * (reinvestPct / 100) : 0;
      const annualCashFlow = annualCashFlowRaw - reinvestedContribution;
      if (year > 0) {
        // Reinvested balance compounds at value growth for a simple, transparent assumption.
        reinvestmentBalance =
          reinvestmentBalance * (1 + valueGrowth / 100) + reinvestedContribution;
        runningCashFlow += annualCashFlow;
      }

      const monthIndex = year * 12;
      const loanBalanceFull =
        projectedLoanSeries.balanceByMonth[monthIndex] ??
        projectedLoanSeries.balanceByMonth[projectedLoanSeries.balanceByMonth.length - 1] ??
        totalMortgageBalance;

      const propertyValueFull = estimatedValue * Math.pow(1 + valueGrowth / 100, year);
      const propertyValue = propertyValueFull * scale;
      const loanBalance = scaleLiabilityAmount(
        loanBalanceFull,
        ownershipPercent,
        displayMode
      );
      const equity = Math.max(0, (propertyValueFull - loanBalanceFull) * scale);

      rows.push({
        year,
        label: year === 0 ? "Year 0 (Today snapshot)" : `Year ${year}`,
        cashFlowWindowLabel:
          year === 0
            ? "Forward 12-month cash flow: Today to Year 1"
            : `Forward 12-month cash flow: Year ${year} to Year ${year + 1}`,
        propertyValue,
        loanBalance,
        equity,
        annualCashFlow,
        cumulativeCashFlow: runningCashFlow,
        reinvestmentBalance,
      });
    }

    return rows;
  }, [
    estimatedValue,
    expenseGrowth,
    holdYears,
    monthlyExpenses,
    monthlyRent,
    projectedLoanSeries,
    projectionVacancy,
    scale,
    displayMode,
    ownershipPercent,
    reinvestCashFlow,
    reinvestPct,
    rentGrowth,
    totalMonthlyPayment,
    totalMortgageBalance,
    valueGrowth,
    cashFlowDebtServiceSource,
  ]);

  const baselineLoanSeries = useMemo(
    () => projectLoanSeriesByMonth(mortgageData, 0, projectionHorizonMonths),
    [mortgageData, projectionHorizonMonths]
  );

  const baselineRows = useMemo<ProjectionRow[]>(() => {
    const rows: ProjectionRow[] = [];
    let runningCashFlow = 0;
    for (let year = 0; year <= holdYears; year++) {
      const rentForYear = monthlyRent * Math.pow(1 + PRESETS.base.rentGrowth / 100, year);
      const expenseForYear =
        monthlyExpenses * Math.pow(1 + PRESETS.base.expenseGrowth / 100, year);
      const effectiveRentMonthly = rentForYear * (1 - PRESETS.base.vacancy / 100);
      const annualDebtServiceFull = getAnnualDebtServiceFullForYear({
        source: cashFlowDebtServiceSource,
        year,
        debtServiceByMonth: baselineLoanSeries.debtServiceByMonth,
        balanceByMonth: baselineLoanSeries.balanceByMonth,
        allInMonthlyPayment: totalMonthlyPayment,
      });

      const annualRentFull = effectiveRentMonthly * 12;
      const annualExpensesFull = expenseForYear * 12;
      const annualCashFlow = computeAnnualCashFlowFromAnnualInputs({
        annualRentFull,
        annualExpensesFull,
        annualDebtServiceFull,
        ownershipPercent,
        displayMode,
      });
      if (year > 0) runningCashFlow += annualCashFlow;

      const monthIndex = year * 12;
      const loanBalanceFull =
        baselineLoanSeries.balanceByMonth[monthIndex] ??
        baselineLoanSeries.balanceByMonth[baselineLoanSeries.balanceByMonth.length - 1] ??
        totalMortgageBalance;

      const propertyValue = estimatedValue * Math.pow(1 + PRESETS.base.valueGrowth / 100, year) * scale;
      const loanBalance = scaleLiabilityAmount(
        loanBalanceFull,
        ownershipPercent,
        displayMode
      );
      const equity = Math.max(0, propertyValue - loanBalanceFull * scale);

      rows.push({
        year,
        label: year === 0 ? "Year 0 (Today snapshot)" : `Year ${year}`,
        cashFlowWindowLabel:
          year === 0
            ? "Forward 12-month cash flow: Today to Year 1"
            : `Forward 12-month cash flow: Year ${year} to Year ${year + 1}`,
        propertyValue,
        loanBalance,
        equity,
        annualCashFlow,
        cumulativeCashFlow: runningCashFlow,
        reinvestmentBalance: 0,
      });
    }
    return rows;
  }, [
    baselineLoanSeries,
    estimatedValue,
    holdYears,
    monthlyExpenses,
    monthlyRent,
    totalMonthlyPayment,
    totalMortgageBalance,
    scale,
    displayMode,
    ownershipPercent,
    cashFlowDebtServiceSource,
  ]);

  const finalRow = projectionRows[projectionRows.length - 1];
  const baselineFinalRow = baselineRows[baselineRows.length - 1];
  const finalMonthIndex = holdYears * 12;
  const finalLoanBalanceFull =
    projectedLoanSeries.balanceByMonth[finalMonthIndex] ??
    projectedLoanSeries.balanceByMonth[projectedLoanSeries.balanceByMonth.length - 1] ??
    totalMortgageBalance;
  const projectedDebtExposure = scaleLiabilityAmount(
    finalLoanBalanceFull,
    ownershipPercent,
    displayMode
  );
  const grossSaleValue = finalRow?.propertyValue ?? 0;
  const sellingCosts = includeSaleAnalysis ? grossSaleValue * (sellingCostPct / 100) : 0;
  const netSaleProceeds = grossSaleValue - sellingCosts - (finalRow?.loanBalance ?? 0);
  const netPosition =
    (finalRow?.equity ?? 0) +
    (finalRow?.cumulativeCashFlow ?? 0) +
    (finalRow?.reinvestmentBalance ?? 0);
  const saleAdjustedNetPosition =
    netSaleProceeds + (finalRow?.cumulativeCashFlow ?? 0) + (finalRow?.reinvestmentBalance ?? 0);
  const baselineNetPositionRaw =
    (baselineFinalRow?.equity ?? 0) + (baselineFinalRow?.cumulativeCashFlow ?? 0);
  const baselineGrossSaleValue = baselineFinalRow?.propertyValue ?? 0;
  const baselineSellingCosts = includeSaleAnalysis ? baselineGrossSaleValue * (sellingCostPct / 100) : 0;
  const baselineNetSaleProceeds =
    baselineGrossSaleValue - baselineSellingCosts - (baselineFinalRow?.loanBalance ?? 0);
  const baselineNetPosition = includeSaleAnalysis
    ? baselineNetSaleProceeds + (baselineFinalRow?.cumulativeCashFlow ?? 0)
    : baselineNetPositionRaw;
  const equityDeltaPct = getPctChange(finalRow?.equity ?? 0, baselineFinalRow?.equity ?? 0);
  const annualCashFlowDeltaPct = getPctChange(
    finalRow?.annualCashFlow ?? 0,
    baselineFinalRow?.annualCashFlow ?? 0
  );
  const netPositionDeltaPct = getPctChange(
    includeSaleAnalysis ? saleAdjustedNetPosition : netPosition,
    baselineNetPosition
  );
  const cashFlowPositiveYear = getCashFlowPositiveYear(projectionRows);
  const payoffMonthWithinHorizon = projectedLoanSeries.balanceByMonth.findIndex(
    (balance, month) => month > 0 && month <= projectionHorizonMonths && balance <= 0
  );
  const payoffYearWithinHorizon =
    payoffMonthWithinHorizon > 0 ? Math.ceil(payoffMonthWithinHorizon / 12) : null;

  function applyPreset(id: Exclude<PresetId, "custom">) {
    const p = PRESETS[id];
    setActivePreset(id);
    setRentGrowth(p.rentGrowth);
    setExpenseGrowth(p.expenseGrowth);
    setValueGrowth(p.valueGrowth);
    setProjectionVacancy(p.vacancy);
  }

  function handleReset() {
    setActivePreset("base");
    setHoldYears(10);
    setRentGrowth(PRESETS.base.rentGrowth);
    setExpenseGrowth(PRESETS.base.expenseGrowth);
    setValueGrowth(PRESETS.base.valueGrowth);
    setProjectionVacancy(PRESETS.base.vacancy);
    setExtraMonthlyPrincipal(0);
    setIncludeSaleAnalysis(true);
    setSellingCostPct(6);
    setReinvestCashFlow(false);
    setReinvestPct(50);
  }

  const summaryCards = (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">Projected equity — Year {holdYears}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {finalRow ? formatCurrency(finalRow.equity) : "—"}
          </p>
          {equityDeltaPct != null && (
            <p className={`mt-1 text-xs ${equityDeltaPct >= 0 ? "text-positive" : "text-negative"}`}>
              {equityDeltaPct >= 0 ? "+" : ""}
              {equityDeltaPct.toFixed(1)}% vs base
            </p>
          )}
        </div>

        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">Projected debt — Year {holdYears}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(projectedDebtExposure)}
          </p>
          {displayMode === "full_liability" && (
            <p className="mt-1 text-xs text-muted">Full-liability lens applied</p>
          )}
        </div>

        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">Annual cash flow — Year {holdYears}</p>
          <p
            className={`mt-1 text-lg font-semibold ${
              (finalRow?.annualCashFlow ?? 0) >= 0 ? "text-positive" : "text-negative"
            }`}
          >
            {finalRow ? formatCurrency(finalRow.annualCashFlow) : "—"}
          </p>
          {annualCashFlowDeltaPct != null && (
            <p
              className={`mt-1 text-xs ${
                annualCashFlowDeltaPct >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {annualCashFlowDeltaPct >= 0 ? "+" : ""}
              {annualCashFlowDeltaPct.toFixed(1)}% vs base
            </p>
          )}
        </div>

        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">
            Total return — Year {holdYears}
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(includeSaleAnalysis ? saleAdjustedNetPosition : netPosition)}
          </p>
          {netPositionDeltaPct != null && (
            <p className={`mt-1 text-xs ${netPositionDeltaPct >= 0 ? "text-positive" : "text-negative"}`}>
              {netPositionDeltaPct >= 0 ? "+" : ""}
              {netPositionDeltaPct.toFixed(1)}% vs base
            </p>
          )}
          <p className="mt-1 text-xs text-muted">
            {includeSaleAnalysis ? "Net sale proceeds" : "Equity"} + cumulative cash flow
            {reinvestCashFlow ? " + reinvested" : ""}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted">
        Cash-flow positive year:{" "}
        {reinvestCashFlow && cashFlowPositiveYear == null ? (
          <span className="inline-flex items-center rounded-md border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-xs font-medium text-warning">
            not reached through Year {holdYears} — reinvestment inactive
          </span>
        ) : cashFlowPositiveYear == null ? (
          <span>not reached through Year {holdYears}</span>
        ) : (
          <span className="font-medium text-foreground">
            {cashFlowPositiveYear === 0 ? "Year 0 (next 12 months)" : `Year ${cashFlowPositiveYear}`}
          </span>
        )}
      </p>
    </div>
  );

  const advancedBreakdownContent = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-subtle/30 p-3">
          <p className="text-xs text-muted">Reinvested balance (end of Year {holdYears})</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {formatCurrency(reinvestCashFlow ? (finalRow?.reinvestmentBalance ?? 0) : 0)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-subtle/30 p-3">
          <p className="text-xs text-muted">Distributable cumulative cash flow</p>
          <p
            className={`mt-1 text-sm font-medium ${
              (finalRow?.cumulativeCashFlow ?? 0) >= 0 ? "text-positive" : "text-negative"
            }`}
          >
            {formatCurrency(finalRow?.cumulativeCashFlow ?? 0)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-subtle/30 p-3">
          <p className="text-xs text-muted">Reinvest compound growth</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {reinvestCashFlow
              ? `Compounds at value growth (${valueGrowth.toFixed(1)}%/yr)`
              : "Compounding off"}
          </p>
          {reinvestCashFlow && (
            <p className="mt-1 text-xs text-muted">Applies to positive cash flow years only.</p>
          )}
        </div>
      </div>

      {includeSaleAnalysis && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-subtle/30 p-3">
            <p className="text-xs text-muted">Projected sale price (year {holdYears})</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatCurrency(grossSaleValue)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-subtle/30 p-3">
            <p className="text-xs text-muted">Estimated selling costs</p>
            <p className="mt-1 text-sm font-medium text-negative">
              {formatCurrency(sellingCosts)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-subtle/30 p-3">
            <p className="text-xs text-muted">Net proceeds after debt + costs</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatCurrency(netSaleProceeds)}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const mobileAdvancedBreakdown = (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
        <p className="text-[11px] text-muted">Reinvested bal.</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          {formatCurrency(reinvestCashFlow ? (finalRow?.reinvestmentBalance ?? 0) : 0)}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
        <p className="text-[11px] text-muted">Cumul. cash flow</p>
        <p className={`mt-0.5 text-sm font-semibold ${(finalRow?.cumulativeCashFlow ?? 0) >= 0 ? "text-positive" : "text-negative"}`}>
          {formatCurrency(finalRow?.cumulativeCashFlow ?? 0)}
        </p>
      </div>
      <div className="col-span-2 rounded-xl border border-border bg-subtle/40 px-3 py-2">
        <p className="text-[11px] text-muted">Reinvest growth</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">
          {reinvestCashFlow ? `${valueGrowth.toFixed(1)}%/yr compound` : "Off"}
        </p>
      </div>
      {includeSaleAnalysis && (
        <>
          <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
            <p className="text-[11px] text-muted">Sale price Y{holdYears}</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {formatCurrency(grossSaleValue)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
            <p className="text-[11px] text-muted">Selling costs</p>
            <p className="mt-0.5 text-sm font-semibold text-negative">
              {formatCurrency(sellingCosts)}
            </p>
          </div>
          <div className="col-span-2 rounded-xl border border-border bg-subtle/40 px-3 py-2">
            <p className="text-[11px] text-muted">Net proceeds</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {formatCurrency(netSaleProceeds)}
            </p>
          </div>
        </>
      )}
    </div>
  );

  const controlsContent = (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Simulation controls
          </h3>
          <p className="mt-1 text-xs text-muted">
            Year 0 is today (current value/debt snapshot). Annual cash flow is modeled for the next
            12 months at each point. Debt service follows projected payoff timing.
          </p>
        </div>
        {propertyId && (
          <Link
            href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Open in Modeling workspace
          </Link>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">Preset:</span>
        {Object.entries(PRESETS).map(([id, preset]) => (
          <button
            key={id}
            type="button"
            onClick={() => applyPreset(id as Exclude<PresetId, "custom">)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
              activePreset === id
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-background text-muted hover:text-foreground"
            }`}
          >
            {preset.label}
          </button>
        ))}
        {activePreset === "custom" && (
          <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted">
            Custom
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted">
              Horizon and risk
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-muted hover:text-foreground"
            >
              Reset
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-muted">
              Hold period (years)
              <input
                type="number"
                min={1}
                max={30}
                value={holdYears}
                onChange={(e) => {
                  setActivePreset("custom");
                  setHoldYears(Math.min(30, Math.max(1, Number(e.target.value) || 1)));
                }}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Vacancy ({projectionVacancy.toFixed(1)}%)
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={projectionVacancy}
                onChange={(e) => {
                  setActivePreset("custom");
                  setProjectionVacancy(Number(e.target.value));
                }}
                className="mt-2.5 block w-full accent-accent"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            Growth assumptions
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-xs font-medium text-muted">
              Rent growth (%/yr)
              <input
                type="number"
                min={-5}
                max={15}
                step={0.5}
                value={rentGrowth}
                onChange={(e) => {
                  setActivePreset("custom");
                  setRentGrowth(Number(e.target.value) || 0);
                }}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Expense growth (%/yr)
              <input
                type="number"
                min={-5}
                max={15}
                step={0.5}
                value={expenseGrowth}
                onChange={(e) => {
                  setActivePreset("custom");
                  setExpenseGrowth(Number(e.target.value) || 0);
                }}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Value growth (%/yr)
              <input
                type="number"
                min={-5}
                max={15}
                step={0.5}
                value={valueGrowth}
                onChange={(e) => {
                  setActivePreset("custom");
                  setValueGrowth(Number(e.target.value) || 0);
                }}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            Debt strategy
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-muted">
              Extra principal ($ / month)
              <input
                type="number"
                min={0}
                max={5000}
                step={25}
                value={extraMonthlyPrincipal}
                onChange={(e) => {
                  setActivePreset("custom");
                  setExtraMonthlyPrincipal(Math.max(0, Number(e.target.value) || 0));
                }}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
              />
            </label>
            <div className="min-h-[72px]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-muted">
                  <input
                    type="checkbox"
                    checked={reinvestCashFlow}
                    onChange={(e) => setReinvestCashFlow(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Reinvest cash flow
                </label>
                <label
                  className={`inline-flex items-center gap-2 text-xs font-medium text-muted transition-opacity ${
                    reinvestCashFlow ? "opacity-100" : "invisible opacity-0"
                  }`}
                >
                  Reinvest (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={reinvestPct}
                    disabled={!reinvestCashFlow}
                    onChange={(e) =>
                      setReinvestPct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                    }
                    className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>
            </div>
          </div>
          <p className={`mt-2 text-xs text-muted ${reinvestCashFlow ? "opacity-100" : "opacity-0"}`}>
            Applies only to positive annual cash flow in each forward 12-month window. Reinvestment
            contributions continue through the hold year, including after payoff if it occurs.
          </p>
          {reinvestCashFlow && (
            <p className="mt-1 text-xs text-muted">
              {payoffYearWithinHorizon != null
                ? `Projected payoff occurs around Year ${payoffYearWithinHorizon}; post-payoff cash flow may increase because debt service drops.`
                : `No full payoff projected by Year ${holdYears}; debt service remains in effect through this horizon.`}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            Exit assumptions
          </p>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-muted">
              <input
                type="checkbox"
                checked={includeSaleAnalysis}
                onChange={(e) => setIncludeSaleAnalysis(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Include sale analysis at hold year
            </label>
            {includeSaleAnalysis && (
              <label className="block text-xs font-medium text-muted">
                Selling costs (%)
                <input
                  type="number"
                  min={0}
                  max={12}
                  step={0.5}
                  value={sellingCostPct}
                  onChange={(e) => setSellingCostPct(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1.5 block w-24 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const projectionChart = (
    <>
      <h3 className="mb-1 hidden text-sm font-semibold text-muted md:block">
        Value vs. loan balance projection (equity is the gap)
      </h3>
      <p className="mb-3 hidden text-xs text-muted md:block">
        Property value grows by your value-growth input. Loan balance declines using current mortgage
        terms plus optional extra principal. Equity is value minus balance. Annual cash flow is shown
        as a forward 12-month window for each year marker.
      </p>
      <div
        className={
          isModelingWorkspace
            ? isMobile
              ? "h-[220px]"
              : "h-[300px] xl:flex-1 xl:min-h-[340px]"
            : "h-[240px] sm:h-[300px] lg:h-[340px]"
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionRows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as ProjectionRow;
                if (isMobile) {
                  return (
                    <div className="max-w-[200px] rounded border border-border bg-card px-2.5 py-1.5 text-xs shadow-sm">
                      <p className="font-semibold text-foreground">{p.label}</p>
                      <p className="text-muted">Value: {formatCurrency(p.propertyValue)}</p>
                      <p className="text-muted">Debt: {formatCurrency(p.loanBalance)}</p>
                      <p className="text-muted">Equity: {formatCurrency(p.equity)}</p>
                      <p className="text-muted">Cash flow: {formatCurrency(p.annualCashFlow)}</p>
                    </div>
                  );
                }
                return (
                  <div className="rounded border border-border bg-card px-3 py-2 text-sm shadow-sm">
                    <p className="font-medium text-foreground">{p.label}</p>
                    <p className="text-muted">Property value: {formatCurrency(p.propertyValue)}</p>
                    <p className="text-muted">Loan balance: {formatCurrency(p.loanBalance)}</p>
                    <p className="text-muted">Equity: {formatCurrency(p.equity)}</p>
                    <p className="text-muted">{p.cashFlowWindowLabel}</p>
                    <p className="text-muted">Annual cash flow: {formatCurrency(p.annualCashFlow)}</p>
                    {reinvestCashFlow && (
                      <p className="text-muted">
                        Reinvested balance: {formatCurrency(p.reinvestmentBalance)}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {!isMobile && <Legend />}
            <Line
              type="monotone"
              dataKey="propertyValue"
              name="Property value"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="loanBalance"
              name="Loan balance"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="equity"
              name="Equity"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  const baselineNotes = (
    <div className="rounded-md border border-border bg-subtle/30 p-3 text-xs text-muted">
      Baseline inputs: rent {formatCurrency(monthlyRent)}/mo, expenses {formatCurrency(monthlyExpenses)}
      /mo, debt service {formatCurrency(totalMonthlyPayment)}/mo, ownership {ownershipPercent.toFixed(1)}%, cash invested{" "}
      {cashInvested != null ? formatCurrency(cashInvested) : "—"}. Baseline for % deltas uses the
      Base preset with no extra principal and no reinvestment, using the same ownership mode. Year 0
      is today&apos;s balance/value snapshot and annual cash flow at each marker reflects the next
      12-month window using all-in monthly payment assumptions.
    </div>
  );

  const mobileSummaryItems = [
    {
      label: `Equity Y${holdYears}`,
      value: finalRow ? formatCurrency(finalRow.equity) : "—",
    },
    {
      label: `Debt Y${holdYears}`,
      value: formatCurrency(projectedDebtExposure),
    },
    {
      label: `Cash flow Y${holdYears}`,
      value: finalRow ? formatCurrency(finalRow.annualCashFlow) : "—",
      tone:
        finalRow == null
          ? "default"
          : finalRow.annualCashFlow >= 0
            ? "positive"
            : "negative",
    },
    {
      label: `Return Y${holdYears}`,
      value: formatCurrency(includeSaleAnalysis ? saleAdjustedNetPosition : netPosition),
    },
  ] as const;

  const mobileModelingSurface = (
    <div className="space-y-0">
      <MobilePageSection variant="flat">
        <div className="space-y-3">
          {projectionChart}

          <div className="flex flex-wrap gap-2 pb-2">
            {Object.entries(PRESETS).map(([id, preset]) => (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id as Exclude<PresetId, "custom">)}
                className={`min-h-[44px] rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  activePreset === id
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-background text-muted hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
            {activePreset === "custom" && (
              <span className="inline-flex min-h-[44px] items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted">
                Custom
              </span>
            )}
          </div>
        </div>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible label="Growth assumptions">
          <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted">
                Cash-flow positive year:{" "}
                {cashFlowPositiveYear != null ? `Year ${cashFlowPositiveYear}` : `Not reached by Year ${holdYears}`}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 text-xs font-medium text-muted transition-colors duration-150 hover:text-foreground"
              >
                Reset
              </button>
            </div>

            <MobileFormGroup label="Horizon and risk">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-muted">
                  Hold years
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={holdYears}
                    onChange={(e) => {
                      setActivePreset("custom");
                      setHoldYears(Math.min(30, Math.max(1, Number(e.target.value) || 1)));
                    }}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground"
                  />
                </label>
                <label className="block text-xs font-medium text-muted">
                  Vacancy %
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={projectionVacancy}
                    onChange={(e) => {
                      setActivePreset("custom");
                      setProjectionVacancy(Number(e.target.value));
                    }}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground"
                  />
                </label>
              </div>
            </MobileFormGroup>

            <MobileFormGroup label="Growth assumptions">
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-xs font-medium text-muted">
                  Rent %
                  <input
                    type="number"
                    min={-5}
                    max={15}
                    step={0.5}
                    value={rentGrowth}
                    onChange={(e) => {
                      setActivePreset("custom");
                      setRentGrowth(Number(e.target.value) || 0);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-2.5 py-2.5 text-base text-foreground"
                  />
                </label>
                <label className="block text-xs font-medium text-muted">
                  Expense %
                  <input
                    type="number"
                    min={-5}
                    max={15}
                    step={0.5}
                    value={expenseGrowth}
                    onChange={(e) => {
                      setActivePreset("custom");
                      setExpenseGrowth(Number(e.target.value) || 0);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-2.5 py-2.5 text-base text-foreground"
                  />
                </label>
                <label className="block text-xs font-medium text-muted">
                  Value %
                  <input
                    type="number"
                    min={-5}
                    max={15}
                    step={0.5}
                    value={valueGrowth}
                    onChange={(e) => {
                      setActivePreset("custom");
                      setValueGrowth(Number(e.target.value) || 0);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-2.5 py-2.5 text-base text-foreground"
                  />
                </label>
              </div>
            </MobileFormGroup>
          </div>
        </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible
          label="Debt and exit"
          defaultOpen={extraMonthlyPrincipal > 0}
        >
          <div className="space-y-4 pt-3">
            <MobileFormGroup label="Debt strategy">
              <label className="block text-xs font-medium text-muted">
                Extra principal ($ / month)
                <input
                  type="number"
                  min={0}
                  max={5000}
                  step={25}
                  value={extraMonthlyPrincipal}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setExtraMonthlyPrincipal(Math.max(0, Number(e.target.value) || 0));
                  }}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground"
                />
              </label>
              <label className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={reinvestCashFlow}
                  onChange={(e) => setReinvestCashFlow(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Reinvest positive cash flow
              </label>
              {reinvestCashFlow && (
                <label className="block text-xs font-medium text-muted">
                  Reinvest %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={reinvestPct}
                    onChange={(e) =>
                      setReinvestPct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                    }
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground"
                  />
                </label>
              )}
            </MobileFormGroup>

            <MobileFormGroup label="Exit assumptions">
              <label className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={includeSaleAnalysis}
                  onChange={(e) => setIncludeSaleAnalysis(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Include sale analysis at hold year
              </label>
              {includeSaleAnalysis && (
                <label className="block text-xs font-medium text-muted">
                  Selling costs %
                  <input
                    type="number"
                    min={0}
                    max={12}
                    step={0.5}
                    value={sellingCostPct}
                    onChange={(e) => setSellingCostPct(Math.max(0, Number(e.target.value) || 0))}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground"
                  />
                </label>
              )}
            </MobileFormGroup>

            {(reinvestCashFlow || includeSaleAnalysis) && (
              <MobileFormGroup label="Advanced breakdown">
                {mobileAdvancedBreakdown}
              </MobileFormGroup>
            )}
          </div>
        </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible label="Baseline notes">
          <div className="pt-3">{baselineNotes}</div>
        </MobileCollapsible>
      </MobilePageSection>
    </div>
  );

  if (isModelingWorkspace) {
    if (isMobile) {
      return (
        <MobileToolShell
          contextBar={effectiveContextBar}
          eyebrow="Workspace"
          title="Modeling"
          summaryItems={[...mobileSummaryItems]}
        >
          {mobileModelingSurface}
        </MobileToolShell>
      );
    }

    return (
      <div className="space-y-4">
        {summaryCards}

        <div className="xl:grid xl:grid-cols-12 xl:items-stretch xl:gap-4">
          <div className="xl:col-span-5">
            <div className="h-full rounded-xl border border-border bg-card p-4 shadow-sm">
              {controlsContent}
            </div>
          </div>

          <div className="mt-4 xl:col-span-7 xl:mt-0">
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
              {(reinvestCashFlow || includeSaleAnalysis) && (
                <div className="mb-3 rounded-md border border-border bg-subtle/30 p-3">
                  <p className="text-xs font-medium text-muted">Advanced breakdown</p>
                  <div className="mt-3">{advancedBreakdownContent}</div>
                </div>
              )}
              {projectionChart}
            </div>
          </div>
        </div>

        {baselineNotes}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">{controlsContent}</div>
      {summaryCards}
      {(reinvestCashFlow || includeSaleAnalysis) && (
        <details className="rounded-md border border-border bg-card p-3">
          <summary className="cursor-pointer text-xs font-medium text-muted">
            Advanced breakdown
          </summary>
          <div className="mt-3">{advancedBreakdownContent}</div>
        </details>
      )}
      <div className="rounded-lg border border-border bg-card p-4">{projectionChart}</div>
      {baselineNotes}
    </div>
  );
}
