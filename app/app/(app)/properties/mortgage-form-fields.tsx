"use client";

import { CurrencyInput } from "@/components/currency-input";
import { LOAN_TYPE_OPTIONS } from "@/lib/validations/mortgage";

export type MortgageFormData = {
  originalLoanAmount: string;
  currentBalance: string;
  interestRatePercent: string;
  termYears: string;
  startDate: string;
  monthlyPayment: string;
  escrowAmount: string;
  lenderName: string;
  loanType: string;
};

export const defaultMortgageFormData: MortgageFormData = {
  originalLoanAmount: "",
  currentBalance: "",
  interestRatePercent: "",
  termYears: "",
  startDate: "",
  monthlyPayment: "",
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

  const sectionLabelClass =
    "text-[11px] font-semibold uppercase tracking-wide text-muted";

  return (
    <div className="space-y-5">
      {/* Current state — fields the user actually re-edits over time. Single
          column so helper text sits naturally under each input without
          breaking grid alignment. */}
      <section className="space-y-3">
        <h3 className={sectionLabelClass}>Current state</h3>
        <div>
          <label className={labelClass}>Current balance</label>
          <CurrencyInput
            value={value.currentBalance}
            onChange={(v) => update("currentBalance", v)}
            required
            className={inputClass}
          />
          {errors.currentBalance && (
            <p className="mt-0.5 text-xs text-negative">{errors.currentBalance}</p>
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
          <p className="mt-0.5 text-xs text-muted">
            Enter your total monthly mortgage payment, including escrow if any.
          </p>
          {errors.monthlyPayment && (
            <p className="mt-0.5 text-xs text-negative">{errors.monthlyPayment}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Escrow portion (optional)</label>
          <CurrencyInput
            value={value.escrowAmount}
            onChange={(v) => update("escrowAmount", v)}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            How much of the payment above goes to taxes & insurance. Leave blank if no escrow.
          </p>
          {errors.escrowAmount && (
            <p className="mt-0.5 text-xs text-negative">{errors.escrowAmount}</p>
          )}
        </div>
      </section>

      {/* Loan terms — historical / static after origination. Compact 2-col
          grid; six fields fill three rows so nothing is orphaned. */}
      <section className="space-y-3">
        <h3 className={sectionLabelClass}>Loan terms</h3>
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
            <label className={labelClass}>Lender name (optional)</label>
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
      </section>
    </div>
  );
}
