"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getMonthlyCashFlowTone } from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import { computeRentVsBuyResult } from "@/lib/rent-vs-buy-calculator";

type RentVsBuyCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
  initialHomePrice?: number;
};

function numberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const appCtaClass =
  "inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover";
const appCtaClassFullWidth =
  "inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover";

const DEFAULTS = {
  monthlyRent: "2000",
  annualRentGrowthPercent: "3",
  homePrice: "400000",
  downPaymentPercent: "20",
  mortgageRatePercent: "7",
  loanTermYears: "30",
  annualAppreciationPercent: "3",
  investmentReturnPercent: "7",
  annualPropertyTaxPercent: "1.2",
  monthlyInsuranceAndMaintenance: "300",
  horizonYears: "20",
};

function cheaperLabel(delta: number): string {
  if (delta < 0) return "Buying cheaper";
  if (delta > 0) return "Renting cheaper";
  return "Rough tie";
}

export function RentVsBuyCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialHomePrice,
}: RentVsBuyCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";

  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [annualRentGrowthPercent, setAnnualRentGrowthPercent] = useState(
    DEFAULTS.annualRentGrowthPercent
  );
  const [homePrice, setHomePrice] = useState(
    initialHomePrice != null ? String(initialHomePrice) : DEFAULTS.homePrice
  );
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULTS.downPaymentPercent);
  const [mortgageRatePercent, setMortgageRatePercent] = useState(DEFAULTS.mortgageRatePercent);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [annualAppreciationPercent, setAnnualAppreciationPercent] = useState(
    DEFAULTS.annualAppreciationPercent
  );
  const [investmentReturnPercent, setInvestmentReturnPercent] = useState(
    DEFAULTS.investmentReturnPercent
  );
  const [annualPropertyTaxPercent, setAnnualPropertyTaxPercent] = useState(
    DEFAULTS.annualPropertyTaxPercent
  );
  const [monthlyInsuranceAndMaintenance, setMonthlyInsuranceAndMaintenance] = useState(
    DEFAULTS.monthlyInsuranceAndMaintenance
  );
  const [horizonYears, setHorizonYears] = useState(DEFAULTS.horizonYears);

  const result = useMemo(
    () =>
      computeRentVsBuyResult({
        monthlyRent: numberOrFallback(monthlyRent, 0),
        annualRentGrowthPercent: numberOrFallback(annualRentGrowthPercent, 3),
        homePrice: numberOrFallback(homePrice, 0),
        downPaymentPercent: numberOrFallback(downPaymentPercent, 20),
        mortgageRatePercent: numberOrFallback(mortgageRatePercent, 7),
        loanTermYears: numberOrFallback(loanTermYears, 30),
        annualAppreciationPercent: numberOrFallback(annualAppreciationPercent, 3),
        investmentReturnPercent: numberOrFallback(investmentReturnPercent, 7),
        annualPropertyTaxPercent: numberOrFallback(annualPropertyTaxPercent, 1.2),
        monthlyInsuranceAndMaintenance: numberOrFallback(monthlyInsuranceAndMaintenance, 0),
        horizonYears: numberOrFallback(horizonYears, 20),
      }),
    [
      monthlyRent,
      annualRentGrowthPercent,
      homePrice,
      downPaymentPercent,
      mortgageRatePercent,
      loanTermYears,
      annualAppreciationPercent,
      investmentReturnPercent,
      annualPropertyTaxPercent,
      monthlyInsuranceAndMaintenance,
      horizonYears,
    ]
  );

  const inputClass =
    "mt-1 block min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const chartData = result.yearData.map((row) => ({
    year: row.year,
    renting: row.cumulativeRentCost,
    owning: row.ownNetCost,
  }));

  const breakEvenDisplay =
    result.breakEvenYear != null ? `Year ${result.breakEvenYear}` : `Not within ${result.yearData.length} years`;
  const breakEvenChartCallout =
    result.breakEvenYear != null
      ? `Break-even line shown at year ${result.breakEvenYear}.`
      : `No break-even point appears within the ${result.yearData.length}-year horizon.`;

  const summaryRows = [
    { label: "5 years", ...result.costAt5Years },
    { label: "10 years", ...result.costAt10Years },
    { label: "20 years", ...result.costAt20Years },
  ];

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Rent vs buy calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Compare cumulative renting costs against owning costs net of equity over your planning
        horizon.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="rvb-rent">
            Monthly rent
          </label>
          <input
            id="rvb-rent"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-rent-growth">
            Rent growth % / yr
          </label>
          <input
            id="rvb-rent-growth"
            type="number"
            min={-10}
            max={20}
            step={0.5}
            className={inputClass}
            value={annualRentGrowthPercent}
            onChange={(e) => setAnnualRentGrowthPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-home-price">
            Home price
          </label>
          <input
            id="rvb-home-price"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-down">
            Down payment %
          </label>
          <input
            id="rvb-down"
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputClass}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-rate">
            Mortgage rate %
          </label>
          <input
            id="rvb-rate"
            type="number"
            min={0}
            max={30}
            step={0.1}
            className={inputClass}
            value={mortgageRatePercent}
            onChange={(e) => setMortgageRatePercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-term">
            Loan term years
          </label>
          <input
            id="rvb-term"
            type="number"
            min={1}
            max={50}
            step={1}
            className={inputClass}
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-appreciation">
            Appreciation % / yr
          </label>
          <input
            id="rvb-appreciation"
            type="number"
            min={-10}
            max={20}
            step={0.5}
            className={inputClass}
            value={annualAppreciationPercent}
            onChange={(e) => setAnnualAppreciationPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-invest">
            Investment return % / yr
          </label>
          <input
            id="rvb-invest"
            type="number"
            min={-20}
            max={30}
            step={0.5}
            className={inputClass}
            value={investmentReturnPercent}
            onChange={(e) => setInvestmentReturnPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-tax">
            Property tax % / yr
          </label>
          <input
            id="rvb-tax"
            type="number"
            min={0}
            max={10}
            step={0.1}
            className={inputClass}
            value={annualPropertyTaxPercent}
            onChange={(e) => setAnnualPropertyTaxPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="rvb-ins-maint">
            Insurance + maintenance / mo
          </label>
          <input
            id="rvb-ins-maint"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyInsuranceAndMaintenance}
            onChange={(e) => setMonthlyInsuranceAndMaintenance(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="rvb-horizon">
            Horizon years (1-30)
          </label>
          <input
            id="rvb-horizon"
            type="number"
            min={1}
            max={30}
            step={1}
            className={inputClass}
            value={horizonYears}
            onChange={(e) => setHorizonYears(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const resultsContent = (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <CalculatorMetric label="Break-even year" value={breakEvenDisplay} />
        <CalculatorMetric
          label="10-year delta (buy - rent)"
          value={formatCurrency(result.costAt10Years.delta)}
          tone={getMonthlyCashFlowTone(-result.costAt10Years.delta)}
        />
      </div>

      <p className="text-xs text-muted">{breakEvenChartCallout}</p>

      <div className="h-[280px] rounded-lg border border-border bg-card p-3 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as {
                  year: number;
                  renting: number;
                  owning: number;
                };
                return (
                  <div className="rounded border border-border bg-card px-3 py-2 text-sm shadow-sm">
                    <p className="font-medium text-foreground">Year {p.year}</p>
                    <p className="text-muted">Renting: {formatCurrency(p.renting)}</p>
                    <p className="text-muted">Owning (net): {formatCurrency(p.owning)}</p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="renting"
              name="Renting"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="owning"
              name="Owning (net of equity)"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            {result.breakEvenYear != null ? (
              <ReferenceLine
                x={result.breakEvenYear}
                stroke="var(--accent)"
                strokeDasharray="4 4"
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-subtle/40 p-3">
        <p className="text-xs font-medium text-muted">Cost comparison</p>
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="text-muted">
              <th className="py-1 text-left font-normal">Horizon</th>
              <th className="py-1 text-right font-normal">Renting</th>
              <th className="py-1 text-right font-normal">Owning</th>
              <th className="py-1 text-right font-normal">Delta</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => (
              <tr key={row.label} className="border-t border-border/50">
                <td className="py-1.5 text-foreground">{row.label}</td>
                <td className="py-1.5 text-right text-foreground">{formatCurrency(row.rent)}</td>
                <td className="py-1.5 text-right text-foreground">{formatCurrency(row.own)}</td>
                <td className="py-1.5 text-right">
                  <span className={`block font-medium ${row.delta <= 0 ? "text-positive" : "text-negative"}`}>
                    {formatCurrency(row.delta)}
                  </span>
                  <span className="block text-muted">{cheaperLabel(row.delta)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCta && (
        <div className="mt-4">
          {isAppShell ? (
            <div className="flex flex-col gap-2">
              <Link href="/analyze" className={`${appCtaClass} w-fit`}>
                Open deal analyzer
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted hover:text-foreground hover:underline"
              >
                Dashboard
              </Link>
            </div>
          ) : isSignedIn ? null : (
            <>
              <FunnelCtaLink
                href="/sign-up?intent=free"
                placement="rent_vs_buy_inline"
                ctaId="rent_vs_buy_signup_free"
                planIntent="free"
                landingVariant={landingVariant}
                className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
              >
                Ready to buy? Track your investment in Veld
              </FunnelCtaLink>
              <div className="mt-2">
                <FunnelCtaLink
                  href="/sign-up?intent=investor"
                  placement="rent_vs_buy_inline"
                  ctaId="rent_vs_buy_signup_investor"
                  planIntent="investor"
                  landingVariant={landingVariant}
                  className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                >
                  Save scenarios & compare options
                </FunnelCtaLink>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const mobileSummaryItems = [
    { label: "Break-even", value: breakEvenDisplay, tone: "default" as const },
    {
      label: "10-year delta",
      value: formatCurrency(result.costAt10Years.delta),
      tone: getMonthlyCashFlowTone(-result.costAt10Years.delta),
    },
  ];

  const mobileSurface = (
    <div className="space-y-0">
      <MobilePageSection title="Break-even" variant="grouped">
        <div className="p-4">
          <CalculatorMetric label="Break-even year" value={breakEvenDisplay} />
        </div>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible label="5 / 10 / 20-year comparison">
          <div className="space-y-2 pt-3">
            {summaryRows.map((row) => (
              <div key={row.label} className="rounded-lg border border-border bg-subtle/40 p-3">
                <p className="text-xs font-medium text-muted">{row.label}</p>
                <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                  <p className="text-muted">Renting</p>
                  <p className="text-muted">Owning</p>
                  <p className="text-muted">Delta</p>
                  <p className="font-medium text-foreground">{formatCurrency(row.rent)}</p>
                  <p className="font-medium text-foreground">{formatCurrency(row.own)}</p>
                  <p className={`font-medium ${row.delta <= 0 ? "text-positive" : "text-negative"}`}>
                    {formatCurrency(row.delta)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted">{cheaperLabel(row.delta)}</p>
              </div>
            ))}
          </div>
        </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection title="Inputs" variant="flat">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="rvb-rent-m">
              Monthly rent
            </label>
            <input
              id="rvb-rent-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-rent-growth-m">
              Rent growth %
            </label>
            <input
              id="rvb-rent-growth-m"
              type="number"
              min={-10}
              max={20}
              step={0.5}
              className={inputClass}
              value={annualRentGrowthPercent}
              onChange={(e) => setAnnualRentGrowthPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-home-price-m">
              Home price
            </label>
            <input
              id="rvb-home-price-m"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-down-m">
              Down %
            </label>
            <input
              id="rvb-down-m"
              type="number"
              min={0}
              max={100}
              step={1}
              className={inputClass}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-rate-m">
              Rate %
            </label>
            <input
              id="rvb-rate-m"
              type="number"
              min={0}
              max={30}
              step={0.1}
              className={inputClass}
              value={mortgageRatePercent}
              onChange={(e) => setMortgageRatePercent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-term-m">
              Term years
            </label>
            <input
              id="rvb-term-m"
              type="number"
              min={1}
              max={50}
              step={1}
              className={inputClass}
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-appreciation-m">
              Appreciation %
            </label>
            <input
              id="rvb-appreciation-m"
              type="number"
              min={-10}
              max={20}
              step={0.5}
              className={inputClass}
              value={annualAppreciationPercent}
              onChange={(e) => setAnnualAppreciationPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-invest-m">
              Invest return %
            </label>
            <input
              id="rvb-invest-m"
              type="number"
              min={-20}
              max={30}
              step={0.5}
              className={inputClass}
              value={investmentReturnPercent}
              onChange={(e) => setInvestmentReturnPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-tax-m">
              Tax %
            </label>
            <input
              id="rvb-tax-m"
              type="number"
              min={0}
              max={10}
              step={0.1}
              className={inputClass}
              value={annualPropertyTaxPercent}
              onChange={(e) => setAnnualPropertyTaxPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rvb-ins-maint-m">
              Ins + Maint / mo
            </label>
            <input
              id="rvb-ins-maint-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyInsuranceAndMaintenance}
              onChange={(e) => setMonthlyInsuranceAndMaintenance(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="rvb-horizon-m">
              Horizon years (1-30)
            </label>
            <input
              id="rvb-horizon-m"
              type="number"
              min={1}
              max={30}
              step={1}
              className={inputClass}
              value={horizonYears}
              onChange={(e) => setHorizonYears(e.target.value)}
            />
          </div>
        </div>
      </MobilePageSection>

      {showCta &&
        (isAppShell ? (
          <div className="space-y-2">
            <Link href="/analyze" className={appCtaClassFullWidth}>
              Open deal analyzer
            </Link>
            <Link
              href="/dashboard"
              className="block text-center text-sm font-medium text-muted hover:text-foreground hover:underline"
            >
              Dashboard
            </Link>
          </div>
        ) : isSignedIn ? null : (
          <div className="space-y-2">
            <FunnelCtaLink
              href="/sign-up?intent=free"
              placement="rent_vs_buy_inline"
              ctaId="rent_vs_buy_signup_free_m"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Ready to buy? Track your investment in Veld
            </FunnelCtaLink>
            <FunnelCtaLink
              href="/sign-up?intent=investor"
              placement="rent_vs_buy_inline"
              ctaId="rent_vs_buy_signup_investor_m"
              planIntent="investor"
              landingVariant={landingVariant}
              className="block text-center text-sm font-medium text-muted hover:text-foreground hover:underline"
            >
              Save scenarios & compare options
            </FunnelCtaLink>
          </div>
        ))}
    </div>
  );

  return (
    <section className="border-0 bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="md:hidden">
        <MobileToolShell
          eyebrow="Calculator"
          title="Rent vs Buy"
          description="Estimate your break-even year and compare 5, 10, and 20-year costs."
          context={
            <p className="text-sm text-muted">
              Break-even {breakEvenDisplay} · 10-year delta {formatCurrency(result.costAt10Years.delta)}
            </p>
          }
          summaryItems={[...mobileSummaryItems]}
          contentClassName="pt-3"
        >
          {mobileSurface}
        </MobileToolShell>
      </div>

      <div className={`hidden gap-5 md:grid md:grid-cols-12 ${compact ? "" : ""}`}>
        <div className={compact ? "md:col-span-5" : "md:col-span-5"}>{inputsContent}</div>
        <div className={compact ? "md:col-span-7" : "md:col-span-7"}>{resultsContent}</div>
      </div>
    </section>
  );
}
