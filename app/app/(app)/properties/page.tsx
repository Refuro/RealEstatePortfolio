import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { BenchmarkRefreshButton } from "./benchmark-refresh-button";
import { formatCurrency } from "@/lib/format-currency";
import { MetricCard } from "@/components/metric-card";
import { prisma } from "@/lib/db";
import { getPropertyLimit, getEffectiveTier } from "@/lib/plans";
import { getPropertyTotalRent, formatPropertyType } from "@/lib/property-utils";
import { formatTimeAgo, isDataStale } from "@/lib/date-utils";
import {
  BENCHMARK_UX_MESSAGES,
  getBenchmarkEligibility,
  getBenchmarkLabel,
  getBenchmarkTone,
} from "@/lib/benchmark-utils";
import { getEffectiveBalance } from "@/lib/amortization";
import {
  computePortfolioMetrics,
  type PortfolioPropertyInput,
} from "@/lib/metrics/portfolio-metrics";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { PropertiesFiltersMobile } from "./properties-filters-mobile";

function BenchmarkLine({
  propertyId,
  userRent,
  isRented,
  marketRent,
  marketRentAsOf,
}: {
  propertyId: string;
  userRent: number;
  isRented: boolean;
  marketRent: number | null;
  marketRentAsOf: Date | null;
}) {
  const eligibility = getBenchmarkEligibility({
    isRented,
    userRent,
    marketRent,
    marketRentAsOf,
  });
  if (eligibility === "not_rented") {
    return (
      <p className="text-sm text-muted">{BENCHMARK_UX_MESSAGES.notRented}</p>
    );
  }
  if (eligibility === "rent_missing") {
    return (
      <p className="text-sm text-muted">{BENCHMARK_UX_MESSAGES.rentMissing}</p>
    );
  }
  if (eligibility === "benchmark_missing") {
    return <BenchmarkRefreshButton propertyId={propertyId} label="Refresh estimate" />;
  }
  if (eligibility === "eligible_fresh" && marketRent != null) {
    const tone = getBenchmarkTone(userRent, marketRent);
    const colorClass =
      tone === "positive"
        ? "text-positive"
        : tone === "negative"
          ? "text-negative"
          : "text-muted";
    return <p className={`text-sm ${colorClass}`}>{getBenchmarkLabel(userRent, marketRent)}</p>;
  }
  return <BenchmarkRefreshButton propertyId={propertyId} label="Refresh estimate" />;
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

function InsightTag({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "negative";
}) {
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
        tone === "negative"
          ? "border-negative/40 bg-negative/10 text-negative"
          : "border-border bg-subtle text-muted"
      }`}
    >
      {label}
    </span>
  );
}

type PropertiesFilter =
  | "all"
  | "needs_attention"
  | "no_mortgage"
  | "stale_benchmark"
  | "negative_cashflow";
type PropertiesSort = "updated" | "worst_cashflow";

const FILTER_OPTIONS: { key: PropertiesFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_attention", label: "Needs attention" },
  { key: "no_mortgage", label: "No mortgage" },
  { key: "stale_benchmark", label: "Stale benchmark" },
  { key: "negative_cashflow", label: "Negative cash flow" },
];

const SORT_OPTIONS: { key: PropertiesSort; label: string }[] = [
  { key: "updated", label: "Recently updated" },
  { key: "worst_cashflow", label: "Worst cash flow" },
];

function buildPropertiesHref(filter: PropertiesFilter, sort: PropertiesSort): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (sort !== "updated") params.set("sort", sort);
  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;
  const { filter, sort } = await searchParams;

  const propertyLimit = getPropertyLimit(getEffectiveTier(user));
  const [totalCount, properties] = await Promise.all([
    prisma.property.count({ where: { userId: user.id } }),
    prisma.property.findMany({
      where: { userId: user.id },
      include: { mortgages: true },
      orderBy: { updatedAt: "desc" },
      take: propertyLimit,
    }),
  ]);
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
  const activeFilter: PropertiesFilter =
    filter && FILTER_OPTIONS.some((option) => option.key === filter as PropertiesFilter)
      ? (filter as PropertiesFilter)
      : "all";
  const activeSort: PropertiesSort =
    sort && SORT_OPTIONS.some((option) => option.key === sort as PropertiesSort)
      ? (sort as PropertiesSort)
      : "updated";

  const propertyCards = properties.map((p: PropertyWithMortgages) => {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum: number, m) => sum + getEffectiveBalance(m),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
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
    const benchmarkEligibility = getBenchmarkEligibility({
      isRented: p.isRented,
      userRent: getPropertyTotalRent(p),
      marketRent: p.marketRent != null ? Number(p.marketRent) : null,
      marketRentAsOf: p.marketRentAsOf,
    });
    const benchmarkStale =
      benchmarkEligibility === "benchmark_missing" ||
      benchmarkEligibility === "benchmark_stale";
    const noMortgage = p.mortgages.length === 0;
    const negativeCashFlow = metrics.monthlyCashFlow < 0;
    const needsAttention = noMortgage || benchmarkStale || negativeCashFlow;

    return {
      property: p,
      metrics,
      userRent: getPropertyTotalRent(p),
      noMortgage,
      benchmarkStale,
      negativeCashFlow,
      needsAttention,
    };
  });

  const filteredCards = propertyCards.filter((card) => {
    switch (activeFilter) {
      case "needs_attention":
        return card.needsAttention;
      case "no_mortgage":
        return card.noMortgage;
      case "stale_benchmark":
        return card.benchmarkStale;
      case "negative_cashflow":
        return card.negativeCashFlow;
      default:
        return true;
    }
  });

  const sortedCards =
    activeSort === "worst_cashflow"
      ? [...filteredCards].sort((a, b) => a.metrics.monthlyCashFlow - b.metrics.monthlyCashFlow)
      : filteredCards;
  const singlePropertyMode = properties.length === 1;
  const visibleCards = singlePropertyMode ? propertyCards : sortedCards;

  return (
    <div>
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Properties</h1>
          <Link
            href="/properties/new"
            className="w-fit rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add property
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/modeling"
            className="rounded-md border border-border bg-transparent px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
          >
            Open Modeling workspace
          </Link>
          <Link
            href="/mortgage"
            className="rounded-md border border-border bg-transparent px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
          >
            Open Mortgage workspace
          </Link>
        </div>
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
          {!singlePropertyMode && (
            <div className="mb-5 rounded-lg border border-border bg-card p-3">
              <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Portfolio view
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {visibleCards.length} {visibleCards.length === 1 ? "property" : "properties"} shown
                  </p>
                </div>
                {(activeFilter !== "all" || activeSort !== "updated") && (
                  <Link
                    href="/properties"
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-subtle"
                  >
                    Reset
                  </Link>
                )}
              </div>
              <PropertiesFiltersMobile
                activeFilter={activeFilter}
                activeSort={activeSort}
                filterOptions={FILTER_OPTIONS}
                sortOptions={SORT_OPTIONS}
              />
              <div className="hidden items-center gap-2 overflow-x-auto md:flex">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">Filter</span>
                {FILTER_OPTIONS.map((option) => {
                  const active = activeFilter === option.key;
                  return (
                    <Link
                      key={option.key}
                      href={buildPropertiesHref(option.key, activeSort)}
                      className={`shrink-0 rounded-md border px-2.5 py-1 text-sm transition ${
                        active
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-background text-muted hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-2 hidden items-center gap-2 overflow-x-auto md:flex">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">Sort</span>
                {SORT_OPTIONS.map((option) => {
                  const active = activeSort === option.key;
                  return (
                    <Link
                      key={option.key}
                      href={buildPropertiesHref(activeFilter, option.key)}
                      className={`shrink-0 rounded-md border px-2.5 py-1 text-sm transition ${
                        active
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-background text-muted hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {!singlePropertyMode && properties.length >= 1 && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
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
              <div className="col-span-2 lg:col-span-1">
                <MetricCard
                  label="Monthly cash flow"
                  value={formatCurrency(portfolioMetrics.totalMonthlyCashFlow)}
                  cashFlow={portfolioMetrics.totalMonthlyCashFlow}
                  compact
                />
              </div>
            </div>
          )}
          {!singlePropertyMode && visibleCards.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h2 className="text-lg font-medium text-foreground">No properties match this view</h2>
              <p className="mt-2 text-base text-muted">
                Try changing filters to see more properties.
              </p>
              <Link
                href={buildPropertiesHref("all", activeSort)}
                className="mt-4 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-subtle"
              >
                Clear filters
              </Link>
            </div>
          ) : singlePropertyMode && visibleCards.length === 1 ? (
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
              {(() => {
                const card = visibleCards[0];
                const p = card.property;
                const metrics = card.metrics;
                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {p.nickname || p.addressLine1}
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                          {p.addressLine1}
                          {p.city && `, ${p.city} ${p.state} ${p.zipCode}`}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Updated {formatTimeAgo(p.updatedAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <PropertyTypeBadge propertyType={p.propertyType} units={p.units} />
                        {card.noMortgage && <InsightTag label="No mortgage" />}
                        {card.benchmarkStale && <InsightTag label="Benchmark stale" />}
                        {card.negativeCashFlow && (
                          <InsightTag label="Negative cash flow" tone="negative" />
                        )}
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-md border border-border/70 bg-background/50 px-3 py-2">
                        <dt className="text-xs font-medium text-muted">Value</dt>
                        <dd className="mt-1 text-lg font-semibold text-foreground">
                          {formatCurrency(Number(p.currentEstimatedValue))}
                        </dd>
                      </div>
                      <div className="rounded-md border border-border/70 bg-background/50 px-3 py-2">
                        <dt className="text-xs font-medium text-muted">Equity</dt>
                        <dd className="mt-1 text-lg font-semibold text-foreground">
                          {formatCurrency(metrics.equity)}
                        </dd>
                      </div>
                      <div className="rounded-md border border-border/70 bg-background/50 px-3 py-2">
                        <dt className="text-xs font-medium text-muted">Monthly cash flow</dt>
                        <dd
                          className={`mt-1 text-lg font-semibold ${
                            metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
                          }`}
                        >
                          {formatCurrency(metrics.monthlyCashFlow)}
                        </dd>
                      </div>
                    </dl>
                    <BenchmarkLine
                      propertyId={p.id}
                      userRent={card.userRent}
                      isRented={p.isRented}
                      marketRent={p.marketRent != null ? Number(p.marketRent) : null}
                      marketRentAsOf={p.marketRentAsOf}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/properties/${p.id}`}
                        className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                      >
                        Open property
                      </Link>
                      <Link
                        href={`/modeling?propertyId=${encodeURIComponent(p.id)}`}
                        className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
                      >
                        Open Modeling
                      </Link>
                      {p.mortgages.length > 0 ? (
                        <Link
                          href={`/mortgage?propertyId=${encodeURIComponent(p.id)}`}
                          className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
                        >
                          Open Mortgage
                        </Link>
                      ) : (
                        <Link
                          href={`/properties/${p.id}?tab=details#mortgages`}
                          className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
                        >
                          Add mortgage
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleCards.map((card) => {
                const p = card.property;
                const metrics = card.metrics;
                return (
                  <li key={p.id} className="h-full">
                    <div className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-4 shadow-sm transition hover:bg-subtle/40">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-foreground">
                            {p.nickname || p.addressLine1}
                          </div>
                          <div className="mt-1 min-h-[40px] text-sm text-muted">
                            {p.addressLine1}
                            {p.city && `, ${p.city} ${p.state} ${p.zipCode}`}
                          </div>
                          <p className="mt-1 min-h-4 text-xs text-muted">
                            Updated {formatTimeAgo(p.updatedAt)}
                          </p>
                        </div>
                        <PropertyTypeBadge propertyType={p.propertyType} units={p.units} />
                      </div>
                      <div className="mt-2 flex min-h-6 flex-wrap content-start gap-1.5">
                        {card.noMortgage && <InsightTag label="No mortgage" />}
                        {card.benchmarkStale && <InsightTag label="Benchmark stale" />}
                        {card.negativeCashFlow && (
                          <InsightTag label="Negative cash flow" tone="negative" />
                        )}
                        {isDataStale(
                          p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt)
                        ) && <InsightTag label="Needs update" />}
                      </div>
                      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                        <div className="flex items-center justify-between sm:block">
                          <dt className="font-medium text-muted">Value</dt>
                          <dd className="font-medium text-foreground">
                            {formatCurrency(Number(p.currentEstimatedValue))}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between sm:block">
                          <dt className="font-medium text-muted">Equity</dt>
                          <dd className="font-medium text-foreground">
                            {formatCurrency(metrics.equity)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between sm:block">
                          <dt className="font-medium text-muted">Cash flow</dt>
                          <dd
                            className={`font-medium ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
                          >
                            {formatCurrency(metrics.monthlyCashFlow)}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-3 min-h-[32px]">
                        <BenchmarkLine
                          propertyId={p.id}
                          userRent={card.userRent}
                          isRented={p.isRented}
                          marketRent={p.marketRent != null ? Number(p.marketRent) : null}
                          marketRentAsOf={p.marketRentAsOf}
                        />
                      </div>
                      <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/properties/${p.id}`}
                          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                        >
                          Open property
                        </Link>
                        <Link
                          href={`/modeling?propertyId=${encodeURIComponent(p.id)}`}
                          className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
                        >
                          Open Modeling
                        </Link>
                        {p.mortgages.length > 0 ? (
                          <Link
                            href={`/mortgage?propertyId=${encodeURIComponent(p.id)}`}
                            className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
                          >
                            Open Mortgage
                          </Link>
                        ) : (
                          <Link
                            href={`/properties/${p.id}?tab=details#mortgages`}
                            className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
                          >
                            Add mortgage
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
