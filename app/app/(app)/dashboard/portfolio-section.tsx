"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertPillsRow, type AlertPill } from "@/components/dashboard/alert-pills-row";
import {
  PropertyPerformanceTable,
  type PropertyTableRow,
  type FilterKey,
} from "./property-performance-table";

type PortfolioSectionProps = {
  pills: AlertPill[];
  tableRows: PropertyTableRow[];
};

export function PortfolioSection({ pills, tableRows }: PortfolioSectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const wiredPills: AlertPill[] = pills.map((pill) => ({
    ...pill,
    onClick: pill.filterKey
      ? () =>
          setActiveFilter((prev) =>
            prev === (pill.filterKey as FilterKey) ? "all" : (pill.filterKey as FilterKey)
          )
      : undefined,
  }));

  return (
    <>
      {pills.length > 0 && (
        <AlertPillsRow sectionLabel="Portfolio breakdown" pills={wiredPills} />
      )}

      <section
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            className="text-[13px] font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Properties
          </h2>
          <Link
            href="/properties"
            className="text-[12px] font-medium hover:underline"
            style={{ color: "var(--accent)" }}
          >
            View all →
          </Link>
        </div>
        <PropertyPerformanceTable
          rows={tableRows}
          filter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </section>
    </>
  );
}
