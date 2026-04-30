"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { inputClass, inputErrorClass, labelClass } from "./form-styles";
import { initialSubformState, type SubformBaseProps, type SubformState } from "./types";

export type InvestmentDetailsInitial = {
  purchasePrice: string;
  cashInvested: string;
};

export type InvestmentDetailsFormProps = SubformBaseProps & {
  propertyId: string;
  initial: InvestmentDetailsInitial;
};

function parseCurrencyNum(s: string): number {
  const cleaned = String(s ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function InvestmentDetailsForm({
  propertyId,
  initial,
  onSaved,
  onCancel,
  onStateChange,
  hideActions,
  className = "",
  formId,
}: InvestmentDetailsFormProps) {
  const [purchasePrice, setPurchasePrice] = useState(initial.purchasePrice);
  const [cashInvested, setCashInvested] = useState(initial.cashInvested);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubformState>(initialSubformState);

  const stateChangeRef = useRef(onStateChange);
  useLayoutEffect(() => {
    stateChangeRef.current = onStateChange;
  });
  useEffect(() => {
    stateChangeRef.current?.(state);
  }, [state]);

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!purchasePrice.trim() || parseCurrencyNum(purchasePrice) <= 0) {
      errors.purchasePrice = "Enter your actual purchase price.";
    }
    if (cashInvested.trim() && parseCurrencyNum(cashInvested) < 0) {
      errors.cashInvested = "Cash invested must be ≥ 0.";
    }
    return errors;
  }

  async function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setState({ saving: true, saved: false, error: null });
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchasePrice,
          cashInvested: cashInvested.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) {
        const apiErrors: Record<string, string> = {};
        const fe = data.details?.fieldErrors ?? {};
        for (const [k, msgs] of Object.entries(fe)) {
          if (Array.isArray(msgs) && msgs[0]) apiErrors[k] = msgs[0];
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

  return (
    <form id={formId} onSubmit={handleSubmit} className={`space-y-4 ${className}`} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="investment-purchasePrice" className={labelClass}>
            Purchase price *
          </label>
          <CurrencyInput
            id="investment-purchasePrice"
            value={purchasePrice}
            onChange={(v) => {
              setPurchasePrice(v);
              if (fieldErrors.purchasePrice) {
                setFieldErrors((p) => {
                  const n = { ...p };
                  delete n.purchasePrice;
                  return n;
                });
              }
            }}
            required
            className={fieldErrors.purchasePrice ? inputErrorClass : inputClass}
          />
          {fieldErrors.purchasePrice && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.purchasePrice}</p>
          )}
        </div>
        <div>
          <label htmlFor="investment-cashInvested" className={labelClass}>
            Cash invested
          </label>
          <CurrencyInput
            id="investment-cashInvested"
            value={cashInvested}
            onChange={(v) => {
              setCashInvested(v);
              if (fieldErrors.cashInvested) {
                setFieldErrors((p) => {
                  const n = { ...p };
                  delete n.cashInvested;
                  return n;
                });
              }
            }}
            className={fieldErrors.cashInvested ? inputErrorClass : inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Down payment, closing costs, and renovations. Drives cash-on-cash return.
          </p>
          {fieldErrors.cashInvested && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.cashInvested}</p>
          )}
        </div>
      </div>

      {state.error && (
        <p className="rounded-md px-3 py-2 text-sm text-negative">{state.error}</p>
      )}

      {!hideActions && (
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={state.saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
          >
            {state.saving ? "Saving…" : state.saved ? "Saved ✓" : "Save"}
          </button>
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
      )}
    </form>
  );
}
