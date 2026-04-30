import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { refiReadyCopy } from "./copy";

export type RefiReadyRow = {
  propertyId: string;
  name: string;
  equityPct: number;
  currentEquity: number;
};

const ROW_CAP = 3;

export function RefiReadyCard({ rows }: { rows: RefiReadyRow[] }) {
  if (rows.length === 0) return null;

  const copy = refiReadyCopy(rows.length);
  const visibleRows = rows.slice(0, ROW_CAP);
  // Single-property CTA opens Refinance directly; multi-property CTA filters
  // the directory so the user can pick.
  const ctaHref =
    rows.length === 1
      ? `/refinance?propertyId=${encodeURIComponent(rows[0].propertyId)}`
      : "/properties?filter=refi_ready";

  return (
    <section
      aria-labelledby="task-refi-title"
      className="rounded-xl border p-5 shadow-sm"
      style={{
        background: "var(--positive-dim)",
        borderColor: "color-mix(in srgb, var(--positive) 22%, transparent)",
      }}
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-positive">
        Refi opportunity
      </p>
      <h3
        id="task-refi-title"
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
            <span className="shrink-0 tabular-nums text-muted">
              {Math.round(row.equityPct * 100)}% ·{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(row.currentEquity)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex items-center rounded-md border border-positive/30 bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-card-hover"
      >
        {copy.cta}
      </Link>
    </section>
  );
}
