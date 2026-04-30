import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format-currency";
import { MetricCard } from "@/components/metric-card";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { getEffectiveBalance } from "@/lib/amortization";
import { buildDashboardPortfolioPayload } from "@/lib/server/portfolio-summary-payload";
import { buildDashboardTrends } from "@/lib/dashboard-trends";
import {
  BENCHMARK_UX_MESSAGES,
  getBenchmarkEligibility,
  getBenchmarkLabel,
} from "@/lib/benchmark-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { adjustSnapshotCashFlow } from "@/lib/snapshots";
import { getPropertyCompleteness } from "@/lib/property-completeness";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { DashboardCharts, type DashboardChartData } from "./dashboard-charts";
import { MetricHelpLink } from "./metric-help-link";
import { RentVsMarketSection } from "./rent-vs-market-section";
import { PortfolioOverviewSection } from "./portfolio-overview-section";
import { PaidIntentCheckoutBanner } from "@/components/growth/paid-intent-checkout-banner";
import {
  DashboardEmptyStatePrimaryCta,
  DashboardEmptyStateSecondaryLinks,
} from "./dashboard-empty-state-ctas";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { PropertyTableRow } from "./property-performance-table";

function formatDeltaLabel(value: number | null | undefined): string | null {
  if (value == null) return null;
  if (value === 0) return "No change vs last month";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value)} vs last month`;
}

function TrendDirectionIcon({ value }: { value: number | null | undefined }) {
  if (value == null || value === 0) {
    return <Minus className="size-4 text-muted" aria-hidden />;
  }
  if (value > 0) {
    return <TrendingUp className="size-4 text-positive" aria-hidden />;
  }
  return <TrendingDown className="size-4 text-negative" aria-hidden />;
}

function EquitySparkline({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 220;
  const height = 48;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });
  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;
  const positive = latest >= previous;

  const strokeColor = positive ? "var(--positive)" : "var(--negative)";
  const areaPoints = `0,${height} ${points.join(" ")} ${width},${height}`;

  return (
    <div className="mt-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-12 w-full md:h-auto md:aspect-[6/1]"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Equity trend from ${labels[0]} to ${labels[labels.length - 1]}`}
      >
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          fill="url(#equityGradient)"
          points={areaPoints}
        />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          points={points.join(" ")}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-1 flex items-center justify-between text-xs text-muted">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;
  const { onboarding } = await searchParams;

  const {
    metrics,
    properties,
    displayMode,
    effectiveTier,
  } = await buildDashboardPortfolioPayload(user);

  const propertyIds = properties.map((property) => property.id);
  const recentSnapshots =
    propertyIds.length > 0
      ? await prisma.propertySnapshot.findMany({
          where: {
            propertyId: { in: propertyIds },
          },
          select: {
            propertyId: true,
            snapshotMonth: true,
            estimatedValue: true,
            equity: true,
            monthlyCashFlow: true,
            ownershipPct: true,
            monthlyPayment: true,
          },
          orderBy: { snapshotMonth: "asc" },
        })
      : [];
  const trends = buildDashboardTrends(
    recentSnapshots.map((snapshot) => ({
      propertyId: snapshot.propertyId,
      snapshotMonth: snapshot.snapshotMonth,
      estimatedValue: Number(snapshot.estimatedValue),
      equity: Number(snapshot.equity),
      monthlyCashFlow: adjustSnapshotCashFlow(
        Number(snapshot.monthlyCashFlow),
        snapshot.ownershipPct,
        snapshot.monthlyPayment != null ? Number(snapshot.monthlyPayment) : null,
        displayMode
      ),
    }))
  );

  const nowMs = new Date().getTime();
  const daysSinceSignup = Math.max(
    0,
    Math.floor(
      (nowMs - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const emptyStateHeading =
    daysSinceSignup <= 1
      ? "Your dashboard is waiting for its first property"
      : daysSinceSignup <= 6
        ? "Still setting up? Most landlords add their first property in about 60 seconds"
        : "Your portfolio metrics are ready when you are";
  const emptyStateBody =
    daysSinceSignup <= 1
      ? "Add one property and see live equity, cash flow, and cap rate - all in one place."
      : daysSinceSignup <= 6
        ? "Your dashboard will show real-time portfolio metrics the moment you add a property."
        : "Add a property to start tracking equity, cash flow, and rent benchmarks.";

  const portfolioInput = properties.map((p) => {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum, m) => sum + getEffectiveBalance(m),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum, m) => sum + Number(m.monthlyPayment),
      0
    );
    return {
      id: p.id,
      name: p.nickname || p.addressLine1 || "Property",
      monthlyRent: getPropertyTotalRent(p),
      monthlyExpenses: Number(p.currentMonthlyExpenses),
      estimatedValue: Number(p.currentEstimatedValue),
      cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent: p.ownershipPercent ?? 100,
      vacancyPercent: p.vacancyPercent ?? 5,
    };
  });

  // Single-pass: compute metrics once per property; reuse for charts + table.
  const perPropertyMetrics = portfolioInput.map((p) => ({
    id: p.id,
    name: p.name,
    ...computePropertyMetrics(p, displayMode),
  }));

  const singleProperty = metrics.propertyCount === 1 ? properties[0] : null;
  const propertyHref = singleProperty ? `/properties/${singleProperty.id}` : "/properties";
  const modelingHref = singleProperty
    ? `/modeling?propertyId=${encodeURIComponent(singleProperty.id)}`
    : "/modeling";
  const mortgageHref = singleProperty
    ? `/mortgage?propertyId=${encodeURIComponent(singleProperty.id)}`
    : "/mortgage";

  const fullLiability = displayMode === "full_liability";

  const chartData: DashboardChartData = {
    equity: perPropertyMetrics.map((m) => ({
      name: m.name,
      equity: m.equity,
      propertyId: m.id,
    })),
    debtVsValue: portfolioInput.map((p) => {
      const scale = (p.ownershipPercent ?? 100) / 100;
      return {
        name: p.name,
        value: p.estimatedValue * scale,
        debt: fullLiability ? p.totalMortgageBalance : p.totalMortgageBalance * scale,
        propertyId: p.id,
      };
    }),
    cashFlow: perPropertyMetrics.map((m) => ({
      name: m.name,
      monthlyCashFlow: m.monthlyCashFlow,
      propertyId: m.id,
    })),
  };

  // Attention flags per property (same logic as properties/page.tsx).
  const perPropertyFlags = properties.map((p) => {
    const m = perPropertyMetrics.find((pm) => pm.id === p.id)!;
    const benchmarkEligibility = getBenchmarkEligibility({
      isRented: p.isRented,
      userRent: getPropertyTotalRent(p),
      marketRent: p.marketRent != null ? Number(p.marketRent) : null,
      marketRentAsOf: p.marketRentAsOf,
    });
    const benchmarkStale =
      benchmarkEligibility === "benchmark_missing" ||
      benchmarkEligibility === "benchmark_stale";
    const noMortgage = p.mortgages.length === 0 && p.hasMortgage !== false;
    const negativeCashFlow = m.monthlyCashFlow < 0;
    const completeness = getPropertyCompleteness({
      purchasePrice: Number(p.purchasePrice),
      currentEstimatedValue: Number(p.currentEstimatedValue),
      cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
      mortgageCount: p.mortgages.length,
      hasMortgage: p.hasMortgage ?? null,
      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms != null ? Number(p.bathrooms) : null,
      squareFeet: p.squareFeet ?? null,
    });
    const incompleteProfile = !completeness.isComplete;
    return {
      id: p.id,
      noMortgage,
      benchmarkStale,
      negativeCashFlow,
      incompleteProfile,
      needsAttention: noMortgage || benchmarkStale || negativeCashFlow || incompleteProfile,
    };
  });

  // Scale raw propertyValueDeltaMoM by ownership (snapshot value is unscaled).
  const scaledValueDeltas: Record<string, number | null> = {};
  for (const p of portfolioInput) {
    const raw = trends.propertyValueDeltaMoM[p.id] ?? null;
    const scale = (p.ownershipPercent ?? 100) / 100;
    scaledValueDeltas[p.id] = raw != null ? raw * scale : null;
  }

  // Build table rows for PortfolioOverviewSection (6+ properties).
  const tableRows: PropertyTableRow[] = properties.map((p) => {
    const pInput = portfolioInput.find((pi) => pi.id === p.id)!;
    const m = perPropertyMetrics.find((pm) => pm.id === p.id)!;
    const flags = perPropertyFlags.find((f) => f.id === p.id)!;
    const scale = (pInput.ownershipPercent ?? 100) / 100;
    return {
      id: p.id,
      name: pInput.name,
      addressLine1: p.addressLine1,
      updatedAt: p.updatedAt,
      value: pInput.estimatedValue * scale,
      equity: m.equity,
      monthlyCashFlow: m.monthlyCashFlow,
      capRate: m.capRate,
      valueDeltaMoM: scaledValueDeltas[p.id] ?? null,
      equityDeltaMoM: trends.propertyEquityDeltaMoM[p.id] ?? null,
      cashFlowDeltaMoM: trends.propertyCashFlowDeltaMoM[p.id] ?? null,
      isRented: p.isRented,
      userRent: getPropertyTotalRent(p),
      marketRent: p.marketRent != null ? Number(p.marketRent) : null,
      marketRentAsOf: p.marketRentAsOf,
      noMortgage: flags.noMortgage,
      benchmarkStale: flags.benchmarkStale,
      negativeCashFlow: flags.negativeCashFlow,
      incompleteProfile: flags.incompleteProfile,
      needsAttention: flags.needsAttention,
    };
  });

  if (metrics.propertyCount === 0) {
    return (
      <>
        <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
        <div className="space-y-4">
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {emptyStateHeading}
            </h1>
            <p className="mt-2 text-sm text-muted">{emptyStateBody}</p>
            <DashboardEmptyStatePrimaryCta />
          </div>
          <DashboardEmptyStateSecondaryLinks />
        </div>
      </>
    );
  }

  return (
    <div>
      <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      {onboarding === "first-property" && (
        <div className="mt-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            Property added. Your portfolio is now live.
          </p>
          <p className="mt-1 text-sm text-muted">
            Great start. Add more details to your property to unlock full analytics.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {singleProperty && (
              <Link
                href={`/properties/${singleProperty.id}/edit`}
                className="inline-flex min-h-[44px] items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Complete property details
              </Link>
            )}
            <Link
              href="/analyze"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Analyze a deal
            </Link>
            <Link
              href={modelingHref}
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Run projections
            </Link>
            <Link
              href={mortgageHref}
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Simulate mortgage payoff
            </Link>
            <Link
              href="/properties/new"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Add another property
            </Link>
          </div>
        </div>
      )}
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/properties/new"
            className="inline-flex min-h-[44px] items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Add property
          </Link>
          <Link
            href="/analyze"
            className="inline-flex min-h-[44px] items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
          >
            Analyze a deal
          </Link>
        </div>
        {/* Desktop workspace links */}
        <div className="hidden flex-wrap gap-2 md:flex">
          <Link
            href={propertyHref}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
          >
            {singleProperty ? "Property" : "Properties"}
          </Link>
          <Link
            href={modelingHref}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
          >
            Modeling
          </Link>
          <Link
            href={mortgageHref}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
          >
            Mortgage
          </Link>
          <Link
            href="/export/portfolio-summary"
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
          >
            Print summary
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-subtle/30 p-2">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label={metrics.propertyCount > 1 ? "Total property value" : "Property value"}
          value={formatCurrency(metrics.totalMarketValue)}
          primary
          compact
          delta={trends.portfolio.valueDeltaMoM}
          deltaLabel={formatDeltaLabel(trends.portfolio.valueDeltaMoM)}
        />
        <MetricCard
          label={metrics.propertyCount > 1 ? "Total debt" : "Debt"}
          value={formatCurrency(metrics.totalDebt)}
          primary
          compact
        />
        <MetricCard
          label={metrics.propertyCount > 1 ? "Total equity" : "Equity"}
          value={formatCurrency(metrics.totalEquity)}
          primary
          compact
          delta={trends.portfolio.equityDeltaMoM}
          deltaLabel={formatDeltaLabel(trends.portfolio.equityDeltaMoM)}
        />
        <MetricCard
          label="Monthly cash flow"
          value={formatCurrency(metrics.totalMonthlyCashFlow)}
          cashFlow={metrics.totalMonthlyCashFlow}
          compact
          delta={trends.portfolio.cashFlowDeltaMoM}
          deltaLabel={formatDeltaLabel(trends.portfolio.cashFlowDeltaMoM)}
        />
        <div className="hidden md:flex md:flex-col">
          <MetricCard
            label={metrics.propertyCount > 1 ? "Portfolio cap rate" : "Cap rate"}
            value={
              metrics.weightedCapRate != null
                ? `${(metrics.weightedCapRate * 100).toFixed(2)}%`
                : "—"
            }
            compact
          />
        </div>
      </div>
      </div>

      <MobileCollapsible label="More metrics">
        <div className="mt-3 rounded-xl bg-subtle/30 p-2">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="md:hidden">
            <MetricCard
              label={metrics.propertyCount > 1 ? "Portfolio cap rate" : "Cap rate"}
              value={
                metrics.weightedCapRate != null
                  ? `${(metrics.weightedCapRate * 100).toFixed(2)}%`
                  : "—"
              }
              compact
            />
          </div>
          {metrics.portfolioLtv != null && (
            <MetricCard
              label={metrics.propertyCount > 1 ? "Portfolio LTV" : "LTV"}
              value={`${(metrics.portfolioLtv * 100).toFixed(1)}%`}
              primary={false}
              compact
              tone={
                metrics.portfolioLtv > 0.8
                  ? "negative"
                  : metrics.portfolioLtv > 0.7
                    ? "warning"
                    : undefined
              }
            />
          )}
          <MetricCard
            label="NOI"
            value={formatCurrency(metrics.totalNoi)}
            primary={false}
            compact
          />
          {metrics.portfolioCashOnCashReturn != null && (
            <MetricCard
              label="Cash-on-cash return"
              value={`${(metrics.portfolioCashOnCashReturn * 100).toFixed(2)}%`}
              primary={false}
              compact
            />
          )}
          <MetricCard
            label="Annual rent"
            value={formatCurrency(metrics.totalAnnualRent)}
            primary={false}
            compact
          />
          {metrics.dscr != null && (
            <MetricCard
              label="DSCR"
              value={metrics.dscr.toFixed(2)}
              primary={false}
              compact
              tone={
                metrics.dscr < 1
                  ? "negative"
                  : metrics.dscr < 1.2
                    ? "warning"
                    : "positive"
              }
            />
          )}
        </div>
        </div>
      </MobileCollapsible>
      <div className="mt-2">
        <MetricHelpLink />
      </div>

      {trends.portfolio.equitySeries.length >= 2 && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Portfolio trend</h2>
              <p className="text-sm text-muted">
                Snapshot-based view of how your equity changed over time.
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendDirectionIcon value={trends.portfolio.equityDeltaSinceFirst} />
              <span className="font-medium text-foreground tabular-nums">
                {formatDeltaLabel(trends.portfolio.equityDeltaSinceFirst)?.replace(
                  " vs last month",
                  " since first snapshot"
                ) ?? "No change since first snapshot"}
              </span>
            </div>
          </div>
          <EquitySparkline
            values={trends.portfolio.equitySeries}
            labels={trends.portfolio.monthLabels}
          />
        </div>
      )}

      {metrics.propertyCount >= 6 ? (
        <PortfolioOverviewSection
          rows={tableRows}
          chartData={chartData}
          propertyCount={metrics.propertyCount}
        />
      ) : (
        <>
          {metrics.propertyCount > 1 && (
            <RentVsMarketSection
              properties={properties.map((p) => ({
                id: p.id,
                nickname: p.nickname,
                addressLine1: p.addressLine1,
                marketRent: p.marketRent != null ? Number(p.marketRent) : null,
                marketRentAsOf: p.marketRentAsOf?.toISOString() ?? null,
                currentMonthlyRent: Number(p.currentMonthlyRent),
                unitRents: p.unitRents,
                isRented: p.isRented,
              }))}
            />
          )}
          <DashboardCharts
            data={chartData}
            propertyCount={metrics.propertyCount}
            singlePropertyId={metrics.propertyCount === 1 ? properties[0]?.id : undefined}
            singlePropertyEquityDeltaMoM={
              metrics.propertyCount === 1 && properties[0]
                ? trends.propertyEquityDeltaMoM[properties[0].id] ?? null
                : null
            }
            singlePropertyMetrics={
              metrics.propertyCount === 1
                ? {
                    weightedCapRate: metrics.weightedCapRate,
                    portfolioLtv: metrics.portfolioLtv,
                    totalNoi: metrics.totalNoi,
                    portfolioCashOnCashReturn: metrics.portfolioCashOnCashReturn,
                    totalAnnualRent: metrics.totalAnnualRent,
                    dscr: metrics.dscr,
                  }
                : undefined
            }
            benchmark={
              metrics.propertyCount === 1 && properties[0]
                ? (() => {
                    const p = properties[0];
                    const userRent = getPropertyTotalRent(p);
                    const marketRentNullable =
                      p.marketRent != null ? Number(p.marketRent) : null;
                    const eligibility = getBenchmarkEligibility({
                      isRented: p.isRented,
                      userRent,
                      marketRent: marketRentNullable,
                      marketRentAsOf: p.marketRentAsOf,
                    });
                    if (eligibility === "eligible_fresh") {
                      return {
                        benchmarkLabel: getBenchmarkLabel(
                          userRent,
                          marketRentNullable ?? 0
                        ),
                      };
                    }
                    if (eligibility === "not_rented") {
                      return { benchmarkMessage: BENCHMARK_UX_MESSAGES.notRented };
                    }
                    if (eligibility === "rent_missing") {
                      return { benchmarkMessage: BENCHMARK_UX_MESSAGES.rentMissing };
                    }
                    return { propertyId: p.id };
                  })()
                : undefined
            }
          />
        </>
      )}

      {metrics.propertyCount === 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-foreground">
              Ready to compare performance side by side?
            </p>
            <p className="text-sm text-muted">
              Add another property to unlock portfolio comparison charts.
            </p>
          </div>
          <Link
            href="/properties/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add property
          </Link>
        </div>
      )}
    </div>
  );
}
