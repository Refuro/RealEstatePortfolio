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

const MINUS = "−";

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
  ltv: number | null;
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

/** True when the property has a fresh benchmark and rent is below market. */
function isBelowMarket(row: PropertyTableRow): boolean {
  if (!row.isRented || row.marketRent == null || row.marketRent <= 0) return false;
  return row.userRent < row.marketRent;
}

/** True when LTV is at 80% or above. */
function isHighLtv(row: PropertyTableRow): boolean {
  return row.ltv != null && row.ltv >= 0.8;
}

type SortColumn = "value" | "equity" | "cashFlow" | "capRate" | "updated";
type SortDirection = "asc" | "desc";
type SortMode = "value" | "delta";

type SortState = {
  column: SortColumn;
  direction: SortDirection;
  mode: SortMode;
};

export type FilterKey =
  | "all"
  | "negative_cashflow"
  | "high_ltv"
  | "below_market"
  | "stale_benchmark"
  | "incomplete_profile";

type ChipTone = "default" | "neg" | "warn";

const FILTER_OPTIONS: { key: FilterKey; label: string; tone: ChipTone }[] = [
  { key: "all", label: "All", tone: "default" },
  { key: "negative_cashflow", label: "Negative cash flow", tone: "neg" },
  { key: "high_ltv", label: "LTV above 80%", tone: "warn" },
  { key: "below_market", label: "Below market rent", tone: "warn" },
  { key: "stale_benchmark", label: "Stale benchmark", tone: "warn" },
  { key: "incomplete_profile", label: "Incomplete profile", tone: "warn" },
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

function getStatusDot(row: PropertyTableRow): "ok" | "warn" | "bad" {
  if (row.negativeCashFlow) return "bad";
  if (row.needsAttention) return "warn";
  return "ok";
}

const STATUS_DOT_COLOR: Record<"ok" | "warn" | "bad", string> = {
  ok: "var(--positive)",
  warn: "var(--warning)",
  bad: "var(--negative)",
};

function fmtSignedMonthly(amount: number): string {
  if (amount === 0) return formatCurrency(0);
  const sign = amount < 0 ? MINUS : "+";
  return `${sign}${formatCurrency(Math.abs(amount))}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusDot({ status }: { status: "ok" | "warn" | "bad" }) {
  const color = STATUS_DOT_COLOR[status];
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 5px ${color}`,
      }}
    />
  );
}

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
      className={`ml-1 tabular-nums text-[11px] ${positive ? "text-positive" : "text-negative"}`}
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
  const styles: React.CSSProperties =
    tone === "negative"
      ? {
          background: "var(--negative-dim)",
          color: "var(--negative)",
          border: "1px solid rgba(248,113,113,0.2)",
        }
      : {
          background: "rgba(255,255,255,0.04)",
          color: "var(--foreground-muted)",
          border: "1px solid var(--border)",
        };
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap"
      style={styles}
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
    return <span className="text-[11px] text-muted">{BENCHMARK_UX_MESSAGES.notRented}</span>;
  }
  if (eligibility === "rent_missing") {
    return <span className="text-[11px] text-muted">{BENCHMARK_UX_MESSAGES.rentMissing}</span>;
  }
  if (eligibility === "benchmark_missing" || eligibility === "benchmark_stale") {
    return <span className="text-[11px] text-warning">Stale / missing</span>;
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
      <span className={`text-[11px] tabular-nums ${colorClass}`}>
        {getBenchmarkLabel(row.userRent, row.marketRent)}
      </span>
    );
  }
  return <span className="text-[11px] text-muted">—</span>;
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
  onDeltaSort,
  hasDelta = false,
  className = "",
}: {
  label: string;
  column: SortColumn;
  sort: SortState;
  onSort: (col: SortColumn) => void;
  onDeltaSort?: (col: SortColumn) => void;
  hasDelta?: boolean;
  className?: string;
}) {
  const isActive = sort.column === column;
  const isValueSort = isActive && sort.mode === "value";
  const isDeltaSort = isActive && sort.mode === "delta";
  const SortIcon = isActive && sort.direction === "desc" ? ChevronDown : ChevronUp;

  return (
    <th
      className={`px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.05em] ${className}`}
      style={{ color: "var(--fg-dimmer)" }}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`inline-flex items-center gap-0.5 transition-colors duration-150 ${
            isValueSort ? "text-foreground" : "hover:text-foreground"
          }`}
          style={!isValueSort ? { color: "var(--fg-dimmer)" } : undefined}
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
                ? "text-foreground"
                : "hover:text-muted"
            }`}
            style={
              isDeltaSort
                ? { background: "var(--accent-dim)" }
                : { color: "var(--fg-dimmer)" }
            }
            onClick={() => onDeltaSort(column)}
          >
            MoM{isDeltaSort && <SortIcon className="inline size-2.5 ml-0.5" aria-hidden />}
          </button>
        )}
      </div>
    </th>
  );
}

const CHIP_STYLES: Record<ChipTone, { active: React.CSSProperties; idle: React.CSSProperties }> = {
  default: {
    active: {
      background: "var(--accent-dim)",
      color: "var(--accent)",
      borderColor: "rgba(129,140,248,0.25)",
    },
    idle: {
      background: "transparent",
      color: "var(--foreground-muted)",
      borderColor: "var(--border)",
    },
  },
  neg: {
    active: {
      background: "var(--negative-dim)",
      color: "var(--negative)",
      borderColor: "rgba(248,113,113,0.25)",
    },
    idle: {
      background: "transparent",
      color: "var(--foreground-muted)",
      borderColor: "var(--border)",
    },
  },
  warn: {
    active: {
      background: "var(--warning-dim)",
      color: "var(--warning)",
      borderColor: "rgba(251,191,36,0.25)",
    },
    idle: {
      background: "transparent",
      color: "var(--foreground-muted)",
      borderColor: "var(--border)",
    },
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function PropertyPerformanceTable({
  rows,
  filter: externalFilter,
  onFilterChange,
}: {
  rows: PropertyTableRow[];
  filter?: FilterKey;
  onFilterChange?: (f: FilterKey) => void;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<SortState>({
    column: "cashFlow",
    direction: "asc",
    mode: "value",
  });
  const [internalFilter, setInternalFilter] = useState<FilterKey>("all");
  const isControlled = externalFilter !== undefined;
  const activeFilter = isControlled ? externalFilter : internalFilter;

  function setActiveFilter(f: FilterKey) {
    if (isControlled) {
      onFilterChange?.(f);
    } else {
      setInternalFilter(f);
    }
  }

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
      case "negative_cashflow": return row.negativeCashFlow;
      case "high_ltv": return isHighLtv(row);
      case "below_market": return isBelowMarket(row);
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

  // Summary totals (across visible/filtered rows).
  const summaryTotals = sortedRows.reduce(
    (acc, r) => ({
      value: acc.value + r.value,
      equity: acc.equity + r.equity,
      monthlyCashFlow: acc.monthlyCashFlow + r.monthlyCashFlow,
    }),
    { value: 0, equity: 0, monthlyCashFlow: 0 }
  );
  const isFiltered = activeFilter !== "all" && sortedRows.length !== rows.length;

  return (
    <div>
      {/* Command bar — filter chips: horizontal rail on mobile, wrap on desktop */}
      <div
        className="flex flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain px-4 py-3 scrollbar-thin touch-pan-x border-b [-webkit-overflow-scrolling:touch] md:flex-wrap md:overflow-visible"
        style={{
          borderColor: "var(--border)",
          background: "var(--background-subtle)",
        }}
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.key;
          const styles = CHIP_STYLES[opt.tone][isActive ? "active" : "idle"];
          const count =
            opt.key === "all"
              ? rows.length
              : rows.filter((r) => {
                  switch (opt.key) {
                    case "negative_cashflow": return r.negativeCashFlow;
                    case "high_ltv": return isHighLtv(r);
                    case "below_market": return isBelowMarket(r);
                    case "stale_benchmark": return r.benchmarkStale;
                    case "incomplete_profile": return r.incompleteProfile;
                    default: return false;
                  }
                }).length;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setActiveFilter(opt.key)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11.5px] font-medium transition-all duration-150 min-h-[44px] whitespace-nowrap hover:text-foreground md:min-h-[28px] md:py-1"
              style={styles}
            >
              {opt.label}
              <span className="text-[10.5px] tabular-nums opacity-75">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th
                className="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.05em]"
                style={{ color: "var(--fg-dimmer)", width: "26%" }}
              >
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
              <th
                className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.05em]"
                style={{ color: "var(--fg-dimmer)" }}
              >
                Rent vs. market
              </th>
              <th
                className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.05em]"
                style={{ color: "var(--fg-dimmer)" }}
              >
                Status
              </th>
              <SortHeader label="Updated" column="updated" sort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">
                  No properties match this filter.
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => {
                const status = getStatusDot(row);
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer transition-colors duration-150"
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                    }}
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
                    {/* Property name + status dot + address */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusDot status={status} />
                        <span className="text-[12.5px] font-medium text-foreground truncate">
                          {row.name}
                        </span>
                      </div>
                      <div
                        className="text-[11px] truncate max-w-[240px] mt-0.5"
                        style={{ color: "var(--foreground-muted)", paddingLeft: "15px" }}
                      >
                        {row.addressLine1}
                      </div>
                    </td>

                    {/* Value */}
                    <td className="px-3 py-3 text-[12px] tabular-nums whitespace-nowrap">
                      <span className="text-foreground">{formatCurrency(row.value)}</span>
                      <DeltaIndicator delta={row.valueDeltaMoM} />
                    </td>

                    {/* Equity */}
                    <td className="px-3 py-3 text-[12px] tabular-nums whitespace-nowrap">
                      <span className="text-foreground">{formatCurrency(row.equity)}</span>
                      <DeltaIndicator delta={row.equityDeltaMoM} />
                    </td>

                    {/* Cash flow */}
                    <td className="px-3 py-3 text-[12px] tabular-nums whitespace-nowrap">
                      <span
                        className={row.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}
                      >
                        {fmtSignedMonthly(row.monthlyCashFlow)}
                      </span>
                      <DeltaIndicator delta={row.cashFlowDeltaMoM} />
                    </td>

                    {/* Cap rate */}
                    <td className="px-3 py-3 text-[12px] tabular-nums text-foreground">
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
                          <span className="text-[11px] text-muted">—</span>
                        )}
                      </div>
                    </td>

                    {/* Updated */}
                    <td
                      className="px-3 py-3 text-[11px] whitespace-nowrap"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {formatTimeAgo(row.updatedAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Summary row — totals across visible rows */}
          {sortedRows.length > 0 && (
            <tfoot>
              <tr
                style={{
                  borderTop: "1px solid var(--border)",
                  background: "var(--background-subtle)",
                }}
              >
                <td className="px-4 py-3">
                  <span
                    className="text-[11.5px] font-semibold uppercase tracking-[0.04em]"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Portfolio total
                    {isFiltered && (
                      <span
                        className="ml-1 font-normal opacity-60"
                        style={{ textTransform: "none", letterSpacing: 0 }}
                      >
                        · {sortedRows.length} shown
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 text-[12.5px] font-semibold tabular-nums whitespace-nowrap text-foreground">
                  {formatCurrency(summaryTotals.value)}
                </td>
                <td className="px-3 py-3 text-[12.5px] font-semibold tabular-nums whitespace-nowrap text-foreground">
                  {formatCurrency(summaryTotals.equity)}
                </td>
                <td
                  className={`px-3 py-3 text-[12.5px] font-semibold tabular-nums whitespace-nowrap ${
                    summaryTotals.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
                  }`}
                >
                  {fmtSignedMonthly(summaryTotals.monthlyCashFlow)}
                  <span
                    className="ml-1 text-[10.5px] font-normal"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    / mo
                  </span>
                </td>
                <td className="px-3 py-3" style={{ color: "var(--foreground-muted)" }}>
                  —
                </td>
                <td className="px-3 py-3" style={{ color: "var(--foreground-muted)" }}>
                  —
                </td>
                <td className="px-3 py-3" style={{ color: "var(--foreground-muted)" }}>
                  —
                </td>
                <td className="px-3 py-3" style={{ color: "var(--foreground-muted)" }}>
                  —
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile compact rows */}
      <ul
        className="md:hidden"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
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
                    {fmtSignedMonthly(row.monthlyCashFlow)}/mo
                  </span>
                );
                primaryDelta = row.cashFlowDeltaMoM;
            }

            const status = getStatusDot(row);

            return (
              <li
                key={row.id}
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <Link
                  href={`/properties/${row.id}`}
                  className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-subtle/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={status} />
                      <p className="truncate text-sm font-medium text-foreground">
                        {row.name}
                      </p>
                    </div>
                    <p
                      className="truncate text-[11px] mt-0.5"
                      style={{
                        color: "var(--foreground-muted)",
                        paddingLeft: "15px",
                      }}
                    >
                      {row.addressLine1} · {formatTimeAgo(row.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      {primaryValue}
                      {primaryDelta !== null && primaryDelta !== 0 && (
                        <p
                          className={`text-[11px] tabular-nums ${
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

      {/* Mobile summary bar */}
      {sortedRows.length > 0 && (
        <div
          className="md:hidden flex items-center justify-between gap-3 px-4 py-3"
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--background-subtle)",
          }}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.04em]"
            style={{ color: "var(--foreground-muted)" }}
          >
            Portfolio total
            {isFiltered && (
              <span
                className="ml-1 font-normal opacity-60"
                style={{ textTransform: "none", letterSpacing: 0 }}
              >
                · {sortedRows.length} shown
              </span>
            )}
          </span>
          <span
            className={`text-sm font-semibold tabular-nums ${
              summaryTotals.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
            }`}
          >
            {fmtSignedMonthly(summaryTotals.monthlyCashFlow)}/mo
          </span>
        </div>
      )}
    </div>
  );
}
