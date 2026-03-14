"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
      purchasePrice: formData.get("purchasePrice") as string,
      purchaseDate: formData.get("purchaseDate") as string,
      currentEstimatedValue: formData.get("currentEstimatedValue") as string,
      currentMonthlyRent: formData.get("currentMonthlyRent") as string,
      currentMonthlyExpenses: formData.get("currentMonthlyExpenses") as string,
      cashInvested: (formData.get("cashInvested") as string) || undefined,
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

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-lg border border-zinc-200 bg-white p-6 ${className}`}
    >
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-800">
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

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-zinc-700">
          Nickname (optional)
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          defaultValue={values.nickname}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium text-zinc-700">
          Address line 1 *
        </label>
        <input
          id="addressLine1"
          name="addressLine1"
          type="text"
          required
          defaultValue={values.addressLine1}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium text-zinc-700">
          Address line 2 (optional)
        </label>
        <input
          id="addressLine2"
          name="addressLine2"
          type="text"
          defaultValue={values.addressLine2}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-zinc-700">
            City *
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            defaultValue={values.city}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-zinc-700">
            State *
          </label>
          <select
            id="state"
            name="state"
            required
            defaultValue={values.state || ""}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
          <label htmlFor="zipCode" className="block text-sm font-medium text-zinc-700">
            ZIP *
          </label>
          <input
            id="zipCode"
            name="zipCode"
            type="text"
            required
            defaultValue={values.zipCode}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-zinc-700">
            Property type
          </label>
          <select
            id="propertyType"
            name="propertyType"
            defaultValue={values.propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="single_family">Single family</option>
            <option value="multi_family">Multi family</option>
          </select>
        </div>
        {propertyType === "multi_family" && (
          <div>
            <label htmlFor="units" className="block text-sm font-medium text-zinc-700">
              Units
            </label>
            <input
              id="units"
              name="units"
              type="number"
              min={1}
              max={999}
              defaultValue={values.units}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
        )}
        {propertyType === "single_family" && (
          <input type="hidden" name="units" value="1" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-zinc-700">
            Purchase price *
          </label>
          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={values.purchasePrice}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-zinc-700">
            Purchase date *
          </label>
          <input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            required
            defaultValue={values.purchaseDate}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currentEstimatedValue" className="block text-sm font-medium text-zinc-700">
            Current estimated value *
          </label>
          <input
            id="currentEstimatedValue"
            name="currentEstimatedValue"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={values.currentEstimatedValue}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="cashInvested" className="block text-sm font-medium text-zinc-700">
            Cash invested (optional)
          </label>
          <input
            id="cashInvested"
            name="cashInvested"
            type="number"
            step="0.01"
            min="0"
            defaultValue={values.cashInvested}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currentMonthlyRent" className="block text-sm font-medium text-zinc-700">
            Monthly rent *
          </label>
          <input
            id="currentMonthlyRent"
            name="currentMonthlyRent"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={values.currentMonthlyRent}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="currentMonthlyExpenses" className="block text-sm font-medium text-zinc-700">
            Monthly expenses *
          </label>
          <input
            id="currentMonthlyExpenses"
            name="currentMonthlyExpenses"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={values.currentMonthlyExpenses}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values.notes}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create property"}
        </button>
        <a
          href={isEdit ? `/properties/${property.id}` : "/properties"}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
