import Link from "next/link";
import { Building2, ChevronRight, Search } from "lucide-react";
import { UpgradePlanLink } from "@/components/analytics/upgrade-plan-link";
import { getAppUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format-currency";
import { prisma } from "@/lib/db";
import { getPropertyLimit, getEffectiveTier, hasTrialExpired } from "@/lib/plans";
import { getPropertyTotalRent, formatPropertyType } from "@/lib/property-utils";
import { formatTimeAgo } from "@/lib/date-utils";
import {
  getBenchmarkEligibility,
  getBenchmarkTone,
  type BenchmarkEligibility,
} from "@/lib/benchmark-utils";
import { getEffectiveBalance } from "@/lib/amortization";
import {
  computePropertyMetrics,
  getAnnualDebtService,
} from "@/lib/metrics/property-metrics";
import { getPropertyCompleteness } from "@/lib/property-completeness";
import { getPropertyStatus, type PropertyStatus } from "@/lib/property-status";
import { getRefiReadyStatus } from "@/lib/refi-ready";
import { hasRecentCashFlowImprovement } from "@/lib/cash-flow-improvement";
import { PropertiesToolbar } from "./properties-toolbar";
import { PropertiesCardGrid } from "./properties-card-grid";
import { TaskCenter } from "@/components/properties/task-center";
import { PropertyStatusDot } from "@/components/properties/directory/property-status-dot";
import { BelowMarketIndicator } from "@/components/properties/directory/below-market-indicator";
import type { IncompleteProfileRow } from "@/components/properties/task-center/incomplete-profiles-card";
import type { CashFlowNegativeRow } from "@/components/properties/task-center/cash-flow-health-card";
import type { RefiReadyRow } from "@/components/properties/task-center/refi-ready-card";

type PropertiesFilter = "all" | "incomplete" | "cf_negative" | "refi_ready";
type PropertiesSort = "updated" | "cash_flow" | "cap_rate" | "value_equity";
type PropertiesView = "grid" | "list";

const FILTER_OPTIONS: { key: PropertiesFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "incomplete", label: "Incomplete" },
  { key: "cf_negative", label: "Cash flow negative" },
  { key: "refi_ready", label: "Refi-ready" },
];

const SORT_OPTIONS: { key: PropertiesSort; label: string }[] = [
  { key: "updated", label: "Recently updated" },
  { key: "cash_flow", label: "Cash flow" },
  { key: "cap_rate", label: "Cap rate" },
  { key: "value_equity", label: "Value / Equity" },
];

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

function StatusBadge({
  score,
  updatedAt,
}: {
  score: number;
  updatedAt: Date;
}) {
  if (score < 100) {
    return (
      <span
        className="inline-flex items-center rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"
        title={`Profile ${score}% complete`}
      >
        {score}% complete
      </span>
    );
  }
  return (
    <span className="text-xs text-muted">Updated {formatTimeAgo(updatedAt)}</span>
  );
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

  const propertyIds = properties.map((p) => p.id);
  const recentSnapshots =
    propertyIds.length > 0
      ? await prisma.propertySnapshot.findMany({
          where: { propertyId: { in: propertyIds } },
          orderBy: [{ propertyId: "asc" }, { snapshotMonth: "desc" }],
          select: { propertyId: true, monthlyCashFlow: true, snapshotMonth: true },
        })
      : [];

  const snapshotsByProperty = new Map<
    string,
    { monthlyCashFlow: number }[]
  >();
  for (const row of recentSnapshots) {
    const existing = snapshotsByProperty.get(row.propertyId);
    const entry = { monthlyCashFlow: Number(row.monthlyCashFlow) };
    if (existing) {
      if (existing.length < 2) existing.push(entry);
    } else {
      snapshotsByProperty.set(row.propertyId, [entry]);
    }
  }

  type PropertyWithMortgages = (typeof properties)[number];
  const displayMode = (user.ownershipDisplayMode ?? "proportional") as
    | "proportional"
    | "full_liability";

  const activeFilter: PropertiesFilter =
    filter && FILTER_OPTIONS.some((o) => o.key === (filter as PropertiesFilter))
      ? (filter as PropertiesFilter)
      : "all";
  const activeSort: PropertiesSort =
    sort && SORT_OPTIONS.some((o) => o.key === (sort as PropertiesSort))
      ? (sort as PropertiesSort)
      : "updated";
  const activeView: PropertiesView =
    view === "grid" || view === "list"
      ? view
      : totalCount >= 6
        ? "list"
        : "grid";

  type DirectoryCard = {
    property: PropertyWithMortgages;
    metrics: ReturnType<typeof computePropertyMetrics>;
    userRent: number;
    benchmarkEligibility: BenchmarkEligibility;
    benchmarkBelowMarket: boolean;
    completenessScore: number;
    status: PropertyStatus;
    refiReadyQualifies: boolean;
    refiEquityPct: number;
    refiCurrentEquity: number;
    incompleteProfile: boolean;
    negativeCashFlow: boolean;
    recentCashFlowImprovement: boolean;
  };

  const propertyCards: DirectoryCard[] = properties.map(
    (p: PropertyWithMortgages): DirectoryCard => {
      const totalMortgageBalance = p.mortgages.reduce(
        (sum: number, m) => sum + getEffectiveBalance(m),
        0
      );
      const totalMonthlyPayment = p.mortgages.reduce(
        (sum: number, m: { monthlyPayment: unknown }) =>
          sum + Number(m.monthlyPayment),
        0
      );
      const userRent = getPropertyTotalRent(p);
      const metrics = computePropertyMetrics(
        {
          monthlyRent: userRent,
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
      const benchmarkInputs = {
        isRented: p.isRented,
        userRent,
        marketRent: p.marketRent != null ? Number(p.marketRent) : null,
        marketRentAsOf: p.marketRentAsOf,
      };
      const benchmarkEligibility = getBenchmarkEligibility(benchmarkInputs);
      const completenessInput = {
        purchasePrice: Number(p.purchasePrice),
        currentEstimatedValue: Number(p.currentEstimatedValue),
        cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
        mortgageCount: p.mortgages.length,
        hasMortgage: p.hasMortgage ?? null,
        mortgagePaidOff: p.mortgagePaidOff ?? false,
      };
      const completeness = getPropertyCompleteness(completenessInput);
      const status = getPropertyStatus(
        completenessInput,
        { monthlyCashFlow: metrics.monthlyCashFlow, ltv: metrics.ltv },
        benchmarkInputs
      );
      const annualDebtService = getAnnualDebtService(
        totalMonthlyPayment,
        p.ownershipPercent ?? 100,
        displayMode
      );
      const dscr =
        p.mortgages.length > 0 && annualDebtService > 0
          ? metrics.noi / annualDebtService
          : null;
      const refiReady = getRefiReadyStatus({
        hasActiveMortgage: p.mortgages.length > 0,
        estimatedValue: Number(p.currentEstimatedValue),
        totalMortgageBalance,
        dscr,
      });
      const benchmarkBelowMarket =
        benchmarkEligibility === "eligible_fresh" &&
        p.marketRent != null &&
        getBenchmarkTone(userRent, Number(p.marketRent)) === "negative";

      const snaps = snapshotsByProperty.get(p.id) ?? [];
      const recentCashFlowImprovement = hasRecentCashFlowImprovement(
        snaps[0] ?? null,
        snaps[1] ?? null
      );

      return {
        property: p,
        metrics,
        userRent,
        benchmarkEligibility,
        benchmarkBelowMarket,
        completenessScore: completeness.score,
        status,
        refiReadyQualifies: refiReady.qualifies,
        refiEquityPct: refiReady.equityPct,
        refiCurrentEquity: refiReady.currentEquity,
        incompleteProfile: completeness.score < 100,
        negativeCashFlow: metrics.monthlyCashFlow < 0,
        recentCashFlowImprovement,
      };
    }
  );

  // ─── Task center inputs ───────────────────────────────────────────────────
  const propertyName = (p: PropertyWithMortgages) =>
    p.nickname || p.addressLine1;

  const incompleteProfileCards = propertyCards
    .filter((c) => c.incompleteProfile)
    .sort((a, b) => a.completenessScore - b.completenessScore);
  const incompleteRows: IncompleteProfileRow[] = incompleteProfileCards.map(
    (c) => ({
      propertyId: c.property.id,
      name: propertyName(c.property),
      score: c.completenessScore,
    })
  );

  const cashFlowNegativeCards = propertyCards
    .filter((c) => c.negativeCashFlow)
    .sort((a, b) => a.metrics.monthlyCashFlow - b.metrics.monthlyCashFlow);
  const cashFlowNegativeRows: CashFlowNegativeRow[] = cashFlowNegativeCards.map(
    (c) => ({
      propertyId: c.property.id,
      name: propertyName(c.property),
      monthlyCashFlow: c.metrics.monthlyCashFlow,
    })
  );

  const recentlyImprovedCard = propertyCards.find(
    (c) => c.recentCashFlowImprovement
  );

  const refiReadyCards = propertyCards
    .filter((c) => c.refiReadyQualifies)
    .sort((a, b) => b.refiCurrentEquity - a.refiCurrentEquity);
  const refiReadyRows: RefiReadyRow[] = refiReadyCards.map((c) => ({
    propertyId: c.property.id,
    name: propertyName(c.property),
    equityPct: c.refiEquityPct,
    currentEquity: c.refiCurrentEquity,
  }));

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filteredCards = propertyCards.filter((card) => {
    switch (activeFilter) {
      case "incomplete":
        return card.incompleteProfile;
      case "cf_negative":
        return card.negativeCashFlow;
      case "refi_ready":
        return card.refiReadyQualifies;
      default:
        return true;
    }
  });

  // ─── Sort with explicit tiebreakers per Decision #8E ─────────────────────
  const sortedCards = [...filteredCards].sort((a, b) => {
    const aP = a.property;
    const bP = b.property;
    switch (activeSort) {
      case "cash_flow": {
        const diff = b.metrics.monthlyCashFlow - a.metrics.monthlyCashFlow;
        if (diff !== 0) return diff;
        return Math.abs(b.metrics.monthlyCashFlow) - Math.abs(a.metrics.monthlyCashFlow);
      }
      case "cap_rate": {
        const aRate = a.metrics.capRate ?? -Infinity;
        const bRate = b.metrics.capRate ?? -Infinity;
        if (bRate !== aRate) return bRate - aRate;
        return b.metrics.monthlyCashFlow - a.metrics.monthlyCashFlow;
      }
      case "value_equity": {
        const aVal = Number(aP.currentEstimatedValue);
        const bVal = Number(bP.currentEstimatedValue);
        if (bVal !== aVal) return bVal - aVal;
        const aDate = aP.purchaseDate ? new Date(aP.purchaseDate).getTime() : 0;
        const bDate = bP.purchaseDate ? new Date(bP.purchaseDate).getTime() : 0;
        return bDate - aDate;
      }
      case "updated":
      default: {
        const aUpd = new Date(aP.updatedAt).getTime();
        const bUpd = new Date(bP.updatedAt).getTime();
        if (bUpd !== aUpd) return bUpd - aUpd;
        const aCre = new Date(aP.createdAt).getTime();
        const bCre = new Date(bP.createdAt).getTime();
        return bCre - aCre;
      }
    }
  });

  const visibleCards = sortedCards;
  const isMobileDisclosureEligible =
    activeFilter === "all" && visibleCards.length >= 10;

  // ─── Render rows ─────────────────────────────────────────────────────────
  const renderedCards = visibleCards.map((card) => {
    const p = card.property;
    const metrics = card.metrics;
    return (
      <li key={p.id} className="h-full">
        <Link
          href={`/properties/${p.id}`}
          className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-150 hover:border-border-subtle hover:bg-card-hover hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <PropertyStatusDot status={card.status} />
                <span className="truncate font-medium text-foreground">
                  {p.nickname || p.addressLine1}
                </span>
              </div>
              <div className="mt-1 truncate text-sm text-muted">
                {p.addressLine1}
                {p.city && `, ${p.city} ${p.state} ${p.zipCode}`}
              </div>
            </div>
            <PropertyTypeBadge propertyType={p.propertyType} units={p.units} />
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt className="text-xs font-medium text-muted">Value</dt>
              <dd className="tabular-nums font-medium text-foreground">
                {formatCurrency(Number(p.currentEstimatedValue))}
              </dd>
              <dd className="tabular-nums text-xs text-muted">
                {formatCurrency(metrics.equity)} eq
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Cash flow</dt>
              <dd
                className={`tabular-nums font-medium ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
              >
                {formatCurrency(metrics.monthlyCashFlow)}
              </dd>
              {card.benchmarkBelowMarket && p.marketRent != null && (
                <dd className="mt-0.5">
                  <BelowMarketIndicator
                    userRent={card.userRent}
                    marketRent={Number(p.marketRent)}
                  />
                </dd>
              )}
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Cap rate</dt>
              <dd className="tabular-nums font-medium text-foreground">
                {metrics.capRate != null
                  ? `${(metrics.capRate * 100).toFixed(2)}%`
                  : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-3">
            <StatusBadge score={card.completenessScore} updatedAt={p.updatedAt} />
          </div>
        </Link>
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
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-card-hover md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1fr)_auto]"
        >
          <div className="flex min-w-0 items-center gap-2">
            <PropertyStatusDot status={card.status} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {p.nickname || p.addressLine1}
              </p>
              <p className="truncate text-xs text-muted">
                {p.addressLine1}
                {p.city && `, ${p.city} ${p.state}`}
              </p>
            </div>
          </div>

          <div className="hidden text-right md:block">
            <p className="tabular-nums text-sm font-medium text-foreground">
              {formatCurrency(Number(p.currentEstimatedValue))}
            </p>
            <p className="tabular-nums text-xs text-muted">
              {formatCurrency(metrics.equity)} eq
            </p>
          </div>

          <div className="hidden text-right md:block">
            <p
              className={`tabular-nums text-sm font-medium ${
                metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {formatCurrency(metrics.monthlyCashFlow)}
            </p>
            {card.benchmarkBelowMarket && p.marketRent != null && (
              <div className="mt-0.5 flex justify-end">
                <BelowMarketIndicator
                  userRent={card.userRent}
                  marketRent={Number(p.marketRent)}
                />
              </div>
            )}
          </div>

          <div className="hidden text-right md:block">
            <p className="tabular-nums text-sm font-medium text-foreground">
              {metrics.capRate != null
                ? `${(metrics.capRate * 100).toFixed(2)}%`
                : "—"}
            </p>
          </div>

          <div className="hidden text-right md:block">
            <StatusBadge score={card.completenessScore} updatedAt={p.updatedAt} />
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

          <TaskCenter
            incompleteRows={incompleteRows}
            totalIncomplete={incompleteRows.length}
            cashFlowNegativeRows={cashFlowNegativeRows}
            recentlyImprovedName={
              recentlyImprovedCard
                ? propertyName(recentlyImprovedCard.property)
                : null
            }
            refiReadyRows={refiReadyRows}
          />

          <div className="mb-5">
            <PropertiesToolbar
              activeFilter={activeFilter}
              activeSort={activeSort}
              activeView={activeView}
              filterOptions={FILTER_OPTIONS}
              sortOptions={SORT_OPTIONS}
            />
          </div>

          {visibleCards.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <Search className="size-10 text-muted/40" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">No matching properties</p>
                <p className="mt-1 text-sm text-muted">Try adjusting your filters.</p>
              </div>
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
