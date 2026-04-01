import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format-currency";
import { MetricCard } from "@/components/metric-card";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { getEffectiveBalance } from "@/lib/amortization";
import { buildDashboardPortfolioPayload } from "@/lib/server/portfolio-summary-payload";
import {
  BENCHMARK_UX_MESSAGES,
  getBenchmarkEligibility,
  getBenchmarkLabel,
} from "@/lib/benchmark-utils";
import { type PortfolioPropertyInput } from "@/lib/metrics/portfolio-metrics";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { DashboardCharts, type DashboardChartData } from "./dashboard-charts";
import { MetricHelpLink } from "./metric-help-link";
import { RentVsMarketSection } from "./rent-vs-market-section";
import { WorkspaceNavMobile } from "./workspace-nav-mobile";
import { PaidIntentCheckoutBanner } from "@/components/growth/paid-intent-checkout-banner";

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
  const singleProperty = metrics.propertyCount === 1 ? properties[0] : null;
  const propertyHref = singleProperty ? `/properties/${singleProperty.id}` : "/properties";
  const modelingHref = singleProperty
    ? `/modeling?propertyId=${encodeURIComponent(singleProperty.id)}`
    : "/modeling";
  const mortgageHref = singleProperty
    ? `/mortgage?propertyId=${encodeURIComponent(singleProperty.id)}`
    : "/mortgage";

  type PortfolioInputItem = PortfolioPropertyInput & { name: string };
  const fullLiability = displayMode === "full_liability";
  // Chart data from same metrics engine — use displayMode for consistency
  const chartData: DashboardChartData = {
    equity: portfolioInput.map((p: PortfolioInputItem) => {
      const m = computePropertyMetrics(p, displayMode);
      return { name: p.name, equity: m.equity, propertyId: p.id };
    }),
    debtVsValue: portfolioInput.map((p: PortfolioInputItem) => {
      const scale = (p.ownershipPercent ?? 100) / 100;
      return {
        name: p.name,
        value: p.estimatedValue * scale,
        debt: fullLiability ? p.totalMortgageBalance : p.totalMortgageBalance * scale,
        propertyId: p.id,
      };
    }),
    cashFlow: portfolioInput.map((p: PortfolioInputItem) => {
      const m = computePropertyMetrics(p, displayMode);
      return {
        name: p.name,
        monthlyCashFlow: m.monthlyCashFlow,
        propertyId: p.id,
      };
    }),
  };

  if (metrics.propertyCount === 0) {
    return (
      <>
        <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
        <div>
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome to Veld
            </h1>
            <p className="mt-2 text-base text-muted">
              Start with a property to unlock your dashboard — equity, cash flow, and benchmarks in
              one place.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/properties/new"
                className="rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Add your first property
              </Link>
            </div>
            <details className="group mt-6 text-left">
              <summary className="cursor-pointer list-none text-center text-sm text-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
                <span className="underline decoration-border underline-offset-4">More ways to get started</span>
              </summary>
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/analyze"
                  className="rounded-md border border-border px-4 py-2 text-base font-medium text-foreground hover:bg-subtle"
                >
                  Analyze a deal
                </Link>
              </div>
              <p className="mt-3 text-center text-sm text-muted">
                Have a spreadsheet?{" "}
                <Link href="/settings#export" className="font-medium text-foreground hover:underline">
                  Import from CSV
                </Link>{" "}
                in Settings.
              </p>
            </details>
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      {onboarding === "first-property" && (
        <div className="mt-3 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            Property added. Your portfolio is now live.
          </p>
          <p className="mt-1 text-sm text-muted">
            Great start. Here are some things to try next:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/analyze"
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Analyze a deal
            </Link>
            <Link
              href={modelingHref}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Run projections
            </Link>
            <Link
              href={mortgageHref}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Simulate mortgage payoff
            </Link>
            <Link
              href="/properties/new"
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Add another property
            </Link>
          </div>
        </div>
      )}
      <div className="mt-4 rounded-xl border border-border/70 bg-card/95 p-3 shadow-sm md:p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              Portfolio summary across {metrics.propertyCount} propert{metrics.propertyCount === 1 ? "y" : "ies"}.
            </p>
            <div className="mt-1">
              <MetricHelpLink />
            </div>
          </div>
          {/* Desktop: individual workspace buttons */}
          <div className="hidden flex-wrap gap-2 md:flex">
            <Link
              href={propertyHref}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              {singleProperty ? "Property" : "Properties"}
            </Link>
            <Link
              href={modelingHref}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Modeling
            </Link>
            <Link
              href={mortgageHref}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Mortgage
            </Link>
            <Link
              href="/export/portfolio-summary"
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Print portfolio summary
            </Link>
          </div>
        </div>
        {/* Mobile: compact workspace dropdown */}
        <div className="mt-3 md:hidden">
          <WorkspaceNavMobile
            propertyHref={propertyHref}
            propertyLabel={singleProperty ? "Property" : "Properties"}
            modelingHref={modelingHref}
            mortgageHref={mortgageHref}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/properties/new"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add property
          </Link>
          <Link
            href="/analyze"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
          >
            Analyze a deal
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label={metrics.propertyCount > 1 ? "Total property value" : "Property value"}
          value={formatCurrency(metrics.totalMarketValue)}
          primary
          compact
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
        />
        <MetricCard
          label="Monthly cash flow"
          value={formatCurrency(metrics.totalMonthlyCashFlow)}
          cashFlow={metrics.totalMonthlyCashFlow}
          compact
        />
        <div className="hidden md:block">
          <MetricCard
            label={metrics.propertyCount > 1 ? "Portfolio cap rate" : "Cap rate"}
            value={
              metrics.weightedCapRate != null
                ? `${(metrics.weightedCapRate * 100).toFixed(2)}%`
                : "—"
            }
            primary={false}
            compact
          />
        </div>
      </div>

      <MobileCollapsible label="More metrics">
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
          <div className="md:hidden">
            <MetricCard
              label={metrics.propertyCount > 1 ? "Portfolio cap rate" : "Cap rate"}
              value={
                metrics.weightedCapRate != null
                  ? `${(metrics.weightedCapRate * 100).toFixed(2)}%`
                  : "—"
              }
              primary={false}
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
      </MobileCollapsible>

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

      {metrics.propertyCount === 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
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
