"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format-currency";
import {
  getExtraPaymentForYearsEarlier,
  getPiForAmortization,
  getToleranceAdjustedPayoffDate,
  getToleranceAwarePayoffProjection,
  isWithinTermEndTolerance,
} from "@/lib/amortization";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MortgageForTabs } from "./property-detail-tabs";

type MortgageRecordLike = {
  originalLoanAmount: number;
  currentBalance: number;
  interestRate: number;
  termYears: number;
  startDate: string;
  monthlyPayment: number;
  balanceAsOfDate: string;
  paymentEffectiveDate?: string | null;
  escrowIncluded: boolean;
  escrowAmount: number | null;
};

type SimulationPoint = {
  idx: number;
  dateLabel: string;
  dateLong: string;
  baselineBalance: number | null;
  scenarioBalance: number | null;
};

type SimulationResult = {
  points: { idx: number; date: Date; balance: number }[];
  payoffDate: Date | null;
  remainingAtTermEnd: number | null;
  interestPaidTotal: number;
  startingBalance: number;
  endingBalance: number;
  monthsWithPositivePrincipal: number;
  monthsWithNonPositivePrincipal: number;
};

function toMortgageRecordLike(m: MortgageForTabs): MortgageRecordLike {
  const effectiveBalance = m.effectiveBalance ?? Number(m.currentBalance);
  return {
    originalLoanAmount: Number(m.originalLoanAmount),
    currentBalance: effectiveBalance,
    interestRate: Number(m.interestRate),
    termYears: m.termYears,
    startDate: m.startDate,
    monthlyPayment: Number(m.monthlyPayment),
    // Force "stored" balance behavior by treating effectiveBalance as current baseline.
    balanceAsOfDate: new Date().toISOString(),
    paymentEffectiveDate: m.paymentEffectiveDate ?? null,
    escrowIncluded: Boolean(m.escrowIncluded),
    escrowAmount: m.escrowAmount != null ? Number(m.escrowAmount) : null,
  };
}

function getRemainingTermMonths(m: MortgageRecordLike): number {
  const startDate = new Date(m.startDate);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthsSinceStart = Math.max(
    0,
    (startOfCurrentMonth.getFullYear() - startNorm.getFullYear()) * 12 +
      (startOfCurrentMonth.getMonth() - startNorm.getMonth())
  );
  return Math.max(0, m.termYears * 12 - monthsSinceStart);
}

function simulateMortgage(
  mortgage: MortgageRecordLike,
  extraMonthlyPayment: number
): SimulationResult {
  const monthlyRate = mortgage.interestRate / 12;
  const basePi = getPiForAmortization(mortgage);
  const payment = basePi + Math.max(0, extraMonthlyPayment);
  const remainingTermMonths = getRemainingTermMonths(mortgage);
  const now = new Date();
  const firstPointDate = new Date(now.getFullYear(), now.getMonth(), 1);

  let balance = mortgage.currentBalance;
  const startingBalance = mortgage.currentBalance;
  let interestPaidTotal = 0;
  let payoffDate: Date | null = null;
  let monthsWithPositivePrincipal = 0;
  let monthsWithNonPositivePrincipal = 0;

  const points: { idx: number; date: Date; balance: number }[] = [
    { idx: 0, date: firstPointDate, balance: Math.max(0, balance) },
  ];

  for (let month = 1; month <= remainingTermMonths && balance > 0; month++) {
    const date = new Date(firstPointDate.getFullYear(), firstPointDate.getMonth() + month, 1);
    const interest = balance * monthlyRate;
    const rawPrincipal = payment - interest;
    let principal = rawPrincipal;
    if (rawPrincipal > 0) {
      monthsWithPositivePrincipal += 1;
    } else {
      monthsWithNonPositivePrincipal += 1;
    }

    if (rawPrincipal >= balance) {
      principal = balance;
    }

    // Track interest cost every month while debt remains.
    interestPaidTotal += interest;
    balance = Math.max(0, balance - principal);
    points.push({ idx: month, date, balance });
    if (balance <= 0) {
      payoffDate = date;
      break;
    }
  }

  return {
    points,
    payoffDate,
    remainingAtTermEnd: payoffDate ? null : Math.round(balance),
    interestPaidTotal: Math.round(interestPaidTotal),
    startingBalance: Math.round(startingBalance),
    endingBalance: Math.round(Math.max(0, balance)),
    monthsWithPositivePrincipal,
    monthsWithNonPositivePrincipal,
  };
}

function resolveSimulationPayoffDate(
  simulation: SimulationResult | null,
  mortgage: MortgageRecordLike | null
): Date | null {
  if (!simulation || !mortgage) return null;
  if (simulation.payoffDate) return simulation.payoffDate;
  const balanceReduction = simulation.startingBalance - simulation.endingBalance;
  if (balanceReduction <= 0 || simulation.monthsWithPositivePrincipal === 0) {
    return null;
  }
  if (!isWithinTermEndTolerance(simulation.remainingAtTermEnd, mortgage)) {
    return null;
  }
  return getToleranceAdjustedPayoffDate(mortgage);
}


function yearsBetween(start: Date, end: Date): number {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return Math.max(0, Math.floor(months / 12));
}

export function MortgageTabContent({
  propertyId,
  mortgageData,
  initialSelectedMortgageId,
  onNavigateToDetails,
  workspaceVariant = "default",
  onSelectedMortgageChange,
}: {
  propertyId: string;
  mortgageData: MortgageForTabs[];
  initialSelectedMortgageId?: string;
  onNavigateToDetails: () => void;
  workspaceVariant?: "default" | "workspace";
  onSelectedMortgageChange?: (mortgageId: string | null) => void;
}) {
  const initialMortgageId =
    initialSelectedMortgageId &&
    mortgageData.some((mortgage) => mortgage.id === initialSelectedMortgageId)
      ? initialSelectedMortgageId
      : mortgageData[0]?.id ?? "";
  const [selectedMortgageId, setSelectedMortgageId] = useState<string>(
    initialMortgageId
  );
  const [selectedYearsEarlier, setSelectedYearsEarlier] = useState<number | null>(null);
  const [extraInput, setExtraInput] = useState("0");
  const isMortgageWorkspace = workspaceVariant === "workspace";

  const selectedMortgage = useMemo(
    () =>
      mortgageData.find((m) => m.id === selectedMortgageId) ??
      mortgageData[0] ??
      null,
    [mortgageData, selectedMortgageId]
  );

  useEffect(() => {
    onSelectedMortgageChange?.(selectedMortgage?.id ?? null);
  }, [onSelectedMortgageChange, selectedMortgage?.id]);

  const normalizedMortgage = useMemo(
    () => (selectedMortgage ? toMortgageRecordLike(selectedMortgage) : null),
    [selectedMortgage]
  );

  const baseSimulation = useMemo(
    () =>
      normalizedMortgage ? simulateMortgage(normalizedMortgage, 0) : null,
    [normalizedMortgage]
  );

  const extraPayment = useMemo(() => {
    const parsed = parseFloat(extraInput.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [extraInput]);

  const scenarioSimulation = useMemo(
    () =>
      normalizedMortgage
        ? simulateMortgage(normalizedMortgage, extraPayment)
        : null,
    [normalizedMortgage, extraPayment]
  );

  const baselineProjection = useMemo(
    () => (normalizedMortgage ? getToleranceAwarePayoffProjection(normalizedMortgage) : null),
    [normalizedMortgage]
  );
  const baselinePayoffDate = baselineProjection?.payoffDate ?? null;
  const scenarioPayoffDate = useMemo(
    () => resolveSimulationPayoffDate(scenarioSimulation, normalizedMortgage),
    [scenarioSimulation, normalizedMortgage]
  );
  const baselineYearsRemaining = useMemo(() => {
    if (!baselinePayoffDate) return null;
    const now = new Date();
    return yearsBetween(now, baselinePayoffDate);
  }, [baselinePayoffDate]);
  const payoffTargetOptions = useMemo(
    () =>
      [5, 10, 15].map((years) => {
        const isAvailable = Boolean(
          normalizedMortgage && baselineYearsRemaining && years < baselineYearsRemaining
        );
        return {
          years,
          extra:
            isAvailable && normalizedMortgage
              ? getExtraPaymentForYearsEarlier(normalizedMortgage, years)
              : null,
        };
      }),
    [normalizedMortgage, baselineYearsRemaining]
  );
  const hasAnyPayoffTarget = useMemo(
    () => payoffTargetOptions.some((option) => option.extra != null),
    [payoffTargetOptions]
  );
  const payoffDeltaYears = useMemo(() => {
    if (!baselinePayoffDate || !scenarioPayoffDate) return null;
    return Math.max(0, yearsBetween(scenarioPayoffDate, baselinePayoffDate));
  }, [baselinePayoffDate, scenarioPayoffDate]);
  const interestSaved = useMemo(() => {
    if (!baseSimulation || !scenarioSimulation) return null;
    const saved = baseSimulation.interestPaidTotal - scenarioSimulation.interestPaidTotal;
    return saved > 0 ? saved : 0;
  }, [baseSimulation, scenarioSimulation]);
  const scenarioPayoffLabel = scenarioPayoffDate
    ? scenarioPayoffDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Not amortizing";
  const interestSavedLabel =
    interestSaved != null ? formatCurrency(interestSaved) : "—";
  const rateLabel =
    selectedMortgage != null
      ? `${(Number(selectedMortgage.interestRate) * 100).toFixed(2)}%`
      : "—";
  const termLabel =
    selectedMortgage != null ? `${selectedMortgage.termYears} years` : "—";
  const basePiLabel =
    normalizedMortgage != null
      ? `${formatCurrency(getPiForAmortization(normalizedMortgage))}/mo`
      : "—";
  const showEstimateHelper = baselinePayoffDate == null || scenarioPayoffDate == null;

  const chartData = useMemo<SimulationPoint[]>(() => {
    if (!baseSimulation || !scenarioSimulation) return [];
    const maxLen = Math.max(baseSimulation.points.length, scenarioSimulation.points.length);
    const data: SimulationPoint[] = [];
    for (let i = 0; i < maxLen; i++) {
      const basePoint = baseSimulation.points[i] ?? null;
      const scenarioPoint = scenarioSimulation.points[i] ?? null;
      const date = basePoint?.date ?? scenarioPoint?.date;
      if (!date) continue;
      data.push({
        idx: i,
        dateLabel: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        dateLong: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        baselineBalance: basePoint?.balance ?? null,
        scenarioBalance: scenarioPoint?.balance ?? null,
      });
    }
    return data;
  }, [baseSimulation, scenarioSimulation]);

  if (mortgageData.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Mortgage simulator
        </h2>
        <p className="mt-3 text-sm text-muted">
          Add a mortgage to unlock payoff simulation and amortization projections.
        </p>
        <Link
          href={`/properties/${propertyId}?tab=details#mortgages`}
          onClick={(e) => {
            e.preventDefault();
            onNavigateToDetails();
          }}
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Add or edit mortgage details
        </Link>
      </div>
    );
  }

  const controlsPanel = (
    <div
      className={
        isMortgageWorkspace
          ? "h-full rounded-xl border border-border/70 bg-card p-4 shadow-sm xl:min-h-[340px]"
          : "rounded-lg border border-border bg-card p-4"
      }
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Simulation controls
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <Link
            href={`/mortgage?propertyId=${encodeURIComponent(propertyId)}${
              selectedMortgage?.id
                ? `&mortgageId=${encodeURIComponent(selectedMortgage.id)}`
                : ""
            }`}
            className="font-medium text-muted hover:text-foreground hover:underline"
          >
            Open workspace
          </Link>
          <span className="text-muted">•</span>
          <Link
            href={`/properties/${propertyId}?tab=details#mortgages`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateToDetails();
            }}
            className="font-medium text-muted hover:text-foreground hover:underline"
          >
            Mortgage details
          </Link>
          <span className="text-muted">•</span>
          <button
            type="button"
            onClick={() => {
              setSelectedYearsEarlier(null);
              setExtraInput("0");
            }}
            className="font-medium text-muted transition-colors hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </div>
      <p className="mb-3 text-xs text-muted">
        Apply extra principal monthly to compare payoff speed and interest savings.
      </p>

      <div className="space-y-3">
        <div className="rounded-md bg-background/45 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Mortgage and payment
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {mortgageData.length > 1 ? (
              <label className="block text-xs font-medium text-muted sm:col-span-2">
                Mortgage
                <select
                  value={selectedMortgage?.id ?? ""}
                  onChange={(e) => {
                    setSelectedMortgageId(e.target.value);
                    setSelectedYearsEarlier(null);
                    setExtraInput("0");
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
                >
                  {mortgageData.map((m, idx) => (
                    <option key={m.id} value={m.id}>
                      Mortgage {idx + 1} -{" "}
                      {formatCurrency(m.effectiveBalance ?? Number(m.currentBalance))}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="rounded-md border border-border/70 bg-subtle/35 px-3 py-2.5 sm:col-span-2">
                <p className="text-[11px] text-muted">Selected mortgage</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {selectedMortgage
                    ? `${formatCurrency(
                        selectedMortgage.effectiveBalance ??
                          Number(selectedMortgage.currentBalance)
                      )} at ${(Number(selectedMortgage.interestRate) * 100).toFixed(2)}%`
                    : "—"}
                </p>
              </div>
            )}

            <label className="block text-xs font-medium text-muted">
              Extra principal ($/month)
              <input
                id="extra-payment"
                type="text"
                inputMode="decimal"
                value={extraInput}
                onChange={(e) => {
                  setSelectedYearsEarlier(null);
                  setExtraInput(e.target.value);
                }}
                className="mt-1 min-h-[42px] w-full rounded-md border border-border bg-background px-2.5 py-2 text-base text-foreground"
                placeholder="0"
              />
            </label>

            <div className="rounded-md border border-border/70 bg-subtle/35 px-3 py-2.5">
              <p className="text-[11px] text-muted">Base P&I</p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {normalizedMortgage
                  ? `${formatCurrency(getPiForAmortization(normalizedMortgage))}/mo`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-background/45 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Pay off earlier
          </p>
          {hasAnyPayoffTarget ? (
            <div className="flex flex-wrap gap-2">
              {payoffTargetOptions.map(({ years, extra }) => {
                const isSelected = selectedYearsEarlier === years;
                const isDisabled = !extra;
                return (
                  <button
                    key={years}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!extra) return;
                      setSelectedYearsEarlier((prev) => (prev === years ? null : years));
                      setExtraInput((prev) => {
                        const next = selectedYearsEarlier === years ? "0" : String(extra);
                        return next === prev ? prev : next;
                      });
                    }}
                    className={`rounded-md border px-3 py-1.5 text-sm transition ${
                      isSelected
                        ? "border-accent bg-accent/12 text-foreground ring-1 ring-accent/25"
                        : "border-border bg-background text-muted hover:bg-subtle/60 hover:text-foreground"
                    } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span className="font-semibold text-foreground">{years}y</span>{" "}
                    <span>{extra ? `${formatCurrency(extra)}/mo` : "N/A"}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted">
              No accelerated payoff targets available for this mortgage yet.
            </p>
          )}
        </div>

        {isMortgageWorkspace && (
          <>
            <div className="rounded-md border border-border/65 bg-subtle/30 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Scenario outcome
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-border/60 bg-background/60 px-2.5 py-2">
                  <p className="text-[11px] text-muted">Payoff with current extra</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {scenarioPayoffLabel}
                  </p>
                </div>
                <div className="rounded-md border border-border/60 bg-background/60 px-2.5 py-2">
                  <p className="text-[11px] text-muted">Interest saved (est.)</p>
                  <p className="mt-1 text-sm font-semibold text-positive">
                    {interestSavedLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border/65 bg-subtle/20 p-2.5">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md border border-border/60 bg-background/50 px-2 py-1 text-muted">
                  Rate: <span className="font-medium text-foreground">{rateLabel}</span>
                </span>
                <span className="rounded-md border border-border/60 bg-background/50 px-2 py-1 text-muted">
                  Term: <span className="font-medium text-foreground">{termLabel}</span>
                </span>
                <span className="rounded-md border border-border/60 bg-background/50 px-2 py-1 text-muted">
                  Base P&I: <span className="font-medium text-foreground">{basePiLabel}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const summaryCards = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted">Baseline payoff</p>
        <p className="mt-1 min-h-5 text-sm font-medium text-foreground">
          {baselinePayoffDate
            ? baselinePayoffDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Not amortizing"}
        </p>
      </div>
      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted">With extra payment</p>
        <p className="mt-1 min-h-5 text-sm font-medium text-foreground">
          {scenarioPayoffDate
            ? scenarioPayoffDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Not amortizing"}
        </p>
      </div>
      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted">Time saved</p>
        <p className="mt-1 min-h-5 text-sm font-medium text-positive">
          {payoffDeltaYears != null ? `${payoffDeltaYears} years` : "—"}
        </p>
      </div>
      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted">Interest saved (est.)</p>
        <p className="mt-1 min-h-5 text-sm font-medium text-positive">
          {interestSaved != null ? formatCurrency(interestSaved) : "—"}
        </p>
      </div>
    </div>
  );

  const chartPanel = (
    <div
      className={
        isMortgageWorkspace
          ? "flex h-full flex-col rounded-xl border border-border/70 bg-card p-4 shadow-sm"
          : "rounded-lg border border-border bg-card p-4"
      }
    >
      <h3 className="mb-1 text-sm font-semibold text-muted">
        Balance projection (baseline vs extra principal)
      </h3>
      <p className="mb-3 text-xs text-muted">
        Baseline follows current payment terms. &quot;With extra payment&quot; adds your extra
        principal each month to accelerate payoff.
      </p>
      {chartData.length === 0 ? (
        <div
          className={`flex items-center justify-center text-sm text-muted ${
            isMortgageWorkspace ? "h-[260px] xl:flex-1 xl:min-h-[320px]" : "h-[220px] sm:h-[280px] lg:h-[320px]"
          }`}
        >
          Add mortgage details to see payoff simulation.
        </div>
      ) : (
        <div
          className={
            isMortgageWorkspace
              ? "h-[260px] xl:flex-1 xl:min-h-[320px]"
              : "h-[220px] sm:h-[280px] lg:h-[320px]"
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload as SimulationPoint;
                  return (
                    <div className="rounded border border-border bg-card px-3 py-2 text-sm shadow-sm">
                      <p className="font-medium text-foreground">{row.dateLong}</p>
                      <p className="text-muted">
                        Baseline:{" "}
                        {row.baselineBalance != null
                          ? formatCurrency(row.baselineBalance)
                          : "—"}
                      </p>
                      <p className="text-muted">
                        With extra:{" "}
                        {row.scenarioBalance != null
                          ? formatCurrency(row.scenarioBalance)
                          : "—"}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="baselineBalance"
                name="Baseline"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="scenarioBalance"
                name="With extra payment"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--chart-3)]" />
          Baseline
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--chart-1)]" />
          With extra payment
        </span>
      </div>
    </div>
  );

  const baselineNote = (
    <div className="rounded-md border border-border bg-subtle/30 p-3 text-xs text-muted">
      Baseline assumes no extra principal payments. Monthly payment{" "}
      {normalizedMortgage ? formatCurrency(getPiForAmortization(normalizedMortgage)) : "—"}
      /mo. &quot;With extra payment&quot; adds {formatCurrency(extraPayment)}/mo in extra principal.
    </div>
  );

  const estimateHelper = showEstimateHelper ? (
    <details className="rounded-md border border-border bg-card p-3">
      <summary className="cursor-pointer text-xs font-medium text-foreground">
        Estimate looks off?
      </summary>
      <div className="mt-2 space-y-1 text-xs text-muted">
        <p>
          Common causes: first payment starts a month later than loan start, recent escrow changes,
          or stale balance/payment fields.
        </p>
        <p>Verify: current balance, balance as-of date, monthly payment, escrow included + amount, and start/effective dates.</p>
        <p>
          Small residual balances close to term-end are auto-treated as payoff estimates, so
          &quot;Not amortizing&quot; appears only when principal is not meaningfully reducing.
        </p>
        <p>
          <Link
            href={`/properties/${propertyId}?tab=details#mortgages`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateToDetails();
            }}
            className="font-medium text-accent hover:underline"
          >
            Review mortgage details
          </Link>
          {" "}and rerun the simulation.
        </p>
      </div>
    </details>
  ) : null;

  const disclaimer = (
    <p className="text-xs text-muted">Estimates for informational purposes only. Not financial advice.</p>
  );

  if (isMortgageWorkspace) {
    return (
      <div className="space-y-4">
        {summaryCards}
        <div className="xl:grid xl:grid-cols-12 xl:items-stretch xl:gap-4">
          <div className="xl:col-span-5">{controlsPanel}</div>
          <div className="mt-4 xl:col-span-7 xl:mt-0">{chartPanel}</div>
        </div>
        {baselineNote}
        {estimateHelper}
        {disclaimer}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {controlsPanel}
      {summaryCards}
      {chartPanel}
      {baselineNote}
      {estimateHelper}
      {disclaimer}
    </div>
  );
}
