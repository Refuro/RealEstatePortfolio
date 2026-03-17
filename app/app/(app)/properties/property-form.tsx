"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { US_STATES } from "@/lib/us-states";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-utils";

type PropertyFormData = {
  nickname?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  units: number;
  ownershipPercent: number;
  purchasePrice: string;
  purchaseDate: string;
  currentEstimatedValue: string;
  currentMonthlyRent: string;
  unitRents?: string[];
  currentMonthlyExpenses: string;
  vacancyPercent?: number;
  cashInvested?: string;
  bedrooms?: number;
  bathrooms?: string;
  unitMix?: string;
  notes?: string;
};

const defaultValues: PropertyFormData = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "single_family",
  units: 1,
  ownershipPercent: 100,
  purchasePrice: "",
  purchaseDate: "",
  currentEstimatedValue: "",
  currentMonthlyRent: "",
  currentMonthlyExpenses: "",
  cashInvested: "",
  notes: "",
};

type PropertyFormProps = {
  className?: string;
  property?: PropertyFormData & { id: string };
};

export function PropertyForm({ className = "", property }: PropertyFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [valueEstimateLoading, setValueEstimateLoading] = useState(false);
  const [valueEstimateError, setValueEstimateError] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState(property?.propertyType ?? "single_family");
  const [units, setUnits] = useState(property?.units ?? 1);
  const [purchasePrice, setPurchasePrice] = useState(property?.purchasePrice ?? "");
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState(property?.currentEstimatedValue ?? "");
  const [cashInvested, setCashInvested] = useState(property?.cashInvested ?? "");
  const [currentMonthlyRent, setCurrentMonthlyRent] = useState(property?.currentMonthlyRent ?? "");
  const hasExistingUnitRents = Array.isArray(property?.unitRents) && (property.unitRents as string[]).length > 0;
  const [unitRents, setUnitRents] = useState<string[]>(() => {
    const ur = property?.unitRents;
    if (Array.isArray(ur) && ur.length > 0) return ur.map(String);
    const n = property?.units ?? 1;
    return Array(n).fill("");
  });
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState(property?.currentMonthlyExpenses ?? "");
  const [vacancyPercent, setVacancyPercent] = useState(property?.vacancyPercent != null ? String(property.vacancyPercent) : "5");
  const [bedrooms, setBedrooms] = useState(property?.bedrooms != null ? String(property.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState(property?.bathrooms ?? "");

  const isEdit = !!property;
  const unitCount =
    propertyType === "multi_family" || propertyType === "apartment"
      ? Math.min(999, Math.max(1, units))
      : 1;
  const isMulti =
    (propertyType === "multi_family" || propertyType === "apartment") && unitCount > 1;
  const unitRentsDisplay = (() => {
    const arr = [...unitRents];
    while (arr.length < unitCount) arr.push("");
    return arr.length > unitCount ? arr.slice(0, unitCount) : arr;
  })();
  const values = property
    ? {
        nickname: property.nickname ?? "",
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2 ?? "",
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        propertyType: property.propertyType,
        units: property.units,
        ownershipPercent: property.ownershipPercent ?? 100,
        purchasePrice: property.purchasePrice,
        purchaseDate: property.purchaseDate,
        currentEstimatedValue: property.currentEstimatedValue,
        currentMonthlyRent: property.currentMonthlyRent,
        currentMonthlyExpenses: property.currentMonthlyExpenses,
        cashInvested: property.cashInvested ?? "",
        notes: property.notes ?? "",
      }
    : defaultValues;

  async function handleEstimateValue() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const addressLine1 = (fd.get("addressLine1") as string)?.trim();
    const city = (fd.get("city") as string)?.trim();
    const state = (fd.get("state") as string)?.trim();
    const zipCode = (fd.get("zipCode") as string)?.trim();
    if (!addressLine1 || !city || !state || !zipCode) {
      setValueEstimateError("Enter address first");
      return;
    }
    setValueEstimateError(null);
    setValueEstimateLoading(true);
    try {
      const params = new URLSearchParams({
        addressLine1,
        city,
        state,
        zipCode,
      });
      const addressLine2 = (fd.get("addressLine2") as string)?.trim();
      if (addressLine2) params.set("addressLine2", addressLine2);
      params.set("propertyType", propertyType);
      const res = await fetch(`/api/estimates/value?${params.toString()}`);
      const json = (await res.json()) as { value?: number; error?: string };
      if (json.value != null && Number.isFinite(json.value)) {
        setCurrentEstimatedValue(String(Math.round(json.value)));
      } else {
        setValueEstimateError(json.error ?? "Estimate unavailable for this address");
      }
    } catch {
      setValueEstimateError("Estimate unavailable for this address");
    } finally {
      setValueEstimateLoading(false);
    }
  }

  async function handleEstimateRent() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const addressLine1 = (fd.get("addressLine1") as string)?.trim();
    const city = (fd.get("city") as string)?.trim();
    const state = (fd.get("state") as string)?.trim();
    const zipCode = (fd.get("zipCode") as string)?.trim();
    if (!addressLine1 || !city || !state || !zipCode) {
      setEstimateError("Enter address first");
      return;
    }
    setEstimateError(null);
    setEstimateLoading(true);
    try {
      const params = new URLSearchParams({
        addressLine1,
        city,
        state,
        zipCode,
      });
      const addressLine2 = (fd.get("addressLine2") as string)?.trim();
      if (addressLine2) params.set("addressLine2", addressLine2);
      params.set("propertyType", propertyType);
      if (isMulti) params.set("units", String(unitCount));
      if (bedrooms.trim()) params.set("bedrooms", bedrooms);
      if (bathrooms.trim()) params.set("bathrooms", bathrooms);
      const res = await fetch(`/api/estimates/rent?${params.toString()}`);
      const json = (await res.json()) as { rent?: number; error?: string };
      if (json.rent != null && Number.isFinite(json.rent)) {
        if (isMulti && hasExistingUnitRents) {
          const perUnit = Math.round(json.rent / unitCount);
          setUnitRents(Array(unitCount).fill(String(perUnit)));
        } else {
          setCurrentMonthlyRent(String(Math.round(json.rent)));
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const u =
      ["single_family", "condo", "townhouse", "manufactured"].includes(propertyType)
        ? 1
        : Number(formData.get("units")) || unitCount;
    const unitRentsArr =
      isMulti && unitRentsDisplay.some((s) => (Number(s) || 0) > 0)
        ? unitRentsDisplay.slice(0, u).map((s) => Number(s) || 0)
        : null;
    const totalRent =
      unitRentsArr != null
        ? unitRentsArr.reduce((a, b) => a + b, 0)
        : Number(currentMonthlyRent) || 0;

    const payload: Record<string, unknown> = {
      nickname: (formData.get("nickname") as string) || undefined,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: (formData.get("addressLine2") as string) || undefined,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      propertyType: formData.get("propertyType") as string,
      units: u,
      ownershipPercent: Math.min(100, Math.max(1, Number(formData.get("ownershipPercent")) || 100)),
      purchasePrice,
      purchaseDate: formData.get("purchaseDate") as string,
      currentEstimatedValue,
      currentMonthlyRent: String(totalRent),
      currentMonthlyExpenses,
      vacancyPercent: Math.min(100, Math.max(0, Number(vacancyPercent) || 5)),
      cashInvested: cashInvested.trim() || undefined,
      notes: (formData.get("notes") as string) || undefined,
    };
    if (unitRentsArr != null) payload.unitRents = unitRentsArr;
    if (bedrooms.trim()) {
      const b = Number(bedrooms);
      if (!Number.isNaN(b) && b >= 1 && b <= 10) payload.bedrooms = Math.round(b);
    }
    if (bathrooms.trim()) {
      const b = Number(bathrooms);
      if (!Number.isNaN(b) && b >= 0.5 && b <= 10) payload.bathrooms = b;
    }

    try {
      const url = isEdit ? `/api/properties/${property.id}` : "/api/properties";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.code === "PLAN_LIMIT_REACHED"
            ? "Property limit reached. Upgrade your plan or remove a property to add more."
            : data.error || "Something went wrong"
        );
        setSubmitting(false);
        return;
      }
      router.push(`/properties/${isEdit ? property.id : data.id}`);
      router.refresh();
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-sm font-medium text-muted";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-lg border border-border bg-card p-6 ${className}`}
    >
      {error && (
        <div className="rounded-md px-4 py-2 text-sm text-negative">
          {error}
          {(error.includes("Upgrade") || error.includes("limit")) && (
            <Link
              href="/plans"
              className="ml-1 font-medium underline hover:no-underline"
            >
              Upgrade plan
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className={labelClass}>
            Nickname (optional)
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            defaultValue={values.nickname}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="addressLine1" className={labelClass}>
            Address line 1 *
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            type="text"
            required
            autoComplete="street-address"
            defaultValue={values.addressLine1}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="addressLine2" className={labelClass}>
            Address line 2 (optional)
          </label>
          <input
            id="addressLine2"
            name="addressLine2"
            type="text"
            autoComplete="address-line2"
            defaultValue={values.addressLine2}
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
              name="city"
              type="text"
              required
              autoComplete="address-level2"
              defaultValue={values.city}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="state" className={labelClass}>
              State *
            </label>
            <select
              id="state"
              name="state"
              required
              defaultValue={values.state || ""}
              className={inputClass}
            >
              <option value="">Select state</option>
              {US_STATES.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="zipCode" className={labelClass}>
              ZIP *
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              defaultValue={values.zipCode}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="propertyType" className={labelClass}>
              Property type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              defaultValue={values.propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={inputClass}
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {(propertyType === "multi_family" || propertyType === "apartment") && (
            <div>
              <label htmlFor="units" className={labelClass}>
                Units
              </label>
              <input
                id="units"
                name="units"
                type="number"
                min={1}
                max={999}
                inputMode="numeric"
                value={units}
                onChange={(e) => {
                  const n = Math.min(999, Math.max(1, Number(e.target.value) || 1));
                  setUnits(n);
                  const prev = unitRents.length;
                  if (prev < n) setUnitRents([...unitRents, ...Array(n - prev).fill("")]);
                  else if (prev > n) setUnitRents(unitRents.slice(0, n));
                }}
                className={inputClass}
              />
            </div>
          )}
          {["single_family", "condo", "townhouse", "manufactured"].includes(propertyType) && (
            <input type="hidden" name="units" value="1" />
          )}
        </div>

        {["single_family", "condo", "townhouse", "manufactured"].includes(propertyType) && (
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
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Improves rent estimates</p>
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
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Improves rent estimates</p>
            </div>
          </div>
        )}
        {(propertyType === "multi_family" || propertyType === "apartment") && (
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
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Improves rent estimates</p>
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
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Improves rent estimates</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="ownershipPercent" className={labelClass}>
            Ownership %
          </label>
          <input
            id="ownershipPercent"
            name="ownershipPercent"
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            defaultValue={values.ownershipPercent}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Your share of the property (1–100%). Use 100 for full ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="purchasePrice" className={labelClass}>
              Purchase price *
            </label>
            <CurrencyInput
              id="purchasePrice"
              value={purchasePrice}
              onChange={setPurchasePrice}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="purchaseDate" className={labelClass}>
              Purchase date *
            </label>
            <input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              required
              defaultValue={values.purchaseDate}
              className={inputClass}
            />
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
                  value={currentEstimatedValue}
                  onChange={setCurrentEstimatedValue}
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleEstimateValue}
                disabled={valueEstimateLoading}
                className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
              >
                {valueEstimateLoading ? "Estimating…" : "Estimate value"}
              </button>
            </div>
            {valueEstimateError && (
              <p className={`mt-0.5 text-sm ${valueEstimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{valueEstimateError}</p>
            )}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isMulti && hasExistingUnitRents ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                {unitRentsDisplay.map((_, i) => (
                  <div key={i} className="min-w-[100px] flex-1">
                    <label htmlFor={`unitRent-${i}`} className={labelClass}>
                      Unit {i + 1} rent *
                    </label>
                    <CurrencyInput
                      id={`unitRent-${i}`}
                      value={unitRentsDisplay[i] ?? ""}
                      onChange={(v) => {
                        const next = [...unitRentsDisplay];
                        next[i] = v;
                        setUnitRents(next);
                      }}
                      required
                      className={inputClass}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleEstimateRent}
                  disabled={estimateLoading}
                  className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
                >
                  {estimateLoading ? "Estimating…" : "Estimate rent"}
                </button>
              </div>
              <p className="text-sm text-muted">
                Total: $
                {unitRentsDisplay
                  .reduce((s, r) => s + (Number(r) || 0), 0)
                  .toLocaleString()}
                /mo
              </p>
              {estimateError && (
                <p className={`text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
              )}
            </div>
          ) : isMulti ? (
            <div>
              <label htmlFor="currentMonthlyRent" className={labelClass}>
                Total monthly rent *
              </label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <CurrencyInput
                    id="currentMonthlyRent"
                    value={currentMonthlyRent}
                    onChange={setCurrentMonthlyRent}
                    required
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEstimateRent}
                  disabled={estimateLoading}
                  className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
                >
                  {estimateLoading ? "Estimating…" : "Estimate rent"}
                </button>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Will be split evenly across {unitCount} units on save
              </p>
              {estimateError && (
                <p className={`mt-0.5 text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
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
                    value={currentMonthlyRent}
                    onChange={setCurrentMonthlyRent}
                    required
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEstimateRent}
                  disabled={estimateLoading}
                  className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
                >
                  {estimateLoading ? "Estimating…" : "Estimate rent"}
                </button>
              </div>
              {estimateError && (
                <p className={`mt-0.5 text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="currentMonthlyExpenses" className={labelClass}>
              Monthly expenses *
            </label>
            <CurrencyInput
              id="currentMonthlyExpenses"
              value={currentMonthlyExpenses}
              onChange={setCurrentMonthlyExpenses}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="vacancyPercent" className={labelClass}>
            Vacancy %
          </label>
          <input
            id="vacancyPercent"
            name="vacancyPercent"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={vacancyPercent}
            onChange={(e) => setVacancyPercent(e.target.value)}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Expected vacancy (e.g. 5%). Reduces rent in cash flow calculations.
          </p>
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={values.notes}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create property"}
        </button>
        <a
          href={isEdit ? `/properties/${property.id}` : "/properties"}
          className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
