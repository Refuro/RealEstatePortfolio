import Link from "next/link";
import { UpgradePlanLink } from "@/components/analytics/upgrade-plan-link";
import { getAppUser } from "@/lib/auth";
import { BenchmarkRefreshButton } from "./benchmark-refresh-button";
import { formatCurrency } from "@/lib/format-currency";
import { MetricCard } from "@/components/metric-card";
import { prisma } from "@/lib/db";
import { getPropertyLimit, getEffectiveTier, hasTrialExpired } from "@/lib/plans";
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
import { getPropertyCompleteness } from "@/lib/property-completeness";
import { Building2, ChevronRight, Search } from "lucide-react";
import { PropertiesToolbar } from "./properties-toolbar";
import { PropertiesCardGrid } from "./properties-card-grid";

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
    <span className="inline-flex shrink-0 items-center rounded-md border border-border bg-subtle px-2 py-0.5 text-xs font-medium text-muted whitespace-nowrap">
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
  | "negative_cashflow"
  | "incomplete_profile";
type PropertiesSort = "updated" | "worst_cashflow";
type PropertiesView = "grid" | "list";

const FILTER_OPTIONS: { key: PropertiesFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_attention", label: "Needs attention" },
  { key: "no_mortgage", label: "No mortgage" },
  { key: "stale_benchmark", label: "Stale benchmark" },
  { key: "negative_cashflow", label: "Negative cash flow" },
  { key: "incomplete_profile", label: "Incomplete profile" },
];

const SORT_OPTIONS: { key: PropertiesSort; label: string }[] = [
  { key: "updated", label: "Recently updated" },
  { key: "worst_cashflow", label: "Worst cash flow" },
];

function buildPropertiesHref(
  filter: PropertiesFilter,
  sort: PropertiesSort,
  view: PropertiesView
): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (sort !== "updated") params.set("sort", sort);
  params.set("view", view);
  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string; view?: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;
  const { filter, sort, view } = await searchParams;

  const propertyLimit = getPropertyLimit(getEffectiveTier(user));
  const trialExpired = hasTrialExpired(user);
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
  const activeView: PropertiesView =
    view === "grid" || view === "list"
      ? view
      : totalCount >= 6
        ? "list"
        : "grid";

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
    const noMortgage = p.mortgages.length === 0 && p.hasMortgage !== false;
    const negativeCashFlow = metrics.monthlyCashFlow < 0;
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
    const needsAttention = noMortgage || benchmarkStale || negativeCashFlow || incompleteProfile;

    return {
      property: p,
      metrics,
      userRent: getPropertyTotalRent(p),
      noMortgage,
      benchmarkStale,
      negativeCashFlow,
      incompleteProfile,
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
      case "incomplete_profile":
        return card.incompleteProfile;
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
  const isMobileDisclosureEligible =
    activeFilter === "all" && visibleCards.length >= 10;
  const renderedCards = visibleCards.map((card) => {
    const p = card.property;
    const metrics = card.metrics;
    return (
      <li key={p.id} className="h-full">
        <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md hover:bg-subtle/40">
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
            {card.incompleteProfile && <InsightTag label="Incomplete profile" />}
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
  });
  const renderedListRows = visibleCards.map((card) => {
    const p = card.property;
    const metrics = card.metrics;

    return (
      <li key={p.id}>
        <Link
          href={`/properties/${p.id}`}
          className="flex min-h-[44px] items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-subtle/40"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{p.nickname || p.addressLine1}</p>
            <p className="truncate text-xs text-muted">
              {p.addressLine1}
              {p.city && `, ${p.city} ${p.state}`}
            </p>
          </div>

          <div className="hidden sm:flex max-w-[220px] flex-wrap justify-end gap-1.5">
            {card.incompleteProfile && <InsightTag label="Incomplete profile" />}
            {card.noMortgage && <InsightTag label="No mortgage" />}
            {card.benchmarkStale && <InsightTag label="Benchmark stale" />}
            {card.negativeCashFlow && <InsightTag label="Negative cash flow" tone="negative" />}
          </div>

          <div className="hidden md:grid grid-cols-3 gap-3 text-right">
            <div>
              <p className="text-xs font-medium text-muted">Value</p>
              <p className="tabular-nums text-sm font-medium text-foreground">
                {formatCurrency(Number(p.currentEstimatedValue))}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Cash flow</p>
              <p
                className={`tabular-nums text-sm font-medium ${
                  metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
                }`}
              >
                {formatCurrency(metrics.monthlyCashFlow)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Equity</p>
              <p className="tabular-nums text-sm font-medium text-foreground">
                {formatCurrency(metrics.equity)}
              </p>
            </div>
          </div>

          <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
        </Link>
      </li>
    );
  });

  return (
    <div>
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Properties</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/properties/new"
              className="w-fit rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Add property
            </Link>
            <Link
              href="/properties/new?mode=quick"
              className="text-sm text-muted hover:text-foreground"
            >
              Quick add
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/modeling"
            className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-transparent px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
          >
            Modeling
          </Link>
          <Link
            href="/mortgage"
            className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-transparent px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
          >
            Mortgage
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <Building2 className="size-10 text-muted/40" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">No properties yet</p>
            <p className="mt-1 text-sm text-muted">
              Track equity, cash flow, and rent estimates across all your properties.
            </p>
          </div>
          <Link
            href="/properties/new"
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <>
          {overLimit && (
            <p className="mb-4 text-sm text-muted">
              {trialExpired ? (
                <>
                  Your trial has ended. {Math.max(totalCount - propertyLimit, 0)} properties are locked.{" "}
                  <UpgradePlanLink
                    placement="properties_list_over_limit"
                    className="font-medium text-foreground hover:underline"
                  >
                    Upgrade to access all your properties
                  </UpgradePlanLink>
                </>
              ) : (
                <>
                  Showing {properties.length} of {totalCount} properties (plan limit).{" "}
                  <UpgradePlanLink
                    placement="properties_list_over_limit"
                    className="font-medium text-foreground hover:underline"
                  >
                    Upgrade to see all
                  </UpgradePlanLink>
                </>
              )}
            </p>
          )}
          {!singlePropertyMode && (
            <div className="mb-5">
              <PropertiesToolbar
                activeFilter={activeFilter}
                activeSort={activeSort}
                activeView={activeView}
                filterOptions={FILTER_OPTIONS}
                sortOptions={SORT_OPTIONS}
              />
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
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <Search className="size-10 text-muted/40" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">No matching properties</p>
                <p className="mt-1 text-sm text-muted">Try adjusting your filters.</p>
              </div>
            </div>
          ) : singlePropertyMode && visibleCards.length === 1 ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow duration-150 hover:shadow-md">
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
                        {card.incompleteProfile && <InsightTag label="Incomplete profile" />}
                        {card.noMortgage && <InsightTag label="No mortgage" />}
                        {card.benchmarkStale && <InsightTag label="Benchmark stale" />}
                        {card.negativeCashFlow && (
                          <InsightTag label="Negative cash flow" tone="negative" />
                        )}
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-md border border-border bg-subtle/40 px-3 py-2">
                        <dt className="text-xs font-medium text-muted">Value</dt>
                        <dd className="mt-1 text-lg font-semibold text-foreground">
                          {formatCurrency(Number(p.currentEstimatedValue))}
                        </dd>
                      </div>
                      <div className="rounded-md border border-border bg-subtle/40 px-3 py-2">
                        <dt className="text-xs font-medium text-muted">Equity</dt>
                        <dd className="mt-1 text-lg font-semibold text-foreground">
                          {formatCurrency(metrics.equity)}
                        </dd>
                      </div>
                      <div className="rounded-md border border-border bg-subtle/40 px-3 py-2">
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
            <PropertiesCardGrid
              cards={renderedCards}
              listRows={renderedListRows}
              totalCount={visibleCards.length}
              isMobileDisclosureEligible={isMobileDisclosureEligible}
              viewMode={activeView}
            />
          )}
        </>
      )}
    </div>
  );
}
