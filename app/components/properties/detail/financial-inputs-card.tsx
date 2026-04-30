"use client";

import { formatCurrency } from "@/lib/format-currency";
import { useIsMobile } from "@/lib/use-is-mobile";

export type FinancialInputsCardProps = {
  totalRent: number;
  unitRents: number[] | null;
  isRented: boolean;
  currentMonthlyExpenses: number;
  vacancyPercent: number | null;
  cashInvested: number | null;
  /** Computed annual rent (gross). */
  grossAnnualRent: number;
  /** Computed annual NOI. */
  noi: number;
  /** Opens the drawer at the financial-inputs section. */
  onEdit: () => void;
};

export function FinancialInputsCard({
  totalRent,
  unitRents,
  isRented,
  currentMonthlyExpenses,
  vacancyPercent,
  cashInvested,
  grossAnnualRent,
  noi,
  onEdit,
}: FinancialInputsCardProps) {
  const isMobile = useIsMobile();
  const isMultiUnit = Array.isArray(unitRents) && unitRents.length > 1;
  const monthlyRentValue = !isRented
    ? "Not rented"
    : isMultiUnit
    ? `${formatCurrency(totalRent)} (${unitRents!.length} units)`
    : formatCurrency(totalRent);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 md:py-4">
        <h2 className="text-base font-semibold text-foreground">Financial inputs</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 sm:gap-x-6 sm:gap-y-4 sm:py-5">
        <Cell label="Monthly rent" value={monthlyRentValue} />
        <Cell label="Monthly expenses" value={formatCurrency(currentMonthlyExpenses)} />
        {/* Mobile drops these — values are duplicated in the Performance card,
            and rental status / vacancy rarely change. Keep on desktop. */}
        {!isMobile && (
          <Cell label="Rental status" value={isRented ? "Currently rented" : "Vacant"} />
        )}
        {!isMobile && <Cell label="Vacancy rate" value={`${vacancyPercent ?? 5}%`} />}
        {!isMobile && <Cell label="Annual rent" value={formatCurrency(grossAnnualRent)} />}
        <Cell
          label="NOI"
          value={formatCurrency(noi)}
          hint="Net operating income"
        />
        <Cell
          label="Cash invested"
          value={cashInvested != null ? formatCurrency(cashInvested) : null}
          placeholder="Not set"
        />
        {!isMobile && <Cell label="Ownership" value="100%" />}
      </dl>
    </section>
  );
}

function Cell({
  label,
  value,
  hint,
  placeholder,
}: {
  label: string;
  value: string | null;
  hint?: string;
  placeholder?: string;
}) {
  const isEmpty = value == null;
  return (
    <div>
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm tabular-nums ${
          isEmpty ? "italic text-muted" : "font-medium text-foreground"
        }`}
      >
        {isEmpty ? placeholder ?? "—" : value}
      </dd>
      {hint && !isEmpty && (
        <p className="mt-0.5 text-[11px] leading-snug text-muted">{hint}</p>
      )}
    </div>
  );
}
