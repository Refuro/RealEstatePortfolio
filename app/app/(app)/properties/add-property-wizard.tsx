"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDraft, hasAnyWizardData } from "../draft-context";
import { CurrencyInput } from "@/components/currency-input";
import { formatCurrency } from "@/lib/format-currency";
import { US_STATES } from "@/lib/us-states";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-utils";
import { createMortgageSchema, validateEscrowAmount } from "@/lib/validations/mortgage";
import {
  MortgageFormFields,
  defaultMortgageFormData,
  type MortgageFormData,
} from "./mortgage-form-fields";
import { PropertySquareFeetField } from "@/components/property/property-square-feet-field";
import { RentCastQuotaHint } from "@/components/rentcast-quota-hint";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import {
  addPropertyMilestoneKey,
  hasFiredSession,
  markFiredSession,
} from "@/lib/analytics-dedup";

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

/** Sticky nav + anchor targets (Epic C — single-page add flow). */
const ADD_SECTION_NAV = [
  { id: "section-location", label: "Location & profile" },
  { id: "section-economics", label: "Purchase & value" },
  { id: "section-income", label: "Income & expenses" },
  { id: "section-mortgage", label: "Mortgage" },
  { id: "section-review", label: "Review" },
] as const;

/** DOM `id` → analytics `milestone` for `add_property_milestone_reached`. */
const ADD_PROPERTY_SECTION_MILESTONES: { domId: string; milestone: string }[] =
  ADD_SECTION_NAV.map((s) => ({
    domId: s.id,
    milestone: s.id.replace(/^section-/, "section_").replace(/-/g, "_"),
  }));

const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "block text-sm font-medium text-muted";

const ADDRESS_KEYS = ["addressLine1", "addressLine2", "city", "state", "zipCode"] as const;

function StepAddressBasics({
  data,
  onChange,
  errors,
}: {
  data: WizardData;
  onChange: (d: WizardData) => void;
  errors: Record<string, string>;
}) {
  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    const next = { ...data, [key]: val };
    if (ADDRESS_KEYS.includes(key as (typeof ADDRESS_KEYS)[number])) {
      next.lastValueEstimate = "";
      next.lastRentEstimate = "";
    }
    onChange(next);
  }

  return (
    <div className="space-y-4">
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
      <div>
        <label htmlFor="addressLine1" className={labelClass}>
          Address line 1 *
        </label>
        <input
          id="addressLine1"
          type="text"
          required
          autoComplete="street-address"
          value={data.addressLine1}
          onChange={(e) => update("addressLine1", e.target.value)}
          className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
              className={inputClass}
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
              Improves rent estimates
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
              Improves rent estimates
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
              Improves rent estimates
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
              Improves rent estimates
            </p>
          </div>
        </div>
      )}
      <PropertySquareFeetField
        value={data.squareFeet}
        onChange={(v) => update("squareFeet", v)}
        className="max-w-xs"
      />
    </div>
  );
}

function StepPurchase({
  data,
  onChange,
  errors,
}: {
  data: WizardData;
  onChange: (d: WizardData) => void;
  errors: Record<string, string>;
}) {
  const [valueEstimateLoading, setValueEstimateLoading] = useState(false);
  const [valueEstimateError, setValueEstimateError] = useState<string | null>(null);

  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    onChange({ ...data, [key]: val });
  }

  async function handleEstimateValue() {
    if (!data.addressLine1?.trim() || !data.city?.trim() || !data.state?.trim() || !data.zipCode?.trim()) {
      setValueEstimateError("Enter address in Step 1 first");
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
      const sq = parseInt(data.squareFeet?.trim() ?? "", 10);
      if (!Number.isNaN(sq) && sq >= 100) params.set("squareFootage", String(sq));
      const res = await fetch(`/api/estimates/value?${params.toString()}`);
      const json = (await res.json()) as { value?: number; error?: string };
      if (json.value != null && Number.isFinite(json.value)) {
        const val = String(Math.round(json.value));
        onChange({ ...data, currentEstimatedValue: val, lastValueEstimate: val });
      } else {
        setValueEstimateError(json.error ?? "Estimate unavailable for this address");
      }
    } catch {
      setValueEstimateError("Estimate unavailable for this address");
    } finally {
      setValueEstimateLoading(false);
    }
  }

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
            className={inputClass}
          />
          {errors.purchasePrice && (
            <p className="mt-0.5 text-sm text-negative">{errors.purchasePrice}</p>
          )}
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
            className={inputClass}
          />
          {errors.purchaseDate && (
            <p className="mt-0.5 text-sm text-negative">{errors.purchaseDate}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currentEstimatedValue" className={labelClass}>
            Current estimated value *
          </label>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <CurrencyInput
                id="currentEstimatedValue"
                value={data.currentEstimatedValue}
                onChange={(v) => update("currentEstimatedValue", v)}
                required
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={handleEstimateValue}
              disabled={
                valueEstimateLoading ||
                Boolean(
                  data.lastValueEstimate &&
                    parseCurrencyNum(data.currentEstimatedValue) === parseCurrencyNum(data.lastValueEstimate)
                )
              }
              className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
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
          className={inputClass}
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
}: {
  data: WizardData;
  onChange: (d: WizardData) => void;
  errors: Record<string, string>;
}) {
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [rentCastQuotaTick, setRentCastQuotaTick] = useState(0);

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

  const rentMatchesLastEstimate = Boolean(
    data.lastRentEstimate &&
      (isMulti
        ? Math.round(totalRent) === parseCurrencyNum(data.lastRentEstimate)
        : parseCurrencyNum(data.currentMonthlyRent) === parseCurrencyNum(data.lastRentEstimate))
  );

  async function handleEstimateRent() {
    if (!data.addressLine1?.trim() || !data.city?.trim() || !data.state?.trim() || !data.zipCode?.trim()) {
      setEstimateError("Enter address in Step 1 first");
      return;
    }
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
      if ((data.propertyType === "multi_family" || data.propertyType === "apartment") && data.units)
        params.set("units", data.units);
      if (data.bedrooms?.trim()) params.set("bedrooms", data.bedrooms);
      if (data.bathrooms?.trim()) params.set("bathrooms", data.bathrooms);
      const sqFt = parseInt(data.squareFeet?.trim() ?? "", 10);
      if (!Number.isNaN(sqFt) && sqFt >= 100) params.set("squareFootage", String(sqFt));
      const res = await fetch(`/api/estimates/rent?${params.toString()}`);
      const json = (await res.json()) as { rent?: number; marketRent?: number; marketRentAsOf?: string; error?: string };
      if (json.rent != null && Number.isFinite(json.rent)) {
        setRentCastQuotaTick((t) => t + 1);
        const today = new Date().toISOString().slice(0, 10);
        const marketRent = String(Math.round(json.rent));
        const marketRentAsOf = json.marketRentAsOf ?? today;
        const lastRentEstimate = String(Math.round(json.rent));
        if (isMulti) {
          const perUnit = Math.round(json.rent / units);
          const rents = Array(units).fill(String(perUnit));
          onChange({ ...data, unitRents: rents, marketRent, marketRentAsOf, lastRentEstimate });
        } else {
          onChange({ ...data, currentMonthlyRent: lastRentEstimate, marketRent, marketRentAsOf, lastRentEstimate });
        }
      } else {
        setEstimateError(json.error ?? "Estimate unavailable for this address");
      }
    } catch {
      setEstimateError("Estimate unavailable for this address");
    } finally {
      setEstimateLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <RentCastQuotaHint refreshKey={rentCastQuotaTick} />
      <div className="rounded-md border border-border bg-subtle/20 p-3">
        <p className="text-sm font-medium text-foreground">Is this property currently rented?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update("isRented", true)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
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
            className={`rounded-md border px-3 py-1.5 text-sm ${
              !data.isRented
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:bg-subtle"
            }`}
          >
            No, not rented
          </button>
        </div>
        {!data.isRented && (
          <p className="mt-2 text-xs text-muted">
            Not currently rented - income is saved as $0 until this is marked rented.
          </p>
        )}
      </div>
      {isMulti ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            {unitRents.map((_, i) => (
              <div key={i} className="min-w-0 w-full flex-1 sm:min-w-[120px] sm:w-auto">
                <label htmlFor={`unitRent-${i}`} className={labelClass}>
                  Unit {i + 1} rent {data.isRented ? "*" : ""}
                </label>
                <CurrencyInput
                  id={`unitRent-${i}`}
                  value={unitRents[i] ?? ""}
                  onChange={(v) => setUnitRent(i, v)}
                  required={data.isRented}
                  className={inputClass}
                />
              </div>
            ))}
            {data.isRented && (
              <button
                type="button"
                onClick={handleEstimateRent}
                disabled={estimateLoading || rentMatchesLastEstimate}
                className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
              >
                {estimateLoading ? "Estimating…" : "Estimate rent"}
              </button>
            )}
          </div>
          <p className="text-sm text-muted">
            {data.isRented
              ? `Total: $${totalRent.toLocaleString()}/mo`
              : "Monthly rent will be saved as $0 while not rented."}
          </p>
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
            Monthly rent {data.isRented ? "*" : ""}
          </label>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <CurrencyInput
                id="currentMonthlyRent"
                value={data.currentMonthlyRent}
                onChange={(v) => update("currentMonthlyRent", v)}
                required={data.isRented}
                className={inputClass}
              />
            </div>
            {data.isRented && (
              <button
                type="button"
                onClick={handleEstimateRent}
                disabled={estimateLoading || rentMatchesLastEstimate}
                className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
              >
                {estimateLoading ? "Estimating…" : "Estimate rent"}
              </button>
            )}
          </div>
          {!data.isRented && (
            <p className="mt-0.5 text-xs text-muted">
              Monthly rent will be saved as $0 while not rented.
            </p>
          )}
          {estimateError && (
            <p className={`mt-0.5 text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
          )}
          {errors.currentMonthlyRent && (
            <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyRent}</p>
          )}
        </div>
      )}
      <div>
        <label htmlFor="currentMonthlyExpenses" className={labelClass}>
          Monthly expenses *
        </label>
        <CurrencyInput
          id="currentMonthlyExpenses"
          value={data.currentMonthlyExpenses}
          onChange={(v) => update("currentMonthlyExpenses", v)}
          required
          className={inputClass}
        />
        {errors.currentMonthlyExpenses && (
            <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyExpenses}</p>
          )}
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
          className={inputClass}
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
        <div className="mt-6 rounded-md border border-border bg-subtle/50 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Mortgage details
          </h3>
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

function StepReview({ data }: { data: WizardData }) {
  const address = [data.addressLine1, data.addressLine2, data.city, data.state, data.zipCode]
    .filter(Boolean)
    .join(", ");

  const formatCurrencyVal = (val: string) =>
    val ? formatCurrency(Number(val)) : "—";
  const formatDate = (val: string) => (val ? val : "—");

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Address & basics
          </h3>
          <a
            href="#section-location"
            className="text-sm font-medium text-accent hover:underline"
          >
            Edit
          </a>
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Purchase
          </h3>
          <a
            href="#section-economics"
            className="text-sm font-medium text-accent hover:underline"
          >
            Edit
          </a>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Purchase price</dt>
            <dd className="font-medium text-foreground">{formatCurrencyVal(data.purchasePrice)}</dd>
          </div>
          <div>
            <dt className="text-muted">Purchase date</dt>
            <dd className="font-medium text-foreground">{formatDate(data.purchaseDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">Current value</dt>
            <dd className="font-medium text-foreground">{formatCurrencyVal(data.currentEstimatedValue)}</dd>
          </div>
          {data.cashInvested && (
            <div>
              <dt className="text-muted">Cash invested</dt>
              <dd className="font-medium text-foreground">{formatCurrencyVal(data.cashInvested)}</dd>
            </div>
          )}
          {data.ownershipPercent && Number(data.ownershipPercent) !== 100 && (
            <div>
              <dt className="text-muted">Ownership</dt>
              <dd className="font-medium text-foreground">{data.ownershipPercent}%</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Income & expenses
          </h3>
          <a
            href="#section-income"
            className="text-sm font-medium text-accent hover:underline"
          >
            Edit
          </a>
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
            <dd className="font-medium text-foreground">
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
            <dd className="font-medium text-foreground">{formatCurrencyVal(data.currentMonthlyExpenses)}</dd>
          </div>
          {data.vacancyPercent && Number(data.vacancyPercent) !== 5 && (
            <div>
              <dt className="text-muted">Vacancy</dt>
              <dd className="font-medium text-foreground">{data.vacancyPercent}%</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Mortgage
          </h3>
          <a
            href="#section-mortgage"
            className="text-sm font-medium text-accent hover:underline"
          >
            Edit
          </a>
        </div>
        <div className="mt-3 text-sm">
          {data.addMortgage === true ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <dt className="text-muted">Balance</dt>
                <dd className="font-medium text-foreground">
                  {formatCurrencyVal(data.mortgage.currentBalance)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Rate</dt>
                <dd className="font-medium text-foreground">
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
                <dd className="font-medium text-foreground">
                  {formatCurrencyVal(data.mortgage.monthlyPayment)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted">No mortgage</p>
          )}
        </div>
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

export function AddPropertyWizard({ dealId }: { dealId?: string }) {
  const router = useRouter();
  const draft = useDraft();
  const [data, setData] = useState<WizardData>(defaultWizardData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRestoredRef = useRef(false);
  const dealPrefilledRef = useRef(false);

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
            purchaseDate: prev.purchaseDate || today,
            currentMonthlyRent: (deal.currentMonthlyRent as string) ?? prev.currentMonthlyRent,
            currentMonthlyExpenses: (deal.currentMonthlyExpenses as string) ?? prev.currentMonthlyExpenses,
            vacancyPercent: deal.vacancyPercent != null ? String(deal.vacancyPercent) : prev.vacancyPercent,
            ownershipPercent: deal.ownershipPercent != null ? String(deal.ownershipPercent) : prev.ownershipPercent,
            cashInvested: (deal.cashInvested as string) ?? prev.cashInvested,
            notes: (deal.notes as string) ?? prev.notes,
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
    const key = addPropertyMilestoneKey("wizard_opened");
    if (hasFiredSession(key)) return;
    markFiredSession(key);
    captureClientEvent(AnalyticsEvents.ADD_PROPERTY_MILESTONE_REACHED, {
      milestone: "wizard_opened",
    });
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const { domId, milestone } of ADD_PROPERTY_SECTION_MILESTONES) {
      const el = document.getElementById(domId);
      if (!el) continue;
      const key = addPropertyMilestoneKey(milestone);
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            if (hasFiredSession(key)) continue;
            markFiredSession(key);
            captureClientEvent(AnalyticsEvents.ADD_PROPERTY_MILESTONE_REACHED, {
              milestone,
            });
          }
        },
        { root: null, threshold: 0.12 }
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  async function handleSubmit() {
    const { errors: allErrors, firstSectionId } = runAllValidations(data);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
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

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  // Fix notes in review - it's read-only, we need to allow editing
  const notesValue = data.notes;
  const setNotes = (notes: string) => setData((d) => ({ ...d, notes }));

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    void handleSubmit();
  }

  return (
    <form onSubmit={handleFormSubmit} className="rounded-lg border border-border bg-card p-6">
      <nav
        aria-label="Add property sections"
        className="sticky top-0 z-10 -mx-6 mb-8 border-b border-border bg-card/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-card/85"
      >
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Jump to</p>
        <ul className="flex gap-x-4 gap-y-2 overflow-x-auto text-sm md:flex-wrap">
          {ADD_SECTION_NAV.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                className="text-accent hover:underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
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

      <div className="space-y-10">
        <section
          id="section-location"
          tabIndex={-1}
          className="scroll-mt-28 border-b border-border pb-10"
          aria-labelledby="heading-location"
        >
          <h2 id="heading-location" className="text-lg font-semibold text-foreground">
            Location &amp; profile
          </h2>
          <p className="mt-1 text-sm text-muted">
            Address, property type, units, and optional details that improve rent estimates.
          </p>
          <div className="mt-4">
            <StepAddressBasics data={data} onChange={setData} errors={errors} />
          </div>
        </section>

        <section
          id="section-economics"
          tabIndex={-1}
          className="scroll-mt-28 border-b border-border pb-10"
          aria-labelledby="heading-economics"
        >
          <h2 id="heading-economics" className="text-lg font-semibold text-foreground">
            Purchase &amp; value
          </h2>
          <p className="mt-1 text-sm text-muted">What you paid, current value, and ownership.</p>
          <div className="mt-4">
            <StepPurchase data={data} onChange={setData} errors={errors} />
          </div>
        </section>

        <section
          id="section-income"
          tabIndex={-1}
          className="scroll-mt-28 border-b border-border pb-10"
          aria-labelledby="heading-income"
        >
          <h2 id="heading-income" className="text-lg font-semibold text-foreground">
            Income &amp; expenses
          </h2>
          <p className="mt-1 text-sm text-muted">Rent, operating expenses, and vacancy assumption.</p>
          <div className="mt-4">
            <StepIncomeExpenses data={data} onChange={setData} errors={errors} />
          </div>
        </section>

        <section
          id="section-mortgage"
          tabIndex={-1}
          className="scroll-mt-28 border-b border-border pb-10"
          aria-labelledby="heading-mortgage"
        >
          <h2 id="heading-mortgage" className="text-lg font-semibold text-foreground">
            Mortgage
          </h2>
          <div className="mt-4">
            <StepMortgage data={data} onChange={setData} errors={errors} />
          </div>
        </section>

        <section
          id="section-review"
          tabIndex={-1}
          className="scroll-mt-28"
          aria-labelledby="heading-review"
        >
          <h2 id="heading-review" className="text-lg font-semibold text-foreground">
            Review &amp; create
          </h2>
          <p className="mt-1 text-sm text-muted">Confirm the summary below, add optional notes, then create the property.</p>
          <div className="mt-4 space-y-6">
            <StepReview data={data} />
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
        </section>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div>
          {draft?.hasDraft ? (
            <button
              type="button"
              onClick={() => draft.navigateTo("/properties")}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/properties"
              className="inline-flex rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
            >
              Cancel
            </Link>
          )}
        </div>
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
