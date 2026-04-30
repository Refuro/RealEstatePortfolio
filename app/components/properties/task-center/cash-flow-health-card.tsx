import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import {
  cashFlowNegativeCopy,
  CASH_FLOW_POSITIVE_COPY,
  MINUS,
} from "./copy";

export type CashFlowNegativeRow = {
  propertyId: string;
  name: string;
  monthlyCashFlow: number;
};

const NEGATIVE_ROW_CAP = 3;

export function CashFlowHealthCard(
  props:
    | {
        variant: "negative";
        rows: CashFlowNegativeRow[];
      }
    | {
        variant: "positive";
        recentlyImprovedName?: string | null;
      }
) {
  if (props.variant === "negative") {
    if (props.rows.length === 0) return null;
    const copy = cashFlowNegativeCopy(props.rows.length);
    const visibleRows = props.rows.slice(0, NEGATIVE_ROW_CAP);
    // Single-property → property detail (no chip applied).
    const ctaHref =
      props.rows.length === 1
        ? `/properties/${props.rows[0].propertyId}`
        : "/properties?filter=cf_negative";
    const ctaLabel =
      props.rows.length === 1 ? "Open property" : copy.cta;
    return (
      <section
        aria-labelledby="task-cf-negative-title"
        className="rounded-xl border p-5 shadow-sm"
        style={{
          background: "var(--negative-dim)",
          borderColor: "color-mix(in srgb, var(--negative) 22%, transparent)",
        }}
      >
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-negative">
          Cash flow health
        </p>
        <h3
          id="task-cf-negative-title"
          className="mt-2 text-base font-semibold text-foreground"
        >
          {copy.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
        <ul className="mt-4 space-y-1.5">
          {visibleRows.map((row) => (
            <li
              key={row.propertyId}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <Link
                href={`/properties/${row.propertyId}`}
                className="truncate font-medium text-foreground hover:underline"
              >
                {row.name}
              </Link>
              <span className="shrink-0 tabular-nums font-medium text-negative">
                {MINUS}
                {formatCurrency(Math.abs(row.monthlyCashFlow))}/mo
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={ctaHref}
          className="mt-4 inline-flex items-center rounded-md border border-negative/30 bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-card-hover"
        >
          {ctaLabel}
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="task-cf-positive-title"
      className="rounded-xl border p-5 shadow-sm"
      style={{
        background: "var(--positive-dim)",
        borderColor: "color-mix(in srgb, var(--positive) 22%, transparent)",
      }}
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-positive">
        Cash flow health
      </p>
      <h3
        id="task-cf-positive-title"
        className="mt-2 text-base font-semibold text-foreground"
      >
        {CASH_FLOW_POSITIVE_COPY.title}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {props.recentlyImprovedName
          ? `${props.recentlyImprovedName} crossed back into positive cash flow this month.`
          : CASH_FLOW_POSITIVE_COPY.subtitle}
      </p>
      <Link
        href="/dashboard"
        className="mt-4 inline-flex items-center rounded-md border border-positive/30 bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-card-hover"
      >
        {CASH_FLOW_POSITIVE_COPY.cta}
      </Link>
    </section>
  );
}
