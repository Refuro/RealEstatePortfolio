"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { US_STATES } from "@/lib/us-states";

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
  currentMonthlyExpenses: string;
  cashInvested?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [propertyType, setPropertyType] = useState(property?.propertyType ?? "single_family");
  const [purchasePrice, setPurchasePrice] = useState(property?.purchasePrice ?? "");
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState(property?.currentEstimatedValue ?? "");
  const [cashInvested, setCashInvested] = useState(property?.cashInvested ?? "");
  const [currentMonthlyRent, setCurrentMonthlyRent] = useState(property?.currentMonthlyRent ?? "");
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState(property?.currentMonthlyExpenses ?? "");

  const isEdit = !!property;
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      nickname: (formData.get("nickname") as string) || undefined,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: (formData.get("addressLine2") as string) || undefined,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      propertyType: formData.get("propertyType") as string,
      units: propertyType === "single_family" ? 1 : Number(formData.get("units")),
      ownershipPercent: Math.min(100, Math.max(1, Number(formData.get("ownershipPercent")) || 100)),
      purchasePrice,
      purchaseDate: formData.get("purchaseDate") as string,
      currentEstimatedValue,
      currentMonthlyRent,
      currentMonthlyExpenses,
      cashInvested: cashInvested.trim() || undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

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
            ? "Property limit reached. Upgrade your plan to add more properties."
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
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-lg border border-border bg-card p-6 ${className}`}
    >
      {error && (
        <div className="rounded-md px-4 py-2 text-sm text-negative">
          {error}
          {error.includes("Upgrade") && (
            <Link
              href="/pricing"
              className="ml-1 font-medium underline hover:no-underline"
            >
              View plans
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
              <option value="single_family">Single family</option>
              <option value="multi_family">Multi family</option>
            </select>
          </div>
          {propertyType === "multi_family" && (
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
                defaultValue={values.units}
                className={inputClass}
              />
            </div>
          )}
          {propertyType === "single_family" && (
            <input type="hidden" name="units" value="1" />
          )}
        </div>

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
            <CurrencyInput
              id="currentEstimatedValue"
              value={currentEstimatedValue}
              onChange={setCurrentEstimatedValue}
              required
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="currentMonthlyRent" className={labelClass}>
              Monthly rent *
            </label>
            <CurrencyInput
              id="currentMonthlyRent"
              value={currentMonthlyRent}
              onChange={setCurrentMonthlyRent}
              required
              className={inputClass}
            />
          </div>
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
