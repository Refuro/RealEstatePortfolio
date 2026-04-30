"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { inputClass, inputErrorClass, labelClass } from "./form-styles";
import { initialSubformState, type SubformBaseProps, type SubformState } from "./types";

const MULTI_TYPES = ["multi_family", "apartment"];

export type FinancialInputsInitial = {
  isRented: boolean;
  currentMonthlyRent: string;
  unitRents: string[];
  vacancyPercent: string;
  currentMonthlyExpenses: string;
  cashInvested: string;
  propertyType: string;
  units: number;
};

export type FinancialInputsFormProps = SubformBaseProps & {
  propertyId: string;
  initial: FinancialInputsInitial;
  /** Drives "total" vs "your share" labeling. Defaults to 100. */
  ownershipPercent?: number;
};

function parseCurrencyNum(s: string): number {
  const cleaned = String(s ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function FinancialInputsForm({
  propertyId,
  initial,
  ownershipPercent = 100,
  onSaved,
  onCancel,
  onStateChange,
  hideActions,
  className = "",
  formId,
}: FinancialInputsFormProps) {
  const partialOwnership = ownershipPercent < 100;
  const [isRented, setIsRented] = useState(initial.isRented);
  const [currentMonthlyRent, setCurrentMonthlyRent] = useState(initial.currentMonthlyRent);
  const [unitRents, setUnitRents] = useState<string[]>(() => {
    const arr = initial.unitRents.length ? [...initial.unitRents] : [];
    while (arr.length < initial.units) arr.push("");
    return arr.slice(0, initial.units);
  });
  const [vacancyPercent, setVacancyPercent] = useState(initial.vacancyPercent);
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState(
    initial.currentMonthlyExpenses
  );
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

  const isMulti = MULTI_TYPES.includes(initial.propertyType) && initial.units > 1;
  const hasExistingUnitRents = initial.unitRents.length > 0;

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (isRented) {
      if (isMulti && hasExistingUnitRents) {
        const total = unitRents.reduce((s, r) => s + parseCurrencyNum(r), 0);
        if (total <= 0) errors.unitRents = "Enter rent for at least one unit.";
      } else if (parseCurrencyNum(currentMonthlyRent) <= 0) {
        errors.currentMonthlyRent = "Enter monthly rent or mark as not rented.";
      }
    }
    if (vacancyPercent.trim()) {
      const v = Number(vacancyPercent);
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        errors.vacancyPercent = "Vacancy must be between 0 and 100.";
      }
    }
    if (parseCurrencyNum(currentMonthlyExpenses) < 0) {
      errors.currentMonthlyExpenses = "Expenses must be ≥ 0.";
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

    const payload: Record<string, unknown> = {
      isRented,
      vacancyPercent: Math.min(100, Math.max(0, Number(vacancyPercent) || 5)),
      currentMonthlyExpenses: String(parseCurrencyNum(currentMonthlyExpenses)),
      cashInvested: cashInvested.trim() || null,
    };

    if (!isRented) {
      payload.currentMonthlyRent = "0";
    } else if (isMulti && hasExistingUnitRents) {
      const arr = unitRents
        .slice(0, initial.units)
        .map((s) => parseCurrencyNum(s));
      payload.unitRents = arr;
      payload.currentMonthlyRent = String(arr.reduce((a, b) => a + b, 0));
    } else if (isMulti) {
      const total = parseCurrencyNum(currentMonthlyRent);
      const perUnit = Math.round((total / initial.units) * 100) / 100;
      payload.unitRents = Array(initial.units).fill(perUnit);
      payload.currentMonthlyRent = String(total);
    } else {
      payload.currentMonthlyRent = String(parseCurrencyNum(currentMonthlyRent));
    }

    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const totalUnitRent = unitRents.reduce((s, r) => s + parseCurrencyNum(r), 0);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      noValidate
    >
      <div className="rounded-md border border-border bg-subtle/20 p-3">
        <p className="text-sm font-medium text-foreground">
          Is this property currently rented?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsRented(true)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              isRented
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:bg-subtle"
            }`}
          >
            Yes, rented
          </button>
          <button
            type="button"
            onClick={() => setIsRented(false)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              !isRented
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:bg-subtle"
            }`}
          >
            No, not rented
          </button>
        </div>
        {!isRented && (
          <p className="mt-2 text-xs text-muted">
            Income is saved as $0 until this is marked rented.
          </p>
        )}
      </div>

      {isMulti && hasExistingUnitRents ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-end gap-2">
            {unitRents.map((rent, i) => (
              <div key={i} className="min-w-0 w-full flex-1 sm:min-w-[100px] sm:w-auto">
                <label htmlFor={`fi-rent-unit-${i}`} className={labelClass}>
                  Unit {i + 1} rent {isRented ? "*" : ""}
                </label>
                <CurrencyInput
                  id={`fi-rent-unit-${i}`}
                  value={rent}
                  onChange={(v) => {
                    const next = [...unitRents];
                    next[i] = v;
                    setUnitRents(next);
                  }}
                  required={isRented}
                  className={fieldErrors.unitRents ? inputErrorClass : inputClass}
                />
              </div>
            ))}
          </div>
          {isRented && (
            <p className="text-sm text-muted">
              Total: ${totalUnitRent.toLocaleString()}/mo
            </p>
          )}
          {fieldErrors.unitRents && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.unitRents}</p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="fi-currentMonthlyRent" className={labelClass}>
            {isMulti ? "Total monthly rent" : "Monthly rent"}
            {partialOwnership && !isMulti ? " (total)" : ""} {isRented ? "*" : ""}
          </label>
          <CurrencyInput
            id="fi-currentMonthlyRent"
            value={currentMonthlyRent}
            onChange={setCurrentMonthlyRent}
            required={isRented}
            className={fieldErrors.currentMonthlyRent ? inputErrorClass : inputClass}
          />
          {isMulti && isRented && (
            <p className="mt-0.5 text-xs text-muted">
              Will be split evenly across {initial.units} units on save.
            </p>
          )}
          {partialOwnership && (
            <p className="mt-0.5 text-xs text-muted">
              Enter the property&apos;s full rent — your {ownershipPercent}% share is calculated automatically.
            </p>
          )}
          {fieldErrors.currentMonthlyRent && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.currentMonthlyRent}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fi-currentMonthlyExpenses" className={labelClass}>
            Monthly expenses{partialOwnership ? " (total)" : ""}
          </label>
          <CurrencyInput
            id="fi-currentMonthlyExpenses"
            value={currentMonthlyExpenses}
            onChange={setCurrentMonthlyExpenses}
            className={
              fieldErrors.currentMonthlyExpenses ? inputErrorClass : inputClass
            }
          />
          <p className="mt-0.5 text-xs text-muted">
            Taxes, insurance, HOA, maintenance reserve.
            {partialOwnership && ` Enter the property's full expenses — your ${ownershipPercent}% share is calculated automatically.`}
          </p>
          {fieldErrors.currentMonthlyExpenses && (
            <p className="mt-0.5 text-sm text-negative">
              {fieldErrors.currentMonthlyExpenses}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="fi-vacancyPercent" className={labelClass}>
            Vacancy %
          </label>
          <input
            id="fi-vacancyPercent"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={vacancyPercent}
            onChange={(e) => setVacancyPercent(e.target.value)}
            className={fieldErrors.vacancyPercent ? inputErrorClass : inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">Reduces rent in cash flow calcs.</p>
          {fieldErrors.vacancyPercent && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.vacancyPercent}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="fi-cashInvested" className={labelClass}>
          Cash invested — your share
        </label>
        <CurrencyInput
          id="fi-cashInvested"
          value={cashInvested}
          onChange={setCashInvested}
          className={fieldErrors.cashInvested ? inputErrorClass : inputClass}
        />
        <p className="mt-0.5 text-xs text-muted">
          What you personally put in: down payment, closing costs, renovations.
          Drives cash-on-cash return on your money.
        </p>
        {fieldErrors.cashInvested && (
          <p className="mt-0.5 text-sm text-negative">{fieldErrors.cashInvested}</p>
        )}
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
