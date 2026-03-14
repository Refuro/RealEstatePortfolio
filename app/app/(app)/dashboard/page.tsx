import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  computePortfolioMetrics,
  type PortfolioPropertyInput,
} from "@/lib/metrics/portfolio-metrics";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { DashboardCharts, type DashboardChartData } from "./dashboard-charts";

export default async function DashboardPage() {
  const user = await getAppUser();
  if (!user) return null;

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
  });

  type PropertyWithMortgages = (typeof properties)[number];
  const portfolioInput = properties.map((p: PropertyWithMortgages) => {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum: number, m: { currentBalance: unknown }) => sum + Number(m.currentBalance),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
      0
    );
    return {
      id: p.id,
      name: p.nickname || p.addressLine1 || "Property",
      monthlyRent: Number(p.currentMonthlyRent),
      monthlyExpenses: Number(p.currentMonthlyExpenses),
      estimatedValue: Number(p.currentEstimatedValue),
      cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
    };
  });

  const metrics = computePortfolioMetrics(portfolioInput);

  type PortfolioInputItem = PortfolioPropertyInput & { name: string };
  // Chart data from same metrics engine (Module I — data must match metrics engine)
  const chartData: DashboardChartData = {
    equity: portfolioInput.map((p: PortfolioInputItem) => {
      const m = computePropertyMetrics(p);
      return { name: p.name, equity: m.equity, propertyId: p.id };
    }),
    debtVsValue: portfolioInput.map((p: PortfolioInputItem) => ({
      name: p.name,
      value: p.estimatedValue,
      debt: p.totalMortgageBalance,
      propertyId: p.id,
    })),
    cashFlow: portfolioInput.map((p: PortfolioInputItem) => {
      const m = computePropertyMetrics(p);
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
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-2 text-zinc-600">
          Your portfolio summary will appear here once you add properties.
        </p>
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-zinc-900">No properties yet</h2>
          <p className="mt-2 text-zinc-600">
            Add your first property to see total value, equity, cash flow, and more.
          </p>
          <Link
            href="/properties/new"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add your first property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-2 text-zinc-600">
        Portfolio summary across {metrics.propertyCount} propert{metrics.propertyCount === 1 ? "y" : "ies"}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total property value"
          value={formatCurrency(metrics.totalMarketValue)}
        />
        <MetricCard
          label="Total debt"
          value={formatCurrency(metrics.totalDebt)}
        />
        <MetricCard
          label="Total equity"
          value={formatCurrency(metrics.totalEquity)}
        />
        <MetricCard
          label="Monthly cash flow"
          value={formatCurrency(metrics.totalMonthlyCashFlow)}
          valueClassName={metrics.totalMonthlyCashFlow >= 0 ? "text-emerald-700" : "text-red-700"}
        />
        {metrics.weightedCapRate != null && (
          <MetricCard
            label="Portfolio cap rate"
            value={`${(metrics.weightedCapRate * 100).toFixed(2)}%`}
          />
        )}
        {metrics.portfolioLtv != null && (
          <MetricCard
            label="Portfolio LTV"
            value={`${(metrics.portfolioLtv * 100).toFixed(1)}%`}
          />
        )}
      </div>

      <DashboardCharts data={chartData} />

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Quick actions
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/properties/new"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Add property
          </Link>
          <Link
            href="/properties"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            View all properties
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClassName = "text-zinc-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className={`mt-1 text-xl font-semibold ${valueClassName}`}>{value}</dd>
    </div>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
