"use client";

import Link from "next/link";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

export function DashboardEmptyStatePrimaryCta() {
  return (
    <div className="mt-5">
      <Link
        href="/properties/new?mode=quick"
        className="inline-flex min-h-[44px] items-center rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
        onClick={() => {
          captureClientEvent(AnalyticsEvents.FUNNEL_CTA_CLICKED, {
            placement: "dashboard_empty_state",
            cta_id: "add_first_property",
            href: "/properties/new?mode=quick",
          });
        }}
      >
        Add your first property
      </Link>
    </div>
  );
}

export function DashboardEmptyStateSecondaryLinks() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Link
        href="/analyze"
        className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md"
        onClick={() => {
          captureClientEvent(AnalyticsEvents.FUNNEL_CTA_CLICKED, {
            placement: "dashboard_empty_state",
            cta_id: "analyze_a_deal",
            href: "/analyze",
          });
        }}
      >
        <p className="text-sm font-semibold text-foreground">Analyze a deal first</p>
        <p className="text-xs text-muted">
          Run the numbers on a property before you commit. No account data needed.
        </p>
      </Link>
      <Link
        href="/settings#export"
        className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md"
        onClick={() => {
          captureClientEvent(AnalyticsEvents.FUNNEL_CTA_CLICKED, {
            placement: "dashboard_empty_state",
            cta_id: "import_spreadsheet",
            href: "/settings#export",
          });
        }}
      >
        <p className="text-sm font-semibold text-foreground">Import from a spreadsheet</p>
        <p className="text-xs text-muted">
          Have your properties in CSV format? Import them all at once from Settings.
        </p>
      </Link>
    </div>
  );
}
