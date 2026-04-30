"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  MortgageFormFields,
  defaultMortgageFormData,
  type MortgageFormData,
} from "@/app/(app)/properties/mortgage-form-fields";
import { initialSubformState, type SubformBaseProps, type SubformState } from "./types";

export type MortgageInitial = {
  hasMortgage: boolean | null;
  mortgagePaidOff: boolean;
  /** Existing mortgage to edit, if any. When provided, the form starts in edit mode. */
  existingMortgage?: {
    id: string;
    originalLoanAmount: string;
    currentBalance: string;
    balanceAsOfDate?: string | null;
    interestRate: string;
    termYears: number;
    startDate: string;
    monthlyPayment: string;
    paymentEffectiveDate?: string | null;
    escrowIncluded: boolean;
    escrowAmount?: string | null;
    lenderName?: string | null;
    loanType?: string | null;
  };
};

type MortgageMode = "choose" | "loan" | "paid_off" | "none";

export type MortgageFormProps = SubformBaseProps & {
  propertyId: string;
  initial: MortgageInitial;
};

function mortgageDataFromExisting(m: NonNullable<MortgageInitial["existingMortgage"]>): MortgageFormData {
  return {
    originalLoanAmount: m.originalLoanAmount,
    currentBalance: m.currentBalance,
    interestRatePercent: (Number(m.interestRate) * 100).toString(),
    termYears: m.termYears.toString(),
    startDate: m.startDate,
    monthlyPayment: m.monthlyPayment,
    escrowAmount: m.escrowAmount ?? "",
    lenderName: m.lenderName ?? "",
    loanType: m.loanType ?? "",
  };
}

function deriveInitialMode(initial: MortgageInitial): MortgageMode {
  if (initial.existingMortgage) return "loan";
  if (initial.mortgagePaidOff) return "paid_off";
  if (initial.hasMortgage === false) return "none";
  if (initial.hasMortgage === true) return "loan";
  return "choose";
}

function getFieldError(details: unknown, fieldName: string): string | null {
  if (!details || typeof details !== "object") return null;
  const obj = details as { fieldErrors?: Record<string, string[]> };
  const msg = obj.fieldErrors?.[fieldName]?.[0];
  return typeof msg === "string" ? msg : null;
}

export function MortgageForm({
  propertyId,
  initial,
  onSaved,
  onCancel,
  onStateChange,
  hideActions,
  className = "",
  formId,
}: MortgageFormProps) {
  const [mode, setMode] = useState<MortgageMode>(() => deriveInitialMode(initial));
  const [formData, setFormData] = useState<MortgageFormData>(() =>
    initial.existingMortgage ? mortgageDataFromExisting(initial.existingMortgage) : defaultMortgageFormData
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubformState>(initialSubformState);

  const stateChangeRef = useRef(onStateChange);
  useLayoutEffect(() => {
    stateChangeRef.current = onStateChange;
  });
  useEffect(() => {
    stateChangeRef.current?.(state);
  }, [state]);

  const isEditingExisting = !!initial.existingMortgage;

  function validateLoan(): Record<string, string> {
    const errors: Record<string, string> = {};
    const original = Number(formData.originalLoanAmount) || 0;
    const current = Number(formData.currentBalance) || 0;

    if (original <= 0) errors.originalLoanAmount = "Enter a valid original loan amount.";
    if (current <= 0) errors.currentBalance = "Enter a valid current balance.";
    if (original > 0 && current > 0 && current > original * 1.05) {
      errors.currentBalance =
        "Current balance looks higher than the original loan. Double-check these values.";
    }
    if ((Number(formData.interestRatePercent) || 0) < 0) {
      errors.interestRate = "Enter a valid interest rate.";
    }
    if ((Number(formData.termYears) || 0) < 1) {
      errors.termYears = "Enter a valid loan term.";
    }
    if (!formData.startDate.trim()) errors.startDate = "Start date is required.";
    if ((Number(formData.monthlyPayment) || 0) <= 0) {
      errors.monthlyPayment = "Enter a valid monthly payment.";
    }
    const escrowVal = Number(formData.escrowAmount);
    if (formData.escrowAmount.trim() !== "" && Number.isNaN(escrowVal)) {
      errors.escrowAmount = "Enter a valid escrow amount.";
    } else if (escrowVal < 0) {
      errors.escrowAmount = "Escrow amount must be ≥ 0.";
    } else if (
      escrowVal > 0 &&
      Number(formData.monthlyPayment) > 0 &&
      escrowVal >= Number(formData.monthlyPayment)
    ) {
      errors.escrowAmount = "Escrow amount must be less than monthly payment.";
    }
    return errors;
  }

  async function patchPropertyFlags(payload: { hasMortgage: boolean; mortgagePaidOff: boolean }) {
    setState({ saving: true, saved: false, error: null });
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState({ saving: false, saved: false, error: data.error ?? "Save failed" });
        return;
      }
      setState({ saving: false, saved: true, error: null });
      onSaved?.();
    } catch {
      setState({ saving: false, saved: false, error: "Network error" });
    }
  }

  async function submitLoan(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const errors = validateLoan();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setState({ saving: true, saved: false, error: null });
    const escrowNum = Number(formData.escrowAmount) || 0;
    const payload = {
      originalLoanAmount: formData.originalLoanAmount,
      currentBalance: formData.currentBalance,
      interestRate: ((Number(formData.interestRatePercent) || 0) / 100).toString(),
      termYears: Number(formData.termYears),
      startDate: formData.startDate,
      monthlyPayment: formData.monthlyPayment,
      escrowAmount: formData.escrowAmount.trim() ? formData.escrowAmount : null,
      escrowIncluded: escrowNum > 0,
      lenderName: formData.lenderName.trim() || null,
      loanType: formData.loanType.trim() || null,
    };

    try {
      const url = isEditingExisting
        ? `/api/properties/${propertyId}/mortgage/${initial.existingMortgage!.id}`
        : `/api/properties/${propertyId}/mortgage`;
      const method = isEditingExisting ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: unknown;
      };
      if (!res.ok) {
        const apiErrors: Record<string, string> = {};
        const fields = [
          "originalLoanAmount",
          "currentBalance",
          "interestRate",
          "termYears",
          "startDate",
          "monthlyPayment",
          "escrowAmount",
        ];
        for (const f of fields) {
          const msg = getFieldError(data.details, f);
          if (msg) apiErrors[f] = msg;
        }
        setFieldErrors(apiErrors);
        setState({ saving: false, saved: false, error: data.error ?? "Save failed" });
        return;
      }
      setState({ saving: false, saved: true, error: null });
      onSaved?.();
    } catch {
      setState({ saving: false, saved: false, error: "Network error" });
    }
  }

  if (mode === "choose") {
    return (
      <div className={`space-y-4 ${className}`}>
        <p className="text-sm text-muted">
          Mortgage details unlock LTV, DSCR, and refinance modeling. If the property is paid off
          or never had a mortgage, choose one of those options instead.
        </p>
        <div className="flex flex-col gap-2">
          <ChoiceButton
            primary
            title="Add mortgage"
            description="Enter loan details — unlocks DSCR, LTV, and refi modeling."
            onClick={() => setMode("loan")}
          />
          <ChoiceButton
            title="Mark as paid off"
            description="Property is owned free and clear."
            onClick={() => {
              setMode("paid_off");
              void patchPropertyFlags({ hasMortgage: false, mortgagePaidOff: true });
            }}
          />
          <ChoiceButton
            title="No mortgage"
            description="Never financed."
            onClick={() => {
              setMode("none");
              void patchPropertyFlags({ hasMortgage: false, mortgagePaidOff: false });
            }}
          />
        </div>
        {state.error && (
          <p className="rounded-md px-3 py-2 text-sm text-negative">{state.error}</p>
        )}
        {!hideActions && onCancel && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  if (mode === "paid_off" || mode === "none") {
    const label = mode === "paid_off" ? "Marked as paid off" : "No mortgage";
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="rounded-md border border-border bg-subtle/30 px-3 py-2 text-sm text-foreground">
          {state.saving
            ? "Saving…"
            : state.saved
            ? `${label} ✓`
            : label}
        </div>
        <button
          type="button"
          onClick={() => {
            setMode("choose");
            setState(initialSubformState);
          }}
          className="text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
        >
          Change
        </button>
        {state.error && (
          <p className="rounded-md px-3 py-2 text-sm text-negative">{state.error}</p>
        )}
      </div>
    );
  }

  async function handleClearAndMarkPaidOff() {
    if (!isEditingExisting || !initial.existingMortgage) return;
    setState({ saving: true, saved: false, error: null });
    try {
      const del = await fetch(
        `/api/properties/${propertyId}/mortgage/${initial.existingMortgage.id}`,
        { method: "DELETE" }
      );
      if (!del.ok) {
        const data = (await del.json().catch(() => ({}))) as { error?: string };
        setState({
          saving: false,
          saved: false,
          error: data.error ?? "Could not clear loan details.",
        });
        return;
      }
      const flagRes = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasMortgage: false, mortgagePaidOff: true }),
      });
      if (!flagRes.ok) {
        const data = (await flagRes.json().catch(() => ({}))) as { error?: string };
        setState({
          saving: false,
          saved: false,
          error: data.error ?? "Save failed",
        });
        return;
      }
      setState({ saving: false, saved: true, error: null });
      onSaved?.();
    } catch {
      setState({ saving: false, saved: false, error: "Network error" });
    }
  }

  return (
    <form id={formId} onSubmit={submitLoan} className={`space-y-4 ${className}`} noValidate>
      <MortgageFormFields value={formData} onChange={setFormData} errors={fieldErrors} />

      {state.error && (
        <p className="rounded-md px-3 py-2 text-sm text-negative">{state.error}</p>
      )}

      {!hideActions && (
        <>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={state.saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
            >
              {state.saving ? "Saving…" : state.saved ? "Saved ✓" : isEditingExisting ? "Save changes" : "Add mortgage"}
            </button>
            {!isEditingExisting && (
              <button
                type="button"
                onClick={() => {
                  setMode("choose");
                  setFieldErrors({});
                  setState(initialSubformState);
                }}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
              >
                Back
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
              >
                Cancel
              </button>
            )}
          </div>

          {isEditingExisting && (
            <div className="mt-4 border-t border-border-subtle pt-3">
              <p className="text-xs text-muted">
                Paid off the loan? Mark it here — this clears stored loan details and
                sets the property to paid-off.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm(
                      "Mark this mortgage as paid off? This will permanently clear the stored loan details."
                    )
                  ) {
                    return;
                  }
                  void handleClearAndMarkPaidOff();
                }}
                disabled={state.saving}
                className="mt-2 inline-flex min-h-[36px] items-center rounded-md border border-negative/30 bg-transparent px-3 py-1.5 text-sm font-medium text-negative transition-colors hover:bg-negative/10 disabled:opacity-50"
              >
                Mark mortgage paid off
              </button>
            </div>
          )}
        </>
      )}
    </form>
  );
}

function ChoiceButton({
  primary = false,
  title,
  description,
  onClick,
}: {
  primary?: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  const baseClasses =
    "group flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-150";
  const style = primary
    ? {
        background: "color-mix(in srgb, var(--accent) 6%, var(--card))",
        borderColor: "color-mix(in srgb, var(--accent) 32%, var(--border))",
      }
    : {
        background: "var(--card)",
        borderColor: "var(--border)",
      };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} hover:bg-card-hover`}
      style={style}
    >
      <div className="min-w-0 flex-1">
        <div
          className="text-sm font-semibold"
          style={{ color: primary ? "var(--accent)" : "var(--foreground)" }}
        >
          {title}
        </div>
        <div className="mt-0.5 text-xs leading-snug text-muted">{description}</div>
      </div>
      <span
        className="mt-1 text-base leading-none text-muted transition-colors group-hover:text-foreground"
        aria-hidden
      >
        ›
      </span>
    </button>
  );
}
