"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CurrencyInput } from "@/components/currency-input";
import { US_STATES } from "@/lib/us-states";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { PropertyMetricsSection } from "../properties/property-metrics-section";

const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "block text-sm font-medium text-muted";

interface DealAnalyzerFormProps {
  dealId?: string;
  dealCount?: number;
  dealLimit?: number;
}

export function DealAnalyzerForm({
  dealId,
  dealCount = 0,
  dealLimit = 5,
}: DealAnalyzerFormProps) {
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingDeal, setLoadingDeal] = useState(!!dealId);

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
      })
      .finally(() => {
        if (!cancelled) setLoadingDeal(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dealId]);

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
    !canSave || (atLimit && !dealId) || saveStatus === "saving";

  const metrics = computePropertyMetrics(
    {
      monthlyRent: monthlyRentNum,
      monthlyExpenses: monthlyExpensesNum,
      estimatedValue: currentValueNum,
      cashInvested: cashInvestedNum,
      totalMortgageBalance: mortgageBalanceNum,
      totalMonthlyPayment: monthlyPaymentNum,
      ownershipPercent: ownershipNum,
      vacancyPercent: vacancyNum,
    },
    "proportional"
  );

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
    setSaveStatus("idle");
    setSaveError(null);
    router.replace("/analyze");
  }

  async function handleSaveDeal() {
    if (saveDisabled) return;
    setSaveStatus("saving");
    setSaveError(null);
    const payload = {
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state,
      zipCode: zipCode.trim(),
      purchasePrice: purchasePriceNum > 0 ? String(purchasePriceNum) : undefined,
      currentEstimatedValue: currentValueNum > 0 ? String(currentValueNum) : undefined,
      currentMonthlyRent: String(monthlyRentNum),
      currentMonthlyExpenses: String(monthlyExpensesNum),
      totalMortgageBalance: mortgageBalanceNum > 0 ? String(mortgageBalanceNum) : undefined,
      totalMonthlyPayment: monthlyPaymentNum > 0 ? String(monthlyPaymentNum) : undefined,
      ownershipPercent: ownershipNum,
      vacancyPercent: vacancyNum,
      cashInvested: cashInvestedNum != null && cashInvestedNum > 0 ? String(cashInvestedNum) : undefined,
    };
    try {
      const url = dealId ? `/api/deals/${dealId}` : "/api/deals";
      const method = dealId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; code?: string };
      if (!res.ok) {
        setSaveError(
          data.code === "PLAN_LIMIT_REACHED"
            ? "Deal limit reached. Upgrade your plan or remove a deal to save more."
            : data.error ?? "Failed to save deal"
        );
        setSaveStatus("error");
        return;
      }
      setSaveStatus("saved");
    } catch {
      setSaveError("Failed to save deal");
      setSaveStatus("error");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">
          {loadingDeal ? "Loading deal…" : "Property details"}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="addressLine1" className={labelClass}>
              Address line 1
            </label>
            <input
              id="addressLine1"
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="123 Main St"
              className={inputClass}
            />
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
                onChange={(v) => {
                  setPurchasePrice(v);
                  if (!currentValue) setCurrentValue(v);
                }}
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
                placeholder={purchasePrice || "Same as price"}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">
                Defaults to purchase price
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="monthlyRent" className={labelClass}>
                Monthly rent
              </label>
              <CurrencyInput
                id="monthlyRent"
                value={monthlyRent}
                onChange={setMonthlyRent}
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
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
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {atLimit && (
            <p className="text-sm text-muted">
              You&apos;ve reached your deal limit.{" "}
              <Link href="/plans" className="font-medium text-foreground hover:underline">
                Upgrade to save more deals
              </Link>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {dealId && (
              <Link
                href={`/properties/new?from=${dealId}`}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
              >
                Add to portfolio
              </Link>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDeal}
                disabled={saveDisabled}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === "saving"
                  ? "Saving…"
                  : saveStatus === "saved"
                    ? "Saved"
                    : dealId
                      ? "Update deal"
                      : "Save deal"}
              </button>
              {dealLimit > 0 && (
                <span className="text-xs text-muted">
                  {dealCount} of {dealLimit} deals saved
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleNewDeal}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
            >
              New deal
            </button>
          </div>
        </div>
        {saveError && (
          <p className="text-sm text-negative">
            {saveError}
            {(saveError.includes("Upgrade") || saveError.includes("limit")) && (
              <>
                {" "}
                <Link href="/plans" className="font-medium text-accent hover:underline">
                  Upgrade plan
                </Link>
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
          }}
        />
      </section>
    </div>
  );
}
