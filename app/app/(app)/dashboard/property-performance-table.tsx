"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronUp, ChevronDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { formatTimeAgo } from "@/lib/date-utils";
import {
  getBenchmarkEligibility,
  getBenchmarkLabel,
  getBenchmarkTone,
  BENCHMARK_UX_MESSAGES,
} from "@/lib/benchmark-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PropertyTableRow = {
  id: string;
  name: string;
  addressLine1: string;
  updatedAt: Date;
  value: number;
  equity: number;
  monthlyCashFlow: number;
  capRate: number | null;
  valueDeltaMoM: number | null;
  equityDeltaMoM: number | null;
  cashFlowDeltaMoM: number | null;
  isRented: boolean;
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
  noMortgage: boolean;
  benchmarkStale: boolean;
  negativeCashFlow: boolean;
  incompleteProfile: boolean;
  needsAttention: boolean;
};

type SortColumn = "value" | "equity" | "cashFlow" | "capRate" | "updated";
type SortDirection = "asc" | "desc";
type SortMode = "value" | "delta";

type SortState = {
  column: SortColumn;
  direction: SortDirection;
  mode: SortMode;
};

type FilterKey = "all" | "needs_attention" | "negative_cashflow" | "stale_benchmark" | "incomplete_profile";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_attention", label: "Needs attention" },
  { key: "negative_cashflow", label: "Negative cash flow" },
  { key: "stale_benchmark", label: "Stale benchmark" },
  { key: "incomplete_profile", label: "Incomplete profile" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDeltaForColumn(row: PropertyTableRow, column: SortColumn): number | null {
  if (column === "value") return row.valueDeltaMoM;
  if (column === "equity") return row.equityDeltaMoM;
  if (column === "cashFlow") return row.cashFlowDeltaMoM;
  return null;
}

function sortRows(rows: PropertyTableRow[], sort: SortState): PropertyTableRow[] {
  return [...rows].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    if (sort.mode === "delta") {
      const aDelta = getDeltaForColumn(a, sort.column);
      const bDelta = getDeltaForColumn(b, sort.column);
      // Null deltas always go to the bottom, regardless of direction.
      if (aDelta === null && bDelta === null) return 0;
      if (aDelta === null) return 1;
      if (bDelta === null) return -1;
      aVal = aDelta;
      bVal = bDelta;
    } else {
      switch (sort.column) {
        case "value": aVal = a.value; bVal = b.value; break;
        case "equity": aVal = a.equity; bVal = b.equity; break;
        case "cashFlow": aVal = a.monthlyCashFlow; bVal = b.monthlyCashFlow; break;
        case "capRate":
          aVal = a.capRate ?? -Infinity;
          bVal = b.capRate ?? -Infinity;
          break;
        case "updated":
          aVal = a.updatedAt.getTime();
          bVal = b.updatedAt.getTime();
          break;
        default: return 0;
      }
    }

    return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DeltaIndicator({
  delta,
  prefix = "",
}: {
  delta: number | null;
  prefix?: string;
}) {
  if (delta === null || delta === 0) return null;
  const positive = delta > 0;
  return (
    <span
      className={`ml-1 tabular-nums text-xs ${positive ? "text-positive" : "text-negative"}`}
    >
      ({positive ? "+" : ""}
      {prefix}
      {formatCurrency(delta)})
    </span>
  );
}

function InsightTag({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "negative";
}) {
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
        tone === "negative"
          ? "border-negative/40 bg-negative/10 text-negative"
          : "border-border bg-subtle text-muted"
      }`}
    >
      {label}
    </span>
  );
}

function BenchmarkCell({
  row,
}: {
  row: PropertyTableRow;
}) {
  const eligibility = getBenchmarkEligibility({
    isRented: row.isRented,
    userRent: row.userRent,
    marketRent: row.marketRent,
    marketRentAsOf: row.marketRentAsOf,
  });

  if (eligibility === "not_rented") {
    return <span className="text-xs text-muted">{BENCHMARK_UX_MESSAGES.notRented}</span>;
  }
  if (eligibility === "rent_missing") {
    return <span className="text-xs text-muted">{BENCHMARK_UX_MESSAGES.rentMissing}</span>;
  }
  if (eligibility === "benchmark_missing" || eligibility === "benchmark_stale") {
    return <span className="text-xs text-warning">Stale / missing</span>;
  }
  if (eligibility === "eligible_fresh" && row.marketRent != null) {
    const tone = getBenchmarkTone(row.userRent, row.marketRent);
    const colorClass =
      tone === "positive"
        ? "text-positive"
        : tone === "negative"
          ? "text-negative"
          : "text-muted";
    return (
      <span className={`text-xs tabular-nums ${colorClass}`}>
        {getBenchmarkLabel(row.userRent, row.marketRent)}
      </span>
    );
  }
  return <span className="text-xs text-muted">—</span>;
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
  onDeltaSort,
  hasDelta = false,
}: {
  label: string;
  column: SortColumn;
  sort: SortState;
  onSort: (col: SortColumn) => void;
  onDeltaSort?: (col: SortColumn) => void;
  hasDelta?: boolean;
}) {
  const isActive = sort.column === column;
  const isValueSort = isActive && sort.mode === "value";
  const isDeltaSort = isActive && sort.mode === "delta";
  const SortIcon = isActive && sort.direction === "desc" ? ChevronDown : ChevronUp;

  return (
    <th className="px-3 py-3 text-left">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`inline-flex items-center gap-0.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
            isValueSort ? "text-foreground" : "text-muted hover:text-foreground"
          }`}
          onClick={() => onSort(column)}
        >
          {label}
          {isValueSort && <SortIcon className="size-3" aria-hidden />}
        </button>
        {hasDelta && onDeltaSort && (
          <button
            type="button"
            title="Sort by month-over-month change"
            className={`rounded px-1 py-0.5 text-[10px] font-medium transition-colors duration-150 ${
              isDeltaSort
                ? "bg-accent/15 text-foreground"
                : "text-muted/60 hover:text-muted"
            }`}
            onClick={() => onDeltaSort(column)}
          >
            MoM{isDeltaSort && <SortIcon className="inline size-2.5 ml-0.5" aria-hidden />}
          </button>
        )}
      </div>
    </th>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PropertyPerformanceTable({
  rows,
}: {
  rows: PropertyTableRow[];
}) {
  const router = useRouter();
  const [sort, setSort] = useState<SortState>({
    column: "cashFlow",
    direction: "asc",
    mode: "value",
  });
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  function handleSort(column: SortColumn) {
    setSort((prev) => {
      if (prev.column === column && prev.mode === "value") {
        return { column, direction: prev.direction === "asc" ? "desc" : "asc", mode: "value" };
      }
      return { column, direction: "desc", mode: "value" };
    });
  }

  function handleDeltaSort(column: SortColumn) {
    setSort((prev) => {
      if (prev.column === column && prev.mode === "delta") {
        return { column, direction: prev.direction === "asc" ? "desc" : "asc", mode: "delta" };
      }
      return { column, direction: "desc", mode: "delta" };
    });
  }

  const filteredRows = rows.filter((row) => {
    switch (activeFilter) {
      case "needs_attention": return row.needsAttention;
      case "negative_cashflow": return row.negativeCashFlow;
      case "stale_benchmark": return row.benchmarkStale;
      case "incomplete_profile": return row.incompleteProfile;
      default: return true;
    }
  });

  const sortedRows = sortRows(filteredRows, sort);
  const columnsWithDelta = new Set<SortColumn>();
  for (const row of filteredRows) {
    if (row.valueDeltaMoM != null && row.valueDeltaMoM !== 0) columnsWithDelta.add("value");
    if (row.equityDeltaMoM != null && row.equityDeltaMoM !== 0) columnsWithDelta.add("equity");
    if (row.cashFlowDeltaMoM != null && row.cashFlowDeltaMoM !== 0) columnsWithDelta.add("cashFlow");
  }

  return (
    <div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-border">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setActiveFilter(opt.key)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150 min-h-[32px] ${
              activeFilter === opt.key
                ? "border-accent/50 bg-accent/15 text-foreground"
                : "border-border bg-transparent text-muted hover:bg-subtle hover:text-foreground"
            }`}
          >
            {opt.label}
            {opt.key !== "all" && (
              <span className="ml-1.5 tabular-nums text-[10px] opacity-70">
                {rows.filter((r) => {
                  switch (opt.key) {
                    case "needs_attention": return r.needsAttention;
                    case "negative_cashflow": return r.negativeCashFlow;
                    case "stale_benchmark": return r.benchmarkStale;
                    case "incomplete_profile": return r.incompleteProfile;
                    default: return false;
                  }
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-subtle/40">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted w-[220px]">
                Property
              </th>
              <SortHeader
                label="Value"
                column="value"
                sort={sort}
                onSort={handleSort}
                onDeltaSort={handleDeltaSort}
                hasDelta={columnsWithDelta.has("value")}
              />
              <SortHeader
                label="Equity"
                column="equity"
                sort={sort}
                onSort={handleSort}
                onDeltaSort={handleDeltaSort}
                hasDelta={columnsWithDelta.has("equity")}
              />
              <SortHeader
                label="Cash flow"
                column="cashFlow"
                sort={sort}
                onSort={handleSort}
                onDeltaSort={handleDeltaSort}
                hasDelta={columnsWithDelta.has("cashFlow")}
              />
              <SortHeader label="Cap rate" column="capRate" sort={sort} onSort={handleSort} />
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Rent vs. market
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </th>
              <SortHeader label="Updated" column="updated" sort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                  No properties match this filter.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`cursor-pointer border-b border-border last:border-0 transition-colors duration-150 hover:bg-subtle/40 ${
                    i % 2 !== 0 ? "bg-subtle/20" : ""
                  }`}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/properties/${row.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/properties/${row.id}`);
                    }
                  }}
                >
                  {/* Property name */}
                  <td className="px-3 py-3">
                    <span className="font-medium text-foreground">{row.name}</span>
                    <span className="block text-xs text-muted truncate max-w-[200px]">
                      {row.addressLine1}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                    <span className="text-foreground">{formatCurrency(row.value)}</span>
                    <DeltaIndicator delta={row.valueDeltaMoM} />
                  </td>

                  {/* Equity */}
                  <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                    <span className="text-foreground">{formatCurrency(row.equity)}</span>
                    <DeltaIndicator delta={row.equityDeltaMoM} />
                  </td>

                  {/* Cash flow */}
                  <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                    <span
                      className={row.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}
                    >
                      {formatCurrency(row.monthlyCashFlow)}
                    </span>
                    <DeltaIndicator delta={row.cashFlowDeltaMoM} />
                  </td>

                  {/* Cap rate */}
                  <td className="px-3 py-3 tabular-nums text-foreground">
                    {row.capRate != null
                      ? `${(row.capRate * 100).toFixed(2)}%`
                      : <span className="text-muted">—</span>}
                  </td>

                  {/* Benchmark */}
                  <td className="px-3 py-3">
                    <BenchmarkCell row={row} />
                  </td>

                  {/* Status tags */}
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.negativeCashFlow && (
                        <InsightTag label="Negative CF" tone="negative" />
                      )}
                      {row.noMortgage && (
                        <InsightTag label="No mortgage" />
                      )}
                      {row.benchmarkStale && (
                        <InsightTag label="Stale benchmark" />
                      )}
                      {row.incompleteProfile && (
                        <InsightTag label="Incomplete" />
                      )}
                      {!row.needsAttention && (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </div>
                  </td>

                  {/* Updated */}
                  <td className="px-3 py-3 text-xs text-muted whitespace-nowrap">
                    {formatTimeAgo(row.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile compact rows */}
      <ul className="md:hidden divide-y divide-border">
        {sortedRows.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-muted">
            No properties match this filter.
          </li>
        ) : (
          sortedRows.map((row) => {
            // Primary metric on mobile = active sort column
            let primaryValue: React.ReactNode;
            let primaryDelta: number | null = null;

            switch (sort.column) {
              case "value":
                primaryValue = (
                  <span className="tabular-nums text-sm font-semibold text-foreground">
                    {formatCurrency(row.value)}
                  </span>
                );
                primaryDelta = row.valueDeltaMoM;
                break;
              case "equity":
                primaryValue = (
                  <span className="tabular-nums text-sm font-semibold text-foreground">
                    {formatCurrency(row.equity)}
                  </span>
                );
                primaryDelta = row.equityDeltaMoM;
                break;
              case "capRate":
                primaryValue = (
                  <span className="tabular-nums text-sm font-semibold text-foreground">
                    {row.capRate != null ? `${(row.capRate * 100).toFixed(2)}%` : "—"}
                  </span>
                );
                break;
              default:
                primaryValue = (
                  <span
                    className={`tabular-nums text-sm font-semibold ${
                      row.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {formatCurrency(row.monthlyCashFlow)}/mo
                  </span>
                );
                primaryDelta = row.cashFlowDeltaMoM;
            }

            return (
              <li key={row.id}>
                <Link
                  href={`/properties/${row.id}`}
                  className="flex min-h-[44px] items-center justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-subtle/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {row.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {row.addressLine1} · {formatTimeAgo(row.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      {primaryValue}
                      {primaryDelta !== null && primaryDelta !== 0 && (
                        <p
                          className={`text-xs tabular-nums ${
                            primaryDelta > 0 ? "text-positive" : "text-negative"
                          }`}
                        >
                          {primaryDelta > 0 ? "+" : ""}
                          {formatCurrency(primaryDelta)}
                        </p>
                      )}
                    </div>
                    {row.needsAttention && (
                      <AlertTriangle
                        className="size-4 shrink-0 text-warning"
                        aria-label="Needs attention"
                      />
                    )}
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
