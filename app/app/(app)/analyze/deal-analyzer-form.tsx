"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { UpgradePlanLink } from "@/components/analytics/upgrade-plan-link";
import { useRouter } from "next/navigation";
import { MobileSectionCard } from "@/components/mobile-section-card";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CurrencyInput } from "@/components/currency-input";
import { formatCurrency } from "@/lib/format-currency";
import { useIsMobile } from "@/lib/use-is-mobile";
import { US_STATES } from "@/lib/us-states";
import { computePropertyMetrics, getAnnualDebtService } from "@/lib/metrics/property-metrics";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { PropertyMetricsSection } from "../properties/property-metrics-section";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { AddressAutocompleteInput } from "@/components/property/address-autocomplete-input";
import type { DealPortfolioContext } from "@/lib/server/portfolio-summary-payload";

const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "block text-sm font-medium text-muted";

interface DealAnalyzerFormProps {
  dealId?: string;
  dealCount?: number;
  dealLimit?: number;
}

function DealPortfolioCompareBlock({
  portfolio,
  dealCapRate,
  dealCoc,
  dealDscr,
  dealMonthlyCf,
}: {
  portfolio: DealPortfolioContext;
  dealCapRate: number | null;
  dealCoc: number | null;
  dealDscr: number | null;
  dealMonthlyCf: number;
}) {
  const fmtPct = (p: number | null) => (p != null ? `${(p * 100).toFixed(2)}%` : "—");
  const empty = portfolio.propertyCount === 0;

  if (empty) {
    return (
      <MobileSectionCard className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          Compared to your portfolio
        </h3>
        <p className="text-sm text-muted">
          Add at least one property to your portfolio to compare this deal&apos;s metrics at a glance.
        </p>
        <Link
          href="/properties/new"
          className="inline-flex text-sm font-medium text-accent hover:underline"
        >
          Add property
        </Link>
      </MobileSectionCard>
    );
  }

  return (
    <MobileSectionCard className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Compared to your portfolio
        </h3>
        <p className="mt-1 text-xs text-muted">
          Portfolio uses your ownership display mode and up to {portfolio.propertyCount} included
          properties
          {portfolio.truncated ? " (plan limit applies)" : ""}.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] text-muted">
              <th className="py-2 pr-2 font-medium">Metric</th>
              <th className="py-2 pr-2 font-medium">This deal</th>
              <th className="py-2 font-medium">Portfolio</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr className="border-b border-border/60">
              <td className="py-2 pr-2 text-muted">Cap rate</td>
              <td className="py-2 pr-2 font-medium">{fmtPct(dealCapRate)}</td>
              <td className="py-2 font-medium">{fmtPct(portfolio.weightedCapRate)}</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="py-2 pr-2 text-muted">Cash-on-cash</td>
              <td className="py-2 pr-2 font-medium">{fmtPct(dealCoc)}</td>
              <td className="py-2 font-medium">{fmtPct(portfolio.portfolioCashOnCashReturn)}</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="py-2 pr-2 text-muted">DSCR</td>
              <td className="py-2 pr-2 font-medium">{dealDscr != null ? dealDscr.toFixed(2) : "—"}</td>
              <td className="py-2 font-medium">
                {portfolio.dscr != null ? portfolio.dscr.toFixed(2) : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-2 text-muted">Monthly cash flow</td>
              <td className="py-2 pr-2 font-medium">{formatCurrency(dealMonthlyCf)}</td>
              <td className="py-2 font-medium">{formatCurrency(portfolio.totalMonthlyCashFlow)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted">
        Deal metrics are from the assumptions above; portfolio metrics aggregate saved properties.
      </p>
    </MobileSectionCard>
  );
}

type StressPreset = -10 | 0 | 10;

export function DealAnalyzerForm({
  dealId,
  dealCount = 0,
  dealLimit = 5,
}: DealAnalyzerFormProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [mortgageBalance, setMortgageBalance] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [ownershipPercent, setOwnershipPercent] = useState("100");
  const [vacancyPercent, setVacancyPercent] = useState("5");
  const [cashInvested, setCashInvested] = useState("");
  const [rentStressPercent, setRentStressPercent] = useState<StressPreset>(0);
  const [expenseStressPercent, setExpenseStressPercent] = useState<StressPreset>(0);
  const [activeDealId, setActiveDealId] = useState<string | undefined>(dealId);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadingDeal, setLoadingDeal] = useState(!!dealId);
  const [enrichedBedrooms, setEnrichedBedrooms] = useState<number | null>(null);
  const [enrichedBathrooms, setEnrichedBathrooms] = useState<number | null>(null);
  const [enrichedSqFt, setEnrichedSqFt] = useState<number | null>(null);
  const [enrichedMarketRent, setEnrichedMarketRent] = useState<string | null>(null);
  const [enrichedMarketRentAsOf, setEnrichedMarketRentAsOf] = useState<string | null>(null);
  const [enrichedPropertyType, setEnrichedPropertyType] = useState<string | null>(null);
  const [rentSuggestion, setRentSuggestion] = useState<number | null>(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const enrichmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [portfolioContext, setPortfolioContext] = useState<DealPortfolioContext | null>(null);

  const formSnapshot = useMemo(
    () =>
      JSON.stringify({
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        purchasePrice,
        currentValue,
        monthlyRent,
        monthlyExpenses,
        mortgageBalance,
        monthlyPayment,
        ownershipPercent,
        vacancyPercent,
        cashInvested,
        rentStressPercent,
        expenseStressPercent,
      }),
    [
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      purchasePrice,
      currentValue,
      monthlyRent,
      monthlyExpenses,
      mortgageBalance,
      monthlyPayment,
      ownershipPercent,
      vacancyPercent,
      cashInvested,
      rentStressPercent,
      expenseStressPercent,
    ]
  );

  const [baselineSnapshot, setBaselineSnapshot] = useState<string | null>(null);
  const formSnapshotRef = useRef(formSnapshot);
  useEffect(() => {
    formSnapshotRef.current = formSnapshot;
  }, [formSnapshot]);

  const isDirty =
    baselineSnapshot !== null && formSnapshot !== baselineSnapshot;

  useEffect(() => {
    if (loadingDeal) return;
    // Defer out of effect body (avoids react-hooks/set-state-in-effect cascade warning).
    queueMicrotask(() => {
      setBaselineSnapshot((prev) => {
        if (prev !== null) return prev;
        return formSnapshotRef.current;
      });
    });
  }, [loadingDeal, dealId]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!dealId) return;
    let cancelled = false;
    fetch(`/api/deals/${dealId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setAddressLine1(data.addressLine1 ?? "");
        setAddressLine2(data.addressLine2 ?? "");
        setCity(data.city ?? "");
        setState(data.state ?? "");
        setZipCode(data.zipCode ?? "");
        setPurchasePrice(data.purchasePrice ?? "");
        setCurrentValue(data.currentEstimatedValue ?? "");
        setMonthlyRent(data.currentMonthlyRent ?? "");
        setMonthlyExpenses(data.currentMonthlyExpenses ?? "");
        setMortgageBalance(data.totalMortgageBalance ?? "");
        setMonthlyPayment(data.totalMonthlyPayment ?? "");
        setOwnershipPercent(String(data.ownershipPercent ?? 100));
        setVacancyPercent(String(data.vacancyPercent ?? 5));
        setCashInvested(data.cashInvested ?? "");
        if (data.bedrooms != null) setEnrichedBedrooms(data.bedrooms);
        if (data.bathrooms != null) setEnrichedBathrooms(data.bathrooms);
        if (data.squareFeet != null) setEnrichedSqFt(data.squareFeet);
        if (data.propertyType) setEnrichedPropertyType(data.propertyType);
        if (data.marketRent != null) setEnrichedMarketRent(data.marketRent);
        if (data.marketRentAsOf) setEnrichedMarketRentAsOf(data.marketRentAsOf);
        if (data.portfolioContext) {
          setPortfolioContext(data.portfolioContext as DealPortfolioContext);
        } else {
          setPortfolioContext(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDeal(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dealId]);

  useEffect(() => {
    return () => {
      if (enrichmentTimerRef.current != null) clearTimeout(enrichmentTimerRef.current);
    };
  }, []);

  const runEnrichment = useCallback(async (addr: { addressLine1: string; city: string; state: string; zipCode: string }) => {
    if (!addr.addressLine1?.trim() || !addr.city?.trim() || !addr.state?.trim() || !addr.zipCode?.trim()) return;
    setEnrichmentLoading(true);
    try {
      const valueParams = new URLSearchParams({
        addressLine1: addr.addressLine1,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
      });
      const valueRes = await fetch(`/api/estimates/value?${valueParams.toString()}`);
      const valueJson = (await valueRes.json().catch(() => ({}))) as {
        value?: number;
        bedrooms?: number;
        bathrooms?: number;
        squareFootage?: number;
      };
      if (valueRes.ok && valueJson.value != null && Number.isFinite(valueJson.value)) {
        const val = String(Math.round(valueJson.value));
        setCurrentValue((prev) => prev.trim() ? prev : val);
        if (valueJson.bedrooms != null) setEnrichedBedrooms(valueJson.bedrooms);
        if (valueJson.bathrooms != null) setEnrichedBathrooms(valueJson.bathrooms);
        if (valueJson.squareFootage != null) setEnrichedSqFt(valueJson.squareFootage);
      }
    } catch {
      // Silent — enrichment is best-effort
    }
    try {
      const rentParams = new URLSearchParams({
        addressLine1: addr.addressLine1,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
      });
      const rentRes = await fetch(`/api/estimates/rent?${rentParams.toString()}`);
      const rentJson = (await rentRes.json().catch(() => ({}))) as {
        rent?: number;
        marketRent?: number;
        marketRentAsOf?: string;
      };
      if (rentRes.ok && rentJson.rent != null && Number.isFinite(rentJson.rent)) {
        const today = new Date().toISOString().slice(0, 10);
        const mRent = rentJson.marketRent != null && Number.isFinite(rentJson.marketRent)
          ? String(Math.round(rentJson.marketRent))
          : String(Math.round(rentJson.rent));
        setEnrichedMarketRent(mRent);
        setEnrichedMarketRentAsOf(
          typeof rentJson.marketRentAsOf === "string" && rentJson.marketRentAsOf
            ? rentJson.marketRentAsOf
            : today
        );
        setRentSuggestion(Math.round(rentJson.rent));
      }
    } catch {
      // Silent
    } finally {
      setEnrichmentLoading(false);
    }
  }, []);

  function handleAddressSelect(address: { addressLine1: string; city: string; state: string; zipCode: string }) {
    setAddressLine1(address.addressLine1);
    setCity(address.city);
    setState(address.state.toUpperCase());
    setZipCode(address.zipCode);
    if (enrichmentTimerRef.current != null) clearTimeout(enrichmentTimerRef.current);
    enrichmentTimerRef.current = setTimeout(() => {
      void runEnrichment(address);
    }, 300);
  }

  const purchasePriceNum = parseFloat(purchasePrice.replace(/,/g, "")) || 0;
  const currentValueNum =
    parseFloat(currentValue.replace(/,/g, "")) || purchasePriceNum || 0;
  const monthlyRentNum = parseFloat(monthlyRent.replace(/,/g, "")) || 0;
  const monthlyExpensesNum = parseFloat(monthlyExpenses.replace(/,/g, "")) || 0;
  const mortgageBalanceNum = parseFloat(mortgageBalance.replace(/,/g, "")) || 0;
  const monthlyPaymentNum = parseFloat(monthlyPayment.replace(/,/g, "")) || 0;
  const ownershipNum = Math.min(100, Math.max(1, parseInt(ownershipPercent, 10) || 100));
  const vacancyNum = Math.min(100, Math.max(0, parseInt(vacancyPercent, 10) || 5));
  const cashInvestedNum = parseFloat(cashInvested.replace(/,/g, "")) || null;
  const effectiveMonthlyRentNum = Math.max(
    0,
    monthlyRentNum * (1 + rentStressPercent / 100)
  );
  const effectiveMonthlyExpensesNum = Math.max(
    0,
    monthlyExpensesNum * (1 + expenseStressPercent / 100)
  );
  const stressActive = rentStressPercent !== 0 || expenseStressPercent !== 0;

  const canSave =
    addressLine1.trim() &&
    city.trim() &&
    state &&
    zipCode.trim() &&
    (purchasePriceNum > 0 || currentValueNum > 0) &&
    monthlyRentNum >= 0 &&
    monthlyExpensesNum >= 0;
  const atLimit = dealCount >= dealLimit;
  const saveDisabled =
    !canSave || (atLimit && !activeDealId) || saveStatus === "saving";

  const metrics = computePropertyMetrics(
    {
      monthlyRent: effectiveMonthlyRentNum,
      monthlyExpenses: effectiveMonthlyExpensesNum,
      estimatedValue: currentValueNum,
      cashInvested: cashInvestedNum,
      totalMortgageBalance: mortgageBalanceNum,
      totalMonthlyPayment: monthlyPaymentNum,
      ownershipPercent: ownershipNum,
      vacancyPercent: vacancyNum,
    },
    "proportional"
  );
  const annualDebtService = getAnnualDebtService(monthlyPaymentNum, ownershipNum, "proportional");
  const dscr = annualDebtService > 0 ? metrics.noi / annualDebtService : null;
  const needsInputGuidance =
    currentValueNum <= 0 || (monthlyRentNum <= 0 && monthlyExpensesNum <= 0);
  const cashFlowSignal = needsInputGuidance
    ? "Enter rent to analyze"
    : metrics.monthlyCashFlow > 0
      ? "Healthy cash flow"
      : metrics.monthlyCashFlow < 0
        ? "Negative cash flow"
        : "Breaking even";
  const cashFlowTone = needsInputGuidance
    ? "text-muted"
    : metrics.monthlyCashFlow > 0
      ? "text-positive"
      : metrics.monthlyCashFlow < 0
        ? "text-negative"
        : "text-muted";
  const dscrSignal =
    dscr == null ? "No debt payment" : dscr >= 1.2 ? "DSCR above 1.2" : dscr >= 1 ? "DSCR near breakeven" : "DSCR below 1.0";
  const dscrTone =
    dscr == null ? "text-muted" : dscr >= 1.2 ? "text-positive" : dscr >= 1 ? "text-warning" : "text-negative";

  function handleNewDeal() {
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setZipCode("");
    setPurchasePrice("");
    setCurrentValue("");
    setMonthlyRent("");
    setMonthlyExpenses("");
    setMortgageBalance("");
    setMonthlyPayment("");
    setOwnershipPercent("100");
    setVacancyPercent("5");
    setCashInvested("");
    setRentStressPercent(0);
    setExpenseStressPercent(0);
    setActiveDealId(undefined);
    setSaveStatus("idle");
    setSaveError(null);
    setShowSavedToast(false);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setEnrichedBedrooms(null);
    setEnrichedBathrooms(null);
    setEnrichedSqFt(null);
    setEnrichedMarketRent(null);
    setEnrichedMarketRentAsOf(null);
    setEnrichedPropertyType(null);
    setRentSuggestion(null);
    setEnrichmentLoading(false);
    setPortfolioContext(null);
    router.replace("/analyze");
  }

  async function handleSaveDeal() {
    if (saveDisabled) return;
    setSaveStatus("saving");
    setSaveError(null);
    const payload = {
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || null,
      city: city.trim(),
      state,
      zipCode: zipCode.trim(),
      purchasePrice: purchasePriceNum > 0 ? String(purchasePriceNum) : null,
      currentEstimatedValue: currentValueNum > 0 ? String(currentValueNum) : null,
      currentMonthlyRent: String(monthlyRentNum),
      currentMonthlyExpenses: String(monthlyExpensesNum),
      totalMortgageBalance: mortgageBalanceNum > 0 ? String(mortgageBalanceNum) : undefined,
      totalMonthlyPayment: monthlyPaymentNum > 0 ? String(monthlyPaymentNum) : undefined,
      ownershipPercent: ownershipNum,
      vacancyPercent: vacancyNum,
      cashInvested: cashInvestedNum != null && cashInvestedNum > 0 ? String(cashInvestedNum) : null,
      bedrooms: enrichedBedrooms,
      bathrooms: enrichedBathrooms,
      squareFeet: enrichedSqFt,
      propertyType: enrichedPropertyType,
      marketRent: enrichedMarketRent,
      marketRentAsOf: enrichedMarketRentAsOf,
    };
    try {
      const url = activeDealId ? `/api/deals/${activeDealId}` : "/api/deals";
      const method = activeDealId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        id?: string;
      };
      if (!res.ok) {
        if (!activeDealId && data.code === "PLAN_LIMIT_REACHED") {
          captureClientEvent(AnalyticsEvents.PLAN_LIMIT_HIT, {
            resource: "deal",
          });
        }
        setSaveError(
          data.code === "PLAN_LIMIT_REACHED"
            ? "Deal limit reached. Upgrade your plan or remove a deal to save more."
            : data.error ?? "Failed to save deal"
        );
        setSaveStatus("error");
        return;
      }
      if (method === "POST" && typeof data.id === "string") {
        captureClientEvent(AnalyticsEvents.DEAL_CREATED, { deal_id: data.id });
        setActiveDealId(data.id);
        window.history.replaceState(null, "", `/analyze?deal=${data.id}`);
      }
      setSaveStatus("saved");
      queueMicrotask(() => {
        setBaselineSnapshot(formSnapshotRef.current);
      });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setShowSavedToast(true);
      toastTimerRef.current = setTimeout(() => setShowSavedToast(false), 4000);
    } catch {
      setSaveError("Failed to save deal");
      setSaveStatus("error");
    }
  }

  const mobileInputsSurface = (
    <section className="space-y-3.5">
      <MobileSectionCard className="space-y-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {loadingDeal ? "Loading deal…" : "Deal assumptions"}
        </h2>

        <MobileSectionCard tone="subtle" className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Basics
          </p>
          <div>
            <label htmlFor="addressLine1-mobile" className={labelClass}>
              Address line 1
            </label>
            <AddressAutocompleteInput
              id="addressLine1-mobile"
              value={addressLine1}
              onValueChange={setAddressLine1}
              onSelect={handleAddressSelect}
              autoComplete="street-address"
              className={inputClass}
            />
            {enrichmentLoading && (
              <p className="mt-1 text-xs text-muted">Fetching property data...</p>
            )}
          </div>
          <MobileCollapsible label="Add unit / apt (optional)" defaultOpen={!!addressLine2}>
            <div className="pt-3">
              <label htmlFor="addressLine2-mobile" className={labelClass}>
                Address line 2
              </label>
              <input
                id="addressLine2-mobile"
                type="text"
                autoComplete="address-line2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apt 4"
                className={inputClass}
              />
            </div>
          </MobileCollapsible>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label htmlFor="city-mobile" className={labelClass}>
                City
              </label>
              <input
                id="city-mobile"
                type="text"
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dallas"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="state-mobile" className={labelClass}>
                State
              </label>
              <select
                id="state-mobile"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {US_STATES.map((abbr) => (
                  <option key={abbr} value={abbr}>
                    {abbr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="zipCode-mobile" className={labelClass}>
                ZIP
              </label>
              <input
                id="zipCode-mobile"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="75201"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="purchasePrice-mobile" className={labelClass}>
                Purchase price
              </label>
              <CurrencyInput
                id="purchasePrice-mobile"
                value={purchasePrice}
                onChange={setPurchasePrice}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="currentValue-mobile" className={labelClass}>
                Current value
              </label>
              <CurrencyInput
                id="currentValue-mobile"
                value={currentValue}
                onChange={setCurrentValue}
                placeholder={purchasePrice || undefined}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">
                {currentValue.trim() && enrichedBedrooms != null
                  ? "Autofilled from property estimate"
                  : "Defaults to purchase price"}
              </p>
            </div>
          </div>
        </MobileSectionCard>

        <MobileSectionCard tone="subtle" className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Income and expenses
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="monthlyRent-mobile" className={labelClass}>
                Monthly rent
              </label>
              <CurrencyInput
                id="monthlyRent-mobile"
                value={monthlyRent}
                onChange={(v) => {
                  setMonthlyRent(v);
                  if (rentSuggestion != null && v && parseFloat(v.replace(/,/g, "")) !== rentSuggestion) {
                    setRentSuggestion(null);
                  }
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="monthlyExpenses-mobile" className={labelClass}>
                Monthly expenses
              </label>
              <CurrencyInput
                id="monthlyExpenses-mobile"
                value={monthlyExpenses}
                onChange={setMonthlyExpenses}
                className={inputClass}
              />
            </div>
            {rentSuggestion != null && (
              <div className="col-span-2 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                <span className="text-sm text-foreground">
                  Market rent estimate: <span className="font-medium">{formatCurrency(rentSuggestion)}/mo</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMonthlyRent(String(rentSuggestion));
                    setRentSuggestion(null);
                  }}
                  className="shrink-0 text-sm font-medium text-accent hover:underline"
                >
                  Use this
                </button>
              </div>
            )}
            <div className="col-span-2">
              <label htmlFor="vacancyPercent-mobile" className={labelClass}>
                Vacancy %
              </label>
              <input
                id="vacancyPercent-mobile"
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                value={vacancyPercent}
                onChange={(e) => setVacancyPercent(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </MobileSectionCard>

        <MobileSectionCard tone="subtle">
          <MobileCollapsible
            label={mortgageBalance || monthlyPayment || cashInvested ? "Debt and ownership" : "Add debt and ownership"}
            defaultOpen={!!dealId || !!mortgageBalance || !!monthlyPayment}
          >
            <div className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mortgageBalance-mobile" className={labelClass}>
                    Mortgage balance
                  </label>
                  <CurrencyInput
                    id="mortgageBalance-mobile"
                    value={mortgageBalance}
                    onChange={setMortgageBalance}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="monthlyPayment-mobile" className={labelClass}>
                    Monthly payment
                  </label>
                  <CurrencyInput
                    id="monthlyPayment-mobile"
                    value={monthlyPayment}
                    onChange={setMonthlyPayment}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cashInvested-mobile" className={labelClass}>
                    Cash invested
                  </label>
                  <CurrencyInput
                    id="cashInvested-mobile"
                    value={cashInvested}
                    onChange={setCashInvested}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="ownershipPercent-mobile-debt" className={labelClass}>
                    Ownership %
                  </label>
                  <input
                    id="ownershipPercent-mobile-debt"
                    type="number"
                    min={1}
                    max={100}
                    inputMode="numeric"
                    value={ownershipPercent}
                    onChange={(e) => setOwnershipPercent(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </MobileCollapsible>
        </MobileSectionCard>
      </MobileSectionCard>
    </section>
  );

  const mobileResultsSurface = (
    <section className="space-y-3.5">
      {activeDealId && portfolioContext && (
        <DealPortfolioCompareBlock
          portfolio={portfolioContext}
          dealCapRate={metrics.capRate}
          dealCoc={metrics.cashOnCashReturn}
          dealDscr={dscr}
          dealMonthlyCf={metrics.monthlyCashFlow}
        />
      )}
      <MobileSectionCard className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Live result
            </h3>
            <p className="mt-1 text-sm text-muted">{cashFlowSignal}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted">Cash flow</p>
            <p className={`mt-1 text-lg font-semibold ${cashFlowTone}`}>
              {formatCurrency(metrics.monthlyCashFlow)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-background/45 px-3 py-2.5">
            <p className="text-[11px] text-muted">Cap rate</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {metrics.capRate != null ? `${(metrics.capRate * 100).toFixed(2)}%` : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-background/45 px-3 py-2.5">
            <p className="text-[11px] text-muted">DSCR</p>
            <p className={`mt-1 text-base font-semibold ${dscrTone}`}>
              {dscr != null ? dscr.toFixed(2) : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-background/45 px-3 py-2.5">
            <p className="text-[11px] text-muted">Cash-on-cash</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {metrics.cashOnCashReturn != null
                ? `${(metrics.cashOnCashReturn * 100).toFixed(2)}%`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-background/45 px-3 py-2.5">
            <p className="text-[11px] text-muted">Equity</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {formatCurrency(metrics.equity)}
            </p>
          </div>
        </div>

      </MobileSectionCard>

      <MobileSectionCard tone="subtle">
        <MobileCollapsible label="Stress test" defaultOpen={stressActive}>
          <div className="space-y-3 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Sensitivity
              </p>
              {stressActive && (
                <button
                  type="button"
                  onClick={() => {
                    setRentStressPercent(0);
                    setExpenseStressPercent(0);
                  }}
                  className="text-xs font-medium text-muted hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Rent sensitivity
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {([-10, 0, 10] as const).map((preset) => {
                  const active = rentStressPercent === preset;
                  return (
                    <button
                      key={`mobile-rent-${preset}`}
                      type="button"
                      onClick={() => setRentStressPercent(preset)}
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-md border px-2.5 text-xs transition ${
                        active
                          ? "border-accent/50 bg-subtle text-foreground"
                          : "border-border bg-background text-muted hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      {preset > 0 ? `+${preset}%` : `${preset}%`}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Expense sensitivity
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {([-10, 0, 10] as const).map((preset) => {
                  const active = expenseStressPercent === preset;
                  return (
                    <button
                      key={`mobile-exp-${preset}`}
                      type="button"
                      onClick={() => setExpenseStressPercent(preset)}
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-md border px-2.5 text-xs transition ${
                        active
                          ? "border-accent/50 bg-subtle text-foreground"
                          : "border-border bg-background text-muted hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      {preset > 0 ? `+${preset}%` : `${preset}%`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </MobileCollapsible>
      </MobileSectionCard>

      <MobileSectionCard tone="subtle">
        <MobileCollapsible label="Full metrics">
          <div className="pt-3">
            <PropertyMetricsSection
              metrics={{
                monthlyCashFlow: metrics.monthlyCashFlow,
                annualCashFlow: metrics.annualCashFlow,
                equity: metrics.equity,
                capRate: metrics.capRate,
                ltv: metrics.ltv,
                cashOnCashReturn: metrics.cashOnCashReturn,
                noi: metrics.noi,
                dscr,
                annualRent: metrics.grossAnnualRent,
              }}
            />
          </div>
        </MobileCollapsible>
      </MobileSectionCard>
    </section>
  );

  const analyzerLocation = [city.trim(), state.trim()].filter(Boolean).join(", ");
  const mobileHeader = (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Active deal
        </p>
        <p className="text-sm font-medium text-foreground">
          {loadingDeal
            ? "Loading analysis..."
            : addressLine1.trim() || (activeDealId ? "Saved deal" : "Unsaved analysis")}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted">
            {analyzerLocation || "Enter address, rent, and expenses to start."}
          </p>
          {dealLimit > 0 && (
            <span className="shrink-0 text-xs text-muted">
              · {dealCount}/{dealLimit} saved
            </span>
          )}
        </div>
      </div>
      {saveError && (
        <p className="rounded-xl border border-negative/30 bg-negative/10 px-3 py-2 text-sm text-negative">
          {saveError}
        </p>
      )}
      {atLimit && !activeDealId && (
        <p className="text-sm text-muted">
          You&apos;ve reached your deal limit.{" "}
          <UpgradePlanLink
            placement="deal_analyzer_header_deal_limit"
            className="font-medium text-foreground hover:underline"
          >
            Upgrade to save more deals
          </UpgradePlanLink>
          .
        </p>
      )}
    </div>
  );

  const mobileSummaryItems = [
    {
      label: "Cash flow",
      value: formatCurrency(metrics.monthlyCashFlow),
      tone: needsInputGuidance
        ? "default"
        : metrics.monthlyCashFlow >= 0
          ? "positive"
          : "negative",
    },
    {
      label: "Cap rate",
      value: metrics.capRate != null ? `${(metrics.capRate * 100).toFixed(2)}%` : "—",
    },
    {
      label: "DSCR",
      value: dscr != null ? dscr.toFixed(2) : "—",
      tone:
        dscr == null ? "default" : dscr >= 1.2 ? "positive" : dscr >= 1 ? "warning" : "negative",
    },
    {
      label: "Cash-on-cash",
      value:
        metrics.cashOnCashReturn != null
          ? `${(metrics.cashOnCashReturn * 100).toFixed(2)}%`
          : "—",
    },
  ] as const;

  const mobileFooter = (
    <div className="space-y-3">
      {showSavedToast && (
        <div className="flex items-center justify-between rounded-xl border border-positive/30 bg-positive/10 px-3 py-2">
          <span className="text-sm font-medium text-positive">Deal saved</span>
          <Link href="/deals" className="text-sm font-medium text-foreground hover:underline">
            View saved deals →
          </Link>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSaveDeal}
          disabled={saveDisabled}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveStatus === "saving"
            ? "Saving..."
            : activeDealId
              ? "Update deal"
              : "Save deal"}
        </button>
        <button
          type="button"
          onClick={handleNewDeal}
          className="rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground"
        >
          New deal
        </button>
      </div>
      <p className="text-xs text-muted">
        Saved analyses stay available in the full desktop workflow too.
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <MobileToolShell
        eyebrow="Analyzer"
        title="Deal Analyzer"
        context={mobileHeader}
        summaryItems={[...mobileSummaryItems]}
        footer={mobileFooter}
        contentClassName="pt-3"
      >
        <div className="space-y-3">
          {mobileInputsSurface}
          {mobileResultsSurface}
        </div>
      </MobileToolShell>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <section className="xl:col-span-7 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {loadingDeal ? "Loading deal…" : "Deal assumptions"}
          </h2>
          <p className="mt-1 text-xs text-muted">
            Update assumptions below to see live investment outcomes.
          </p>
        </div>

        <div className="space-y-3.5">
          <div className="rounded-md border border-border/70 bg-background/45 p-3.5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Basics</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="addressLine1" className={labelClass}>
                  Address line 1
                </label>
                <AddressAutocompleteInput
                  id="addressLine1"
                  value={addressLine1}
                  onValueChange={setAddressLine1}
                  onSelect={handleAddressSelect}
                  className={inputClass}
                />
                {enrichmentLoading && (
                  <p className="mt-1 text-xs text-muted">Fetching property data...</p>
                )}
              </div>
              <div>
                <label htmlFor="addressLine2" className={labelClass}>
                  Address line 2 (optional)
                </label>
                <input
                  id="addressLine2"
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt 4"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dallas"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>
                    State
                  </label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {US_STATES.map((abbr) => (
                      <option key={abbr} value={abbr}>
                        {abbr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="zipCode" className={labelClass}>
                    ZIP
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="75201"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="purchasePrice" className={labelClass}>
                    Purchase price
                  </label>
                  <CurrencyInput
                    id="purchasePrice"
                    value={purchasePrice}
                    onChange={setPurchasePrice}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="currentValue" className={labelClass}>
                    Current value
                  </label>
                  <CurrencyInput
                    id="currentValue"
                    value={currentValue}
                    onChange={setCurrentValue}
                    placeholder={purchasePrice || undefined}
                    className={inputClass}
                  />
                  <p className="mt-0.5 text-xs text-muted">
                    {currentValue.trim() && enrichedBedrooms != null
                      ? "Autofilled from property estimate"
                      : "Defaults to purchase price"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border/70 bg-background/45 p-3.5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Income and expenses
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="monthlyRent" className={labelClass}>
                  Monthly rent
                </label>
                <CurrencyInput
                  id="monthlyRent"
                  value={monthlyRent}
                  onChange={(v) => {
                    setMonthlyRent(v);
                    if (rentSuggestion != null && v && parseFloat(v.replace(/,/g, "")) !== rentSuggestion) {
                      setRentSuggestion(null);
                    }
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="monthlyExpenses" className={labelClass}>
                  Monthly expenses
                </label>
                <CurrencyInput
                  id="monthlyExpenses"
                  value={monthlyExpenses}
                  onChange={setMonthlyExpenses}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="vacancyPercent" className={labelClass}>
                  Vacancy %
                </label>
                <input
                  id="vacancyPercent"
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  value={vacancyPercent}
                  onChange={(e) => setVacancyPercent(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            {rentSuggestion != null && (
              <div className="md:mt-3 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                <span className="text-sm text-foreground">
                  Market rent estimate: <span className="font-medium">{formatCurrency(rentSuggestion)}/mo</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMonthlyRent(String(rentSuggestion));
                    setRentSuggestion(null);
                  }}
                  className="shrink-0 text-sm font-medium text-accent hover:underline"
                >
                  Use this
                </button>
              </div>
            )}
          </div>

          <MobileCollapsible label="Debt and ownership" defaultOpen={!!dealId || !!mortgageBalance}>
          <div className="rounded-md border border-border/70 bg-background/45 p-3.5">
            <h3 className="mb-3 hidden text-xs font-semibold uppercase tracking-wide text-muted md:block">
              Debt and ownership
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
              <div>
                <label htmlFor="mortgageBalance" className={labelClass}>
                  Mortgage balance (optional)
                </label>
                <CurrencyInput
                  id="mortgageBalance"
                  value={mortgageBalance}
                  onChange={setMortgageBalance}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="monthlyPayment" className={labelClass}>
                  Monthly payment (optional)
                </label>
                <CurrencyInput
                  id="monthlyPayment"
                  value={monthlyPayment}
                  onChange={setMonthlyPayment}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cashInvested" className={labelClass}>
                  Cash invested (optional)
                </label>
                <CurrencyInput
                  id="cashInvested"
                  value={cashInvested}
                  onChange={setCashInvested}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="ownershipPercent" className={labelClass}>
                Ownership %
              </label>
              <input
                id="ownershipPercent"
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                value={ownershipPercent}
                onChange={(e) => setOwnershipPercent(e.target.value)}
                className={`${inputClass} max-w-xs`}
              />
              <p className="mt-1 text-xs text-muted">
                Analyze uses proportional ownership semantics (your share of rent, expenses,
                and debt service). Full liability mode does not apply in this workspace.
              </p>
            </div>
          </div>
          </MobileCollapsible>
        </div>
      </section>

      <section className="space-y-3.5 xl:col-span-5 xl:sticky xl:top-20 xl:self-start">
        <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Deal actions
              </h3>
              {dealLimit > 0 && (
                <span className="text-xs text-muted">
                  {dealCount} of {dealLimit} saved
                </span>
              )}
            </div>
            {atLimit && (
              <p className="text-sm text-muted">
                You&apos;ve reached your deal limit.{" "}
                <UpgradePlanLink
                  placement="deal_analyzer_actions_deal_limit"
                  className="font-medium text-foreground hover:underline"
                >
                  Upgrade to save more deals
                </UpgradePlanLink>
              </p>
            )}
            {showSavedToast && (
              <div className="flex items-center justify-between rounded-lg border border-positive/30 bg-positive/10 px-3 py-2">
                <span className="text-sm font-medium text-positive">Deal saved</span>
                <Link href="/deals" className="text-sm font-medium text-foreground hover:underline">
                  View saved deals →
                </Link>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDeal}
                disabled={saveDisabled}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saveStatus === "saving"
                  ? "Saving…"
                  : activeDealId
                    ? "Update deal"
                    : "Save deal"}
              </button>
              <button
                type="button"
                onClick={handleNewDeal}
                className="rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground"
              >
                New deal
              </button>
              <Link
                href="/deals"
                className="rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground"
              >
                Open saved deals
              </Link>
            </div>
          </div>
        </div>

        {activeDealId && (
          <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Convert to property
            </h3>
            <p className="mt-1 text-sm text-muted">
              Move this analyzed deal into your portfolio using prefilled property setup fields.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/properties/new?from=${activeDealId}`}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Add this deal to portfolio
              </Link>
              <Link
                href="/deals"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Open saved deals
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted">
              You can still edit any value before saving the property.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Stress test
            </h3>
            {stressActive && (
              <button
                type="button"
                onClick={() => {
                  setRentStressPercent(0);
                  setExpenseStressPercent(0);
                }}
                className="text-xs font-medium text-muted hover:text-foreground"
              >
                Reset stress
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">
            Apply quick sensitivity presets without changing saved baseline inputs.
          </p>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Rent sensitivity
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {([-10, 0, 10] as const).map((preset) => {
                  const active = rentStressPercent === preset;
                  return (
                    <button
                      key={`rent-${preset}`}
                      type="button"
                      onClick={() => setRentStressPercent(preset)}
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-md border px-2.5 text-xs transition ${
                        active
                          ? "border-accent/50 bg-subtle text-foreground"
                          : "border-border bg-background text-muted hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      {preset > 0 ? `+${preset}%` : `${preset}%`}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Expense sensitivity
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {([-10, 0, 10] as const).map((preset) => {
                  const active = expenseStressPercent === preset;
                  return (
                    <button
                      key={`exp-${preset}`}
                      type="button"
                      onClick={() => setExpenseStressPercent(preset)}
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-md border px-2.5 text-xs transition ${
                        active
                          ? "border-accent/50 bg-subtle text-foreground"
                          : "border-border bg-background text-muted hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      {preset > 0 ? `+${preset}%` : `${preset}%`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Deal signal
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-border/70 bg-background/50 px-2.5 py-1.5">
              <p className="text-[11px] text-muted">Monthly cash flow</p>
              <p className={`mt-1 text-sm font-semibold ${cashFlowTone}`}>
                {formatCurrency(metrics.monthlyCashFlow)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{cashFlowSignal}</p>
            </div>
            <div className="rounded-md border border-border/70 bg-background/50 px-2.5 py-1.5">
              <p className="text-[11px] text-muted">DSCR</p>
              <p className={`mt-1 text-sm font-semibold ${dscrTone}`}>
                {dscr != null ? dscr.toFixed(2) : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{dscrSignal}</p>
            </div>
            <div className="rounded-md border border-border/70 bg-background/50 px-2.5 py-1.5">
              <p className="text-[11px] text-muted">Cap rate</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {metrics.capRate != null ? `${(metrics.capRate * 100).toFixed(2)}%` : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                {metrics.capRate != null
                  ? metrics.capRate >= 0.06
                    ? "Higher yield profile"
                    : "Lower yield profile"
                  : "Needs value and NOI"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-border/70 bg-background/45 px-2 py-1 text-muted">
              Ownership: <span className="font-medium text-foreground">{ownershipNum}%</span>
            </span>
            <span className="rounded-md border border-border/70 bg-background/45 px-2 py-1 text-muted">
              Vacancy: <span className="font-medium text-foreground">{vacancyNum}%</span>
            </span>
            <span className="rounded-md border border-border/70 bg-background/45 px-2 py-1 text-muted">
              Debt:{" "}
              <span className="font-medium text-foreground">
                {monthlyPaymentNum > 0
                  ? `${formatCurrency(monthlyPaymentNum)}/mo`
                  : "No monthly payment"}
              </span>
            </span>
            {stressActive && (
              <span className="rounded-md border border-accent/40 bg-subtle px-2 py-1 text-foreground">
                Stress mode: rent {rentStressPercent > 0 ? "+" : ""}
                {rentStressPercent}%, expenses{" "}
                {expenseStressPercent > 0 ? "+" : ""}
                {expenseStressPercent}%
              </span>
            )}
          </div>
        </div>

        {activeDealId && portfolioContext && (
          <DealPortfolioCompareBlock
            portfolio={portfolioContext}
            dealCapRate={metrics.capRate}
            dealCoc={metrics.cashOnCashReturn}
            dealDscr={dscr}
            dealMonthlyCf={metrics.monthlyCashFlow}
          />
        )}

        {saveError && (
          <p className="text-sm text-negative">
            {saveError}
            {(saveError.includes("Upgrade") || saveError.includes("limit")) && (
              <>
                {" "}
                <UpgradePlanLink
                  placement="deal_analyzer_save_error_limit"
                  className="font-medium text-accent hover:underline"
                >
                  Upgrade plan
                </UpgradePlanLink>
              </>
            )}
          </p>
        )}
        <PropertyMetricsSection
          metrics={{
            monthlyCashFlow: metrics.monthlyCashFlow,
            annualCashFlow: metrics.annualCashFlow,
            equity: metrics.equity,
            capRate: metrics.capRate,
            ltv: metrics.ltv,
            cashOnCashReturn: metrics.cashOnCashReturn,
            noi: metrics.noi,
            dscr,
            annualRent: metrics.grossAnnualRent,
          }}
        />
        {needsInputGuidance && (
          <p className="text-xs text-muted">
            Enter value plus rent/expenses to generate richer decision signals and metrics.
          </p>
        )}
      </section>

      {/* Mobile sticky results bar */}
      {!needsInputGuidance && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card px-4 pt-2.5 md:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="text-[11px] text-muted">Cash flow</p>
              <p className={`font-semibold ${cashFlowTone}`}>
                {formatCurrency(metrics.monthlyCashFlow)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted">Cap rate</p>
              <p className="font-semibold text-foreground">
                {metrics.capRate != null ? `${(metrics.capRate * 100).toFixed(2)}%` : "—"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted">DSCR</p>
              <p className={`font-semibold ${dscrTone}`}>
                {dscr != null ? dscr.toFixed(2) : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
