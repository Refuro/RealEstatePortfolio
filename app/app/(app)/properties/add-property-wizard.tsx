"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDraft, hasAnyWizardData } from "../draft-context";
import { CurrencyInput } from "@/components/currency-input";
import { formatCurrency } from "@/lib/format-currency";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { US_STATES } from "@/lib/us-states";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-utils";
import { createMortgageSchema, validateEscrowAmount } from "@/lib/validations/mortgage";
import {
  MortgageFormFields,
  defaultMortgageFormData,
  type MortgageFormData,
} from "./mortgage-form-fields";
import { PropertySquareFeetField } from "@/components/property/property-square-feet-field";
import { AddressAutocompleteInput } from "@/components/property/address-autocomplete-input";
import { RentCastQuotaHint } from "@/components/rentcast-quota-hint";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import {
  addPropertyMilestoneKey,
  hasFiredSession,
  markFiredSession,
} from "@/lib/analytics-dedup";
import { Check, DollarSign, Landmark, MapPin, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/lib/use-is-mobile";
import { MobileToolShell } from "@/components/mobile-tool-shell";

export type WizardData = {
  nickname: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  units: string;
  ownershipPercent: string;
  purchasePrice: string;
  purchaseDate: string;
  currentEstimatedValue: string;
  cashInvested: string;
  isRented: boolean;
  currentMonthlyRent: string;
  unitRents: string[];
  currentMonthlyExpenses: string;
  vacancyPercent: string;
  notes: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  addMortgage: boolean | null;
  mortgage: MortgageFormData;
  marketRent: string;
  marketRentAsOf: string;
  lastValueEstimate: string;
  lastRentEstimate: string;
};

function parseCurrencyNum(s: string): number {
  const cleaned = String(s ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const defaultWizardData: WizardData = {
  nickname: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "single_family",
  units: "1",
  ownershipPercent: "100",
  purchasePrice: "",
  purchaseDate: "",
  currentEstimatedValue: "",
  cashInvested: "",
  isRented: true,
  currentMonthlyRent: "",
  unitRents: [],
  currentMonthlyExpenses: "",
  vacancyPercent: "5",
  notes: "",
  bedrooms: "",
  bathrooms: "",
  squareFeet: "",
  addMortgage: null,
  mortgage: defaultMortgageFormData,
  marketRent: "",
  marketRentAsOf: "",
  lastValueEstimate: "",
  lastRentEstimate: "",
};

const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "block text-sm font-medium text-muted";
const inputErrorClass = "ring-1 ring-negative/50 border-negative";

function fieldClass(fieldName: string, errors: Record<string, string>): string {
  return errors[fieldName] ? `${inputClass} ${inputErrorClass}` : inputClass;
}

const ADDRESS_KEYS = ["addressLine1", "addressLine2", "city", "state", "zipCode"] as const;
const STEP_LABELS = ["Property", "Finances", "Income", "Review"] as const;

function WizardStepNav({
  currentStep,
  onGoToStep,
}: {
  currentStep: number;
  onGoToStep: (step: number) => void;
}) {
  return (
    <nav aria-label="Wizard progress" className="flex items-center">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isNavigable = step < currentStep;

        const circleClasses = isCurrent
          ? "bg-accent text-accent-foreground"
          : isCompleted
            ? "bg-accent/10 text-accent"
            : "bg-subtle text-muted";

        const labelClasses = isCurrent
          ? "text-foreground"
          : isCompleted
            ? "text-accent"
            : "text-muted opacity-60";

        return (
          <Fragment key={step}>
            {i > 0 && (
              <div
                className={`mx-1 h-px flex-1 sm:mx-1.5 md:mx-2 ${
                  i < currentStep ? "bg-accent/30" : "bg-border"
                }`}
                aria-hidden
              />
            )}
            <button
              type="button"
              disabled={!isNavigable || isCurrent}
              onClick={() => isNavigable && onGoToStep(step)}
              className={`flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150 ${
                isNavigable && !isCurrent
                  ? "cursor-pointer hover:bg-subtle"
                  : "cursor-default"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${circleClasses}`}
              >
                {isCompleted ? <Check className="size-3.5" aria-hidden /> : step}
              </span>
              <span className={`hidden whitespace-nowrap sm:inline ${labelClasses}`}>
                {label}
              </span>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}

function StepAddressBasics({
  data,
  onChange,
  errors,
  onAddressAutofill,
  onClearErrors,
}: {
  data: WizardData;
  onChange: (d: WizardData) => void;
  errors: Record<string, string>;
  onAddressAutofill?: (address: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  onClearErrors?: (keys: string[]) => void;
}) {
  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    const next = { ...data, [key]: val };
    if (ADDRESS_KEYS.includes(key as (typeof ADDRESS_KEYS)[number])) {
      next.lastValueEstimate = "";
      next.lastRentEstimate = "";
    }
    onChange(next);
    if (errors[key as string]) {
      onClearErrors?.([key as string]);
    }
  }

  function handleAddressSelect(address: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  }) {
    onChange({
      ...data,
      addressLine1: address.addressLine1,
      city: address.city,
      state: address.state.toUpperCase(),
      zipCode: address.zipCode,
      lastValueEstimate: "",
      lastRentEstimate: "",
    });
    onAddressAutofill?.(address);
    onClearErrors?.(["addressLine1", "city", "state", "zipCode"]);
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="addressLine1" className={labelClass}>
          Address line 1 *
        </label>
        <AddressAutocompleteInput
          id="addressLine1"
          value={data.addressLine1}
          onValueChange={(v) => update("addressLine1", v)}
          onSelect={handleAddressSelect}
          required
          autoComplete="street-address"
          className={fieldClass("addressLine1", errors)}
        />
        {errors.addressLine1 && (
          <p className="mt-0.5 text-sm text-negative">{errors.addressLine1}</p>
        )}
      </div>
      <div>
        <label htmlFor="addressLine2" className={labelClass}>
          Address line 2 (optional)
        </label>
        <input
          id="addressLine2"
          type="text"
          autoComplete="address-line2"
          value={data.addressLine2}
          onChange={(e) => update("addressLine2", e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className={labelClass}>
            City *
          </label>
          <input
            id="city"
            type="text"
            required
            autoComplete="address-level2"
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            className={fieldClass("city", errors)}
          />
          {errors.city && (
            <p className="mt-0.5 text-sm text-negative">{errors.city}</p>
          )}
        </div>
        <div>
          <label htmlFor="state" className={labelClass}>
            State *
          </label>
          <select
            id="state"
            required
            value={data.state || ""}
            onChange={(e) => update("state", e.target.value)}
            className={fieldClass("state", errors)}
          >
            <option value="">Select state</option>
            {US_STATES.map((abbr) => (
              <option key={abbr} value={abbr}>
                {abbr}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-0.5 text-sm text-negative">{errors.state}</p>
          )}
        </div>
        <div>
          <label htmlFor="zipCode" className={labelClass}>
            ZIP *
          </label>
          <input
            id="zipCode"
            type="text"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            value={data.zipCode}
            onChange={(e) => update("zipCode", e.target.value)}
            className={fieldClass("zipCode", errors)}
          />
          {errors.zipCode && (
            <p className="mt-0.5 text-sm text-negative">{errors.zipCode}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="propertyType" className={labelClass}>
            Property type
          </label>
          <select
            id="propertyType"
            value={data.propertyType}
            onChange={(e) => {
              const val = e.target.value;
              const isSingleUnit = ["single_family", "condo", "townhouse", "manufactured"].includes(val);
              onChange({
                ...data,
                propertyType: val,
                units: isSingleUnit ? "1" : data.units,
                unitRents: isSingleUnit ? [] : data.unitRents,
              });
            }}
            className={inputClass}
          >
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {(data.propertyType === "multi_family" || data.propertyType === "apartment") && (
          <div>
            <label htmlFor="units" className={labelClass}>
              Units
            </label>
            <input
              id="units"
              type="number"
              min={1}
              max={999}
              inputMode="numeric"
              value={data.units}
              onChange={(e) => {
                const val = e.target.value;
                const n = Math.min(999, Math.max(1, Number(val) || 1));
                const prevLen = data.unitRents.length;
                const newRents =
                  prevLen === n
                    ? data.unitRents
                    : prevLen < n
                      ? [...data.unitRents, ...Array(n - prevLen).fill("")]
                      : data.unitRents.slice(0, n);
                onChange({ ...data, units: val, unitRents: newRents });
              }}
              className={fieldClass("units", errors)}
            />
            {errors.units && (
              <p className="mt-0.5 text-sm text-negative">{errors.units}</p>
            )}
          </div>
        )}
      </div>
      {["single_family", "condo", "townhouse", "manufactured"].includes(data.propertyType) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bedrooms" className={labelClass}>
              Bedrooms (optional)
            </label>
            <input
              id="bedrooms"
              type="number"
              min={1}
              max={10}
              inputMode="numeric"
              placeholder="e.g. 3"
              value={data.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              className={inputClass}
            />
            <p className="mt-0.5 text-xs text-muted">
              Shown on your property details page
            </p>
          </div>
          <div>
            <label htmlFor="bathrooms" className={labelClass}>
              Bathrooms (optional)
            </label>
            <input
              id="bathrooms"
              type="number"
              min={0.5}
              max={10}
              step={0.5}
              inputMode="decimal"
              placeholder="e.g. 2.5"
              value={data.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
              className={inputClass}
            />
            <p className="mt-0.5 text-xs text-muted">
              Shown on your property details page
            </p>
          </div>
        </div>
      )}
      {(data.propertyType === "multi_family" || data.propertyType === "apartment") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bedrooms" className={labelClass}>
              Typical unit bedrooms (optional)
            </label>
            <input
              id="bedrooms"
              type="number"
              min={1}
              max={10}
              inputMode="numeric"
              placeholder="e.g. 2"
              value={data.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              className={inputClass}
            />
            <p className="mt-0.5 text-xs text-muted">
              Shown on your property details page
            </p>
          </div>
          <div>
            <label htmlFor="bathrooms" className={labelClass}>
              Typical unit bathrooms (optional)
            </label>
            <input
              id="bathrooms"
              type="number"
              min={0.5}
              max={10}
              step={0.5}
              inputMode="decimal"
              placeholder="e.g. 1.5"
              value={data.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
              className={inputClass}
            />
            <p className="mt-0.5 text-xs text-muted">
              Shown on your property details page
            </p>
          </div>
        </div>
      )}
      <PropertySquareFeetField
        value={data.squareFeet}
        onChange={(v) => update("squareFeet", v)}
        className="max-w-xs"
      />
      <div>
        <label htmlFor="nickname" className={labelClass}>
          Nickname (optional)
        </label>
        <input
          id="nickname"
          type="text"
          value={data.nickname}
          onChange={(e) => update("nickname", e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

function StepPurchase({
  data,
  onChange,
  errors,
  onEstimateValue,
  valueEstimateLoading,
  valueEstimateError,
}: {
  data: WizardData;
  onChange: (d: WizardData) => void;
  errors: Record<string, string>;
  onEstimateValue: () => void;
  valueEstimateLoading: boolean;
  valueEstimateError: string | null;
}) {
  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    onChange({ ...data, [key]: val });
  }

  const addressComplete = Boolean(
    data.addressLine1?.trim() &&
      data.city?.trim() &&
      data.state?.trim() &&
      data.zipCode?.trim()
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="purchasePrice" className={labelClass}>
            Purchase price *
          </label>
          <CurrencyInput
            id="purchasePrice"
            value={data.purchasePrice}
            onChange={(v) => update("purchasePrice", v)}
            required
            className={fieldClass("purchasePrice", errors)}
          />
          {errors.purchasePrice && (
            <p className="mt-0.5 text-sm text-negative">{errors.purchasePrice}</p>
          )}
          <p className="mt-0.5 text-xs text-muted">
            Approximate is fine - you can update this anytime from the property page.
          </p>
        </div>
        <div>
          <label htmlFor="purchaseDate" className={labelClass}>
            Purchase date *
          </label>
          <input
            id="purchaseDate"
            type="date"
            required
            value={data.purchaseDate}
            onChange={(e) => update("purchaseDate", e.target.value)}
            className={fieldClass("purchaseDate", errors)}
          />
          {errors.purchaseDate && (
            <p className="mt-0.5 text-sm text-negative">{errors.purchaseDate}</p>
          )}
          <p className="mt-0.5 text-xs text-muted">
            Approximate is fine - you can update this anytime.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currentEstimatedValue" className={labelClass}>
            Current estimated value *
          </label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <CurrencyInput
                id="currentEstimatedValue"
                value={data.currentEstimatedValue}
                onChange={(v) => update("currentEstimatedValue", v)}
                required
                className={fieldClass("currentEstimatedValue", errors)}
              />
              {valueEstimateLoading && !data.currentEstimatedValue.trim() && (
                <div className="pointer-events-none absolute inset-x-0 top-1 bottom-0 mt-px flex items-center rounded-md bg-background px-3">
                  <div className="h-4 w-24 motion-safe:animate-pulse rounded-md bg-subtle" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onEstimateValue}
              disabled={
                valueEstimateLoading ||
                Boolean(
                  data.lastValueEstimate &&
                    parseCurrencyNum(data.currentEstimatedValue) === parseCurrencyNum(data.lastValueEstimate)
                )
              }
              className="shrink-0 self-end min-h-[44px] rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle disabled:opacity-50"
            >
              {valueEstimateLoading ? "Estimating…" : "Estimate value"}
            </button>
          </div>
          {valueEstimateError && (
            <p className={`mt-0.5 text-sm ${valueEstimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{valueEstimateError}</p>
          )}
          {errors.currentEstimatedValue && (
            <p className="mt-0.5 text-sm text-negative">{errors.currentEstimatedValue}</p>
          )}
          {!addressComplete && (
            <p className="mt-1 text-xs text-muted">
              Complete the address in Step 1 to enable value estimates.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="cashInvested" className={labelClass}>
            Cash invested (optional)
          </label>
          <CurrencyInput
            id="cashInvested"
            value={data.cashInvested}
            onChange={(v) => update("cashInvested", v)}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Down payment + closing costs + any upfront rehab costs. Used to calculate
            cash-on-cash return.
          </p>
        </div>
      </div>
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
          value={data.ownershipPercent}
          onChange={(e) => update("ownershipPercent", e.target.value)}
          className={fieldClass("ownershipPercent", errors)}
        />
        <p className="mt-0.5 text-xs text-muted">
          Your share of the property (1–100%). Use 100 for full ownership.
        </p>
        {errors.ownershipPercent && (
          <p className="mt-0.5 text-sm text-negative">{errors.ownershipPercent}</p>
        )}
      </div>
    </div>
  );
}

function StepIncomeExpenses({
  data,
  onChange,
  errors,
  onEstimateRent,
  estimateLoading,
  estimateError,
  rentCastQuotaTick,
}: {
  data: WizardData;
  onChange: (d: WizardData) => void;
  errors: Record<string, string>;
  onEstimateRent: () => void;
  estimateLoading: boolean;
  estimateError: string | null;
  rentCastQuotaTick: number;
}) {
  const isMulti =
    (data.propertyType === "multi_family" || data.propertyType === "apartment") &&
    (Number(data.units) || 1) > 1;
  const units = Math.min(999, Math.max(1, Number(data.units) || 1));
  const unitRents = (() => {
    const arr = [...data.unitRents];
    while (arr.length < units) arr.push("");
    return arr.length > units ? arr.slice(0, units) : arr;
  })();

  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    onChange({ ...data, [key]: val });
  }

  function setUnitRent(index: number, val: string) {
    const next = [...unitRents];
    next[index] = val;
    onChange({ ...data, unitRents: next });
  }

  const totalRent = unitRents.reduce(
    (sum, s) => sum + (Number(s) || 0),
    0
  );

  const hasRentEstimate = Boolean(data.lastRentEstimate);

  const addressComplete = Boolean(
    data.addressLine1?.trim() &&
      data.city?.trim() &&
      data.state?.trim() &&
      data.zipCode?.trim()
  );

  return (
    <div className="space-y-4">
      <RentCastQuotaHint refreshKey={rentCastQuotaTick} />
      <div className="rounded-md border border-border bg-subtle/20 p-3">
        <p className="text-sm font-medium text-foreground">Is this property currently rented?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update("isRented", true)}
            className={`min-h-[44px] rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ${
              data.isRented
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:bg-subtle"
            }`}
          >
            Yes, rented
          </button>
          <button
            type="button"
            onClick={() => update("isRented", false)}
            className={`min-h-[44px] rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ${
              !data.isRented
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:bg-subtle"
            }`}
          >
            No, not rented
          </button>
        </div>
      </div>

      {data.isRented ? (
        isMulti ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-2">
              {unitRents.map((_, i) => (
                <div key={i} className="min-w-0 w-full flex-1 sm:min-w-[120px] sm:w-auto">
                  <label htmlFor={`unitRent-${i}`} className={labelClass}>
                    Unit {i + 1} rent *
                  </label>
                  <CurrencyInput
                    id={`unitRent-${i}`}
                    value={unitRents[i] ?? ""}
                    onChange={(v) => setUnitRent(i, v)}
                    required
                    className={inputClass}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={onEstimateRent}
                disabled={estimateLoading || hasRentEstimate || !addressComplete}
                className="shrink-0 self-end min-h-[44px] rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
              >
                {estimateLoading ? "Estimating…" : "Estimate rent"}
              </button>
            </div>
            {data.marketRent && !estimateLoading && (
              <p className="text-xs text-muted">
                Market rate: ~{formatCurrency(Math.round(Number(data.marketRent) / units))}/unit
              </p>
            )}
            {estimateLoading && (
              <p className="text-xs text-muted">Fetching market rate…</p>
            )}
            {!addressComplete && (
              <p className="text-xs text-muted">
                Complete the address in Step 1 to enable rent estimates.
              </p>
            )}
            <p className="text-sm text-muted">Total: ${totalRent.toLocaleString()}/mo</p>
            {estimateError && (
              <p className={`text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
            )}
            {(errors.unitRents || errors.currentMonthlyRent) && (
              <p className="text-sm text-negative">
                {errors.unitRents ?? errors.currentMonthlyRent}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="currentMonthlyRent" className={labelClass}>
              Monthly rent *
            </label>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <CurrencyInput
                  id="currentMonthlyRent"
                  value={data.currentMonthlyRent}
                  onChange={(v) => update("currentMonthlyRent", v)}
                  required
                  className={fieldClass("currentMonthlyRent", errors)}
                />
              </div>
              <button
                type="button"
                onClick={onEstimateRent}
                disabled={estimateLoading || hasRentEstimate || !addressComplete}
                className="shrink-0 self-end min-h-[44px] rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
              >
                {estimateLoading ? "Estimating…" : "Estimate rent"}
              </button>
            </div>
            {data.marketRent && !estimateLoading && (
              <p className="mt-0.5 text-xs text-muted">
                Market rate: ~{formatCurrency(Number(data.marketRent))}/mo
              </p>
            )}
            {estimateLoading && (
              <p className="mt-0.5 text-xs text-muted">Fetching market rate…</p>
            )}
            {estimateError && (
              <p className={`mt-0.5 text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
            )}
            {errors.currentMonthlyRent && (
              <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyRent}</p>
            )}
            {!addressComplete && (
              <p className="mt-1 text-xs text-muted">
                Complete the address in Step 1 to enable rent estimates.
              </p>
            )}
          </div>
        )
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted">Income will be saved as $0 while not rented.</p>
          {estimateLoading ? (
            <div className="h-4 w-40 motion-safe:animate-pulse rounded-md bg-subtle" />
          ) : data.marketRent ? (
            <p className="text-sm text-muted">
              Properties like this typically rent for{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {isMulti
                  ? `~${formatCurrency(Math.round(Number(data.marketRent) / units))}/unit`
                  : `~${formatCurrency(Number(data.marketRent))}/mo`}
              </span>{" "}
              in this area.
            </p>
          ) : addressComplete ? (
            <button
              type="button"
              onClick={onEstimateRent}
              disabled={estimateLoading}
              className="min-h-[44px] rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
            >
              See market rate estimate
            </button>
          ) : (
            <p className="text-xs text-muted">
              Complete the address in Step 1 to see market rate estimates.
            </p>
          )}
          {estimateError && (
            <p className={`text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
          )}
        </div>
      )}

      <div className="border-t border-border mt-2 pt-2" />

      <div>
        <label htmlFor="currentMonthlyExpenses" className={labelClass}>
          Monthly expenses *
        </label>
        <CurrencyInput
          id="currentMonthlyExpenses"
          value={data.currentMonthlyExpenses}
          onChange={(v) => update("currentMonthlyExpenses", v)}
          required
          className={fieldClass("currentMonthlyExpenses", errors)}
        />
        {errors.currentMonthlyExpenses && (
          <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyExpenses}</p>
        )}
        <p className="mt-0.5 text-xs text-muted">
          Include insurance, property tax, HOA, repairs, and property management fees.
          Exclude your mortgage payment - that is tracked separately in the Mortgage section.
        </p>
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
          value={data.vacancyPercent}
          onChange={(e) => update("vacancyPercent", e.target.value)}
          className={fieldClass("vacancyPercent", errors)}
        />
        <p className="mt-0.5 text-xs text-muted">
          Expected vacancy (e.g. 5%). Reduces rent in cash flow calculations.
        </p>
        {errors.vacancyPercent && (
          <p className="mt-0.5 text-sm text-negative">{errors.vacancyPercent}</p>
        )}
      </div>
    </div>
  );
}

function mortgageFormDataToPayload(data: MortgageFormData) {
  const interestDecimal = (Number(data.interestRatePercent) / 100).toString();
  return {
    originalLoanAmount: data.originalLoanAmount,
    currentBalance: data.currentBalance,
    balanceAsOfDate: data.balanceAsOfDate?.trim() ? data.balanceAsOfDate : null,
    interestRate: interestDecimal,
    termYears: Number(data.termYears),
    startDate: data.startDate,
    monthlyPayment: data.monthlyPayment,
    paymentEffectiveDate: data.paymentEffectiveDate?.trim() ? data.paymentEffectiveDate : null,
    escrowIncluded: data.escrowIncluded,
    escrowAmount: data.escrowAmount?.trim() ? data.escrowAmount : null,
    lenderName: data.lenderName.trim() || null,
    loanType: data.loanType.trim() || null,
  };
}

function StepMortgage({
  data,
  onChange,
  errors,
}: {
  data: WizardData;
  onChange: (d: WizardData) => void;
  errors: Record<string, string>;
}) {
  const addMortgage = data.addMortgage;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        <strong className="font-medium text-foreground">Optional.</strong> You can skip and add or edit loan
        details anytime from the property page after you save. Choosing &quot;No, skip&quot; does not block
        creating the property.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={() => onChange({ ...data, addMortgage: true })}
          className={`flex min-h-[48px] flex-1 items-center justify-center rounded-lg border px-4 py-3 text-base font-medium transition sm:min-w-[180px] ${
            addMortgage === true
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-transparent text-foreground hover:bg-subtle"
          }`}
        >
          Yes, add mortgage
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...data, addMortgage: false })}
          className={`flex min-h-[48px] flex-1 items-center justify-center rounded-lg border px-4 py-3 text-base font-medium transition sm:min-w-[180px] ${
            addMortgage === false
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-transparent text-foreground hover:bg-subtle"
          }`}
        >
          No, skip
        </button>
      </div>
      {errors.addMortgage && (
        <p className="text-sm text-negative">{errors.addMortgage}</p>
      )}

      {addMortgage === true && (
        <div className="mt-4 space-y-4">
          <MortgageFormFields
            value={data.mortgage}
            onChange={(mortgage) => onChange({ ...data, mortgage })}
            errors={errors}
          />
        </div>
      )}
    </div>
  );
}

type ReviewPreviewMetrics = {
  equity: number | null;
  monthlyCashFlow: number | null;
  capRate: number | null;
};

function StepReview({
  data,
  previewMetrics,
  onEditStep,
}: {
  data: WizardData;
  previewMetrics: ReviewPreviewMetrics;
  onEditStep: (step: number) => void;
}) {
  const address = [data.addressLine1, data.addressLine2, data.city, data.state, data.zipCode]
    .filter(Boolean)
    .join(", ");

  const formatCurrencyVal = (val: string) =>
    val ? formatCurrency(Number(val)) : "—";
  const formatDate = (val: string) => (val ? val : "—");

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <p className="text-base font-semibold text-foreground">Everything looks good?</p>
        <p className="mt-1 text-sm text-muted">Review your property details, then create.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Address & basics
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-sm font-medium text-accent transition-colors duration-150 hover:underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          {data.nickname && (
            <div>
              <dt className="text-muted">Nickname</dt>
              <dd className="font-medium text-foreground">{data.nickname}</dd>
            </div>
          )}
          <div>
            <dt className="text-muted">Address</dt>
            <dd className="font-medium text-foreground">{address}</dd>
          </div>
          <div>
            <dt className="text-muted">Property type</dt>
            <dd className="font-medium text-foreground">
              {PROPERTY_TYPE_LABELS[data.propertyType] ?? data.propertyType}
              {(data.propertyType === "multi_family" || data.propertyType === "apartment") &&
                Number(data.units) > 1 &&
                ` (${data.units} units)`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-muted" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Purchase
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-sm font-medium text-accent transition-colors duration-150 hover:underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Purchase price</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatCurrencyVal(data.purchasePrice)}</dd>
          </div>
          <div>
            <dt className="text-muted">Purchase date</dt>
            <dd className="font-medium text-foreground">{formatDate(data.purchaseDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">Current value</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatCurrencyVal(data.currentEstimatedValue)}</dd>
          </div>
          {data.cashInvested && (
            <div>
              <dt className="text-muted">Cash invested</dt>
              <dd className="font-medium tabular-nums text-foreground">{formatCurrencyVal(data.cashInvested)}</dd>
            </div>
          )}
          {data.ownershipPercent && Number(data.ownershipPercent) !== 100 && (
            <div>
              <dt className="text-muted">Ownership</dt>
              <dd className="font-medium tabular-nums text-foreground">{data.ownershipPercent}%</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Income & expenses
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-sm font-medium text-accent transition-colors duration-150 hover:underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Rental status</dt>
            <dd className="font-medium text-foreground">
              {data.isRented ? "Rented" : "Not rented"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Monthly rent</dt>
            <dd className="font-medium tabular-nums text-foreground">
              {!data.isRented
                ? "$0 (vacant)"
                : data.unitRents.length > 1
                ? (() => {
                    const rents = data.unitRents.slice(0, Number(data.units) || 1);
                    const total = rents.reduce((s, r) => s + (Number(r) || 0), 0);
                    return `${rents.map((r, i) => `Unit ${i + 1}: ${formatCurrency(Number(r))}`).join(", ")} (Total: ${formatCurrency(total)})`;
                  })()
                : data.unitRents.length === 1
                  ? formatCurrency(Number(data.unitRents[0]))
                  : formatCurrencyVal(data.currentMonthlyRent)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Monthly expenses</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatCurrencyVal(data.currentMonthlyExpenses)}</dd>
          </div>
          {data.vacancyPercent && Number(data.vacancyPercent) !== 5 && (
            <div>
              <dt className="text-muted">Vacancy</dt>
              <dd className="font-medium tabular-nums text-foreground">{data.vacancyPercent}%</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-muted" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Mortgage
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-sm font-medium text-accent transition-colors duration-150 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="mt-3 text-sm">
          {data.addMortgage === true ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <dt className="text-muted">Balance</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {formatCurrencyVal(data.mortgage.currentBalance)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Rate</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {data.mortgage.interestRatePercent ? `${data.mortgage.interestRatePercent}%` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Term</dt>
                <dd className="font-medium text-foreground">
                  {data.mortgage.termYears ? `${data.mortgage.termYears} years` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Monthly payment</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {formatCurrencyVal(data.mortgage.monthlyPayment)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted">No mortgage</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-subtle/40 p-3">
        <p className="text-xs font-medium text-muted">Your numbers at a glance</p>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted">Equity</p>
            <p className="tabular-nums text-sm font-semibold text-foreground">
              {previewMetrics.equity != null ? formatCurrency(previewMetrics.equity) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Monthly cash flow</p>
            <p
              className={`tabular-nums text-sm font-semibold ${
                previewMetrics.monthlyCashFlow == null
                  ? "text-foreground"
                  : previewMetrics.monthlyCashFlow >= 0
                    ? "text-positive"
                    : "text-negative"
              }`}
            >
              {previewMetrics.monthlyCashFlow != null
                ? formatCurrency(previewMetrics.monthlyCashFlow)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Cap rate</p>
            <p className="tabular-nums text-sm font-semibold text-foreground">
              {previewMetrics.capRate != null
                ? `${(previewMetrics.capRate * 100).toFixed(2)}%`
                : "—"}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Mortgage data, if added, will refine equity and cash flow after saving.
        </p>
      </div>
    </div>
  );
}

// Validation helpers
function validateStep1(data: WizardData): Record<string, string> {
  const err: Record<string, string> = {};
  if (!data.addressLine1?.trim()) err.addressLine1 = "Address is required";
  if (!data.city?.trim()) err.city = "City is required";
  if (!data.state?.trim()) err.state = "State is required";
  if (!US_STATES.includes(data.state?.toUpperCase() as (typeof US_STATES)[number]))
    err.state = "Select a valid state";
  if (!data.zipCode?.trim()) err.zipCode = "ZIP is required";
  if (data.propertyType === "multi_family" || data.propertyType === "apartment") {
    const u = Number(data.units);
    if (Number.isNaN(u) || u < 1 || u > 999) err.units = "Enter valid units (1–999)";
  }
  return err;
}

function validateStep2(data: WizardData): Record<string, string> {
  const err: Record<string, string> = {};
  const price = Number(data.purchasePrice);
  if (Number.isNaN(price) || price < 0) err.purchasePrice = "Enter a valid purchase price";
  if (!data.purchaseDate) err.purchaseDate = "Purchase date is required";
  const value = Number(data.currentEstimatedValue);
  if (Number.isNaN(value) || value < 0) err.currentEstimatedValue = "Enter a valid value";
  return err;
}

function validateStep3(data: WizardData): Record<string, string> {
  const err: Record<string, string> = {};
  const exp = Number(data.currentMonthlyExpenses);
  if (Number.isNaN(exp) || exp < 0) err.currentMonthlyExpenses = "Enter valid monthly expenses";
  const vac = Number(data.vacancyPercent);
  if (!Number.isNaN(vac) && (vac < 0 || vac > 100)) err.vacancyPercent = "Vacancy must be 0–100";
  if (!data.isRented) return err;
  const isMultiUnit =
    (data.propertyType === "multi_family" || data.propertyType === "apartment") &&
    (Number(data.units) || 1) > 1;
  if (isMultiUnit) {
    const units = Math.min(999, Math.max(1, Number(data.units) || 1));
    const rents = data.unitRents ?? [];
    const filled = rents.slice(0, units).map((s) => Number(s) || 0);
    if (filled.length < units || filled.some((n) => n < 0)) {
      err.unitRents = `Enter rent for each of ${units} units`;
    }
  } else {
    const rent = Number(data.currentMonthlyRent);
    if (Number.isNaN(rent) || rent < 0) err.currentMonthlyRent = "Enter a valid monthly rent";
  }
  return err;
}

function validateStep4(data: WizardData): Record<string, string> {
  if (data.addMortgage === null) {
    return { addMortgage: "Please choose whether to add a mortgage" };
  }
  if (data.addMortgage !== true) return {};
  const m = data.mortgage;
  const payload = {
    originalLoanAmount: m.originalLoanAmount,
    currentBalance: m.currentBalance,
    balanceAsOfDate: m.balanceAsOfDate?.trim() ? m.balanceAsOfDate : null,
    interestRate: (Number(m.interestRatePercent) / 100).toString(),
    termYears: Number(m.termYears),
    startDate: m.startDate,
    monthlyPayment: m.monthlyPayment,
    paymentEffectiveDate: m.paymentEffectiveDate?.trim() ? m.paymentEffectiveDate : null,
    escrowIncluded: m.escrowIncluded,
    escrowAmount: m.escrowAmount?.trim() ? m.escrowAmount : null,
    lenderName: m.lenderName.trim() || null,
    loanType: m.loanType.trim() || null,
  };
  const parsed = createMortgageSchema.safeParse(payload);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const err: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) {
      if (Array.isArray(v) && v[0]) err[k] = v[0];
    }
    return err;
  }
  const escrowCheck = validateEscrowAmount(
    payload.escrowAmount ?? null,
    payload.monthlyPayment
  );
  if (!escrowCheck.success) {
    return { escrowAmount: escrowCheck.error };
  }
  return {};
}

/** Run all step validators; merge errors and pick first section with an error for scroll. */
function runAllValidations(data: WizardData): {
  errors: Record<string, string>;
  firstSectionId: string | null;
} {
  const sections: {
    id: string;
    validate: (d: WizardData) => Record<string, string>;
  }[] = [
    { id: "section-location", validate: validateStep1 },
    { id: "section-economics", validate: validateStep2 },
    { id: "section-income", validate: validateStep3 },
    { id: "section-mortgage", validate: validateStep4 },
  ];
  const errors: Record<string, string> = {};
  let firstSectionId: string | null = null;
  for (const { id, validate } of sections) {
    const e = validate(data);
    Object.assign(errors, e);
    if (Object.keys(e).length > 0 && !firstSectionId) firstSectionId = id;
  }
  return { errors, firstSectionId };
}

function mergeWithDefaults(restored: Partial<WizardData>): WizardData {
  const m = restored.mortgage as Partial<MortgageFormData> | undefined;
  return {
    ...defaultWizardData,
    ...restored,
    mortgage: m ? { ...defaultMortgageFormData, ...m } : defaultMortgageFormData,
  };
}

export function AddPropertyWizard({
  dealId,
  quickAdd = false,
}: {
  dealId?: string;
  quickAdd?: boolean;
}) {
  const router = useRouter();
  const draft = useDraft();
  const [data, setData] = useState<WizardData>(defaultWizardData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valueEstimateLoading, setValueEstimateLoading] = useState(false);
  const [valueEstimateError, setValueEstimateError] = useState<string | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [rentCastQuotaTick, setRentCastQuotaTick] = useState(0);
  const [lastSaleSuggestion, setLastSaleSuggestion] = useState<{ price: number; date: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [returnToReview, setReturnToReview] = useState(false);
  const isMobile = useIsMobile();
  const hasRestoredRef = useRef(false);
  const dealPrefilledRef = useRef(false);
  const addressAutofillTimerRef = useRef<number | null>(null);
  const dataRef = useRef<WizardData>(defaultWizardData);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (dealId && !dealPrefilledRef.current) {
      dealPrefilledRef.current = true;
      fetch(`/api/deals/${dealId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((deal: Record<string, unknown> | null) => {
          if (!deal) return;
          const today = new Date().toISOString().slice(0, 10);
          setData((prev) => ({
            ...prev,
            nickname: (deal.nickname as string) ?? prev.nickname,
            addressLine1: (deal.addressLine1 as string) ?? prev.addressLine1,
            addressLine2: (deal.addressLine2 as string) ?? prev.addressLine2,
            city: (deal.city as string) ?? prev.city,
            state: (deal.state as string) ?? prev.state,
            zipCode: (deal.zipCode as string) ?? prev.zipCode,
            purchasePrice: (deal.purchasePrice as string) ?? prev.purchasePrice,
            currentEstimatedValue: (deal.currentEstimatedValue as string) ?? prev.currentEstimatedValue,
            lastValueEstimate: (deal.currentEstimatedValue as string) ?? prev.lastValueEstimate,
            purchaseDate: prev.purchaseDate || today,
            currentMonthlyRent: (deal.currentMonthlyRent as string) ?? prev.currentMonthlyRent,
            lastRentEstimate: (deal.currentMonthlyRent as string) ?? prev.lastRentEstimate,
            currentMonthlyExpenses: (deal.currentMonthlyExpenses as string) ?? prev.currentMonthlyExpenses,
            vacancyPercent: deal.vacancyPercent != null ? String(deal.vacancyPercent) : prev.vacancyPercent,
            ownershipPercent: deal.ownershipPercent != null ? String(deal.ownershipPercent) : prev.ownershipPercent,
            cashInvested: (deal.cashInvested as string) ?? prev.cashInvested,
            notes: (deal.notes as string) ?? prev.notes,
            bedrooms: deal.bedrooms != null ? String(deal.bedrooms) : prev.bedrooms,
            bathrooms: deal.bathrooms != null ? String(deal.bathrooms) : prev.bathrooms,
            squareFeet: deal.squareFeet != null ? String(deal.squareFeet) : prev.squareFeet,
            propertyType: (deal.propertyType as string) ?? prev.propertyType,
            marketRent: deal.marketRent != null ? String(Math.round(Number(deal.marketRent))) : prev.marketRent,
            marketRentAsOf: (deal.marketRentAsOf as string) ?? prev.marketRentAsOf,
            addMortgage:
              (deal.totalMortgageBalance != null && Number(deal.totalMortgageBalance) > 0) ||
              (deal.totalMonthlyPayment != null && Number(deal.totalMonthlyPayment) > 0)
                ? true
                : prev.addMortgage,
            mortgage:
              (deal.totalMortgageBalance != null && Number(deal.totalMortgageBalance) > 0) ||
              (deal.totalMonthlyPayment != null && Number(deal.totalMonthlyPayment) > 0)
                ? {
                    ...prev.mortgage,
                    currentBalance: (deal.totalMortgageBalance as string) ?? prev.mortgage.currentBalance,
                    monthlyPayment: (deal.totalMonthlyPayment as string) ?? prev.mortgage.monthlyPayment,
                  }
                : prev.mortgage,
          }));
        })
        .catch(() => {});
    }
  }, [dealId]);

  useEffect(() => {
    if (draft?.draftData && !hasRestoredRef.current) {
      const id = setTimeout(() => {
        setData(mergeWithDefaults(draft.draftData!.data as Partial<WizardData>));
        setCurrentStep(draft.draftData?.currentStep ?? 1);
        hasRestoredRef.current = true;
        requestAnimationFrame(() => {
          document.getElementById("section-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [draft?.draftData, draft]);

  useEffect(() => {
    draft?.setHasDraft(hasAnyWizardData(data));
  }, [data, draft]);

  useEffect(() => {
    draft?.registerWizardGetData(() => data);
    return () => draft?.registerWizardGetData(null);
  }, [draft, data]);

  useEffect(() => {
    draft?.registerWizardGetStep(() => currentStep);
    return () => draft?.registerWizardGetStep(null);
  }, [draft, currentStep]);

  const prevStartFreshKey = useRef<number | null>(null);
  useEffect(() => {
    const key = draft?.startFreshKey ?? 0;
    if (prevStartFreshKey.current === null) {
      prevStartFreshKey.current = key;
      return;
    }
    if (key !== prevStartFreshKey.current) {
      prevStartFreshKey.current = key;
      // Defer state updates out of the effect body (avoids react-hooks/set-state-in-effect cascade warning).
      queueMicrotask(() => {
        setData(defaultWizardData);
        setCurrentStep(1);
        setErrors({});
        hasRestoredRef.current = false;
        setError(null);
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }
  }, [draft?.startFreshKey, draft]);

  useEffect(() => {
    return () => {
      if (addressAutofillTimerRef.current != null) {
        window.clearTimeout(addressAutofillTimerRef.current);
      }
    };
  }, []);

  const handleEstimateValue = useCallback(async () => {
    if (!data.addressLine1?.trim() || !data.city?.trim() || !data.state?.trim() || !data.zipCode?.trim()) {
      setValueEstimateError("Enter address in Step 1 first");
      return;
    }
    if (
      data.lastValueEstimate &&
      parseCurrencyNum(data.currentEstimatedValue) === parseCurrencyNum(data.lastValueEstimate)
    ) {
      return;
    }

    setValueEstimateError(null);
    setValueEstimateLoading(true);
    try {
      const params = new URLSearchParams({
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });
      if (data.addressLine2?.trim()) params.set("addressLine2", data.addressLine2);
      if (data.propertyType) params.set("propertyType", data.propertyType);
      const res = await fetch(`/api/estimates/value?${params.toString()}`);
      const json = (await res.json()) as {
        value?: number;
        bedrooms?: number;
        bathrooms?: number;
        squareFootage?: number;
        error?: string;
      };
      if (json.value != null && Number.isFinite(json.value)) {
        const val = String(Math.round(json.value));
        setData((prev) => ({
          ...prev,
          currentEstimatedValue: val,
          lastValueEstimate: val,
          bedrooms: prev.bedrooms || (json.bedrooms != null ? String(json.bedrooms) : prev.bedrooms),
          bathrooms: prev.bathrooms || (json.bathrooms != null ? String(json.bathrooms) : prev.bathrooms),
          squareFeet:
            prev.squareFeet || (json.squareFootage != null ? String(json.squareFootage) : prev.squareFeet),
        }));
        captureClientEvent(AnalyticsEvents.ESTIMATE_VALUE_USED, {
          success: true,
        });
      } else {
        setValueEstimateError(json.error ?? "Estimate unavailable for this address");
        captureClientEvent(AnalyticsEvents.ESTIMATE_VALUE_USED, {
          success: false,
        });
      }
    } catch {
      setValueEstimateError("Estimate unavailable for this address");
      captureClientEvent(AnalyticsEvents.ESTIMATE_VALUE_USED, {
        success: false,
      });
    } finally {
      setValueEstimateLoading(false);
    }
  }, [data]);

  const handleEstimateRent = useCallback(async () => {
    if (!data.addressLine1?.trim() || !data.city?.trim() || !data.state?.trim() || !data.zipCode?.trim()) {
      setEstimateError("Enter address in Step 1 first");
      return;
    }

    const isMulti =
      (data.propertyType === "multi_family" || data.propertyType === "apartment") &&
      (Number(data.units) || 1) > 1;
    const units = Math.min(999, Math.max(1, Number(data.units) || 1));
    const unitRents = (() => {
      const arr = [...data.unitRents];
      while (arr.length < units) arr.push("");
      return arr.length > units ? arr.slice(0, units) : arr;
    })();
    const totalRent = unitRents.reduce(
      (sum, s) => sum + (Number(s) || 0),
      0
    );
    const rentMatchesLastEstimate = Boolean(
      data.lastRentEstimate &&
        (isMulti
          ? Math.round(totalRent) === parseCurrencyNum(data.lastRentEstimate)
          : parseCurrencyNum(data.currentMonthlyRent) === parseCurrencyNum(data.lastRentEstimate))
    );
    if (rentMatchesLastEstimate) return;

    setEstimateError(null);
    setEstimateLoading(true);
    try {
      const params = new URLSearchParams({
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });
      if (data.addressLine2?.trim()) params.set("addressLine2", data.addressLine2);
      if (data.propertyType) params.set("propertyType", data.propertyType);
      if ((data.propertyType === "multi_family" || data.propertyType === "apartment") && data.units) {
        params.set("units", data.units);
      }

      const res = await fetch(`/api/estimates/rent?${params.toString()}`);
      const json = (await res.json()) as {
        rent?: number;
        marketRent?: number;
        marketRentAsOf?: string;
        error?: string;
      };

      if (json.rent != null && Number.isFinite(json.rent)) {
        setRentCastQuotaTick((t) => t + 1);
        const today = new Date().toISOString().slice(0, 10);
        const marketRent = String(Math.round(json.rent));
        const marketRentAsOf = json.marketRentAsOf ?? today;
        const lastRentEstimate = String(Math.round(json.rent));
        setData((prev) => ({ ...prev, marketRent, marketRentAsOf, lastRentEstimate }));
        captureClientEvent(AnalyticsEvents.ESTIMATE_RENT_USED, {
          success: true,
        });
      } else {
        setEstimateError(json.error ?? "Estimate unavailable for this address");
        captureClientEvent(AnalyticsEvents.ESTIMATE_RENT_USED, {
          success: false,
        });
      }
    } catch {
      setEstimateError("Estimate unavailable for this address");
      captureClientEvent(AnalyticsEvents.ESTIMATE_RENT_USED, {
        success: false,
      });
    } finally {
      setEstimateLoading(false);
    }
  }, [data]);

  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== 3 && currentStep === 3) {
      void handleEstimateRent();
    }
    prevStepRef.current = currentStep;
  }, [currentStep, handleEstimateRent]);

  async function runQuickAutofillEstimates(snapshot: WizardData) {
    if (
      !snapshot.addressLine1?.trim() ||
      !snapshot.city?.trim() ||
      !snapshot.state?.trim() ||
      !snapshot.zipCode?.trim()
    ) {
      return;
    }

    setValueEstimateLoading(true);
    try {
      const valueParams = new URLSearchParams({
        addressLine1: snapshot.addressLine1,
        city: snapshot.city,
        state: snapshot.state,
        zipCode: snapshot.zipCode,
      });
      if (snapshot.addressLine2?.trim()) {
        valueParams.set("addressLine2", snapshot.addressLine2);
      }
      if (snapshot.propertyType) {
        valueParams.set("propertyType", snapshot.propertyType);
      }
      const valueRes = await fetch(`/api/estimates/value?${valueParams.toString()}`);
      const valueJson = (await valueRes.json().catch(() => ({}))) as {
        value?: number;
        lastSalePrice?: number;
        lastSaleDate?: string;
      };
      if (valueRes.ok && valueJson.value != null && Number.isFinite(valueJson.value)) {
        const val = String(Math.round(valueJson.value));
        setData((prev) => ({ ...prev, currentEstimatedValue: val, lastValueEstimate: val }));
      }
      if (
        valueJson.lastSalePrice != null &&
        Number.isFinite(valueJson.lastSalePrice) &&
        valueJson.lastSalePrice > 0
      ) {
        setLastSaleSuggestion({
          price: valueJson.lastSalePrice,
          date: valueJson.lastSaleDate ?? "",
        });
      }
    } catch {
      // Silent fallback: quick add remains fully manual.
    } finally {
      setValueEstimateLoading(false);
    }

    setEstimateLoading(true);
    try {
      const rentParams = new URLSearchParams({
        addressLine1: snapshot.addressLine1,
        city: snapshot.city,
        state: snapshot.state,
        zipCode: snapshot.zipCode,
      });
      if (snapshot.addressLine2?.trim()) {
        rentParams.set("addressLine2", snapshot.addressLine2);
      }
      if (snapshot.propertyType) {
        rentParams.set("propertyType", snapshot.propertyType);
      }
      const rentRes = await fetch(`/api/estimates/rent?${rentParams.toString()}`);
      const rentJson = (await rentRes.json().catch(() => ({}))) as {
        rent?: number;
        marketRent?: number;
        marketRentAsOf?: string;
      };
      if (rentRes.ok && rentJson.rent != null && Number.isFinite(rentJson.rent)) {
        const today = new Date().toISOString().slice(0, 10);
        const lastRentEstimate = String(Math.round(rentJson.rent));
        setData((prev) => ({
          ...prev,
          marketRent:
            rentJson.marketRent != null && Number.isFinite(rentJson.marketRent)
              ? String(Math.round(rentJson.marketRent))
              : lastRentEstimate,
          marketRentAsOf:
            typeof rentJson.marketRentAsOf === "string" && rentJson.marketRentAsOf
              ? rentJson.marketRentAsOf
              : today,
          lastRentEstimate,
        }));
      }
    } catch {
      // Silent fallback: quick add remains fully manual.
    } finally {
      setEstimateLoading(false);
    }
  }

  function handleAddressAutofill(address: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  }) {
    if (addressAutofillTimerRef.current != null) {
      window.clearTimeout(addressAutofillTimerRef.current);
    }
    addressAutofillTimerRef.current = window.setTimeout(() => {
      if (quickAdd) {
        void runQuickAutofillEstimates({
          ...dataRef.current,
          addressLine1: address.addressLine1,
          city: address.city,
          state: address.state.toUpperCase(),
          zipCode: address.zipCode,
        });
      }
    }, 300);
  }

  async function submitQuickAdd() {
    const nextErrors: Record<string, string> = {};
    if (!data.addressLine1.trim() || !data.city.trim() || !data.state.trim() || !data.zipCode.trim()) {
      nextErrors.addressLine1 =
        "Select an address suggestion so city, state, and ZIP are filled.";
    }
    if ((Number(data.currentEstimatedValue) || 0) <= 0) {
      nextErrors.currentEstimatedValue = "Enter a valid estimated value";
    }
    if ((Number(data.purchasePrice) || 0) <= 0) {
      nextErrors.purchasePrice = "Enter a valid purchase price";
    }
    if (data.isRented && (Number(data.currentMonthlyRent) || 0) < 0) {
      nextErrors.currentMonthlyRent = "Enter a valid monthly rent";
    }
    if ((Number(data.currentMonthlyExpenses) || 0) < 0 || data.currentMonthlyExpenses.trim() === "") {
      nextErrors.currentMonthlyExpenses = "Enter valid monthly expenses";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const estimatedValue = String(Math.max(0, Number(data.currentEstimatedValue) || 0));
    const rent = data.isRented
      ? String(Math.max(0, Number(data.currentMonthlyRent) || 0))
      : "0";
    const monthlyExpenses = String(Math.max(0, Number(data.currentMonthlyExpenses) || 0));

    const payload: Record<string, unknown> = {
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2.trim() || undefined,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      propertyType: data.propertyType || "single_family",
      units: 1,
      ownershipPercent: 100,
      purchasePrice: String(Math.max(0, Number(data.purchasePrice) || 0)),
      purchaseDate: data.purchaseDate?.trim() || today,
      currentEstimatedValue: estimatedValue,
      isRented: data.isRented,
      currentMonthlyRent: rent,
      currentMonthlyExpenses: monthlyExpenses,
      vacancyPercent: 5,
      addMortgage: false,
      marketRent: data.marketRent?.trim() ? data.marketRent : undefined,
      marketRentAsOf: data.marketRentAsOf?.trim() || undefined,
    };

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (resData.code === "PLAN_LIMIT_REACHED") {
          captureClientEvent(AnalyticsEvents.PLAN_LIMIT_HIT, {
            resource: "property",
          });
        }
        setError(
          resData.code === "PLAN_LIMIT_REACHED"
            ? "Property limit reached. Upgrade your plan or remove a property to add more."
            : resData.error || "Something went wrong"
        );
        setSubmitting(false);
        return;
      }
      draft?.clearDraft();
      if (typeof resData.id === "string") {
        captureClientEvent(AnalyticsEvents.PROPERTY_CREATED, {
          property_id: resData.id,
        });
        captureClientEvent(AnalyticsEvents.PROPERTY_QUICK_ADD_COMPLETED, {
          property_id: resData.id,
        });
      }
      if (resData.createdFirstProperty) {
        router.push("/dashboard?onboarding=first-property");
      } else {
        router.push(`/properties/${resData.id}?from=quick-add`);
      }
      router.refresh();
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const key = addPropertyMilestoneKey("wizard_opened");
    if (hasFiredSession(key)) return;
    markFiredSession(key);
    captureClientEvent(AnalyticsEvents.ADD_PROPERTY_MILESTONE_REACHED, {
      milestone: "wizard_opened",
    });
  }, []);

  function fireStepEnteredMilestone(step: number) {
    const milestoneMap: Record<number, string> = {
      2: "step_2_entered",
      3: "step_3_entered",
      4: "step_4_entered",
    };
    const milestone = milestoneMap[step];
    if (!milestone) return;
    const key = addPropertyMilestoneKey(milestone);
    if (hasFiredSession(key)) return;
    markFiredSession(key);
    captureClientEvent(AnalyticsEvents.ADD_PROPERTY_MILESTONE_REACHED, { milestone });
  }

  async function persistStandardProperty(
    payload: Record<string, unknown>,
    options?: { partial?: boolean }
  ) {
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (resData.code === "PLAN_LIMIT_REACHED") {
          captureClientEvent(AnalyticsEvents.PLAN_LIMIT_HIT, {
            resource: "property",
          });
        }
        setError(
          resData.code === "PLAN_LIMIT_REACHED"
            ? "Property limit reached. Upgrade your plan or remove a property to add more."
            : resData.error || "Something went wrong"
        );
        setSubmitting(false);
        return;
      }

      draft?.clearDraft();
      if (typeof resData.id === "string") {
        captureClientEvent(AnalyticsEvents.PROPERTY_CREATED, {
          property_id: resData.id,
        });
        if (options?.partial) {
          captureClientEvent(AnalyticsEvents.PROPERTY_CREATED_PARTIAL, {
            property_id: resData.id,
          });
        }
      }

      if (resData.createdFirstProperty) {
        router.push("/dashboard?onboarding=first-property");
      } else {
        router.push(`/properties/${resData.id}`);
      }
      router.refresh();
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  async function handlePartialSave() {
    const step1Errors = validateStep1(data);
    const step2Errors = validateStep2(data);
    const partialErrors = { ...step1Errors, ...step2Errors };
    setErrors(partialErrors);

    if (Object.keys(partialErrors).length > 0) {
      const firstSectionId =
        Object.keys(step1Errors).length > 0
          ? "section-location"
          : Object.keys(step2Errors).length > 0
            ? "section-economics"
            : null;
      if (firstSectionId) {
        document
          .getElementById(firstSectionId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    setError(null);
    setSubmitting(true);

    const isMultiUnit =
      (data.propertyType === "multi_family" || data.propertyType === "apartment") &&
      (Number(data.units) || 1) > 1;
    const units = isMultiUnit ? Number(data.units) : 1;
    const partialRent = data.isRented
      ? data.currentMonthlyRent.trim() || "0"
      : "0";
    const totalRent = Number(partialRent) || 0;
    const vacancy = Math.min(100, Math.max(0, Number(data.vacancyPercent) || 5));

    const payload: Record<string, unknown> = {
      nickname: data.nickname.trim() || undefined,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2.trim() || undefined,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      propertyType: data.propertyType,
      units,
      ownershipPercent: Math.min(100, Math.max(1, Number(data.ownershipPercent) || 100)),
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      currentEstimatedValue: data.currentEstimatedValue,
      isRented: data.isRented,
      currentMonthlyRent: String(totalRent),
      currentMonthlyExpenses: data.currentMonthlyExpenses.trim() || "0",
      vacancyPercent: vacancy,
      cashInvested: data.cashInvested.trim() ? data.cashInvested : undefined,
      notes: data.notes.trim() || undefined,
      addMortgage: false,
    };

    if (data.marketRent?.trim() && !Number.isNaN(Number(data.marketRent))) {
      payload.marketRent = Number(data.marketRent);
      if (data.marketRentAsOf?.trim()) payload.marketRentAsOf = data.marketRentAsOf;
    }
    const bed = Number(data.bedrooms);
    if (data.bedrooms?.trim() && !Number.isNaN(bed) && bed >= 1 && bed <= 10) {
      payload.bedrooms = Math.round(bed);
    }
    const bath = Number(data.bathrooms);
    if (data.bathrooms?.trim() && !Number.isNaN(bath) && bath >= 0.5 && bath <= 10) {
      payload.bathrooms = bath;
    }
    const sq = parseInt(data.squareFeet?.trim() ?? "", 10);
    if (!Number.isNaN(sq) && sq >= 100) {
      payload.squareFeet = sq;
    }

    await persistStandardProperty(payload, { partial: true });
  }

  function clearErrors(keys: string[]) {
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setReturnToReview(false);
  }

  function goToStep(step: number, opts?: { returnToReview?: boolean }) {
    if (!Number.isInteger(step) || step < 1 || step > STEP_LABELS.length) return;
    if (step >= currentStep) return;
    setCurrentStep(step);
    setReturnToReview(opts?.returnToReview ?? false);
    fireStepEnteredMilestone(step);
  }

  async function handleNext() {
    let stepErrors: Record<string, string> = {};
    if (currentStep === 1) {
      stepErrors = validateStep1(data);
    } else if (currentStep === 2) {
      stepErrors = {
        ...validateStep2(data),
        ...(data.addMortgage === true ? validateStep4(data) : {}),
      };
    } else if (currentStep === 3) {
      stepErrors = validateStep3(data);
    } else {
      stepErrors = runAllValidations(data).errors;
    }

    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setErrors({});

    if (currentStep === 1 && !returnToReview) {
      try {
        await handleEstimateValue();
      } catch {
        // Never block progression on estimate failures.
      }
    }

    const nextStep = returnToReview ? 4 : Math.min(4, currentStep + 1);
    setCurrentStep(nextStep);
    fireStepEnteredMilestone(nextStep);
    if (returnToReview) {
      setReturnToReview(false);
    }
  }

  async function handleSubmit() {
    const { errors: allErrors, firstSectionId } = runAllValidations(data);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      if (firstSectionId === "section-location") {
        setCurrentStep(1);
      } else if (firstSectionId === "section-economics" || firstSectionId === "section-mortgage") {
        setCurrentStep(2);
      } else if (firstSectionId === "section-income") {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
      if (firstSectionId) {
        document.getElementById(firstSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    setError(null);
    setSubmitting(true);

    const isMultiUnit =
      (data.propertyType === "multi_family" || data.propertyType === "apartment") &&
      (Number(data.units) || 1) > 1;
    const units = isMultiUnit ? Number(data.units) : 1;
    const unitRentsArr =
      data.isRented && isMultiUnit && data.unitRents.length > 0
        ? data.unitRents
            .slice(0, units)
            .map((s) => Number(s) || 0)
        : null;
    const totalRent =
      !data.isRented
        ? 0
        : unitRentsArr != null
        ? unitRentsArr.reduce((a, b) => a + b, 0)
        : Number(data.currentMonthlyRent) || 0;

    const vacancy = Math.min(100, Math.max(0, Number(data.vacancyPercent) || 5));
    const payload: Record<string, unknown> = {
      nickname: data.nickname.trim() || undefined,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2.trim() || undefined,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      propertyType: data.propertyType,
      units,
      ownershipPercent: Math.min(100, Math.max(1, Number(data.ownershipPercent) || 100)),
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      currentEstimatedValue: data.currentEstimatedValue,
      isRented: data.isRented,
      currentMonthlyRent: String(totalRent),
      currentMonthlyExpenses: data.currentMonthlyExpenses,
      vacancyPercent: vacancy,
      cashInvested: data.cashInvested.trim() ? data.cashInvested : undefined,
      notes: data.notes.trim() || undefined,
    };
    if (unitRentsArr != null) payload.unitRents = unitRentsArr;
    if (data.marketRent?.trim() && !Number.isNaN(Number(data.marketRent))) {
      payload.marketRent = Number(data.marketRent);
      if (data.marketRentAsOf?.trim()) payload.marketRentAsOf = data.marketRentAsOf;
    }
    const bed = Number(data.bedrooms);
    if (data.bedrooms?.trim() && !Number.isNaN(bed) && bed >= 1 && bed <= 10) payload.bedrooms = Math.round(bed);
    const bath = Number(data.bathrooms);
    if (data.bathrooms?.trim() && !Number.isNaN(bath) && bath >= 0.5 && bath <= 10) payload.bathrooms = bath;
    const sq = parseInt(data.squareFeet?.trim() ?? "", 10);
    if (!Number.isNaN(sq) && sq >= 100) payload.squareFeet = sq;

    const body =
      data.addMortgage === true
        ? {
            ...payload,
            mortgage: mortgageFormDataToPayload(data.mortgage),
          }
        : payload;

    await persistStandardProperty(body);
  }

  // Fix notes in review - it's read-only, we need to allow editing
  const notesValue = data.notes;
  const setNotes = (notes: string) => setData((d) => ({ ...d, notes }));

  const isMultiUnitPreview =
    (data.propertyType === "multi_family" || data.propertyType === "apartment") &&
    (Number(data.units) || 1) > 1;
  const previewUnitCount = Math.min(999, Math.max(1, Number(data.units) || 1));
  const previewUnitRents = data.unitRents.slice(0, previewUnitCount);
  const previewMonthlyRent = !data.isRented
    ? 0
    : isMultiUnitPreview
      ? previewUnitRents.reduce((sum, rent) => sum + parseCurrencyNum(rent), 0)
      : parseCurrencyNum(data.currentMonthlyRent);

  const hasEstimatedValueForPreview = data.currentEstimatedValue.trim().length > 0;
  const hasMonthlyExpensesForPreview = data.currentMonthlyExpenses.trim().length > 0;
  const hasMonthlyRentForPreview = !data.isRented
    ? true
    : isMultiUnitPreview
      ? previewUnitRents.length === previewUnitCount &&
        previewUnitRents.every((rent) => rent.trim().length > 0)
      : data.currentMonthlyRent.trim().length > 0;

  const canComputePreviewMetrics =
    hasEstimatedValueForPreview &&
    hasMonthlyExpensesForPreview &&
    hasMonthlyRentForPreview;

  let previewMetrics: ReviewPreviewMetrics = {
    equity: null,
    monthlyCashFlow: null,
    capRate: null,
  };

  if (canComputePreviewMetrics) {
    try {
      const computedMetrics = computePropertyMetrics(
        {
          monthlyRent: previewMonthlyRent,
          monthlyExpenses: parseCurrencyNum(data.currentMonthlyExpenses),
          estimatedValue: parseCurrencyNum(data.currentEstimatedValue),
          cashInvested: data.cashInvested.trim()
            ? parseCurrencyNum(data.cashInvested)
            : null,
          totalMortgageBalance: 0,
          totalMonthlyPayment: 0,
          ownershipPercent: Number(data.ownershipPercent) || 100,
          vacancyPercent: Number(data.vacancyPercent) || 5,
        },
        "proportional"
      );
      previewMetrics = {
        equity: Number.isFinite(computedMetrics.equity)
          ? computedMetrics.equity
          : null,
        monthlyCashFlow: Number.isFinite(computedMetrics.monthlyCashFlow)
          ? computedMetrics.monthlyCashFlow
          : null,
        capRate:
          computedMetrics.capRate != null &&
          Number.isFinite(computedMetrics.capRate)
            ? computedMetrics.capRate
            : null,
      };
    } catch {
      previewMetrics = {
        equity: null,
        monthlyCashFlow: null,
        capRate: null,
      };
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (quickAdd) {
      void submitQuickAdd();
      return;
    }
    if (currentStep < 4) {
      void handleNext();
      return;
    }
    void handleSubmit();
  }

  if (quickAdd) {
    return (
      <form onSubmit={handleFormSubmit} className="rounded-lg border border-border bg-card p-6">
        {error && (
          <div className="mb-4 rounded-md px-4 py-2 text-sm text-negative">
            {error}
            {(error.includes("Upgrade") || error.includes("limit")) && (
              <button
                type="button"
                onClick={() => draft?.navigateTo("/plans")}
                className="ml-1 font-medium underline hover:no-underline"
              >
                Upgrade plan
              </button>
            )}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="quickAddressLine1" className={labelClass}>
              Address *
            </label>
            <AddressAutocompleteInput
              id="quickAddressLine1"
              value={data.addressLine1}
              onValueChange={(v) =>
                setData((prev) => ({
                  ...prev,
                  addressLine1: v,
                  lastValueEstimate: "",
                  lastRentEstimate: "",
                }))
              }
              onSelect={(address) =>
                {
                  setData((prev) => ({
                    ...prev,
                    addressLine1: address.addressLine1,
                    city: address.city,
                    state: address.state.toUpperCase(),
                    zipCode: address.zipCode,
                    lastValueEstimate: "",
                    lastRentEstimate: "",
                  }));
                  handleAddressAutofill(address);
                }
              }
              required
              autoComplete="street-address"
              className={inputClass}
            />
            {errors.addressLine1 && (
              <p className="mt-0.5 text-sm text-negative">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label htmlFor="quickPropertyType" className={labelClass}>
              Property type
            </label>
            <select
              id="quickPropertyType"
              value={data.propertyType}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  propertyType: e.target.value,
                }))
              }
              className={inputClass}
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {(data.propertyType === "multi_family" || data.propertyType === "apartment") && (
            <div className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm text-foreground">
                Multi-unit properties need per-unit rent details for accurate tracking.
              </p>
              <Link
                href="/properties/new"
                className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Use the full form
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="quickEstimatedValue" className={labelClass}>
                Current estimated value *
              </label>
              <div className="relative">
                <CurrencyInput
                  id="quickEstimatedValue"
                  value={data.currentEstimatedValue}
                  onChange={(v) => setData((prev) => ({ ...prev, currentEstimatedValue: v }))}
                  required
                  className={inputClass}
                />
                {valueEstimateLoading && !data.currentEstimatedValue.trim() && (
                  <div className="pointer-events-none absolute inset-x-0 top-1 bottom-0 mt-px flex items-center rounded-md bg-background px-3">
                    <div className="h-4 w-24 motion-safe:animate-pulse rounded-md bg-subtle" />
                  </div>
                )}
              </div>
              {valueEstimateLoading && (
                <p className="mt-0.5 text-xs text-muted">Estimating value…</p>
              )}
              {errors.currentEstimatedValue && (
                <p className="mt-0.5 text-sm text-negative">{errors.currentEstimatedValue}</p>
              )}
            </div>

            <div>
              <label htmlFor="quickPurchasePrice" className={labelClass}>
                Purchase price *
              </label>
              <CurrencyInput
                id="quickPurchasePrice"
                value={data.purchasePrice}
                onChange={(v) => {
                  setData((prev) => ({ ...prev, purchasePrice: v }));
                  if (errors.purchasePrice) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.purchasePrice;
                      return next;
                    });
                  }
                }}
                required
                className={inputClass}
              />
              {lastSaleSuggestion && !data.purchasePrice.trim() && (
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                  <span className="text-sm text-foreground">
                    Last sold for{" "}
                    <span className="font-medium">
                      {formatCurrency(lastSaleSuggestion.price)}
                    </span>
                    {lastSaleSuggestion.date && (
                      <>
                        {" "}in{" "}
                        {new Date(lastSaleSuggestion.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-sm font-medium text-accent hover:underline"
                    onClick={() => {
                      setData((prev) => ({
                        ...prev,
                        purchasePrice: String(Math.round(lastSaleSuggestion.price)),
                        ...(lastSaleSuggestion.date ? { purchaseDate: lastSaleSuggestion.date.slice(0, 10) } : {}),
                      }));
                      setLastSaleSuggestion(null);
                      if (errors.purchasePrice) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.purchasePrice;
                          return next;
                        });
                      }
                    }}
                  >
                    Use this
                  </button>
                </div>
              )}
              {errors.purchasePrice && (
                <p className="mt-0.5 text-sm text-negative">{errors.purchasePrice}</p>
              )}
            </div>
          </div>

          <div>
            <p className={labelClass}>Rental status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setData((prev) => ({ ...prev, isRented: true }))}
                className={`min-h-[44px] rounded-md border px-3 py-2 text-sm transition-colors duration-150 ${
                  data.isRented
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-foreground hover:bg-subtle"
                }`}
              >
                Yes, rented
              </button>
              <button
                type="button"
                onClick={() => setData((prev) => ({ ...prev, isRented: false }))}
                className={`min-h-[44px] rounded-md border px-3 py-2 text-sm transition-colors duration-150 ${
                  !data.isRented
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-foreground hover:bg-subtle"
                }`}
              >
                No, not rented
              </button>
            </div>
            {data.isRented ? (
              <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="quickMonthlyRent" className={labelClass}>
                    Monthly rent *
                  </label>
                  <CurrencyInput
                    id="quickMonthlyRent"
                    value={data.currentMonthlyRent}
                    onChange={(v) =>
                      setData((prev) => ({ ...prev, currentMonthlyRent: v }))
                    }
                    required
                    className={inputClass}
                  />
                  {estimateLoading && (
                    <p className="mt-0.5 text-xs text-muted">Fetching market rate…</p>
                  )}
                  {!estimateLoading && data.marketRent && (
                    <p className="mt-0.5 text-xs text-muted">
                      Market rate: ~{formatCurrency(Number(data.marketRent))}/mo
                    </p>
                  )}
                  {errors.currentMonthlyRent && (
                    <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyRent}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="quickMonthlyExpenses" className={labelClass}>
                    Monthly expenses *
                  </label>
                  <CurrencyInput
                    id="quickMonthlyExpenses"
                    value={data.currentMonthlyExpenses}
                    onChange={(v) =>
                      setData((prev) => ({ ...prev, currentMonthlyExpenses: v }))
                    }
                    required
                    className={inputClass}
                  />
                  <p className="mt-0.5 text-xs text-muted">
                    Exclude mortgage — tracked separately.
                  </p>
                  {errors.currentMonthlyExpenses && (
                    <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyExpenses}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted">Income will be saved as $0 while not rented.</p>
                  {estimateLoading ? (
                    <div className="h-4 w-40 motion-safe:animate-pulse rounded-md bg-subtle" />
                  ) : data.marketRent ? (
                    <p className="text-sm text-muted">
                      Properties like this typically rent for{" "}
                      <span className="font-semibold tabular-nums text-foreground">
                        ~{formatCurrency(Number(data.marketRent))}/mo
                      </span>{" "}
                      in this area.
                    </p>
                  ) : null}
                </div>
                <div className="mt-5">
                  <label htmlFor="quickMonthlyExpenses" className={labelClass}>
                    Monthly expenses *
                  </label>
                  <CurrencyInput
                    id="quickMonthlyExpenses"
                    value={data.currentMonthlyExpenses}
                    onChange={(v) =>
                      setData((prev) => ({ ...prev, currentMonthlyExpenses: v }))
                    }
                    required
                    className={inputClass}
                  />
                  <p className="mt-0.5 text-xs text-muted">
                    Exclude mortgage — tracked separately.
                  </p>
                  {errors.currentMonthlyExpenses && (
                    <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyExpenses}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Link
            href="/properties"
            className="inline-flex rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create property"}
          </button>
        </div>
      </form>
    );
  }

  if (isMobile) {
    return (
      <MobileToolShell
        eyebrow="Add Property"
        title={String(STEP_LABELS[currentStep - 1])}
        context={
          <div className="overflow-x-auto pb-1">
            <WizardStepNav currentStep={currentStep} onGoToStep={goToStep} />
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="min-h-[44px] rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-all duration-150 hover:bg-subtle"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => void handleNext()}
                className="min-h-[44px] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="min-h-[44px] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create property"}
              </button>
            )}
          </div>
        }
      >
        <form onSubmit={handleFormSubmit}>
          {error && (
            <div className="mb-4 rounded-md px-4 py-2 text-sm text-negative">
              {error}
              {(error.includes("Upgrade") || error.includes("limit")) && (
                <button
                  type="button"
                  onClick={() => draft?.navigateTo("/plans")}
                  className="ml-1 font-medium underline hover:no-underline"
                >
                  Upgrade plan
                </button>
              )}
            </div>
          )}

          <div key={currentStep} className="wizard-step-enter">
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Address, property type, units, and optional property details.
              </p>
              <StepAddressBasics
                data={data}
                onChange={setData}
                errors={errors}
                onAddressAutofill={handleAddressAutofill}
                onClearErrors={clearErrors}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted">What you paid, current value, and ownership.</p>
                <StepPurchase
                  data={data}
                  onChange={setData}
                  errors={errors}
                  onEstimateValue={() => void handleEstimateValue()}
                  valueEstimateLoading={valueEstimateLoading}
                  valueEstimateError={valueEstimateError}
                />
              </div>
              <div className="mt-6 rounded-lg bg-subtle/40 p-4">
                <p className="mb-3 text-xs font-medium text-muted">Mortgage</p>
                <StepMortgage data={data} onChange={setData} errors={errors} />
              </div>
              <div className="mt-6 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => void handlePartialSave()}
                  disabled={submitting}
                  className="min-h-[44px] rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground disabled:opacity-50"
                >
                  Save basics and finish later
                </button>
                <p className="mt-1.5 text-xs text-muted">
                  Creates the property with Step 1 &amp; 2 data only. You can add income and mortgage later.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">Rent, operating expenses, and vacancy assumption.</p>
              <StepIncomeExpenses
                data={data}
                onChange={setData}
                errors={errors}
                onEstimateRent={() => void handleEstimateRent()}
                estimateLoading={estimateLoading}
                estimateError={estimateError}
                rentCastQuotaTick={rentCastQuotaTick}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Confirm the summary below, add optional notes, then create the property.
              </p>
              <div className="space-y-6">
                <StepReview
                  data={data}
                  previewMetrics={previewMetrics}
                  onEditStep={(step) => goToStep(step, { returnToReview: true })}
                />
                <div>
                  <label htmlFor="wizard-notes-mobile" className={labelClass}>
                    Notes (optional)
                  </label>
                  <textarea
                    id="wizard-notes-mobile"
                    rows={3}
                    value={notesValue}
                    onChange={(e) => setNotes(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        </form>
      </MobileToolShell>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="rounded-lg border border-border bg-card p-6">
      <nav
        aria-label="Wizard progress"
        className="sticky top-0 z-10 -mx-6 mb-6 border-b border-border bg-card px-6 py-3"
      >
        <WizardStepNav currentStep={currentStep} onGoToStep={goToStep} />
      </nav>

      {error && (
        <div className="mb-4 rounded-md px-4 py-2 text-sm text-negative">
          {error}
          {(error.includes("Upgrade") || error.includes("limit")) && (
            <button
              type="button"
              onClick={() => draft?.navigateTo("/plans")}
              className="ml-1 font-medium underline hover:no-underline"
            >
              Upgrade plan
            </button>
          )}
        </div>
      )}

      <div className="space-y-8">
        <div key={currentStep} className="wizard-step-enter">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{STEP_LABELS[0]}</h2>
            <p className="text-sm text-muted">
              Address, property type, units, and optional property details.
            </p>
            <StepAddressBasics
              data={data}
              onChange={setData}
              errors={errors}
              onAddressAutofill={handleAddressAutofill}
              onClearErrors={clearErrors}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{STEP_LABELS[1]}</h2>
              <p className="text-sm text-muted">What you paid, current value, and ownership.</p>
              <StepPurchase
                data={data}
                onChange={setData}
                errors={errors}
                onEstimateValue={() => {
                  void handleEstimateValue();
                }}
                valueEstimateLoading={valueEstimateLoading}
                valueEstimateError={valueEstimateError}
              />
            </div>
            <div className="mt-6 rounded-lg bg-subtle/40 p-4">
              <p className="mb-3 text-xs font-medium text-muted">Mortgage</p>
              <StepMortgage data={data} onChange={setData} errors={errors} />
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => void handlePartialSave()}
                disabled={submitting}
                className="min-h-[44px] rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground disabled:opacity-50"
              >
                Save basics and finish later
              </button>
              <p className="mt-1.5 text-xs text-muted">
                Creates the property with Step 1 &amp; 2 data only. You can add income and mortgage later.
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{STEP_LABELS[2]}</h2>
            <p className="text-sm text-muted">Rent, operating expenses, and vacancy assumption.</p>
            <StepIncomeExpenses
              data={data}
              onChange={setData}
              errors={errors}
              onEstimateRent={() => {
                void handleEstimateRent();
              }}
              estimateLoading={estimateLoading}
              estimateError={estimateError}
              rentCastQuotaTick={rentCastQuotaTick}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Review &amp; create</h2>
            <p className="text-sm text-muted">
              Confirm the summary below, add optional notes, then create the property.
            </p>
            <div className="space-y-6">
              <StepReview
                data={data}
                previewMetrics={previewMetrics}
                onEditStep={(step) => goToStep(step, { returnToReview: true })}
              />
              <div>
                <label htmlFor="wizard-notes" className={labelClass}>
                  Notes (optional)
                </label>
                <textarea
                  id="wizard-notes"
                  rows={3}
                  value={notesValue}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div className="flex items-center gap-2">
          {draft?.hasDraft ? (
            <button
              type="button"
              onClick={() => draft.navigateTo("/properties")}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/properties"
              className="inline-flex rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
            >
              Cancel
            </Link>
          )}
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
            >
              Back
            </button>
          )}
        </div>
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => {
              void handleNext();
            }}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create property"}
          </button>
        )}
      </div>
    </form>
  );
}
