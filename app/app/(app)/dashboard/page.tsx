import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format-currency";
import { MetricCard } from "@/components/metric-card";
import { prisma } from "@/lib/db";
import { getPropertyLimit, getEffectiveTier } from "@/lib/plans";
import { takeFirstNByUpdatedAt } from "@/lib/limit-utils";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { getEffectiveBalance } from "@/lib/amortization";
import {
  isBenchmarkFresh,
  getBenchmarkLabel,
} from "@/lib/benchmark-utils";
import {
  computePortfolioMetrics,
  type PortfolioPropertyInput,
} from "@/lib/metrics/portfolio-metrics";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { DashboardCharts, type DashboardChartData } from "./dashboard-charts";
import { MetricHelpLink } from "./metric-help-link";
import { RentVsMarketSection } from "./rent-vs-market-section";

export default async function DashboardPage() {
  const user = await getAppUser();
  if (!user) return null;

  const allProperties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
  });

  const propertyLimit = getPropertyLimit(getEffectiveTier(user));
  const properties = takeFirstNByUpdatedAt(allProperties, propertyLimit);

  type PropertyWithMortgages = (typeof properties)[number];
  const portfolioInput = properties.map((p: PropertyWithMortgages) => {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum: number, m) => sum + getEffectiveBalance(m),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
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

  const displayMode = (user.ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability";
  const metrics = computePortfolioMetrics(portfolioInput, displayMode);

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
      <div>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Veld
          </h1>
          <p className="mt-2 text-base text-muted">
            Track your rental properties and see equity, cash flow, and more at a
            glance.
          </p>
          <Link
            href="/properties/new"
            className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add your first property
          </Link>
          <p className="mt-4 text-sm text-muted">
            Have a spreadsheet?{" "}
            <Link href="/settings#export" className="font-medium text-foreground hover:underline">
              Import from CSV
            </Link>{" "}
            in Settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <div className="mt-2 space-y-1">
        <p className="text-base text-muted">
          Portfolio summary across {metrics.propertyCount} propert{metrics.propertyCount === 1 ? "y" : "ies"}.
        </p>
        <div>
          <MetricHelpLink />
        </div>
      </div>

      {metrics.propertyCount > 1 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <MetricCard
            label="Total property value"
            value={formatCurrency(metrics.totalMarketValue)}
            primary
          />
          <MetricCard
            label="Total debt"
            value={formatCurrency(metrics.totalDebt)}
            primary
          />
          <MetricCard
            label="Total equity"
            value={formatCurrency(metrics.totalEquity)}
            primary
          />
          <MetricCard
            label="Monthly cash flow"
            value={formatCurrency(metrics.totalMonthlyCashFlow)}
            cashFlow={metrics.totalMonthlyCashFlow}
          />
          {metrics.weightedCapRate != null && (
            <MetricCard
              label="Portfolio cap rate"
              value={`${(metrics.weightedCapRate * 100).toFixed(2)}%`}
              primary={false}
            />
          )}
          {metrics.portfolioLtv != null && (
            <MetricCard
              label="Portfolio LTV"
              value={`${(metrics.portfolioLtv * 100).toFixed(1)}%`}
              primary={false}
            />
          )}
          <MetricCard
            label="NOI (Net Operating Income)"
            value={formatCurrency(metrics.totalNoi)}
            primary={false}
          />
          {metrics.portfolioCashOnCashReturn != null && (
            <MetricCard
              label="Cash-on-cash return"
              value={`${(metrics.portfolioCashOnCashReturn * 100).toFixed(2)}%`}
              primary={false}
            />
          )}
          <MetricCard
            label="Annual rent"
            value={formatCurrency(metrics.totalAnnualRent)}
            primary={false}
          />
          {metrics.dscr != null && (
            <MetricCard
              label="DSCR"
              value={metrics.dscr.toFixed(2)}
              primary={false}
              cashFlow={metrics.dscr >= 1 ? 1 : -1}
            />
          )}
        </div>
      )}

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
                const marketRent =
                  p.marketRent != null ? Number(p.marketRent) : 0;
                const fresh =
                  marketRent > 0 && isBenchmarkFresh(p.marketRentAsOf);
                if (fresh) {
                  return {
                    benchmarkLabel: getBenchmarkLabel(userRent, marketRent),
                  };
                }
                return {
                  propertyId: p.id,
                };
              })()
            : undefined
        }
      />

      {metrics.propertyCount === 1 && (
        <>
          <div className="mt-6 rounded-lg border border-border bg-card p-5">
            <p className="text-base text-muted">
              Add another property to see equity, debt, and cash flow charts
              side by side.
            </p>
            <Link
              href="/properties/new"
              className="mt-3 inline-block rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Add property
            </Link>
          </div>

          {properties[0] && (
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted">
                More on your property page: Amortization schedule, scenario
                modeling, rent vs. market details, and more.
              </p>
              <Link
                href={`/properties/${properties[0].id}`}
                className="mt-2 inline-block font-medium text-foreground hover:underline"
              >
                See amortization, scenarios & more →
              </Link>
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted">
          Quick actions
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {metrics.propertyCount === 1 && properties[0] ? (
            <Link
              href={`/properties/${properties[0].id}`}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-base font-medium hover:bg-subtle"
            >
              View property
            </Link>
          ) : (
            <Link
              href="/properties"
              className="rounded-md border border-border bg-transparent px-4 py-2 text-base font-medium hover:bg-subtle"
            >
              View all properties
            </Link>
          )}
          <Link
            href="/properties/new"
            className="rounded-md border border-border bg-transparent px-4 py-2 text-base font-medium hover:bg-subtle"
          >
            Add property
          </Link>
          <Link
            href="/analyze"
            className="rounded-md border border-border bg-transparent px-4 py-2 text-base font-medium hover:bg-subtle"
          >
            Analyze a deal
          </Link>
        </div>
      </div>
    </div>
  );
}
