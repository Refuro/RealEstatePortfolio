"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useIsMobile } from "@/lib/use-is-mobile";
import { incompleteProfilesCopy, INCOMPLETE_UNLOCKS } from "./copy";

export type IncompleteProfileRow = {
  propertyId: string;
  name: string;
  score: number;
};

const ROW_CAP = 2;

export function IncompleteProfilesCard({
  rows,
  totalIncomplete,
}: {
  rows: IncompleteProfileRow[];
  totalIncomplete: number;
}) {
  const isMobile = useIsMobile();
  if (rows.length === 0) return null;

  const visibleRows = rows.slice(0, ROW_CAP);
  const overflow = totalIncomplete - visibleRows.length;
  const copy = incompleteProfilesCopy(totalIncomplete);
  const ctaHref =
    totalIncomplete === 1 && rows[0]
      ? `/properties/${rows[0].propertyId}?edit=mortgage&wizard=1`
      : "/properties?filter=incomplete";

  return (
    <section
      aria-labelledby="task-incomplete-title"
      className="rounded-xl border p-4 shadow-sm md:p-5"
      style={{
        borderColor: "color-mix(in srgb, var(--warning) 36%, var(--border))",
        background: "color-mix(in srgb, var(--warning) 6%, var(--card))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-warning">
            <Zap className="size-3.5" aria-hidden />
            Needs your attention
          </p>
          <h3
            id="task-incomplete-title"
            className="mt-1.5 text-base font-semibold text-foreground md:mt-2"
          >
            {copy.title}
          </h3>
          {!isMobile && (
            <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
          )}
        </div>
        <Link
          href={ctaHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            background: "var(--warning-button)",
            color: "#0a0a0a",
          }}
        >
          {copy.cta} →
        </Link>
      </div>

      <ul className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
        {visibleRows.map((row) => (
          <li key={row.propertyId}>
            <Link
              href={`/properties/${row.propertyId}?edit=mortgage&wizard=1`}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-card px-3 py-2 transition-colors duration-150 hover:bg-card-hover md:py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {row.name}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full"
                    style={{ background: "var(--border-subtle)" }}
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${Math.max(0, Math.min(100, row.score))}%`,
                        background: "var(--warning)",
                      }}
                    />
                  </div>
                  <span className="shrink-0 tabular-nums text-xs font-medium text-warning">
                    {row.score}%
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {overflow > 0 && (
        <Link
          href="/properties?filter=incomplete"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
        >
          +{overflow} more · View all
        </Link>
      )}

      {!isMobile && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {INCOMPLETE_UNLOCKS.map((unlock) => (
            <div
              key={unlock.label}
              className="rounded-lg border px-3 py-2"
              style={{
                background: "var(--warning-dim)",
                borderColor: "color-mix(in srgb, var(--warning) 24%, var(--border))",
              }}
            >
              <div className="text-xs font-semibold text-warning">
                {unlock.label}
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted">
                Unlocks {unlock.unlocks}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
