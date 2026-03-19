"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getPiForAmortization } from "@/lib/amortization";
import type { OwnershipDisplayMode } from "@/lib/metrics/property-metrics";
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

export function ProjectionsTabContent({
  propertyId,
  workspaceVariant = "default",
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
  const projectionHorizonMonths = holdYears * 12;

  const projectedLoanSeries = useMemo(
    () => projectLoanSeriesByMonth(mortgageData, extraMonthlyPrincipal, projectionHorizonMonths),
    [mortgageData, extraMonthlyPrincipal, projectionHorizonMonths]
  );

  const scale = ownershipPercent / 100;
  const fullLiability = displayMode === "full_liability";

  const projectionRows = useMemo<ProjectionRow[]>(() => {
    const rows: ProjectionRow[] = [];
    let runningCashFlow = 0;
    let reinvestmentBalance = 0;

    for (let year = 0; year <= holdYears; year++) {
      const rentForYear = monthlyRent * Math.pow(1 + rentGrowth / 100, year);
      const expenseForYear = monthlyExpenses * Math.pow(1 + expenseGrowth / 100, year);
      const effectiveRentMonthly = rentForYear * (1 - projectionVacancy / 100);
      const annualDebtService = Array.from({ length: 12 }, (_, idx) => {
        const monthIdx = year * 12 + idx + 1;
        return projectedLoanSeries.debtServiceByMonth[monthIdx] ?? 0;
      }).reduce((sum, v) => sum + v, 0);

      const annualRentFull = effectiveRentMonthly * 12;
      const annualExpensesFull = expenseForYear * 12;
      const annualCashFlowRaw = fullLiability
        ? annualRentFull * scale - annualExpensesFull * scale - annualDebtService
        : (annualRentFull - annualExpensesFull - annualDebtService) * scale;

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
      const loanBalance = loanBalanceFull * scale;
      const equity = Math.max(0, propertyValue - loanBalance);

      rows.push({
        year,
        label: year === 0 ? "Today" : `Year ${year}`,
        cashFlowWindowLabel:
          year === 0 ? "Next 12 months from today" : `Year ${year} to Year ${year + 1}`,
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
    fullLiability,
    scale,
    reinvestCashFlow,
    reinvestPct,
    rentGrowth,
    totalMortgageBalance,
    valueGrowth,
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
      const annualDebtService = Array.from({ length: 12 }, (_, idx) => {
        const monthIdx = year * 12 + idx + 1;
        return baselineLoanSeries.debtServiceByMonth[monthIdx] ?? 0;
      }).reduce((sum, v) => sum + v, 0);

      const annualRentFull = effectiveRentMonthly * 12;
      const annualExpensesFull = expenseForYear * 12;
      const annualCashFlow = fullLiability
        ? annualRentFull * scale - annualExpensesFull * scale - annualDebtService
        : (annualRentFull - annualExpensesFull - annualDebtService) * scale;
      if (year > 0) runningCashFlow += annualCashFlow;

      const monthIndex = year * 12;
      const loanBalanceFull =
        baselineLoanSeries.balanceByMonth[monthIndex] ??
        baselineLoanSeries.balanceByMonth[baselineLoanSeries.balanceByMonth.length - 1] ??
        totalMortgageBalance;

      const propertyValue = estimatedValue * Math.pow(1 + PRESETS.base.valueGrowth / 100, year) * scale;
      const loanBalance = loanBalanceFull * scale;
      const equity = Math.max(0, propertyValue - loanBalance);

      rows.push({
        year,
        label: year === 0 ? "Today" : `Year ${year}`,
        cashFlowWindowLabel:
          year === 0 ? "Next 12 months from today" : `Year ${year} to Year ${year + 1}`,
        propertyValue,
        loanBalance,
        equity,
        annualCashFlow,
        cumulativeCashFlow: runningCashFlow,
        reinvestmentBalance: 0,
      });
    }
    return rows;
  }, [baselineLoanSeries, estimatedValue, holdYears, monthlyExpenses, monthlyRent, totalMortgageBalance, fullLiability, scale]);

  const finalRow = projectionRows[projectionRows.length - 1];
  const baselineFinalRow = baselineRows[baselineRows.length - 1];
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
  const holdYearCashFlow = finalRow?.annualCashFlow ?? 0;

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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted">Projected equity (year {holdYears})</p>
        <p className="mt-1 text-sm font-medium text-foreground">
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
        <p className="text-xs text-muted">Projected loan balance (year {holdYears})</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {finalRow ? formatCurrency(finalRow.loanBalance) : "—"}
        </p>
      </div>

      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted">Annual cash flow (year {holdYears})</p>
        <p
          className={`mt-1 text-sm font-medium ${
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
          {includeSaleAnalysis
            ? "Net sale proceeds + cash flow" + (reinvestCashFlow ? " + reinvested balance" : "")
            : "Equity + cash flow" + (reinvestCashFlow ? " + reinvested balance" : "")}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {formatCurrency(includeSaleAnalysis ? saleAdjustedNetPosition : netPosition)}
        </p>
        {netPositionDeltaPct != null && (
          <p className={`mt-1 text-xs ${netPositionDeltaPct >= 0 ? "text-positive" : "text-negative"}`}>
            {netPositionDeltaPct >= 0 ? "+" : ""}
            {netPositionDeltaPct.toFixed(1)}% vs base
          </p>
        )}
      </div>
    </div>
  );

  const advancedBreakdownContent = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-subtle/30 p-3">
          <p className="text-xs text-muted">Reinvested balance (year {holdYears})</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {formatCurrency(reinvestCashFlow ? (finalRow?.reinvestmentBalance ?? 0) : 0)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-subtle/30 p-3">
          <p className="text-xs text-muted">Distributable cumulative cash flow</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {formatCurrency(finalRow?.cumulativeCashFlow ?? 0)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-subtle/30 p-3">
          <p className="text-xs text-muted">Reinvest compound growth</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {reinvestCashFlow
              ? `Compounding at value growth (${valueGrowth.toFixed(1)}%/yr)`
              : "Compounding off"}
          </p>
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

  const controlsContent = (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
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
        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
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

        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
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

        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
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
            Applies only to positive annual cash flow.
          </p>
        </div>

        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
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
      <h3 className="mb-1 text-sm font-semibold text-muted">
        Value vs. loan balance projection (equity is the gap)
      </h3>
      <p className="mb-3 text-xs text-muted">
        Property value grows by your value-growth input. Loan balance declines using current mortgage
        terms plus optional extra principal. Equity is value minus balance.
      </p>
      <div className={isModelingWorkspace ? "h-[300px] xl:flex-1 xl:min-h-[340px]" : "h-[240px] sm:h-[300px] lg:h-[340px]"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionRows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as ProjectionRow;
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
            <Legend />
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
      Base preset with no extra principal and no reinvestment, using the same ownership mode.
    </div>
  );

  if (isModelingWorkspace) {
    return (
      <div className="space-y-4">
        {reinvestCashFlow && holdYearCashFlow <= 0 && (
          <p className="text-xs text-muted">
            No positive annual cash flow at year {holdYears}; reinvestment contribution is currently 0.
          </p>
        )}
        {summaryCards}

        <div className="xl:grid xl:grid-cols-12 xl:items-stretch xl:gap-4">
          <div className="xl:col-span-5">
            <div className="h-full rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              {controlsContent}
            </div>
          </div>

          <div className="mt-4 xl:col-span-7 xl:mt-0">
            <div className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-4 shadow-sm">
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

        <div className="rounded-xl border border-border/60 bg-card/90 p-3 text-xs text-muted shadow-sm">
          <p className="font-semibold uppercase tracking-wide text-muted">Modeling tips</p>
          <p className="mt-1">
            Adjust one assumption family at a time, then compare the KPI deltas before stacking
            additional changes.
          </p>
        </div>
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
