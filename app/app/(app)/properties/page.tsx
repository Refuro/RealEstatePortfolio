import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { BenchmarkRefreshButton } from "./benchmark-refresh-button";
import { formatCurrency } from "@/lib/format-currency";
import { MetricCard } from "@/components/metric-card";
import { prisma } from "@/lib/db";
import { getPropertyLimit, getEffectiveTier } from "@/lib/plans";
import { takeFirstNByUpdatedAt } from "@/lib/limit-utils";
import { getPropertyTotalRent, formatPropertyType } from "@/lib/property-utils";
import { formatTimeAgo, isDataStale } from "@/lib/date-utils";
import {
  isBenchmarkFresh,
  getBenchmarkLabel,
} from "@/lib/benchmark-utils";
import { getEffectiveBalance } from "@/lib/amortization";
import {
  computePortfolioMetrics,
  type PortfolioPropertyInput,
} from "@/lib/metrics/portfolio-metrics";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

function BenchmarkLine({
  propertyId,
  userRent,
  marketRent,
  marketRentAsOf,
}: {
  propertyId: string;
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | null;
}) {
  if (marketRent == null || marketRent <= 0) {
    return (
      <div className="mt-3">
        <BenchmarkRefreshButton propertyId={propertyId} label="Refresh estimate" />
      </div>
    );
  }
  const fresh = isBenchmarkFresh(marketRentAsOf);
  if (fresh) {
    return (
      <p className="mt-3 text-sm text-muted">
        {getBenchmarkLabel(userRent, marketRent)}
      </p>
    );
  }
  return (
    <div className="mt-3">
      <BenchmarkRefreshButton propertyId={propertyId} label="Refresh estimate" />
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
  const label = formatPropertyType(propertyType, units);
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-subtle px-2 py-0.5 text-xs font-medium text-muted">
      {label}
    </span>
  );
}

export default async function PropertiesPage() {
  const user = await getAppUser();
  if (!user) return null;

  const allProperties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
  });

  const propertyLimit = getPropertyLimit(getEffectiveTier(user));
  const properties = takeFirstNByUpdatedAt(allProperties, propertyLimit);
  const totalCount = allProperties.length;
  const overLimit = totalCount > propertyLimit;

  type PropertyWithMortgages = (typeof properties)[number];
  const portfolioInput: PortfolioPropertyInput[] = properties.map(
    (p: PropertyWithMortgages) => {
      const totalMortgageBalance = p.mortgages.reduce(
        (sum: number, m) => sum + getEffectiveBalance(m),
        0
      );
      const totalMonthlyPayment = p.mortgages.reduce(
        (sum: number, m: { monthlyPayment: unknown }) =>
          sum + Number(m.monthlyPayment),
        0
      );
      return {
        id: p.id,
        monthlyRent: getPropertyTotalRent(p),
        monthlyExpenses: Number(p.currentMonthlyExpenses),
        estimatedValue: Number(p.currentEstimatedValue),
        cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
        totalMortgageBalance,
        totalMonthlyPayment,
        ownershipPercent: p.ownershipPercent ?? 100,
        vacancyPercent: p.vacancyPercent ?? 5,
      };
    }
  );

  const displayMode = (user.ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability";
  const portfolioMetrics = computePortfolioMetrics(portfolioInput, displayMode);

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
          {overLimit && (
            <p className="mb-4 text-sm text-muted">
              Showing {properties.length} of {totalCount} properties (plan limit).{" "}
              <Link href="/plans" className="font-medium text-foreground hover:underline">
                Upgrade to see all
              </Link>
            </p>
          )}
          {properties.length >= 1 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                label="Total value"
                value={formatCurrency(portfolioMetrics.totalMarketValue)}
                primary
                compact
              />
              <MetricCard
                label="Total equity"
                value={formatCurrency(portfolioMetrics.totalEquity)}
                primary
                compact
              />
              <MetricCard
                label="Monthly cash flow"
                value={formatCurrency(portfolioMetrics.totalMonthlyCashFlow)}
                cashFlow={portfolioMetrics.totalMonthlyCashFlow}
                compact
              />
            </div>
          )}

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((p: PropertyWithMortgages) => {
              const totalMortgageBalance = p.mortgages.reduce(
                (sum: number, m) => sum + getEffectiveBalance(m),
                0
              );
              const totalMonthlyPayment = p.mortgages.reduce(
                (sum: number, m: { monthlyPayment: unknown }) =>
                  sum + Number(m.monthlyPayment),
                0
              );
              const metrics = computePropertyMetrics(
                {
                  monthlyRent: getPropertyTotalRent(p),
                  monthlyExpenses: Number(p.currentMonthlyExpenses),
                  estimatedValue: Number(p.currentEstimatedValue),
                  cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
                  totalMortgageBalance,
                  totalMonthlyPayment,
                  ownershipPercent: p.ownershipPercent ?? 100,
                  vacancyPercent: p.vacancyPercent ?? 5,
                },
                displayMode
              );
              return (
                <li key={p.id}>
                  <div className="rounded-lg border border-border bg-card p-4 transition hover:bg-subtle">
                    <Link href={`/properties/${p.id}`} className="block">
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
                      <p className="mt-1 text-xs text-muted">
                        Updated {formatTimeAgo(p.updatedAt)}
                        {isDataStale(p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt)) && (
                          <span className="ml-1">· Consider updating</span>
                        )}
                      </p>
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
                    <BenchmarkLine
                      propertyId={p.id}
                      userRent={getPropertyTotalRent(p)}
                      marketRent={
                        p.marketRent != null ? Number(p.marketRent) : null
                      }
                      marketRentAsOf={p.marketRentAsOf}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
