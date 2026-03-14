import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  computePortfolioMetrics,
  type PortfolioPropertyInput,
} from "@/lib/metrics/portfolio-metrics";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function MetricCard({
  label,
  value,
  primary = true,
  cashFlow,
}: {
  label: string;
  value: string;
  primary?: boolean;
  cashFlow?: number;
}) {
  const valueClassName =
    cashFlow !== undefined
      ? `text-xl font-semibold ${cashFlow >= 0 ? "text-positive" : "text-negative"}`
      : primary
        ? "text-xl font-semibold text-foreground"
        : "text-lg font-medium text-foreground";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className={`mt-1 ${valueClassName}`}>{value}</dd>
    </div>
  );
}

function PropertyTypeBadge({
  propertyType,
  units,
}: {
  propertyType: string;
  units: number;
}) {
  const label =
    propertyType === "multi_family"
      ? `Multi family (${units} units)`
      : "Single family";
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-subtle px-2 py-0.5 text-xs font-medium text-muted">
      {label}
    </span>
  );
}

export default async function PropertiesPage() {
  const user = await getAppUser();
  if (!user) return null;

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
    orderBy: { createdAt: "desc" },
  });

  type PropertyWithMortgages = (typeof properties)[number];
  const portfolioInput: PortfolioPropertyInput[] = properties.map(
    (p: PropertyWithMortgages) => {
      const totalMortgageBalance = p.mortgages.reduce(
        (sum: number, m: { currentBalance: unknown }) =>
          sum + Number(m.currentBalance),
        0
      );
      const totalMonthlyPayment = p.mortgages.reduce(
        (sum: number, m: { monthlyPayment: unknown }) =>
          sum + Number(m.monthlyPayment),
        0
      );
      return {
        id: p.id,
        monthlyRent: Number(p.currentMonthlyRent),
        monthlyExpenses: Number(p.currentMonthlyExpenses),
        estimatedValue: Number(p.currentEstimatedValue),
        cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
        totalMortgageBalance,
        totalMonthlyPayment,
        ownershipPercent: p.ownershipPercent ?? 100,
      };
    }
  );

  const portfolioMetrics = computePortfolioMetrics(portfolioInput);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Properties</h1>
        <Link
          href="/properties/new"
          className="w-fit rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Add property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-medium text-foreground">
            No properties yet
          </h2>
          <p className="mt-2 text-base text-muted">
            Add your first property to start tracking value, equity, cash flow,
            and more.
          </p>
          <Link
            href="/properties/new"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <>
          {properties.length >= 1 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                label="Total value"
                value={formatCurrency(portfolioMetrics.totalMarketValue)}
                primary
              />
              <MetricCard
                label="Total equity"
                value={formatCurrency(portfolioMetrics.totalEquity)}
                primary
              />
              <MetricCard
                label="Monthly cash flow"
                value={formatCurrency(portfolioMetrics.totalMonthlyCashFlow)}
                cashFlow={portfolioMetrics.totalMonthlyCashFlow}
              />
            </div>
          )}

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((p: PropertyWithMortgages) => {
              const totalMortgageBalance = p.mortgages.reduce(
                (sum: number, m: { currentBalance: unknown }) =>
                  sum + Number(m.currentBalance),
                0
              );
              const totalMonthlyPayment = p.mortgages.reduce(
                (sum: number, m: { monthlyPayment: unknown }) =>
                  sum + Number(m.monthlyPayment),
                0
              );
              const metrics = computePropertyMetrics({
                monthlyRent: Number(p.currentMonthlyRent),
                monthlyExpenses: Number(p.currentMonthlyExpenses),
                estimatedValue: Number(p.currentEstimatedValue),
                cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
                totalMortgageBalance,
                totalMonthlyPayment,
                ownershipPercent: p.ownershipPercent ?? 100,
              });
              return (
                <li key={p.id}>
                  <Link
                    href={`/properties/${p.id}`}
                    className="block rounded-lg border border-border bg-card p-4 transition hover:bg-subtle"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-foreground">
                        {p.nickname || p.addressLine1}
                      </div>
                      <PropertyTypeBadge
                        propertyType={p.propertyType}
                        units={p.units}
                      />
                    </div>
                    <div className="mt-1 text-base text-muted">
                      {p.addressLine1}
                      {p.city && `, ${p.city} ${p.state} ${p.zipCode}`}
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <dt className="font-medium text-muted">Value</dt>
                        <dd className="font-medium text-foreground">
                          {formatCurrency(Number(p.currentEstimatedValue))}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted">Equity</dt>
                        <dd className="font-medium text-foreground">
                          {formatCurrency(metrics.equity)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted">Cash flow</dt>
                        <dd
                          className={`font-medium ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
                        >
                          {formatCurrency(metrics.monthlyCashFlow)}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
