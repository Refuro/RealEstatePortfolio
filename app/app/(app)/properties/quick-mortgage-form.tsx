"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

type QuickMortgageFormProps = {
  propertyId: string;
  /** When true, redirect to dashboard with first-property onboarding query after save. */
  isOnlyProperty: boolean;
};

type FieldErrors = Record<string, string>;

type MortgageFormState = {
  originalLoanAmount: string;
  currentBalance: string;
  interestRatePercent: string;
  termYears: string;
  startDate: string;
  monthlyPayment: string;
  escrowAmount: string;
};

const defaultFormState: MortgageFormState = {
  originalLoanAmount: "",
  currentBalance: "",
  interestRatePercent: "",
  termYears: "",
  startDate: "",
  monthlyPayment: "",
  escrowAmount: "",
};

const ORIGINAL_LOAN_HELPER = "The amount you originally borrowed.";

const labelClass = "block text-sm font-medium text-muted";
const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
const inputErrorClass = `${inputClass} ring-1 ring-negative/50 border-negative`;

function getFieldError(details: unknown, fieldName: string): string | null {
  if (!details || typeof details !== "object") return null;
  const detailsObject = details as { fieldErrors?: Record<string, string[]> };
  const message = detailsObject.fieldErrors?.[fieldName]?.[0];
  return typeof message === "string" ? message : null;
}

export function QuickMortgageForm({ propertyId, isOnlyProperty }: QuickMortgageFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<MortgageFormState>(defaultFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    captureClientEvent(AnalyticsEvents.QUICK_MORTGAGE_STARTED, {
      property_id: propertyId,
    });
  }, [propertyId]);

  function update<K extends keyof MortgageFormState>(key: K, value: MortgageFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateLocal(): FieldErrors {
    const errors: FieldErrors = {};

    const original = Number(form.originalLoanAmount) || 0;
    const current = Number(form.currentBalance) || 0;

    if (original <= 0) {
      errors.originalLoanAmount = "Enter a valid original loan amount.";
    }
    if (current <= 0) {
      errors.currentBalance = "Enter a valid current balance.";
    }
    if (
      original > 0 &&
      current > 0 &&
      current > original * 1.05
    ) {
      errors.currentBalance =
        "Current balance looks higher than the original loan. Double-check these values.";
    }
    if ((Number(form.interestRatePercent) || 0) < 0) {
      errors.interestRatePercent = "Enter a valid interest rate.";
    }
    if ((Number(form.termYears) || 0) < 1) {
      errors.termYears = "Enter a valid loan term.";
    }
    if (!form.startDate.trim()) {
      errors.startDate = "Start date is required.";
    }
    if ((Number(form.monthlyPayment) || 0) <= 0) {
      errors.monthlyPayment = "Enter a valid monthly payment.";
    }
    if (form.escrowAmount.trim() !== "") {
      const escrowVal = Number(form.escrowAmount);
      if (Number.isNaN(escrowVal) || escrowVal < 0) {
        errors.escrowAmount = "Enter a valid escrow amount.";
      } else if (
        escrowVal > 0 &&
        Number(form.monthlyPayment) > 0 &&
        escrowVal >= Number(form.monthlyPayment)
      ) {
        errors.escrowAmount = "Escrow amount must be less than monthly payment.";
      }
    }

    return errors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const localErrors = validateLocal();
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const escrowNum = Number(form.escrowAmount) || 0;
    const payload = {
      originalLoanAmount: form.originalLoanAmount,
      currentBalance: form.currentBalance,
      interestRate: String((Number(form.interestRatePercent) || 0) / 100),
      termYears: Number(form.termYears),
      startDate: form.startDate,
      monthlyPayment: form.monthlyPayment,
      escrowAmount: form.escrowAmount.trim() ? form.escrowAmount : null,
      escrowIncluded: escrowNum > 0,
      lenderName: null,
      loanType: null,
    };

    try {
      const res = await fetch(`/api/properties/${propertyId}/mortgage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: unknown;
      };

      if (!res.ok) {
        setError(data.error ?? "Could not save mortgage.");
        const apiErrors: FieldErrors = {};
        const originalLoanAmountError = getFieldError(data.details, "originalLoanAmount");
        const currentBalanceError = getFieldError(data.details, "currentBalance");
        const interestRateError = getFieldError(data.details, "interestRate");
        const termYearsError = getFieldError(data.details, "termYears");
        const startDateError = getFieldError(data.details, "startDate");
        const monthlyPaymentError = getFieldError(data.details, "monthlyPayment");
        const escrowAmountError = getFieldError(data.details, "escrowAmount");
        if (originalLoanAmountError) apiErrors.originalLoanAmount = originalLoanAmountError;
        if (currentBalanceError) apiErrors.currentBalance = currentBalanceError;
        if (interestRateError) apiErrors.interestRatePercent = interestRateError;
        if (termYearsError) apiErrors.termYears = termYearsError;
        if (startDateError) apiErrors.startDate = startDateError;
        if (monthlyPaymentError) apiErrors.monthlyPayment = monthlyPaymentError;
        if (escrowAmountError) apiErrors.escrowAmount = escrowAmountError;
        setFieldErrors(apiErrors);
        setSubmitting(false);
        return;
      }

      captureClientEvent(AnalyticsEvents.QUICK_MORTGAGE_SAVED, {
        property_id: propertyId,
      });
      router.push(
        isOnlyProperty ? "/dashboard?onboarding=first-property" : "/dashboard"
      );
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
    >
      {error && <p className="mb-3 rounded-md px-3 py-2 text-sm text-negative">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Original loan amount *</label>
          <p className="mt-0.5 text-xs text-muted">{ORIGINAL_LOAN_HELPER}</p>
          <CurrencyInput
            value={form.originalLoanAmount}
            onChange={(value) => update("originalLoanAmount", value)}
            required
            className={fieldErrors.originalLoanAmount ? inputErrorClass : inputClass}
          />
          {fieldErrors.originalLoanAmount && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.originalLoanAmount}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Current balance *</label>
          <p
            className="hidden text-xs text-muted sm:mt-0.5 sm:block sm:invisible"
            aria-hidden
          >
            {ORIGINAL_LOAN_HELPER}
          </p>
          <CurrencyInput
            value={form.currentBalance}
            onChange={(value) => update("currentBalance", value)}
            required
            className={fieldErrors.currentBalance ? inputErrorClass : inputClass}
          />
          {fieldErrors.currentBalance && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.currentBalance}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Interest rate (%) *</label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={30}
            inputMode="decimal"
            value={form.interestRatePercent}
            onChange={(e) => update("interestRatePercent", e.target.value)}
            required
            className={fieldErrors.interestRatePercent ? inputErrorClass : inputClass}
          />
          {fieldErrors.interestRatePercent && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.interestRatePercent}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Term (years) *</label>
          <input
            type="number"
            min={1}
            max={50}
            inputMode="numeric"
            value={form.termYears}
            onChange={(e) => update("termYears", e.target.value)}
            required
            className={fieldErrors.termYears ? inputErrorClass : inputClass}
          />
          {fieldErrors.termYears && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.termYears}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Start date *</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            required
            className={fieldErrors.startDate ? inputErrorClass : inputClass}
          />
          {fieldErrors.startDate && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.startDate}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Monthly payment *</label>
          <CurrencyInput
            value={form.monthlyPayment}
            onChange={(value) => update("monthlyPayment", value)}
            required
            className={fieldErrors.monthlyPayment ? inputErrorClass : inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Enter your total monthly mortgage payment, including escrow if any.
          </p>
          {fieldErrors.monthlyPayment && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.monthlyPayment}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Escrow portion (optional)</label>
          <CurrencyInput
            value={form.escrowAmount}
            onChange={(value) => update("escrowAmount", value)}
            className={fieldErrors.escrowAmount ? inputErrorClass : inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            How much of the payment above goes to taxes & insurance. Leave blank if no escrow.
          </p>
          {fieldErrors.escrowAmount && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.escrowAmount}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Link
          href={`/properties/${propertyId}`}
          onClick={() =>
            captureClientEvent(AnalyticsEvents.QUICK_MORTGAGE_SKIPPED, {
              property_id: propertyId,
            })
          }
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
        >
          I&apos;ll do this later
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save mortgage"}
        </button>
      </div>
    </form>
  );
}
