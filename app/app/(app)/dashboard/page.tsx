import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format-currency";
import { getPropertyTotalRent } from "@/lib/property-utils";
import {
  getEffectiveBalance,
  getPayoffProjection,
  getPiForAmortization,
  getProjectedBalanceAsOf,
} from "@/lib/amortization";
import { buildDashboardPortfolioPayload } from "@/lib/server/portfolio-summary-payload";
import { buildDashboardTrends } from "@/lib/dashboard-trends";
import {
  BENCHMARK_UX_MESSAGES,
  getBenchmarkEligibility,
  getBenchmarkTone,
} from "@/lib/benchmark-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { getPropertyCompleteness } from "@/lib/property-completeness";
import { DashboardCharts, type DashboardChartData } from "./dashboard-charts";
import { RentVsMarketSection } from "./rent-vs-market-section";
import { PaidIntentCheckoutBanner } from "@/components/growth/paid-intent-checkout-banner";
import {
  DashboardEmptyStatePrimaryCta,
  DashboardEmptyStateSecondaryLinks,
} from "./dashboard-empty-state-ctas";
import type { PropertyTableRow } from "./property-performance-table";
import { buildDashboardInsightsPayload } from "./build-insights-payload";
import { pickInsights } from "@/lib/insights";
import { hasTrialExpired } from "@/lib/plans";
import { PortfolioSection } from "./portfolio-section";
import { MetricHelpLink } from "./metric-help-link";

import { PortfolioHeroStrip, type HeroMetric } from "@/components/dashboard/portfolio-hero-strip";
import type { AlertPill } from "@/components/dashboard/alert-pills-row";
import { InsightsCardsClient } from "@/components/dashboard/insights-cards-client";
import { InsightsLockedCard } from "@/components/dashboard/insights-locked-card";
import { SignalStrip, type Signal } from "@/components/dashboard/signal-strip";
import {
  PropertyHeaderCard,
  type PropertyTag,
} from "@/components/dashboard/property-header-card";
import {
  CapitalStructureCard,
  type MortgageDetail,
  type PaydownProjection,
} from "@/components/dashboard/capital-structure-card";
import { SincePurchasePanel } from "@/components/dashboard/since-purchase-panel";
import { CashFlowBreakdownCard } from "@/components/dashboard/cash-flow-breakdown-card";
import {
  SecondaryMetricsStrip,
  type SecondaryMetric,
} from "@/components/dashboard/secondary-metrics-strip";
import { EquityTrendChart } from "@/components/dashboard/equity-trend-chart";

const MINUS = "−";

// ─── Local helpers ───────────────────────────────────────────────────────────

function fmtSignedMonthly(amount: number): string {
  if (amount === 0) return `${formatCurrency(0)} / mo`;
  const sign = amount < 0 ? MINUS : "+";
  return `${sign}${formatCurrency(Math.abs(amount))} / mo`;
}

function fmtSignedAmount(amount: number): string {
  if (amount === 0) return formatCurrency(0);
  const sign = amount < 0 ? MINUS : "+";
  return `${sign}${formatCurrency(Math.abs(amount))}`;
}

function pluralProperty(n: number): string {
  return n === 1 ? "property" : "properties";
}

function formatPropertyType(type: string | null | undefined): string {
  if (!type) return "";
  const lookup: Record<string, string> = {
    single_family: "Single family",
    condo: "Condo",
    townhouse: "Townhouse",
    manufactured: "Manufactured",
    multi_family: "Multi-family",
    apartment: "Apartment",
  };
  return lookup[type] ?? type.replace(/_/g, " ");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    effectiveTier,
  } = await buildDashboardPortfolioPayload(user);

  const propertyIds = properties.map((property) => property.id);
  const recentSnapshots =
    propertyIds.length > 0
      ? await prisma.propertySnapshot.findMany({
          where: { propertyId: { in: propertyIds } },
          select: {
            propertyId: true,
            snapshotMonth: true,
            estimatedValue: true,
            equity: true,
            monthlyCashFlow: true,
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
      monthlyCashFlow: Number(snapshot.monthlyCashFlow),
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

  // Property-level inputs for metric computation.
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

  const perPropertyMetrics = portfolioInput.map((p) => ({
    id: p.id,
    name: p.name,
    ...computePropertyMetrics(p),
  }));

  // Chart data shared by Phase 4 components.
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
        debt: p.totalMortgageBalance * scale,
        propertyId: p.id,
      };
    }),
    cashFlow: perPropertyMetrics.map((m) => ({
      name: m.name,
      monthlyCashFlow: m.monthlyCashFlow,
      propertyId: m.id,
    })),
  };

  // Attention flags per property (mirrors properties/page.tsx).
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
      mortgagePaidOff: p.mortgagePaidOff ?? false,
    });
    const incompleteProfile = completeness.score < 100;
    return {
      id: p.id,
      noMortgage,
      benchmarkStale,
      negativeCashFlow,
      incompleteProfile,
      needsAttention: noMortgage || benchmarkStale || negativeCashFlow || incompleteProfile,
    };
  });

  const scaledValueDeltas: Record<string, number | null> = {};
  for (const p of portfolioInput) {
    const raw = trends.propertyValueDeltaMoM[p.id] ?? null;
    const scale = (p.ownershipPercent ?? 100) / 100;
    scaledValueDeltas[p.id] = raw != null ? raw * scale : null;
  }

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
      ltv: m.ltv,
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

  // ─── 0-property: empty state ─────────────────────────────────────────────────

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

  // ─── Build InsightsContext + run engine (1+ properties) ──────────────────────

  const { context: insightsContext, dismissalTimestamps } = buildDashboardInsightsPayload({
    properties,
    perPropertyMetrics,
    portfolioMetrics: {
      totalEquity: metrics.totalEquity,
      totalMonthlyCashFlow: metrics.totalMonthlyCashFlow,
      totalCashInvested: metrics.totalCashInvested,
      weightedCapRate: metrics.weightedCapRate,
      portfolioLtv: metrics.portfolioLtv,
      dscr: metrics.dscr,
    },
    snapshots: recentSnapshots.map((s) => ({
      propertyId: s.propertyId,
      snapshotMonth: s.snapshotMonth,
      estimatedValue: Number(s.estimatedValue),
      equity: Number(s.equity),
      monthlyCashFlow: Number(s.monthlyCashFlow),
    })),
    nowMs,
  });

  const insightsUnlocked = effectiveTier !== "free";
  const insights = insightsUnlocked ? pickInsights(insightsContext) : [];
  const lockedCardPostTrial = !insightsUnlocked && hasTrialExpired(user);
  const isSingleProperty = metrics.propertyCount === 1;

  // ─── Title bar (shared) ──────────────────────────────────────────────────────

  const titleBar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <div className="flex gap-2">
        <Link
          href="/analyze"
          className="inline-flex min-h-[36px] items-center rounded-md border border-border px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-subtle"
        >
          Analyze a deal
        </Link>
        <Link
          href="/properties/new"
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12.5px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <span aria-hidden>+</span> Add property
        </Link>
      </div>
    </div>
  );

  const onboardingBanner = onboarding === "first-property" ? (
    <div
      className="mt-3 rounded-xl border p-4"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <p className="text-sm font-semibold text-foreground">
        Property added. Your portfolio is now live.
      </p>
      <p className="mt-1 text-sm text-muted">
        Great start. Add more details to your property to unlock full analytics.
      </p>
    </div>
  ) : null;

  // ─── Single-property layout ──────────────────────────────────────────────────

  if (isSingleProperty) {
    const p = properties[0]!;
    const m = perPropertyMetrics[0]!;
    const flags = perPropertyFlags[0]!;
    const pInput = portfolioInput[0]!;
    const ownershipScale = (pInput.ownershipPercent ?? 100) / 100;

    const propertyValue = pInput.estimatedValue;
    const propertyEquity = m.equity;
    const equityDenom = propertyValue * ownershipScale;
    const equityPct =
      equityDenom > 0 ? (propertyEquity / equityDenom) * 100 : 0;
    const equitySub =
      ownershipScale < 1 ? `${equityPct.toFixed(1)}% of your share` : `${equityPct.toFixed(1)}% of property value`;
    const monthlyCashFlow = m.monthlyCashFlow;

    // Total return components (used by hero + breakdown card)
    const dscrFromCtx = insightsContext.metrics.find((mm) => mm.id === p.id)?.dscr ?? null;
    const annualPaydownFromCtx =
      insightsContext.metrics.find((mm) => mm.id === p.id)?.annualPaydown ?? 0;
    const appreciation =
      insightsContext.appreciationByPropertyId?.[p.id]?.annualDollars ?? 0;
    const annualCashFlow = m.annualCashFlow;
    const annualTotalReturn = annualCashFlow + appreciation + annualPaydownFromCtx;

    // MoM deltas from snapshots (null when no prior month exists)
    const valueDeltaMoM = scaledValueDeltas[p.id] ?? null;
    const equityDeltaMoM = trends.propertyEquityDeltaMoM[p.id] ?? null;
    const cashFlowDeltaMoM = trends.propertyCashFlowDeltaMoM[p.id] ?? null;

    const buildAmountDelta = (
      amount: number | null,
      suffix = ""
    ): HeroMetric["delta"] => {
      if (amount == null || Math.abs(amount) < 0.5) return undefined;
      return {
        amount,
        formatted: `${fmtSignedAmount(amount)}${suffix}`,
        tone: amount > 0 ? "pos" : "neg",
        caption: "vs last month",
      };
    };

    const heroMetrics: [HeroMetric, HeroMetric, HeroMetric, HeroMetric] = [
      {
        label: "Monthly cash flow",
        value: fmtSignedMonthly(monthlyCashFlow).replace(" / mo", ""),
        sub: monthlyCashFlow >= 0 ? "Positive after costs" : "Below break-even",
        valueColor: monthlyCashFlow >= 0 ? "pos" : "neg",
        delta: buildAmountDelta(cashFlowDeltaMoM, " / mo"),
      },
      {
        label: "Total return",
        value: fmtSignedAmount(annualTotalReturn),
        sub: "Cash flow + appreciation + paydown",
        valueColor: annualTotalReturn >= 0 ? "pos" : "neg",
      },
      {
        label: "Your equity",
        value: formatCurrency(propertyEquity),
        sub: equitySub,
        valueColor: "neutral",
        delta: buildAmountDelta(equityDeltaMoM),
      },
      {
        label: "Property value",
        value: formatCurrency(propertyValue),
        sub: "Estimated value",
        valueColor: "neutral",
        delta: buildAmountDelta(valueDeltaMoM),
      },
    ];

    // Property header tags
    const tags: PropertyTag[] = [];
    if (flags.negativeCashFlow) tags.push({ label: "Cash flow negative", variant: "neg" });
    if (m.ltv != null) {
      const ltvPct = m.ltv * 100;
      if (m.ltv >= 0.9) {
        tags.push({ label: `LTV ${ltvPct.toFixed(1)}% — refi locked`, variant: "neg" });
      } else if (m.ltv >= 0.8) {
        tags.push({ label: `LTV ${ltvPct.toFixed(1)}% — watch`, variant: "warn" });
      }
    }
    // Signals (3 cells)
    const cfSignal: Signal = {
      label: "Monthly cash flow",
      value: fmtSignedMonthly(monthlyCashFlow),
      detail:
        monthlyCashFlow < 0
          ? `Expenses + mortgage exceed rent by ${formatCurrency(Math.abs(monthlyCashFlow))}`
          : `${formatCurrency(monthlyCashFlow)} net positive after costs`,
      status: monthlyCashFlow < 0 ? "bad" : "ok",
    };

    let ltvSignal: Signal;
    if (m.ltv == null || m.ltv <= 0) {
      ltvSignal = {
        label: "Loan-to-value (LTV)",
        value: m.ltv == null ? "No mortgage" : "0.0%",
        detail: m.ltv == null ? "Owned outright" : "Paid off",
        status: "ok",
      };
    } else {
      const ltvPct = m.ltv * 100;
      const status: Signal["status"] =
        m.ltv >= 0.9 ? "bad" : m.ltv >= 0.8 ? "warn" : "ok";
      const detail =
        m.ltv >= 0.9
          ? "Refi-locked above 90% — most lenders won't touch it"
          : m.ltv >= 0.8
            ? "Above 80% — limited refi flexibility"
            : "Below 80% — healthy refi terms available";
      ltvSignal = {
        label: "Loan-to-value (LTV)",
        value: `${ltvPct.toFixed(1)}%`,
        detail,
        status,
      };
    }

    const eligibility = getBenchmarkEligibility({
      isRented: p.isRented,
      userRent: getPropertyTotalRent(p),
      marketRent: p.marketRent != null ? Number(p.marketRent) : null,
      marketRentAsOf: p.marketRentAsOf,
    });
    let rentSignal: Signal;
    if (eligibility === "eligible_fresh" && p.marketRent != null) {
      const userRent = getPropertyTotalRent(p);
      const marketRent = Number(p.marketRent);
      const tone = getBenchmarkTone(userRent, marketRent);
      const status: Signal["status"] =
        tone === "negative" ? "warn" : tone === "positive" ? "ok" : "ok";
      const monthlyDelta = userRent - marketRent;
      const headline =
        Math.abs(monthlyDelta) < 1
          ? "At market"
          : `${monthlyDelta > 0 ? "+" : MINUS}${formatCurrency(Math.abs(monthlyDelta))} / mo`;
      const refreshLabel = p.marketRentAsOf
        ? `refreshed ${new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(p.marketRentAsOf)}`
        : "refresh date unavailable";
      rentSignal = {
        label: "Rent vs. market",
        value: headline,
        detail: `Yours ${formatCurrency(userRent)} · Market ${formatCurrency(marketRent)} · ${refreshLabel}`,
        status,
      };
    } else if (eligibility === "not_rented") {
      rentSignal = {
        label: "Rent vs. market",
        value: "Not rented",
        detail: BENCHMARK_UX_MESSAGES.notRented,
        status: "ok",
      };
    } else if (eligibility === "rent_missing") {
      rentSignal = {
        label: "Rent vs. market",
        value: "Set rent first",
        detail: BENCHMARK_UX_MESSAGES.rentMissing,
        status: "warn",
      };
    } else {
      rentSignal = {
        label: "Rent vs. market",
        value: "Stale benchmark",
        detail: "Refresh from property page",
        status: "warn",
      };
    }

    // Secondary metrics
    const cocPct =
      m.cashOnCashReturn != null ? m.cashOnCashReturn * 100 : null;
    const secondaryMetrics: [
      SecondaryMetric,
      SecondaryMetric,
      SecondaryMetric,
      SecondaryMetric,
    ] = [
      {
        label: "Cash-on-cash",
        value: cocPct != null ? `${cocPct.toFixed(2)}%` : "—",
        hint:
          cocPct == null
            ? "Add cash invested on the property to see this"
            : "Annual cash flow ÷ cash invested",
        valueColor: cocPct == null ? "default" : cocPct < 0 ? "bad" : "ok",
      },
      {
        label: "DSCR",
        value: dscrFromCtx != null ? dscrFromCtx.toFixed(2) : "—",
        hint:
          dscrFromCtx == null
            ? "No mortgage"
            : dscrFromCtx >= 1.25
              ? "At or above 1.25 — competitive refi terms"
              : dscrFromCtx >= 1.0
                ? "Above 1.0 — debt service covered"
                : "Below 1.0 — debt service exceeds NOI",
        valueColor:
          dscrFromCtx == null
            ? "default"
            : dscrFromCtx < 1.0
              ? "bad"
              : dscrFromCtx < 1.25
                ? "warn"
                : "default",
      },
      {
        label: "NOI (annual)",
        value: formatCurrency(m.noi),
        hint: "Net operating income",
        valueColor: m.noi < 0 ? "bad" : "default",
      },
      {
        label: "Annual rent",
        value: formatCurrency(m.grossAnnualRent),
        hint: `${formatCurrency(m.grossAnnualRent / 12)} / month`,
      },
    ];

    // Capital structure inputs
    const propertyDebt = pInput.totalMortgageBalance * ownershipScale;
    const gainOnValue =
      Number(p.currentEstimatedValue) - Number(p.purchasePrice);

    // Cash flow breakdown inputs (use scaled monthly numbers from metrics)
    const monthlyRentVacancyAdjusted = m.grossAnnualRent / 12;
    const monthlyExpensesScaled = m.annualExpenses / 12;
    const monthlyMortgage = pInput.totalMonthlyPayment * ownershipScale;

    // ─── Mortgage detail (folded into Capital Structure card; hidden when no mortgage) ───
    let mortgageDetail: MortgageDetail | undefined;
    let totalOriginalFull = 0;

    if (p.mortgages.length > 0) {
      let totalBalanceFull = 0;
      let totalPiFull = 0;
      let totalPaymentFull = 0;
      let weightedRateBalance = 0;
      let latestPayoff: Date | null = null;
      let anyNegativeAmortizing = false;

      for (const mort of p.mortgages) {
        const balance = getEffectiveBalance(mort);
        const pi = getPiForAmortization(mort);
        const original = Number(mort.originalLoanAmount);
        const payment = Number(mort.monthlyPayment);
        const rate = Number(mort.interestRate);
        const projection = getPayoffProjection(mort);

        totalBalanceFull += balance;
        totalOriginalFull += original;
        totalPiFull += pi;
        totalPaymentFull += payment;
        weightedRateBalance += rate * balance;

        if (projection.payoffDate) {
          if (!latestPayoff || projection.payoffDate > latestPayoff) {
            latestPayoff = projection.payoffDate;
          }
        } else if (projection.remainingAtTermEnd != null) {
          anyNegativeAmortizing = true;
        }
      }

      const scaledPi = totalPiFull * ownershipScale;
      const scaledPayment = totalPaymentFull * ownershipScale;
      const avgRate =
        totalBalanceFull > 0 ? weightedRateBalance / totalBalanceFull : 0;

      const yearsRemaining = latestPayoff
        ? Math.max(
            0,
            Math.round(
              (latestPayoff.getTime() - nowMs) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          )
        : null;

      mortgageDetail = {
        rate: avgRate,
        monthlyPi: scaledPi,
        monthlyPayment: scaledPayment,
        payoffDate: latestPayoff,
        yearsRemaining,
        negativeAmortizing: anyNegativeAmortizing,
        loanCount: p.mortgages.length,
      };
    }

    // ─── Paydown projection chart (sampled across all mortgages) ───
    let paydownProjection: PaydownProjection | undefined;
    if (p.mortgages.length > 0 && totalOriginalFull > 0) {
      let earliestStart = Infinity;
      let latestEnd = -Infinity;
      for (const mort of p.mortgages) {
        const start = new Date(mort.startDate).getTime();
        if (start < earliestStart) earliestStart = start;
        const projection = getPayoffProjection(mort);
        const end = projection.payoffDate
          ? projection.payoffDate.getTime()
          : new Date(
              new Date(mort.startDate).getFullYear() + mort.termYears,
              new Date(mort.startDate).getMonth(),
              1
            ).getTime();
        if (end > latestEnd) latestEnd = end;
      }

      if (earliestStart < latestEnd) {
        const N = 32;
        const points: { date: Date; balance: number }[] = [];
        for (let i = 0; i < N; i++) {
          const ms = earliestStart + ((latestEnd - earliestStart) * i) / (N - 1);
          const date = new Date(ms);
          let balance = 0;
          for (const mort of p.mortgages) {
            balance += getProjectedBalanceAsOf(
              {
                originalLoanAmount: Number(mort.originalLoanAmount),
                annualInterestRate: Number(mort.interestRate),
                termYears: mort.termYears,
                startDate: new Date(mort.startDate),
                monthlyPayment: getPiForAmortization(mort),
              },
              date
            );
          }
          points.push({
            date,
            balance: balance * ownershipScale,
          });
        }

        const originalScaled = totalOriginalFull * ownershipScale;

        paydownProjection = {
          points,
          todayMs: nowMs,
          originalBalance: originalScaled,
        };
      }
    }

    // ─── Since-purchase panel inputs ───
    const purchaseValueScaled = Number(p.purchasePrice) * ownershipScale;
    const originalDebtScaled = totalOriginalFull * ownershipScale;
    const downPaymentAtPurchase = purchaseValueScaled - originalDebtScaled;

    const sincePurchasePanel = (
      <SincePurchasePanel
        purchaseDate={new Date(p.purchaseDate)}
        purchasePrice={purchaseValueScaled}
        downPayment={downPaymentAtPurchase}
        currentEquity={propertyEquity}
        nowMs={nowMs}
      />
    );

    const partialOwnership = (pInput.ownershipPercent ?? 100) < 100;

    return (
      <div>
        <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
        {titleBar}
        {partialOwnership && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link
              href={`/properties/${p.id}`}
              className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
            >
              {pInput.ownershipPercent}% ownership
            </Link>
            <p className="text-xs text-muted">
              Cash flow, equity, NOI, and rent reflect your {pInput.ownershipPercent}% share. Property value, cap rate, LTV, and DSCR are property-level.
            </p>
          </div>
        )}
        {onboardingBanner}

        <div className="mt-5 flex flex-col gap-5">
          <PortfolioHeroStrip metrics={heroMetrics} />

          <PropertyHeaderCard
            address={p.addressLine1}
            location={`${p.city}, ${p.state}${p.zipCode ? ` ${p.zipCode}` : ""} · ${formatPropertyType(p.propertyType)}`}
            tags={tags}
            propertyHref={`/properties/${p.id}`}
            centerSlot={sincePurchasePanel}
          >
            <SignalStrip signals={[cfSignal, ltvSignal, rentSignal]} />
          </PropertyHeaderCard>

          <SecondaryMetricsStrip metrics={secondaryMetrics} />

          {insightsUnlocked ? (
            <InsightsCardsClient
              insights={insights}
              propertyUpdatedAt={dismissalTimestamps.propertyUpdatedAt}
              portfolioUpdatedAt={dismissalTimestamps.portfolioUpdatedAt}
            />
          ) : (
            <InsightsLockedCard
              placement="dashboard_single"
              postTrial={lockedCardPostTrial}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CapitalStructureCard
              debt={propertyDebt}
              equity={propertyEquity}
              purchasePrice={Number(p.purchasePrice)}
              gainOnValue={gainOnValue}
              mortgage={mortgageDetail}
              paydown={paydownProjection}
            />
            <CashFlowBreakdownCard
              monthlyRent={monthlyRentVacancyAdjusted}
              monthlyExpenses={monthlyExpensesScaled}
              monthlyMortgage={monthlyMortgage}
              annualCashFlow={annualCashFlow}
              annualAppreciation={appreciation}
              annualPaydown={annualPaydownFromCtx}
              annualTotalReturn={annualTotalReturn}
              appreciationRatePct={
                pInput.estimatedValue > 0
                  ? (appreciation / pInput.estimatedValue) * 100
                  : 0
              }
            />
          </div>

          {/* Compare upsell */}
          <div
            className="rounded-xl border p-[18px] flex flex-wrap items-center justify-between gap-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
              borderColor: "rgba(129,140,248,0.18)",
            }}
          >
            <div>
              <p
                className="text-[13.5px] font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Compare properties side by side
              </p>
              <p
                className="text-[12.5px] mt-0.5"
                style={{ color: "var(--foreground-muted)" }}
              >
                Add a second property to unlock portfolio comparison charts and
                cross-property performance.
              </p>
            </div>
            <Link
              href="/properties/new"
              className="inline-flex shrink-0 items-center rounded-md bg-accent px-4 py-2 text-[12px] font-medium text-accent-foreground hover:bg-accent-hover whitespace-nowrap"
            >
              Add property
            </Link>
          </div>

          <div className="mt-1 flex justify-end">
            <MetricHelpLink />
          </div>
        </div>
      </div>
    );
  }

  // ─── Multi-property layout ───────────────────────────────────────────────────

  const propertyCount = metrics.propertyCount;

  // Hero metrics (multi)
  const portfolioEquityPct =
    metrics.totalMarketValue > 0
      ? (metrics.totalEquity / metrics.totalMarketValue) * 100
      : 0;
  const positiveCfCount = perPropertyMetrics.filter((m) => m.monthlyCashFlow >= 0).length;
  const negativeCfCount = perPropertyMetrics.filter((m) => m.monthlyCashFlow < 0).length;

  const multiHeroMetrics: [HeroMetric, HeroMetric, HeroMetric, HeroMetric] = [
    {
      label: "Portfolio value",
      value: formatCurrency(metrics.totalMarketValue),
      sub: `${propertyCount} ${pluralProperty(propertyCount)} · est. market value`,
      valueColor: "neutral",
    },
    {
      label: "Total equity",
      value: formatCurrency(metrics.totalEquity),
      sub: `${portfolioEquityPct.toFixed(1)}% of portfolio value`,
      valueColor: "neutral",
    },
    {
      label: "Net cash flow",
      value: fmtSignedMonthly(metrics.totalMonthlyCashFlow),
      sub: `${positiveCfCount} positive · ${negativeCfCount} negative`,
      valueColor: metrics.totalMonthlyCashFlow >= 0 ? "pos" : "neg",
    },
    {
      label: "Avg. cap rate",
      value:
        metrics.weightedCapRate != null
          ? `${(metrics.weightedCapRate * 100).toFixed(2)}%`
          : "—",
      sub: "Weighted by property value",
      valueColor: "neutral",
    },
  ];

  // Alert pills
  const highLtvCount = perPropertyMetrics.filter(
    (m) => m.ltv != null && m.ltv >= 0.8
  ).length;
  const belowMarketCount = properties.filter((p) => {
    const eligibility = getBenchmarkEligibility({
      isRented: p.isRented,
      userRent: getPropertyTotalRent(p),
      marketRent: p.marketRent != null ? Number(p.marketRent) : null,
      marketRentAsOf: p.marketRentAsOf,
    });
    if (eligibility !== "eligible_fresh" || p.marketRent == null) return false;
    return getPropertyTotalRent(p) < Number(p.marketRent);
  }).length;
  const dscrAboveCount = insightsContext.metrics.filter(
    (m) => m.dscr != null && m.dscr >= 1.25
  ).length;

  const alertPills: AlertPill[] = [];
  if (negativeCfCount > 0) {
    alertPills.push({
      label: `${negativeCfCount} ${pluralProperty(negativeCfCount)} cash flow negative`,
      variant: "neg",
      filterKey: "negative_cashflow",
    });
  }
  if (highLtvCount > 0) {
    alertPills.push({
      label: `${highLtvCount} ${pluralProperty(highLtvCount)} LTV above 80%`,
      variant: "warn",
      filterKey: "high_ltv",
    });
  }
  if (belowMarketCount > 0) {
    alertPills.push({
      label: `${belowMarketCount} ${pluralProperty(belowMarketCount)} rent below market`,
      variant: "warn",
      filterKey: "below_market",
    });
  }
  if (dscrAboveCount > 0) {
    alertPills.push({
      label: `${dscrAboveCount} ${pluralProperty(dscrAboveCount)} DSCR above 1.25`,
      variant: "ok",
    });
  }

  const portfolioLtv = metrics.portfolioLtv;
  const portfolioDscr = metrics.dscr;
  const portfolioSecondaryMetrics: [
    SecondaryMetric,
    SecondaryMetric,
    SecondaryMetric,
    SecondaryMetric,
  ] = [
    {
      label: "Portfolio LTV",
      value:
        portfolioLtv != null ? `${(portfolioLtv * 100).toFixed(1)}%` : "—",
      hint:
        portfolioLtv == null
          ? "No mortgages tracked"
          : portfolioLtv <= 0
            ? "All paid off"
            : portfolioLtv >= 0.8
              ? "Above 80% — limited refi flexibility"
              : portfolioLtv >= 0.7
                ? "Approaching 80% — watch headroom"
                : "Below 80% — healthy refi terms available",
      valueColor:
        portfolioLtv == null
          ? "default"
          : portfolioLtv >= 0.8
            ? "bad"
            : portfolioLtv >= 0.7
              ? "warn"
              : "default",
    },
    {
      label: "DSCR",
      value: portfolioDscr != null ? portfolioDscr.toFixed(2) : "—",
      hint:
        portfolioDscr == null
          ? "No mortgages tracked"
          : portfolioDscr >= 1.25
            ? "At or above 1.25 — competitive refi terms"
            : portfolioDscr >= 1.0
              ? "Above 1.0 — debt service covered"
              : "Below 1.0 — debt service exceeds NOI",
      valueColor:
        portfolioDscr == null
          ? "default"
          : portfolioDscr < 1.0
            ? "bad"
            : portfolioDscr < 1.25
              ? "warn"
              : "default",
    },
    {
      label: "NOI (annual)",
      value: formatCurrency(metrics.totalNoi),
      hint: "Net operating income",
      valueColor: metrics.totalNoi < 0 ? "bad" : "default",
    },
    {
      label: "Annual rent",
      value: formatCurrency(metrics.totalAnnualRent),
      hint: `${formatCurrency(metrics.totalAnnualRent / 12)} / month`,
    },
  ];

  const benchmarkProperties = properties.map((p) => ({
    id: p.id,
    nickname: p.nickname,
    addressLine1: p.addressLine1,
    marketRent: p.marketRent != null ? Number(p.marketRent) : null,
    marketRentAsOf: p.marketRentAsOf?.toISOString() ?? null,
    currentMonthlyRent: Number(p.currentMonthlyRent),
    unitRents: p.unitRents,
    isRented: p.isRented,
  }));

  return (
    <div>
      <PaidIntentCheckoutBanner effectiveTier={effectiveTier} />
      {titleBar}
      {onboardingBanner}

      <div className="mt-5 flex flex-col gap-5">
        <PortfolioHeroStrip metrics={multiHeroMetrics} />

        <SecondaryMetricsStrip metrics={portfolioSecondaryMetrics} />

        {insightsUnlocked ? (
          <InsightsCardsClient
            insights={insights}
            propertyUpdatedAt={dismissalTimestamps.propertyUpdatedAt}
            portfolioUpdatedAt={dismissalTimestamps.portfolioUpdatedAt}
          />
        ) : (
          <InsightsLockedCard
            placement="dashboard_multi"
            postTrial={lockedCardPostTrial}
          />
        )}

        {trends.portfolio.equitySeries.length >= 2 && (
          <EquityTrendChart
            equitySeries={trends.portfolio.equitySeries}
            monthLabels={trends.portfolio.monthLabels}
            equityDeltaSinceFirst={trends.portfolio.equityDeltaSinceFirst}
          />
        )}

        <PortfolioSection pills={alertPills} tableRows={tableRows} />

        {/* Two-col bottom: charts + RvM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <DashboardCharts
              data={chartData}
              propertyCount={propertyCount}
              containerless
            />
          </div>
          <RentVsMarketSection properties={benchmarkProperties} />
        </div>

        <div className="mt-1 flex justify-end">
          <MetricHelpLink />
        </div>
      </div>
    </div>
  );
}
