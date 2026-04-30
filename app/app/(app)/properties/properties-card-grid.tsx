"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useIsMobile } from "@/lib/use-is-mobile";
import {
  PROPERTIES_VIEW_EVENT,
  type PropertiesViewEventDetail,
} from "./properties-view-event";

type PropertiesCardGridProps = {
  cards: ReactNode[];
  listRows: ReactNode[];
  totalCount: number;
  isMobileDisclosureEligible: boolean;
  viewMode: "grid" | "list";
};

const MOBILE_INITIAL_COUNT = 6;

export function PropertiesCardGrid({
  cards,
  listRows,
  totalCount,
  isMobileDisclosureEligible,
  viewMode: serverViewMode,
}: PropertiesCardGridProps) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  // View state lives here for instant client-side switching. The toolbar's
  // toggle dispatches a custom event we listen for; URL stays in sync via
  // history.replaceState inside the dispatcher.
  const [view, setView] = useState<"grid" | "list">(serverViewMode);

  useEffect(() => { setView(serverViewMode); }, [serverViewMode]);

  useEffect(() => {
    function onView(e: Event) {
      const detail = (e as CustomEvent<PropertiesViewEventDetail>).detail;
      if (detail?.view) setView(detail.view);
    }
    window.addEventListener(PROPERTIES_VIEW_EVENT, onView);
    return () => window.removeEventListener(PROPERTIES_VIEW_EVENT, onView);
  }, []);

  useEffect(() => {
    if (!isMobile) setExpanded(true);
  }, [isMobile]);

  // Mobile always renders the compact card layout regardless of the stored
  // toggle preference (the toggle is desktop-only per follow-up #11).
  const effectiveView = isMobile ? "grid" : view;

  const shouldCollapse =
    effectiveView === "grid" && isMobileDisclosureEligible && !expanded;
  const visibleCards = shouldCollapse ? cards.slice(0, MOBILE_INITIAL_COUNT) : cards;

  return (
    <div>
      {effectiveView === "grid" ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <ListColumnHeader />
          <ul className="divide-y divide-border">{listRows}</ul>
        </div>
      )}

      {shouldCollapse && (
        <div className="mt-4 flex justify-center md:hidden">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
          >
            Show all {totalCount} properties
          </button>
        </div>
      )}
    </div>
  );
}

function ListColumnHeader() {
  // Header row is desktop-only — at md breakpoint the list rows widen into
  // five labeled columns. On mobile the list collapses to a single Property
  // column and we don't render a header (the row content is self-labeling).
  const cell = "text-right text-xs font-medium uppercase tracking-wide text-muted";
  return (
    <div
      className="hidden border-b border-border bg-subtle/30 px-4 py-2 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1fr)_auto] md:items-center md:gap-3"
      role="row"
      aria-hidden
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        Property
      </span>
      <span className={cell}>Value / Equity</span>
      <span className={cell}>Cash flow</span>
      <span className={cell}>Cap rate</span>
      <span className={cell}>Status</span>
      <span className="size-4" aria-hidden />
    </div>
  );
}
