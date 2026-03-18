"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format-currency";
import {
  getExtraPaymentForYearsEarlier,
  getPiForAmortization,
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
  let interestPaidTotal = 0;
  let payoffDate: Date | null = null;

  const points: { idx: number; date: Date; balance: number }[] = [
    { idx: 0, date: firstPointDate, balance: Math.max(0, balance) },
  ];

  for (let month = 1; month <= remainingTermMonths && balance > 0; month++) {
    const date = new Date(firstPointDate.getFullYear(), firstPointDate.getMonth() + month, 1);
    const interest = balance * monthlyRate;
    const rawPrincipal = payment - interest;
    let principal = rawPrincipal;

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
  };
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
  onNavigateToDetails,
}: {
  propertyId: string;
  mortgageData: MortgageForTabs[];
  onNavigateToDetails: () => void;
}) {
  const [selectedMortgageId, setSelectedMortgageId] = useState<string>(
    mortgageData[0]?.id ?? ""
  );
  const [selectedYearsEarlier, setSelectedYearsEarlier] = useState<number | null>(null);
  const [extraInput, setExtraInput] = useState("0");

  const selectedMortgage = useMemo(
    () =>
      mortgageData.find((m) => m.id === selectedMortgageId) ??
      mortgageData[0] ??
      null,
    [mortgageData, selectedMortgageId]
  );

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

  const baselineYearsRemaining = useMemo(() => {
    if (!baseSimulation?.payoffDate) return null;
    const now = new Date();
    return yearsBetween(now, baseSimulation.payoffDate);
  }, [baseSimulation]);

  const validYearsEarlierOptions = useMemo(() => {
    if (!normalizedMortgage || !baselineYearsRemaining) return [];
    return [5, 10, 15].filter((y) => y < baselineYearsRemaining);
  }, [normalizedMortgage, baselineYearsRemaining]);

  const payoffEarlierOptions = useMemo(
    () =>
      validYearsEarlierOptions.map((years) => ({
        years,
        extra:
          normalizedMortgage != null
            ? getExtraPaymentForYearsEarlier(normalizedMortgage, years)
            : null,
      })),
    [normalizedMortgage, validYearsEarlierOptions]
  );

  const payoffDeltaYears = useMemo(() => {
    if (!baseSimulation?.payoffDate || !scenarioSimulation?.payoffDate) return null;
    return Math.max(0, yearsBetween(scenarioSimulation.payoffDate, baseSimulation.payoffDate));
  }, [baseSimulation, scenarioSimulation]);

  const interestSaved = useMemo(() => {
    if (!baseSimulation || !scenarioSimulation) return null;
    const saved = baseSimulation.interestPaidTotal - scenarioSimulation.interestPaidTotal;
    return saved > 0 ? saved : 0;
  }, [baseSimulation, scenarioSimulation]);

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

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Simulation controls
            </h3>
            <p className="mt-1 text-xs text-muted">
              Assumes current loan terms and applies extra principal monthly to show payoff impact.
            </p>
          </div>
          <Link
            href={`/properties/${propertyId}?tab=details#mortgages`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateToDetails();
            }}
            className="text-sm font-medium text-accent hover:underline"
          >
            View mortgage details
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mortgageData.length > 1 ? (
            <label className="block text-xs font-medium text-muted">
              Mortgage
              <select
                value={selectedMortgage?.id ?? ""}
                onChange={(e) => {
                  setSelectedMortgageId(e.target.value);
                  setSelectedYearsEarlier(null);
                  setExtraInput("0");
                }}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
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
            <div className="rounded-md border border-border bg-subtle/30 p-3">
              <p className="text-xs text-muted">Selected mortgage</p>
              <p className="mt-1 text-sm font-medium text-foreground">
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
            Extra principal ($ / month)
            <input
              id="extra-payment"
              type="text"
              inputMode="decimal"
              value={extraInput}
              onChange={(e) => {
                setSelectedYearsEarlier(null);
                setExtraInput(e.target.value);
              }}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
              placeholder="0"
            />
          </label>

          <div className="rounded-md border border-border bg-subtle/30 p-3">
            <p className="text-xs text-muted">Base principal + interest</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {normalizedMortgage
                ? `${formatCurrency(getPiForAmortization(normalizedMortgage))}/mo`
                : "—"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedYearsEarlier(null);
              setExtraInput("0");
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div className="mt-3 rounded-md border border-border bg-subtle/30 p-3">
          <p className="text-xs font-medium text-muted">Pay off earlier</p>
          <p className="mt-0.5 text-xs text-muted">
            Quick targets with suggested extra monthly payment.
          </p>
          {payoffEarlierOptions.length > 0 ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {payoffEarlierOptions.map(({ years, extra }) => {
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
                    className={`rounded-md border px-3 py-2 text-left transition ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border bg-background hover:bg-subtle"
                    } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {years} years earlier
                      </span>
                      <span className="text-xs text-muted">
                        {extra ? `${formatCurrency(extra)}/mo` : "Unavailable"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">
              No quick targets available for this mortgage yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">Baseline payoff</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {baseSimulation?.payoffDate
              ? baseSimulation.payoffDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Not amortizing"}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">With extra payment</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {scenarioSimulation?.payoffDate
              ? scenarioSimulation.payoffDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Not amortizing"}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">Time saved</p>
          <p className="mt-1 text-sm font-medium text-positive">
            {payoffDeltaYears != null ? `${payoffDeltaYears} years` : "—"}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted">Estimated interest saved</p>
          <p className="mt-1 text-sm font-medium text-positive">
            {interestSaved != null ? formatCurrency(interestSaved) : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-1 text-sm font-semibold text-muted">
          Mortgage balance projection (baseline vs extra principal)
        </h3>
        <p className="mb-3 text-xs text-muted">
          Baseline follows current payment terms. &quot;With extra payment&quot; adds your extra
          principal each month to accelerate payoff.
        </p>
        {chartData.length === 0 ? (
          <div className="flex h-[220px] sm:h-[280px] lg:h-[320px] items-center justify-center text-sm text-muted">
            Add mortgage details to see payoff simulation.
          </div>
        ) : (
          <div className="h-[220px] sm:h-[280px] lg:h-[320px]">
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

      <div className="rounded-md border border-border bg-subtle/30 p-3 text-xs text-muted">
        Baseline inputs: monthly payment{" "}
        {normalizedMortgage ? formatCurrency(getPiForAmortization(normalizedMortgage)) : "—"} /
        mo, extra principal {formatCurrency(extraPayment)}/mo.
      </div>

      <p className="text-xs text-muted">Estimates for informational purposes only. Not financial advice.</p>
    </div>
  );
}
