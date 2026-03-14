"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { US_STATES } from "@/lib/us-states";
import { createMortgageSchema } from "@/lib/validations/mortgage";
import {
  MortgageFormFields,
  defaultMortgageFormData,
  type MortgageFormData,
} from "./mortgage-form-fields";

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
  currentMonthlyRent: string;
  currentMonthlyExpenses: string;
  notes: string;
  addMortgage: boolean | null;
  mortgage: MortgageFormData;
};

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
  currentMonthlyRent: "",
  currentMonthlyExpenses: "",
  notes: "",
  addMortgage: null,
  mortgage: defaultMortgageFormData,
};

const STEPS = [
  { id: 1, title: "Address & basics" },
  { id: 2, title: "Purchase" },
  { id: 3, title: "Income & expenses" },
  { id: 4, title: "Mortgage" },
  { id: 5, title: "Review" },
] as const;

const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "block text-sm font-medium text-muted";

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
    onChange({ ...data, [key]: val });
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
              onChange({
                ...data,
                propertyType: val,
                units: val === "single_family" ? "1" : data.units,
              });
            }}
            className={inputClass}
          >
            <option value="single_family">Single family</option>
            <option value="multi_family">Multi family</option>
          </select>
        </div>
        {data.propertyType === "multi_family" && (
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
              onChange={(e) => update("units", e.target.value)}
              className={inputClass}
            />
            {errors.units && (
              <p className="mt-0.5 text-sm text-negative">{errors.units}</p>
            )}
          </div>
        )}
      </div>
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
  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    onChange({ ...data, [key]: val });
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
          <CurrencyInput
            id="currentEstimatedValue"
            value={data.currentEstimatedValue}
            onChange={(v) => update("currentEstimatedValue", v)}
            required
            className={inputClass}
          />
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
  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    onChange({ ...data, [key]: val });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currentMonthlyRent" className={labelClass}>
            Monthly rent *
          </label>
          <CurrencyInput
            id="currentMonthlyRent"
            value={data.currentMonthlyRent}
            onChange={(v) => update("currentMonthlyRent", v)}
            required
            className={inputClass}
          />
          {errors.currentMonthlyRent && (
            <p className="mt-0.5 text-sm text-negative">{errors.currentMonthlyRent}</p>
          )}
        </div>
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
      </div>
    </div>
  );
}

function mortgageFormDataToPayload(data: MortgageFormData) {
  const interestDecimal = (Number(data.interestRatePercent) / 100).toString();
  return {
    originalLoanAmount: data.originalLoanAmount,
    currentBalance: data.currentBalance,
    interestRate: interestDecimal,
    termYears: Number(data.termYears),
    startDate: data.startDate,
    monthlyPayment: data.monthlyPayment,
    paymentEffectiveDate: data.paymentEffectiveDate?.trim() ? data.paymentEffectiveDate : null,
    escrowIncluded: data.escrowIncluded,
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
        Would you like to add a mortgage for this property? You can add one later from the property detail page.
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

function StepReview({
  data,
  onEditStep,
}: {
  data: WizardData;
  onEditStep: (step: number) => void;
}) {
  const address = [data.addressLine1, data.addressLine2, data.city, data.state, data.zipCode]
    .filter(Boolean)
    .join(", ");

  const formatCurrency = (val: string) =>
    val ? `$${Number(val).toLocaleString()}` : "—";
  const formatDate = (val: string) => (val ? val : "—");

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Address & basics
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-sm font-medium text-foreground hover:underline"
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
              {data.propertyType === "single_family" ? "Single family" : "Multi family"}
              {data.propertyType === "multi_family" && ` (${data.units} units)`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Purchase
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-sm font-medium text-foreground hover:underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Purchase price</dt>
            <dd className="font-medium text-foreground">{formatCurrency(data.purchasePrice)}</dd>
          </div>
          <div>
            <dt className="text-muted">Purchase date</dt>
            <dd className="font-medium text-foreground">{formatDate(data.purchaseDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">Current value</dt>
            <dd className="font-medium text-foreground">{formatCurrency(data.currentEstimatedValue)}</dd>
          </div>
          {data.cashInvested && (
            <div>
              <dt className="text-muted">Cash invested</dt>
              <dd className="font-medium text-foreground">{formatCurrency(data.cashInvested)}</dd>
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
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-sm font-medium text-foreground hover:underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Monthly rent</dt>
            <dd className="font-medium text-foreground">{formatCurrency(data.currentMonthlyRent)}</dd>
          </div>
          <div>
            <dt className="text-muted">Monthly expenses</dt>
            <dd className="font-medium text-foreground">{formatCurrency(data.currentMonthlyExpenses)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Mortgage
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="text-sm font-medium text-foreground hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="mt-3 text-sm">
          {data.addMortgage === true ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <dt className="text-muted">Balance</dt>
                <dd className="font-medium text-foreground">
                  {formatCurrency(data.mortgage.currentBalance)}
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
                  {formatCurrency(data.mortgage.monthlyPayment)}
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
  if (data.propertyType === "multi_family") {
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
  const rent = Number(data.currentMonthlyRent);
  if (Number.isNaN(rent) || rent < 0) err.currentMonthlyRent = "Enter a valid monthly rent";
  const exp = Number(data.currentMonthlyExpenses);
  if (Number.isNaN(exp) || exp < 0) err.currentMonthlyExpenses = "Enter valid monthly expenses";
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
    interestRate: (Number(m.interestRatePercent) / 100).toString(),
    termYears: Number(m.termYears),
    startDate: m.startDate,
    monthlyPayment: m.monthlyPayment,
    escrowIncluded: m.escrowIncluded,
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
  return {};
}

export function AddPropertyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(defaultWizardData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goNext() {
    const stepErrors =
      step === 1
        ? validateStep1(data)
        : step === 2
          ? validateStep2(data)
          : step === 3
            ? validateStep3(data)
            : step === 4
              ? validateStep4(data)
              : {};
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    if (step < 5) {
      setStep(step + 1);
    }
  }

  function goBack() {
    setErrors({});
    if (step > 1) setStep(step - 1);
  }

  function handleEditStep(s: number) {
    setErrors({});
    setStep(s);
  }

  async function handleSubmit() {
    const step4Errors = validateStep4(data);
    if (Object.keys(step4Errors).length > 0) {
      setErrors(step4Errors);
      return;
    }

    setError(null);
    setSubmitting(true);

    const payload = {
      nickname: data.nickname.trim() || undefined,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2.trim() || undefined,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      propertyType: data.propertyType,
      units: data.propertyType === "single_family" ? 1 : Number(data.units),
      ownershipPercent: Math.min(100, Math.max(1, Number(data.ownershipPercent) || 100)),
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      currentEstimatedValue: data.currentEstimatedValue,
      currentMonthlyRent: data.currentMonthlyRent,
      currentMonthlyExpenses: data.currentMonthlyExpenses,
      cashInvested: data.cashInvested.trim() ? data.cashInvested : undefined,
      notes: data.notes.trim() || undefined,
    };

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
        setError(
          resData.code === "PLAN_LIMIT_REACHED"
            ? "Property limit reached. Upgrade your plan to add more properties."
            : resData.error || "Something went wrong"
        );
        setSubmitting(false);
        return;
      }
      router.push(`/properties/${resData.id}`);
      router.refresh();
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  // Fix notes in review - it's read-only, we need to allow editing
  const notesValue = data.notes;
  const setNotes = (notes: string) => setData((d) => ({ ...d, notes }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Progress indicator */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted">
          Step {step} of 5 — {STEPS[step - 1].title}
        </p>
        <div className="mt-2 flex gap-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full ${
                s.id <= step ? "bg-accent" : "bg-subtle"
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md px-4 py-2 text-sm text-negative">
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

      {/* Step content */}
      {step === 1 && (
        <StepAddressBasics data={data} onChange={setData} errors={errors} />
      )}
      {step === 2 && (
        <StepPurchase data={data} onChange={setData} errors={errors} />
      )}
      {step === 3 && (
        <StepIncomeExpenses data={data} onChange={setData} errors={errors} />
      )}
      {step === 4 && (
        <StepMortgage data={data} onChange={setData} errors={errors} />
      )}
      {step === 5 && (
        <>
          <StepReview data={data} onEditStep={handleEditStep} />
          <div className="mt-6">
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
        </>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
            >
              Back
            </button>
          ) : (
            <Link
              href="/properties"
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
            >
              Cancel
            </Link>
          )}
        </div>
        <div>
          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create property"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
