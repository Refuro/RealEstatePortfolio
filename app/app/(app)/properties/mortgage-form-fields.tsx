"use client";

import { CurrencyInput } from "@/components/currency-input";
import { LOAN_TYPE_OPTIONS } from "@/lib/validations/mortgage";

export type MortgageFormData = {
  originalLoanAmount: string;
  currentBalance: string;
  balanceAsOfDate: string;
  interestRatePercent: string;
  termYears: string;
  startDate: string;
  monthlyPayment: string;
  paymentEffectiveDate: string;
  escrowIncluded: boolean;
  escrowAmount: string;
  lenderName: string;
  loanType: string;
};

export const defaultMortgageFormData: MortgageFormData = {
  originalLoanAmount: "",
  currentBalance: "",
  balanceAsOfDate: "",
  interestRatePercent: "",
  termYears: "",
  startDate: "",
  monthlyPayment: "",
  paymentEffectiveDate: "",
  escrowIncluded: false,
  escrowAmount: "",
  lenderName: "",
  loanType: "",
};

export function MortgageFormFields({
  value,
  onChange,
  errors = {},
}: {
  value: MortgageFormData;
  onChange: (data: MortgageFormData) => void;
  errors?: Record<string, string>;
}) {
  const inputClass =
    "mt-0.5 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 placeholder:text-muted";
  const labelClass = "block text-xs font-medium text-muted";

  function update<K extends keyof MortgageFormData>(key: K, val: MortgageFormData[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Original loan amount</label>
          <CurrencyInput
            value={value.originalLoanAmount}
            onChange={(v) => update("originalLoanAmount", v)}
            required
            className={inputClass}
          />
          {errors.originalLoanAmount && (
            <p className="mt-0.5 text-xs text-negative">{errors.originalLoanAmount}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Current balance</label>
          <CurrencyInput
            value={value.currentBalance}
            onChange={(v) => {
              update("currentBalance", v);
              if (!value.balanceAsOfDate) {
                update("balanceAsOfDate", new Date().toISOString().slice(0, 10));
              }
            }}
            required
            className={inputClass}
          />
          {errors.currentBalance && (
            <p className="mt-0.5 text-xs text-negative">{errors.currentBalance}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Balance as of (optional)</label>
          <input
            type="date"
            value={value.balanceAsOfDate}
            onChange={(e) => update("balanceAsOfDate", e.target.value)}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Date from your statement when you last updated the balance
          </p>
          {errors.balanceAsOfDate && (
            <p className="mt-0.5 text-xs text-negative">{errors.balanceAsOfDate}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Interest rate (%)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={30}
            required
            inputMode="decimal"
            placeholder="e.g. 6.25"
            value={value.interestRatePercent}
            onChange={(e) => update("interestRatePercent", e.target.value)}
            className={inputClass}
          />
          {errors.interestRate && (
            <p className="mt-0.5 text-xs text-negative">{errors.interestRate}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Term (years)</label>
          <input
            type="number"
            min={1}
            max={50}
            required
            inputMode="numeric"
            value={value.termYears}
            onChange={(e) => update("termYears", e.target.value)}
            className={inputClass}
          />
          {errors.termYears && (
            <p className="mt-0.5 text-xs text-negative">{errors.termYears}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            required
            value={value.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className={inputClass}
          />
          {errors.startDate && (
            <p className="mt-0.5 text-xs text-negative">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Monthly payment</label>
          <CurrencyInput
            value={value.monthlyPayment}
            onChange={(v) => update("monthlyPayment", v)}
            required
            className={inputClass}
          />
          {errors.monthlyPayment && (
            <p className="mt-0.5 text-xs text-negative">{errors.monthlyPayment}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Payment as of (optional)</label>
          <input
            type="date"
            value={value.paymentEffectiveDate}
            onChange={(e) => update("paymentEffectiveDate", e.target.value)}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            When the monthly payment was last confirmed (e.g. after escrow review)
          </p>
          {errors.paymentEffectiveDate && (
            <p className="mt-0.5 text-xs text-negative">{errors.paymentEffectiveDate}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Lender name</label>
          <input
            type="text"
            value={value.lenderName}
            onChange={(e) => update("lenderName", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Loan type</label>
          <select
            value={value.loanType}
            onChange={(e) => update("loanType", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {LOAN_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "FHA" || opt === "VA" || opt === "USDA"
                  ? opt
                  : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={value.escrowIncluded}
              onChange={(e) => update("escrowIncluded", e.target.checked)}
              className="rounded border-border"
            />
            Escrow included in payment
          </label>
        </div>
        {value.escrowIncluded && (
          <div>
            <label className={labelClass}>Escrow amount (optional)</label>
            <CurrencyInput
              value={value.escrowAmount}
              onChange={(v) => update("escrowAmount", v)}
              className={inputClass}
            />
            <p className="mt-0.5 text-xs text-muted">
              Used for balance projection. Your total payment above is used for cash flow.
            </p>
            {errors.escrowAmount && (
              <p className="mt-0.5 text-xs text-negative">{errors.escrowAmount}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
