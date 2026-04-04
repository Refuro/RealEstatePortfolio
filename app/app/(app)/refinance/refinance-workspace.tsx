"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobileSectionCard } from "@/components/mobile-section-card";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import {
  AMORTIZATION_COMPARISON_EPSILON,
  getPiForAmortization,
  getRefinanceProjection,
  type MortgageRecord,
} from "@/lib/amortization";
import type { CalculatorMetricTone } from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import type { MortgageForTabs } from "../properties/[id]/property-detail-tabs";

export type RefinanceMortgageProperty = {
  id: string;
  nickname: string | null;
  addressLine1: string;
  mortgages: MortgageForTabs[];
};

function getPropertyLabel(property: RefinanceMortgageProperty): string {
  return property.nickname?.trim() || property.addressLine1;
}

function getDefaultPropertyId(properties: RefinanceMortgageProperty[]): string {
  return properties.find((property) => property.mortgages.length > 0)?.id ?? properties[0]?.id ?? "";
}

function syncRefinanceWorkspaceQuery(propertyId: string, mortgageId?: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("propertyId", propertyId);
  if (mortgageId) {
    url.searchParams.set("mortgageId", mortgageId);
  } else {
    url.searchParams.delete("mortgageId");
  }
  window.history.replaceState(window.history.state, "", url.toString());
}

function cashFlowTone(n: number): CalculatorMetricTone {
  if (!Number.isFinite(n)) return "default";
  if (n > 0) return "positive";
  if (n < 0) return "negative";
  return "default";
}

function formatMoneySigned(n: number): string {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

function getBalanceSourceCopy(m: MortgageForTabs): string {
  if (m.balanceSource === "stored" && m.balanceAsOfDate) {
    return `Based on stored balance as of ${new Date(m.balanceAsOfDate).toLocaleDateString()}.`;
  }
  if (m.balanceSource === "stored_projected" && m.balanceAsOfDate) {
    return `Based on statement balance from ${new Date(m.balanceAsOfDate).toLocaleDateString()}, stepped forward to today.`;
  }
  return "Using projected balance from amortization.";
}

function getMortgageLabel(m: MortgageForTabs, index: number): string {
  const amt = Number(m.originalLoanAmount);
  const amtLabel = Number.isFinite(amt)
    ? ` — ${formatCurrency(amt)}`
    : "";
  const lender = m.lenderName?.trim();
  if (lender) return `${lender}${amtLabel}`;
  return `Mortgage ${index + 1}${amtLabel}`;
}

function buildCurrentLoanBalances(
  mortgage: MortgageRecord,
  effectiveBalance: number,
  remainingMonths: number
): number[] {
  const balances: number[] = [];
  const monthlyRate = Number(mortgage.interestRate) / 12;
  const payment = getPiForAmortization(mortgage);
  let bal = effectiveBalance;
  balances.push(Math.round(bal * 100) / 100);
  for (let i = 0; i < remainingMonths; i++) {
    if (bal <= 0) break;
    const interest = bal * monthlyRate;
    if (payment + AMORTIZATION_COMPARISON_EPSILON < interest) break;
    let principal = payment - interest;
    if (principal >= bal) principal = bal;
    principal = Math.max(0, principal);
    bal = Math.max(0, bal - principal);
    balances.push(Math.round(bal * 100) / 100);
  }
  return balances;
}

function buildRefiBalances(
  effectiveBalance: number,
  newAnnualRate: number,
  newMonthlyPayment: number,
  newTermMonths: number
): number[] {
  const balances: number[] = [];
  const newMonthlyRate = newAnnualRate / 12;
  let bal = effectiveBalance;
  balances.push(Math.round(bal * 100) / 100);
  for (let i = 0; i < newTermMonths; i++) {
    if (bal <= 0) break;
    const interest = bal * newMonthlyRate;
    let principal = newMonthlyPayment - interest;
    if (principal + AMORTIZATION_COMPARISON_EPSILON < 0) break;
    if (principal >= bal) principal = bal;
    principal = Math.max(0, principal);
    bal = Math.max(0, bal - principal);
    balances.push(Math.round(bal * 100) / 100);
  }
  return balances;
}

export function RefinanceWorkspace({
  properties,
  initialSelectedPropertyId,
  initialSelectedMortgageId,
}: {
  properties: RefinanceMortgageProperty[];
  initialSelectedPropertyId?: string;
  initialSelectedMortgageId?: string;
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialSelectedPropertyId &&
      properties.some((property) => property.id === initialSelectedPropertyId)
      ? initialSelectedPropertyId
      : getDefaultPropertyId(properties)
  );
  const [selectedMortgageId, setSelectedMortgageId] = useState(() => {
    const prop =
      properties.find((p) => p.id === initialSelectedPropertyId) ??
      properties.find((p) => p.mortgages.length > 0) ??
      properties[0];
    const fromUrl =
      initialSelectedMortgageId &&
      prop?.mortgages.some((m) => m.id === initialSelectedMortgageId)
        ? initialSelectedMortgageId
        : undefined;
    return fromUrl ?? prop?.mortgages[0]?.id ?? "";
  });

  const [rateInput, setRateInput] = useState("");
  const [newTermYears, setNewTermYears] = useState(30);
  const [costsInput, setCostsInput] = useState("");
  const [rateOutOfRange, setRateOutOfRange] = useState(false);

  const selectedProperty = useMemo(
    () =>
      properties.find((property) => property.id === selectedPropertyId) ??
      properties.find((property) => property.mortgages.length > 0) ??
      properties[0] ??
      null,
    [properties, selectedPropertyId]
  );

  const selectedMortgage = useMemo(() => {
    if (!selectedProperty) return null;
    return (
      selectedProperty.mortgages.find((m) => m.id === selectedMortgageId) ??
      selectedProperty.mortgages[0] ??
      null
    );
  }, [selectedProperty, selectedMortgageId]);

  const mortgageRecord = selectedMortgage as Parameters<typeof getRefinanceProjection>[0] | null;

  const refinanceProjection = useMemo(() => {
    if (!mortgageRecord) return null;
    const rateRaw = rateInput.trim().replace(/[^0-9.]/g, "");
    if (!rateRaw) return null;
    const ratePct = parseFloat(rateRaw);
    if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 30) {
      return null;
    }
    const costsTrim = costsInput.trim().replace(/[^0-9.]/g, "");
    const costsParsed = costsTrim ? parseFloat(costsTrim) : NaN;
    const closingCosts =
      Number.isFinite(costsParsed) && costsParsed > 0 ? costsParsed : undefined;
    return getRefinanceProjection(mortgageRecord, {
      newAnnualRate: ratePct / 100,
      newTermYears,
      closingCosts,
    });
  }, [mortgageRecord, rateInput, newTermYears, costsInput]);

  const costsParsedForUi = useMemo(() => {
    const costsTrim = costsInput.trim().replace(/[^0-9.]/g, "");
    if (!costsTrim) return 0;
    const v = parseFloat(costsTrim);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [costsInput]);

  const monthsSaved =
    refinanceProjection && !refinanceProjection.isNewLoanNegativeAmortizing
      ? refinanceProjection.remainingCurrentMonths - newTermYears * 12
      : null;

  const chartData = useMemo(() => {
    if (!refinanceProjection || !mortgageRecord || rateOutOfRange) return [];
    const rateRaw = rateInput.trim().replace(/[^0-9.]/g, "");
    if (!rateRaw) return [];
    const ratePct = parseFloat(rateRaw);
    if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 30) return [];
    if (refinanceProjection.isNewLoanNegativeAmortizing) return [];

    const { effectiveBalance, newMonthlyPayment, remainingCurrentMonths } =
      refinanceProjection;
    const newAnnualRate = ratePct / 100;
    const newTermMonths = newTermYears * 12;

    const currentSeries = buildCurrentLoanBalances(
      mortgageRecord,
      effectiveBalance,
      remainingCurrentMonths
    );
    const refiSeries = buildRefiBalances(
      effectiveBalance,
      newAnnualRate,
      newMonthlyPayment,
      newTermMonths
    );
    const maxLen = Math.max(currentSeries.length, refiSeries.length);
    const rows: {
      month: number;
      label: string;
      current: number | null;
      refinanced: number | null;
    }[] = [];
    for (let i = 0; i < maxLen; i++) {
      rows.push({
        month: i,
        label: i === 0 ? "Start" : `+${i}`,
        current: currentSeries[i] ?? null,
        refinanced: refiSeries[i] ?? null,
      });
    }
    return rows;
  }, [
    refinanceProjection,
    mortgageRecord,
    rateInput,
    rateOutOfRange,
    newTermYears,
  ]);

  useEffect(() => {
    captureClientEvent(AnalyticsEvents.REFINANCE_WORKSPACE_VIEWED, {
      propertyId: selectedPropertyId,
      mortgageId: selectedMortgageId,
    });
    // Intentionally once on mount for workspace view funnel.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only analytics
  }, []);

  const totalMortgages = selectedProperty?.mortgages.length ?? 0;

  const summaryItems =
    refinanceProjection && !rateOutOfRange
      ? [
          {
            label: "Current P&I",
            value: `${formatMoneySigned(refinanceProjection.currentMonthlyPi)}/mo`,
            tone: "default" as const,
          },
          {
            label: "New P&I",
            value: `${formatMoneySigned(refinanceProjection.newMonthlyPayment)}/mo`,
            tone: "default" as const,
          },
        ]
      : [];

  const inputsSection = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted">New rate</label>
        <div className="relative mt-1.5">
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 5.5"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            onBlur={() => {
              const trimmed = rateInput.trim();
              if (!trimmed) {
                setRateOutOfRange(false);
                return;
              }
              const v = parseFloat(trimmed.replace(/[^0-9.]/g, ""));
              setRateOutOfRange(!Number.isFinite(v) || v < 0 || v > 30);
            }}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">%</span>
        </div>
        {rateOutOfRange ? (
          <p className="mt-1 text-xs text-negative">Enter a rate between 0 and 30.</p>
        ) : null}
      </div>
      <div>
        <label className="block text-xs font-medium text-muted">New term</label>
        <select
          value={newTermYears}
          onChange={(e) => setNewTermYears(Number(e.target.value))}
          className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value={30}>30 years</option>
          <option value={25}>25 years</option>
          <option value={20}>20 years</option>
          <option value={15}>15 years</option>
          <option value={10}>10 years</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted">Closing costs <span className="font-normal">(optional)</span></label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 4000"
            value={costsInput}
            onChange={(e) => setCostsInput(e.target.value)}
            className="block w-full rounded-md border border-border bg-background py-2 pl-6 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <p className="mt-1 text-xs text-muted">Cash paid at closing, not rolled into the loan.</p>
      </div>
    </div>
  );

  const metricsBlock =
    refinanceProjection != null && !rateOutOfRange && selectedMortgage ? (
      <div className="space-y-3">
        {refinanceProjection.isNewLoanNegativeAmortizing ? (
          <p className="text-sm text-warning">
            This rate is too high to amortize the loan.
          </p>
        ) : (
          <>
            {refinanceProjection.remainingCurrentMonths < 24 ? (
              <p className="text-sm text-muted">
                Your loan has ~
                <span className="tabular-nums">
                  {refinanceProjection.remainingCurrentMonths}
                </span>{" "}
                months remaining — a new {newTermYears}-year term will cost
                significantly more total interest despite a lower monthly
                payment.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <CalculatorMetric
                label="New P&I"
                value={`${formatMoneySigned(refinanceProjection.newMonthlyPayment)}/mo`}
                tone="default"
              />
              <CalculatorMetric
                label="Monthly savings"
                value={`${formatMoneySigned(refinanceProjection.monthlySavings)}/mo`}
                tone={cashFlowTone(refinanceProjection.monthlySavings)}
              />
              <CalculatorMetric
                label={
                  refinanceProjection.totalInterestSaved >= 0
                    ? "Total interest saved"
                    : "Total interest added"
                }
                value={formatMoneySigned(
                  Math.abs(refinanceProjection.totalInterestSaved)
                )}
                tone={cashFlowTone(refinanceProjection.totalInterestSaved)}
              />
              {monthsSaved != null && (
                <CalculatorMetric
                  label={
                    monthsSaved > 0
                      ? "Months sooner"
                      : monthsSaved < 0
                        ? "Months longer"
                        : "Same term length"
                  }
                  value={monthsSaved !== 0 ? `${Math.abs(monthsSaved)} mo` : "—"}
                  tone={
                    monthsSaved > 0
                      ? "positive"
                      : monthsSaved < 0
                        ? "negative"
                        : "default"
                  }
                />
              )}
              {costsParsedForUi > 0 ? (
                refinanceProjection.monthlySavings > 0 &&
                refinanceProjection.breakEvenMonths != null ? (
                  <CalculatorMetric
                    label="Break-even"
                    value={`${refinanceProjection.breakEvenMonths} mo`}
                    helper={
                      refinanceProjection.breakEvenDate
                        ? refinanceProjection.breakEvenDate.toLocaleDateString(
                            undefined,
                            {
                              month: "long",
                              year: "numeric",
                              day: "numeric",
                            }
                          )
                        : undefined
                    }
                    tone="default"
                  />
                ) : (
                  <CalculatorMetric
                    label="Break-even"
                    value="—"
                    helper="This refinance increases your monthly payment — no break-even."
                    tone="negative"
                  />
                )
              ) : null}
            </div>
            <p className="text-sm text-muted">
              {refinanceProjection.totalInterestSaved >= 0
                ? "Net interest vs. staying on your current loan: "
                : "Net additional interest on the new loan: "}
              <span className="tabular-nums font-medium text-foreground">
                {formatMoneySigned(
                  Math.abs(refinanceProjection.totalInterestSaved)
                )}
              </span>
            </p>
            <p className="text-xs text-muted">
              {getBalanceSourceCopy(selectedMortgage)}
            </p>
            {costsParsedForUi > 0 ? (
              <p className="text-xs text-muted">
                Assumes closing costs paid upfront. Rolling costs into the loan
                changes these figures.
              </p>
            ) : null}
          </>
        )}
      </div>
    ) : null;

  const chartSection =
    chartData.length > 0 ? (
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickFormatter={(v: number) =>
                v === 0 ? "Now" : v % 12 === 0 ? `Yr ${v / 12}` : ""
              }
            />
            <YAxis
              tickFormatter={(v) => `$${v / 1000}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as {
                  month: number;
                  label: string;
                  current: number | null;
                  refinanced: number | null;
                };
                return (
                  <div className="rounded border border-border bg-card px-3 py-2 text-sm shadow-sm">
                    <div className="font-medium text-foreground">
                      {row.month === 0 ? "Today" : `Month ${row.month}`}
                    </div>
                    {row.current != null ? (
                      <div className="text-muted">
                        Current loan: {formatCurrency(row.current)}
                      </div>
                    ) : null}
                    {row.refinanced != null ? (
                      <div className="text-muted">
                        If refinanced: {formatCurrency(row.refinanced)}
                      </div>
                    ) : null}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="Current loan"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="refinanced"
              name="If refinanced"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <p className="text-sm text-muted">
        Enter a valid rate to compare balance over time.
      </p>
    );

  const mobileContext = selectedProperty ? (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-muted">
        Property
        <select
          value={selectedProperty.id}
          onChange={(e) => {
            const nextPropertyId = e.target.value;
            setSelectedPropertyId(nextPropertyId);
            const next = properties.find((p) => p.id === nextPropertyId);
            const firstM = next?.mortgages[0]?.id ?? "";
            setSelectedMortgageId(firstM);
            syncRefinanceWorkspaceQuery(nextPropertyId, firstM || null);
          }}
          disabled={properties.length <= 1}
          className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {getPropertyLabel(property)}
            </option>
          ))}
        </select>
      </label>
      {selectedProperty.mortgages.length > 1 ? (
        <label className="block text-xs font-medium text-muted">
          Mortgage
          <select
            value={selectedMortgageId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedMortgageId(id);
              syncRefinanceWorkspaceQuery(selectedProperty.id, id);
            }}
            className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {selectedProperty.mortgages.map((m, i) => (
              <option key={m.id} value={m.id}>
                {getMortgageLabel(m, i)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  ) : null;

  if (properties.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Refinance</h1>
        <p className="mt-2 text-base text-muted">
          Compare a hypothetical refinance against your current loan from one
          place.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-lg font-medium text-foreground">
            Add a property with a mortgage to model refi scenarios
          </h2>
          <p className="mt-2 text-base text-muted">
            Once a mortgage exists, you can enter a new rate, term, and closing
            costs here.
          </p>
          <Link
            href="/properties/new"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add your first property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Refinance</h1>
      <p className="mt-2 text-base text-muted md:hidden">
        What-if refinance for your portfolio loans.
      </p>

      <div className="mt-4 md:hidden">
        <MobileToolShell
          eyebrow="Refinance"
          title="What-If Comparison"
          context={mobileContext}
          summaryItems={summaryItems}
        >
          <MobileSectionCard>
            {inputsSection}
            {metricsBlock}
          </MobileSectionCard>
          <MobileCollapsible label="Balance comparison">{chartSection}</MobileCollapsible>
        </MobileToolShell>
      </div>

      <div className="mt-4 hidden md:block">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              Model a new rate and term against your current balance and
              payment.
            </p>
            {selectedProperty ? (
              <span className="mt-1.5 inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted shadow-sm">
                {totalMortgages} {totalMortgages === 1 ? "mortgage" : "mortgages"}
              </span>
            ) : null}
          </div>
          <label className="block w-full text-xs font-medium text-muted lg:w-80">
            Property
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => {
                const nextPropertyId = e.target.value;
                setSelectedPropertyId(nextPropertyId);
                const next = properties.find((p) => p.id === nextPropertyId);
                const firstM = next?.mortgages[0]?.id ?? "";
                setSelectedMortgageId(firstM);
                syncRefinanceWorkspaceQuery(nextPropertyId, firstM || null);
              }}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
            {properties.length <= 1 ? (
              <span className="mt-1 block text-xs text-muted">
                Add more properties to switch context here.
              </span>
            ) : null}
          </label>
        </div>

        {selectedProperty && selectedProperty.mortgages.length > 1 ? (
          <label className="mt-4 block max-w-md text-xs font-medium text-muted">
            Mortgage
            <select
              value={selectedMortgageId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedMortgageId(id);
                syncRefinanceWorkspaceQuery(selectedProperty.id, id);
              }}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {selectedProperty.mortgages.map((m, i) => (
                <option key={m.id} value={m.id}>
                  {getMortgageLabel(m, i)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedProperty && selectedMortgage ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card shadow-sm grid grid-cols-[1fr_2fr] divide-x divide-border">
              <div className="p-5">
                <p className="text-xs font-medium text-muted">Scenario inputs</p>
                <div className="mt-3">{inputsSection}</div>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-muted">Results</p>
                {metricsBlock ? (
                  <div className="mt-3">{metricsBlock}</div>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    Enter a rate to see your comparison.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-medium text-muted">Balance comparison</p>
              <div className="mt-2">{chartSection}</div>
            </div>
            <p className="text-xs text-muted">
              Estimates for informational purposes only. Not financial advice.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-lg font-medium text-foreground">
              No mortgage selected
            </h2>
            <p className="mt-2 text-base text-muted">
              Pick a property with a mortgage to run the comparison.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
